# YGM IZOFLEX — интернет-магазин

Монорепозиторий: витрина и админка на **Next.js**, API и база на **Laravel + PostgreSQL**.

```
stroymarket-next/
├── backend/    Laravel 13 — REST API, PostgreSQL, Sanctum-токены, загрузка фото
└── frontend/   Next.js 16 — витрина (/), админка (/admin), Tailwind v4 + shadcn/ui
```

Старая статическая версия — `/var/www/stroymarket` (там же исходный README с бизнес-правилами).

## Запуск (разработка)

```bash
# 1. База (один раз)
createdb ygm_shop

# 2. Бэкенд → http://localhost:8010
cd backend
composer install
cp .env.example .env && php artisan key:generate   # заполнить DB_*, ADMIN_*, REVALIDATE_SECRET
php artisan migrate --seed
php artisan storage:link
php artisan serve --port=8010

# 3. Фронтенд → http://localhost:3010, админка → http://localhost:3010/admin
cd frontend
npm install
cp .env.example .env.local                          # REVALIDATE_SECRET — тот же, что в backend/.env
npm run dev -- -p 3010
```

Логин и пароль администратора задаются в `backend/.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) и создаются сидером.
Пароль можно сменить в админке: «Настройки сайта» → внизу «Пароль администратора».

> `npm run build` фронтенда требует запущенного бэкенда — страницы берут данные из API.

## Как это работает

- **Витрина** — серверные компоненты Next.js получают данные из `GET /api/*` и кешируют их (тег `cms`).
- **Админка** — `/admin` в том же Next.js. Вход через `/admin-api/login`: токен Sanctum хранится в httpOnly-cookie,
  все запросы идут через прокси `/admin-api/* → Laravel /api/admin/*`. Без cookie `proxy.ts` не пускает в `/admin`.
- **Мгновенное обновление** — после любого изменения в админке Laravel вызывает `POST {FRONTEND_URL}/api/revalidate`,
  и витрина сразу показывает новые данные.
- **Заказы** — `POST /api/orders`. Цены, скидки за комплект и доставка пересчитываются на сервере.
  Менеджеру приходит уведомление в Telegram и/или на e-mail (настраивается в админке → «Уведомления»).

## Что управляется из админки

| Раздел | Что внутри |
|---|---|
| Дашборд | выручка, заказы, средний чек, график за 30 дней, топ товаров, заканчивающиеся |
| Заказы | список со статусами, поиск, карточка заказа, смена статуса, заметка менеджера, звонок/WhatsApp |
| Товары | цены, старая цена (скидка), остатки, бейджи, фото (несколько, порядок), описание, характеристики, калькулятор расхода, «Купите вместе», SEO |
| Категории | название, иконка, цвета плитки, фото, описание, показ в меню, SEO |
| Бренды, Отзывы | справочники для фильтров и блоков главной |
| Статьи | блог `/blog` с обложкой и текстом |
| Страницы | `/delivery`, `/b2b` и любые новые страницы из блоков |
| Доставка | способы, цены, «бесплатно от суммы», нужен ли адрес |
| Подписчики | список и выгрузка CSV |
| Настройки сайта | **все тексты витрины**: контакты, соцсети, шапка, главный баннер, преимущества, заголовки блоков, баннер «Смета», страница товара, корзина, подвал, всплывашка «Купили», SEO, уведомления |

Формат текстов (описания, статьи, страницы): `## Заголовок`, строки `- пункт` — список, пустая строка — новый абзац.

## API

Публичное: `settings`, `home`, `categories`, `brands`, `products` (фильтры `category, brands, q, sale, stock, min, max, sort, page, ids`),
`products/{slug}`, `articles`, `articles/{slug}`, `pages/{slug}`, `delivery-options`, `POST orders`, `POST subscribe`.

Админка (`/api/admin/*`, Bearer-токен): `login`, `me`, `logout`, `password`, `dashboard`, `meta`, `upload`, `settings`,
CRUD `categories`, `brands`, `products`, `reviews`, `articles`, `pages`, `delivery-options`, `orders`, `subscribers` (+ `export`).

## Продакшен (кратко)

- Backend: `APP_ENV=production`, `APP_DEBUG=false`, свой `APP_URL`, `CORS_ALLOWED_ORIGINS` и `FRONTEND_URL` — домен сайта.
- Frontend: `API_URL`/`NEXT_PUBLIC_API_URL` — адрес API, `NEXT_PUBLIC_SITE_URL` — домен, `npm run build && npm start`.
- Nginx: домен → Next.js (порт 3000), `api.домен` → Laravel (php-fpm), `/storage` отдаётся напрямую.
