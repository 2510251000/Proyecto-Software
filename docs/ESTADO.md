# Estado del proyecto — rama `feature/completar-app`

Se actualiza a medida que avanza el trabajo, para poder retomarlo si la sesión se corta.
Leyenda: ✅ hecho · 🔄 en curso · ⬜ falta

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
