# Propuesta: subir de nivel por la interacción que recibe el contenido (HU MF04_001)

> **Estado: propuesta, sin programar.** Es una decisión del equipo. Cuando la aprueben (o la
> ajusten), se implementa en una rama aparte.

## Qué hay hoy

Regla actual (punto 8 de `DECISIONES.md`):

- **+10 puntos** por cada noticia publicada (`NIVEL_PUNTOS_PUBLICACION`).
- **−20 puntos** por cada noticia que el administrador oculta o borra (`NIVEL_PUNTOS_PENALIZACION`).
  Si la vuelve a publicar, se devuelven.
- El nivel es el más alto cuyo `puntaje_minimo` (tabla `nivel`: 0, 50 y 150) alcance el usuario.

El problema: la historia de usuario dice que se sube por la **interacción que recibe el
contenido**, no por la cantidad que se publica. Con la regla de hoy, publicar mucho (aunque
sea de baja calidad) basta para subir. Desde la fase 3 ya existen comentarios, calificaciones
y reportes, así que se puede medir lo que la comunidad opina de cada noticia.

## La regla propuesta

Los puntos los gana el **autor** de una noticia **comunitaria** por lo que **otros** hacen con ella.
Lo que hace el propio autor sobre su noticia no cuenta. Todos los valores salen de variables de
entorno, igual que hoy.

| Evento | Puntos (ejemplo) | Variable |
|---|---|---|
| Publicar una noticia | **+2** (antes +10) | `NIVEL_PUNTOS_PUBLICACION` |
| Recibir un comentario de otro usuario (máximo uno que cuente por persona y noticia) | **+2** | `NIVEL_PUNTOS_COMENTARIO_RECIBIDO` |
| Recibir una calificación de otro usuario | **valor − 3**: 5★ = +2, 4★ = +1, 3★ = 0, 2★ = −1, 1★ = −2 | `NIVEL_CALIFICACION_NEUTRA=3`, `NIVEL_PUNTOS_POR_ESTRELLA=1` |
| Un reporte que el administrador marca como **REVISADO** (confirmado) | **−15** | `NIVEL_PUNTOS_REPORTE_CONFIRMADO` |
| Un reporte **DESCARTADO** | 0 | — |
| El administrador oculta o borra la noticia (moderación) | **−20** (sin cambio) | `NIVEL_PUNTOS_PENALIZACION` |
| Tope de puntos que puede dar una sola noticia | **30** | `NIVEL_TOPE_POR_NOTICIA` |

Reglas de cálculo:

1. **Si alguien cambia su calificación**, se resta lo que daba la anterior y se suma lo de la
   nueva (de 5★ a 2★: −2 y luego −1, en total −3).
2. **Si se borra un comentario**, se quitan los puntos que dio.
3. **El tope por noticia** evita que una sola noticia viral (o un grupo de amigos) suba a
   alguien de nivel de un golpe. Las penalizaciones no tienen tope.
4. **El puntaje nunca baja de 0** y el nivel puede bajar, igual que hoy.
5. **Las noticias oficiales** (del administrador) no dan puntos, igual que hoy.
6. Los niveles y sus puntajes mínimos no cambian: siguen en la tabla `nivel` (0, 50 y 150).

## Ejemplo con números

Laura (nivel 1, 0 puntos) publica 3 noticias en una semana:

| Noticia | Interacción que recibe | Puntos |
|---|---|---|
| «Feria campesina el sábado» | publicar +2; 6 comentarios de 6 personas +12; calificaciones 5, 5, 4, 4, 3 → +2 +2 +1 +1 +0 = +6 | **20** |
| «Hueco en la vía a Chinauta» | publicar +2; 10 comentarios +20; calificaciones 5, 5, 5, 4 → +7 (subtotal 29) | **29** |
| «Dicen que cierran el colegio» | publicar +2; 1 comentario +2; calificaciones 1, 1, 2 → −5; un reporte confirmado −15 | **−16** |

Total: 20 + 29 − 16 = **33 puntos** → sigue en nivel 1 (le faltan 17 para el nivel 2).

La semana siguiente publica una noticia útil que recibe 8 comentarios (+16), cinco
calificaciones de 5★ (+10) y la publicación (+2): 28 puntos más → **61 puntos → nivel 2
(Activo)**, con 10 publicaciones al día.

Con la regla de hoy, esas mismas 4 noticias le darían 40 puntos (nivel 1), y con 5 noticias
cualesquiera habría subido, aunque una fuera un rumor reportado.

## Qué cambiaría en el código

- **`dominio/modelo/ParametrosNiveles`**: los parámetros nuevos de la tabla.
- **`dominio/servicio/CalculadoraNivel`**: métodos nuevos, todos sobre la misma `conPuntaje`
  que ya existe:
  - `sumarComentarioRecibido`, `quitarComentarioRecibido`;
  - `ajustarCalificacionRecibida(usuario, valorAnterior, valorNuevo, niveles)`;
  - `restarReporteConfirmado`.

  El tope por noticia necesita saber cuántos puntos lleva cada noticia: una columna nueva
  `noticia.puntos_otorgados` (migración `V5__…`) o calcularlo con una consulta.
- **Casos de uso** que llaman a la calculadora (sin reglas nuevas en ellos):
  - `ComentariosServicio` al comentar y al borrar;
  - `CalificarNoticiaServicio` al calificar;
  - `ReportesServicio` al marcar REVISADO;
  - `PublicarNoticiaServicio` cambia solo el valor por publicar.
- **`application.yml`, `.env.example` (los dos) y `docker-compose.lite.yml`**: las variables
  nuevas.
- **Pruebas**:
  - `CalculadoraNivelTest`: cada evento, el cambio de calificación, el tope y el piso en 0;
  - las de los tres servicios;
  - una de integración con el ejemplo de Laura.
- **`docs/DECISIONES.md`, punto 8**: se reescribe con la regla aprobada. El texto de
  `TEXTOS_PERFIL.regla` en el frontend también cambia.
- **Datos existentes**: decidir si se recalcula el puntaje de todos con la regla nueva (una
  migración que suma lo que ya recibieron) o si se arranca desde el puntaje actual.

## Lo que el equipo debe decidir

1. ¿Aprueban la regla? ¿Con estos valores u otros?
2. ¿Se recalculan los puntajes actuales o se parte de los que hay?
3. ¿El tope por noticia les parece bien (30)?
