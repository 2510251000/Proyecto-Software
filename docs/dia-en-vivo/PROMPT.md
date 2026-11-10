# Prompt para Claude Code: portada «El día en vivo»

Abre la carpeta del repositorio en VS Code, abre una terminal, escribe `claude` y pega esto:

---

Vamos a rediseñar la portada de Al Día con el diseño «El día en vivo». Todo lo que necesitas está en `docs/dia-en-vivo/`:

- `ESPECIFICACION.md`: las reglas completas (variables, lógica del día, medidas, componentes, orden de trabajo y cuándo está terminado). Es la fuente de verdad.
- `referencia-tarde.html`, `referencia-dia.html` y `referencia-atardecer.html`: el mismo diseño en tres momentos del día. Ábrelos y míralos antes de proponer nada.

La idea, en corto:

- La portada deja de ser una lista. Arriba va la noticia principal a pantalla completa, con su foto y un velo azul, como el login.
- Al pie de esa foto hay un arco del amanecer al atardecer, con el sol en la hora actual y una marca por cada noticia del día, a la hora en que se publicó.
- Si el usuario arrastra el sol (un `input type="range"` real) o toca una marca, vuelve atrás en el día: cambian la noticia de la portada, la foto, el tinte de la luz, el tema y el reloj grande de la derecha. «Volver a ahora» lo regresa.
- Desde las 5:30 p. m. la portada pasa a tema de noche. De 6 p. m. a 6 a. m. el astro es la luna.
- Debajo va un mosaico de fichas: una de foto grande, «Dónde está pasando» (los municipios como puntos que laten), «Tu nivel» con un anillo, una ficha ámbar, tarjetas con foto, «Avisos cerca de ti» y el resto de noticias.
- En escritorio el menú lateral pasa a ser una barra superior en todas las pantallas. El celular conserva sus barras.

Antes de tocar código:

1. Revisa `git status`. Estoy en `feature/login-noticias`: tiene 4 commits sin subir, su rama remota quedó apuntando a `feature/rediseno-portada` y le lleva 16 commits a `dev`. Explícame cómo está y pregúntame antes de arreglar nada. Quiero cerrar ese trabajo primero (subirlo y PR a `dev`) y no mezclarlo con este rediseño.
2. Cuando eso esté en `dev`, crea `feature/dia-en-vivo` desde `dev` actualizado. La carpeta `docs/dia-en-vivo/` va en el primer commit de la rama nueva.
3. Lee `frontend/CLAUDE.md`, la especificación completa y el código que vas a cambiar: `shared/marco`, `features/noticias/listado` con sus piezas, `shared/tarjeta-noticia` y `styles.css`.
4. Muéstrame el plan con los 9 pasos de la sección 10 de la especificación. Si algo de la especificación no cuadra con el código, dímelo ahí. Espera mi visto bueno antes de empezar.

Reglas:

- Solo frontend. No cambies servicios, modelos, rutas, guards, el interceptor ni nada de `backend/`. No hay endpoints ni peticiones nuevas: todo sale de `AlmacenNoticias`, `PerfilService` y `CampanaNotificaciones`.
- Respeta `frontend/CLAUDE.md`: sin `any`, sin textos ni rutas quemados (van en `core/constants/`), y las llamadas HTTP solo en `core/services/`.
- La lógica del día (momento, tema, posición del sol y su inversa, día mostrado, noticia en portada) va en funciones puras en `core/utils/`, con pruebas. Los componentes solo las usan.
- Sin librerías nuevas: las animaciones son CSS y se apagan con `prefers-reduced-motion`.
- El tema de noche es solo de la portada. El modal de la noticia, el detalle y las demás pantallas siguen en claro.
- No inventes funciones ni datos que la app no tiene.
- Un commit por paso. Después de cada uno corre `npm run lint` y `npm test` dentro de `frontend/` y dime cómo quedaron. Las pruebas que fallen por el HTML nuevo se actualizan, no se borran.
- Al terminar cada paso dime qué revisar en el navegador (levanto la app con `.\iniciar-dev.ps1` y entro con `activo@aldia.com` / `Usuario12345`), a 1440 px y a 390 px. Para ver la noche y el amanecer sin esperar la hora, dime cómo simularlos sin dejar código de prueba en la app.
- Explícame en palabras sencillas lo que haces; estoy aprendiendo.

Cuando todo esté listo, abre el PR de `feature/dia-en-vivo` a `dev` y revisa que el Quality Gate de SonarQube Cloud quede en verde. El merge lo hago yo.
