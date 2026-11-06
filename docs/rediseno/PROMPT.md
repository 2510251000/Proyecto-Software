# Prompt para Claude Code: rediseño del frontend

Abre la carpeta del repositorio en VS Code, abre una terminal, escribe `claude` y pega esto:

---

Vamos a rediseñar el frontend de Al Día. Todo lo que necesitas está en `docs/rediseno/`:

- `REDISENO.md`: las especificaciones (colores, letras, estructura, componentes y cuándo está terminado).
- `referencia-escritorio.html` y `referencia-celular.html`: cómo debe verse. Míralos antes de proponer nada.

Antes de tocar código:

1. Revisa `git status`. Estoy en `fix/pendientes-tecnicos`, que todavía no está en GitHub y tiene cambios sin guardar (`docs/PENDIENTES.md`, `docs/PRUEBAS-MANUALES.md` y `PROMPT-DAVID.md`). Pregúntame qué hago con ellos. Quiero cerrar esa rama primero (commit, push y PR a `dev`) y no mezclarla con el rediseño.
2. Cuando esa rama esté en `dev`, crea `feature/rediseno-portada` desde `dev` actualizado. La carpeta `docs/rediseno/` va en el primer commit de la rama nueva.
3. Lee `frontend/CLAUDE.md`, `docs/rediseno/REDISENO.md` y los componentes que vas a cambiar.
4. Muéstrame el plan dividido en pasos pequeños, uno por commit, y espera mi visto bueno.

Reglas:

- Solo plantillas, CSS y componentes de presentación. No cambies servicios, modelos, rutas, guards, el interceptor ni nada de `backend/`.
- Respeta `frontend/CLAUDE.md`: sin `any`, sin textos ni rutas quemados (van en `core/constants/`), y las llamadas HTTP solo en `core/services/`.
- No inventes funciones que la app no tiene (compartir, «me gusta», número de comentarios).
- Después de cada paso corre `npm run lint` y `npm test` dentro de `frontend/` y dime cómo quedaron. Las pruebas que fallen por el HTML nuevo se actualizan, no se borran.
- Al terminar cada paso, dime qué revisar en el navegador (levanto la app con `.\iniciar-dev.ps1` y entro con `activo@aldia.com` / `Usuario12345`), en escritorio y en celular (modo dispositivo del navegador, 390 px de ancho).
- Explícame en palabras sencillas lo que haces; estoy aprendiendo.

Cuando todo esté listo, abre el PR de `feature/rediseno-portada` a `dev` y revisa que el Quality Gate de SonarQube Cloud quede en verde. El merge lo hago yo.
