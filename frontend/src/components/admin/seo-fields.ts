import type { Field } from '@/lib/admin/fields';

export const seoFields: Field[] = [
  { type: 'heading', label: 'SEO', hint: 'Если пусто — заголовок и описание формируются автоматически' },
  { type: 'text', key: 'seo_title', label: 'Заголовок страницы (title)' },
  { type: 'textarea', key: 'seo_description', label: 'Описание (meta description)', rows: 2 },
];

export const slugField = (hint = 'Латиницей, например insulation. Пусто — создастся из названия'): Field => ({ type: 'text', key: 'slug', label: 'Адрес в URL (slug)', hint, half: true });
