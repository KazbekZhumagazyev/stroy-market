# Backend (Laravel 13) — заметки для ИИ

Общее руководство по проекту — [../AGENTS.md](../AGENTS.md). Прочитайте его первым.

- Это только API: витрина и админка живут в `../frontend` (Next.js). Blade-шаблонов и Filament нет и не нужно.
- Laravel Boost не используется — не устанавливайте его.
- База: PostgreSQL (`.env` → `DB_*`), вся схема — `database/migrations/2026_10_21_140000_create_shop_tables.php`.
- Модели: атрибут `#[Fillable([...])]`, касты методом `casts()`; slug — трейт `HasSlug`; влияние на витрину — `RevalidatesFrontend`.
- Тексты витрины: `app/Support/SiteSettings.php`. Заказы: `app/Support/OrderService.php`.
- Маршруты: `routes/api.php` (публичные + `admin/*` под `auth:sanctum`).
- Сообщения валидации — русские (`lang/ru/validation.php`, `lang/ru.json`); добавляя правило, добавьте перевод.
- Запуск: `php artisan serve --port=8010`; заново с данными: `php artisan migrate:fresh --seed`.
