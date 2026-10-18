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
