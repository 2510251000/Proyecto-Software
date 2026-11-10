# Pruebas manuales — fases 1 a 6

Lista de chequeo para probar a mano lo que se hizo en las ramas
`feature/entrada-e-historias` → `feature/imagenes-noticias` → `feature/interaccion` →
`feature/mapa` → `fix/pendientes-tecnicos` (cada una contiene a la anterior: basta con probar
la última, `fix/pendientes-tecnicos`).

**Cómo levantar todo:** backend con `cd backend; .\mvnw.cmd spring-boot:run` y frontend con
`cd frontend; npx ng serve` → http://localhost:4200. La primera vez que el backend arranque,
Flyway aplica la migración nueva `V4` (fotos), sin borrar nada.

**Cuentas** (datos de demostración):

| Cuenta | Contraseña | Rol | Municipio |
|---|---|---|---|
| `admin@aldia.com` | `Admin12345` | Administrador | Fusagasugá |
| `vecina@aldia.com` | `Usuario12345` | Usuario nivel 1 | Fusagasugá |
| `activo@aldia.com` | `Usuario12345` | Usuario nivel 2 | Fusagasugá |
| `corresponsal@aldia.com` | `Usuario12345` | Usuario nivel 3 | Soacha |
| `lector@aldia.com` | `Usuario12345` | Usuario nivel 1 | Zipaquirá |

Marca cada casilla en **computador (PC)** y en **celular (📱)**. Para el celular sigue
«Probar desde el celular» del `README.md`.

---

## Fase 1 — Entrada con atardecer y «Hoy»

> Ya no aplica desde el 2026-11-09: ver «Cambios del 2026-11-09» al final.

| # | PC | 📱 | Cuenta | Pasos | Resultado esperado |
|---|---|---|---|---|---|
| 1.1 | ☐ | ☐ | — | Abre una ventana nueva del navegador y entra a `/login`. | Corre la entrada de unos 5 s: cielo azul que se vuelve naranja y morado, el sol sale y se oculta tras tres barras blancas, «Al Día» y el lema en blanco, salen estrellas y aparece la tarjeta del login. El texto nunca queda encima del sol. |
| 1.2 | ☐ | ☐ | — | Recarga `/login` en la misma ventana. | La entrada **no** se repite: se ve de una vez el cielo de noche con la tarjeta. |
| 1.3 | ☐ | ☐ | — | En una ventana de incógnito nueva, abre `/login` y toca «Saltar» (abajo a la derecha). | Se ve de una vez el formulario. |
| 1.4 | ☐ | ☐ | `vecina@aldia.com` | Escribe una contraseña equivocada. | Sale el error de credenciales como antes; no amanece. |
| 1.5 | ☐ | ☐ | `vecina@aldia.com` | Inicia sesión bien. | Amanece (el cielo se aclara y sube un sol) y se abre «Hoy». |
| 1.6 | ☐ | ☐ | `vecina@aldia.com` | Mira la intro de «Hoy». | «Buenos días / Buenas tardes / Buenas noches, Laura» según la hora; «Fusagasugá» entra letra por letra; abajo, medio sol. Al rato empiezan las historias (o toca «Ver las noticias»). |
| 1.7 | ☐ | ☐ | `vecina@aldia.com` | Deja correr las historias. | Cada una dura unos 5 s; la barra de arriba se llena; la foto se acerca despacio; el titular entra palabra por palabra; chip con iniciales, autor, nivel y hace cuánto. |
| 1.8 | ☐ | — | `vecina@aldia.com` | En el PC usa ← y →, y la barra espaciadora. Toca un titular de la lista de la izquierda. | Las flechas cambian de historia; espacio pausa y reanuda (se detienen la barra y la foto); el titular tocado se abre. A la derecha se ve «Sigue». |
| 1.9 | — | ☐ | `vecina@aldia.com` | En el celular toca el borde izquierdo, luego la derecha; mantén el dedo presionado. | Izquierda: anterior; derecha: siguiente; presionado: pausa y al soltar sigue. La historia ocupa toda la pantalla. |
| 1.10 | ☐ | ☐ | `vecina@aldia.com` | Pasa la última historia. | Tarjeta clara «Ya estás al día en Fusagasugá», «Cerca de ti» con noticias de otros municipios, «Ver otra vez» e «Ir a la portada». La X de arriba también lleva a la portada. |
| 1.11 | ☐ | ☐ | `lector@aldia.com` | Abre «Hoy» un día en que Zipaquirá no tiene noticias de hoy. | Dice «No hay noticias de hoy. Estas son las más recientes». |
| 1.12 | ☐ | ☐ | cualquiera | Activa «reducir movimiento» en el sistema (Windows: Configuración › Accesibilidad › Efectos visuales › Efectos de animación: desactivado). Entra de nuevo. | Sin animaciones: no hay entrada en el login, y en «Hoy» las historias no avanzan solas (se cambian a mano). |
| 1.13 | ☐ | ☐ | cualquiera | Mira el menú. | Aparece «Hoy» antes de «Portada». |

## Fase 2 — Fotos en las noticias (HU MF02_003)

| # | PC | 📱 | Cuenta | Pasos | Resultado esperado |
|---|---|---|---|---|---|
| 2.1 | — | ☐ | `activo@aldia.com` | En Publicar toca **«Tomar foto»**, toma una foto, completa titular y noticia, y publica. | Se abre la cámara trasera; la foto aparece en la vista previa con «Portada»; se ve la barra «Subiendo … %»; se abre la noticia con la foto. Si el celular estaba de lado, la foto sale derecha. |
| 2.2 | — | ☐ | `activo@aldia.com` | Toca **«Elegir fotos»** y elige 2 de la galería. | Se agregan las dos. |
| 2.3 | ☐ | — | `activo@aldia.com` | En el PC: «Elegir fotos» con 2 archivos; luego **arrastra** otra foto al recuadro; luego copia una imagen y pégala con **Ctrl+V**. | Las tres formas agregan la foto. |
| 2.4 | ☐ | ☐ | `activo@aldia.com` | Usa ← → para cambiar el orden, quita una con «Quitar» y escribe «Describe la foto». | La primera siempre dice «Portada». La descripción queda como texto alternativo. |
| 2.5 | ☐ | ☐ | `activo@aldia.com` | Publica con 2 o más fotos y abre la noticia. | La portada arriba y las demás en la galería «Más fotos». En la portada del sitio, la tarjeta usa la foto real. Abre «Hoy»: la historia muestra la foto real. |
| 2.6 | ☐ | ☐ | `activo@aldia.com` | Intenta agregar **5 fotos**. | Solo quedan 4 y dice «Puedes subir máximo 4 fotos por noticia». |
| 2.7 | ☐ | ☐ | `activo@aldia.com` | Elige un **PDF** o un archivo que no sea imagen. | Dice que «no es una foto» y no se agrega. |
| 2.8 | ☐ | — | `admin@aldia.com` | Con Postman («Publicar con fotos»), sube una foto de **más de 5 MB**. | Responde 413 «Las fotos son muy pesadas: cada una puede pesar máximo 5 MB». (Desde la app no pasa: la app reduce la foto antes de subirla.) |
| 2.9 | ☐ | — | `admin@aldia.com` | Con Postman, sube un `.txt` renombrado a `.jpg`. | Responde 400 «La foto «x.jpg» no es una imagen JPEG, PNG o WebP». |
| 2.10 | ☐ | — | — | Descarga una foto publicada (clic derecho › Guardar) y mira sus propiedades (Detalles) o súbela a un lector de EXIF. | No tiene ubicación GPS ni datos de la cámara. |
| 2.11 | ☐ | ☐ | `admin@aldia.com` | En Administración › Noticias, oculta una noticia con foto. | La fila muestra la miniatura de la foto. Sin sesión, `http://localhost:8080/api/noticias/{id}/imagenes/1` responde 404. |
| 2.12 | — | ☐ | — | Con un iPhone en formato HEIC, elige una foto. | Se agrega (Safari la convierte) o sale un mensaje claro de cómo cambiarla a JPEG. |

## Fase 3 — Comentarios, calificaciones y reportes (HU MF03_001 a MF03_003)

| # | PC | 📱 | Cuenta | Pasos | Resultado esperado |
|---|---|---|---|---|---|
| 3.1 | ☐ | ☐ | `lector@aldia.com` | Abre una noticia de otra persona y escribe un comentario. | Aparece en la lista con tu nombre, nivel y «hace un momento». |
| 3.2 | ☐ | ☐ | `lector@aldia.com` | Intenta comentar vacío o con más de 1000 caracteres. | Muestra el error y no lo envía. |
| 3.3 | ☐ | ☐ | autor de esa noticia | Entra a Notificaciones. | Tiene el aviso «… comentó tu noticia …». |
| 3.4 | ☐ | ☐ | `lector@aldia.com` y `admin@aldia.com` | Borra tu comentario; luego, como admin, borra el de otra persona. | Ambos pueden; un usuario no ve «Borrar» en comentarios ajenos. |
| 3.5 | ☐ | ☐ | `lector@aldia.com` | Califica con 4 estrellas; luego cambia a 2. Con teclado: Tab hasta las estrellas y flechas. | El promedio y la cantidad se actualizan; cambiar no suma otra calificación. Las flechas mueven la selección. |
| 3.6 | ☐ | ☐ | autor de la noticia | Abre tu propia noticia. | Las estrellas están desactivadas y dice «No puedes calificar tu propia noticia». Tienes el aviso de la primera calificación. |
| 3.7 | ☐ | ☐ | `lector@aldia.com` | Toca «Reportar», elige «Es una noticia falsa», escribe un detalle y envía. | Se cierra el diálogo y dice «Gracias…». Si vuelves a entrar y reportas otra vez, dice «Ya reportaste esta noticia». |
| 3.8 | ☐ | ☐ | `admin@aldia.com` | Administración › **Reportes**. | Aparece el reporte pendiente con motivo, detalle y quién reportó. «Marcar revisado» y «Descartar» lo sacan de los pendientes; «Ocultar la noticia» la oculta y marca el reporte como revisado. |

## Fase 4 — Regla de niveles (propuesta)

| # | Qué hacer | Resultado esperado |
|---|---|---|
| 4.1 | Leer `docs/PROPUESTA-NIVELES.md` con el equipo. | Decidir si se aprueba, con qué valores y si se recalculan los puntajes. No hay nada que probar en la app. |

## Fase 5 — Mapa de noticias (HU MF05_002)

| # | PC | 📱 | Cuenta | Pasos | Resultado esperado |
|---|---|---|---|---|---|
| 5.1 | ☐ | ☐ | `vecina@aldia.com` | Toca «Mapa» en el menú. | El mapa sale centrado en Fusagasugá, con la atribución «© OpenStreetMap». |
| 5.2 | ☐ | ☐ | `vecina@aldia.com` | Mira los marcadores. | Oficiales: azul con borde ámbar; comunidad: blanco con borde azul. |
| 5.3 | ☐ | ☐ | `vecina@aldia.com` | Toca un marcador y luego «Leer la noticia». | Sale la ventanita con el titular; el enlace abre la noticia sin recargar. |
| 5.4 | ☐ | ☐ | `vecina@aldia.com` | Cambia «Tipo de noticia» a Oficiales y a Comunidad. | Cambian los marcadores y la lista en texto de abajo. |
| 5.5 | ☐ | — | `vecina@aldia.com` | Con teclado: Tab hasta el mapa y los marcadores; Enter. | Los marcadores se pueden enfocar y abren su ventanita. La lista de abajo tiene los mismos enlaces. |
| 5.6 | ☐ | ☐ | `lector@aldia.com` | Abre el mapa. | Centrado en Zipaquirá si esa ciudad tiene coordenadas en el catálogo; si no, la vista general de Cundinamarca. |

## Fase 6 — Pendientes técnicos

| # | Qué hacer | Resultado esperado |
|---|---|---|
| 6.1 | Arranca el backend y mira la consola. | Las líneas tienen fecha, nivel, hilo y clase. No se crea ningún archivo de logs nuevo. |
| 6.2 | Arranca con `NIVEL_LOGS=DEBUG` en `backend/.env`. | Salen más mensajes de `com.aldia`. |
| 6.3 | Regístrate y luego inicia sesión. En pgAdmin: `SELECT accion, fecha FROM historial ORDER BY id DESC LIMIT 5;` | Aparecen `INICIO_SESION` y `REGISTRO` de tu cuenta. |
| 6.4 | Abre http://localhost:8080/swagger-ui.html. | Carga y muestra los endpoints nuevos (comentarios, calificación, reportes, fotos). |
| 6.5 | Importa `backend/postman/AlDia.postman_collection.json` en Postman. Corre «Iniciar sesión (usuario)» y «Iniciar sesión (administrador)», luego las demás. | Los tokens se guardan solos; las peticiones de «Administración» usan el token del admin. |
| 6.6 | Detén el backend con Ctrl+C mientras publicas una noticia con fotos. | La petición en curso termina antes de que se apague (apagado ordenado). |
| 6.7 | Haz push de la rama a GitHub cuando la apruebes y abre el PR. | El análisis de SonarQube corre; al llegar a `pre` también corre en el push. |

## Cambios del 2026-11-09 — Login con noticias y calificar al autor

| # | PC | 📱 | Cuenta | Pasos | Resultado esperado |
|---|---|---|---|---|---|
| 7.1 | ☐ | ☐ | — | Entra a `/login`. | De fondo, un muro de recortes de periódico difuminado (se leen secciones y titulares); al centro, el logo grande «Al Día», el lema y la tarjeta del login. |
| 7.2 | ☐ | ☐ | `vecina@aldia.com` | Inicia sesión bien. | Se abre la portada directamente. No existe «Hoy» en el menú ni en la barra inferior. |
| 7.3 | ☐ | ☐ | `lector@aldia.com` | Abre una noticia de otra persona y toca «Sigue publicando así»; luego «No me gustó esto». | El botón elegido queda marcado; la aprobación del autor se actualiza (por ejemplo «100 % de aprobación (1 voto)» y luego «0 %…»); cambiar no suma otro voto. |
| 7.4 | ☐ | ☐ | autor de esa noticia | Abre tu propia noticia y tus avisos. | No hay botones: dice que es tu noticia. Tienes el aviso del primer voto («… quiere que sigas publicando así…»). |
| 7.5 | ☐ | ☐ | autor de esa noticia | Abre «Mi perfil» y la portada. | En el perfil, «Lo que opinan los lectores: N % de aprobación (M votos)». En las tarjetas grandes de tus noticias, la misma aprobación con una mano arriba. Tus puntos no cambiaron. |
