# Guia integral de despliegue – SenseiBird

Este documento resume el flujo para construir, asegurar y operar SenseiBird tanto de manera local como en Kubernetes con Jenkins y el stack de observabilidad incluido en el repo.

---

## 1. Preparacion del entorno

### 1.1 Software requerido
- Docker Desktop 24+ con soporte para builders nativos.
- Minikube 1.33+, `kubectl` y Helm 3.14+.
- Node 18+ y npm 9+ si se levanta el frontend sin contenedor.
- Python 3.11 y `uvicorn` para ejecutar el backend sin Docker.
- Trivy, Dive, Semgrep y Snyk CLI para validaciones de seguridad.
- Jenkins (local o server) con acceso al repo, Docker y al cluster mediante `k8s/ci/kubeconfig-jenkins.yaml`.
- Opcional: kubectl ctx/namespace helpers, Postman y alguna extension de VS Code para YAML/Kubernetes.

### 1.2 Archivos y secretos
- `.env.local`: variables consumidas por Next.js (ejemplo en repo). Ajustar `NEXT_PUBLIC_API_BASE_URL`.
- `backend/.env` (no versionado): credenciales del API si se requieren endpoints protegidos.
- `k8s/ci/kubeconfig-jenkins.yaml`: kubeconfig con permisos para instalar el chart. La version `*-clean` sirve para compartir.
- `DOCKER_HUB_USER`, `DOCKER_HUB_TOKEN`, `SNYK_TOKEN` y `TRIVY_REFRESH_TOKEN`: declararlos como credenciales en Jenkins.
- `reports/`: carpeta donde se almacenan evidencias de escaneos y monitoreo.

---

## 2. Ejecucion local

### 2.1 Bare metal (sin contenedores)
```powershell
# Frontend
cd app
npm install
npm run dev   # http://localhost:3000

# Backend
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Verificar salud de la API con `curl http://localhost:8000/health`.

### 2.2 Docker Compose
```powershell
docker compose up --build
```
Expone los mismos puertos (`3000` web, `8000` API) y sirve para pruebas rapidas sin Minikube.

### 2.3 Construccion manual de imagenes
```powershell
# Redirigir el daemon de Docker a Minikube
minikube -p minikube docker-env --shell powershell | Invoke-Expression

docker build -t senseibird-api:dev backend/
docker build -t senseibird:dev app/
docker build -t senseibird:blue app/
docker build -t senseibird:green app/

# Opcional: volver al daemon local
minikube docker-env --shell powershell -u | Invoke-Expression
```
Los tags `blue` y `green` existen para pruebas de estrategia de despliegue desde Helm.

---

## 3. Validaciones de seguridad

### 3.1 Analisis de vulnerabilidades
```powershell
trivy image senseibird-api:dev
trivy image senseibird:dev
```
Guardar los reportes en `reports/trivy-api.txt` y `reports/trivy-web.txt`. El pipeline consume estos archivos como evidencia.

### 3.2 Auditoria de capas
```powershell
dive senseibird-api:dev
dive senseibird:dev
```
Corregir capas sobrantes o archivos temporales antes de reconstruir.

### 3.3 Scans estaticos (integrados en Jenkins)
- `semgrep scan --config=semgrep_rules.yaml .`
- `snyk test --all-projects`
Ambos comandos pueden correrse localmente para validar antes del commit. Los resultados terminan en `reports/semgrep-report.txt` y `reports/snyk-report.txt`.

---

## 4. Despliegue en Kubernetes

### 4.1 Script automatizado
```bash
./scripts/init.sh
```
El script realiza:
1. Configuracion de Docker apuntando al daemon de Minikube y build de las imagenes locales.
2. Limpieza del release previo y del namespace `senseibird`.
3. Instalacion del chart `helm/` usando `helm/values-prod.yaml`.
4. Espera activa hasta que `senseibird-api` y `senseibird-web` esten listos.
5. Trafico sintentico a la API para poblar Prometheus/Grafana.

### 4.2 Despliegue manual con Helm
```powershell
helm upgrade --install senseibird ./helm `
  --namespace senseibird `
  --create-namespace `
  --values helm/values-dev.yaml
```
Cambiar el archivo de valores para probar escenarios dev/prod o sobreescribir flags con `--set`.

### 4.3 Verificacion
```powershell
kubectl get pods -n senseibird
kubectl get svc -n senseibird
kubectl logs deployment/senseibird-api -n senseibird
```
El frontend publica NodePort 32080 y el backend 32081 (ver `helm/values*.yaml`). Para acceder desde el host usar `minikube service`.

---

## 5. Observabilidad y monitoreo

### 5.1 Prometheus y Grafana
El chart ya crea el namespace `monitoring`, los Deployments y los Services:
- Grafana: `http://localhost:3001` (si se usa `minikube service grafana -n monitoring --url`).
- Dashboard base: `grafana/dashboard.json` (SenseiBird Traffic Overview).
- Prometheus: `minikube service prometheus -n monitoring --url`.

### 5.2 Trafico sintetico
Para refrescar las metricas ejecutar:
```bash
./scripts/start_tools.sh
```
El script hace 20 requests a `GET /health` desde dentro del cluster. Ideal antes de revisar Grafana.

### 5.3 Metricas clave
- `senseibird_updates_total`: aumenta con `POST /stats/{uid}`.
- `http_server_request_duration_seconds`: latencia del backend.
- Paneles de CPU, memoria y replicas en el dashboard provisto.

---

## 6. Pipeline CI/CD en Jenkins

### 6.1 Requisitos
- Node y Python instalados en el agente Jenkins.
- Docker CLI con permisos para `docker build` y `docker login`.
- Variables de entorno: `DOCKER_HUB_USER`, `DOCKER_HUB_TOKEN`, `SNYK_TOKEN`, `TRIVY_DB_REPOSITORY`.
- Kubeconfig montado en `/var/lib/jenkins/.kube/config` o ruta similar (usar `k8s/ci/kubeconfig-jenkins.yaml`).

### 6.2 Estructura del Jenkinsfile
1. **Checkout**: clona el repo y reutiliza la cache de dependencias.
2. **Semgrep Static Analysis**: analiza todo el repo con `semgrep_rules.yaml`.
3. **Snyk Dependency Scan**: evalua npm y pip requirements.
4. **Build Frontend**: `npm ci && npm run build` para generar el artefacto Next.js.
5. **Build Backend**: instala dependencias y ejecuta unit tests si existen.
6. **Docker Build & Push**: construye y sube imagenes versionadas (web y API) al registry configurado.
7. **Helm Deploy**: aplica el chart usando el kubeconfig del agente (estrategia blue/green segun valores).
8. **Post Actions**: publica reportes en `reports/` y en los tabs de Jenkins.

Para disparar el pipeline manualmente basta con ejecutar *Build Now* en Jenkins o configurar un webhook de GitHub.

---

## 7. Limpieza y rollback

### 7.1 Script de limpieza
```bash
./scripts/cleanup.sh
```
Elimina el namespace y el release Helm (ignora errores si no existen).

### 7.2 Rollback con Helm
```powershell
helm history senseibird -n senseibird
helm rollback senseibird <revision> -n senseibird
```
Util para volver a la ultima revision estable si el despliegue fallo.

---

## 8. Referencias rapidas
- Postman collection: enlace en README.md.
- Reportes de seguridad: carpeta `reports/`.
- Dashboard Grafana listo para importar: `grafana/dashboard.json`.
- Politicas de Kyverno y Falco: `k8s/policies/` y `k8s/falco/`.

Con estos pasos se cubre el ciclo completo: build, seguridad, despliegue, observabilidad y automatizacion en Jenkins para SenseiBird.
