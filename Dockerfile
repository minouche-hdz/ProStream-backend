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

# Copiez uniquement les dépendances de production
COPY package*.json ./
RUN npm install --omit=dev

# Copiez les fichiers construits depuis le stage de build
COPY --from=builder /app/dist ./dist

# Exposez le port sur lequel l'application NestJS écoute
EXPOSE 3000

# Démarrez l'application NestJS
CMD ["node", "dist/main"]
