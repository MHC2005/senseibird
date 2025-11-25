#!/bin/bash

API_POD=$(kubectl get pod -n senseibird -l tier=api -o jsonpath='{.items[0].metadata.name}')

echo "Generando tráfico a la API (20 requests)..."

for i in {1..20}; do
    kubectl exec -n senseibird "$API_POD" -- wget -qO- http://localhost:8000/health || true
done

echo "Tráfico generado."
