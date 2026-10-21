#!/usr/bin/env bash
# Запускает backend (Laravel) и frontend (Next.js) вместе. Ctrl+C останавливает оба.
#   ./scripts/dev.sh              → API :8010, сайт :3010
#   API_PORT=8011 WEB_PORT=3011 ./scripts/dev.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_PORT="${API_PORT:-8010}"
WEB_PORT="${WEB_PORT:-3010}"

[ -f "$ROOT/backend/.env" ] && [ -d "$ROOT/frontend/node_modules" ] || { echo "Сначала: ./scripts/setup.sh"; exit 1; }

trap 'kill 0' EXIT INT TERM
(cd "$ROOT/backend" && PHP_CLI_SERVER_WORKERS=4 php artisan serve --port="$API_PORT" 2>&1 | sed 's/^/[api] /') &
(cd "$ROOT/frontend" && npm run dev -- -p "$WEB_PORT" 2>&1 | sed 's/^/[web] /') &
wait
