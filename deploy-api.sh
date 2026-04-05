#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

COMPOSE_FILE="docker-compose.yml"
GIT_BRANCH="main"
LOG_FILE="deploy-api.log"

API_URL_1=""
API_URL_2=""

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

read_server_urls() {
  local detected_port_1=""
  local detected_port_2=""

  if [ -f "$COMPOSE_FILE" ]; then
    detected_port_1=$(docker compose -f "$COMPOSE_FILE" port matrixmonitor_api_1 8080 2>/dev/null | head -n 1 | sed -E 's/.*:([0-9]+)$/\1/')
    detected_port_2=$(docker compose -f "$COMPOSE_FILE" port matrixmonitor_api_2 8080 2>/dev/null | head -n 1 | sed -E 's/.*:([0-9]+)$/\1/')
  fi

  if [ -z "$detected_port_1" ]; then
    detected_port_1="8081"
  fi

  if [ -z "$detected_port_2" ]; then
    detected_port_2="8082"
  fi

  read -rp "Enter API Server 1 URL (press Enter for http://localhost:${detected_port_1}): " API_URL_1
  read -rp "Enter API Server 2 URL (press Enter for http://localhost:${detected_port_2}): " API_URL_2

  if [ -z "$API_URL_1" ]; then
    API_URL_1="http://localhost:${detected_port_1}"
  fi

  if [ -z "$API_URL_2" ]; then
    API_URL_2="http://localhost:${detected_port_2}"
  fi
}

pull_latest_code() {
  log "Fetching latest code from $GIT_BRANCH..."
  if ! git rev-parse --git-dir > /dev/null 2>&1; then
    error "Not a Git repository. Run from project root."
    exit 1
  fi

  if ! git diff --quiet; then
    warn "Local changes detected. Stashing..."
    git stash
  fi

  git fetch origin "$GIT_BRANCH"
  git checkout "$GIT_BRANCH"
  git pull origin "$GIT_BRANCH"

  LATEST_COMMIT=$(git log -1 --pretty=format:"%h - %s (%an, %ar)")
  success "Code updated. Latest commit: $LATEST_COMMIT"
}

build_dotnet_api() {
  log "Building and publishing API..."
  if [ -d "./api-publish-output" ]; then
    log "Removing old api-publish-output..."
    rm -rf ./api-publish-output
  fi

  if dotnet publish MatrixMonitor.API/MatrixMonitor.API.csproj -c Release -o ./api-publish-output; then
    success "API published to ./api-publish-output"
  else
    error "API publish failed."
    exit 1
  fi
}

docker_up() {
  log "Rebuilding and starting only API services..."
  docker compose -f "$COMPOSE_FILE" up -d --build matrixmonitor_api_1 matrixmonitor_api_2
  success "API containers are running."
}

show_status() {
  log "Current container status:"
  docker compose -f "$COMPOSE_FILE" ps
}

show_urls() {
  echo
  success "Deployment completed."
  echo -e "${GREEN}Server 1 URL:${NC} $API_URL_1"
  echo -e "${GREEN}Server 2 URL:${NC} $API_URL_2"
  log "Follow logs: docker compose -f $COMPOSE_FILE logs -f"
}

main() {
  read_server_urls
  pull_latest_code
  build_dotnet_api
  docker_up
  show_status
  show_urls
}

main