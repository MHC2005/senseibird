# SenseiBird | CI/CD, Kubernetes y Observabilidad

SenseiBird es una app web para practicar idiomas con Next.js en el frente y FastAPI detrás. La idea es simple: todo el stack DevOps queda documentado y ejecutable en un único repo, con el mismo tono directo que usamos en el equipo. Acá te cuento cómo está armado y qué comandos podés correr sin pensarlo dos veces.

---

## Mapa rápido del repo

- `app/` y `components/`: frontend Next.js listo para `npm run dev` o para build estático.
- `backend/`: FastAPI + SQLite con métricas expuestas y Dockerfile propio.
- `helm/`: chart con Deployments, Services, ConfigMaps, dashboard de Grafana y valores por entorno (`values.yaml`, `values-dev.yaml`, `values-prod.yaml`).
- `k8s/ci/`: kubeconfigs para Jenkins (`kubeconfig-jenkins.yaml`) y versión sanitizada (`kubeconfig-jenkins-clean.yaml`).
- `k8s/policies/` y `k8s/falco/`: hardening con Kyverno y Falco listo para Minikube.
- `reports/`: resultados de Trivy, Snyk, Dive, Falco y el soporte que pedimos en las rúbricas.

---

## Requisitos previos

- Node 18+, npm 9+, Python 3.11 y `uvicorn` si querés levantar el backend sin Docker.
- Docker Desktop + Minikube (driver Docker o Hyper-V), kubectl y Helm 3.
- Semgrep, Snyk CLI, Trivy, Dive y credenciales de Docker Hub para el pipeline.
- Opcional: cuenta Grafana Cloud si querés subir el dashboard exportado en `grafana/dashboard.json`.
- Postman: https://poseagus15-5718737.postman.co/workspace/Agustin-Pose's-Workspace~05cb38f6-23ba-46d3-87d5-9375f6de3ff1/collection/48467642-a478b9ba-f287-4040-88b4-28e8c6684306?action=share&creator=48467642
---

## Cómo levantarlo rápido

### Modo bare metal (sin contenedores)

```powershell
# Frontend
cd app
npm install
npm run dev

# Backend (otro terminal)
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

El frontend usa `NEXT_PUBLIC_API_BASE_URL` (ver `.env.local`). Por defecto apunta a `http://localhost:8000`.

### Docker Compose local

```powershell
docker compose up --build
```

Expone `http://localhost:3000` y `http://localhost:8000` con las mismas variables que usamos en CI.

---

## Contenerización (Docker)

1. Cambiá el daemon a Minikube para construir imágenes accesibles desde el cluster:

```powershell
minikube -p minikube docker-env --shell powershell | Invoke-Expression
```

2. Construí y versioná cada servicio:

```powershell
# Frontend
cd app
docker build -t senseibird-frontend:1.0.2 ..

# Backend
cd backend
docker build -t senseibird-backend:1.0.0 -f Dockerfile .
```

3. Si buildiaste fuera de Minikube, subí las imágenes al cluster:

```powershell
minikube image load senseibird-frontend:1.0.2
minikube image load senseibird-backend:1.0.0
```

4. Volvé al daemon default con `minikube docker-env --shell powershell -u | Invoke-Expression`.

**Buenas prácticas ya aplicadas**

- Multi-stage builds (`builder` + `runtime`) en `Dockerfile` y `backend/Dockerfile` para achicar capas.
- Usuario `app` no privilegiado en ambas imágenes (requisito Kyverno cubierto).
- Sin `latest`: los tags son explícitos y se manejan desde el pipeline.
- Optimización de capas: sólo se copian artefactos necesarios (build Next.js, dependencias Python ya compiladas).
- Reportes de Trivy/Snyk/Dive en `reports/analisis_img_frontend.md`, `reports/analisis_img_backend.md` y el consolidado `reports/analisis_calidad_imagenes.md`.

---

## Orquestación con Kubernetes + Helm

El chart (`helm/`) incluye Deployments, Services, ConfigMaps, RBAC para Prometheus y todo el stack de observabilidad.

```powershell
# Dev
helm upgrade --install senseibird ./helm `
  --namespace senseibird `
  --create-namespace `
  --values helm/values-dev.yaml

# Prod-like
helm upgrade --install senseibird ./helm `
  --namespace senseibird `
  --create-namespace `
  --values helm/values-prod.yaml
```

- `monitoring.yaml` crea Prometheus + Grafana con NodePorts configurables (`monitoring.prometheus.nodePort`, `monitoring.grafana.nodePort`).
- `grafana/dashboard.json` trae los paneles de RPS, latencia, consumo de recursos y `senseibird_updates_total`.
- `k8s/ci/*` guarda los kubeconfigs que monta Jenkins; el archivo `*-clean` sirve para compartir sin secretos.

---

## Pipeline CI/CD (Jenkins)

El `Jenkinsfile` define este flujo:

| Stage | Qué hace |
| --- | --- |
| `Semgrep Static Analysis` | `semgrep scan --config=semgrep_rules.yaml .` y falla ante findings críticos. |
| `Snyk Dependency Scan` | Usa `SNYK_TOKEN` para `snyk test --all-projects`. |
| `Build Frontend` | `npm install && npm run build` (artefacto Next.js listo para copiar al contenedor). |
| `Build Backend` | Instala dependencias Python en `/opt/backend-venv` y prepara el wheel cache. |
| `Docker Build & Push` | Se loguea a Docker Hub (`DOCKER_HUB`) y pushea la imagen versionada. |
| `Helm Deploy` | Despliega al namespace `senseibird` usando `k8s/ci/kubeconfig-jenkins.yaml`. |

Los reportes de Semgrep/Snyk se guardan en `reports/` para auditorías posteriores.

---

## Observabilidad

### Backend instrumentado

- `backend/app/main.py` expone `GET /metrics` gracias a `prometheus_fastapi_instrumentator`.
- La métrica `senseibird_updates_total` se incrementa en cada `POST /stats/{uid}`.
- Para debug local: `kubectl port-forward svc/senseibird-api -n senseibird 8000:8000`.

### Prometheus

- Imagen `prom/prometheus:v2.52.0`, scrape configs customizados (API, kubelet, cadvisor).
- ServiceAccount + RBAC incluidos y Service NodePort 30900 (`minikube service prometheus -n monitoring --url`).

### Grafana

- Secret `grafana-admin` y ConfigMap `grafana-datasources` gestionados por el chart.
- NodePort 32000 (`minikube service grafana -n monitoring --url`).
- Importá `grafana/dashboard.json` (Dashboards -> Import -> Upload JSON) y listo.

---

## Seguridad integrada (DevSecOps)

### Semgrep

- Reglas: `semgrep_rules.yaml`.
- Comando: `semgrep scan --config=semgrep_rules.yaml .`.
- Evidencia: `reports/semgrep-report.txt`.

### Snyk

- Comando: `snyk test --all-projects` (requiere `SNYK_TOKEN`).
- Reporte: `reports/snyk-report.txt` con hallazgos y fixes sugeridos.

### Kyverno

- Políticas en `k8s/policies/` (`disallow-latest.yaml`, `require-resources.yaml`, `disallow-root.yaml`, `readOnly.yaml`).
- Aplicalas con `kubectl apply -f k8s/policies/`.

### Falco runtime security

- Valores en `k8s/falco/values-minikube.yaml` (driver `modern-bpf`, anotación `kyverno.io/ignore`).
- Instalación: `helm upgrade --install falco falcosecurity/falco --namespace falco --create-namespace --values k8s/falco/values-minikube.yaml`.
- Prueba: `kubectl -n senseibird run falco-trigger --rm -it --image=alpine --restart=Never --command -- sh -c "cat /etc/shadow >/tmp/out"`.
- Falco deja la alerta en `reports/falco-event.log` con la descripción manual del incidente.

---

## Evidencias y soporte

- `reports/analisis_img_frontend.md`, `reports/analisis_img_backend.md`, `reports/analisis_calidad_imagenes.md`.
- `reports/semgrep-report.txt`, `reports/snyk-report.txt`, `reports/falco-event.log`.
- `grafana/dashboard.json` para importar dashboards.
- `kubeconfig-jenkins-clean.yaml` si necesitás compartir la config sin secretos.

---

## Autores

Proyecto trabajado por Mateo Hernández y Agustín Pose.
