#!/usr/bin/env bash
# Поднимает проект с нуля: зависимости, .env, база PostgreSQL, миграции, сиды.
# Повторный запуск безопасен: существующие .env и база не перезаписываются.
#
#   ./scripts/setup.sh
#   DB_NAME=ygm_test API_PORT=8011 WEB_PORT=3011 ./scripts/setup.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB_NAME="${DB_NAME:-ygm_shop}"
API_PORT="${API_PORT:-8010}"
WEB_PORT="${WEB_PORT:-3010}"

say() { printf '\n\033[1;31m▸\033[0m \033[1m%s\033[0m\n' "$*"; }
die() { printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

# Записать KEY=VALUE в env-файл (заменить строку или добавить в конец)
set_env() {
  local file=$1 key=$2 value=$3
  if grep -qE "^#? ?${key}=" "$file"; then
    sed -i -E "s|^#? ?${key}=.*|${key}=${value//|/\\|}|" "$file"
  else
    printf '%s=%s\n' "$key" "$value" >>"$file"
  fi
}
get_env() { grep -E "^$2=" "$1" | head -1 | cut -d= -f2- | tr -d '"'; }
random() { LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c "${1:-24}"; }

say "Проверка окружения"
for cmd in php composer node npm psql createdb; do
  command -v "$cmd" >/dev/null || die "Не найдено: $cmd (см. AGENTS.md → «Требования»)"
done
php -r 'exit(version_compare(PHP_VERSION, "8.3", ">=") ? 0 : 1);' || die "Нужен PHP ≥ 8.3, сейчас $(php -r 'echo PHP_VERSION;')"
php -m | grep -qi pdo_pgsql || die "Нет расширения PHP pdo_pgsql (apt install php-pgsql)"
[ "$(node -p 'process.versions.node.split(".")[0]')" -ge 20 ] || die "Нужен Node.js ≥ 20"
echo "PHP $(php -r 'echo PHP_VERSION;'), Node $(node -v), $(psql --version)"

say "Backend: зависимости"
cd "$ROOT/backend"
composer install --no-interaction --prefer-dist --quiet

say "Backend: .env"
if [ ! -f .env ]; then
  cp .env.example .env
  set_env .env APP_URL "http://localhost:${API_PORT}"
  set_env .env DB_DATABASE "$DB_NAME"
  set_env .env DB_USERNAME "${DB_USERNAME:-$USER}"
  set_env .env FRONTEND_URL "http://localhost:${WEB_PORT}"
  set_env .env CORS_ALLOWED_ORIGINS "http://localhost:${WEB_PORT}"
  echo "создан backend/.env"
else
  echo "backend/.env уже есть — не трогаю"
fi
[ -n "$(get_env .env APP_KEY)" ] || php artisan key:generate --no-interaction --quiet
[ -n "$(get_env .env REVALIDATE_SECRET)" ] || set_env .env REVALIDATE_SECRET "$(random 48)"
[ -n "$(get_env .env ADMIN_PASSWORD)" ] || set_env .env ADMIN_PASSWORD "$(random 16)"

say "PostgreSQL: база $(get_env .env DB_DATABASE)"
export PGHOST="$(get_env .env DB_HOST)" PGPORT="$(get_env .env DB_PORT)" PGUSER="$(get_env .env DB_USERNAME)" PGPASSWORD="$(get_env .env DB_PASSWORD)"
DB="$(get_env .env DB_DATABASE)"
if psql -d postgres -Atc "select 1 from pg_database where datname='${DB}'" 2>/dev/null | grep -q 1; then
  echo "база уже существует"
else
  createdb "$DB" 2>/dev/null || die "Не удалось создать базу. Создайте роль: sudo -u postgres createuser -d $PGUSER — и повторите"
  echo "база создана"
fi

say "Backend: миграции и начальные данные"
php artisan migrate --seed --force --no-interaction
php artisan storage:link --no-interaction --quiet 2>/dev/null || true

say "Frontend: зависимости"
cd "$ROOT/frontend"
npm ci --no-audit --no-fund --loglevel=error

say "Frontend: .env.local"
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  set_env .env.local API_URL "http://localhost:${API_PORT}/api"
  set_env .env.local NEXT_PUBLIC_API_URL "http://localhost:${API_PORT}/api"
  set_env .env.local NEXT_PUBLIC_SITE_URL "http://localhost:${WEB_PORT}"
  echo "создан frontend/.env.local"
fi
# Секрет ревалидации всегда синхронизируем с бэкендом
set_env .env.local REVALIDATE_SECRET "$(get_env "$ROOT/backend/.env" REVALIDATE_SECRET)"

say "Готово"
cat <<MSG
  Запуск:   ./scripts/dev.sh
  Сайт:     http://localhost:${WEB_PORT}
  Админка:  http://localhost:${WEB_PORT}/admin
  Вход:     $(get_env "$ROOT/backend/.env" ADMIN_EMAIL) / пароль — ADMIN_PASSWORD в backend/.env
MSG
