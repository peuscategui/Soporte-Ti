# Script de build para EFC Soporte TI (PowerShell)
Write-Host "🚀 Construyendo EFC Soporte TI..." -ForegroundColor Green

# Verificar que Docker esté instalado
try {
    docker --version | Out-Null
    Write-Host "✅ Docker encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está instalado. Por favor instala Docker primero." -ForegroundColor Red
    exit 1
}

# Construir la imagen Docker
Write-Host "📦 Construyendo imagen Docker..." -ForegroundColor Yellow
docker build -t soporte-efc:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Imagen construida exitosamente: soporte-efc:latest" -ForegroundColor Green
    
    # Mostrar información de la imagen
    Write-Host "📊 Información de la imagen:" -ForegroundColor Cyan
    docker images soporte-efc:latest
    
    Write-Host ""
    Write-Host "🎉 Build completado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para ejecutar el contenedor:" -ForegroundColor Yellow
    Write-Host "  docker run -d -p 3001:3001 --name soporte-efc soporte-efc:latest" -ForegroundColor White
    Write-Host ""
    Write-Host "Para usar Docker Compose:" -ForegroundColor Yellow
    Write-Host "  docker-compose up -d" -ForegroundColor White
    Write-Host ""
    Write-Host "Para ver los logs:" -ForegroundColor Yellow
    Write-Host "  docker logs soporte-efc" -ForegroundColor White
} else {
    Write-Host "❌ Error construyendo la imagen Docker" -ForegroundColor Red
    exit 1
}
