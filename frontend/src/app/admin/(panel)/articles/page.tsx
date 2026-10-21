'use client';

import { ResourceManager, type Row } from '@/components/admin/resource-manager';
import { seoFields, slugField } from '@/components/admin/seo-fields';
import { Pill } from '@/components/admin/ui';
import { useMeta } from '@/lib/admin/client';
import { formatDate } from '@/lib/format';

type Article = Row & { title: string; slug: string; tag: string | null; is_published: boolean; published_at: string | null; category: { name: string } | null };

export default function ArticlesPage() {
  const { data: meta } = useMeta();
  return (
    <ResourceManager<Article>
      config={{
        endpoint: 'articles',
        title: 'Статьи',
        description: 'Блог «Полезные статьи»: /blog',
        addLabel: 'Новая статья',
        wide: true,
        itemTitle: (a) => a.title,
        omit: ['category', 'cover_url'],
        defaults: { title: '', slug: '', tag: '', cover: null, excerpt: '', body: '', category_id: null, is_published: true, published_at: new Date().toISOString().slice(0, 16) },
        columns: [
          { label: 'Статья', render: (a) => <div><div className="font-medium">{a.title}</div><div className="text-xs text-muted-foreground">/blog/{a.slug}</div></div> },
          { label: 'Рубрика', render: (a) => a.tag ?? '—' },
          { label: 'Дата', render: (a) => formatDate(a.published_at) || '—' },
          { label: 'Статус', render: (a) => (a.is_published ? <Pill tone="green">Опубликована</Pill> : <Pill>Черновик</Pill>) },
        ],
        fields: [
          { type: 'text', key: 'title', label: 'Заголовок', required: true },
          slugField(),
          { type: 'text', key: 'tag', label: 'Рубрика', placeholder: 'Утепление', half: true },
          { type: 'select', key: 'category_id', label: 'Категория товаров', empty: 'Не привязана', hint: 'Ссылка «Товары по теме» под статьёй', options: (meta?.categories ?? []).map((c) => ({ value: c.id, label: c.name })), half: true },
          { type: 'date', key: 'published_at', label: 'Дата публикации', half: true },
          { type: 'image', key: 'cover', label: 'Обложка', folder: 'articles' },
          { type: 'textarea', key: 'excerpt', label: 'Краткое описание', rows: 2 },
          { type: 'textarea', key: 'body', label: 'Текст статьи', rows: 16, hint: '## Заголовок, ### Подзаголовок, «- пункт» — список, пустая строка — новый абзац' },
          { type: 'switch', key: 'is_published', label: 'Опубликована' },
          ...seoFields,
        ],
      }}
    />
  );
}
