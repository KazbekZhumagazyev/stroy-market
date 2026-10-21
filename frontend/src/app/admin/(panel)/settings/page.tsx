'use client';

import { useState } from 'react';
import { ExternalLink, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SchemaForm } from '@/components/admin/schema-form';
import { btn, Card, PageHeader, Skeleton } from '@/components/admin/ui';
import { SOCIAL_NETWORKS } from '@/components/social-icon';
import { ApiError, adminFetch, useAdmin } from '@/lib/admin/client';
import type { Field } from '@/lib/admin/fields';
import { cn } from '@/lib/utils';

type Settings = Record<string, Record<string, unknown>>;

const link = (extra: Field[] = []): Field[] => [
  { type: 'text', key: 'label', label: 'Текст', half: true },
  { type: 'text', key: 'href', label: 'Ссылка', placeholder: '/delivery', half: true },
  ...extra,
];

const TABS: { group: string; label: string; preview?: string; fields: Field[] }[] = [
  {
    group: 'general', label: 'Контакты', preview: '/', fields: [
      { type: 'text', key: 'brand', label: 'Название магазина', half: true },
      { type: 'text', key: 'tagline', label: 'Подпись у логотипа', half: true },
      { type: 'text', key: 'phone', label: 'Телефон', placeholder: '+7 (700) 123-45-67', half: true },
      { type: 'text', key: 'whatsapp', label: 'WhatsApp (только цифры)', placeholder: '77001234567', half: true },
      { type: 'email', key: 'email', label: 'E-mail', half: true },
      { type: 'text', key: 'hours', label: 'Часы работы', half: true },
      { type: 'text', key: 'address', label: 'Адрес' },
      { type: 'number', key: 'rating', label: 'Рейтинг магазина', step: 0.1, half: true },
      { type: 'number', key: 'reviews_count', label: 'Количество отзывов', half: true },
      { type: 'repeater', key: 'socials', label: 'Соцсети', itemLabel: 'Соцсеть', fields: [
        { type: 'select', key: 'network', label: 'Сеть', options: SOCIAL_NETWORKS.map((n) => ({ value: n, label: n })), required: true, half: true },
        { type: 'url', key: 'url', label: 'Ссылка', half: true },
      ] },
    ],
  },
  {
    group: 'header', label: 'Шапка', preview: '/', fields: [
      { type: 'repeater', key: 'topbar_links', label: 'Ссылки в верхней чёрной полосе', itemLabel: 'Ссылка', max: 4, fields: link([{ type: 'icon', key: 'icon', label: 'Иконка' }]) },
      { type: 'text', key: 'catalog_button', label: 'Кнопка каталога', half: true },
      { type: 'text', key: 'sale_label', label: 'Ссылка на акции', half: true },
      { type: 'text', key: 'search_placeholder', label: 'Подсказка в поиске' },
    ],
  },
  {
    group: 'hero', label: 'Главный баннер', preview: '/', fields: [
      { type: 'text', key: 'badge', label: 'Плашка над заголовком', placeholder: 'Сезон стройки — скидки до 15%' },
      { type: 'text', key: 'title', label: 'Заголовок: начало', half: true },
      { type: 'text', key: 'title_accent', label: 'Заголовок: красная часть', half: true },
      { type: 'text', key: 'title_end', label: 'Заголовок: окончание', half: true },
      { type: 'textarea', key: 'text', label: 'Текст под заголовком', rows: 2 },
      { type: 'text', key: 'primary_label', label: 'Красная кнопка: текст', half: true },
      { type: 'text', key: 'primary_href', label: 'Красная кнопка: ссылка', half: true },
      { type: 'text', key: 'secondary_label', label: 'Вторая кнопка: текст', half: true },
      { type: 'text', key: 'secondary_href', label: 'Вторая кнопка: ссылка', hint: 'tel:+7700… — звонок', half: true },
      { type: 'repeater', key: 'stats', label: 'Цифры внизу баннера', itemLabel: 'Цифра', max: 4, fields: [
        { type: 'text', key: 'label', label: 'Подпись', half: true }, { type: 'text', key: 'value', label: 'Значение', half: true },
      ] },
      { type: 'group', label: 'Красная карточка справа', fields: [
        { type: 'text', key: 'promo_main.badge', label: 'Плашка', half: true },
        { type: 'icon', key: 'promo_main.icon', label: 'Иконка', half: true },
        { type: 'text', key: 'promo_main.title', label: 'Заголовок' },
        { type: 'text', key: 'promo_main.text', label: 'Подпись' },
        { type: 'text', key: 'promo_main.link_label', label: 'Текст ссылки', half: true },
        { type: 'text', key: 'promo_main.href', label: 'Ссылка', half: true },
      ] },
      { type: 'repeater', key: 'promo_cards', label: 'Маленькие карточки (2 шт.)', itemLabel: 'Карточка', max: 2, fields: [
        { type: 'text', key: 'title', label: 'Заголовок', half: true },
        { type: 'text', key: 'text', label: 'Подпись', half: true },
        { type: 'text', key: 'href', label: 'Ссылка', half: true },
        { type: 'select', key: 'style', label: 'Цвет', options: [{ value: 'sun', label: 'Жёлтая' }, { value: 'white', label: 'Белая' }, { value: 'ink', label: 'Чёрная' }, { value: 'brand', label: 'Красная' }], required: true, half: true },
        { type: 'text', key: 'accent', label: 'Крупный текст вместо иконки', placeholder: '−7%', half: true },
        { type: 'icon', key: 'icon', label: 'Иконка', half: true },
      ] },
    ],
  },
  {
    group: 'home', label: 'Главная', preview: '/', fields: [
      { type: 'repeater', key: 'features', label: 'Преимущества под баннером', itemLabel: 'Преимущество', max: 4, fields: [
        { type: 'icon', key: 'icon', label: 'Иконка', half: true }, { type: 'text', key: 'title', label: 'Заголовок', half: true }, { type: 'text', key: 'text', label: 'Подпись' },
      ] },
      { type: 'heading', label: 'Заголовки блоков', hint: 'Блок без товаров/записей на сайте скрывается автоматически' },
      { type: 'text', key: 'categories_title', label: 'Категории', half: true },
      { type: 'text', key: 'deals_title', label: 'Акции дня', half: true },
      { type: 'text', key: 'deals_timer_label', label: 'Подпись таймера', half: true },
      { type: 'text', key: 'hits_title', label: 'Хиты продаж', half: true },
      { type: 'text', key: 'tabs_title', label: 'Популярное по категориям', half: true },
      { type: 'text', key: 'fresh_title', label: 'Новинки', half: true },
      { type: 'text', key: 'reviews_title', label: 'Отзывы', half: true },
      { type: 'text', key: 'articles_title', label: 'Статьи', half: true },
      { type: 'switch', key: 'show_brands', label: 'Показывать бегущую строку брендов' },
      { type: 'group', label: 'Чёрный баннер «Смета»', hint: 'Пустой заголовок — баннер скрыт', fields: [
        { type: 'text', key: 'banner.eyebrow', label: 'Надзаголовок' },
        { type: 'text', key: 'banner.title', label: 'Заголовок' },
        { type: 'textarea', key: 'banner.text', label: 'Текст', rows: 2 },
        { type: 'text', key: 'banner.button_label', label: 'Кнопка', half: true },
        { type: 'text', key: 'banner.button_href', label: 'Ссылка кнопки', half: true },
      ] },
    ],
  },
  {
    group: 'product', label: 'Страница товара', fields: [
      { type: 'repeater', key: 'info_lines', label: 'Строки под кнопкой «В корзину»', itemLabel: 'Строка', fields: [
        { type: 'icon', key: 'icon', label: 'Иконка', half: true }, { type: 'text', key: 'text', label: 'Текст', half: true },
      ] },
      { type: 'repeater', key: 'perks', label: 'Плитки преимуществ', itemLabel: 'Плитка', max: 3, fields: [
        { type: 'icon', key: 'icon', label: 'Иконка', half: true }, { type: 'text', key: 'title', label: 'Заголовок', half: true }, { type: 'text', key: 'text', label: 'Подпись' },
      ] },
      { type: 'list', key: 'default_description', label: 'Описание по умолчанию', hint: 'Если у товара не заполнено описание' },
      { type: 'textarea', key: 'delivery_tab', label: 'Вкладка «Доставка и оплата»', rows: 4 },
      { type: 'text', key: 'bundle_title', label: 'Заголовок «Купите вместе»', half: true },
      { type: 'text', key: 'bundle_text', label: 'Подзаголовок комплекта', half: true },
      { type: 'text', key: 'calc_title', label: 'Заголовок калькулятора', half: true },
      { type: 'text', key: 'related_title', label: 'Заголовок «Похожие товары»', half: true },
    ],
  },
  {
    group: 'cart', label: 'Корзина', fields: [
      { type: 'number', key: 'bundle_discount_percent', label: 'Скидка за комплект', suffix: '%', half: true },
      { type: 'number', key: 'low_stock', label: 'Порог «Осталось N»', suffix: 'шт', hint: 'Остаток не выше — оранжевая метка', half: true },
      { type: 'text', key: 'success_title', label: 'Заголовок после заказа', hint: '{number} — номер заказа' },
      { type: 'textarea', key: 'success_text', label: 'Текст после заказа', rows: 2 },
      { type: 'text', key: 'checkout_note', label: 'Подпись под кнопкой «Оформить»' },
      { type: 'text', key: 'empty_text', label: 'Текст пустой корзины' },
    ],
  },
  {
    group: 'footer', label: 'Подвал', preview: '/', fields: [
      { type: 'textarea', key: 'about', label: 'Текст о компании', rows: 3 },
      { type: 'repeater', key: 'columns', label: 'Колонки ссылок', itemLabel: 'Колонка', max: 3, fields: [
        { type: 'text', key: 'title', label: 'Заголовок колонки' },
        { type: 'repeater', key: 'links', label: 'Ссылки', itemLabel: 'Ссылка', fields: link() },
      ] },
      { type: 'text', key: 'copyright', label: 'Копирайт', hint: '{year} — текущий год', half: true },
      { type: 'text', key: 'note', label: 'Примечание', half: true },
      { type: 'group', label: 'Красный блок подписки', fields: [
        { type: 'text', key: 'subscribe_title', label: 'Заголовок' },
        { type: 'text', key: 'subscribe_text', label: 'Текст' },
        { type: 'text', key: 'subscribe_button', label: 'Кнопка', half: true },
        { type: 'text', key: 'subscribe_success', label: 'Сообщение после подписки', half: true },
      ] },
    ],
  },
  {
    group: 'social_proof', label: 'Всплывашка «Купили»', fields: [
      { type: 'switch', key: 'enabled', label: 'Показывать «Ерлан (Алматы) купил…»', hint: 'Раз в 30 секунд, товары — из популярных' },
      { type: 'repeater', key: 'names', label: 'Имена покупателей', itemLabel: 'Покупатель', fields: [
        { type: 'text', key: 'name', label: 'Имя', half: true }, { type: 'text', key: 'city', label: 'Город', half: true },
      ] },
    ],
  },
  {
    group: 'seo', label: 'SEO', fields: [
      { type: 'text', key: 'title', label: 'Заголовок главной (title)' },
      { type: 'textarea', key: 'description', label: 'Описание сайта (meta description)', rows: 3 },
    ],
  },
  {
    group: 'notifications', label: 'Уведомления', fields: [
      { type: 'heading', label: 'Telegram', hint: 'Создайте бота у @BotFather, добавьте его в чат менеджеров и узнайте chat_id (например, через @getmyid_bot)' },
      { type: 'password', key: 'telegram_bot_token', label: 'Токен бота', placeholder: '123456:ABC-DEF…' },
      { type: 'text', key: 'telegram_chat_id', label: 'ID чата', placeholder: '-1001234567890' },
      { type: 'heading', label: 'E-mail' },
      { type: 'email', key: 'order_email', label: 'Отправлять заказы на почту', hint: 'Нужна настройка почты (MAIL_*) в backend/.env' },
    ],
  },
];

export default function SettingsPage() {
  const { data, mutate } = useAdmin<{ data: Settings }>('settings');
  const [tab, setTab] = useState(TABS[0].group);
  const [drafts, setDrafts] = useState<Settings>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const current = TABS.find((t) => t.group === tab)!;
  const value = drafts[tab] ?? data?.data[tab];

  async function save() {
    setBusy(true);
    setErrors({});
    try {
      const res = await adminFetch<{ data: Settings }>('settings', { method: 'PUT', json: { group: tab, value } });
      mutate(res, false);
      setDrafts(({ [tab]: _, ...rest }) => (void _, rest));
      toast.success('Сохранено — изменения уже на сайте');
    } catch (e) {
      if (e instanceof ApiError) setErrors(Object.fromEntries(Object.entries(e.errors).map(([k, v]) => [k.replace(/^value\./, ''), v])));
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Настройки сайта" description="Все тексты, контакты и баннеры витрины" />
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 no-scrollbar lg:mx-0 lg:flex-col lg:px-0">
          {TABS.map((t) => (
            <button key={t.group} type="button" onClick={() => { setTab(t.group); setErrors({}); }}
              className={cn('flex h-10 shrink-0 items-center rounded-xl px-4 text-left text-sm font-medium transition',
                tab === t.group ? 'bg-ink text-white' : 'text-ink/70 hover:bg-white hover:text-ink')}>
              {t.label}
              {drafts[t.group] && <span className="ml-2 size-1.5 rounded-full bg-brand" title="Не сохранено" />}
            </button>
          ))}
        </nav>
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="min-w-0">
          <Card title={current.label} actions={current.preview && <a href={current.preview} target="_blank" className={btn.ghost}><ExternalLink className="size-4" /> Посмотреть</a>}>
            {value ? (
              <SchemaForm fields={current.fields} value={value} errors={errors} onChange={(v) => setDrafts((d) => ({ ...d, [tab]: v }))} />
            ) : (
              <div className="space-y-3"><Skeleton className="h-11" /><Skeleton className="h-11" /><Skeleton className="h-24" /></div>
            )}
            <div className="sticky bottom-0 -mx-5 mt-6 flex items-center gap-3 border-t bg-white/90 px-5 pt-4 backdrop-blur md:-mx-6 md:px-6">
              {drafts[tab] && <span className="text-sm text-warn">Есть несохранённые изменения</span>}
              <button disabled={busy || !drafts[tab]} className={cn(btn.primary, 'ml-auto')}>
                {busy && <LoaderCircle className="size-4 animate-spin" />} Сохранить
              </button>
            </div>
          </Card>
        </form>
      </div>
      <PasswordCard />
    </>
  );
}

function PasswordCard() {
  const [v, setV] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const fields: Field[] = [
    { type: 'password', key: 'current_password', label: 'Текущий пароль', required: true },
    { type: 'password', key: 'password', label: 'Новый пароль', hint: 'Не короче 8 символов', required: true, half: true },
    { type: 'password', key: 'password_confirmation', label: 'Повторите новый пароль', required: true, half: true },
  ];
  return (
    <form className="mt-5 lg:ml-[calc(220px+1.25rem)]" onSubmit={async (e) => {
      e.preventDefault();
      setBusy(true);
      setErrors({});
      try {
        await adminFetch('password', { method: 'PUT', json: v });
        setV({ current_password: '', password: '', password_confirmation: '' });
        toast.success('Пароль изменён');
      } catch (err) {
        if (err instanceof ApiError) setErrors(err.errors);
        toast.error((err as Error).message);
      } finally {
        setBusy(false);
      }
    }}>
      <Card title="Пароль администратора">
        <SchemaForm fields={fields} value={v} onChange={setV} errors={errors} />
        <button disabled={busy} className={cn(btn.dark, 'mt-5')}>{busy && <LoaderCircle className="size-4 animate-spin" />} Сменить пароль</button>
      </Card>
    </form>
  );
}
