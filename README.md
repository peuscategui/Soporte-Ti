# EFC Soporte TI - Microservicio

Sistema de gestión de soporte técnico para EFC, desarrollado como microservicio independiente.

## 🚀 Características

- Dashboard con estadísticas en tiempo real
- Gestión de tickets de soporte
- Gráficos interactivos con Chart.js
- Filtros por fechas dinámicos
- Top 3 de usuarios, áreas y categorías más atendidas
- Diseño responsive y moderno

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Gráficos**: Chart.js, react-chartjs-2
- **Base de datos**: PostgreSQL
- **Íconos**: Lucide React

## 📦 Despliegue con Docker

### Opción 1: Docker Compose (Recomendado)

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd soporte-efc

# Construir y ejecutar
docker-compose up -d
```

### Opción 2: Docker Build

```bash
# Construir la imagen
docker build -t soporte-efc .

# Ejecutar el contenedor
docker run -d -p 3001:3001 --name soporte-efc soporte-efc
```

## 🔧 Variables de Entorno

Crear un archivo `.env` con las siguientes variables:

```env
# Base de datos
DB_HOST=192.168.40.129
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=postgres

# Aplicación
NODE_ENV=production
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🌐 Despliegue en EasyPanel

1. **Subir a GitHub**:
   - Crear repositorio en GitHub
   - Subir el código del microservicio

2. **Configurar en EasyPanel**:
   - Crear nueva aplicación
   - Seleccionar "Docker Compose"
   - Configurar variables de entorno
   - Establecer puerto 3001

3. **Configuración de EasyPanel**:
   ```yaml
   # docker-compose.yml para EasyPanel
   version: '3.8'
   services:
     soporte-efc:
       image: soporte-efc:latest
       ports:
         - "3001:3001"
       environment:
         - NODE_ENV=production
         - DB_HOST=192.168.40.129
         - DB_PORT=5432
         - DB_NAME=postgres
         - DB_USER=postgres
         - DB_PASSWORD=postgres
       restart: unless-stopped
   ```

## 📊 Endpoints de la API

- `GET /api/health` - Health check
- `GET /api/dashboard` - Datos del dashboard
- `GET /api/tickets` - Lista de tickets

## 🔍 Health Check

El servicio incluye un endpoint de health check en `/api/health` que retorna:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "EFC Soporte TI",
  "version": "1.0.0"
}
```

## 📝 Notas de Despliegue

- El servicio corre en el puerto **3001**
- Requiere conexión a la base de datos PostgreSQL
- Incluye health check para monitoreo
- Configurado para reinicio automático
- Optimizado para producción

## 🐛 Troubleshooting

Si el servicio no inicia:

1. Verificar variables de entorno
2. Comprobar conexión a la base de datos
3. Revisar logs del contenedor: `docker logs soporte-efc`
4. Verificar health check: `curl http://localhost:3001/api/health`