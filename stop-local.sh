#!/bin/bash

echo "Arrêt de tous les services..."

# Arrêter le monitoring
docker-compose -f docker-compose.monitoring.yml down

# Arrêter la stack de production
docker-compose -f docker-compose.prod.yml down

echo "✅ Tout est arrêté."
