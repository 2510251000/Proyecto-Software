# Base de datos — Al Día: Portal de Noticias

PostgreSQL 14 o superior. Base de datos: `aldia_db`.

## Dónde está el esquema ahora

El esquema vive en **migraciones versionadas de Flyway** dentro del backend, y el backend las
aplica solo al arrancar:

| Archivo | Qué hace | Antes era |
|---|---|---|
| `backend/src/main/resources/db/migration/V1__esquema_inicial.sql` | Las diez tablas, llaves, restricciones e índices | `01-schema.sql` |
| `backend/src/main/resources/db/migration/V2__catalogos.sql` | Catálogos `nivel` y `ciudad` | `02-datos-iniciales.sql` |
| `backend/src/main/resources/db/migration/V3__ubicacion_niveles_notificaciones.sql` | Coordenadas e id de lugar en `ciudad`, `nivel.numero`, `notificacion.noticia_id` y tipos nuevos | — |
| `backend/src/main/resources/db/demo/R__datos_demo.sql` | Cuentas y noticias de demostración (solo perfil `dev`) | `03-datos-prueba.sql` |

## Crear la base desde cero

Solo hay que crear la base vacía; el backend hace el resto:

```
psql -U postgres -c "CREATE DATABASE aldia_db;"
```

Flyway guarda en la tabla `flyway_schema_history` qué migraciones ya aplicó. **Nunca se edita
una migración ya aplicada**: los cambios van en una nueva (`V4__...sql`).

Una base creada antes con los scripts sueltos se marca en la versión 2 y solo recibe V3.

## Notas de diseño

- **Nombres al estilo JPA/Hibernate**: llave primaria `id`, llaves foráneas `<tabla>_id` y
  campos en `snake_case`.
- **`nivel` y `ciudad` son datos, no código.** Los niveles con sus puntajes y límites diarios
  viven en la tabla `nivel`. Las ciudades nuevas llegan desde la API de mapas.
- **Las cuentas no se borran**, se desactivan con `usuario.activo = FALSE`.
- **Límite diario de publicaciones:** se calcula contando las noticias del usuario con
  `noticia.fecha_publicacion` de hoy, contra `nivel.limite_noticias_diarias`.
- **Ubicación:** `noticia` y `ciudad` guardan solo latitud, longitud y el id del lugar que
  devuelve la API (Google Maps o Nominatim). Nunca se guardan mapas ni contenido del proveedor.
