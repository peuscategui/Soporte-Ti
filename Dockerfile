# Etapa 1: Build
FROM node:18-alpine AS builder

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias con legacy peer deps para evitar conflictos
RUN npm ci --legacy-peer-deps

# Copiar el código fuente
COPY . .

# Variables de entorno para el build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Construir la aplicación
RUN npm run build

# Etapa 2: Production
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios desde el builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/package*.json ./
# Asegurar que los archivos .mjs se copien al standalone (crear directorio primero)
RUN mkdir -p ./src/lib
COPY --from=builder /app/src/lib/database.mjs ./src/lib/database.mjs
COPY --from=builder /app/src/lib/validators.mjs ./src/lib/validators.mjs

# Cambiar permisos (incluyendo los archivos .mjs copiados)
RUN chown -R nextjs:nodejs /app

USER nextjs

# Exponer el puerto
EXPOSE 3001

ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
