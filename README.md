# SenseiBird – CI/CD, Kubernetes y Observabilidad

SenseiBird es una aplicación web para aprendizaje de idiomas que combina un frontend Next.js y un backend FastAPI. Este repositorio contiene todo el flujo DevOps:

- **Pipeline Jenkins** con análisis estático y build/push de imágenes.
- **Dockerfiles** listos para frontend y backend.
- **Manifiestos de Kubernetes** para desplegar en Minikube con estrategia Blue/Green.
- **Stack de monitoreo** compuesto por Prometheus + Grafana, más un dashboard exportado.

---

## 1. Pipeline Jenkins

Archivo: `Jenkinsfile`

| Stage | Descripción |
| --- | --- |
| `Semgrep Static Analysis` | Ejecuta `semgrep scan --config=semgrep_rules.yaml .` |
| `Snyk Dependency Scan` | Usa el token `SNYK_TOKEN` para `snyk test --all-projects` |
| `Build Frontend` | Instala dependencias y corre `npm run build` |
| `Build Backend` | Instala requirements del API (`pip install -r backend/requirements.txt`) |
| `Docker Build & Push` | Login en Docker Hub (`DOCKER_HUB` creds), `docker build` y `docker push` de la imagen `senseibird:latest` |

El pipeline corre en cualquier agente Jenkins y deja trazas con `timestamps()` para facilitar auditoría.

---

## 2. Construcción de imágenes locales

```powershell
# Cambiar daemon a Minikube (PowerShell)
minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Frontend
docker build -t senseibird-web:1.0.0 .

# Backend
docker build -t senseibird-api:1.0.0 -f backend/Dockerfile backend

# Volver al daemon original
minikube docker-env --shell powershell -u | Invoke-Expression
```

Si trabajás con Docker fuera de Minikube, luego ejecutá:
```
minikube image load senseibird-web:1.0.0
minikube image load senseibird-api:1.0.0
```

---

## 3. Despliegue en Kubernetes (`namespace: senseibird`)

1. `kubectl apply -f k8s/namespace.yaml`
2. Backend: `kubectl apply -f k8s/api-deployment.yaml` + `k8s/api-service.yaml`
3. Frontend: `kubectl apply -f k8s/deployment.yaml` + `k8s/service.yaml`
4. Verifica: `kubectl get pods,svc -n senseibird`
5. Acceso al front: `minikube service senseibird-svc -n senseibird --url` (NodePort 31000)

### Estrategia Blue/Green

- Deploys: `k8s/deployment-blue.yaml` y `k8s/deployment-green.yaml` (labels `track=blue/green`).
- El Service (`k8s/service.yaml`) apunta al track activo; cambiar el selector rota el tráfico sin downtime.
- Comandos útiles:
  ```bash
  kubectl -n senseibird set image deploy/senseibird-web-blue web=senseibird:blue
  kubectl -n senseibird set image deploy/senseibird-web-green web=senseibird:green
  kubectl -n senseibird rollout restart deploy/senseibird-web-green
  kubectl -n senseibird rollout status deploy/senseibird-web-green
  ```

---

## 4. Backend FastAPI y métricas

`backend/app/main.py` expone:

- `GET /health`
- `GET/POST /stats/{uid}` (persistencia SQLite)
- `GET /metrics` (instrumentado con `prometheus_fastapi_instrumentator`)
- Métrica de negocio `senseibird_updates_total` que aumenta en cada POST.

Para probar rápidamente:
```powershell
kubectl port-forward svc/senseibird-api -n senseibird 8000:8000
```
Luego usar Postman/curl contra `http://localhost:8000/...`.

---

## 5. Prometheus + Grafana (namespace `monitoring`)

### Prometheus (Helm → `monitoring.prometheus`)

Los recursos de Prometheus se generan desde `helm/templates/monitoring.yaml` y se parametrizan en `values*.yaml` bajo `monitoring.prometheus`.

- ConfigMap con `scrape_configs` para `senseibird-api`, kubelet y kubelet-cadvisor.
- `ServiceAccount` + RBAC y `Deployment` con la imagen `prom/prometheus:v2.52.0`.
- Service NodePort `30900` (configurable vía `monitoring.prometheus.nodePort`).
- Despliegue/actualización: `helm upgrade --install senseibird ./helm --namespace senseibird --create-namespace` (Prometheus se crea igual en el namespace `monitoring` definido en los values).
- Acceso: `minikube service prometheus -n monitoring --url`

### Grafana (Helm → `monitoring.grafana`)

- Secret `grafana-admin` y ConfigMap `grafana-datasources` gestionados por el chart.
- Deployment `grafana/grafana:10.4.2` con datasource apuntando al Service de Prometheus.
- Service NodePort `32000` configurable en `monitoring.grafana.nodePort`.
- Acceso: `minikube service grafana -n monitoring --url`

### Dashboard (`grafana/dashboard.json`)

Este JSON contiene el tablero exigido en el práctico, con al menos:

1. **Número de peticiones procesadas (RPS)**: `sum(rate(http_requests_total{handler!="/metrics"}[5m])) by (handler,method)`
2. **Latencia promedio / p95**: `rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])` o `histogram_quantile`.
3. **Uso de CPU/Mem por pod**: `sum(rate(container_cpu_usage_seconds_total{pod=~"senseibird-.*"}[5m])) by (pod)` y `container_memory_usage_bytes`.
4. **Métrica de negocio**: `senseibird_updates_total` y su rate.

Importá el archivo en Grafana (Dashboards → Import → Upload JSON) y seleccioná el datasource “Prometheus”.

---

## 6. Verificación & Troubleshooting

- **Pods sin endpoints**: revisá labels vs `selector` en `k8s/service.yaml`.
- **ErrImagePull**: asegurar que la imagen existe en el daemon de Minikube (`minikube image load ...`).
- **Grafana “No data”**: confirmar targets en Prometheus (`Status → Targets`) y generar tráfico con Postman.
- **Reiniciar deployments tras rebuild**:
  ```powershell
  kubectl rollout restart deploy/senseibird-web -n senseibird
  kubectl rollout restart deploy/senseibird-api -n senseibird
  kubectl rollout restart deploy/prometheus -n monitoring
  kubectl rollout restart deploy/grafana -n monitoring
  ```

Con este set-up se cumple el práctico: CI/CD con Jenkins, despliegue containerizado en Kubernetes (Blue/Green), y observabilidad completa con Prometheus + Grafana y el dashboard exportado en `grafana/dashboard.json`.




## Desarrollado por Mateo Hernández y Agustín Pose
