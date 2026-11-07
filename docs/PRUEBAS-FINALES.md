# Pruebas finales de Al Día

Fecha: 6 de noviembre de 2026. Rama `test/pruebas-finales`, que contiene el rediseño de la portada (PR #15).

El frontend y el backend se probaron **por separado**, cada uno con **pruebas unitarias** y
**pruebas de carga**.

## Resumen

| Parte | Pruebas unitarias | Cobertura (líneas) | Prueba de carga | Resultado |
|---|---|---|---|---|
| **Frontend** | 338 de 338 (Vitest) | 90,9 % | 100 personas a la vez, 36.996 peticiones | ✅ Pasa: 0 fallos y el 95 % llega en menos de 160 ms |
| **Backend** | 144 de 144 (JUnit 5) | 92,3 % | 55 usuarios a la vez, 16.571 peticiones | ✅ Pasa: 0 fallos y el 95 % responde en menos de 12 ms |

---

## 1. Frontend

### 1.1 Pruebas unitarias

- Herramienta: **Vitest** (lo usa Angular con `ng test`) y la cobertura con `@vitest/coverage-v8`.
- Comando: `cd frontend` y luego `npm run test:cobertura`.
- Reporte visual: `frontend/coverage/aldia-app/lcov-report/index.html` (doble clic).

| Medida | Resultado |
|---|---|
| Archivos de prueba | 44 |
| Pruebas | **338 pasan, 0 fallan** |
| Sentencias cubiertas | 89,75 % (3.372 de 3.757) |
| Ramas cubiertas | 87,85 % (1.186 de 1.350) |
| Funciones cubiertas | 82,74 % (537 de 649) |
| Líneas cubiertas | 90,89 % (2.377 de 2.615) |

Qué cubren: servicios HTTP (con respuestas simuladas), guard, interceptor, componentes de cada
pantalla (portada, bienvenida, columna derecha, tarjetas, marco y barras del celular, publicar,
perfil, avisos, mapa, administración, detalle, login, registro y «Hoy») y las funciones puras
(filtros de la portada, tiempo relativo, minutos de lectura, iniciales…).

### 1.2 Prueba de carga

- Herramienta: **k6 1.0.0** en Docker (`grafana/k6:1.0.0`). Script: `pruebas/carga/frontend/carga-frontend.js`.
- Qué se probó: la aplicación **compilada** que sirve **nginx** en el contenedor `frontend`
  (`docker compose up --build`), no el servidor de desarrollo.
- Cada persona simulada hace lo que hace un navegador al abrir Al Día por primera vez: descarga
  `index.html`, el JavaScript y el CSS de Angular, una foto de noticia y una ruta interna
  (`/noticias`, que nginx debe resolver con `index.html`). Luego espera 1 s y repite.
- Carga: sube de 0 a **100 personas** en 30 s, se mantiene **1 minuto** y baja en 15 s.

| Medida | Umbral | Resultado |
|---|---|---|
| Peticiones fallidas | menos de 1 % | ✅ **0 %** (0 de 36.996) |
| Comprobaciones correctas | más de 99 % | ✅ **100 %** (44.394) |
| `index.html`: 95 % de las respuestas en | menos de 300 ms | ✅ **63 ms** |
| Archivos de Angular y foto: 95 % en | menos de 300 ms | ✅ **159 ms** |
| Ruta interna `/noticias`: 95 % en | menos de 300 ms | ✅ **61 ms** |
| Peticiones por segundo | (informativo) | 350 |

**Hallazgo y corrección.** En la primera corrida los archivos tardaban **659 ms** (el 95 %) y la
prueba no pasaba. La causa era que **nginx no comprimía** los archivos: `main.js` viajaba
completo, con 273 kB. Se activó **gzip** en `frontend/nginx.conf` y `main.js` pasó a **85 kB**.
Con eso, el 95 % de los archivos llega en 159 ms y el servidor atiende 36 % más peticiones por
segundo (de 257 a 350).

En la práctica el resultado es todavía mejor: el navegador guarda en caché los archivos de
Angular (nginx los marca como `immutable` por un año), así que solo los descarga en la primera
visita. La prueba mide siempre el peor caso: todos llegan por primera vez.

---

## 2. Backend

### 2.1 Pruebas unitarias

- Herramienta: **JUnit 5** con Mockito, ArchUnit (reglas de la arquitectura hexagonal) y pruebas
  de integración de la API contra un **PostgreSQL embebido** (no hace falta tener la base encendida).
  La cobertura la mide **JaCoCo**.
- Comando: `cd backend` y luego `.\mvnw.cmd verify`.
- Reporte visual: `backend/target/site/jacoco/index.html` (doble clic).

| Medida | Resultado |
|---|---|
| Clases de prueba | 24 |
| Pruebas | **144 pasan, 0 fallan, 0 omitidas** |
| Líneas cubiertas | 92,3 % |
| Instrucciones cubiertas | 90,9 % |
| Métodos cubiertos | 92,4 % |
| Ramas cubiertas | 68,9 % |

Qué cubren:

| Capa | Ejemplos |
|---|---|
| **Dominio** | Cálculo de nivel, límite diario de publicaciones, política de recomendación, avisos por ciudad, reglas de comentarios, calificaciones y reportes, y validación de imágenes |
| **Aplicación** | Registrar, iniciar sesión, publicar, listar, moderar, gestionar usuarios, interacción e imágenes |
| **Infraestructura** | BCrypt, JWT, almacenamiento y procesamiento de imágenes, geocodificación, y 16 pruebas de la API completa (`ApiIntegracionTest`) |
| **Arquitectura** | 4 reglas de ArchUnit: el dominio no depende de Spring ni de la infraestructura |

### 2.2 Prueba de carga

- Herramienta: **k6 1.0.0** en Docker. Script: `pruebas/carga/backend/carga-api.js`.
- Qué se probó: el backend del contenedor `backend`, con la base `db` y los datos de
  demostración del perfil `dev`.
- Dos grupos al mismo tiempo:
  - **Lectura** (sube a **50 usuarios**, 1 minuto lleno): cada uno pide el listado de la
    portada, abre una noticia al azar, consulta su perfil y la campana de avisos, y espera 1 s.
  - **Inicio de sesión** (**5 usuarios** sin parar): es lo más pesado, porque la contraseña se
    verifica con BCrypt.

| Medida | Umbral | Resultado |
|---|---|---|
| Peticiones fallidas | menos de 1 % | ✅ **0 %** (0 de 16.571) |
| Comprobaciones correctas | más de 99 % | ✅ **100 %** (20.605) |
| `GET /api/noticias`: 95 % en | menos de 500 ms | ✅ **11,9 ms** |
| `GET /api/noticias/{id}`: 95 % en | menos de 500 ms | ✅ **9,7 ms** |
| `GET /api/usuarios/me`: 95 % en | menos de 500 ms | ✅ **7,7 ms** |
| `GET /api/notificaciones/no-leidas`: 95 % en | menos de 500 ms | ✅ **6,6 ms** |
| `POST /api/auth/login`: 95 % en | menos de 1.500 ms | ✅ **108 ms** |
| Peticiones por segundo | (informativo) | 156 |
| Respuesta más lenta de toda la prueba | (informativo) | 139 ms |

El backend sobra para esta carga: el 95 % de las lecturas responde en ~12 ms. El login es unas
10 veces más lento que una lectura, y así debe ser: BCrypt es lento a propósito para que adivinar
contraseñas sea costoso.

---

## 3. Cómo repetir todo

```
# Frontend: unitarias con cobertura
cd frontend
npm run test:cobertura

# Backend: unitarias con cobertura
cd backend
.\mvnw.cmd verify

# Carga (con Docker Desktop encendido, desde la raíz del repositorio)
docker compose up --build -d
.\pruebas\carga\correr-carga.ps1 -Parte backend
.\pruebas\carga\correr-carga.ps1 -Parte frontend
```

Los resúmenes de la última corrida están en `pruebas/carga/resultados/`. La explicación de las
pruebas de carga está en `pruebas/carga/README.md`.

## 4. Ambiente

- Windows 11, Docker Desktop 29.8.2 (16 CPU y 11,4 GB asignados).
- Contenedores de `docker-compose.yml`: PostgreSQL 16, backend Spring Boot (perfil `dev`) y
  frontend con nginx.
- k6 corre en su propio contenedor y llega a la aplicación por `host.docker.internal` (los mismos
  puertos 4200 y 8080 que usa el navegador).
- Los números dependen del computador. En otra máquina pueden cambiar, pero los umbrales tienen
  margen de sobra.
