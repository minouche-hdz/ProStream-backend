# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:24-alpine AS dependencies

WORKDIR /app

# Copier uniquement les fichiers de dépendances pour optimiser le cache
COPY package*.json ./

# Installer toutes les dépendances (dev + prod)
RUN npm ci --quiet

# ============================================
# Stage 2: Build
# ============================================
FROM node:24-alpine AS build

WORKDIR /app

# Copier les dépendances depuis le stage précédent
COPY --from=dependencies /app/node_modules ./node_modules

# Copier le code source
COPY . .

# Build de l'application
RUN npm run build

# ============================================
# Stage 3: Production
# ============================================
FROM node:24-alpine AS production

# Installer ffmpeg et ffprobe (nécessaires pour le streaming) et su-exec (pour l'entrypoint)
RUN apk add --no-cache ffmpeg su-exec

# Créer un utilisateur non-root pour des raisons de sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copier uniquement les fichiers nécessaires pour la production
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production --quiet && \
    npm cache clean --force

# Copier le code compilé depuis le stage build
COPY --from=build /app/dist ./dist

# Créer le répertoire pour les fichiers HLS temporaires
RUN mkdir -p /app/hls_temp && \
    chown -R nestjs:nodejs /app

# Copier le script d'entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Changer vers l'utilisateur non-root est géré par l'entrypoint
# USER nestjs

ENTRYPOINT ["docker-entrypoint.sh"]

# Définir les variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Exposer le port
EXPOSE 3000

# Health check pour vérifier que l'application est en bonne santé
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Démarrer l'application
CMD ["node", "dist/main.js"]
