# Decisiones tomadas al completar la app

Rama `feature/completar-app`. Cada decisión dice qué se eligió, por qué, y cómo cambiarla.

## Integración del trabajo existente
1. **Se integró el PR #5 de David** (`origin/feature/publicar-noticias`, publicar con límite
   diario) con un merge a esta rama, y **dos commits locales de Sebastián**
   (`fix/esquema-notificacion`: README, datos de prueba, modelo ER y `notificacion.noticia_id`)
   con cherry-pick. Las ramas originales no se tocaron.
2. Se quitó `UsuarioActualResponseDTO`: lo reemplaza `PerfilResponseDTO`, que conserva sus
   mismos campos (`id`, `correo`, `rol`, `nivel`, `fechaRegistro`) y agrega los del perfil.

## Base de datos
3. **Migraciones con Flyway.** `database/01-schema.sql` y `02-datos-iniciales.sql` pasaron
   (con `git mv`, se conserva su historia) a `backend/src/main/resources/db/migration/V1` y `V2`,
   sin los `DROP TABLE`. Lo nuevo va en `V3`. El backend aplica las migraciones solo al arrancar.
4. **Bases que ya existían** (tu PostgreSQL de Windows y el volumen de Docker) se marcan en la
   versión 2 (`baseline-on-migrate`) y solo reciben V3, que está escrita con `IF NOT EXISTS`.
5. **Datos de demostración** como migración repetible (`db/demo/R__datos_demo.sql`, antes
   `03-datos-prueba.sql`). Solo se cargan en el perfil `dev`; no duplican nada ni borran lo que
   creen los usuarios. Para apagarlos: `FLYWAY_UBICACIONES=classpath:db/migration`.
6. Docker ya no monta `database/` en `docker-entrypoint-initdb.d`: el esquema lo crea Flyway.
7. `nivel.numero` (1, 2, 3) se agregó en V3 calculado por el orden de `puntaje_minimo`.
   `ciudad` ganó `latitud`, `longitud` e `id_lugar` (el id que da la API de mapas).

## Reglas del negocio (todas configurables en `application.yml` / `.env`)
8. **Regla para subir de nivel** (no estaba definida): cada noticia publicada suma
   **10 puntos** (`NIVEL_PUNTOS_PUBLICACION`); cada noticia que el administrador oculta o borra
   resta **20** (`NIVEL_PUNTOS_PENALIZACION`); si la vuelve a publicar, se devuelven. El nivel es
   el más alto cuyo `puntaje_minimo` (tabla `nivel`: 0, 50, 150) alcance el usuario. Con los
   valores por defecto: nivel 2 tras 5 noticias, nivel 3 tras 15. El nivel puede bajar.
   El administrador también puede fijar el nivel a mano (deja el puntaje en el mínimo del nivel).
9. **Límite diario**: el de la tabla `nivel` (3, 10, 30). Se cuenta por día calendario en
   `ZONA_HORARIA` (America/Bogota). **Los administradores no tienen límite**
   (`ADMIN_SIN_LIMITE_DIARIO=true`) porque publican información oficial.
10. **«Sus noticias se recomiendan más»**: el orden `RECOMENDADAS` adelanta cada noticia
    **12 horas por cada nivel del autor por encima del 1** (`RECOMENDACION_HORAS_POR_NIVEL`)
    y **6 horas si es oficial** (`RECOMENDACION_HORAS_OFICIAL`). La portada usa este orden.
11. **Notificaciones por ciudad**: al publicar, se avisa a todas las cuentas activas cuya ciudad
    es la de la noticia, menos al autor. También hay avisos de ascenso de nivel y de moderación.
    El navegador pregunta por avisos nuevos cada 30 s (`intervaloNotificacionesMs` en los
    `environment*.ts`); no se usaron WebSockets para no agregar infraestructura.
12. **Moderación**: «borrar» es un borrado lógico (estado `ELIMINADA`, no se puede recuperar);
    «ocultar» se puede deshacer. El panel arranca mostrando las comunitarias, pero el
    administrador también puede moderar las oficiales (sin efecto en puntos).
13. Un administrador no puede desactivarse ni quitarse el rol a sí mismo.

## Ubicación (API externa)
14. **Dos adaptadores** del puerto `GeocodificadorPuerto`: Google Maps Geocoding API y
    Nominatim (OpenStreetMap). `GEO_PROVEEDOR=auto` usa Google si hay `GOOGLE_MAPS_API_KEY`;
    si no, Nominatim. Hoy, sin clave en el `.env`, **funciona con Nominatim** (llamadas reales).
15. **El navegador nunca llama a la API de mapas**: llama al backend (`/api/ubicacion/...`) y el
    backend llama a la API. Así la clave de Google no llega al navegador.
16. **Política de Nominatim**: User-Agent propio (`NOMINATIM_AGENTE`), máximo 1 petición por
    segundo (`NOMINATIM_INTERVALO_MS=1100`), caché en memoria de las respuestas, y nada de
    autocompletar: solo se consulta al presionar «Buscar» o «Usar mi ubicación».
17. **Cómo se obtiene la ciudad**: con el GPS del navegador (coordenadas → geocodificación
    inversa a nivel de municipio) o buscando el municipio por nombre. El resultado se guarda en
    el catálogo `ciudad` (o se reutiliza si ya estaba). Si la API no responde, el selector deja
    elegir entre los municipios ya registrados para no bloquear el registro.
18. El registro **pide ciudad** (obligatoria); el nombre es opcional.
19. Al publicar, la noticia toma la ciudad del perfil (se puede cambiar) y las coordenadas
    que la API dio para esa ciudad.

## Arquitectura y calidad
20. **Casos de uso sin Spring**: se quitaron `@Service` y `@Transactional` de `aplicacion/`. Los
    beans se arman en `infraestructura/configuracion/CasosDeUsoConfiguracion.java` y las
    transacciones pasan por el puerto `EjecutorTransaccionalPuerto`. Una prueba con ArchUnit
    falla si el dominio o los casos de uso importan Spring, JPA o Jackson.
21. `application.properties` pasó a `application.yml` con los mismos valores; `show-sql` quedó
    apagado por defecto (`MOSTRAR_SQL=true` para verlo).
22. **Pruebas de endpoints sin tu contraseña**: usan PostgreSQL embebido (io.zonky) que se
    descarga con Maven y corre solo durante la prueba; la API de mapas se reemplaza por una falsa.
23. En el frontend, las pruebas solo toman `*.spec.ts` (`angular.json`), así
    `environment.test.ts` ya no aparece como «archivo fallido».
24. Diseño: se siguió el estilo «Amanecer» ya definido en el proyecto (banda azul, Source Serif 4
    y Manrope, papel blanco con filetes). El menú principal va sobre la banda azul en todas las
    pantallas con sesión.
25. **SonarQube Cloud** (gratis porque el repositorio es público) en lugar de un SonarQube
    local: el análisis corre solo en GitHub Actions y todo el equipo ve el mismo informe. Backend
    y frontend van en un solo proyecto de Sonar con el escáner genérico
    (`sonar-project.properties`). La cobertura sale de JaCoCo (backend) y de
    `@vitest/coverage-v8` en formato lcov (frontend). Quedan fuera de la cobertura el arranque, la
    configuración, los DTO y las entidades JPA, que no tienen lógica propia.

## Principios SOLID
25. El backend sigue la arquitectura hexagonal, que es la aplicación directa de SOLID. Rutas
    relativas a `backend/src/main/java/com/aldia/`.
    - **S — Responsabilidad única.** Cada caso de uso es una clase (`aplicacion/servicio/`:
      `PublicarNoticiaServicio`, `ModerarNoticiaServicio`, `GestionarUsuariosServicio`,
      `UbicacionServicio`…) y cada regla del negocio vive en un solo lugar del dominio
      (`dominio/servicio/`): `ReglaLimiteDiario` (cupo del día), `CalculadoraNivel` (subir de
      nivel), `PoliticaRecomendacion` (orden de la portada) y `AvisosPorCiudad` (a quién se
      notifica). En el frontend, las llamadas HTTP solo están en `core/services/`; los
      componentes solo muestran datos.
    - **O — Abierto/cerrado.** La ubicación pasa por la interfaz
      `dominio/puerto/salida/GeocodificadorPuerto`. Agregar un proveedor de mapas es escribir un
      adaptador nuevo en `infraestructura/geocodificacion/` sin tocar los casos de uso (así
      entraron Google Maps y Nominatim). Los niveles, límites y puntos son datos (tabla `nivel`)
      y configuración (`application.yml`), no código.
    - **L — Sustitución de Liskov.** `GoogleMapsGeocodificadorAdaptador` y
      `NominatimGeocodificadorAdaptador` cumplen el mismo contrato y son intercambiables
      (`GeocodificacionConfiguracion` elige uno con `GEO_PROVEEDOR`). Las pruebas de endpoints
      (`ApiIntegracionTest`) usan un geocodificador falso y todo funciona igual.
    - **I — Segregación de interfaces.** Puertos pequeños: uno por caso de uso de entrada
      (`dominio/puerto/entrada/`, por ejemplo `ListarNoticiasCasoDeUso`,
      `ModerarNoticiaCasoDeUso`) y uno por necesidad de salida (`dominio/puerto/salida/`:
      `NoticiaRepositorioPuerto`, `CifradorPuerto`, `TokenPuerto`…). Ningún caso de uso depende
      de métodos que no usa.
    - **D — Inversión de dependencias.** Los casos de uso dependen solo de puertos
      (interfaces), nunca de JPA, Spring ni de una API concreta. Las implementaciones se
      conectan desde afuera en `infraestructura/configuracion/CasosDeUsoConfiguracion`. La prueba
      `ArquitecturaHexagonalTest` (ArchUnit) falla si el dominio o los casos de uso importan
      Spring, JPA o Jackson.
    - **Límites conocidos.** `PublicarNoticiaServicio` coordina varias reglas (cupo,
      historial, avisos y puntos); las reglas están en el dominio y el servicio solo las
      orquesta, que es lo propio de un caso de uso. En Angular los componentes reciben los
      servicios concretos con `inject()` (práctica habitual del framework); en las pruebas se
      reemplazan por servicios falsos.

## Fase 1 — Entrada con atardecer y «Hoy» (2026-11-04)
26. Las animaciones son solo CSS (`@keyframes`) y señales; los tiempos que manda el código
    (entrada, tarjeta, amanecer, intro, historia, retrasos de letras y palabras) están en
    `core/constants/animaciones.constants.ts` y llegan al CSS como variables `--duracion-…`.
    Los colores nuevos del cielo son tokens en `styles.css`. Los temporizadores pasan por
    `core/utils/temporizadores.ts`, que los cancela con el `DestroyRef` del componente.
27. «Reducir movimiento» se lee con `MovimientoService` (`matchMedia`), así las pruebas lo
    simulan. Con esa preferencia no hay entrada, ni amanecer, ni avance de la intro o de las
    historias: la intro de «Hoy» espera el botón «Ver las noticias». (decidido por Claude Code; revisar)
28. Mientras la tarjeta del login no ha aparecido, el formulario está `inert` para que no se
    pueda enfocar sin verse; al saltar o a los 3.9 s queda usable. (decidido por Claude Code; revisar)
29. Si la navegación a «Hoy» no se da (un guard la redirige), el login vuelve al formulario
    en lugar de quedarse en el amanecer. (decidido por Claude Code; revisar)
30. El saludo usa solo el **primer nombre** del perfil («Buenos días, Laura»).
    (decidido por Claude Code; revisar)
31. Sin ciudad en el perfil, el nombre grande de la intro es «Al Día» y la tarjeta final dice
    solo «Ya estás al día». «Cerca de ti» toma las más recientes que no salieron en las
    historias. (decidido por Claude Code; revisar)
32. Si no hay ninguna noticia publicada, la intro dice «Todavía no hay noticias publicadas» y
    pasa directo a la tarjeta final, sin «Ver otra vez». (decidido por Claude Code; revisar)
33. Además del toque largo y la barra espaciadora, cada historia tiene un **botón de pausa**
    visible (WCAG 2.2.2: el contenido que se mueve solo debe poderse pausar). Las zonas de toque
    no reciben foco (`tabindex="-1"`): con teclado se usan las flechas. La barra espaciadora no
    pausa si el foco está en un botón o enlace, para no robarle su función.
34. «Hoy» no muestra el menú principal (es a pantalla completa); se sale con «Cerrar» o
    «Ir a la portada». La ruta raíz sigue llevando a la portada; solo el login lleva a «Hoy».
    (decidido por Claude Code; revisar)
35. Para respetar el presupuesto de 4 kB de estilos por componente, la escena del atardecer
    (`features/auth/escena-atardecer`), la lista de titulares (`features/hoy/lista-historias`) y
    el bloque de texto de cada historia (`features/hoy/texto-historia`) son subcomponentes.

## Fase 2 — Fotos de las noticias (MF02_003)
36. **Almacenamiento detrás de un puerto.** `AlmacenImagenesPuerto` (guardar, leer, borrar) con un
    primer adaptador en disco (`IMAGENES_DIRECTORIO`; en Docker, el volumen `imagenes`). **Con
    varios servidores** el disco de uno no lo ve el otro: habría que cambiar a un adaptador de
    almacenamiento en la nube (S3, Azure Blob, Cloudinary…). El puerto ya lo permite sin tocar
    los casos de uso.
37. En la columna `multimedia.url` se guarda la **clave del archivo** (un UUID con extensión), no
    una URL pública: la API arma la URL (`/api/noticias/{id}/imagenes/{orden}`) y así puede
    revisar permisos. El nombre que puso el usuario nunca se usa en el disco.
38. **El tipo real sale de los primeros bytes** (firma del archivo), nunca del nombre ni del
    `Content-Type`. Se aceptan JPEG, PNG y WebP. Las dimensiones se leen de la cabecera **antes**
    de decodificar la foto, para que una imagen con dimensiones gigantes no agote la memoria.
    Máximo 8000×8000 px (`IMAGENES_ANCHO_MAXIMO`, `IMAGENES_ALTO_MAXIMO`).
    (decidido por Claude Code; revisar)
39. **Sin metadatos.** JPEG y PNG se vuelven a codificar desde los píxeles con ImageIO (viene con
    Java, no se agregó ninguna librería), así desaparecen EXIF (con la ubicación GPS), XMP y
    comentarios. JPEG se guarda con calidad 0.9 (`IMAGENES_CALIDAD_JPEG`). Java no trae lector de
    WebP: a esos archivos se les quitan los bloques `EXIF` y `XMP ` del contenedor RIFF sin
    recodificarlos. (decidido por Claude Code; revisar)
40. Al volver a codificar, la **orientación EXIF** se pierde. Desde la app no importa (el
    navegador ya rota la foto antes de subirla), pero una foto subida directo a la API desde un
    celular podría verse girada. (decidido por Claude Code; revisar)
41. Orden de la publicación con fotos: se validan y limpian **antes** de tocar la base; los
    archivos se guardan antes de la transacción y, si cualquier paso falla (base, cupo diario,
    cuenta desactivada), se borran. Si falla el guardado de una foto, se borran las anteriores.
42. Las fotos de una noticia **no publicada** responden 404 al público (igual que la noticia)
    y `Cache-Control: no-store, private` a su autor y a los administradores. Las publicadas,
    `public, max-age` (`IMAGENES_CACHE_SEGUNDOS`, 1 día).
43. Un archivo más pesado que `IMAGENES_TAMANO_MAXIMO_MB` lo frena primero Spring
    (`spring.servlet.multipart.max-file-size`); el manejador global responde **413** con un
    mensaje claro. La petición completa admite hasta `IMAGENES_TAMANO_MAXIMO_PETICION_MB` (25).
44. La descripción de cada foto viaja en el JSON de `datos` como `descripcionesImagenes` (en el
    mismo orden de las partes) y se guarda en la columna nueva `multimedia.texto_alternativo`
    (máximo 250). Sin descripción, la foto se muestra con `alt=""` porque el titular ya dice de
    qué trata. (decidido por Claude Code; revisar)
45. En el navegador cada foto se reduce con `createImageBitmap` (`imageOrientation: 'from-image'`)
    y un canvas de máximo 1600 px exportado a JPEG 0.82, con fondo blanco para PNG
    transparentes. Si el navegador no puede leerla (algunas HEIC), se explica cómo cambiarla.
46. Las miniaturas de la moderación se piden **con sesión** (HttpClient + interceptor) y se
    muestran con una URL `blob:`, porque las noticias ocultas no son públicas y un `<img>` no
    manda el token. (decidido por Claude Code; revisar)
47. **Probar desde el celular**: el ambiente `red` (`environment.red.ts`, `ng serve --configuration
    red --host 0.0.0.0`) arma la URL de la API con el mismo equipo desde el que se abrió la
    página, así la IP no queda escrita en el código. El origen se agrega a `CORS_ORIGENES`.
