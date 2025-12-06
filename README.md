## Description

Je souhaite reproduire l'application Overseerr en y ajouter une connexion avec prowlarr pour récupérer les torrents, une connexion avec Alldebrid pour y ajouter le torrent et recupérer l'URL de streaming. Enfin je voudrais donner la possibilité à l'utilisateur de visionner le contenu directement depuis l'application. Cela me permet d'avoir un catalogue illimité avec TMDB.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Endpoints de l'API

Voici la liste des endpoints disponibles dans l'application :

### AppController

- `GET /` : Endpoint de base pour vérifier que l'application est en cours d'exécution.

### AlldebridController

- `POST /alldebrid/add-magnet` : Ajoute un lien magnet à Alldebrid.
- `POST /alldebrid/streaming-link` : Récupère un lien de streaming pour un fichier Alldebrid.
- `GET /alldebrid/magnet-status` : Récupère le statut d'un magnet Alldebrid.
- `POST /alldebrid/streaming-link-magnet` : Ajoute un magnet et récupère directement le lien de streaming.

### ProwlarrController

- `GET /prowlarr/search` : Recherche des torrents via Prowlarr.
- `GET /prowlarr/indexers` : Récupère la liste des indexers configurés dans Prowlarr.

### StreamingController

- `GET /streaming/:filePath` : Permet de streamer un fichier (le chemin doit être validé en production).

### TmdbController

- `GET /tmdb/search` : Recherche des films et séries TV sur TMDB.
- `GET /tmdb/movie/:id` : Récupère les détails d'un film spécifique par son ID TMDB.
- `GET /tmdb/popular/movie` : Récupère la liste des films populaires sur TMDB.
- `GET /tmdb/popular/tv` : Récupère la liste des séries TV populaires sur TMDB.
- `GET /tmdb/tv/:id` : Récupère les détails d'une série TV spécifique par son ID TMDB.


### UsersController

- `POST /users/register` : Enregistre un nouvel utilisateur.
- `POST /users/login` : Connecte un utilisateur et retourne un jeton d'accès.
- `GET /users/profile` : Récupère le profil de l'utilisateur connecté (nécessite une authentification JWT).

## 📚 Documentation

Ce projet dispose d'une documentation complète pour vous aider à comprendre, configurer et améliorer l'application :

### 📖 Documentation Principale
- **[INDEX.md](INDEX.md)** - Index complet de toute la documentation
- **[SUMMARY.md](SUMMARY.md)** - Résumé de toutes les améliorations récentes
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Architecture technique avec diagrammes

### 🐳 Documentation Docker
- **[DOCKER_IMPROVEMENTS.md](DOCKER_IMPROVEMENTS.md)** - Détails des optimisations Docker
- **[.env.example](.env.example)** - Template des variables d'environnement

### 📋 Guides Pratiques
- **[RECOMMENDATIONS.md](RECOMMENDATIONS.md)** - Recommandations d'amélioration et roadmap
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Guide complet de test

**👉 Commencez par [INDEX.md](INDEX.md) pour naviguer dans la documentation !**

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

