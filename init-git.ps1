# Script para inicializar el repositorio Git (PowerShell)
Write-Host "🔧 Inicializando repositorio Git para EFC Soporte TI..." -ForegroundColor Green

# Inicializar Git si no existe
if (-not (Test-Path ".git")) {
    Write-Host "📁 Inicializando repositorio Git..." -ForegroundColor Yellow
    git init
} else {
    Write-Host "✅ Repositorio Git ya existe" -ForegroundColor Green
}

# Agregar todos los archivos
Write-Host "📝 Agregando archivos al repositorio..." -ForegroundColor Yellow
git add .

# Hacer commit inicial
Write-Host "💾 Creando commit inicial..." -ForegroundColor Yellow
git commit -m "feat: Initial commit - EFC Soporte TI microservice

- Dashboard con estadísticas en tiempo real
- Gestión de tickets de soporte
- Gráficos interactivos con Chart.js
- Filtros por fechas dinámicos
- Dockerizado para despliegue
- Health check endpoint
- Configuración para EasyPanel"

Write-Host "✅ Repositorio Git inicializado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Para conectar con GitHub:" -ForegroundColor Yellow
Write-Host "1. Crear un repositorio en GitHub" -ForegroundColor White
Write-Host "2. Ejecutar: git remote add origin <URL_DEL_REPOSITORIO>" -ForegroundColor White
Write-Host "3. Ejecutar: git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "Para construir la imagen Docker:" -ForegroundColor Yellow
Write-Host "  .\build.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Para desplegar en EasyPanel:" -ForegroundColor Yellow
Write-Host "  Usar el contenido de deploy-easypanel.yml" -ForegroundColor White
