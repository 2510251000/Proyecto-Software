# Pruebas de carga (k6)

Miden cuánto aguanta Al Día con muchas personas a la vez. Se usa
[k6](https://grafana.com/docs/k6/) **dentro de Docker** (imagen `grafana/k6:1.0.0`), así que no hay
que instalar nada aparte de Docker Desktop.

## Qué hay aquí

| Archivo | Qué prueba |
|---|---|
| `backend/carga-api.js` | La API: 50 usuarios leen la portada (listado, una noticia, perfil y avisos) y 5 inician sesión sin parar |
| `frontend/carga-frontend.js` | La aplicación compilada que sirve nginx: 100 personas descargan la página, los archivos de Angular, una foto y una ruta interna |
| `correr-carga.ps1` | Corre cualquiera de las dos con Docker |
| `resultados/` | El último resumen de cada prueba (`.txt` para leer, `.json` con todos los números) |

## Cómo se corre

1. Encender Docker Desktop.
2. Desde la raíz del repositorio, levantar la aplicación completa:
   ```
   docker compose up --build -d
   ```
3. Correr la prueba:
   ```
   .\pruebas\carga\correr-carga.ps1 -Parte backend
   .\pruebas\carga\correr-carga.ps1 -Parte frontend
   ```
   Para más usuarios o más tiempo: `-Usuarios 100 -Duracion 2m`.
4. Leer el resumen en `pruebas\carga\resultados\`.

Cada prueba dura cerca de 2 minutos: 30 s de subida, 1 min con la carga completa y 15 s de bajada.

## Cuándo se considera que pasó (umbrales)

| Prueba | Umbral |
|---|---|
| Las dos | Menos del 1 % de peticiones fallidas y más del 99 % de comprobaciones bien |
| Backend | El 95 % de las lecturas responde en menos de 500 ms; el login en menos de 1,5 s (BCrypt es lento a propósito) |
| Frontend | El 95 % de la página, los archivos y la ruta interna llega en menos de 300 ms |

Si un umbral no se cumple, k6 termina con código distinto de 0 y el script lo avisa.

El análisis de los resultados está en `docs/PRUEBAS-FINALES.md`.
