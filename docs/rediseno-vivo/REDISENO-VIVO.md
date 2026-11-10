# Rediseño «El día en vivo»: la portada que sigue al sol

Diseño elegido el 10 de noviembre de 2026 para la portada de computador. La portada deja de ser
una lista y se vuelve una escena que cambia con la hora, construida sobre la marca: el sol sobre
el horizonte y el nombre «Al Día».

Tiene cuatro piezas:

1. **Portada de cine.** La noticia del momento ocupa la pantalla con su foto, un velo azul y un
   titular enorme.
2. **La línea del sol.** Un arco de 6 a. m. a 6 p. m. con el sol en la hora actual y las noticias
   del día colgadas a la hora en que se publicaron. Al arrastrar el sol se vuelve atrás en el
   día; cerca del anochecer la portada pasa sola a tema de noche.
3. **Mosaico.** Las demás noticias en fichas de distintos tamaños, no en lista.
4. **Mapa que late.** Los municipios como puntos que laten según cuántas noticias tienen.

## Referencia

`referencia-dia-en-vivo.html` (en esta misma carpeta) es la maqueta y **funciona**: ábrela con
doble clic, arrastra el sol o toca una hora del arco.

- Su `<style>` es todo el CSS del diseño.
- Su `<template id="plantilla">` es el HTML; los `{{huecos}}` son valores calculados.
- La «Parte 1 · Lógica» de su `<script>` muestra cómo se calcula cada valor a partir de la hora.
  Esa lógica es la que se lleva a Angular.
- La «Parte 2 · Motor de la maqueta» solo hace funcionar la página suelta. No se lleva a Angular.

Los datos de la maqueta están escritos a mano (seis noticias de hoy, «ahora» fijo en 5:40 p. m.).
En la app salen de los servicios que ya existen. Donde la maqueta y este documento no coincidan,
manda este documento.

## Lo que no cambia

- **Nada de backend ni de servicios.** No se tocan `core/services/`, modelos, rutas, guards ni el
  interceptor. Todo sale de lo que la portada ya carga: `AlmacenNoticias.noticias()` (la lista
  completa) y `PerfilService.obtener()`.
- **Sin librerías nuevas.** Solo CSS y lo que Angular ya trae.
- **Las reglas de `frontend/CLAUDE.md`**: sin `any`, sin textos, rutas ni números sueltos en los
  componentes (van en `core/constants/`), y las llamadas HTTP solo en `core/services/`.
- **No se inventan funciones ni datos.** Nada de «compartir», «me gusta» o contadores que la API
  no devuelve.
- **La identidad.** Logo `shared/logo`, Source Serif 4 para titulares y Manrope para la interfaz,
  autoalojadas como hoy (la maqueta las pide a Google Fonts solo porque es una página suelta).
- **Login, registro, modal de la noticia, Publicar, Perfil, Avisos, Mapa y Administración**
  conservan su contenido. Solo cambia el marco que las rodea (sección 4).

## 1. Temas de día y de noche

La portada tiene dos temas. Se eligen con un atributo en el elemento raíz de la portada:
`data-tema="dia"` o `data-tema="noche"`. Las variables se redefinen en `styles.css`, así todo lo
que ya usa variables cambia solo.

| Variable | Día | Noche |
|---|---|---|
| `--color-pagina` | `#f7f9fc` | `#081226` |
| `--color-tarjeta` | `#ffffff` | `#0f1f3d` |
| `--color-superficie` | `#f7f9fc` | `#0f1f3d` |
| `--color-superficie-2` | `#edf1f7` | `#182b52` |
| `--color-linea` | `#e3e7ef` | `#263a63` |
| `--color-borde` | `#7a869c` | `#6b7fa8` |
| `--color-texto` | `#111827` | `#f4f6fb` |
| `--color-texto-suave` | `#5c6880` | `#a9b6cf` |
| `--color-realce` (nueva) | `#0e2551` | `#f0a028` |
| `--color-boton` (nueva) | `#0e2551` | `#f0a028` |
| `--color-boton-texto` (nueva) | `#ffffff` | `#0e2551` |

- `--color-realce` es el color de los textos y enlaces destacados. Dentro de la portada, todo
  texto o ícono que hoy usa `--color-marca` como color de letra pasa a `--color-realce`, porque
  el azul no se lee sobre el fondo de noche.
- `--color-boton` y `--color-boton-texto` son el relleno y la letra del botón principal, de la
  pestaña activa y de la etiqueta «Oficial».
- El ámbar `#f0a028` sigue siendo solo relleno en el tema de día. En el de noche sí puede ser
  letra (8.7:1 sobre la página, 7.6:1 sobre la tarjeta).
- Contrastes de noche ya verificados: texto 15.1:1 sobre tarjeta; texto suave 8.0:1 sobre
  tarjeta y 6.8:1 sobre superficie-2; borde de campos 4.1:1 sobre tarjeta.
- El modal de la noticia queda en tema de día en esta tarea: lleva `data-tema="dia"`.
- El cambio de tema se anima 0.7 s (`background-color`, `color`, `border-color`, `fill`).

## 2. Momentos del día

La hora se maneja como número decimal (5:40 p. m. = 17.67). El «momento» decide el tinte de la
foto y el tema:

| Momento | Horas | Tema |
|---|---|---|
| `amanecer` | 6:00 a 7:30 | día |
| `dia` | 7:30 a 4:00 p. m. | día |
| `atardecer` | 4:00 a 5:30 p. m. | día |
| `noche` | desde las 5:30 p. m. y antes de las 6:00 a. m. | noche |

Los límites (6, 7.5, 16, 17.5 y 18) van como constantes. En Colombia el sol sale y se pone cerca
de las 6 todo el año, por eso el arco es fijo de 6 a. m. a 6 p. m.

La hora de una noticia se saca de `fechaPublicacion`, leída en la zona `America/Bogota` (con
`Intl.DateTimeFormat` y el `IDIOMA` de `regional.constants.ts`; la zona va como constante ahí).

## 3. Qué noticia va en la portada de cine

Tres valores mandan en la portada:

- **Día mostrado.** Por defecto hoy. Si hoy no tiene noticias, el día más reciente que sí tenga,
  para que el arco nunca arranque vacío.
- **Hora elegida.** Por defecto «ahora»: la hora real de Colombia, que se actualiza cada minuto.
  Si el usuario arrastra el sol o toca una marca, queda la hora que eligió («de viaje»).
- **Noticia de la hora.** La última noticia del día mostrado publicada a esa hora o antes. Si no
  hay ninguna antes, la primera del día. Si el día no tiene noticias, la primera de la lista.

Las noticias que cuentan son las de `noticias()` después del filtro de municipio y de la
búsqueda (`filtrarNoticias`). Las pestañas (Recomendadas, Recientes, Oficiales, Comunidad) no
afectan la portada de cine ni el arco: solo ordenan el mosaico.

## 4. Barra superior (reemplaza el menú lateral en computador)

`shared/marco` deja el menú lateral y usa una barra arriba, en todas las pantallas con sesión.

- Contenido, de izquierda a derecha: logo con nombre; enlaces Portada, Mapa, Avisos (con el
  contador ámbar de `CampanaNotificaciones`), Mi perfil y Administración (solo administrador);
  a la derecha, el botón ámbar «Publicar» y un círculo con las iniciales del usuario.
- El círculo abre un menú pequeño con el nombre, «Nivel N · municipio», Mi perfil y Salir (lo
  que hoy muestra `usuario-marco`). Se cierra con Escape y al hacer clic afuera.
- Solo en la Portada se agregan la búsqueda (la misma de hoy, mismo `ID_BUSQUEDA_NOTICIAS`) y el
  municipio con su conteo (puede seguir siendo el `<select>` nativo con forma de píldora).
- En la Portada la barra va **sobre la foto**, transparente, con letra blanca. Se queda pegada
  arriba (`position: sticky`) y, al bajar más de 24 px, toma fondo `--color-marca-oscuro`.
- En las demás pantallas la barra es siempre sólida, `--color-marca-oscuro` con letra blanca.
- Enlace activo: píldora `rgba(255,255,255,0.16)` y `aria-current="page"`.
- Los textos siguen en `TEXTOS_NAVEGACION`.
- En celular no cambia nada: siguen `barra-movil` y `barra-inferior`.

## 5. Portada de cine

Es el `<header>` de la portada. Alto según su contenido, con mínimo de 720 px. Fondo
`--color-marca-oscuro`. Capas, de atrás hacia adelante:

1. **Foto** de la noticia de la hora, a pantalla completa (`object-fit: cover`), con
   `app-miniatura` (ya resuelve la foto subida o la de la categoría). Al cambiar de noticia las
   fotos se funden en 0.9 s. La foto hace un acercamiento muy lento (de 1.02 a 1.09 en 26 s, ida
   y vuelta).
2. **Velo lateral**, fijo, para que el texto se lea:
   `linear-gradient(90deg, rgba(9,25,58,.94) 0%, rgba(9,25,58,.88) 40%, rgba(9,25,58,.58) 60%, rgba(9,25,58,.16) 80%, rgba(9,25,58,.34) 100%)`.
3. **Velo superior** de 150 px bajo la barra: `rgba(9,25,58,.88)` a transparente.
4. **Tinte del momento.** Cuatro capas, una por momento; solo la del momento actual tiene
   opacidad 1 y cambian con una transición de 0.9 s. Los degradados exactos están en la maqueta
   y usan los colores de cielo que ya existen en `styles.css` (`--color-cielo-amanecer`,
   `--color-cielo-dia`, `--color-cielo-crepusculo`, `--color-cielo-atardecer`,
   `--color-cielo-anochecer`, `--color-sol-poniente`).

Contenido, a la izquierda (máximo 740 px):

- Fila de etiquetas: «Oficial» (ámbar, letra azul) o «Comunidad · Nivel N» (blanco, letra azul);
  si `esUltimaHora`, además «Última hora» (`--color-urgente`, letra blanca); el municipio en una
  píldora con borde; y la hora de publicación («4:20 p. m.»).
- Titular: el único `<h1>` de la pantalla. Serif 700, `clamp(38px, 4.75vw, 68px)`, interlineado
  1.05, `text-wrap: balance`.
- Resumen: serif 21 px, color `#e8edf6`, máximo 600 px.
- Autor: cuadro ámbar de 42 px con las iniciales (`iniciales()`), el nombre y «N min de lectura»
  (`minutosDeLectura`).
- Botones: «Leer la noticia» (ámbar, abre el modal como hoy con `abrirNoticia`) y «Ver en el
  mapa» (borde blanco, lleva a la pantalla Mapa; solo si la noticia tiene coordenadas).

A la derecha, la **tarjeta del reloj** (330 px, fondo `rgba(9,25,58,.86)`, borde blanco al 22 %,
radio 26):

- Etiqueta: «Ahora», o «Estás viendo las» cuando está de viaje.
- La hora en serif 400, `clamp(72px, 8vw, 116px)`, con «a. m.» o «p. m.» en 28 px.
- La fecha del día mostrado y el municipio activo: «Lunes 9 de noviembre · Fusagasugá».
- A los lados de la fecha, dos botones de ícono de 44 px: «Día anterior» y «Día siguiente»
  (este no está dibujado en la maqueta). «Día siguiente» se desactiva en hoy; «Día anterior»,
  cuando no hay noticias más viejas. Sirven para que el arco no quede vacío en días flojos.
- Una línea de ayuda: «Arrastra el sol, o toca una hora del arco, para volver atrás en el día.»
- El botón «Volver a ahora», solo cuando está de viaje o en otro día.

## 6. La línea del sol

Es una franja de 290 px de alto al pie de la portada de cine. Todas las medidas están en la
maqueta; estas son las que hay que respetar.

**Geometría.** Con `u = (hora − 6) / 12`, para horas entre 6 y 18:

- posición horizontal: `x = 8 % + 84 % × u`
- posición vertical, desde arriba de la franja: `y = 30 px + 170 px × (1 − 4·u·(1 − u))`

El horizonte queda en `y = 200 px`. El arco punteado es un SVG con la curva
`M0,100 Q50,-100 100,100` estirada sobre esa caja; coincide exactamente con la fórmula.

**Elementos**, de atrás hacia adelante:

1. El arco punteado (blanco al 60 %).
2. El sol: círculo de 56 px con degradado ámbar y un resplandor que «respira» cada 4.5 s. Va en
   la posición de la hora elegida (si la hora real pasa de las 6 p. m., se queda en las 6 p. m.).
3. Las montañas: dos siluetas en SVG. La de atrás, azul oscuro al 66 %. La de adelante, del
   color de la página (`--color-pagina`), para que la foto se funda con el contenido de abajo. El
   sol queda por detrás, así «se oculta» al atardecer.
4. Una línea punteada ámbar que baja del sol hasta el deslizador.
5. Las marcas: un botón de 44 px por noticia, con un punto blanco de 12 px y encima una píldora
   con la hora. La marca de la noticia que está en portada va en ámbar, de 20 px.
6. Las horas de guía, sobre la montaña de adelante: 6 a. m., 9 a. m., 12 m., 3 p. m. y 6 p. m.,
   en 8 %, 29 %, 50 %, 71 % y 92 %.
7. El deslizador: un `<input type="range">` nativo, sobre la montaña de adelante, alineado con
   el arco (el botón redondo queda justo debajo del sol).

**Marcas.** Llevan marca las noticias del día mostrado publicadas entre las 6 a. m. y las
6 p. m. Máximo 8; si hay más, las 8 más recientes. Si dos quedan a menos de 3 % de ancho, se
muestra solo la más reciente. Las noticias de la noche y de la madrugada no llevan marca, pero sí
salen en la portada de cine y en el mosaico.

**Deslizador.** Mínimo 6; máximo la hora actual (tope en 18) o 18 en un día pasado; paso de un
minuto. Lleva `<label>` oculto «Hora del día que quieres ver» y `aria-valuetext` con la hora
legible. Al tocar una marca, la hora elegida es exactamente la de esa noticia.

**Reloj en vivo.** Cuando no está de viaje, la hora avanza sola cada minuto y todo la sigue: el
sol, el momento, el tema y la noticia de portada.

**Día sin noticias** (por el filtro de municipio): el arco sale sin marcas y la tarjeta del reloj
dice «Este día no tiene noticias en {municipio}.».

## 7. El mosaico

Debajo de la portada de cine, en un contenedor de 1312 px como máximo con 64 px de margen.

**Encabezado.** Título serif de 36 px: «Lo demás de hoy» (o «Lo demás del {día}» en un día
pasado; «Lo más reciente» si el día no tiene más noticias). A la derecha, las cuatro pestañas de
hoy como píldoras; la activa con `--color-boton`.

**Qué noticias.** Las de `filtradas()` (filtro más pestaña), sin la que está en la portada de
cine. Primero las del día mostrado; si son menos de cuatro, se completa con las siguientes de la
lista para que el mosaico no quede con huecos.

**Fila 1** (alto mínimo 410 px), tres fichas en proporción 5 / 4 / 3:

| Ficha | Contenido |
|---|---|
| Noticia 1, **foto grande** | Foto a toda la ficha, degradado azul abajo, etiquetas, titular serif de 34 px en blanco y línea de autor |
| **Dónde está pasando** | Sección 8 |
| **Tu nivel** | Sección 9 |

**Fila 2** (alto mínimo 290 px), cuatro fichas iguales:

| Ficha | Contenido |
|---|---|
| Noticia 2, **ficha de color** | Fondo ámbar, todo en azul: etiqueta con borde, flecha arriba a la derecha, titular serif de 27 px y línea de autor. Sin foto |
| Noticias 3 y 4, **ficha con foto** | Foto de 150 px arriba; debajo etiqueta, municipio y hora, y titular serif de 21 px |
| **Avisos cerca de ti** | Sección 9 |

**Más filas.** Si quedan noticias del día, van en filas de cuatro fichas con foto.

**Días anteriores.** Título «Días anteriores» con una línea al lado. Fichas horizontales de dos
en dos: foto de 180 × 128 a la izquierda, etiqueta, municipio, titular serif de 22 px y autor.
Aquí siguen funcionando `NOTICIAS_POR_TANDA` y el botón «Ver más noticias».

**Detalles comunes.**

- Radio de las fichas: 26 px (variable nueva `--radio-ficha`).
- Hora en las fichas: «10:30 a. m.» si la noticia es del día mostrado; si no, `tiempoRelativo`.
- Etiquetas: «Oficial» con `--color-boton`; «Comunidad · Nivel N» con `--color-superficie-2` y
  letra `--color-realce`.
- Al pasar el mouse: la foto se acerca a 1.05 en 0.7 s y el titular se subraya.
- Cada ficha de noticia es un enlace con `appEnlaceNoticia` y abre el modal igual que hoy.
- Las fotos van con `app-miniatura`.

## 8. Ficha «Dónde está pasando»

Fondo `--color-marca` en los dos temas, letra blanca, con líneas curvas decorativas al 10 %.

- Arriba: «{total} noticias en {n} municipios» y el título «Dónde está pasando».
- Un punto por municipio, hasta los 6 con más noticias, usando el `conteo()` que ya existe.
- Posición: el promedio de `latitud` y `longitud` de las noticias de ese municipio. Se reparten
  en el área con 14 % de margen: `x` según la longitud (oeste a la izquierda) y `y` según la
  latitud (norte arriba). Con un solo municipio, va en el centro. Los municipios sin coordenadas
  van en una fila de píldoras debajo.
- Tamaño del punto: 10 px (1 noticia), 14 px (2) y 20 px (3 o más). Cada punto tiene un anillo
  que late cada 2.6 s, con retrasos distintos.
- El nombre va a la derecha del punto, o a la izquierda si el punto pasa del 60 % del ancho.
- El municipio del usuario (`perfil.ciudad`) va resaltado: punto con borde blanco, dentro de una
  píldora, con «tu municipio».
- Tocar un municipio filtra la portada, igual que hoy (`elegirCiudad`).
- Abajo, «Abrir el mapa completo», que lleva a la pantalla Mapa.
- La etiqueta «Bogotá» de la maqueta es solo de ubicación: no va en la app.

## 9. Fichas «Tu nivel» y «Avisos cerca de ti»

**Tu nivel.** Los mismos datos que hoy muestra `tu-nivel` en la columna derecha.

- Un anillo de 168 px: pista `--color-superficie-2` y avance ámbar igual a
  `puntaje / siguienteNivel.puntajeMinimo` (tope en 100 %). Adentro, el sol del logo y «Nivel N».
- «{puntaje} de {puntajeMinimo} puntos» y el texto de `textoFaltanPuntos`. En el nivel más alto,
  anillo completo y `TEXTOS_COLUMNA.maximo`.
- «Hoy te quedan {restantes} de {limite} publicaciones.», o `TEXTOS_COLUMNA.ilimitado`.
- Botón «Publicar una noticia» con `--color-boton`.
- El anillo lleva `role="img"` y un `aria-label` como «60 de 150 puntos para el nivel 3».

**Avisos cerca de ti.** Es el componente `avisos-cerca` que ya existe, dentro de una ficha.

## 10. Qué pasa con lo que existe hoy

| Hoy | Después |
|---|---|
| `shared/marco` con menú lateral | Barra superior (sección 4). `barra-movil` y `barra-inferior` siguen igual |
| `barra-portada` | Sus pestañas pasan al encabezado del mosaico; la búsqueda y el municipio, a la barra superior |
| `bienvenida` | Se retira. El cupo del día pasa a «Tu nivel» y «Publicar» queda en la barra |
| `columna-derecha` | Se retira. «Tu nivel» y «Avisos cerca de ti» pasan a fichas; «Municipios» pasa a «Dónde está pasando»; «De la alcaldía» desaparece (lo oficial sale en el mosaico con su etiqueta) |
| `tarjeta-noticia` | Gana las variantes del mosaico (foto grande, color, con foto y horizontal), o se crea una ficha nueva; lo que quede más limpio |
| `esqueleto-portada` | Toma la forma nueva: portada de cine, fila 1 y fila 2 |
| Estados de error, sin noticias y sin resultados | Se conservan, con los mismos textos, debajo de la portada de cine |
| `modal-noticia`, `detalle`, `interaccion` | Sin cambios |

## 11. Celular

No hay dibujo de celular. La portada tiene que seguir funcionando a 390 px sin barra de
desplazamiento horizontal:

- La portada de cine se apila: etiquetas, titular (38 px), resumen, autor, botones y debajo la
  tarjeta del reloj a todo el ancho (hora en 72 px).
- La franja del sol baja a 200 px de alto; las marcas se ven como puntos y solo la activa
  muestra su hora.
- El mosaico va en una columna.

Antes de programar el celular, mostrarle a Sebas una propuesta.

## 12. Movimiento y accesibilidad

- Solo se animan `opacity` y `transform` (y los colores del tema).
- Con `prefers-reduced-motion: reduce` se apagan el acercamiento de la foto, el respiro del sol y
  el latido del mapa, y las transiciones pasan a ser instantáneas. Los anillos del mapa quedan
  fijos, al 45 %.
- Las marcas del arco son botones con `aria-label` como «Ir a las 10:30 a. m.: {titular}».
- Al soltar el deslizador (evento `change`, no en cada movimiento), una región `aria-live`
  anuncia la hora y el titular.
- Botones y enlaces reales, área táctil de 44 px y el foco visible que ya existe.
- La foto de la portada de cine es de fondo: `alt=""`. Las de las fichas llevan su texto
  alternativo, como hoy.
- La foto principal carga con prioridad alta; las del mosaico, con `loading="lazy"`.

## 13. Dónde va el código

- `core/constants/dia-en-vivo.constants.ts`: horas de los momentos, medidas del arco, límites
  (marcas, municipios) y los textos nuevos.
- `core/utils/dia-en-vivo.ts`: **funciones puras**, cada una con sus pruebas:
  hora decimal de una fecha; día de una fecha; momento de una hora; posición en el arco; noticia
  de la hora; marcas del día; hora legible; puntos del mapa.
- Componentes de presentación en `features/noticias/` (nombres sugeridos): `portada-cine`,
  `linea-sol`, `reloj-dia`, `mosaico`, `ficha-mapa`, `ficha-nivel`. Reciben datos por `input()` y
  avisan por `output()`, como los que ya existen.
- `Listado` coordina: guarda el día mostrado y la hora elegida, y calcula el momento, el tema y
  la noticia de la hora.
- **Cobertura.** El Quality Gate de SonarQube pide 80 % en el código nuevo. La lógica va en las
  funciones puras justamente para poder probarla.

## 14. Orden de trabajo

Un paso por commit. Después de cada uno: `npm run lint`, `npm test` y revisar en el navegador.

1. Variables de tema (día y noche) en `styles.css`, constantes y funciones puras con sus pruebas.
2. Barra superior en `shared/marco`; las demás pantallas siguen funcionando.
3. Portada de cine sin arco: foto, velos, etiquetas, titular, autor y botones.
4. Línea del sol: arco, sol, montañas, marcas, deslizador y tarjeta del reloj con «Volver a
   ahora».
5. Momentos y tema: tintes de la foto, paso a noche, reloj en vivo y cambio de día.
6. Mosaico: fichas de noticia, «Días anteriores» y «Ver más noticias». Se retiran `bienvenida`,
   `barra-portada` y `columna-derecha`.
7. Ficha «Dónde está pasando».
8. Fichas «Tu nivel» y «Avisos cerca de ti».
9. Esqueleto de carga, movimiento reducido y celular.
10. Limpieza: código y textos que ya no se usan, pruebas y PR.

## 15. Terminado cuando

- A 1440 px la portada se ve y se mueve como la maqueta: se puede arrastrar el sol, tocar una
  marca y volver a ahora.
- Usa las noticias, el perfil y los avisos reales; no queda ningún dato de la maqueta.
- Antes de las 5:30 p. m. sale el tema de día; después, el de noche. Los dos se leen bien.
- Sigue funcionando todo lo de antes: pestañas, búsqueda, municipio, ver más, modal,
  comentarios, calificación del autor, reportes, fotos, mapa, avisos, cupo, administración y
  cerrar sesión.
- A 390 px no hay desplazamiento horizontal.
- `npm run lint` y `npm test` pasan; las pruebas que cambien por el HTML nuevo se actualizan, no
  se borran.
- El PR a `dev` pasa el Quality Gate de SonarQube Cloud.

## Pendiente para Sebas

- Cinco fotos de categoría (`agua`, `comida`, `mercado`, `obra`, `parque`) miden 600 px de
  ancho y se ven borrosas a pantalla completa. Conviene cambiarlas por versiones de 1600 px o
  más. Las de `bici`, `cultura` y `deporte` ya miden 1280 px.
