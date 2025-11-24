
# SenseiBird ? CI/CD, Kubernetes y Observabilidad

SenseiBird es una aplicacion web para aprendizaje de idiomas que combina un frontend Next.js y un backend FastAPI.
---

## 1. Contenerizaci?n (Docker)

```powershell
# Cambiar daemon a Minikube (PowerShell)
minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Frontend
docker build -t senseibird-frontend:1.0.2 .

# Backend
docker build -t senseibird-backend:1.0.0 -f backend/Dockerfile backend

# Volver al daemon original
minikube docker-env --shell powershell -u | Invoke-Expression
```

Si se construye fuera de Minikube, luego hay que publicar las im?genes dentro del cl?ster:

```
minikube image load senseibird-frontend:1.0.2
minikube image load senseibird-backend:1.0.0
```

### 1 Buenas practicas aplicadas

- **Dockerfiles dedicados** (`Dockerfile` y `backend/Dockerfile`) estructurados en m?ltiples etapas (builder + runtime) para reducir el tamaño final.
- **Usuarios no privilegiados**: cada contenedor crea el usuario `app` y finaliza con `USER app`, cumpliendo la politica no root exigida por Kyverno.
- **Versiones fijas**: se usan tags explicitos (`1.0.2`, `1.0.0`), nunca `latest`.
- **Optimizaci?n de capas**: s?lo se copian artefactos necesarios (build de Next.js, dependencias Python ya compiladas) desde la etapa builder.

### 1.2 Reportes de calidad

- `reports/analisis_img_frontend.md`
- `reports/analisis_img_backend.md`
- `reports/analisis_calidad_imagenes.md` (resumen consolidado)

Cada informe resume tama?o total, n?mero de capas y oportunidades de mejora detectadas por **Trivy** (vulnerabilidades), **Snyk** (dependencias) y **Dive** (capas).
---

## 2. Orquestacion y despliegue (Kubernetes + Helm)

El chart vive en `helm/` y contiene plantillas para Deployments, Services, ConfigMaps y el stack de monitoreo (`helm/templates/monitoring.yaml`). Parametrizaci?n por entorno:

- `helm/values.yaml`: valores por defecto.
- `helm/values-dev.yaml` y `helm/values-prod.yaml`: overrides (r?plicas, recursos, im?genes, puertos).

### 2.1 Instalacion / actualizacion

```powershell
helm upgrade --install senseibird ./helm `
  --namespace senseibird `
  --create-namespace `
  --values helm/values.yaml

# Para prod/dev
helm upgrade --install senseibird ./helm `
  --namespace senseibird `
  --create-namespace `
  --values helm/values-prod.yaml
```
## 3. Integracion y entrega continua (Jenkins)

Archivo: `Jenkinsfile`

| Stage | Descripcion |
| --- | --- |
| `Semgrep Static Analysis` | `semgrep scan --config=semgrep_rules.yaml .` (findings criticos fallan el pipeline). |
| `Snyk Dependency Scan` | `snyk test --all-projects` usando `SNYK_TOKEN`; CVE criticas abortan el build. |
| `Docker Build & Push` | `docker build` + `docker push` de las imagenes versionadas usando credenciales `DOCKER_HUB`. |
| `Helm Deploy` | `helm upgrade --install senseibird ./helm --namespace senseibird --create-namespace`. |
---

## 4. Monitoreo y observabilidad (Prometheus + Grafana)

### 4.1 Instrumentacion del backend

`backend/app/main.py` expone `GET /metrics` mediante `prometheus_fastapi_instrumentator` e incluye la m?trica de negocio `senseibird_updates_total`. Para pruebas locales:

```powershell
kubectl port-forward svc/senseibird-api -n senseibird 8000:8000
```

### 4.2 Prometheus (Helm `monitoring.prometheus`)

- ConfigMap con `scrape_configs` para `senseibird-api`, kubelet y kubelet-cadvisor.
- `ServiceAccount` + RBAC + Deployment (`prom/prometheus:v2.52.0`).
- Service NodePort configurable (`monitoring.prometheus.nodePort`, por defecto 30900).
- Acceso: `minikube service prometheus -n monitoring --url`

### 4.3 Grafana (Helm  `monitoring.grafana`)

- Secret `grafana-admin` y ConfigMap `grafana-datasources` gestionados por el chart.
- Deployment `grafana/grafana:10.4.2` con datasource apuntando a Prometheus.
- Service NodePort configurable (`monitoring.grafana.nodePort`, por defecto 32000).
- Acceso: `minikube service grafana -n monitoring --url`

### 4.4 Dashboard

El archivo `grafana/dashboard.json` contiene el tablero exigido con:

1. N?mero de peticiones procesadas (RPS) usando `http_requests_total`.
2. Latencia promedio / p95 (`http_request_duration_seconds`).
3. Uso de CPU/Mem por pod (`container_cpu_usage_seconds_total`, `container_memory_usage_bytes`).
4. M?trica de negocio `senseibird_updates_total`.

Importar via Grafana ? Dashboards ? Import ? Upload JSON.

---

## 5. Seguridad integrada (DevSecOps)

### 5.1 Analisis est?tico de codigo (Semgrep)

- Reglas en `semgrep_rules.yaml`.
- Ejecucion: `semgrep scan --config=semgrep_rules.yaml .`
- Evidencia: `/reports/semgrep-report.txt`. Resultado critico = pipeline detenido.

### 5.2 Escaneo de dependencias (Snyk)

- `snyk test --all-projects` para Node + Python (requiere `SNYK_TOKEN`).
- Evidencia: `/reports/snyk-report.txt`, con observaciones y remediaciones sugeridas.

### 5.3 Politicas de seguridad en Kubernetes (Kyverno)

Pol?ticas en `k8s/policies/`:

1. `disallow-latest.yaml`
2. `require-resources.yaml`
3. `disallow-root.yaml`
4. `readOnly.yaml`

### 5.4 Monitoreo de seguridad en tiempo de ejecuci?n (Falco)

- Valores: `k8s/falco/values-minikube.yaml` (driver `modern-bpf`, anotacion `kyverno.io/ignore`).
- Instalaci?n: `helm upgrade --install falco falcosecurity/falco --namespace falco --values k8s/falco/values-minikube.yaml`
- Prueba: `kubectl -n senseibird run falco-trigger --rm -it --image=alpine --restart=Never --command -- sh -c "cat /etc/shadow >/tmp/out"`
- Log: `/reports/falco-event.log` registra la alerta ?A shell was spawned?? y ?Read sensitive file untrusted?, con una breve descripci?n manual.


## Desarrollado por Mateo Hern?ndez y Agust?n Pose
