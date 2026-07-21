# Dockerfile
FROM node:18-alpine

# Definir entorno de producción
ENV NODE_ENV=production

# Crear directorio de la aplicación
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json para aprovechar la caché de Docker
COPY package*.json ./

# Instalar dependencias de producción y limpiar caché para reducir tamaño de imagen
RUN npm ci --only=production && npm cache clean --force

# Copiar el código fuente y carpetas necesarias del proyecto PayPhone
COPY server.js .
COPY generate-pdf.js .
COPY config.json .
COPY public/ ./public/

# Exponer el puerto de la aplicación (3000 es el configurado en server.js)
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
