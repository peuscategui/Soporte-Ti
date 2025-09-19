#!/bin/bash

# Script para inicializar el repositorio Git
echo "🔧 Inicializando repositorio Git para EFC Soporte TI..."

# Inicializar Git si no existe
if [ ! -d ".git" ]; then
    echo "📁 Inicializando repositorio Git..."
    git init
else
    echo "✅ Repositorio Git ya existe"
fi

# Agregar todos los archivos
echo "📝 Agregando archivos al repositorio..."
git add .

# Hacer commit inicial
echo "💾 Creando commit inicial..."
git commit -m "feat: Initial commit - EFC Soporte TI microservice

- Dashboard con estadísticas en tiempo real
- Gestión de tickets de soporte
- Gráficos interactivos con Chart.js
- Filtros por fechas dinámicos
- Dockerizado para despliegue
- Health check endpoint
- Configuración para EasyPanel"

echo "✅ Repositorio Git inicializado exitosamente!"
echo ""
echo "Para conectar con GitHub:"
echo "1. Crear un repositorio en GitHub"
echo "2. Ejecutar: git remote add origin <URL_DEL_REPOSITORIO>"
echo "3. Ejecutar: git push -u origin main"
echo ""
echo "Para construir la imagen Docker:"
echo "  ./build.sh"
echo ""
echo "Para desplegar en EasyPanel:"
echo "  Usar el contenido de deploy-easypanel.yml"
