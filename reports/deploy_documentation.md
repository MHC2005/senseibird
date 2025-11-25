Guía de despliegue – SenseiBird 

1. Preparación inicial

1.1 Requisitos
Docker
Minikube
kubectl
Helm
Trivy
Dive

2. Construcción de imágenes Docker
docker build -t senseibird-api:dev backend/
docker build -t senseibird:dev app/
docker build -t senseibird:blue app/
docker build -t senseibird:green app/

3. Validación de seguridad

3.1 Trivy
trivy image senseibird-api:dev
trivy image senseibird:dev

3.2 Dive
dive senseibird-api:dev
dive senseibird:dev

4. Despliegue en Kubernetes
./scripts/init.sh
Esto ejecuta:
creación de namespace
despliegue por Helm
generación de tráfico
validación de pods
Ver pods:
kubectl get pods -n senseibird

5. Visualización en Grafana
URL: http://localhost:3001
Dashboard usado: SenseiBird Traffic Overview
Métricas pobladas automáticamente por init.sh

6. Eliminación de la infraestructura
./scripts/cleanup.sh
