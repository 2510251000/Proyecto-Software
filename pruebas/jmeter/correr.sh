#!/usr/bin/env bash
# ============================================================================
#  Pruebas de carga y estrés de Al Día con Apache JMeter 5.5 (en Docker: no hay
#  que instalar Java ni JMeter).
#
#  Uso (desde la raíz del repositorio, con la app levantada: docker compose up -d):
#      pruebas/jmeter/correr.sh carga     # 50 usuarios durante 3 minutos
#      pruebas/jmeter/correr.sh estres    # escalones de 50, 100, 200 y 400 usuarios
#      pruebas/jmeter/correr.sh carga -Jvisitantes=60 -Jduracion=300   # con otros valores
#
#  Resultado en pruebas/jmeter/resultados/<plan>/:
#      informe/index.html   informe de JMeter (tiempos, errores, usuarios, percentiles)
#      resultados.jtl       cada petición, para abrirla en JMeter
#      recursos.csv         CPU y memoria de los contenedores cada 10 s
#
#  Los planes (.jmx) también se abren en la interfaz gráfica de JMeter.
# ============================================================================
set -euo pipefail

cd "$(dirname "$0")/../.."
PLAN="${1:?Uso: pruebas/jmeter/correr.sh carga|estres [-Jpropiedad=valor ...]}"
shift
[ -f "pruebas/jmeter/$PLAN.jmx" ] || { echo "No existe pruebas/jmeter/$PLAN.jmx"; exit 1; }
RED="${RED_DOCKER:-aldia_default}"
SALIDA="pruebas/jmeter/resultados/$PLAN"

docker compose ps --status running --services | grep -qx backend || { echo "Levanta la app primero: docker compose up -d"; exit 1; }
rm -rf "$SALIDA" && mkdir -p "$SALIDA"

# CPU y memoria de los contenedores mientras corre la prueba.
echo "momento,contenedor,cpu,memoria" > "$SALIDA/recursos.csv"
(
  while true; do
    docker stats --no-stream --format "{{.Name}},{{.CPUPerc}},{{.MemUsage}}" 2>/dev/null \
      | grep aldia | sed "s/^/$(date +%H:%M:%S),/" >> "$SALIDA/recursos.csv"
    sleep 10
  done
) &
VIGIA=$!
trap 'kill $VIGIA 2>/dev/null || true' EXIT

# En Git Bash para Windows Docker necesita la ruta de Windows y sin conversión de rutas.
CARPETA="$(pwd)/pruebas/jmeter"
command -v cygpath >/dev/null && CARPETA="$(cygpath -w "$CARPETA")"

MSYS_NO_PATHCONV=1 docker run --rm --network "$RED" -v "$CARPETA:/pruebas" justb4/jmeter:latest \
  -n -t "/pruebas/$PLAN.jmx" \
  -l "/pruebas/resultados/$PLAN/resultados.jtl" \
  -e -o "/pruebas/resultados/$PLAN/informe" \
  -Jjmeter.reportgenerator.apdex_satisfied_threshold=500 \
  -Jjmeter.reportgenerator.apdex_tolerated_threshold=1500 \
  -Jjmeter.reportgenerator.overall_granularity=10000 \
  "$@" | grep -E "summary|Tidying|end of run"

echo "Informe: $SALIDA/informe/index.html"
