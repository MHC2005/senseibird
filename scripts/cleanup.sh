#!/bin/bash
set -e

echo "Eliminando namespace senseibird..."
kubectl delete ns senseibird --force --grace-period=0 2>/dev/null || true

echo "Eliminando release Helm..."
helm uninstall senseibird -n senseibird 2>/dev/null || true

echo "Cleanup completo."
