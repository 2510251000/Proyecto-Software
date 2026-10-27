# Backend — Al Día: Portal de Noticias

API REST construida con Spring Boot 3.3.4, Java 17 y arquitectura hexagonal.

## Requisitos previos

- Java 17 o superior
- PostgreSQL 17 corriendo localmente
- No es necesario tener Maven instalado, el proyecto incluye su propio wrapper (mvnw)

## Configuración

1. Crea la base de datos vacía. Las tablas, los catálogos y (en dev) los datos de
demostración los crea Flyway al arrancar el backend:

psql -U postgres -c "CREATE DATABASE aldia_db;"

2. Copia .env.example a .env y completa los valores reales:

DB_USUARIO=postgres
DB_CONTRASENA=tu_contraseña
JWT_CLAVE_SECRETA=una_clave_de_al_menos_64_caracteres

En dev no hace falta nada más: la URL de la base, el tiempo de expiración del
token y el origen de CORS tienen valores predeterminados para trabajar en local.

## Perfiles de ambiente

| Perfil | Uso | Variables obligatorias |
|---|---|---|
| dev | Máquina local (predeterminado) | DB_USUARIO, DB_CONTRASENA, JWT_CLAVE_SECRETA |
| test | Ambiente de pruebas | Las de dev + DB_URL, JWT_EXPIRACION_MS, CORS_ORIGENES |
| prod | Producción | Las de dev + DB_URL, JWT_EXPIRACION_MS, CORS_ORIGENES |

Los nombres coinciden con los ambientes del frontend (dev / test / prod).
Para arrancar con otro perfil:

.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=test"

## Cómo correr el proyecto

Desde la carpeta backend/:

En Windows (PowerShell o cmd):
.\mvnw.cmd spring-boot:run

La API queda disponible en http://localhost:8080

## Endpoints disponibles

Todos aparecen en Swagger: http://localhost:8080/swagger-ui.html

| Endpoint | Método | Acceso | Descripción |
|---|---|---|---|
| /api/auth/registro | POST | Público | Registra un usuario común (correo, contraseña, nombre opcional y ciudadId) |
| /api/auth/login | POST | Público | Inicia sesión y devuelve un token JWT |
| /api/noticias | GET | Público | Noticias publicadas. Filtros: `tipo` (OFICIALES, COMUNITARIAS), `ciudadId`, `q` (búsqueda), `orden` (RECIENTES, RECOMENDADAS) |
| /api/noticias/{id} | GET | Público | Una noticia publicada |
| /api/noticias | POST | Con token | Publica (respeta el límite diario y avisa a los de la misma ciudad) |
| /api/usuarios/me | GET / PUT | Con token | Perfil: nivel, puntaje, siguiente nivel y cupo de hoy; cambiar nombre o ciudad |
| /api/notificaciones | GET | Con token | Notificaciones del usuario |
| /api/notificaciones/no-leidas | GET | Con token | Cuántas hay sin leer |
| /api/notificaciones/{id}/leida, /api/notificaciones/leidas | PUT | Con token | Marcar una o todas como leídas |
| /api/ubicacion/ciudades | GET | Público | Catálogo de ciudades |
| /api/ubicacion/buscar?q= | GET | Público | Busca un municipio en la API de mapas |
| /api/ubicacion/resolver | POST | Público | `{idLugar}` o `{latitud, longitud}` → ciudad del catálogo |
| /api/admin/noticias | GET | Administrador | Noticias para moderar (`estado`, `tipo`) |
| /api/admin/noticias/{id}/estado | PUT | Administrador | OCULTA, PUBLICADA o ELIMINADA |
| /api/admin/noticias/{id} | DELETE | Administrador | Borrado lógico |
| /api/admin/usuarios | GET | Administrador | Cuentas registradas |
| /api/admin/usuarios/{id} | PUT | Administrador | `activo`, `rol`, `nivel` |

## Arquitectura

- `dominio/`: modelos, reglas (límite diario, niveles, recomendación, avisos por ciudad) y
  puertos. Java puro.
- `aplicacion/`: casos de uso. Java puro (sin anotaciones de Spring).
- `infraestructura/`: Spring: controladores, JPA, seguridad JWT, adaptadores de Google Maps
  y Nominatim, y `CasosDeUsoConfiguracion`, que arma los casos de uso.
- `ArquitecturaHexagonalTest` (ArchUnit) falla si el dominio o los casos de uso importan Spring.

## Pruebas

`.mvnw.cmd test` — no usa tu PostgreSQL: las pruebas de endpoints corren sobre un PostgreSQL
embebido con las mismas migraciones.
