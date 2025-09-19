# Usar la imagen oficial de Node.js
FROM node:18-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para el build)
RUN npm install

# Copiar el código fuente
COPY . .

# Variables de entorno para configuración del servidor
ARG NEXT_PUBLIC_SERVER_IP
ARG NEXT_PUBLIC_SERVER_PORT
ARG NEXT_PUBLIC_API_URL

# Establecer variables de entorno
ENV NEXT_PUBLIC_SERVER_IP=${NEXT_PUBLIC_SERVER_IP:-localhost}
ENV NEXT_PUBLIC_SERVER_PORT=${NEXT_PUBLIC_SERVER_PORT:-3001}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:3001}

# Construir la aplicación
RUN npm run build

# Exponer el puerto
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["npm", "start"]
