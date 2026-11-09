# Estado del proyecto — rama `feature/completar-app`

Se actualiza a medida que avanza el trabajo, para poder retomarlo si la sesión se corta.
Leyenda: ✅ hecho · 🔄 en curso · ⬜ falta

## Seis fases nuevas (desde 2026-11-04, Claude Code en modo autónomo)

Cada fase va en su rama; cada rama sale de la anterior. Nada está subido: Sebas prueba y sube.

| Fase | Rama | Estado |
|---|---|---|
| 1. Entrada con atardecer y «Hoy» tipo historias | `feature/entrada-e-historias` | ✅ |
| 2. Imágenes en las noticias (MF02_003) | `feature/imagenes-noticias` | ✅ |
| 3. Comentarios, calificaciones y reportes (MF03) | `feature/interaccion` | ✅ |
| 4. Propuesta de la regla de niveles (MF04_001) | `feature/interaccion` | ✅ propuesta en `docs/PROPUESTA-NIVELES.md` (sin programar: decide el equipo) |
| 5. Mapa de noticias (MF05_002) | `feature/mapa` | ✅ |
| 6. Pendientes técnicos | `fix/pendientes-tecnicos` | ✅ |

### Fase 1 — qué quedó
- **Login**: cielo de noche a pantalla completa con la tarjeta al centro. La primera vez de cada
  sesión del navegador corre la entrada de 4.8 s (el sol sale, se oculta tras las tres barras del
  isotipo, salen las estrellas y aparece la tarjeta), con botón «Saltar». Al entrar, amanece
  (1.6 s) y se abre «Hoy». Formulario, validación, errores y avisos siguen igual.
- **Hoy** (`/hoy`, en el menú antes de «Portada»): saludo según la hora con el nombre, el
  municipio letra por letra, y las noticias de hoy del municipio como historias de 5 s (barra de
  progreso, foto que se acerca, titular palabra por palabra, toques a los lados, flechas,
  barra espaciadora o botón para pausar, mantener presionado en el celular). Al final, «Ya estás
  al día en…» con «Cerca de ti» (otros municipios).
- Con «reducir movimiento» no hay animaciones ni avance automático.
- Verificación: `ng test` 244 pruebas (32 archivos), `ng lint` limpio, `ng build` sin avisos;
  `mvnw verify` en verde (el backend no cambió). Revisado en Edge a 1366 px y a 390 px.

### Fase 2 — qué quedó
- **Backend**: `POST /api/noticias` acepta además `multipart/form-data` (parte `datos` con el
  mismo JSON y hasta 4 partes `imagenes`); el JSON solo sigue igual. Cada foto se valida por sus
  primeros bytes (JPEG, PNG o WebP), por peso y por dimensiones, y se guarda **sin metadatos**
  (JPEG y PNG se vuelven a codificar; a WebP se le quitan los bloques EXIF y XMP). Los archivos
  van al puerto `AlmacenImagenesPuerto`: adaptador S3 (bucket privado; en Docker, SeaweedFS en
  el servicio `s3`; en producción, AWS S3 o R2) o adaptador en disco para trabajar sin Docker
  (`IMAGENES_ALMACEN`). Si la base falla, se borran los archivos ya guardados.
  `GET /api/noticias/{id}/imagenes/{orden}` las sirve con `Cache-Control`; si la noticia no está
  publicada solo la ven su autor y los administradores. `NoticiaResponseDTO.imagenes`.
  Migración `V4__imagenes_noticia.sql` (descripción de la foto y orden único por noticia).
- **Frontend**: `selector-imagenes` en Publicar con «Tomar foto» (cámara del celular), «Elegir
  fotos», arrastrar y soltar y Ctrl+V; vista previa, quitar, reordenar (la primera es la
  portada) y «Describe la foto». Cada foto se reduce en el navegador (1600 px, JPEG 0.82, sin
  EXIF, respetando la rotación) y se sube con barra de progreso. Las fotos reales se ven en la
  portada, la apertura, el detalle (con galería), las historias de «Hoy» y la moderación.
- `README.md`: cómo probar desde el celular en la misma Wi-Fi (ambiente `red`, sin IP escrita).
- Verificación: `mvnw verify` 124 pruebas; `ng test` 270 pruebas (35 archivos); lint y build
  limpios. Revisado en Edge (Publicar con fotos a 1280 y 390 px, detalle con galería).

### Fase 3 — qué quedó
- **Comentarios**: `GET /api/noticias/{id}/comentarios` (público), `POST` con sesión (1 a 1000
  caracteres), `DELETE …/comentarios/{id}` (su autor o un administrador). Aviso `COMENTARIO` al
  autor de la noticia e historial `COMENTARIO`.
- **Calificaciones**: `PUT /api/noticias/{id}/calificacion` con `valor` de 1 a 5; una por usuario
  (si ya calificó, se cambia); el autor no puede calificarse (403). `NoticiaResponseDTO` trae
  `promedio`, `cantidadCalificaciones`, `miCalificacion` y `autorId`. Aviso `CALIFICACION` (solo la
  primera vez) e historial.
- **Reportes**: `POST /api/noticias/{id}/reportes` (motivo y descripción opcional; repetir → 409),
  `GET /api/admin/reportes?estado=` y `PUT /api/admin/reportes/{id}` (REVISADO o DESCARTADO).
  Historial `REPORTE`.
- **Frontend**: en el detalle, estrellas (grupo de radios), comentarios con su formulario y botón
  «Reportar» con diálogo de motivos. En Administración, pestaña «Reportes» que también oculta la
  noticia reportada con la moderación de siempre.
- No hizo falta migración: las tablas `comentario`, `calificacion` y `reporte` ya existían en V1.
- Verificación: `mvnw verify` 142 pruebas; `ng test` 292 (37 archivos); lint y build limpios.

### Fase 5 — qué quedó
- Ruta `mapa` (en el menú, después de «Portada») con Leaflet y teselas de OpenStreetMap: un
  marcador por noticia con latitud y longitud (azul con borde ámbar si es oficial, blanco con
  borde azul si es de la comunidad), centrado en la ciudad del usuario, filtro por tipo y una
  ventanita con el titular y el enlace. Debajo, la misma lista en texto.
- El modelo `Noticia` del frontend ganó `latitud` y `longitud` (el backend ya las enviaba).
- Verificación: `ng test` 303 (38 archivos), lint y build limpios. Revisado en Edge.

### Fase 6 — qué quedó
- **Logs** solo por consola (factor XI): nivel de `com.aldia` con `NIVEL_LOGS` y del resto con
  `NIVEL_LOGS_GENERAL`; formato con fecha, nivel, hilo y clase. Ningún log escribe contraseñas,
  tokens ni la clave de Google (el adaptador de Google solo registra el tipo de error).
- **Historial**: el registro (`REGISTRO`) y cada inicio de sesión correcto (`INICIO_SESION`).
- **Spring Boot 3.3.4 → 3.5.16** y springdoc 2.6.0 → 2.8.17. Prueba nueva de `/v3/api-docs`.
- **Frontend**: `npm audit fix` (sin `--force`): de 33 riesgos a 22 (ver `PENDIENTES.md`).
- **SonarQube** también corre en los push a `pre`.
- **12 factores**: `server.shutdown: graceful` y `TIEMPO_APAGADO`.
- **Postman**: `backend/postman/AlDia.postman_collection.json` con los 28 endpoints (29
  peticiones), token por variable y los ids que se guardan solos.
- Verificación: `mvnw verify` 144 pruebas; `ng test` 303; lint y build limpios.

## Punto de partida (2026-10-18)

- `dev` (`cbe2b4b`): registro, login con JWT, listado de noticias y diseño «Amanecer».
- Integrado en esta rama, sin tocar las ramas originales:
  - PR #5 de David (`origin/feature/publicar-noticias`): `POST /api/noticias` con límite
    diario, `GET /api/noticias/{id}` e historial.
  - Dos commits locales de Sebastián (`fix/esquema-notificacion`): README de la raíz,
    `database/03-datos-prueba.sql`, `iniciar-dev.ps1`, modelo ER y la columna
    `notificacion.noticia_id` con el tipo `CERCANIA`.

## Requisitos

> Todo lo de la columna «Ahora» quedó hecho y verificado el 2026-10-18 (ver «Verificación»).

## Avance
- ✅ Bloque 1: backend (Flyway, yml, dominio, casos de uso, endpoints, geocodificación)
- ✅ Bloque 2: pruebas del backend — 89 en verde (`backend/mvnw test`)
- ✅ Bloque 3: frontend — 180 pruebas en verde, lint y build de producción limpios
- ✅ Bloque 4: verificación de punta a punta y documentación

### Usuarios y acceso
| Requisito | Antes | Ahora |
|---|---|---|
| Registro e inicio de sesión | ✅ | ✅ registro pide además nombre y ciudad |
| Roles usuario común y administrador | ✅ (rol en el token) | ✅ panel y endpoints de admin protegidos |
| Niveles 1 a 3 | ⚠️ tabla `nivel`, sin regla de ascenso | ✅ regla por puntaje, configurable |
| Nivel 1: máximo 3 noticias al día | ✅ (PR #5) | ✅ |
| Niveles altos publican más y se recomiendan más | ⚠️ solo el límite | ✅ orden «recomendadas» con ventaja por nivel |

### Noticias
| Requisito | Antes | Ahora |
|---|---|---|
| Oficiales (admin) y comunitarias (usuarios) | ✅ (PR #5) | ✅ |
| Listado y detalle | ✅ | ✅ |
| Filtros (oficial/comunitaria, ciudad) | ⚠️ solo en el navegador | ✅ en la API y en la portada |
| Búsqueda | ⬜ | ✅ |
| Publicar desde la app mostrando el cupo del día | ⬜ | ✅ |
| Moderación: ocultar / borrar comunitarias | ⬜ | ✅ |
| Gestión de usuarios | ⬜ | ✅ activar/desactivar, rol y nivel |

### Ubicación y notificaciones
| Requisito | Antes | Ahora |
|---|---|---|
| Usuario y noticia con ciudad | ⚠️ noticia sí; usuario sin ciudad al registrarse | ✅ |
| Notificación a usuarios de la misma ciudad | ⬜ (solo la tabla) | ✅ |
| Ciudad obtenida con la API externa (llamada real) | ⬜ | ✅ Google Maps Geocoding o Nominatim |
| Adaptador gratuito sin clave, elegible por configuración | ⬜ | ✅ `GEO_PROVEEDOR` |

### Reglas técnicas
| Requisito | Antes | Ahora |
|---|---|---|
| Hexagonal: dominio y casos de uso sin frameworks | ⚠️ casos de uso con `@Service`/`@Transactional` | ✅ beans declarados en infraestructura; prueba ArchUnit |
| Angular estricto, sin `any` | ✅ | ✅ |
| PostgreSQL con migraciones versionadas | ⚠️ scripts sueltos | ✅ Flyway |
| Nada quemado; `application.yml` + environments | ⚠️ `.properties` | ✅ `application.yml` |
| `.env.example` completo, `.env` ignorado | ⚠️ | ✅ |

### Diseño (se sigue el estilo «Amanecer» ya definido)
| Pantalla | Antes | Ahora |
|---|---|---|
| Inicio con noticias | ✅ | ✅ + búsqueda y filtro por tipo |
| Detalle | ✅ | ✅ pide la noticia a la API si no está en memoria |
| Publicar (con cupo restante) | ⬜ | ✅ |
| Perfil con nivel | ⬜ | ✅ |
| Notificaciones | ⬜ | ✅ |
| Login y registro | ✅ | ✅ |
| Panel de administración | ⬜ | ✅ |

### Calidad
| Requisito | Estado |
|---|---|
| Pruebas de dominio (límite, niveles, notificaciones por ciudad) | ✅ |
| Pruebas de endpoints (sin la contraseña de PostgreSQL: base embebida) | ✅ |
| Pruebas básicas del frontend | ✅ |
| Datos de demo (admin, usuarios de varios niveles y ciudades, noticias) | ✅ |
| Compilar, probar y recorrer la app completa | ✅ ver «Verificación» |

## Verificación (2026-10-18)
- Backend: `mvnw test` → 89 pruebas, 0 fallos.
- Frontend: `ng test` → 180 pruebas en 26 archivos, 0 fallos; `ng lint` sin errores; `ng build` sin avisos.
- App completa levantada (backend :8080 contra la base nueva `aldia_verificacion`, frontend :4200)
  y recorrida con Edge automatizado:
  1. Registro con «Usar mi ubicación» → Nominatim real devolvió Fusagasugá, Cundinamarca.
  2. Portada con búsqueda «feria».
  3. Publicar: «Te quedan 3 de 3 publicaciones hoy» → noticia publicada.
  4. `vecina@aldia.com` (Fusagasugá) recibió la notificación; `lector@aldia.com` (Zipaquirá) no.
  5. `admin@aldia.com` ocultó la noticia (el público recibe 404, el autor recibe aviso de moderación).
  6. Celular (390 px): sin desplazamiento horizontal.
- Capturas en `docs/capturas/`.

## Bitácora
- Ver `git log --oneline origin/dev..feature/completar-app`.
