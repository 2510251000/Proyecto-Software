# ============================================================================
#  Al Día — arranque del entorno de desarrollo
#
#  Abre dos ventanas: una con el backend (http://localhost:8080) y otra con el
#  frontend (http://localhost:4200). PostgreSQL corre como servicio de Windows,
#  así que no hay que arrancarlo aquí.
#
#  Uso:  .\iniciar-dev.ps1     (desde la carpeta del repositorio)
# ============================================================================

$raiz = $PSScriptRoot

if (-not (Test-Path "$raiz\backend\.env")) {
    Write-Host "Falta el archivo backend\.env. Copia backend\.env.example, completa los valores y vuelve a intentarlo." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "$raiz\frontend\node_modules")) {
    Write-Host "Instalando las dependencias del frontend (solo la primera vez)..." -ForegroundColor Cyan
    Push-Location "$raiz\frontend"
    npm install
    Pop-Location
}

Write-Host "Abriendo el backend en una ventana nueva..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$raiz\backend'; .\mvnw.cmd spring-boot:run"

Write-Host "Abriendo el frontend en otra ventana..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$raiz\frontend'; ng serve --open"

Write-Host ""
Write-Host "Backend:  http://localhost:8080/swagger-ui.html" -ForegroundColor Green
Write-Host "Frontend: http://localhost:4200" -ForegroundColor Green
Write-Host "Para detenerlos, cierra las dos ventanas o presiona Ctrl+C en cada una."
