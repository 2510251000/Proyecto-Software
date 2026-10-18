# Pendientes que necesitan de ti

## 1. Clave de Google Maps (opcional, la app ya funciona sin ella)
Hoy la ubicación usa **Nominatim (OpenStreetMap)** porque no hay clave de Google en el `.env`.
Si el profesor pide específicamente Google Maps:
1. En Google Cloud Console crea un proyecto, activa **Geocoding API** y crea una clave
   (puede pedir una tarjeta para la cuenta de facturación; el uso de la app cabe en la cuota
   gratuita). Restringe la clave a la Geocoding API.
2. Agrégala en `backend/.env` (y en el `.env` de la raíz si usas Docker):
   `GOOGLE_MAPS_API_KEY=tu_clave`
3. Reinicia el backend. En el log debe salir `Geocodificación: Google Maps Geocoding API`.
   Para forzarlo: `GEO_PROVEEDOR=google` (si falta la clave, el backend no arranca y lo dice).

## 2. Correo de contacto para Nominatim (opcional)
Su política recomienda identificarse. Si quieres, pon en `backend/.env`:
`NOMINATIM_CORREO_CONTACTO=tu_correo`

## 3. URLs reales de TEST y PROD del frontend
`frontend/src/environments/environment.test.ts` y `environment.prod.ts` siguen con las URLs de
ejemplo (`https://api-test.aldia.example`, `https://api.aldia.example`) que ya estaban.

## 4. Cosas que revisar al probar en tu equipo
- **Tu base `aldia_db`**: la primera vez que arranques el backend contra ella, Flyway la marca en
  la versión 2, aplica V3 y carga los datos de demostración (sin borrar nada). Si prefieres no
  tocarla todavía, arranca con `DB_URL=jdbc:postgresql://localhost:5432/aldia_verificacion`
  (la base que usé para verificar; puedes borrarla con `DROP DATABASE aldia_verificacion;`).
- **El volumen de Docker** también se actualiza solo al levantar con `docker compose up --build`.
- No hice push ni PR: la rama `feature/completar-app` está solo en tu equipo.

## 5. Fuera del alcance pedido (no se hizo)
- Comentarios, calificaciones, reportes y multimedia: las tablas existen, pero no estaban en
  los requisitos de esta tarea.
- La colección de Postman (`backend/postman/`) no tiene los endpoints nuevos; Swagger
  (`/swagger-ui.html`) sí los muestra todos.
