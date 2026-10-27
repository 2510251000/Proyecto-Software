# ============================================================================
#  Al Día — imagen del frontend
#  1. Compila Angular con la configuración "docker" (API en http://localhost:8080).
#  2. Sirve el resultado con nginx, que devuelve index.html en cualquier ruta
#     para que funcionen los enlaces directos como /noticias/5.
# ============================================================================

FROM node:24-alpine AS compilacion
WORKDIR /app

# Primero solo las dependencias: si no cambian, Docker reutiliza esta capa.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx ng build --configuration docker

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=compilacion /app/dist/aldia-app/browser /usr/share/nginx/html
EXPOSE 80
