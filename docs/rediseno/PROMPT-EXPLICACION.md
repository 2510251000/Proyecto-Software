# Prompt: que un chat me explique el rediseño de la portada

Cómo se usa: copia todo lo que está debajo de la línea y pégalo en un chat nuevo (Claude Code
dentro del repositorio o claude.ai). Si el chat puede abrir archivos del repositorio, que lo haga
para comprobar lo que dice este resumen.

---

Eres mi tutor. Soy Sebastián, estudiante de Ingeniería de Software (Universidad de Cundinamarca).
Hago la base de datos y el frontend en Angular de **Al Día: Portal de Noticias**; David hace el
backend en Spring Boot. Otro chat terminó el **rediseño visual del frontend** y necesito entender
qué hizo y **dónde está cada cosa**. Explícamelo en español, con palabras sencillas y de forma
**muy organizada**: títulos, tablas y listas cortas. Nada de párrafos largos.

## Lo que quiero que me expliques (en este orden)

1. **Resumen en 5 líneas**: qué se hizo y por qué.
2. **Mapa de la pantalla**: dibuja en texto (con cajas `┌─┐`) la portada en escritorio y en
   celular, y en cada caja escribe el nombre del componente y su carpeta.
3. **Tabla «quiero cambiar X → abro este archivo»**: para cada parte visible (menú, pestañas,
   bloque azul, tarjetas, columna derecha, barra del celular, colores, textos…).
4. **Los 11 commits**, uno por fila: qué cambió y qué archivos tocó.
5. **Qué se borró y qué lo reemplazó.**
6. **Decisiones que tomó el otro chat** y por qué (para que yo las pueda defender ante el profe).
7. **Cómo lo pruebo yo**: comandos y qué mirar en el navegador.
8. **Qué falta.**
9. Al final, **3 preguntas de repaso** para comprobar que entendí. Espera mis respuestas.

Si algo de este resumen no coincide con el código, dímelo en lugar de inventar.

## Contexto

- Repositorio: `2510251000/Proyecto-Software` (GitHub). Ramas: `main`, `pre`, `dev` y ramas
  `feature/...` que salen de `dev`.
- Rama del trabajo: **`feature/rediseno-portada`**, en el **PR #15 hacia `dev`**. El Quality Gate
  de SonarQube Cloud pasó con 95,2 % de cobertura en el código nuevo, 0 % de duplicación y
  0 problemas. Tiene 338 pruebas en verde y el lint sin errores. El merge lo hago yo.
- Las especificaciones están en `docs/rediseno/REDISENO.md`. Las maquetas de referencia son
  `docs/rediseno/referencia-escritorio.html` (1440 px) y `docs/rediseno/referencia-celular.html` (390 px).
- Estilo elegido: la **estructura de Hashnode** (menú lateral, pestañas, bloque de bienvenida,
  tarjetas con borde) y el **feed de Substack** (publicaciones en una columna y una columna derecha
  con la actividad del usuario), con los colores de Al Día: azul `#0e2551`, ámbar `#f0a028` y blanco.
- **Solo cambió la presentación** (HTML, CSS y componentes de presentación). No se tocaron
  servicios, modelos de la API, rutas, guards, interceptor, almacén de noticias ni backend.
- Reglas del proyecto que se respetaron: sin `any`, sin textos ni rutas quemados (todo en
  `core/constants/`), toda llamada HTTP en `core/services/`, y máximo 4 kB de CSS por componente.

Todas las rutas de abajo empiezan en `frontend/src/`.

## Los 11 commits

| # | Commit | Qué hizo |
|---|---|---|
| 0 | `3982ab9` | Especificaciones y maquetas en `docs/rediseno/` |
| 1 | `89c70bb` | Variables de diseño en `styles.css`: fondo gris claro `#f7f9fc`, radios 6/10/14/18 y botones sin sombra |
| 2 | `89b5f85` | **Marco con menú lateral** en todas las pantallas con sesión; se borró `shared/encabezado` |
| 3 | `5e8e20b` | **Marco en celular**: barra de arriba y barra inferior fija |
| 4 | `164b7df` | **Barra superior de la portada**: pestañas, municipio y búsqueda |
| 5 | `571a8a6` | **Bloque azul de bienvenida** |
| 6 | `e655e8f` | **Tarjeta de noticia** en dos variantes: grande y compacta |
| 7 | `9df1774` | **Feed nuevo** («Nuevas y recomendadas» y «Más de tu región») |
| 8 | `4ad4259` | **Columna derecha** (Tu nivel, Avisos, De la alcaldía, Municipios) |
| 9 | `c67e567` | **Esqueleto de carga** con la forma nueva |
| 10 | `ca884f5` | **Resto de pantallas** (Publicar, Perfil, Avisos, Mapa, Administración y Detalle) con el estilo nuevo |

## Dónde está cada cosa

### El marco (lo que rodea a todas las pantallas con sesión)

| Parte | Archivos | Qué hace |
|---|---|---|
| Marco | `app/shared/marco/marco.*` | En escritorio y tableta pone el menú lateral de 236 px a la izquierda y el contenido a la derecha. Cada pantalla se envuelve en `<app-marco>…</app-marco>`. Pide el perfil con `PerfilService.obtener()` |
| Destinos del menú | `app/shared/navegacion/navegacion.*` | Hoy, Portada, Mapa, Avisos (con contador ámbar), Mi perfil y Administración (solo administradores), con íconos |
| Pie del menú | `app/shared/marco/usuario-marco/usuario-marco.*` | Iniciales, nombre, «Nivel N · municipio» y el botón «Salir» |
| Barra de arriba (celular) | `app/shared/marco/barra-movil/barra-movil.*` | Logo, lupa (lleva a la portada y pone el cursor en la búsqueda), escudo de Administración (solo admin) e iniciales (llevan a Mi perfil) |
| Barra inferior (celular) | `app/shared/marco/barra-inferior/barra-inferior.*` | Barra fija de 76 px: Portada, Hoy, Publicar (botón ámbar en el centro), Mapa y Avisos con contador |

Por debajo de 768 px el menú lateral se oculta y aparecen las dos barras del celular.

### La portada (`app/features/noticias/`)

| Parte | Archivos | Qué hace |
|---|---|---|
| Pantalla completa | `listado/listado.*` | Junta todo. Calcula `destacadas` (las 2 primeras), `masDeTuRegion` (el resto, de 6 en 6 con «Ver más»), el conteo por municipio y el perfil |
| Filtros (funciones puras) | `listado/filtro-portada.ts` | `filtrarNoticias()` filtra por municipio; `aplicarPestana()` aplica la pestaña: «Recientes» ordena por fecha aquí mismo, sin volver a pedir al backend |
| Barra superior | `barra-portada/barra-portada.*` | 4 pestañas en una fila (Recomendadas, Recientes, Oficiales, Comunidad), con una sola activa, `aria-current` y subrayado ámbar. Al lado, el `<select>` de municipio con conteo y la búsqueda (se envía con Enter) |
| Bloque azul | `bienvenida/bienvenida.*` | Municipio y fecha, el titular `<h1>`, el campo «¿Qué está pasando en…?» y el botón que llevan a Publicar, y el cupo del día |
| Columna derecha | `columna-derecha/columna-derecha.*` | Contiene «De la alcaldía» (3 oficiales) y «Municipios» (chips) |
| Tu nivel | `columna-derecha/tu-nivel/tu-nivel.*` | Nivel, puntos, barra ámbar, cuánto falta, límite diario y enlace a Mi perfil |
| Avisos cerca de ti | `columna-derecha/avisos-cerca/avisos-cerca.*` | Hasta 2 avisos de cercanía sin leer, con contador. Usa `NotificacionService.listar()` |
| Carga | `esqueleto-portada/esqueleto-portada.*` | Formas grises: 2 grandes y 4 compactas |

Según el ancho:

- **Escritorio (1024 px o más):** feed y columna derecha lado a lado.
- **Tableta:** la columna derecha baja al final.
- **Celular:** la columna derecha no se muestra.

### Tarjeta de noticia (`app/shared/tarjeta-noticia/`)

| Parte | Archivos | Qué hace |
|---|---|---|
| Tarjeta | `tarjeta-noticia.*` | `variante="grande"`: autor, titular de 27 px, resumen, foto 2:1 y pie (municipio, minutos de lectura, ★ calificación). `variante="compacta"` (la de por defecto): miniatura de 104 × 78, autor, titular y municipio. Al hacer clic abre la vista rápida |
| Fila de autor | `autor-noticia/autor-noticia.*` | Cuadro de 36 px (iniciales sobre ámbar, o edificio sobre azul si es oficial), nombre, etiqueta «Oficial» o «Nivel N», «Última hora» en rojo y la hora relativa |

### Estilos y textos compartidos

| Qué | Dónde |
|---|---|
| Colores, radios y fuentes | `styles.css` → bloque `:root` |
| Tarjetas de las pantallas internas | `styles.css` → `.pagina-interna`, `.titulo-pagina`, `.seccion-papel` (tarjeta blanca), `.lista-filas` |
| Tarjetas de la columna derecha | `styles.css` → `.tarjeta-lateral`, `.renglon-lateral` |
| Textos del menú, la búsqueda y las pestañas | `app/core/constants/pantallas.constants.ts` → `TEXTOS_NAVEGACION`, `TEXTOS_BUSQUEDA`, `ETIQUETAS_PESTANA`, `ID_BUSQUEDA_NOTICIAS` |
| Textos de la portada | `app/core/constants/portada.constants.ts` → `TEXTOS_PORTADA`, `TEXTOS_BIENVENIDA`, `TEXTOS_COLUMNA`, `ETIQUETAS_NOTICIA`, `NOTICIAS_DESTACADAS`, y las funciones `titularBienvenida()`, `textoFaltanPuntos()`… |
| Tipo de pestaña | `app/core/models/noticia.model.ts` → `PestanaPortada` |
| Iniciales «Laura Méndez» → «LM» | `app/core/utils/texto.ts` → `iniciales()` |
| Datos falsos para las pruebas | `testing/menu-falso.ts` → `campanaFalsa()`, `perfilFalso()`, `avisosFalsos()` |

### Las demás pantallas (paso 10)

Todas tienen solo cambios de estilo y de envoltura:

| Pantalla | Archivos | Cambio |
|---|---|---|
| Publicar | `app/features/publicar/` | Formulario dentro de una tarjeta blanca |
| Mi perfil | `app/features/perfil/` | Tarjetas, barra de nivel ámbar y, en celular, la cuenta y «Salir» al final |
| Avisos | `app/features/notificaciones/` | Título «Avisos», lista en tarjeta y punto ámbar en los no leídos |
| Mapa | `app/features/mapa/` | El mapa ocupa casi todo el alto |
| Administración | `app/features/admin/` | Pestañas como las de la portada y listas en tarjeta |
| Detalle | `app/features/noticias/detalle/` | La noticia en una tarjeta blanca y «Volver» arriba del contenido |
| Login, Registro, Hoy | (sin cambios) | Conservan su escena del cielo y no entran en el marco |

## Qué se borró y qué lo reemplazó

| Borrado | Reemplazo |
|---|---|
| `shared/encabezado` (banda azul de arriba) | `shared/marco` |
| `features/noticias/cabecera-portada` (banda azul con los municipios) | `barra-portada` (select) + `bienvenida` + chips de la columna derecha |
| `features/noticias/barra-busqueda` | `barra-portada` |
| `features/noticias/apertura` (noticia principal) | Las 2 tarjetas grandes de «Nuevas y recomendadas» |
| `features/noticias/cintillo` (franja «Última hora») | La etiqueta roja «Última hora» en la fila de autor |
| `features/noticias/columna-noticias` (oficial \| comunidad) | «Más de tu región» con tarjetas compactas |

## Decisiones que tomó el otro chat

1. Todas las pantallas entraron al marco en el paso 2 (no en el 10), porque al volver vertical la
   navegación el encabezado viejo se rompía.
2. En celular no hay menú lateral, así que **«Salir»** quedó al final de Mi perfil y
   **Administración** es un ícono de escudo en la barra de arriba (solo administradores).
3. Arriba en celular no hay campana: los Avisos con contador ya están en la barra inferior (como en la maqueta).
4. «Recientes» ordena en el navegador; no cambia la petición al backend ni el almacén.
5. La portada pide el perfil una vez y se lo pasa a la bienvenida y a «Tu nivel». El menú lateral
   hace su propia petición, así que la portada hace 2 en total.
6. El campo «¿Qué está pasando en…?» usa **mi** municipio (donde publico), no el que estoy mirando.
7. «De la alcaldía» repite a propósito noticias oficiales que también están en el feed (lo pide la especificación).
8. Si la API no trae el autor, la tarjeta dice «Administración municipal» (oficial) o «Vecino de la comunidad».
9. Se quitó la etiqueta de sección («Movilidad», «Gastronomía»…) de las tarjetas, porque la especificación no la incluye.
10. No se pusieron los enlaces del pie de la maqueta (Normas, Contacto) porque esas páginas no existen.

## Cómo lo pruebo

```
cd frontend
npm test          # 338 pruebas
npm run lint
npx ng serve      # siempre en el puerto 4200 (el CORS del backend solo acepta ese)
```

El backend se levanta con `backend/mvnw.cmd spring-boot:run`. Las cuentas de prueba están en
`database/03-datos-prueba.sql`.

Qué mirar en el navegador:

- **Escritorio:** menú lateral fijo, pestañas, select de municipio, búsqueda, «Ver más», vista
  rápida al hacer clic en una tarjeta y la columna derecha.
- **Celular** (F12 → modo dispositivo, 390 px):
  - la barra inferior queda fija;
  - la lupa lleva a la búsqueda;
  - «Salir» está al final de Mi perfil;
  - el escudo de Administración solo aparece si entras como administrador.

## Qué falta

1. Hacer el merge del PR #15 (lo hago yo).
2. Pruebas finales **separadas** de frontend y backend, cada una con pruebas unitarias y de carga.
3. SonarQube **separado** en la rama `fix/sonar-separado`: un proyecto para el backend y otro
   para el frontend, cada uno con su Quality Gate.
