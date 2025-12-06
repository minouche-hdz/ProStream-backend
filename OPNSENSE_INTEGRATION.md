# 🛡️ Guide d'Intégration OPNsense & HAProxy

Ce guide explique comment configurer votre pare-feu OPNsense (utilisant HAProxy) pour fonctionner avec la nouvelle architecture Docker (Nginx interne).

---

## 🏗️ Architecture

```
Internet (HTTPS 443)
      ⬇
[OPNsense / HAProxy]  <-- Gère le SSL (Let's Encrypt)
      ⬇ (HTTP 80)
[Serveur Docker]      <-- Votre machine (ex: 192.168.1.50)
      ⬇ (Port 80)
[Conteneur Nginx]     <-- Load Balancer interne
      ⬇
[Conteneurs App]      <-- App1, App2, App3
```

---

## 🚀 Étape 1 : Lancement des Services

Avant de configurer OPNsense, assurez-vous que tous vos services Docker tournent.

Assurez-vous que le réseau existe d'abord :
```bash
docker network create prostream-network || true
```

Lancez l'application (Prod) + le Monitoring :
```bash
# 1. Lancer l'app principale (DB, Apps, Redis, Nginx Interne)
docker-compose -f docker-compose.prod.yml up -d

# 2. Lancer le monitoring (Prometheus, Grafana)
docker-compose -f docker-compose.monitoring.yml up -d
```

Vérifiez que tout tourne :
- API via Nginx interne : `http://IP_DE_VOTRE_SERVEUR:80`
- Grafana : `http://IP_DE_VOTRE_SERVEUR:3001` (Login: `admin` / `prostream_admin`)

---

## ⚙️ Étape 2 : Configuration OPNsense HAProxy

Connectez-vous à votre interface OPNsense > Services > HAProxy.

### 1. Configuration du "Real Server" (Le backend)
Allez dans **Settings > Real Servers**.
Créez un nouveau serveur :
- **Name** : `prostream_docker_host`
- **Description** : Serveur Docker Nginx
- **Type** : `static`
- **IP** : `192.168.x.x` (L'IP locale de la machine qui fait tourner Docker)
- **Port** : `80` (Le port exposé par le conteneur Nginx dans `docker-compose.prod.yml`)
- **SSL** : ❌ (Ne pas cocher, OPNsense gère le SSL, la liaison interne est en HTTP)

### 2. Configuration du "Backend Pool"
Allez dans **Settings > Virtual Services > Backend Pools**.
Créez un nouveau pool :
- **Name** : `bk_prostream`
- **Servers** : Sélectionnez `prostream_docker_host`
- **Health Check** : `HTTP` (optionnel, mais recommandé)
  - **Check path** : `/health` (Notre Nginx répond sur ce chemin)

### 3. Configuration des Règles (Conditions & Rules)
Si vous hébergez d'autres services, vous avez besoin d'une condition pour diriger le trafic.

**Condition :**
- **Name** : `cond_host_prostream`
- **Condition type** : `Host matches`
- **Value** : `api.votredomaine.com` (Votre nom de domaine)

**Rule :**
- **Name** : `rule_prostream`
- **Select conditions** : `cond_host_prostream`
- **Execute function** : `Use specified Backend Pool`
- **Use backend pool** : `bk_prostream`

### 4. Configuration du "Public Service" (Frontend)
Allez dans **Settings > Virtual Services > Public Services**.
Modifiez votre Frontend HTTPS existant (celui qui écoute sur 0.0.0.0:443 avec SSL activé) :
- **Rules** : Ajoutez `rule_prostream` à la liste des règles.
- Assurez-vous que **SSL Offloading** est coché.

Cliquez sur **Apply** en bas de page.

---

## 📊 Étape 3 : Accès au Monitoring

Pour accéder à Grafana depuis l'extérieur, vous avez deux choix :

### Option A : Tunnel SSH (Le plus sécurisé pour l'admin)
Ne pas exposer Grafana sur Internet. Accédez-y via :
```bash
ssh -L 3001:localhost:3001 user@192.168.x.x
```
Puis ouvrez `http://localhost:3001` dans votre navigateur.

### Option B : Exposer via HAProxy (Si nécessaire)
1. Créez un **Real Server** pour Grafana (IP: `192.168.x.x`, Port: `3001`).
2. Créez un **Backend Pool** `bk_grafana`.
3. Créez une **Condition** (ex: `monitor.votredomaine.com`).
4. Créez une **Rule** et l'ajouter au Frontend.

---

## ⚠️ Notes Importantes pour le SSL

Dans le fichier `nginx/prostream.conf`, j'ai configuré un bloc HTTPS.
**Puisque OPNsense gère le SSL**, vous utiliserez principalement le bloc **port 80** de l'Nginx interne.

Si vous avez des problèmes de redirection infinie ("Too many redirects"), assurez-vous que Nginx comprend qu'il est derrière un proxy SSL.

Dans `nginx/prostream.conf`, vérifiez que vous avez bien :
```nginx
location / {
    proxy_set_header X-Forwarded-Proto $scheme;
    # ...
}
```
OPNsense envoie généralement le header `X-Forwarded-Proto: https`, ce qui permet à l'app de savoir qu'elle est sécurisée même si elle reçoit du HTTP.
