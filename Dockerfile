# Utilisez une image Node.js officielle comme base
FROM node:20-alpine

# Définissez le répertoire de travail dans le conteneur
WORKDIR /app

# Copiez package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Installez les dépendances du projet
RUN npm install

# Copiez le reste du code source de l'application
COPY . .

# Construisez l'application NestJS
RUN npm run build

# Exposez le port sur lequel l'application NestJS écoute
EXPOSE 3000

# Démarrez l'application NestJS
CMD ["npm", "run", "start:prod"]
