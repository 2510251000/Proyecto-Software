# Base de datos — Al Día: Portal de Noticias

PostgreSQL 14 o superior. Base de datos: `aldia_db` (el mismo nombre que usa el backend).

## ⚠️ Advertencia

**`01-schema.sql` borra todas las tablas (`DROP TABLE ... CASCADE`) y todos sus datos
antes de crearlas de nuevo.** Es solo para uso local, en tu propio computador. Nunca lo
ejecutes contra las bases de datos de PRE o PROD.

## Contenido

| Archivo | Qué hace |
|---|---|
| `01-schema.sql` | Crea las diez tablas, llaves, restricciones e índices |
| `02-datos-iniciales.sql` | Llena los catálogos `nivel` y `ciudad` |

## Crear la base de datos desde cero

Todos los comandos se ejecutan **desde la carpeta `database/`** (`cd database`), porque
usan rutas relativas a los archivos `.sql`.

1. Crear la base (una sola vez):

   ```
   psql -U postgres -c "CREATE DATABASE aldia_db;"
   ```

2. Crear las tablas:

   ```
   psql -U postgres -d aldia_db -f 01-schema.sql
   ```

3. Cargar los datos iniciales:

   ```
   psql -U postgres -d aldia_db -f 02-datos-iniciales.sql
   ```

Los scripts se ejecutan **en ese orden**. Para reiniciar todo, repite los pasos 2 y 3.

## Notas de diseño

- **Nombres al estilo JPA/Hibernate**, para que coincidan con las entidades del backend
  sin anotaciones extra: llave primaria `id`, llaves foráneas `<tabla>_id`
  (`usuario_id`, `noticia_id`, `ciudad_id`, `nivel_id`) y campos en `snake_case`
  (`contrasenaCifrada` en Java → `contrasena_cifrada` en la base).
- **`nivel` y `ciudad` son datos, no código.** Los niveles con sus puntajes y límites
  diarios viven en la tabla `nivel`.
- **`usuario.nivel_id` tiene `DEFAULT 1`.** Depende de que `02-datos-iniciales.sql`
  inserte `Básico` primero. No cambies el orden de esos `INSERT`.
- **Las cuentas no se borran**, se desactivan con `usuario.activo = FALSE`. Por eso
  `noticia → usuario` usa `ON DELETE RESTRICT`.
- **Límite diario de publicaciones:** se calcula contando las noticias del usuario con
  `noticia.fecha_publicacion` de hoy, contra `nivel.limite_noticias_diarias`.
- **Google Maps:** `noticia` guarda solo `latitud`, `longitud` e `id_lugar_google`.
  Nunca se almacenan mapas ni contenido de Google.
