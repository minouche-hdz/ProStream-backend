#!/bin/bash

# ============================================
# ProStream Database Backup Script
# ============================================
# Ce script crée un backup de la base de données PostgreSQL
# et le compresse avec gzip
#
# Usage:
#   ./scripts/backup-db.sh
#
# Cron (backup quotidien à 2h du matin):
#   0 2 * * * /path/to/prostream/scripts/backup-db.sh
# ============================================

set -e  # Exit on error

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="prostream_backup_${TIMESTAMP}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"
RETENTION_DAYS=7  # Garder les backups pendant 7 jours

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

# Créer le dossier de backup s'il n'existe pas
mkdir -p "$BACKUP_DIR"

log_info "Démarrage du backup de la base de données..."
log_info "Base de données: $DB_DATABASE"
log_info "Utilisateur: $DB_USERNAME"

# Créer le backup
if docker-compose exec -T db pg_dump -U "$DB_USERNAME" "$DB_DATABASE" > "$BACKUP_DIR/$BACKUP_FILE"; then
    log_info "Backup créé: $BACKUP_FILE"
    
    # Compresser le backup
    log_info "Compression du backup..."
    if gzip "$BACKUP_DIR/$BACKUP_FILE"; then
        log_info "Backup compressé: $BACKUP_FILE_GZ"
        
        # Calculer la taille du fichier
        SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE_GZ" | cut -f1)
        log_info "Taille du backup: $SIZE"
    else
        log_error "Erreur lors de la compression"
        exit 1
    fi
else
    log_error "Erreur lors de la création du backup"
    exit 1
fi

# Nettoyer les anciens backups
log_info "Nettoyage des backups de plus de $RETENTION_DAYS jours..."
DELETED=$(find "$BACKUP_DIR" -name "prostream_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete -print | wc -l)
if [ "$DELETED" -gt 0 ]; then
    log_info "$DELETED backup(s) supprimé(s)"
else
    log_info "Aucun ancien backup à supprimer"
fi

# Lister les backups existants
log_info "Backups disponibles:"
ls -lh "$BACKUP_DIR"/prostream_backup_*.sql.gz 2>/dev/null || log_warn "Aucun backup trouvé"

log_info "Backup terminé avec succès!"
