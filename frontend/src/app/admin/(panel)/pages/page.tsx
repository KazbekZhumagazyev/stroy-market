'use client';

import { ExternalLink } from 'lucide-react';
import { ResourceManager, type Row } from '@/components/admin/resource-manager';
import { seoFields, slugField } from '@/components/admin/seo-fields';
import { Pill } from '@/components/admin/ui';

type Page = Row & { title: string; slug: string; is_published: boolean; sections: unknown[] };

export default function PagesPage() {
  return (
    <ResourceManager<Page>
      config={{
        endpoint: 'pages',
        title: 'Страницы',
        description: 'Информационные страницы: доставка, оплата, для юрлиц, о компании…',
        addLabel: 'Новая страница',
        wide: true,
        itemTitle: (p) => p.title,
        defaults: { title: '', slug: '', lead: '', sections: [], is_published: true },
        columns: [
          { label: 'Страница', render: (p) => <div className="font-medium">{p.title}</div> },
          { label: 'Адрес', render: (p) => <a href={`/${p.slug}`} target="_blank" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-muted-foreground hover:text-brand">/{p.slug} <ExternalLink className="size-3" /></a> },
          { label: 'Блоков', render: (p) => p.sections?.length ?? 0 },
          { label: 'Статус', render: (p) => (p.is_published ? <Pill tone="green">Опубликована</Pill> : <Pill>Скрыта</Pill>) },
        ],
        fields: [
          { type: 'text', key: 'title', label: 'Заголовок', required: true, half: true },
          slugField('Например delivery → сайт.kz/delivery'),
          { type: 'textarea', key: 'lead', label: 'Подзаголовок', rows: 2 },
          {
            type: 'repeater', key: 'sections', label: 'Блоки страницы', itemLabel: 'Блок', fields: [
              { type: 'text', key: 'title', label: 'Заголовок блока', required: true, half: true },
              { type: 'text', key: 'anchor', label: 'Якорь', hint: 'Для ссылок вида /delivery#payment', half: true },
              { type: 'textarea', key: 'body', label: 'Текст', rows: 5, hint: '«- пункт» — список, пустая строка — новый абзац' },
            ],
          },
          { type: 'switch', key: 'is_published', label: 'Опубликована' },
          ...seoFields,
        ],
      }}
    />
  );
}
