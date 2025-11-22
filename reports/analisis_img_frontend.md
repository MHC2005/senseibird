Análisis de Imagen – Frontend (senseibird-frontend:1.0.2)

Este documento resume el análisis de la imagen Docker correspondiente al frontend de SenseiBird.
Se utilizaron las herramientas Dive y Trivy, además de la inspección manual de capas.

1. Tamaño total de la imagen
La imagen final ocupa 611 MB.
El tamaño está dentro de lo esperable para una aplicación Next.js que incluye un build completo y dependencias de producción.

2. Cantidad de capas
La imagen contiene 14 capas.
Esto se debe al uso de un multistage build con:
una etapa builder (Node.js + npm build)
una etapa runner minimalista que ejecuta el servidor.

3. Observaciones y mejoras posibles
En términos generales, la imagen está muy bien optimizada:
Se usa node:20-alpine, que es una base ligera.
El comando npm install --omit=dev asegura que solo queden dependencias de producción.
Dive reportó una eficiencia del 97%, lo cual es muy bueno y poco común.
No se detectaron archivos pesados superfluos ni capas redundantes.

Mejoras posibles (de cara a futuro):
Podría eliminarse el cache de npm con npm cache clean --force, aunque la ganancia es mínima.
Si se quisiera reducir más el tamaño, existe la opción de usar node:20-alpine y servir con bun o node --experimental-build, pero no aporta mucho al práctico.

Conclusión: La imagen frontend está correctamente construida y no requiere optimizaciones adicionales.