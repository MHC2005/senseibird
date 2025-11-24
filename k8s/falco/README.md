# Falco en Minikube

Este directorio contiene la configuracion minima para desplegar [Falco](https://falco.org/) junto al cluster local de SenseiBird. Se instala via Helm y se apoya en el driver eBPF para evitar compilar modulos del kernel en Minikube.

## Prerrequisitos

- Minikube corriendo (`minikube start`)
- kubectl apuntando al contexto de Minikube (`kubectl config use-context minikube`)
- Helm >= 3.9

## Instalacion

1. **Agregar el repositorio oficial de Falco**
   ```powershell
   helm repo add falcosecurity https://falcosecurity.github.io/charts
   helm repo update
   ```

2. **Crear el namespace donde vivira Falco**
   ```powershell
   kubectl create namespace falco
   ```

3. **(Opcional) Aplicar una PolicyException de Kyverno**
   Solo si tu cluster corre Kyverno >= 1.12 (con el CRD `PolicyException`) y queres una excepcion explicita:
   ```powershell
   kubectl apply -f k8s/policies/kyverno-falco-exception.yaml
   ```
   Si usas una version anterior o no tenes el CRD, podes omitir este paso: los pods de Falco ya incluyen la anotacion `kyverno.io/ignore=true` via `k8s/falco/values-minikube.yaml`, lo que hace que Kyverno saltee la validacion.

4. **Publicar las excepciones locales como ConfigMap**
   ```powershell
   kubectl create configmap falco-senseibird-rules `
     --from-file=excepcion-falco.yaml=k8s/policies/excepcion-falco.yaml `
     --namespace falco `
     --dry-run=client -o yaml | kubectl apply -f -
   ```
   El ConfigMap queda disponible con el nombre `falco-senseibird-rules` y se monta automaticamente gracias a `k8s/falco/values-minikube.yaml`.

5. **Instalar Falco con los valores para Minikube**
   ```powershell
   helm upgrade --install falco falcosecurity/falco `
     --namespace falco `
     --values k8s/falco/values-minikube.yaml
   ```

6. **Verificar que el DaemonSet este listo**
   ```powershell
   kubectl -n falco get pods -w
   ```

## Validacion y uso

1. **Capturar los logs en un archivo**
   ```powershell
   kubectl -n falco logs ds/falco -f | Tee-Object reports/falco-event.log
   ```
   Deja la terminal abierta hasta que el evento aparezca para que quede persistido en `reports/falco-event.log`.

2. **Disparar una alerta sin abrir un shell interactivo**
   En otra terminal, ejecuta un comando que escriba bajo `/etc` dentro de un pod del namespace `senseibird`:
   ```powershell
   kubectl -n senseibird exec deploy/senseibird-web -- touch /etc/falco-test
   ```
   Este comando no abre un shell interactivo y gatilla la regla `Write below etc`.

3. **Verificar la alerta**
   En la primera terminal deberías ver una entrada JSON similar a la registrada en `reports/falco-event.log`. Anota una breve descripcion (por ejemplo: *"Write below etc detecto touch /etc/falco-test ejecutado en senseibird-web"*) para documentar el hallazgo.

Las alertas se imprimen en JSON (porque `jsonOutput=true`) y respetan las excepciones definidas en `k8s/policies/excepcion-falco.yaml`.

## Desinstalacion

```powershell
helm uninstall falco -n falco
kubectl delete namespace falco
```

> Si se modifican las excepciones, repetir el paso 3 para regenerar el ConfigMap antes de ejecutar `helm upgrade`.
