<#
  Al Día — corre una prueba de carga con k6 dentro de Docker (no hay que instalar k6).

  Antes: la aplicación debe estar corriendo con Docker desde la raíz del repositorio:
      docker compose up --build -d

  Uso (desde la raíz del repositorio):
      .\pruebas\carga\correr-carga.ps1 -Parte backend
      .\pruebas\carga\correr-carga.ps1 -Parte frontend
      .\pruebas\carga\correr-carga.ps1 -Parte backend -Usuarios 100 -Duracion 2m

  El resumen queda en pruebas\carga\resultados\ (backend-resumen.txt / frontend-resumen.txt).
#>
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('backend', 'frontend')]
    [string] $Parte,

    [int] $Usuarios = 0,

    [string] $Duracion = '1m'
)

# k6 escribe sus avisos por la salida de errores: no deben detener el script.
$ErrorActionPreference = 'Continue'

# Versión fija de k6 para que el resultado sea igual en cualquier computador.
$imagen = 'grafana/k6:1.0.0'
$carpeta = (Resolve-Path $PSScriptRoot).Path
$script = if ($Parte -eq 'backend') { '/carga/backend/carga-api.js' } else { '/carga/frontend/carga-frontend.js' }
if ($Usuarios -eq 0) {
    $Usuarios = if ($Parte -eq 'backend') { 50 } else { 100 }
}

New-Item -ItemType Directory -Force (Join-Path $carpeta 'resultados') | Out-Null

Write-Host "Prueba de carga del $Parte con $Usuarios usuarios durante $Duracion (más 45 s de subida y bajada)..."
docker run --rm `
    -v "${carpeta}:/carga" `
    -e "USUARIOS=$Usuarios" `
    -e "DURACION=$Duracion" `
    $imagen run $script

if ($LASTEXITCODE -eq 0) {
    Write-Host "Listo: se cumplieron todos los umbrales. Resumen en pruebas\carga\resultados\$Parte-resumen.txt"
} else {
    Write-Host "Algún umbral no se cumplió (código $LASTEXITCODE). Revisa pruebas\carga\resultados\$Parte-resumen.txt"
}
exit $LASTEXITCODE
