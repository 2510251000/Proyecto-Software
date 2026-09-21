# Prompt para Sebastián — Base de datos y Frontend

> Cómo se usa: abre la carpeta del repositorio en VS Code, abre una terminal, escribe
> `claude` y pega este texto completo. Guárdalo también como `frontend/CLAUDE.md`.

---

Vas a ayudarme a construir la **base de datos** y el **frontend** de *Al Día: Portal de
Noticias*, proyecto de la asignatura Ingeniería de Software (Universidad de Cundinamarca).
Lee todo este contexto antes de escribir una línea de código.

## 1. Contexto del sistema

Portal web de noticias locales. Centraliza la información oficial de una comunidad y las
noticias que publican sus propios habitantes. Dos roles:

- **Usuario común**: se registra, lee noticias, comenta, califica de 1 a 5, reporta
  publicaciones y publica sus propias noticias.
- **Administrador**: publica noticias oficiales, consulta cuentas registradas, revisa
  reportes y modera contenido.

## 2. Mi responsabilidad en el equipo

Somos dos. **Yo (Sebastián) hago la base de datos y el frontend en Angular.** David hace
todo el backend en Spring Boot. Yo no toco la carpeta `backend/`; solo consumo la API que él
expone.

Trabajo en `database/` y `frontend/`.

---

# PARTE A — Base de datos

## 3. Stack

PostgreSQL. Los scripts viven en `database/` y se versionan en Git.

```
database/
├── 01-schema.sql          creación de las diez tablas, llaves y restricciones
├── 02-datos-iniciales.sql catálogos: ciudades y niveles
└── README.md              cómo crear la base de datos desde cero
```

## 4. Modelo de datos

Diez tablas. `ciudad` y `nivel` son catálogos; el resto es operación diaria:

`ciudad`, `nivel`, `usuario`, `noticia`, `comentario`, `calificacion`, `reporte`,
`multimedia`, `notificacion`, `historial`.

Todas las relaciones son de uno a muchos, sin tablas intermedias.

Reglas de diseño:

- Nombres de tablas y campos en minúscula y con guion bajo (`fecha_publicacion`).
- Llave primaria propia en cada tabla, con `BIGSERIAL`, llamada `id`. Las llaves
  foráneas se llaman `<tabla>_id` (convención de JPA que usa el backend de David).
- La base de datos se llama `aldia_db`.
- `NOT NULL` en todo lo que sea obligatorio; `UNIQUE` en el correo del usuario.
- Restricción `CHECK` en la calificación para que quede entre 1 y 5.
- Fechas con `TIMESTAMP` y valor por defecto `CURRENT_TIMESTAMP` donde aplique.
- `ON DELETE` explícito en cada llave foránea, decidido caso por caso.

**Nada de valores quemados.** Los niveles de usuario, con sus puntajes y límites diarios,
son **filas de la tabla `nivel`**, no constantes en el código:

| nivel | nombre | puntaje_minimo | limite_noticias_diarias |
|---|---|---|---|
| 1 | Básico | 0 | 3 |
| 2 | Activo | 50 | 10 |
| 3 | Corresponsal Certificado | 150 | 30 |

Lo mismo con las ciudades: van en la tabla `ciudad`, nunca en un arreglo del código.

La tabla `noticia` guarda latitud, longitud y el identificador de lugar que devuelve la API
de Google Maps. **Nunca se guardan mapas ni contenido de Google**, solo esas coordenadas.

---

# PARTE B — Diseño de pantallas en Figma

Antes de programar el frontend, diseño las pantallas. Esto le da al comité algo visual y me
evita improvisar la interfaz mientras escribo código.

Pantallas de la primera entrega:

1. **Login** — correo, contraseña, botón de entrar, enlace a registro, mensaje de error.
2. **Registro** — correo, contraseña, confirmación, botón de crear cuenta.
3. **Listado de noticias** — encabezado con el nombre del portal, tarjetas de noticia con
   título, resumen, ciudad y fecha.
4. **Panel de administrador** (vista inicial) — listado de noticias oficiales y botón de
   publicar.

Estilo: limpio, formal, en blanco y negro con un acento de color. Diseño responsive:
escritorio y móvil.

---

# PARTE C — Frontend en Angular

## 5. Stack

Angular (versión actual), TypeScript en modo estricto, Angular Router, HttpClient.

## 6. Estructura

```
frontend/src/app/
├── core/                    lo que se carga una sola vez
│   ├── services/            AuthService, NoticiaService — aquí van TODAS las llamadas HTTP
│   ├── models/              interfaces TypeScript de cada respuesta de la API
│   ├── guards/              AuthGuard: protege las rutas privadas
│   └── interceptors/        añade el token JWT a cada petición
├── shared/                  componentes reutilizables (botón, campo, tarjeta)
├── features/
│   ├── auth/                login y registro
│   ├── noticias/            listado y detalle
│   └── admin/               panel de administrador
└── environments/            environment.ts, environment.pre.ts, environment.prod.ts
```

## 7. Reglas no negociables

1. **Prohibido `any`** (lo dijo el profesor explícitamente). En `tsconfig.json` van
   `"strict": true` y `"noImplicitAny": true`, y la regla de ESLint
   `@typescript-eslint/no-explicit-any` en nivel `error`. Cada respuesta de la API tiene su
   propia interfaz en `core/models/`.
   - Mal: `login(datos: any): Observable<any>`
   - Bien: `login(datos: CredencialesLogin): Observable<RespuestaAutenticacion>`
2. **Nada de código quemado.** Ninguna URL escrita dentro de un componente o servicio. La
   URL de la API vive en `src/environments/` y se usa como `environment.apiUrl`.
   - Mal: `this.http.post('http://localhost:8080/api/auth/login', datos)`
   - Bien: `this.http.post<RespuestaAutenticacion>(`${environment.apiUrl}/api/auth/login`, datos)`
   Tampoco se queman textos de error, rutas ni roles: van en constantes o en archivos de
   configuración.
3. **Toda llamada HTTP vive en un servicio de `core/services/`.** Los componentes nunca
   llaman a `HttpClient` directamente.
4. **Tres ambientes**: `environment.ts` (DEV), `environment.pre.ts` (PRE) y
   `environment.prod.ts` (PROD), cada uno con su `apiUrl`. La aplicación es la misma; lo
   único que cambia es la configuración.
5. **Nada secreto en Angular.** Todo lo que llega al navegador es inspeccionable por
   cualquiera. Puede ir la URL de la API; jamás una contraseña ni la llave de Google Maps.
6. Formularios con validación reactiva y mensajes de error visibles para el usuario.
7. El token JWT se guarda y se envía mediante el interceptor, nunca pegándolo a mano en cada
   petición.

## 8. Alcance de la primera entrega (comité)

Solo esto:

- Pantalla de **login** funcional: botones que responden, validación de campos, llamada real
  al backend, manejo del error de credenciales incorrectas.
- Pantalla de **registro** funcional, conectada al backend.
- **Listado de noticias** consumiendo `GET /api/noticias`.
- Guard que impide entrar a las rutas privadas sin token.
- Interceptor que adjunta el token.

Endpoints que expone David:

| Endpoint | Método |
|---|---|
| `/api/auth/registro` | POST |
| `/api/auth/login` | POST |
| `/api/usuarios/me` | GET |
| `/api/noticias` | GET |

**Criterio de terminado**: la pantalla funciona contra el backend levantado en local, no hay
un solo `any`, no hay una sola URL quemada, y los errores se le muestran al usuario.

## 9. Git

Trabajo en ramas `feature/...` que salen de `dev`. Nunca hago push directo a `pre` ni a
`main`. Commits en español y descriptivos. Ver la guía de Git del repositorio.

## 10. Cómo quiero que trabajes

- Explícame las cosas en términos sencillos: estoy aprendiendo estas tecnologías.
- Antes de crear archivos, muéstrame la estructura que propones y espera mi visto bueno.
- Avanza por pasos pequeños y verificables. No generes el proyecto entero de una vez.
- Cuando haya varias formas válidas, dime cuáles son y recomiéndame una con su razón.

## 11. Primera tarea

1. Revisa qué hay en el repositorio.
2. Empieza por la base de datos: propón el `01-schema.sql` completo con las diez tablas y
   muéstramelo para revisarlo antes de crear el archivo.
3. Después pasamos al frontend. **No escribas código de Angular todavía**: primero muéstrame
   el plan dividido en tareas pequeñas para llegar al alcance de la sección 8.
