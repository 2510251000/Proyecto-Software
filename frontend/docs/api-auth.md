# Contexto para conectar el Frontend (Angular) con el Backend

Estoy trabajando en el frontend de *Al Día: Portal de Noticias* con Angular. Mi compañero
David ya construyó el backend en Spring Boot con arquitectura hexagonal, y hasta ahora tiene
listos dos endpoints de autenticación, ya probados y funcionando contra una base de datos
PostgreSQL real. Necesito que me ayudes a conectar mis pantallas de registro y login a esta
API.

## Datos del backend

- URL base: `http://localhost:8080`
- El backend corre localmente en el puerto 8080 mientras no esté desplegado en un servidor.

## Endpoint 1: Registro de usuario

- Método: `POST`
- Ruta: `/api/auth/registro`
- Cuerpo de la petición (JSON):

```json
{
  "correo": "usuario@correo.com",
  "contrasena": "unaContrasena123"
}
```

- Validaciones que aplica el backend (si no se cumplen, responde con error 400):
  - `correo`: obligatorio, debe tener formato de correo válido.
  - `contrasena`: obligatoria, mínimo 8 caracteres.

- Respuesta exitosa (código 201 Created):

```json
{
  "id": 3,
  "correo": "usuario@correo.com",
  "rol": "USUARIO_COMUN"
}
```

- Si el correo ya está registrado, el backend responde con un error (por ahora sin formato
  final de error, eso lo estamos afinando del lado del backend).

## Endpoint 2: Inicio de sesión

- Método: `POST`
- Ruta: `/api/auth/login`
- Cuerpo de la petición (JSON):

```json
{
  "correo": "usuario@correo.com",
  "contrasena": "unaContrasena123"
}
```

- Respuesta exitosa (código 200 OK):

```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9....."
}
```

- Ese `token` es un JWT que el backend espera recibir luego en el header `Authorization` de
  las peticiones que requieran estar logueado, con el formato:

```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.....
```

(Todavía no tenemos ningún endpoint protegido probado con este token, así que por ahora
guardemos el token en el frontend, pero sin necesidad de usarlo activamente aún.)

- Si el correo o la contraseña son incorrectos, el backend responde con un error genérico
  (sin decir cuál de los dos falló, por seguridad).

## Lo que necesito que me ayudes a hacer

1. Crear un servicio de Angular (`AuthService` o similar) que tenga dos métodos:
   `registrar(correo, contrasena)` y `iniciarSesion(correo, contrasena)`, usando
   `HttpClient` para llamar a los endpoints de arriba.
2. Conectar el formulario de registro que ya tengo (o que voy a crear) para que llame a
   `registrar()` y muestre un mensaje de éxito o error según la respuesta.
3. Conectar el formulario de login para que llame a `iniciarSesion()`, y si la respuesta es
   exitosa, guarde el token (por ahora en una variable o en `localStorage`, lo que
   recomiendes) y redirija a la pantalla principal.
4. Manejar los errores de validación (400) y de credenciales inválidas mostrando un mensaje
   claro al usuario, sin tecnicismos.

## Importante

- David (backend) todavía tiene pendiente habilitar CORS en su lado. Si al hacer las
  pruebas aparece un error de CORS en la consola del navegador, avísame para decirle a él
  que lo habilite — no es algo que se arregle desde Angular.
- No inventes otros endpoints ni cambies los nombres de los campos (`correo`, `contrasena`);
  el backend los espera exactamente así, en español y sin tildes en las claves JSON.
