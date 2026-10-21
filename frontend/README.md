# YGM IZOFLEX — frontend (Next.js 16)

Витрина и админка. Общая документация, запуск и API — в [../README.md](../README.md).

```
src/
├── app/
│   ├── (shop)/            витрина: главная, каталог, товар, корзина, избранное, блог, страницы из админки ([page])
│   ├── admin/             админка: login + (panel)/ дашборд, заказы, товары, категории, … настройки
│   ├── admin-api/         прокси к Laravel /api/admin/* (токен в httpOnly-cookie)
│   └── api/revalidate/    вебхук: Laravel сбрасывает кеш витрины после изменений
├── components/            витрина; components/admin — админка (schema-form, resource-manager, product-form)
├── lib/
│   ├── api.ts             запросы к Laravel на сервере (кеш с тегом cms)
│   ├── types.ts           типы ответов API, включая все настройки сайта (Settings)
│   ├── store.ts           корзина/избранное (zustand + localStorage)
│   └── admin/             клиент админки, описание полей форм
└── proxy.ts               закрывает /admin без входа
```

Новое поле в настройках сайта: добавьте значение по умолчанию в `backend/app/Support/SiteSettings.php`,
тип — в `lib/types.ts`, поле формы — в `app/admin/(panel)/settings/page.tsx`, вывод — в компоненте витрины.

Иконки для выбора в админке — `components/icon.tsx` (ключ хранится в БД).
