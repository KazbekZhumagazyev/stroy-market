export const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₸';

export const plural = (n: number, one: string, few: string, many: string) => {
  const r = new Intl.PluralRules('ru-RU').select(n);
  return `${n} ${r === 'one' ? one : r === 'few' ? few : many}`;
};
export const goods = (n: number) => plural(n, 'товар', 'товара', 'товаров');

export const initials = (name: string) =>
  name.replace(/[«»"]/g, '').split(' ').map((w) => w[0]).slice(0, 2).join('');

export const productHref = (p: { slug: string }) => `/product/${p.slug}`;
export const catHref = (slug: string) => `/catalog/${slug}`;
export const phoneHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;
export const waHref = (number: string) => `https://wa.me/${number.replace(/\D/g, '')}`;

export const formatDate = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso)) : '';

/** Подстановка {year}, {number} и т.п. в тексты из настроек. */
export const tpl = (text: string, vars: Record<string, string | number> = {}) =>
  text.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? (k === 'year' ? new Date().getFullYear() : `{${k}}`)));
