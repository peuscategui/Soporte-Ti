#!/bin/bash

# Script de build para EFC Soporte TI
echo "🚀 Construyendo EFC Soporte TI..."

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Construir la imagen Docker
echo "📦 Construyendo imagen Docker..."
docker build -t soporte-efc:latest .

if [ $? -eq 0 ]; then
    echo "✅ Imagen construida exitosamente: soporte-efc:latest"
    
    # Mostrar información de la imagen
    echo "📊 Información de la imagen:"
    docker images soporte-efc:latest
    
    echo ""
    echo "🎉 Build completado exitosamente!"
    echo ""
    echo "Para ejecutar el contenedor:"
    echo "  docker run -d -p 3001:3001 --name soporte-efc soporte-efc:latest"
    echo ""
    echo "Para usar Docker Compose:"
    echo "  docker-compose up -d"
    echo ""
    echo "Para ver los logs:"
    echo "  docker logs soporte-efc"
else
    echo "❌ Error construyendo la imagen Docker"
    exit 1
fi
