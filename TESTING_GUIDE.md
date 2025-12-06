# 🧪 Guide de Test des Améliorations

Ce guide vous aide à tester et valider toutes les améliorations apportées au projet.

---

## 📋 Prérequis

Avant de commencer les tests :

```bash
# Vérifier Docker
docker --version
docker-compose --version

# Vérifier Node.js
node --version  # Devrait être v24.x

# Vérifier npm
npm --version
```

---

## 🐳 Test 1 : Dockerfile Multi-Stage

### Objectif
Vérifier que le nouveau Dockerfile fonctionne et produit une image optimisée.

### Étapes

```bash
# 1. Nettoyer les anciennes images
docker-compose down -v
docker system prune -a -f

# 2. Builder l'image
docker-compose build

# 3. Vérifier la taille de l'image
docker images | grep prostream

# Résultat attendu : ~250-350 MB (au lieu de ~800-1000 MB)
```

### Vérifications

```bash
# 4. Vérifier que l'utilisateur n'est pas root
docker-compose run --rm app whoami
# Résultat attendu : "nestjs"

# 5. Vérifier que ffmpeg est installé
docker-compose run --rm app ffmpeg -version
# Résultat attendu : version de ffmpeg

# 6. Vérifier que seules les dépendances de prod sont présentes
docker-compose run --rm app npm list --depth=0
# Ne devrait PAS contenir : @nestjs/testing, jest, eslint, etc.
```

### ✅ Critères de Succès

- [ ] Image < 400 MB
- [ ] Utilisateur = `nestjs` (non-root)
- [ ] ffmpeg installé
- [ ] Pas de dépendances de dev

---

## 🏥 Test 2 : Health Checks

### Objectif
Vérifier que les health checks fonctionnent correctement.

### Étapes

```bash
# 1. Démarrer les services
docker-compose up -d

# 2. Attendre 30 secondes (temps de démarrage)
sleep 30

# 3. Vérifier le statut des health checks
docker-compose ps

# Résultat attendu :
# prostream-db    healthy
# prostream-app   healthy
```

### Vérifications Détaillées

```bash
# 4. Inspecter le health check de la DB
docker inspect prostream-db | grep -A 10 Health

# 5. Inspecter le health check de l'app
docker inspect prostream-app | grep -A 10 Health

# 6. Tester manuellement le health check de l'app
curl http://localhost:3000/
# Résultat attendu : Réponse HTTP 200
```

### ✅ Critères de Succès

- [ ] DB status = `healthy` après ~10s
- [ ] App status = `healthy` après ~40s
- [ ] `curl localhost:3000` retourne 200

---

## 🌐 Test 3 : Réseau Docker

### Objectif
Vérifier que le réseau isolé fonctionne.

### Étapes

```bash
# 1. Lister les réseaux
docker network ls | grep prostream

# 2. Inspecter le réseau
docker network inspect prostream-backend_prostream-network

# 3. Vérifier que les deux conteneurs sont sur le réseau
docker network inspect prostream-backend_prostream-network | grep Name
```

### Vérifications

```bash
# 4. Tester la connectivité DB -> App
docker exec prostream-app ping -c 3 db

# 5. Vérifier que l'app peut se connecter à la DB
docker-compose logs app | grep "Database connected"
```

### ✅ Critères de Succès

- [ ] Réseau `prostream-network` existe
- [ ] Les 2 conteneurs sont sur le réseau
- [ ] L'app peut pinguer `db`
- [ ] Connexion DB réussie

---

## 📦 Test 4 : Variables d'Environnement

### Objectif
Vérifier que les variables avec valeurs par défaut fonctionnent.

### Étapes

```bash
# 1. Créer un .env minimal (sans toutes les variables)
cat > .env.test << EOF
JWT_SECRET=test-secret
TMDB_API_KEY=test-key
PROWLARR_API_KEY=test-key
PROWLARR_BASE_URL=http://localhost:9696
ALLDEBRID_API_KEY=test-key
EOF

# 2. Utiliser ce .env
mv .env .env.backup
mv .env.test .env

# 3. Démarrer les services
docker-compose up -d

# 4. Vérifier les variables dans le conteneur
docker exec prostream-app env | grep DB_
```

### Résultat Attendu

```
DB_HOST=db
DB_PORT=5432              # Valeur par défaut
DB_USERNAME=prostream_user # Valeur par défaut
DB_PASSWORD=prostream_password
DB_DATABASE=prostream_db   # Valeur par défaut
```

### Nettoyage

```bash
# Restaurer le .env original
docker-compose down
mv .env.backup .env
```

### ✅ Critères de Succès

- [ ] Les valeurs par défaut sont appliquées
- [ ] L'app démarre sans erreur
- [ ] Connexion DB fonctionne

---

## 🔒 Test 5 : Sécurité

### Objectif
Vérifier les améliorations de sécurité.

### Test 5.1 : Utilisateur Non-Root

```bash
# Vérifier l'utilisateur
docker exec prostream-app id
# Résultat attendu : uid=1001(nestjs) gid=1001(nodejs)

# Vérifier les permissions des fichiers
docker exec prostream-app ls -la /app
# Résultat attendu : owner = nestjs:nodejs
```

### Test 5.2 : .dockerignore

```bash
# Builder l'image en mode verbose
docker-compose build --progress=plain 2>&1 | grep -i "node_modules"

# Résultat attendu : node_modules ne devrait PAS être copié
# (seulement installé via npm ci)
```

### Test 5.3 : Secrets

```bash
# Vérifier que .env n'est pas dans l'image
docker run --rm prostream-backend_app ls -la /app/.env
# Résultat attendu : No such file or directory
```

### ✅ Critères de Succès

- [ ] App tourne avec utilisateur non-root
- [ ] `node_modules` local non copié
- [ ] `.env` non présent dans l'image

---

## ⚡ Test 6 : Performance

### Objectif
Mesurer les améliorations de performance.

### Test 6.1 : Temps de Build

```bash
# Nettoyer
docker-compose down
docker system prune -a -f

# Mesurer le temps de build
time docker-compose build

# Résultat attendu : < 2 minutes (première fois)
```

### Test 6.2 : Temps de Build avec Cache

```bash
# Rebuild sans changement
time docker-compose build

# Résultat attendu : < 10 secondes (grâce au cache)
```

### Test 6.3 : Temps de Démarrage

```bash
# Mesurer le temps de démarrage
time docker-compose up -d

# Attendre que l'app soit healthy
time docker-compose exec app curl -f http://localhost:3000/ || echo "Not ready"

# Résultat attendu : < 40 secondes
```

### Test 6.4 : Utilisation des Ressources

```bash
# Démarrer les services
docker-compose up -d

# Attendre la stabilisation
sleep 30

# Mesurer l'utilisation
docker stats --no-stream prostream-app prostream-db

# Résultat attendu :
# App : < 200 MB RAM
# DB  : < 100 MB RAM
```

### ✅ Critères de Succès

- [ ] Build initial < 2 min
- [ ] Rebuild avec cache < 10s
- [ ] Démarrage < 40s
- [ ] RAM app < 200 MB

---

## 🧪 Test 7 : Fonctionnalités de l'Application

### Objectif
Vérifier que l'application fonctionne toujours correctement.

### Étapes

```bash
# 1. Démarrer les services
docker-compose up -d

# 2. Attendre que l'app soit prête
sleep 40

# 3. Tester l'endpoint de base
curl http://localhost:3000/

# 4. Tester Swagger
curl http://localhost:3000/api

# 5. Vérifier les logs
docker-compose logs app | tail -20
```

### Tests API (avec vos vraies clés API)

```bash
# Test TMDB
curl "http://localhost:3000/tmdb/popular/movie"

# Test Prowlarr (si configuré)
curl "http://localhost:3000/prowlarr/indexers"

# Test Streaming (avec un fichier valide)
# curl "http://localhost:3000/streaming/start-hls" -X POST -H "Content-Type: application/json" -d '{"url":"..."}'
```

### ✅ Critères de Succès

- [ ] Endpoint `/` répond
- [ ] Swagger accessible sur `/api`
- [ ] Pas d'erreurs dans les logs
- [ ] Les endpoints métier fonctionnent

---

## 📊 Test 8 : Volumes et Persistance

### Objectif
Vérifier que les données persistent correctement.

### Étapes

```bash
# 1. Créer des données de test
docker-compose exec db psql -U prostream_user -d prostream_db -c "CREATE TABLE test (id SERIAL PRIMARY KEY, name VARCHAR(50));"
docker-compose exec db psql -U prostream_user -d prostream_db -c "INSERT INTO test (name) VALUES ('test_data');"

# 2. Arrêter les services
docker-compose down

# 3. Redémarrer
docker-compose up -d
sleep 30

# 4. Vérifier que les données existent toujours
docker-compose exec db psql -U prostream_user -d prostream_db -c "SELECT * FROM test;"

# Résultat attendu : La ligne 'test_data' existe
```

### Nettoyage

```bash
docker-compose exec db psql -U prostream_user -d prostream_db -c "DROP TABLE test;"
```

### ✅ Critères de Succès

- [ ] Les données persistent après redémarrage
- [ ] Volume `postgres_data` existe
- [ ] Volume `hls_data` existe

---

## 🔄 Test 9 : CI/CD (GitHub Actions)

### Objectif
Vérifier que le workflow CI/CD fonctionne.

### Prérequis

```bash
# Installer act (pour tester localement)
brew install act  # macOS
# ou
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

### Test Local

```bash
# 1. Tester le job "test"
act -j test

# 2. Tester le job "build"
act -j build

# Note : Le job "docker" nécessite des secrets
```

### Test sur GitHub

```bash
# 1. Pusher sur une branche
git checkout -b test/improvements
git add .
git commit -m "test: Validate improvements"
git push origin test/improvements

# 2. Créer une Pull Request
# 3. Vérifier que le workflow se lance
# 4. Vérifier que tous les jobs passent
```

### ✅ Critères de Succès

- [ ] Job `test` passe (lint + tests)
- [ ] Job `build` passe
- [ ] Job `security` passe (scan Trivy)
- [ ] Couverture de code uploadée

---

## 📝 Checklist Complète

Avant de considérer les tests terminés :

### Docker
- [ ] Image < 400 MB
- [ ] Utilisateur non-root
- [ ] Health checks fonctionnent
- [ ] Réseau isolé fonctionne
- [ ] Volumes persistent

### Sécurité
- [ ] `.env` non dans l'image
- [ ] `node_modules` non copié
- [ ] Scan Trivy passe
- [ ] Utilisateur = nestjs

### Performance
- [ ] Build < 2 min
- [ ] Rebuild < 10s
- [ ] Démarrage < 40s
- [ ] RAM < 200 MB

### Fonctionnalités
- [ ] API répond
- [ ] Swagger accessible
- [ ] Endpoints métier OK
- [ ] Pas d'erreurs logs

### CI/CD
- [ ] Tests passent
- [ ] Build passe
- [ ] Scan sécurité passe
- [ ] Couverture trackée

---

## 🐛 Troubleshooting

### Problème : Image trop grosse

```bash
# Analyser les layers
docker history prostream-backend_app

# Vérifier ce qui est copié
docker run --rm prostream-backend_app du -sh /app/*
```

### Problème : Health check échoue

```bash
# Voir les logs du health check
docker inspect prostream-app | jq '.[0].State.Health'

# Tester manuellement
docker exec prostream-app curl -f http://localhost:3000/
```

### Problème : Connexion DB échoue

```bash
# Vérifier que la DB est healthy
docker-compose ps

# Tester la connexion
docker exec prostream-app nc -zv db 5432

# Voir les logs
docker-compose logs db
```

### Problème : Variables d'environnement

```bash
# Lister toutes les variables
docker exec prostream-app env

# Vérifier une variable spécifique
docker exec prostream-app printenv DB_HOST
```

---

## 📊 Rapport de Test

Après avoir exécuté tous les tests, remplissez ce rapport :

```markdown
# Rapport de Test - Améliorations ProStream

**Date :** ___________
**Testeur :** ___________

## Résultats

| Test | Statut | Notes |
|------|--------|-------|
| Dockerfile Multi-Stage | ⬜ Pass / ⬜ Fail | |
| Health Checks | ⬜ Pass / ⬜ Fail | |
| Réseau Docker | ⬜ Pass / ⬜ Fail | |
| Variables d'Env | ⬜ Pass / ⬜ Fail | |
| Sécurité | ⬜ Pass / ⬜ Fail | |
| Performance | ⬜ Pass / ⬜ Fail | |
| Fonctionnalités | ⬜ Pass / ⬜ Fail | |
| Volumes | ⬜ Pass / ⬜ Fail | |
| CI/CD | ⬜ Pass / ⬜ Fail | |

## Métriques

- Taille de l'image : _______ MB
- Temps de build : _______ s
- Temps de démarrage : _______ s
- RAM utilisée : _______ MB

## Problèmes Rencontrés

___________________________________________
___________________________________________

## Recommandations

___________________________________________
___________________________________________
```

---

**Bon test ! 🧪**
