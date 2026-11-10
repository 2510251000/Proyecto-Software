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

## 5. Hecho después (fases 1 a 6, noviembre de 2026)
- Comentarios, calificaciones, reportes y fotos ya están (fases 2 y 3).
- La colección de Postman ya tiene todos los endpoints (fase 6).

## 6. Decisiones que te tocan a ti
1. **La regla de niveles** (HU MF04_001): la propuesta está en `docs/PROPUESTA-NIVELES.md`. Hoy
   se sigue subiendo por publicar. Cuando el equipo decida, se implementa.
2. **PostgreSQL 17 en Docker**: el contenedor usa `postgres:16-alpine` y tu Windows la 17. Subir
   la imagen a 17 obliga a borrar el volumen `datos-postgres` (o a hacer `pg_dump` y restaurar),
   porque PostgreSQL no abre datos de otra versión mayor. No se cambió.
3. **URL reales de TEST y PROD**: `frontend/src/environments/environment.test.ts` y
   `environment.prod.ts` siguen con las de ejemplo (`https://api-test.aldia.example`,
   `https://api.aldia.example`).

## 7. Riesgos que quedan en las dependencias del frontend
`npm audit fix` (sin `--force`) los bajó de 33 a 22. Los que quedan:
- **2 críticos** (`@angular/build`, y `piscina` que viene con él) y **1 alto** (`vite`):
  herramientas de compilación y del servidor de desarrollo; no llegan al navegador del usuario.
- **1 alto** en `@angular/router`: solo afecta a la renderización en el servidor (SSR), que esta
  app no usa.
- **Moderados** en `vitest` (pruebas) y en la cadena de ESLint (lint): solo en el equipo de
  desarrollo.
- Para quitarlos: `npx ng update @angular/core @angular/cli` dentro de la versión 22 (mueve todos
  los paquetes de Angular juntos) y actualizar `vitest`, `eslint` y `typescript-eslint`. Algunos
  arreglos que propone npm son cambios de versión mayor; por eso no se forzaron.

## 8. Sin probar en un equipo real
- Subir fotos desde la cámara de un celular contra el backend real (las pruebas automáticas
  cubren el endpoint con multipart y la limpieza del EXIF).
- La visual se revisó en Edge contra una API de mentira, no contra tu base.

## 9. Rediseño «El día en vivo» (2026-11-10)
- **Celular**: la portada nueva no tiene ajustes propios para el celular (decisión 74). Si se
  quiere, falta proponer y programar la versión de 390 px.
- **Orden de los PR a `dev`**: hay varios abiertos que dependen unos de otros. Ver el PR de
  `feature/dia-en-vivo` para el orden de merge.
