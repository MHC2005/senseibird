#!/bin/bash
set -e

echo "========================================"
echo "   Inicializando entorno SenseiBird.    "
echo "========================================"

### 0) Build and load Docker images into Minikube
echo "➤ Configurando Docker para Minikube..."
eval $(minikube docker-env)

echo "➤ Construyendo imágenes Docker..."
docker build -t senseibird-api:dev backend/
docker build -t senseibird:dev .
docker build -t senseibird:blue .
docker build -t senseibird:green .

echo "✓ Imágenes construidas exitosamente"


### 1) Eliminar release previo (si existe)
echo "➤ Eliminando release previo (si existe)..."
helm uninstall senseibird -n senseibird 2>/dev/null || true


### 2) Borrar namespace si está corrompido (sin recrearlo)
echo "➤ Asegurando que el namespace no exista..."
kubectl delete ns senseibird --force --grace-period=0 2>/dev/null || true

# Esperar a que realmente desaparezca
echo "➤ Esperando a que Kubernetes elimine el namespace..."
while kubectl get ns senseibird >/dev/null 2>&1; do
    sleep 1
done


### 3) Instalar usando Helm (que helm cree el namespace correctamente)
echo "➤ Instalando Helm Chart..."
helm install senseibird ./helm \
    -f helm/values-prod.yaml \
    --namespace senseibird \
    --create-namespace


### 4) Esperar los despliegues
echo "➤ Esperando a que los pods estén listos..."
kubectl rollout status deployment/senseibird-api -n senseibird --timeout=90s
kubectl rollout status deployment/senseibird-web -n senseibird --timeout=90s


### 5) Hacer requests a la API para poblar dashboards
echo "➤ Generando tráfico hacia la API..."
API_POD=$(kubectl get pods -n senseibird -l tier=api -o jsonpath='{.items[0].metadata.name}')

for i in {1..10}; do
    kubectl exec -n senseibird "$API_POD" -- curl -s http://localhost:8000/health > /dev/null || true
done


echo "========================================"
echo " SenseiBird inicializado correctamente. "
echo "========================================"
