#!/bin/bash

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}>>> Démarrage de l'environnement de TEST LOCAL ProStream...${NC}"

# 1. Créer le réseau Docker partagé s'il n'existe pas
echo -e "${BLUE}1. Vérification du réseau Docker...${NC}"
docker network create prostream-network 2>/dev/null || true

# 2. Lancer la Stack Application (DB, Redis, Apps, Nginx)
echo -e "${BLUE}2. Démarrage de la Stack Production (App + Nginx)...${NC}"
# On utilise --build pour être sûr d'avoir la dernière version du code
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Lancer la Stack Monitoring (Prometheus, Grafana)
echo -e "${BLUE}3. Démarrage de la Stack Monitoring...${NC}"
docker-compose -f docker-compose.monitoring.yml up -d

echo -e "${GREEN}>>> ✅ TOUT EST DÉMARRÉ !${NC}"
echo ""
echo -e "🌐  ${GREEN}API via Nginx Load Balancer :${NC} http://localhost"
echo -e "    (Redirige vers HTTPS localhost, acceptez le certificat auto-signé ou l'erreur de sécurité)"
echo ""
echo -e "📊  ${GREEN}Grafana (Monitoring)        :${NC} http://localhost:3001"
echo -e "    Login:    admin"
echo -e "    Password: prostream_admin"
echo ""
echo -e "📈  ${GREEN}Prometheus (Métriques)      :${NC} http://localhost:9090"
echo ""
echo -e "📝  ${BLUE}Pour voir les logs de l'app :${NC} docker-compose -f docker-compose.prod.yml logs -f app1"
echo -e "🛑  ${BLUE}Pour tout arrêter           :${NC} ./stop-local.sh"
