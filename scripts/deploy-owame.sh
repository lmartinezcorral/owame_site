#!/bin/bash
###############################################################################
# Deploy estático Owame (skin owame.app) → Lenovo V110
# Ticket: MOB-OW-DEVOPS-01
# Uso: sudo /usr/local/bin/deploy-owame.sh [--dry-run]
# Alias V110: dow
#
# Solo toca:
#   git  /var/www/repos/owame_site
#   rsync html/ → /var/www/html/owame.app/
# NO toca: /var/www/owame-runtime/html (runtime /app/ → dor)
#          /var/www/html/html (SM) · newachi.mx · wellhu.com
###############################################################################

set -e
set -u

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

REPO_DIR="/var/www/repos/owame_site"
SRC_HTML="${REPO_DIR}/html"
DOCROOT="/var/www/html/owame.app"
SITE_HOST="owame.app"
BACKUP_DIR="/tmp/owame-backups"
LOG_FILE="/var/log/owame-deploy.log"
MAX_BACKUPS=5
DEPLOY_USER="${DEPLOY_USER:-lmartinezcorral}"
GIT_REF="${GIT_REF:-main}"
DRY_RUN=false

if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}[DRY-RUN] Modo de prueba activado${NC}"
fi

log() {
    local level=$1
    shift
    local message="$*"
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE" 2>/dev/null || true

    case $level in
        ERROR) echo -e "${RED}[ERROR]${NC} $message" >&2 ;;
        WARN)  echo -e "${YELLOW}[WARN]${NC} $message" ;;
        INFO)  echo -e "${GREEN}[INFO]${NC} $message" ;;
        *)     echo "[$level] $message" ;;
    esac
}

error_exit() {
    log ERROR "$1"
    exit 1
}

git_as_user() {
    sudo -u "$DEPLOY_USER" -H git -C "$REPO_DIR" "$@"
}

if [[ $EUID -ne 0 ]]; then
    error_exit "Este script debe ejecutarse como root. Usa: sudo $0"
fi

if [[ ! -d "$REPO_DIR/.git" ]]; then
    error_exit "No es un repositorio Git: $REPO_DIR"
fi

if [[ ! -d "$SRC_HTML" ]]; then
    error_exit "Falta ${SRC_HTML} — el DocumentRoot se publica desde html/"
fi

mkdir -p "$BACKUP_DIR" "$DOCROOT"

log INFO "=========================================="
log INFO "Iniciando deployment de Owame (${SITE_HOST})"
log INFO "=========================================="

CURRENT_BRANCH=$(git_as_user rev-parse --abbrev-ref HEAD)
CURRENT_COMMIT=$(git_as_user rev-parse --short HEAD)
log INFO "Rama: $CURRENT_BRANCH  commit: $CURRENT_COMMIT  user git: $DEPLOY_USER"

log INFO "Fetch origin..."
if [[ "$DRY_RUN" == false ]]; then
    git_as_user fetch origin || error_exit "git fetch falló (SSH del usuario ${DEPLOY_USER})"
else
    log INFO "[DRY-RUN] git fetch origin"
fi

if git_as_user rev-parse --verify "origin/${GIT_REF}" >/dev/null 2>&1; then
    REMOTE_REF="origin/${GIT_REF}"
else
    error_exit "No existe origin/${GIT_REF}. En V110 usá: git checkout ${GIT_REF}"
fi

REMOTE_COMMIT=$(git_as_user rev-parse --short "$REMOTE_REF")
log INFO "Remoto ${REMOTE_REF}: $REMOTE_COMMIT"

if [[ "$CURRENT_COMMIT" != "$REMOTE_COMMIT" ]]; then
    log INFO "Cambios a aplicar:"
    git_as_user log --oneline "${CURRENT_COMMIT}..${REMOTE_REF}" | head -10 || true
    if [[ "$DRY_RUN" == false ]]; then
        git_as_user reset --hard "$REMOTE_REF" || error_exit "git reset --hard falló"
        log INFO "Repo actualizado a $(git_as_user rev-parse --short HEAD)"
    else
        log INFO "[DRY-RUN] git reset --hard ${REMOTE_REF}"
    fi
else
    log INFO "Repo ya en ${REMOTE_COMMIT} — se re-sincroniza html/ igual"
fi

# /app/ lo sirve Apache vía Alias al runtime compartido: un html/app/ en el skin
# quedaría oculto y es señal de que alguien copió el panel staff al sitio.
if [[ -e "${SRC_HTML}/app" || -e "${SRC_HTML}/dashboard.html" || -e "${SRC_HTML}/staff-app.html" ]]; then
    error_exit "html/ contiene app/ o panel staff (dashboard.html / staff-app.html). El runtime se publica con dor, no desde el skin."
fi

BACKUP_FILE="${BACKUP_DIR}/owame-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
log INFO "Backup DocumentRoot..."
if [[ "$DRY_RUN" == false ]]; then
    tar -czf "$BACKUP_FILE" -C "$(dirname "$DOCROOT")" "$(basename "$DOCROOT")" 2>/dev/null || log WARN "Backup incompleto, continuo"
    (cd "$BACKUP_DIR" && ls -t owame-backup-*.tar.gz 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f 2>/dev/null || true)
    log INFO "Backup: $BACKUP_FILE"
else
    log INFO "[DRY-RUN] tar → $BACKUP_FILE"
fi

log INFO "rsync ${SRC_HTML}/ → ${DOCROOT}/ (solo este destino)"
if [[ "$DRY_RUN" == false ]]; then
    rsync -a --delete --exclude '.git' --exclude '.gitkeep' "${SRC_HTML}/" "${DOCROOT}/" || error_exit "rsync falló"
    chown -R www-data:www-data "$DOCROOT" || log WARN "chown www-data"
    find "$DOCROOT" -type d -exec chmod 755 {} \; || true
    find "$DOCROOT" -type f -exec chmod 644 {} \; || true
    log INFO "rsync + permisos OK"
else
    log INFO "[DRY-RUN] rsync -a --delete ${SRC_HTML}/ ${DOCROOT}/"
fi

log INFO "Reload Apache..."
if [[ "$DRY_RUN" == false ]]; then
    if systemctl is-active --quiet apache2; then
        systemctl reload apache2 || error_exit "reload apache2 falló"
        log INFO "Apache recargado"
    else
        log WARN "Apache no activo"
    fi
else
    log INFO "[DRY-RUN] systemctl reload apache2"
fi

NEW_COMMIT=$(git_as_user rev-parse --short HEAD)
log INFO "=========================================="
log INFO "Deploy Owame OK  ${CURRENT_COMMIT} → ${NEW_COMMIT}"
log INFO "=========================================="

if [[ "$DRY_RUN" == false ]]; then
    for path in / /app/sign-in.html /api/v1/ready; do
        code=$(curl -sS -o /dev/null -w "%{http_code}" -H "Host: ${SITE_HOST}" "http://127.0.0.1${path}" || echo "000")
        log INFO "Smoke local Host ${SITE_HOST} ${path} → HTTP ${code}"
    done
    pub_code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 15 "https://${SITE_HOST}/" || echo "000")
    log INFO "Smoke público https://${SITE_HOST}/ → HTTP ${pub_code}"
fi

echo ""
echo -e "${GREEN}✓ Deploy Owame completado${NC}"
echo "  Commit:  $NEW_COMMIT"
echo "  Docroot: $DOCROOT"
echo "  Backup:  $BACKUP_FILE"
echo "  Logs:    $LOG_FILE"
echo ""
