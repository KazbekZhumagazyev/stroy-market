# YGM IZOFLEX — руководство для ИИ-агентов

Прочитайте этот файл целиком перед любыми правками. Здесь: что это за проект, как его поднять с нуля,
как он устроен, правила кода и подводные камни. Людям — [README.md](README.md).

**Язык общения с владельцем — русский.** Тексты интерфейса — тоже на русском.

---

## 1. Что это

Интернет-магазин изоляции и стройматериалов **YGM IZOFLEX** (Алматы, валюта ₸).
Монорепозиторий из двух приложений:

| Папка | Стек | Порт (dev) | Роль |
|---|---|---|---|
| `backend/` | Laravel 13, PHP 8.3+, PostgreSQL, Sanctum | 8010 | REST API, база, заказы, загрузка фото |
| `frontend/` | Next.js 16 (App Router, React 19), Tailwind CSS v4, shadcn/ui (на **Base UI**), zustand, SWR | 3010 | витрина `/` и админка `/admin` |

Ключевые решения владельца (не менять без его согласия):
- **Админка — в Next.js** (`/admin`), а не Filament/Nova/Blade. Filament владелец явно отклонил.
- **Все тексты витрины редактируются из админки** — никаких захардкоженных текстов на страницах.
  Новый текст = новое поле в настройках (см. §6).
- База — **PostgreSQL**.
- Дизайн — modern minimal: шрифт Onest, тёплый фон `surface`, белые карточки `rounded-2xl/3xl`, кнопки `rounded-full`,
  красный `brand` только для главных действий и скидок.

## 2. Требования

- PHP ≥ 8.3 с расширениями `pdo_pgsql`, `intl`, `mbstring`, `fileinfo`
- Composer 2
- Node.js ≥ 20 и npm
- PostgreSQL ≥ 14, роль с правом `CREATEDB` для текущего пользователя ОС
  (если нет: `sudo -u postgres createuser -d $USER`)

## 3. Как поднять с нуля (весь сценарий)

```bash
git clone git@github.com:KazbekZhumagazyev/stroy-market.git
cd stroy-market
./scripts/setup.sh     # зависимости, .env, база, миграции, сиды — идемпотентно
./scripts/dev.sh       # API :8010 + сайт :3010, Ctrl+C останавливает оба
```

Что делает `setup.sh` (если нужно повторить вручную):
1. `backend`: `composer install`; `.env` из `.env.example`; `php artisan key:generate`;
   генерирует `REVALIDATE_SECRET` и `ADMIN_PASSWORD`, если пусто.
2. Создаёт базу `DB_DATABASE` (по умолчанию `ygm_shop`) через `createdb`.
   Подключение по умолчанию — **unix-сокет** `DB_HOST=/var/run/postgresql`, пользователь = пользователь ОС, без пароля.
   Для TCP укажите `DB_HOST=127.0.0.1` и `DB_PASSWORD`.
3. `php artisan migrate --seed`, `php artisan storage:link`.
4. `frontend`: `npm ci`; `.env.local` из `.env.example`; копирует `REVALIDATE_SECRET` из `backend/.env`.

Параметры: `DB_NAME=… API_PORT=… WEB_PORT=… ./scripts/setup.sh`.

**Вход в админку:** `http://localhost:3010/admin`, e-mail и пароль — `ADMIN_EMAIL` / `ADMIN_PASSWORD` в `backend/.env`.
Не выводите пароль в чат — говорите, где он лежит.

Сиды намеренно минимальные (просьба владельца): 1 категория «Утеплители», 1 товар (минвата Rockwool), 1 бренд,
1 отзыв, 1 статья, 3 способа доставки, страницы `delivery` и `b2b`. Остальное владелец заводит через админку.
Пустые блоки на главной скрываются автоматически — это ожидаемо.

Порт 3000 на машине владельца занят другим приложением — используйте 3010.

## 4. Архитектура

```
Браузер ──► Next.js :3010
             ├─ (shop)/*       серверные компоненты → fetch Laravel /api/*  (кеш, тег "cms")
             ├─ /admin/*       клиентские страницы → /admin-api/* (прокси Next.js)
             ├─ /admin-api/*   прокси → Laravel /api/admin/* + Bearer-токен из httpOnly-cookie ygm_admin
             └─ /api/revalidate  вебхук от Laravel → revalidateTag("cms")
Laravel :8010
             ├─ /api/*         публичное API витрины
             ├─ /api/admin/*   auth:sanctum
             └─ /storage/*     загруженные фото (public disk)
```

Поток изменений: админ сохраняет → Laravel пишет в БД → трейт `RevalidatesFrontend` после ответа шлёт
`POST {FRONTEND_URL}/api/revalidate {secret}` → Next.js сбрасывает кеш → витрина сразу показывает новое.

### Backend (`backend/`)

| Путь | Что |
|---|---|
| `database/migrations/2026_10_21_140000_create_shop_tables.php` | вся схема магазина одной миграцией |
| `app/Models/*` | Category, Brand, Product (+ `product_bundle`), Review, Article, Page, DeliveryOption, Order, OrderItem, Subscriber, Setting |
| `app/Models/Concerns/HasSlug.php` | авто-slug с транслитерацией (`Str::slug(..., 'ru')`) |
| `app/Models/Concerns/RevalidatesFrontend.php` | ревалидация витрины после save/delete |
| `app/Support/SiteSettings.php` | **все тексты сайта**: значения по умолчанию + слияние с таблицей `settings` |
| `app/Support/ProductFilters.php` | фильтры, сортировки и фасеты каталога |
| `app/Support/OrderService.php` | создание заказа, пересчёт цен, скидка «Купите вместе», доставка |
| `app/Support/OrderNotifier.php` | уведомление о заказе в Telegram / на e-mail |
| `app/Http/Controllers/Api/*` | публичное API |
| `app/Http/Controllers/Admin/*` | API админки; простые разделы наследуют `CrudController` |
| `app/Http/Resources/*` | формат ответов витрины |
| `routes/api.php` | все маршруты |
| `lang/ru/*`, `lang/ru.json` | русские сообщения валидации |

### Frontend (`frontend/src/`)

| Путь | Что |
|---|---|
| `app/(shop)/` | витрина: `page.tsx` главная, `catalog/`, `catalog/[cat]/`, `product/[slug]/`, `cart/`, `favorites/`, `blog/`, `[page]/` (страницы из админки), `account/` |
| `app/(shop)/layout.tsx` | грузит настройки, категории, доставку → `SiteProvider` |
| `app/admin/login`, `app/admin/(panel)/*` | админка |
| `app/admin-api/` | `login/route.ts` и прокси `[...path]/route.ts` |
| `proxy.ts` | (бывший middleware в Next 16) закрывает `/admin` без cookie |
| `lib/api.ts` | серверные запросы к API (`server-only`) |
| `lib/types.ts` | типы API, в т.ч. `Settings` — зеркало `SiteSettings::defaults()` |
| `lib/site.tsx` | контекст витрины (`useSite()`), `clientApi()` для запросов из браузера |
| `lib/store.ts` | корзина/избранное/комплекты (zustand + localStorage `ygm-shop-v2`), `cartTotals()` |
| `lib/admin/client.ts` | `adminFetch`, `useAdmin` (SWR), `uploadFile`, `useMeta` |
| `lib/admin/fields.ts` | описание полей для генератора форм |
| `components/admin/schema-form.tsx` | генератор форм: text, textarea, number, switch, select, icon, color, image, date, list, repeater, group |
| `components/admin/resource-manager.tsx` | список + форма в боковой панели для простых справочников |
| `components/admin/product-form.tsx` | форма товара (фото, характеристики, калькулятор, комплект) |
| `components/icon.tsx` | реестр иконок lucide; ключ хранится в БД |
| `components/rich-text.tsx` | разметка текстов из админки: `## заголовок`, `- пункт`, абзацы |
| `app/globals.css` | дизайн-токены Tailwind v4 (`@theme`): `brand`, `ink`, `sun`, `surface`, `success`, `warn` |

## 5. Бизнес-правила

- Цены — целые тенге. Скидка в процентах считается из `old_price` (`Product::discountPercent()`).
- **Цены заказа всегда пересчитывает сервер** (`OrderService`); корзина в браузере — только предварительный расчёт
  той же логикой (`cartTotals`). Меняя правила, меняйте обе стороны.
- Комплект «Купите вместе»: `[основной товар, ...его bundle]`, скидка `cart.bundle_discount_percent` с каждой единицы,
  пока все товары комплекта в заказе.
- Доставка: `price`, бесплатно при сумме товаров ≥ `free_from`, `requires_address` — нужен ли адрес.
- «Осталось N» — если остаток ≤ `cart.low_stock` (по умолчанию 50).
- Калькулятор расхода: `нужно = ceil(введённое / calc.per_unit)`; без `per_unit` калькулятор скрыт.
- Номер заказа = `100000 + id`. Каждый заказ увеличивает `products.sold`.

## 6. Как вносить изменения

### Новый текст / настройка на витрине
1. Значение по умолчанию — `backend/app/Support/SiteSettings.php` (`defaults()`), в нужной группе.
2. Тип — `frontend/src/lib/types.ts` (`Settings`).
3. Поле формы — `frontend/src/app/admin/(panel)/settings/page.tsx` (массив `TABS`).
4. Вывод — в компоненте витрины через `settings` (серверные: `await api.settings()`, клиентские: `useSite()`).
Секретные значения кладите в группу `notifications` (она не отдаётся в публичный API — `PRIVATE_GROUPS`).

### Новая сущность в админке
1. Миграция + модель (с `RevalidatesFrontend`, если влияет на витрину).
2. Контроллер в `Admin/`, наследник `CrudController` (`rules()`, при необходимости `query()`, `present()`).
3. `Route::apiResource(...)` в `routes/api.php` внутри группы `auth:sanctum`.
4. Страница `app/admin/(panel)/<name>/page.tsx` с `<ResourceManager config={…} />` и пункт в `NAV` (`components/admin/shell.tsx`).

### Новое поле товара
Миграция → `#[Fillable]` и `casts()` в `Product` → `rules()` в `Admin/ProductController` → `ProductResource` (витрина)
→ `types.ts` → поле в `components/admin/product-form.tsx` → вывод на `product/[slug]/page.tsx`.

## 7. Правила кода и подводные камни

**Next.js 16 отличается от того, что вы знаете.** Перед работой с API Next читайте `frontend/node_modules/next/dist/docs/`.
- Middleware называется `proxy.ts`, экспортирует одну функцию `proxy`.
- `params` и `searchParams` — Promise (`await params`).
- `fetch` не кешируется по умолчанию — в `lib/api.ts` явно `cache: 'force-cache'` + `next.tags`.
- `revalidateTag(tag, profile)` требует второй аргумент; для вебхука — `{ expire: 0 }`.
- Для `next/image` с localhost нужен `images.dangerouslyAllowLocalIP` (включён только в dev).
- Из файлов `page.tsx` нельзя экспортировать ничего, кроме страницы и её конфигурации — хелперы выносите в `lib/`.

**shadcn/ui здесь на Base UI, а не на Radix.** Вместо `asChild` — проп `render`:
`<PopoverTrigger render={<button … />}>`. Не перезаписывайте `components/ui/button.tsx` при `shadcn add`
(отвечайте «N» на вопрос о перезаписи). После `shadcn add` проверьте импорт `cn` — CLI иногда пишет `from "cn"`,
правильно `from "@/lib/utils"`.

**ESLint (react-hooks v7) строгий:** нельзя `setState` синхронно в `useEffect`, нельзя объявлять компоненты внутри
компонентов. Для «загружено ли из localStorage» используйте `useHydrated()` из `lib/store.ts`.

**Laravel 13:** модели используют атрибуты `#[Fillable([...])]`, касты — методом `casts()`. Пишите так же.
Таблицы — запросы с `join` требуют квалифицированных колонок (`$q->qualifyColumn('is_active')`).

**Сборка фронтенда (`npm run build`) требует запущенного бэкенда** — страницы берут данные из API.

**Не коммитьте** `backend/.env`, `frontend/.env.local`, `vendor/`, `node_modules/`, загруженные фото
(`backend/storage/app/public`). Репозиторий публичный.

Стиль: комментарии и тексты — по-русски, коротко; код — как в соседних файлах. Иконки только из `components/icon.tsx`
(витрина) или `lucide-react` (админка).

## 8. Проверка перед сдачей

```bash
cd frontend && npx tsc --noEmit && npx eslint src && npm run build    # бэкенд должен быть запущен
cd backend && php artisan route:list --path=api >/dev/null && find app routes database -name '*.php' -exec php -l {} \; | grep -v 'No syntax errors'
```
Затем вручную или в браузере:
- витрина: главная, каталог с фильтрами, товар (калькулятор, «Купите вместе»), корзина → оформление заказа;
- админка: вход, сохранение настройки → изменение видно на сайте, создание/удаление записи, загрузка фото;
- адаптив: 1440 px и 390 px.

Тестовые данные, созданные при проверке (заказы, записи, фото), удаляйте за собой.

## 9. Продакшен (кратко)

- Backend: `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://api.домен`, `FRONTEND_URL=https://домен`,
  `CORS_ALLOWED_ORIGINS=https://домен`, `php artisan config:cache route:cache`, php-fpm + nginx, `/storage` — статикой.
- Frontend: `API_URL`/`NEXT_PUBLIC_API_URL=https://api.домен/api`, `NEXT_PUBLIC_SITE_URL=https://домен`,
  тот же `REVALIDATE_SECRET`; `npm run build && npm start` под pm2/systemd за nginx.
- Почта для уведомлений — `MAIL_*` в `backend/.env`; Telegram — в админке, вкладка «Уведомления».

## 10. Что ещё не сделано (идеи)

Онлайн-оплата (Kaspi, карты), личный кабинет покупателя, импорт товаров из Excel/1С, мультиязычность RU/KZ,
отзывы от покупателей с модерацией, роли админов.
