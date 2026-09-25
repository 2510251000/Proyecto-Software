# Al Día: Portal de Noticias

Portal de noticias de Cundinamarca que junta en un solo lugar la información oficial de las
alcaldías y los reportes que publica la comunidad. Proyecto de la asignatura Ingeniería de
Software, Universidad de Cundinamarca.

## Equipo

- **Sebastián**: base de datos y frontend.
- **David**: backend.

## Carpetas

| Carpeta | Qué contiene |
|---|---|
| `backend/` | API en Spring Boot con Java 17, arquitectura hexagonal |
| `database/` | Los tres scripts de PostgreSQL, que se corren en orden |
| `frontend/` | La aplicación en Angular |
| `docs/` | Modelo entidad-relación y capturas de pantalla |
| `iniciar-dev.ps1` | Arranca el backend y el frontend a la vez |

## Cómo levantarlo

Se necesita PostgreSQL 14 o superior, Java 17 y Node.js. Los comandos de la base se corren
desde la carpeta `database/`.

1. Crear la base de datos (una sola vez):
   `psql -U postgres -c "CREATE DATABASE aldia_db;"`
2. Correr los tres scripts, en este orden:
   ```
   psql -U postgres -d aldia_db -f 01-schema.sql
   psql -U postgres -d aldia_db -f 02-datos-iniciales.sql
   psql -U postgres -d aldia_db -f 03-datos-prueba.sql
   ```
   `01-schema.sql` borra y vuelve a crear todas las tablas: es solo para uso local.
   `03-datos-prueba.sql` crea dos cuentas y noticias de ejemplo; sus contraseñas están al
   inicio del archivo.
3. Copiar `backend/.env.example` como `backend/.env` y completar el usuario y la
   contraseña de la base y la clave del JWT.
4. Desde la raíz del repositorio: `.\iniciar-dev.ps1`

Quedan así:

- Backend: http://localhost:8080 (documentación en `/swagger-ui.html`)
- Frontend: http://localhost:4200

## Advertencia: el frontend va en el puerto 4200

Por defecto el backend solo acepta peticiones que vengan de `http://localhost:4200` (CORS,
variable `CORS_ORIGENES` del `.env`). Si Angular arranca en otro puerto, por ejemplo el
4201 porque el 4200 estaba ocupado, la aplicación abre pero ninguna petición funciona.

## Ramas

`feature/*` → `dev` → `pre` → `main`

Cada cambio se hace en una rama `feature/` que sale de `dev` y vuelve a `dev` por Pull
Request. `pre` y `main` están protegidas: solo reciben cambios por Pull Request.
