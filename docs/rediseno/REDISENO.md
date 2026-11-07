# Rediseño del frontend: portada combinada con la marca Al Día

Estilo elegido el 6 de noviembre de 2026: la **estructura de Hashnode** (menú lateral, barra de
pestañas, bloque de bienvenida, tarjetas con borde) y el **feed de Substack** (publicaciones en
una columna con autor, titular grande, resumen y foto, y una columna derecha con información
del usuario), con la identidad «Amanecer» de Al Día: azul madrugada, ámbar y blanco.

## Referencias visuales

Ábrelas en el navegador (doble clic). Son maquetas estáticas: muestran cómo debe verse, no son
código para copiar. Usan las fotos de `frontend/public/imagenes/noticias/`.

| Archivo | Qué muestra |
|---|---|
| `referencia-escritorio.html` | Portada a 1440 px de ancho |
| `referencia-celular.html` | Primera pantalla de la portada a 390 × 844 |

Origen de los estilos: Refero Styles, fichas de
[Hashnode](https://styles.refero.design/style/6a8bf4c2-8cf2-463a-bcb9-36c15ea177c2) y
[Substack](https://styles.refero.design/style/14e563d8-a35a-4867-b4bf-15d1620ddae7). Se tomó la
estructura, no sus colores ni sus fuentes.

## Lo que no cambia

- **Nada de lógica.** Servicios, modelos, rutas, guards, interceptor, almacén de noticias y
  backend quedan iguales. El trabajo es de plantillas (HTML), CSS y, donde haga falta,
  componentes nuevos de presentación que usen los servicios que ya existen.
- **La identidad.** El logo es `shared/logo` (sol ámbar sobre el horizonte, cuadro azul). Las
  fuentes siguen siendo Source Serif 4 (titulares) y Manrope (interfaz), autoalojadas con
  `@fontsource`. No se agregan fuentes de Google ni otras librerías de estilos.
- **Las reglas de `frontend/CLAUDE.md`.** Sin `any`, sin textos ni rutas quemados (todo en
  `core/constants/`), toda llamada HTTP en `core/services/`.
- **No se inventan funciones.** Nada de «Compartir», «me gusta», seguidores ni contadores que la
  API no devuelve (por ejemplo, no hay número de comentarios en `Noticia`). Lo que sí existe se
  muestra con sus datos reales: fotos (`imagenes`), calificación (`promedio`,
  `cantidadCalificaciones`), comentarios y reportes dentro del modal y del detalle.
- **Escrito sobre la rama `fix/pendientes-tecnicos`** (fotos, comentarios, calificaciones,
  reportes, mapa, «Hoy» y la entrada con atardecer). El rediseño parte de ese código, no de
  `main`.

## 1. Variables de diseño (`frontend/src/styles.css`)

Todo el aspecto sale de las variables de `:root`. Se conservan los nombres y se ajustan los
valores; donde falte uno, se agrega.

| Variable | Valor | Uso |
|---|---|---|
| `--color-marca` | `#0e2551` | Azul madrugada: botones principales, etiqueta «Oficial», bloque de bienvenida, municipio activo |
| `--color-marca-oscuro` | `#09193a` | Hover de lo azul |
| `--color-sol` | `#f0a028` | Ámbar: botón «Publicar», pestaña activa, barra de nivel, contadores de avisos. **Solo como relleno**, con texto azul encima (6.96:1). Nunca texto ámbar sobre blanco (2.2:1) |
| `--color-pagina` | `#f7f9fc` | Fondo de la app (antes blanco) |
| `--color-tarjeta` | `#ffffff` | Tarjetas, menú lateral, barra superior |
| `--color-superficie-2` | `#edf1f7` | Item activo del menú, etiqueta «Nivel N», chip de municipio, pista de la barra de nivel |
| `--color-linea` | `#e3e7ef` | Borde de tarjetas y separadores |
| `--color-borde` | `#7a869c` | Borde de campos y botones secundarios (3.67:1) |
| `--color-texto` | `#111827` | Texto principal |
| `--color-texto-suave` | `#5c6880` | Metadatos, etiquetas de sección (5.6:1 sobre blanco, 4.94:1 sobre `#edf1f7`) |
| `--color-sobre-marca-suave` | `#c3cde0` | Texto secundario sobre azul (9.6:1) |
| `--color-campo-sobre-marca` | `#1c335e` | **Nueva.** Campo «¿Qué está pasando…?» dentro del bloque azul |
| `--color-urgente` | `#d7262d` | Solo la etiqueta «Última hora» |

Forma:

| Variable | Valor | Uso |
|---|---|---|
| `--radio-chip` | `6px` | **Nueva.** Etiquetas «Oficial» y «Nivel N», contadores, chip de municipio |
| `--radio-s` | `10px` | Botones, campos, items del menú, municipios (antes 12px) |
| `--radio-m` | `14px` | Tarjetas (antes 24px) |
| `--radio-g` | `18px` | Bloque de bienvenida (antes 32px) |

- **Sin sombras en tarjetas**: se separan con borde de 1px `--color-linea`. `--sombra-3` se
  queda solo para el modal.
- Tipografía: titulares en Source Serif 4 700; interfaz en Manrope 400 a 700.

| Elemento | Tamaño |
|---|---|
| Titular del bloque de bienvenida | 32px serif, interlineado 1.18 |
| Titular de publicación grande | 27px serif |
| Resumen de publicación grande | 18px serif, interlineado 1.5 |
| Titular de tarjeta compacta | 18px serif |
| Metadatos (autor, tiempo, municipio) | 13–14px Manrope |
| Etiquetas de sección («Nuevas y recomendadas») | 12px Manrope 700, mayúsculas, espaciado 0.1em, `--color-texto-suave` |

## 2. Estructura de la pantalla

### Escritorio (1024 px o más)

```
┌──────────────┬───────────────────────────────────────────────────────────┐
│ Menú lateral │ Barra superior: pestañas · municipio · búsqueda            │
│ 236 px       ├─────────────────────────────────────────┬─────────────────┤
│ blanco,      │ Columna central (flexible)               │ Columna derecha │
│ borde dcho.  │ · Bloque de bienvenida                   │ 280 px          │
│              │ · Nuevas y recomendadas (2 grandes)      │ · Tu nivel      │
│              │ · Más de tu región (tarjetas compactas)  │ · Avisos        │
│              │ · Ver más noticias                       │ · De la alcaldía│
│              │                                          │ · Municipios    │
└──────────────┴─────────────────────────────────────────┴─────────────────┘
```

El contenido (central + derecha) tiene ancho máximo de 1180 px, 28 px de margen y 28 px entre
columnas.

### Tableta (768 a 1023 px)

Menú lateral y una sola columna de contenido; la columna derecha baja al final.

### Celular (menos de 768 px)

- Arriba, una barra con el logo, un botón de buscar y la campana con su contador.
- Debajo, las pestañas en una fila que se desplaza de lado.
- Un botón con el municipio actual que abre el selector.
- El contenido en una columna. La columna derecha no se muestra: «Tu nivel» está en Perfil y
  los avisos en la campana.
- El menú lateral se vuelve **barra inferior fija** de 76 px: Portada, Hoy, Publicar (botón
  ámbar en el centro), Mapa y Avisos (con contador). Mi perfil se abre desde el cuadro con las
  iniciales, arriba a la derecha.

## 3. Componentes

| Hoy | Después |
|---|---|
| `shared/encabezado` + `shared/navegacion` | Un marco común para las pantallas con sesión: menú lateral en escritorio y barra inferior en celular. Logo con nombre arriba; los mismos destinos que hoy tiene `navegacion.html`: Hoy, Portada, Mapa, Avisos (contador ámbar con `CampanaNotificaciones`), Mi perfil y Administración (solo admin); botón azul «Publicar»; abajo el usuario (iniciales, nombre, «Nivel N · municipio») y «Salir». Los textos siguen en `TEXTOS_NAVEGACION` (`pantallas.constants.ts`). Oficiales y Comunidad **no** son items del menú: son pestañas de la portada |
| `cabecera-portada` (municipios con conteo) | El conteo pasa a un `<select>` en la barra superior y al bloque «Municipios» de la columna derecha (chips; el activo en azul con texto blanco) |
| `barra-busqueda` | Va dentro de la barra superior: pestañas Recomendadas / Recientes (orden `RECOMENDADAS` / `RECIENTES`) y Oficiales / Comunidad (tipo `OFICIALES` / `COMUNITARIAS`); al lado, el municipio y la búsqueda. Pestaña activa: texto azul 700 con subrayado ámbar de 3px y `aria-current` |
| — | **Bloque de bienvenida** (nuevo, en `features/noticias/`). Fondo azul, radio 18. Antetítulo ámbar con «municipio · fecha»; titular serif blanco «Lo que pasa en tu municipio, contado por sus vecinos.»; un campo que es un enlace a Publicar («¿Qué está pasando en {municipio}?»); botón ámbar «Publicar»; debajo el cupo desde `PerfilService` («Te quedan {restantes} de {limite} publicaciones hoy · nivel {n}», o el texto de cupo ilimitado si es administrador). Sol decorativo en SVG con `aria-hidden` arriba a la derecha |
| `apertura` + `cintillo` | Las **dos primeras noticias** se muestran como **publicación grande**: fila de autor (cuadro de 36px con iniciales sobre ámbar, o ícono de edificio sobre azul si es oficial), nombre, etiqueta «Oficial» (azul, texto blanco, ✓) o «Nivel {autorNivel}» (`#edf1f7`, texto azul) y tiempo relativo; titular serif 27px; resumen serif 18px; foto `app-miniatura` en proporción 2:1 con radio 10 (con `[foto]` = la primera de `imagenes`, como ya hace la tarjeta; si no hay, la de la categoría); pie con chip de municipio, «N min de lectura» (`minutosDeLectura`) y, si `cantidadCalificaciones > 0`, la calificación promedio con estrella y cuántas personas calificaron. Si `esUltimaHora`, una etiqueta roja «Última hora» en la fila de autor reemplaza al cintillo |
| `columna-noticias` (oficial \| comunidad) | **«Más de tu región»**: el resto de noticias en tarjetas compactas, dos columnas en escritorio y una en celular. Miniatura de 104 × 78 con radio 10, autor + etiqueta + tiempo, titular serif 18px y municipio |
| `tarjeta-noticia` | Dos variantes por `input`: `grande` y `compacta`. Las dos abren el modal igual que hoy (`appEnlaceNoticia`) |
| — | **Columna derecha** (nueva): «Tu nivel» (nivel, puntaje / `siguienteNivel.puntajeMinimo`, barra ámbar, «Faltan N puntos para el nivel M», «Publicas hasta L noticias al día», enlace a Mi perfil); «Avisos cerca de ti» (hasta 2 notificaciones `CERCANIA` sin leer, punto ámbar, contador); «De la alcaldía» (hasta 3 noticias oficiales); «Municipios» |
| `esqueleto-portada` | Se adapta a la nueva forma (bloque, 2 grandes, compactas) |
| `modal-noticia` y `interaccion/` (comentarios, calificación, reportar) | Igual; solo toman los nuevos radios y colores |
| Publicar, Perfil, Avisos, Mapa, Administración (con Reportes), Detalle | Entran en el marco y heredan las variables: tarjetas blancas con borde y radio 14, botón principal azul. En Mapa, el mapa ocupa el área de contenido. Sin rediseño profundo en esta tarea |
| Login, Registro y «Hoy» | Conservan su escena del cielo (`--color-noche`, `--color-cielo-*`) y **no** entran en el marco; solo heredan radios y botones |

El orden de las noticias es el que ya devuelve la API (`RECOMENDADAS` por defecto). «Ver más
noticias» sigue usando `hayMas` / `verMas`. Las noticias oficiales que van en «De la alcaldía»
no se quitan del feed.

## 4. Accesibilidad

- Contrastes de la tabla de colores ya verificados (texto 4.5:1 como mínimo).
- Botones y enlaces reales; área táctil de 44px; el foco visible que ya existe en `styles.css`.
- Íconos decorativos con `aria-hidden="true"`; botones solo de ícono (buscar, campana) con
  `aria-label` cuyo texto vive en constantes.
- La barra de nivel con `role="img"` y un `aria-label` del tipo «60 de 150 puntos».

## 5. Terminado cuando

- La portada se parece a las dos referencias a 1440 px y a 390 px.
- Todo lo que ya funcionaba sigue funcionando: filtros, búsqueda, municipio, ver más, modal,
  comentarios, calificación, reportes, fotos, mapa, «Hoy», campana de avisos, cupo,
  administración y cerrar sesión.
- `npm test` y `npm run lint` pasan. Las pruebas que cambien por el nuevo HTML se actualizan,
  no se borran.
- Sin `any` y sin textos quemados.
- El PR a `dev` pasa el Quality Gate de SonarQube Cloud.
