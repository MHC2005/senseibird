# SenseiBird – Despliegue en Kubernetes con Minikube

SenseiBird es una aplicación web que hicimos para el aprendizaje de japonés gamificado. 
En este proyecto se trabajó en la containerización y el despliegue en Kubernetes usando Minikube en entornos locales.
Además, se implementó la estrategia de Blue/Green Deployment para realizar actualizaciones sin tiempo de inactividad.

# Implementación con Minikube

Instalación de dependencias:

Docker

kubectl

Minikube

# Inicio del clúster:

minikube start 

Acceso a la aplicación:
Se expuso el servicio vía NodePort:

minikube service -n senseibird senseibird-svc --url

Se organizaron los manifiestos en un namespace dedicado (senseibird), incluyendo:

Deployment.yaml → despliegue de la app con replicasets.

Service.yaml → expone la aplicación vía NodePort.

Blue/Green Deployment

Para manejar nuevas versiones de la aplicación sin interrumpir a los usuarios, se implementó la estrategia Blue/Green:

senseibird-web-blue → versión activa actual.

senseibird-web-green → nueva versión candidata.

En la versión blue la app se llama Senseibird - Aprende Chino y se ve en el inicio de la página, mientras que en la green dice Senseibird - Aprende Japonés porque el objetivo era reflejar un cambio aunque sea mínimo para reflejar lo aprendido.

# Flujo:

Se despliegan ambas versiones en paralelo.

El Service apunta a la versión activa (ej: track: green).

Una vez validada la nueva versión, se cambia el selector del Service al otro despliegue.

Se puede hacer rollback simplemente apuntando de nuevo al deployment anterior.

# Cambiar imagen en blue
kubectl -n senseibird set image deploy/senseibird-web-blue web=senseibird:blue

# Cambiar imagen en green
kubectl -n senseibird set image deploy/senseibird-web-green web=senseibird:green

# Reiniciar rollout
kubectl -n senseibird rollout restart deploy/senseibird-web-green

# Ver estado
kubectl -n senseibird rollout status deploy/senseibird-web-green

En resúmen:

Minikube se utilizó como entorno de prueba local.

Kubernetes gestionó los despliegues, servicios y namespaces.

Se implementó un flujo de Blue/Green Deployment que permite:

Subir nuevas versiones sin downtime.

Validar cambios antes de exponerlos a usuarios.

Hacer rollback inmediato si es necesario.
