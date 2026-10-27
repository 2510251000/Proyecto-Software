# Al Día: Portal de Noticias

Portal de noticias de Cundinamarca que junta en un solo lugar la información oficial de las
alcaldías y los reportes que publica la comunidad. Proyecto de la asignatura Ingeniería de
Software, Universidad de Cundinamarca.

## Equipo

- **Sebastián**: base de datos y frontend.
- **David**: backend.

## Qué hace

- Registro (con nombre y municipio) e inicio de sesión con JWT. Roles: usuario común y administrador.
- Niveles 1 a 3: el nivel 1 publica máximo 3 noticias al día, el 2 publica 10 y el 3 publica 30.
  Cada noticia publicada suma puntos para subir de nivel, y las noticias de niveles altos
  salen primero en la portada (ver `docs/DECISIONES.md`).
- Noticias oficiales (las publica el administrador) y comunitarias (las publican los usuarios),
  con listado, detalle, filtros por tipo y por municipio, y búsqueda.
- **Ubicación con una API externa real**: el municipio se obtiene con el GPS del navegador o
  buscándolo por nombre. Usa Google Maps si hay clave y, si no, Nominatim (OpenStreetMap).
- Al publicar una noticia, los usuarios de ese municipio reciben una notificación en la app.
- Panel de administración: ocultar, volver a publicar o borrar noticias, y gestionar usuarios
  (activar o desactivar, fijar el nivel).

## Carpetas

| Carpeta | Qué contiene |
|---|---|
| `backend/` | API en Spring Boot 3 con Java 17, arquitectura hexagonal. Migraciones de la base en `src/main/resources/db/` |
| `frontend/` | La aplicación en Angular 22 (TypeScript estricto) |
| `database/` | Notas de la base de datos (el esquema ahora lo aplica Flyway) |
| `docs/` | Estado, decisiones, pendientes, modelo entidad-relación y capturas |
| `iniciar-dev.ps1` | Arranca el backend y el frontend a la vez |

## Cómo levantarlo

### Opción A — en Windows, sin Docker

Se necesita PostgreSQL 14 o superior corriendo, Java 17 o superior y Node.js.

1. Crear la base (una sola vez): `psql -U postgres -c "CREATE DATABASE aldia_db;"`
   Las tablas, los catálogos y los datos de demostración los crea el backend al arrancar
   (Flyway). No hay que correr scripts a mano.
2. Copiar `backend/.env.example` como `backend/.env` y completar `DB_USUARIO`,
   `DB_CONTRASENA` y `JWT_CLAVE_SECRETA` (mínimo 64 caracteres). `GOOGLE_MAPS_API_KEY` es
   opcional.
3. En PowerShell, desde la raíz: `.\iniciar-dev.ps1`
   (o en dos terminales: `cd backend; .\mvnw.cmd spring-boot:run` y
   `cd frontend; npm install; npx ng serve`).
4. Abrir http://localhost:4200

### Opción B — con Docker

1. Copiar `.env.example` como `.env` (en la raíz) y completar los valores.
2. `docker compose up --build -d`
3. Abrir http://localhost:4200 (la base queda en el puerto 5433).

Quedan así:

- Frontend: http://localhost:4200
- Backend: http://localhost:8080 (documentación en `/swagger-ui.html`)

## Cuentas de demostración (SOLO para la demo)

Las crea la migración `backend/src/main/resources/db/demo/R__datos_demo.sql` en el perfil `dev`.

| Correo | Contraseña | Rol | Nivel | Municipio |
|---|---|---|---|---|
| admin@aldia.com | Admin12345 | Administrador | — | Fusagasugá |
| corresponsal@aldia.com | Usuario12345 | Usuario | 3 (160 pts) | Soacha |
| activo@aldia.com | Usuario12345 | Usuario | 2 (60 pts) | Fusagasugá |
| vecina@aldia.com | Usuario12345 | Usuario | 1 (10 pts) | Fusagasugá |
| lector@aldia.com | Usuario12345 | Usuario | 1 (0 pts) | Zipaquirá |

Recorrido sugerido: crear una cuenta en Fusagasugá con «Usar mi ubicación» → publicar una
noticia → entrar como `vecina@aldia.com` y ver la notificación → entrar como
`admin@aldia.com` y ocultarla en «Administración».

## Pruebas

- Backend: `cd backend` y `.\mvnw.cmd test` (no necesita tu PostgreSQL: usa uno embebido).
- Frontend: `cd frontend` y `npx ng test --watch=false`; lint con `npx ng lint`.

## Calidad del código (SonarQube Cloud)

En cada push a `dev` o `main` y en cada PR, GitHub Actions (`.github/workflows/sonar.yml`)
corre las pruebas de los dos lados y envía el código y la cobertura a
[SonarQube Cloud](https://sonarcloud.io/project/overview?id=2510251000_Proyecto-Software).
Allí se ven los bugs, las vulnerabilidades, el código duplicado, la cobertura y el
Quality Gate (aprobado / no aprobado). La configuración está en `sonar-project.properties`.

Para ver la cobertura en tu equipo:
- Backend: `cd backend` y `.\mvnw.cmd verify` → `backend/target/site/jacoco/index.html`.
- Frontend: `cd frontend` y `npm run test:cobertura` → `frontend/coverage/aldia-app/lcov-report/index.html`.

## Advertencia: el frontend va en el puerto 4200

Por defecto el backend solo acepta peticiones que vengan de `http://localhost:4200` (CORS,
variable `CORS_ORIGENES` del `.env`). Si Angular arranca en otro puerto, por ejemplo el
4201 porque el 4200 estaba ocupado, la aplicación abre pero ninguna petición funciona.

## Ramas

`feature/*` → `dev` → `pre` → `main`

Cada cambio se hace en una rama `feature/` que sale de `dev` y vuelve a `dev` por Pull
Request. `pre` y `main` están protegidas: solo reciben cambios por Pull Request.
