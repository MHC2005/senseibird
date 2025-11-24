Validación de Calidad de Imágenes Docker (Frontend y Backend)

Este documento evidencia la ejecución de los análisis de seguridad y optimización realizados sobre las imágenes Docker desarrolladas para el proyecto SenseiBird.  
Se utilizaron dos herramientas, tal como exige el práctico:

Trivy: análisis de vulnerabilidades (sistema + dependencias + secrets)  
Dive: inspección de capas, tamaño y eficiencia de la imagen

---

# 1. Análisis de Vulnerabilidades (Trivy)

Se ejecutó Trivy sobre ambas imágenes utilizando la configuración por defecto, que incluye:

- Vulnerabilidades en paquetes del sistema  
- Vulnerabilidades en dependencias del lenguaje (Python y Node.js)  
- Escaneo de secretos (secret scanning)

---

# 1.1 Backend — senseibird-backend:1.0.0

Comando ejecutado
trivy image senseibird-backend:1.0.0

Resumen del resultado
Total de vulnerabilidades: 52
Severidad
LOW	51
MEDIUM	1
HIGH	0
CRITICAL	0
La mayoría de las vulnerabilidades provienen de paquetes del sistema incluidos en la imagen base python:3.12-slim, lo cual es habitual y no afecta directamente al código del backend.
Las dependencias Python instaladas en .venv no presentan vulnerabilidades críticas.

# 1.2 Frontend — senseibird-frontend:1.0.2
Comando ejecutado
trivy image senseibird-frontend:1.0.2

Resumen del resultado
Total: 38 vulnerabilidades
Severidad
HIGH: 2
MEDIUM: 28
LOW: 6
UNKNOWN: 2
Las vulnerabilidades HIGH provienen principalmente de OpenSSL dentro de la imagen base alpine:3.19, la cual ya no recibe actualizaciones de seguridad.
No afectan directamente al código de la aplicación, pero estan pendientes por actualizar.
El resto de las vulnerabilidades corresponde a dependencias internas de Node.js, muchas de las cuales pueden mitigarse mediante:

npm update
npm audit fix

# 2. Análisis de Capas y Eficiencia (Dive)
Se utilizó Dive para revisar la estructura interna de las imágenes, confirmando tamaño, cantidad de capas y eficiencia de almacenamiento.

# 2.1 Backend — senseibird-backend:1.0.0
Comando ejecutado
dive senseibird-backend:1.0.0

Resumen del análisis
Tamaño total: ~291 MB
Capas: 12
Eficiencia estimada: ~73%
La mayor parte del espacio consumido proviene del entorno virtual con librerías Python compiladas (.venv).
Este comportamiento es normal en aplicaciones FastAPI con dependencias de terceros.

# 2.2 Frontend — senseibird-frontend:1.0.2
Comando ejecutado
dive senseibird-frontend:1.0.2

Resumen del análisis
Tamaño total: ~611 MB
Capas: 14
Eficiencia estimada: 97%
El peso principal proviene del directorio .next/ generado por el build de producción, el cual contiene:
JavaScript optimizado
Archivos estáticos
SWC compilado
La imagen utiliza multi-stage builds, por lo que el tamaño y la eficiencia son adecuados.

# 3. Conclusiones
Ambas imágenes fueron validadas correctamente mediante Trivy y Dive, cumpliendo con los requisitos del práctico.
No se encontraron vulnerabilidades HIGH ni CRITICAL en el backend, y las del frontend provienen del sistema base, no del código.
Las imágenes presentan una estructura eficiente y tamaños razonables para sus tecnologías.
Las oportunidades de optimización (actualización de imágenes base, actualización de dependencias, etc.) fueron identificadas y documentadas.
Las imágenes se consideran aptas para despliegue y cumplen con las prácticas recomendadas de construcción y revisión de contenedores.