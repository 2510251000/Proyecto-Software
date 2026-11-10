# «El día en vivo»: rediseño de la portada de Al Día

Diseño elegido el 9 de noviembre de 2026. La portada deja de ser una lista y se vuelve una
escena que sigue la hora: la noticia principal a pantalla completa, un arco con el sol en la
hora actual y las noticias del día colgadas a la hora en que se publicaron, y debajo un mosaico
de fichas. Al arrastrar el sol se viaja hacia atrás en el día y la portada cambia de noticia, de
luz y de tema (día o noche).

Escrito sobre el código de la rama `feature/login-noticias` (commit `b4a5e2e`).

## 1. Referencias visuales

Ábrelas en el navegador (doble clic). Son maquetas estáticas del mismo diseño en tres momentos;
muestran cómo debe verse, no son código de Angular para copiar. Usan las fotos de
`frontend/public/imagenes/noticias/` y fuentes de Google (la app usa las de `@fontsource`).

| Archivo | Qué muestra |
|---|---|
| `referencia-tarde.html` | Estado por defecto: 5:40 p. m., sol en el horizonte, tinte de anochecer, **tema de noche** |
| `referencia-dia.html` | El sol arrastrado a las 10:36 a. m.: otra noticia en la portada, tinte de día, **tema de día** |
| `referencia-atardecer.html` | El sol en las 4:30 p. m.: tinte de atardecer, todavía tema de día |

Ancho de referencia: 1440 px. Lo que no está dibujado (la noche con luna, el celular, los
estados de carga y error) se construye con las reglas de este documento.

## 2. Alcance

**Cambia**

- `shared/marco`: en escritorio el menú lateral pasa a ser una **barra superior** para todas las
  pantallas con sesión. En el celular queda como está (`barra-movil` y `barra-inferior`).
- `features/noticias/listado` y sus piezas: salen `bienvenida`, `barra-portada` y
  `columna-derecha`; entran la portada de cine, la línea del sol y el mosaico.
- `shared/tarjeta-noticia`: variantes nuevas para las fichas del mosaico.
- `styles.css`: variables nuevas y el tema de noche de la portada.

**No cambia**

- Servicios, modelos, rutas, guards, interceptor y todo `backend/`. No hay endpoints nuevos ni
  peticiones nuevas: todo sale de `AlmacenNoticias`, `PerfilService` y `CampanaNotificaciones`,
  como hoy.
- Login y registro (ya tienen su muro de noticias).
- `modal-noticia`, `detalle` e `interaccion/`: siguen en tema claro y con su lógica.
- Publicar, Perfil, Avisos, Mapa y Administración: solo heredan la barra superior.
- Las reglas de `frontend/CLAUDE.md`: sin `any`, sin textos ni rutas quemados (van en
  `core/constants/`), llamadas HTTP solo en `core/services/`.
- No se inventan funciones ni datos: nada de «compartir», «me gusta» ni contadores que la API no
  devuelve.

**Fuera de esta entrega:** tema de noche en el resto de la app y transición de la foto al abrir
una noticia. Se dejan anotados en `docs/PENDIENTES.md`.

## 3. Variables de diseño (`frontend/src/styles.css`)

Se conservan todas las actuales. Se agregan estas en `:root`:

| Variable | Valor de día | Uso |
|---|---|---|
| `--color-realce` | `var(--color-marca)` | Texto de acento (enlaces, etiqueta «Nivel N») |
| `--color-boton` | `var(--color-marca)` | Relleno del botón principal y de la etiqueta «Oficial» |
| `--color-sobre-boton` | `#ffffff` | Texto sobre `--color-boton` |
| `--color-riel` | `#7a869c` | Riel del deslizador del sol (3.5:1 sobre la página) |
| `--radio-xl` | `26px` | Fichas del mosaico y panel del reloj |
| `--radio-pildora` | `999px` | Píldoras: pestañas, chips, botones de la portada |

**Tema de noche, solo en la portada.** El contenedor de la portada lleva
`data-tema="dia"` o `data-tema="noche"`. Con `noche` se sobrescriben estas variables dentro de
ese contenedor (no en `:root`), así las piezas que usan variables cambian solas:

| Variable | De noche | Contraste |
|---|---|---|
| `--color-pagina` | `#081226` | |
| `--color-tarjeta` | `#0f1f3d` | |
| `--color-superficie-2` | `#182b52` | |
| `--color-linea` | `#263a63` | decorativo |
| `--color-riel` | `#6b7fa8` | |
| `--color-texto` | `#f4f6fb` | 15.1:1 sobre la tarjeta |
| `--color-texto-suave` | `#a9b6cf` | 8:1 sobre la tarjeta, 6.8:1 sobre `superficie-2` |
| `--color-realce` | `var(--color-sol)` | 7.6:1 sobre la tarjeta |
| `--color-boton` | `var(--color-sol)` | |
| `--color-sobre-boton` | `var(--color-marca)` | 7:1 sobre el ámbar |

Dentro de la portada, lo que hoy usa `--color-marca` **como color de texto** debe usar
`--color-realce`, y lo que lo usa como relleno de botón, `--color-boton`. Si no, de noche queda
azul sobre azul. El modal de la noticia se queda en claro: va fuera del contenedor con
`data-tema`.

El cambio de tema se anima: `transition` de 0.7 s en `background-color`, `color`,
`border-color`, `fill` y `stroke`.

## 4. La lógica del día

Va en funciones puras con pruebas, en `core/utils/momento-del-dia.ts`, con sus números en
`core/constants/dia.constants.ts`. Las horas son decimales en hora local del navegador
(17.67 = 5:40 p. m.), leídas con `new Date(fechaPublicacion)` como ya hace `tiempoRelativo`.

### 4.1 Momentos, tinte y tema

| Momento | Horas | Tinte de la foto | Tema |
|---|---|---|---|
| `amanecer` | 6:00 a 7:30 | amanecer | día |
| `dia` | 7:30 a 16:00 | día | día |
| `atardecer` | 16:00 a 17:30 | atardecer | día |
| `anochecer` | 17:30 a 18:30 | anochecer | **noche** |
| `noche` | 18:30 a 6:00 | noche | **noche** |

El tinte y el tema dependen de la **hora que se está viendo**, no solo de la hora real: si el
usuario arrastra el sol a la mañana, la portada pasa a tema de día.

### 4.2 Qué día y qué hora se muestran

- **Día mostrado:** el día calendario de la noticia más reciente del listado (después del filtro
  de municipio y de la búsqueda). Normalmente es hoy.
- **Hora tope:** si el día mostrado es hoy, la hora actual; si es un día anterior, las 24:00.
- **Hora vista:** por defecto, la hora actual si el día mostrado es hoy; si no, la hora de la
  última noticia de ese día. Cambia cuando el usuario arrastra el sol o toca una marca, y nunca
  pasa de la hora tope.
- **Noticia en portada:** la más reciente del día mostrado publicada a la hora vista o antes. Si
  no hay ninguna antes, la primera del día.
- **Hora actual:** un servicio en `core/services/` con una señal que se actualiza cada minuto
  (y limpia su temporizador). Las funciones puras reciben la hora por parámetro.

### 4.3 Posición en el arco

La banda del arco mide 290 px de alto y ocupa todo el ancho. `x` es un porcentaje del ancho;
`y` son píxeles desde el borde superior de la banda. El horizonte está en `y = 200`.

| Hora `h` | `x` | `y` | Astro |
|---|---|---|---|
| 6 a 18 | `8 + 84·u`, con `u = (h − 6) / 12` | `30 + 170·(1 − 4·u·(1 − u))` | sol |
| 18 a 24 | `92 + (h − 18)` | `176` | luna |
| 0 a 6 | `2 + h` | `176` | luna |

Comprobaciones para las pruebas: 6:00 → (8 %, 200); 12:00 → (50 %, 30); 18:00 → (92 %, 200);
17.67 → (89.69 %, 181.8); 10.5 → (39.5 %, 40.6).

El arco dibujado es esa misma parábola: un SVG en `left: 8%`, `width: 84%`, `top: 30px`,
`height: 170px`, `viewBox="0 0 100 100"`, `preserveAspectRatio="none"`, con el trazo
`M0,100 Q50,-100 100,100`, blanco al 60 %, punteado `2 8`, `vector-effect="non-scaling-stroke"`.

Hacen falta las dos direcciones: `xDeHora(h)` y su inversa `horaDeX(x)`, porque el deslizador
trabaja en posición (ver 5.3).

### 4.4 Formato

La hora se escribe con `Intl.DateTimeFormat(IDIOMA, { hour: 'numeric', minute: '2-digit' })`
(«5:40 p. m.»). En el reloj grande, el número y «a. m. / p. m.» van en tamaños distintos.

## 5. La pantalla en escritorio (1024 px o más)

De arriba a abajo: barra superior, portada de cine con el reloj, línea del sol y mosaico.
La barra, la portada y la línea forman un solo bloque oscuro de unos 930 px de alto con la foto
de fondo; el mosaico va sobre el color de la página.

### 5.1 Barra superior (`shared/marco`)

- De izquierda a derecha: logo con nombre; los destinos de `navegacion` (Portada, Mapa, Avisos
  con su contador, Mi perfil y Administración si es admin) como píldoras de 44 px de alto; a la
  derecha, «Publicar» (píldora ámbar, texto azul 800) y la cuenta (círculo de 44 px con las
  iniciales y borde ámbar, que lleva a Mi perfil; «Salir» sigue disponible).
- Destino activo: píldora `rgba(255,255,255,0.16)`, texto 800 y `aria-current="page"`.
- Margen lateral de 64 px, 20 px arriba y abajo.
- **En la portada** la barra es transparente y va encima de la foto. Solo ahí se le suman la
  búsqueda (campo de 220 × 44, píldora, fondo `rgba(9,25,58,0.72)`, borde blanco al 50 %) y el
  botón del municipio (misma píldora, con el pin en ámbar), que hacen lo mismo que hoy hace
  `barra-portada`.
- **En las demás pantallas** la barra es sólida, `--color-marca`, con el texto en blanco.
- En el celular no cambia nada: siguen `barra-movil` arriba y `barra-inferior` abajo.

### 5.2 Portada de cine

Fondo, de atrás hacia adelante:

1. La foto de la noticia en portada, a todo el bloque, con `object-fit: cover`. Sale de
   `app-miniatura` (foto real o la de la categoría), como en las tarjetas. Lleva un acercamiento
   muy lento: `scale(1.02)` a `scale(1.09)` en 26 s, ida y vuelta.
2. Velo fijo para que el texto se lea:
   `linear-gradient(90deg, rgba(9,25,58,0.94) 0%, rgba(9,25,58,0.92) 46%, rgba(9,25,58,0.60) 62%, rgba(9,25,58,0.16) 80%, rgba(9,25,58,0.34) 100%)`.
3. Velo de la barra: 150 px arriba, `rgba(9,25,58,0.88)` a transparente.
4. El tinte del momento (uno visible a la vez; se cruzan con `opacity` en 0.9 s):

| Tinte | `linear-gradient(180deg, …)` |
|---|---|
| amanecer | `rgba(31,74,138,0.34) 0%, rgba(31,74,138,0.12) 50%, rgba(240,160,40,0.44) 100%` |
| día | `rgba(31,69,128,0.30) 0%, rgba(31,69,128,0.04) 55%, rgba(9,25,58,0.36) 100%` |
| atardecer | `rgba(79,33,64,0.52) 0%, rgba(143,63,39,0.30) 55%, rgba(228,87,46,0.52) 100%` |
| anochecer | `rgba(8,18,38,0.72) 0%, rgba(31,27,61,0.42) 46%, rgba(143,63,39,0.46) 78%, rgba(228,87,46,0.60) 100%` |
| noche | `rgba(8,18,38,0.82) 0%, rgba(8,18,38,0.62) 55%, rgba(31,27,61,0.72) 100%` |

Al cambiar de noticia, la foto nueva aparece sobre la anterior en 0.9 s. No se cargan de entrada
las fotos de todas las noticias del arco: solo la que se muestra.

Contenido (columna izquierda, 64 px de margen, ancho máximo 740 px, 20 px entre piezas):

- Fila de chips: «Oficial» (fondo ámbar, texto azul 800) o «Comunidad · Nivel N» (fondo blanco,
  texto azul); el municipio con su pin (píldora con borde blanco al 50 % y fondo
  `rgba(9,25,58,0.6)`); y la hora de publicación.
- Titular: `h1`, Source Serif 4 700, `clamp(38px, 4.75vw, 68px)`, interlineado 1.05, blanco,
  `text-wrap: balance`.
- Resumen: Source Serif 4, 21 px, interlineado 1.5, color `#e8edf6`, ancho máximo 600 px.
- Autor: cuadro de 42 px con las iniciales (ámbar, texto azul, radio 12), nombre en 800 y
  «N min de lectura» (`minutosDeLectura`) en `--color-sobre-marca-suave`.
- Botones de 52 px de alto en píldora: «Leer la noticia» (ámbar, texto azul 800, con flecha),
  que abre la vista rápida igual que una tarjeta; y «Ver en el mapa» (borde blanco, fondo
  `rgba(9,25,58,0.55)`), que lleva al Mapa y solo aparece si la noticia tiene coordenadas.

### 5.3 Línea del sol

Banda de 290 px al pie del bloque. Capas, de atrás hacia adelante:

1. El arco punteado (4.3).
2. El astro. **Sol:** círculo de 56 px con
   `radial-gradient(circle at 38% 34%, #ffd98a 0%, #f0a028 58%, #e98a1c 100%)` y resplandor
   `0 0 0 10px rgba(240,160,40,.16), 0 0 70px 24px rgba(240,160,40,.38)` que respira cada 4.5 s.
   **Luna** (de 18:00 a 6:00): círculo de 44 px `#e8edf6` con un resplandor blanco suave. Se mueve
   con `transition` de 0.3 s.
3. La cordillera: un SVG de 130 px de alto pegado abajo, `viewBox="0 0 1440 120"`,
   `preserveAspectRatio="none"`, con dos siluetas. La de atrás, `#09193a` al 66 %; la de
   adelante, del color de la página (`--color-pagina`), para que la foto se funda con el
   mosaico. Los dos trazados se copian tal cual de `referencia-tarde.html`. El astro queda
   detrás de la cordillera: al atardecer se oculta tras ella.
4. Una línea punteada vertical ámbar desde el astro hasta el deslizador.
5. Las marcas: un botón de 44 × 44 por cada noticia del día mostrado publicada hasta la hora
   tope (máximo 12, las más recientes), en su posición del arco. Dentro, un punto blanco de
   12 px con anillo `rgba(255,255,255,0.28)` y, encima, una píldora con la hora (12 px, 800,
   fondo `rgba(9,25,58,0.86)`, texto blanco). La marca de la noticia en portada es ámbar: punto
   de 20 px con anillo `rgba(240,160,40,0.4)` y píldora ámbar con texto azul. Si una marca queda
   a menos de 6 % de ancho de la anterior, su píldora solo se muestra con el cursor encima o con
   foco. Tocar una marca lleva la hora vista a esa noticia. Cada botón tiene `aria-label` del
   tipo «Ir a las 10:30 a. m.: El mercado campesino vuelve…».
6. Las horas de guía, en 12 px 700 `--color-texto-suave`, sobre la cordillera de adelante:
   «6 a. m.» (8 %), «9 a. m.» (29 %), «12 m.» (50 %), «3 p. m.» (71 %) y «6 p. m.» (92 %).
7. El deslizador: un `<input type="range">` real con su `<label>` oculto, a 36 px del borde
   inferior. Riel de 2 px `--color-riel`; perilla de 24 px ámbar con borde de 4 px del color de
   la página y un aro ámbar. Trabaja en **posición** (de 0 a 1000 sobre el eje `x`), no en
   minutos: así la perilla queda siempre debajo del astro. Su máximo es la posición de la hora
   tope. Con `aria-valuetext` dice la hora («10:36 a. m.»). Con el teclado se mueve con las
   flechas.

### 5.4 Reloj

Panel arriba a la derecha de la portada: 330 px de ancho, radio 26, fondo
`rgba(9,25,58,0.92)`, borde blanco al 22 %, texto alineado a la derecha.

- Etiqueta en mayúsculas (12 px, 800, espaciado 0.14 em) con un punto ámbar: «Ahora» cuando la
  hora vista es la actual; «Estás viendo las» cuando el usuario viajó; «Lo último» cuando el día
  mostrado no es hoy.
- La hora vista: Source Serif 4 400, `clamp(72px, 8vw, 116px)`; «a. m. / p. m.» en 28 px.
- Fecha del día mostrado y municipio: «Lunes 9 de noviembre · Fusagasugá», 15 px.
- Ayuda: «Arrastra el sol, o toca una hora del arco, para volver atrás en el día.», 14 px.
- Botón «Volver a ahora» (píldora con borde ámbar, 44 px), visible solo cuando el usuario viajó.

### 5.5 Mosaico

Contenedor de 1312 px de ancho máximo, 64 px de margen lateral, 30 px arriba y 72 px abajo,
22 px entre filas y 20 px entre fichas. Las fichas tienen radio 26 y, salvo las de color, fondo
`--color-tarjeta` con borde de 1 px `--color-linea`.

**Encabezado:** «Lo demás de hoy» (Source Serif 4 700, 36 px) y, a la derecha, las pestañas
Recomendadas, Recientes, Oficiales y Comunidad como píldoras de 44 px. La activa:
`--color-boton` con `--color-sobre-boton`; las demás: `--color-superficie-2`. Funcionan igual
que hoy (`aplicarPestana`), y el filtro de municipio también.

Las noticias del mosaico salen de la misma lista filtrada de hoy, en su orden. Pueden repetir la
que está en portada: el mosaico no se reordena cuando el usuario arrastra el sol.

**Fila 1** (alto mínimo 410 px, anchos en proporción 5 : 4 : 3):

1. **Ficha de foto**, con la primera noticia: la foto a toda la ficha, degradado azul hacia
   abajo, y encima los chips (tipo y hora), el titular en Source Serif 4 700 de 34 px blanco y
   «autor · municipio · N min de lectura».
2. **«Dónde está pasando»**: ficha azul `--color-marca` con líneas de relieve decorativas.
   Antetítulo «N noticias en M municipios», título en 28 px y un mapa esquemático: un punto
   ámbar por municipio con noticias, colocado según la longitud (x) y la latitud (y, el norte
   arriba) promedio de sus noticias con coordenadas, normalizadas al cuadro con 12 % de margen.
   Tamaño del punto: 10 px con 1 noticia, 14 px con 2, 20 px con 3 o más. Cada punto late (un
   aro que crece y se desvanece cada 2.6 s) y es un botón con el nombre y la cantidad; al
   tocarlo filtra por ese municipio, igual que el selector. El municipio del usuario va
   resaltado en una píldora con «tu municipio». Los municipios sin coordenadas se listan debajo
   como chips. Enlace «Abrir el mapa completo» hacia el Mapa.
3. **«Tu nivel»**: parte de `columna-derecha/tu-nivel`. Un anillo de 168 px (círculo de radio
   52 en un `viewBox` de 120, trazo de 10; pista `--color-superficie-2` y avance ámbar con
   puntas redondas) con el sol del logo y «Nivel N» en el centro. Debajo: «60 de 150 puntos»,
   «Te faltan 90 para el nivel 3.», una línea, «Hoy te quedan 9 de 10 publicaciones.» (o el
   texto de cupo ilimitado) y el botón «Publicar una noticia». El anillo lleva `role="img"` y un
   `aria-label` con los puntos.

**Fila 2** (alto mínimo 290 px, cuatro fichas iguales):

1. **Ficha de color**, con la segunda noticia: fondo ámbar, todo el texto en azul. Arriba, el
   chip del tipo con borde azul y una flecha en diagonal; abajo, el titular en 27 px y
   «autor · municipio · hora».
2. y 3. **Tarjeta con foto**, con la tercera y la cuarta: foto de 150 px de alto arriba; debajo,
   el chip («Oficial» con `--color-boton`, o «Comunidad · Nivel N» con `--color-superficie-2` y
   texto `--color-realce`), «municipio · hora» y el titular en 21 px.
4. **«Avisos cerca de ti»**: parte de `columna-derecha/avisos-cerca`, con su contador ámbar,
   hasta dos avisos y el enlace «Ver todos los avisos».

**Más noticias:** el resto, bajo un título de 28 px con una línea a su derecha, en tarjetas
horizontales de a dos por fila: foto de 180 × 128 con radio 16, chip, municipio, titular en
22 px y autor. Salen por tandas con «Ver más noticias» (`NOTICIAS_POR_TANDA`).

Si hay menos noticias de las que pide una fila, las fichas que faltan no se dibujan y las demás
ocupan el espacio. Todas las fichas de noticia abren la vista rápida como hoy
(`appEnlaceNoticia`). Al pasar el cursor, la foto se acerca a `scale(1.05)` en 0.7 s y el
titular se subraya.

### 5.6 Estados

- **Cargando:** `esqueleto-portada` con la forma nueva: el bloque oscuro del alto de la portada
  y, debajo, fichas vacías con la forma del mosaico.
- **Error:** el bloque oscuro sin foto (`--color-marca-oscuro`), con el arco y el astro en la
  hora actual, y en lugar del titular el mensaje de error y «Reintentar».
- **Sin noticias o sin resultados:** igual, con los textos de `TEXTOS_PORTADA` que ya existen.
  El mosaico conserva «Tu nivel» y «Avisos cerca de ti».

## 6. Componentes

| Hoy | Después |
|---|---|
| `shared/marco` (menú lateral) | Barra superior en escritorio, con un modo transparente para la portada y un hueco para la búsqueda y el municipio. El celular no cambia |
| `features/noticias/barra-portada` | Se reparte: pestañas al encabezado del mosaico; municipio y búsqueda a la barra superior. Se elimina |
| `features/noticias/bienvenida` | Se elimina: el cupo pasa a «Tu nivel» y «Publicar» ya está en la barra |
| `features/noticias/columna-derecha` | Se elimina. `tu-nivel` y `avisos-cerca` pasan a ser fichas del mosaico; «Municipios» se convierte en «Dónde está pasando»; «De la alcaldía» desaparece (queda la pestaña Oficiales) |
| — | `features/noticias/portada-cine`: foto, velos, tinte, chips, titular, autor y botones |
| — | `features/noticias/linea-del-sol`: arco, astro, cordillera, marcas y deslizador |
| — | `features/noticias/reloj-portada`: el panel del reloj |
| — | `features/noticias/pulso-municipios`: «Dónde está pasando» |
| `shared/tarjeta-noticia` (`grande`, `compacta`) | Variantes `foto-completa`, `color`, `foto-arriba` y `fila`. Las viejas se quitan si nadie más las usa |
| `features/noticias/esqueleto-portada` | Con la forma nueva |
| `features/noticias/listado` | Arma todo: calcula el día mostrado, la hora vista y la noticia en portada con las funciones puras, y pone `data-tema` |

Los nombres son una propuesta; si otro encaja mejor con el código, se cambia.

## 7. Movimiento

Todo con CSS: acercamiento lento de la foto, respiración del sol, latido de los puntos del mapa,
cruce de fotos y de tintes, y cambio de tema. Con `prefers-reduced-motion: reduce` se apagan las
animaciones y las transiciones: el sol queda con su resplandor fijo y los aros del mapa quietos
y tenues. Nada de librerías de animación.

## 8. Accesibilidad

- El texto sobre la foto siempre va sobre los velos de 5.2. Están calculados para el peor caso,
  una foto completamente blanca: el texto normal queda por encima de 4.5:1 y el titular, que es
  texto grande, por encima de 3:1. Por eso el texto no puede salirse de la mitad izquierda ni
  del panel del reloj.
- El ámbar nunca es texto sobre blanco. De noche sí puede ser texto (7.6:1 sobre la tarjeta).
- Botones, enlaces y campos reales, con 44 px de área táctil y el foco visible de `styles.css`.
- Las fotos de fondo de la portada son decorativas (`alt=""`): el titular ya dice la noticia.
- El arco, la cordillera, la línea punteada y las horas de guía llevan `aria-hidden`. Las marcas
  y el deslizador son los controles accesibles.
- Al cambiar de noticia por el deslizador, el titular se anuncia con `aria-live="polite"`.

## 9. Tableta y celular

No hay maqueta. Reglas:

- **Tableta (768 a 1023 px):** igual que escritorio; el reloj baja debajo del titular si no
  cabe, y las filas del mosaico se parten en dos.
- **Celular (menos de 768 px):** `barra-movil` y `barra-inferior` como hoy. La portada ocupa el
  ancho completo con el titular en 38 px. El reloj se reduce a una línea bajo los botones (la
  hora en 44 px, sin panel). La banda del arco mide 200 px, el arco 110 px de alto y el sol
  40 px; solo la marca activa muestra su píldora. El mosaico va en una columna, con la ficha de
  foto de 320 px de alto mínimo. La búsqueda y el municipio van en una fila bajo la barra.
- En ningún ancho hay desplazamiento horizontal.

## 10. Orden de trabajo

Un commit por paso, con `npm run lint` y `npm test` en verde antes de pasar al siguiente:

1. Lógica pura del día (momento, tema, posición y su inversa, día mostrado, noticia en portada,
   formato) con sus pruebas, las constantes y el servicio de la hora actual.
2. Variables nuevas y tema de noche de la portada en `styles.css`.
3. Barra superior en `shared/marco` para todas las pantallas; el celular igual.
4. Portada de cine con la noticia más reciente (todavía sin arco).
5. Línea del sol y reloj: arrastrar, tocar una marca y «Volver a ahora».
6. Mosaico: variantes de la tarjeta, composición, pestañas y «Ver más».
7. Fichas «Tu nivel», «Avisos cerca de ti» y «Dónde está pasando».
8. Limpieza de lo que quedó sin uso, esqueleto y estados, celular y movimiento reducido.
9. Documentación: `docs/ESTADO.md`, `docs/DECISIONES.md` y `docs/PENDIENTES.md`.

## 11. Terminado cuando

- A 1440 px la portada se parece a las tres referencias, según la hora.
- Arrastrar el sol cambia la noticia, la foto, el tinte, el tema y el reloj; «Volver a ahora»
  lo devuelve. Después de las 5:30 p. m. la portada abre en tema de noche, y de 6:00 p. m. a
  6:00 a. m. muestra la luna.
- Con noticias solo de días anteriores, el arco muestra el último día con noticias y el reloj
  dice «Lo último».
- Sigue funcionando todo lo de antes: pestañas, búsqueda, municipio, ver más, vista rápida,
  comentarios, calificación del autor, reportes, fotos, mapa, avisos, cupo, administración y
  cerrar sesión.
- Sin desplazamiento horizontal a 390 px.
- `npm run lint` y `npm test` pasan; las pruebas que cambien por el HTML nuevo se actualizan, no
  se borran. Sin `any` y sin textos quemados.
- El PR a `dev` pasa el Quality Gate de SonarQube Cloud.
