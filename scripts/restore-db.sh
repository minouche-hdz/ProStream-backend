#!/bin/bash

# ============================================
# ProStream Database Restore Script
# ============================================
# Ce script restaure un backup de la base de données PostgreSQL
#
# Usage:
#   ./scripts/restore-db.sh <backup_file.sql.gz>
#
# Exemple:
#   ./scripts/restore-db.sh backups/prostream_backup_20251206_020000.sql.gz
# ============================================

set -e  # Exit on error

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonctions de log
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier les arguments
if [ -z "$1" ]; then
    log_error "Usage: $0 <backup_file.sql.gz>"
    log_info "Backups disponibles:"
    ls -lh backups/prostream_backup_*.sql.gz 2>/dev/null || log_warn "Aucun backup trouvé"
    exit 1
fi

BACKUP_FILE="$1"

# Vérifier que le fichier existe
if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Fichier de backup non trouvé: $BACKUP_FILE"
    exit 1
fi

# Charger les variables d'environnement
if [ -f .env ]; then
    source .env
else
    log_error "Fichier .env non trouvé"
    exit 1
fi

# Vérifier que les variables nécessaires sont définies
if [ -z "$DB_USERNAME" ] || [ -z "$DB_DATABASE" ]; then
    log_error "Variables DB_USERNAME ou DB_DATABASE non définies dans .env"
    exit 1
fi

# Confirmation
log_warn "⚠️  ATTENTION: Cette opération va ÉCRASER la base de données actuelle!"
log_warn "Base de données: $DB_DATABASE"
log_warn "Backup: $BACKUP_FILE"
read -p "Êtes-vous sûr de vouloir continuer? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    log_info "Restauration annulée"
    exit 0
fi

log_info "Démarrage de la restauration..."

# Décompresser et restaurer
log_info "Décompression et restauration du backup..."
if gunzip -c "$BACKUP_FILE" | docker-compose exec -T db psql -U "$DB_USERNAME" -d "$DB_DATABASE"; then
    log_info "✅ Restauration terminée avec succès!"
else
    log_error "❌ Erreur lors de la restauration"
    exit 1
fi

log_info "Vérification de la base de données..."
docker-compose exec db psql -U "$DB_USERNAME" -d "$DB_DATABASE" -c "\dt"

log_info "Restauration terminée!"
