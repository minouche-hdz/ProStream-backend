# Stage de build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage de production
FROM node:20-alpine

WORKDIR /app

# Installez FFMPEG
RUN apk add --no-cache ffmpeg

# Créez le répertoire hls_temp et définissez les permissions
RUN mkdir -p /app/hls_temp && chmod -R 777 /app/hls_temp

# Copiez uniquement les dépendances de production
COPY package*.json ./
RUN npm install --omit=dev

# Copiez les fichiers construits depuis le stage de build
COPY --from=builder /app/dist ./dist

# Exposez le port sur lequel l'application NestJS écoute
EXPOSE 3000

# Démarrez l'application NestJS
CMD ["node", "dist/main"]
