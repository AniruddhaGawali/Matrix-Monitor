#!/bin/bash

# ─────────────────────────────────────────────
# MatrixMonitor - Auto Deploy Script
# Pulls latest code, compiles locally, and
# rebuilds Docker Compose.
# ⛔ Blocked between 12:00 AM - 3:00 AM
# ─────────────────────────────────────────────

set -e  # Exit immediately on any error

# ── Colors for output ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ── Config ──
COMPOSE_FILE="docker-compose.yml"
GIT_BRANCH="main"
LOG_FILE="deploy.log"

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}" | tee -a "$LOG_FILE"
}

# ─────────────────────────────────────────────
# STEP 1: Check if current time is between
#         12:00 AM and 3:00 AM (BLOCKED WINDOW)
# ─────────────────────────────────────────────
check_blackout_window() {
    CURRENT_HOUR=$(date '+%H')  # 24-hour format (00-23)
    
    # Block between 00:00 and 02:59
    if [ "$CURRENT_HOUR" -ge 0 ] && [ "$CURRENT_HOUR" -lt 3 ]; then
        error "🚫 DEPLOYMENT BLOCKED!"
        error "Current time: $(date '+%H:%M %p')"
        error "Deployments are not allowed between 12:00 AM and 3:00 AM."
        error "Please retry after 3:00 AM."
        exit 1
    fi

    success "Time check passed. Current time: $(date '+%H:%M %p'). Proceeding with deployment..."
}

# ─────────────────────────────────────────────
# STEP 2: Pull latest code from Git main branch
# ─────────────────────────────────────────────
pull_latest_code() {
    log "Fetching latest code from Git branch: $GIT_BRANCH..."

    # Check if we are inside a git repo
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Not a Git repository. Please run this script from the project root."
        exit 1
    fi

    # Stash any local changes to avoid conflicts
    if ! git diff --quiet; then
        warn "Local changes detected. Stashing them..."
        git stash
    fi

    git fetch origin "$GIT_BRANCH"
    git checkout "$GIT_BRANCH"
    git pull origin "$GIT_BRANCH"

    LATEST_COMMIT=$(git log -1 --pretty=format:"%h - %s (%an, %ar)")
    success "Code updated. Latest commit: $LATEST_COMMIT"
}

# ─────────────────────────────────────────────
# STEP 3: Build and Publish .NET App Locally
# ─────────────────────────────────────────────
build_dotnet() {
    log "Building and publishing the .NET application..."
    
    # Clean up the old publish directory to ensure a fresh build
    if [ -d "./worker-publish-output" ]; then
        log "Removing old worker-publish-output directory..."
        rm -rf ./worker-publish-output
    fi
    
    # Publish the worker
    if dotnet publish MatrixMonitor.IngestionWorker/MatrixMonitor.IngestionWorker.csproj -c Release -o ./worker-publish-output; then
        success ".NET application published successfully to ./worker-publish-output"
    else
        error ".NET publish failed! Aborting deployment."
        exit 1
    fi
}

# ─────────────────────────────────────────────
# STEP 5: Rebuild and start Docker containers
# ─────────────────────────────────────────────
docker_up() {
    log "Rebuilding and starting only worker service..."

    docker compose -f "$COMPOSE_FILE" up -d --build ingestion_worker

    success "Docker containers are up and running!"
}

# ─────────────────────────────────────────────
# STEP 6: Show running containers
# ─────────────────────────────────────────────
show_status() {
    log "Current running containers:"
    docker compose -f "$COMPOSE_FILE" ps
}

# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
main() {
    echo ""
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}   MatrixMonitor Deployment Script             ${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""

    check_blackout_window   # ⛔ Block 12AM - 3AM
    pull_latest_code        # 📥 Git pull
    build_dotnet            # 🔨 Compile and publish code locally
    docker_up               # 🔼 Rebuild & start
    show_status             # 📋 Show status

    echo ""
    success "🚀 Deployment completed successfully at $(date '+%Y-%m-%d %H:%M:%S')"
    log "Follow the logs with: docker compose -f $COMPOSE_FILE logs -f"
    echo ""
}

main