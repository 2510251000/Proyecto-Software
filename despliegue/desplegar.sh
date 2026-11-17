#!/usr/bin/env bash
# ============================================================================
#  Despliegue de Al Día, todo en planes gratuitos y sin tarjeta.
#
#    Frontend (Angular)       → Firebase Hosting (plan Spark)   https://PROYECTO.web.app
#    Inicio con Google        → Firebase Authentication
#    Backend (Spring Boot)    → Render (plan free, Docker)      https://aldia-backend.onrender.com
#    Base de datos y fotos    → Neon (PostgreSQL)
#
#  Uso (desde la raíz del repositorio, en Git Bash):
#      despliegue/desplegar.sh            # backend y frontend
#      despliegue/desplegar.sh backend    # solo el backend
#      despliegue/desplegar.sh frontend   # solo el frontend
#
#  Requisitos: despliegue/produccion.env lleno (con RENDER_API_KEY), firebase login hecho y
#  la rama actual subida a GitHub (Render construye desde GitHub).
# ============================================================================
set -euo pipefail

cd "$(dirname "$0")/.."
QUE="${1:-todo}"
SECRETOS="despliegue/produccion.env"

[ -f "$SECRETOS" ] || { echo "Falta $SECRETOS"; exit 1; }
# Lee las variables CLAVE=VALOR del archivo de secretos (sin ejecutarlo).
while IFS='=' read -r clave valor; do
  [[ -z "$clave" || "$clave" == \#* ]] && continue
  export "$clave=$valor"
done < <(tr -d '\r' < "$SECRETOS")

[ -n "${FIREBASE_PROYECTO:-}" ] || { echo "Falta FIREBASE_PROYECTO en $SECRETOS"; exit 1; }

desplegar_backend() {
  RAMA=$(git rev-parse --abbrev-ref HEAD)
  if ! git ls-remote --exit-code --heads origin "$RAMA" >/dev/null; then
    echo "La rama $RAMA no está en GitHub: súbela con «git push -u origin $RAMA»"; exit 1
  fi
  node despliegue/render.mjs "$RAMA"
}

desplegar_frontend() {
  echo "==> Frontend: compilando para producción"
  (cd frontend && npx ng build)
  echo "==> Frontend en Firebase Hosting"
  firebase deploy --only hosting --project "$FIREBASE_PROYECTO"
  echo "Listo: https://$FIREBASE_PROYECTO.web.app"
}

case "$QUE" in
  backend) desplegar_backend ;;
  frontend) desplegar_frontend ;;
  todo) desplegar_backend; desplegar_frontend ;;
  *) echo "Uso: $0 [todo|backend|frontend]"; exit 1 ;;
esac
