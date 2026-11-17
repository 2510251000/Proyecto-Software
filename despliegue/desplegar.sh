#!/usr/bin/env bash
# ============================================================================
#  Despliegue de Al Día en Firebase + Cloud Run.
#
#    Frontend (Angular)  → Firebase Hosting   https://PROYECTO.web.app
#    Backend (Spring)    → Cloud Run          (Firebase reenvía /api/** al servicio)
#    Base de datos       → Neon (PostgreSQL)  (DB_URL en produccion.env)
#    Fotos               → Cloud Storage      (bucket montado como carpeta en Cloud Run)
#
#  Uso (desde la raíz del repositorio, en Git Bash):
#      despliegue/desplegar.sh            # backend y frontend
#      despliegue/desplegar.sh backend    # solo el backend
#      despliegue/desplegar.sh frontend   # solo el frontend
#
#  Requisitos: firebase login y gcloud auth login hechos, y despliegue/produccion.env lleno.
# ============================================================================
set -euo pipefail

cd "$(dirname "$0")/.."
# Google Cloud CLI recién instalado puede no estar todavía en el PATH de la terminal.
command -v gcloud >/dev/null || export PATH="$PATH:$(cygpath -u "$LOCALAPPDATA")/Google/Cloud SDK/google-cloud-sdk/bin"
QUE="${1:-todo}"
SECRETOS="despliegue/produccion.env"
REGION="us-east1"
SERVICIO="aldia-backend"

[ -f "$SECRETOS" ] || { echo "Falta $SECRETOS"; exit 1; }
# Lee las variables KEY=VALOR del archivo de secretos (sin ejecutarlo).
while IFS='=' read -r clave valor; do
  [[ -z "$clave" || "$clave" == \#* ]] && continue
  export "$clave=$valor"
done < <(tr -d '\r' < "$SECRETOS")

for variable in FIREBASE_PROYECTO DB_URL DB_USUARIO DB_CONTRASENA JWT_CLAVE_SECRETA ADMIN_CORREO ADMIN_CONTRASENA; do
  [ -n "${!variable:-}" ] || { echo "Falta $variable en $SECRETOS"; exit 1; }
done

PROYECTO="$FIREBASE_PROYECTO"
BUCKET="${PROYECTO}-fotos"

desplegar_backend() {
  echo "==> Proyecto $PROYECTO: activando servicios de Google Cloud"
  gcloud config set project "$PROYECTO" --quiet
  gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com \
    storage.googleapis.com --quiet

  echo "==> Bucket de fotos gs://$BUCKET (privado: las fotos se sirven por la API)"
  if ! gcloud storage buckets describe "gs://$BUCKET" >/dev/null 2>&1; then
    gcloud storage buckets create "gs://$BUCKET" --location="$REGION" \
      --uniform-bucket-level-access --public-access-prevention --quiet
  fi
  NUMERO=$(gcloud projects describe "$PROYECTO" --format='value(projectNumber)')
  CUENTA="${NUMERO}-compute@developer.gserviceaccount.com"
  gcloud storage buckets add-iam-policy-binding "gs://$BUCKET" \
    --member="serviceAccount:$CUENTA" --role="roles/storage.objectAdmin" --quiet >/dev/null

  # El usuario «aldia» de la imagen del backend es uid 100 / gid 101: dueño de la carpeta del bucket.
  # Las variables van en un archivo temporal (no en la línea de comandos) y se borra al terminar.
  VARIABLES=$(mktemp)
  trap 'rm -f "$VARIABLES"' EXIT
  cat > "$VARIABLES" <<YAML
PERFIL_ACTIVO: "prod"
DB_URL: "$DB_URL"
DB_USUARIO: "$DB_USUARIO"
DB_CONTRASENA: "$DB_CONTRASENA"
JWT_CLAVE_SECRETA: "$JWT_CLAVE_SECRETA"
JWT_EXPIRACION_MS: "86400000"
CORS_ORIGENES: "https://$PROYECTO.web.app,https://$PROYECTO.firebaseapp.com"
FIREBASE_PROYECTO: "$PROYECTO"
ADMIN_CORREO: "$ADMIN_CORREO"
ADMIN_CONTRASENA: "$ADMIN_CONTRASENA"
FLYWAY_UBICACIONES: "classpath:db/migration,classpath:db/demo"
IMAGENES_DIRECTORIO: "/app/imagenes"
JAVA_TOOL_OPTIONS: "-XX:MaxRAMPercentage=75 -XX:TieredStopAtLevel=1"
YAML

  echo "==> Backend en Cloud Run ($REGION). La primera vez tarda unos minutos."
  gcloud run deploy "$SERVICIO" \
    --source backend \
    --region "$REGION" \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi --cpu 1 --cpu-boost \
    --min-instances 0 --max-instances 2 \
    --timeout 60 \
    --execution-environment gen2 \
    --add-volume "name=fotos,type=cloud-storage,bucket=$BUCKET,mount-options=uid=100;gid=101" \
    --add-volume-mount "volume=fotos,mount-path=/app/imagenes" \
    --env-vars-file "$VARIABLES" \
    --quiet
}

desplegar_frontend() {
  echo "==> Frontend: compilando para producción"
  (cd frontend && npx ng build)
  echo "==> Frontend en Firebase Hosting"
  firebase deploy --only hosting --project "$PROYECTO"
  echo "Listo: https://$PROYECTO.web.app"
}

case "$QUE" in
  backend) desplegar_backend ;;
  frontend) desplegar_frontend ;;
  todo) desplegar_backend; desplegar_frontend ;;
  *) echo "Uso: $0 [todo|backend|frontend]"; exit 1 ;;
esac
