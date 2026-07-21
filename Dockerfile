# Dockerfile
FROM node:18-alpine

# Definir entorno de producción
ENV NODE_ENV=production

# Crear directorio de la aplicación
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json primero para aprovechar la caché de capas de Docker
COPY package*.json ./

# Instalar únicamente dependencias de producción y limpiar caché para reducir tamaño de imagen
RUN npm ci --only=production && npm cache clean --force

# Copiar el código fuente y otros recursos estáticos
COPY index.js .
COPY users.json .

# Usar el usuario no-root provisto por la imagen Alpine de Node por seguridad
USER node

# Exponer el puerto de la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "index.js"]
