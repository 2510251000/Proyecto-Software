Hola. Soy David, del proyecto "Al Día" (repo 2510251000/Proyecto-Software). Yo soy el dueño
del backend y Sebastián hace la base de datos y el frontend.

Sebastián terminó la aplicación completa y ya la subió a la rama `dev`. Necesito que me
ayudes a:
  (a) traer su trabajo a mi computador,
  (b) entender qué hizo (sobre todo lo que cambió en el backend, que es mi parte), y
  (c) verlo funcionando en mi pantalla.
Ve paso a paso, explícame en lenguaje sencillo lo que haces y no des nada por sabido.

## REGLA PRINCIPAL: PREGÚNTAME ANTES DE USAR DOCKER

Antes de levantar nada, hazme esta pregunta y espera mi respuesta:

  "¿Lo levantamos ya con Docker o esperamos y por ahora lo vemos sin Docker?"

- Si digo **Docker** → sigue la sección 4.A.
- Si digo **esperar** → sigue la sección 4.B (sin Docker) y NO toques Docker hasta que yo lo diga.
No decidas tú por mí. Mientras te respondo, puedes adelantar los pasos 1, 2 y 3.

Otras reglas:
- Trabaja SIEMPRE sobre la rama `dev` (en este repo todo va a `dev`, no a `main`).
- No hagas commit, push ni merge sin preguntarme.
- Nunca subas un archivo `.env` a Git (están en `.gitignore`).
- No borres volúmenes de Docker (`docker compose down -v`) ni bases de datos sin preguntarme
  primero: eso borra los usuarios y noticias.

## 1. Traer el código y abrirlo en Visual Studio Code

OJO: en GitHub la rama por defecto es `main`, que está VIEJA. Todo el trabajo está en `dev`.
Si clonas sin más te quedas con la versión vieja.

1. Mira si ya tengo el proyecto clonado en mi computador (pregúntame la carpeta).
   - Si NO lo tengo: `git clone -b dev https://github.com/2510251000/Proyecto-Software.git`
   - Si SÍ lo tengo: entra a la carpeta, `git status` (si tengo cambios sin guardar, avísame
     antes de seguir y no los borres), luego `git fetch origin`, `git checkout dev`,
     `git pull origin dev`.
2. `git log --oneline -10`: el último commit debe ser
   "Merge pull request #11 from 2510251000/fix/quality-gate-dev" (9761685).
   Si no aparece, detente y avísame.
3. Abre la carpeta del proyecto en Visual Studio Code (`code .` desde la raíz, o
   Archivo > Abrir carpeta) y abre ahí una terminal (Terminal > Nueva terminal) para seguir.
   En la barra de abajo a la izquierda de VS Code debe decir `dev`.

## 2. Explícame qué hizo Sebastián

Lee el código y estos documentos y resúmemelos en voz sencilla:
- `README.md` (raíz): qué hace la app, cómo levantarla y las cuentas de demostración.
- `docs/ESTADO.md`: tabla de requisitos con lo que había antes y lo que hay ahora.
- `docs/DECISIONES.md`: por qué se hizo cada cosa (incluye cómo se aplican los principios SOLID).
- `docs/PENDIENTES.md`: lo que queda abierto.
- Capturas de todas las pantallas en `docs/capturas/`.

Lo que hay (confírmalo en el código, no te fíes solo de esta lista):
- **Registro** con nombre y municipio (el municipio sale del GPS del navegador con
  "Usar mi ubicación" o buscándolo por nombre) e **inicio de sesión con JWT**.
  Roles USUARIO_COMUN y ADMINISTRADOR.
- **Niveles 1 a 3** por puntos: el nivel 1 publica máximo 3 noticias al día, el 2 publica 10
  y el 3 publica 30. Cada noticia suma puntos y las de niveles altos salen primero.
- **Noticias oficiales** (las publica el administrador) y **comunitarias** (los usuarios), con
  portada, detalle, filtro por tipo y por municipio, y búsqueda.
- **Publicar** desde la app mostrando el cupo que queda en el día.
- **Notificaciones**: al publicar, los usuarios del mismo municipio reciben un aviso.
- **Ubicación con API externa real**: Google Maps si hay clave; si no, Nominatim
  (OpenStreetMap), que no pide clave. Se elige con la variable `GEO_PROVEEDOR`.
- **Panel de administración**: ocultar, volver a publicar o borrar noticias y gestionar
  usuarios (activar/desactivar, rol, nivel).
- **Perfil** con el nivel y los puntos.
- Pantallas del frontend (`frontend/src/app/app.routes.ts`): /login, /registro, /noticias,
  /noticias/:id, publicar, perfil, notificaciones y admin.

Cambios en MI backend que necesito entender bien (explícamelos con ejemplos de archivos):
- **Arquitectura hexagonal**: el dominio y los casos de uso ya no usan Spring; los beans se
  declaran en la infraestructura (`CasosDeUsoConfiguracion`) y una prueba de ArchUnit vigila
  que se cumpla.
- **Flyway**: el esquema ya no está en `database/*.sql` sino en
  `backend/src/main/resources/db/migration` (V1, V2, V3). Los datos de demostración están en
  `db/demo/R__datos_demo.sql` y solo se cargan con el perfil `dev`. Ya no hay que correr
  scripts a mano: la base se crea sola al arrancar el backend.
- Configuración en `application.yml` (antes era `.properties`) y `.env.example` completo.
- Endpoints nuevos: búsqueda y filtros de noticias, perfil, notificaciones, ubicación y
  administración. Swagger (`/swagger-ui.html`) los muestra todos; la colección de Postman
  todavía no.
- Pruebas: 89 en el backend (usan un PostgreSQL embebido, no necesitan mi base) y 180 en el
  frontend.
- Calidad: el proyecto se analiza en SonarQube Cloud con un workflow de GitHub Actions
  (`sonar-project.properties` y `.github/workflows`), y el Quality Gate de `dev` está en verde.
  Además la base de datos usa la zona horaria de la app (America/Bogota) para que los avisos
  salgan en el orden correcto aunque el servidor esté en UTC.

## 3. Preparar los archivos `.env`

- Para Docker: `.env` en la raíz, copiado de `.env.example`.
- Sin Docker: `backend/.env`, copiado de `backend/.env.example`.
Completa `DB_USUARIO`, `DB_CONTRASENA` y `JWT_CLAVE_SECRETA` (mínimo 64 caracteres). Si ya
tengo alguno de los dos `.env`, reutiliza sus valores; si no, pregúntame cuáles usar.
`GOOGLE_MAPS_API_KEY` se puede dejar vacía (se usa Nominatim).
Revisa también que estén las variables nuevas de `.env.example` (`GEO_PROVEEDOR`, etc.).

## 4.A Si te digo que con Docker

1. `docker version` debe mostrar Client y Server. Si no, abre Docker Desktop y espera a que
   el motor esté corriendo. Si no lo tengo instalado, guíame (necesita WSL2 y casi siempre
   reiniciar Windows; los instaladores piden permiso de administrador: avísame antes).
2. Desde la raíz: `docker compose up --build -d`. SIEMPRE con `--build` después de un pull,
   o se queda la versión vieja guardada en la imagen. La primera vez tarda varios minutos.
3. Comprueba:
   - `docker compose ps`: `db` healthy, `backend` y `frontend` arriba.
   - `docker compose logs backend`: debe decir "Started AlDiaApplication" y mostrar que
     Flyway aplicó las migraciones.
   - Si yo ya tenía un volumen viejo de Docker, Flyway lo marca en la versión 2 y aplica lo
     que falta sin borrar nada. Si aun así el backend falla por Flyway, NO borres el volumen:
     muéstrame el error y pregúntame si hacemos `docker compose down -v`.
4. Puertos: frontend http://localhost:4200, backend http://localhost:8080 (responde 401 en
   la raíz: es normal, es la seguridad), Swagger en http://localhost:8080/swagger-ui.html y
   PostgreSQL en localhost:5433 (base `aldia_db`).
5. Para apagar: `docker compose down` (SIN -v).

## 4.B Si te digo que esperemos (sin Docker)

Necesito PostgreSQL 14+ corriendo en Windows (puerto 5432), Java 17+ y Node.js. Revisa que
los tenga y, si falta algo, avísame antes de instalar.
1. Crear la base una sola vez si no existe: `psql -U postgres -c "CREATE DATABASE aldia_db;"`.
   Si ya existe una `aldia_db` vieja, avísame: Flyway la marca en la versión 2 y le agrega lo
   nuevo sin borrar nada, pero quiero saberlo antes.
2. En PowerShell desde la raíz: `.\iniciar-dev.ps1` (arranca backend y frontend), o en dos
   terminales: `cd backend; .\mvnw.cmd spring-boot:run` y
   `cd frontend; npm install; npx ng serve`.
3. Abrir http://localhost:4200.
OJO: el frontend TIENE que quedar en el puerto 4200. El backend solo acepta peticiones de ese
origen (CORS). Si Angular arranca en el 4201 porque el 4200 está ocupado, la página abre pero
nada funciona: busca qué ocupa el 4200 (puede ser el contenedor de Docker; en ese caso
`docker compose stop frontend`).

## 5. Verlo en pantalla: recorrido de demostración

Cuentas de demostración (las crea Flyway en el perfil `dev`):

| Correo | Contraseña | Rol | Nivel | Municipio |
|---|---|---|---|---|
| admin@aldia.com | Admin12345 | Administrador | — | Fusagasugá |
| corresponsal@aldia.com | Usuario12345 | Usuario | 3 (160 pts) | Soacha |
| activo@aldia.com | Usuario12345 | Usuario | 2 (60 pts) | Fusagasugá |
| vecina@aldia.com | Usuario12345 | Usuario | 1 (10 pts) | Fusagasugá |
| lector@aldia.com | Usuario12345 | Usuario | 1 (0 pts) | Zipaquirá |

Acompáñame a probar, y dime en cada paso qué debo ver:
1. Crear una cuenta nueva en Fusagasugá usando "Usar mi ubicación" (el navegador pide
   permiso de ubicación; si lo niego o falla, la app explica por qué y puedo buscar el
   municipio por nombre).
2. Portada: noticias de demostración, filtro oficial/comunitaria, búsqueda y cambio de municipio.
3. Abrir una noticia (vista rápida y su página propia /noticias/:id).
4. Publicar una noticia y ver cómo baja el cupo del día.
5. Cerrar sesión, entrar como `vecina@aldia.com` y ver la notificación de esa noticia.
6. Entrar como `admin@aldia.com`, ir a "Administración", ocultar la noticia y gestionar un usuario.
7. Ver el perfil con el nivel y los puntos.
8. Swagger: hacer login en `POST /api/auth/login`, copiar el token, pulsar "Authorize" y
   probar `GET /api/usuarios/me`.

Si algo no funciona, revisa los logs del backend, explícame la causa y propón el arreglo,
pero no cambies código sin preguntarme.

## 6. Al final

Dame un resumen corto de: qué hizo Sebastián, qué cambió en el backend, cómo lo levanté y
cómo lo apago, y qué queda pendiente según `docs/PENDIENTES.md`.
