'use client';

import { ResourceManager, type Row } from '@/components/admin/resource-manager';
import { slugField } from '@/components/admin/seo-fields';
import { Pill } from '@/components/admin/ui';

type Brand = Row & { name: string; slug: string; is_active: boolean; products_count: number; sort: number };

export default function BrandsPage() {
  return (
    <ResourceManager<Brand>
      config={{
        endpoint: 'brands',
        title: 'Бренды',
        description: 'Производители: фильтр в каталоге и бегущая строка на главной',
        addLabel: 'Новый бренд',
        itemTitle: (b) => b.name,
        omit: ['products_count', 'logo_url'],
        defaults: { name: '', slug: '', logo: null, sort: 0, is_active: true },
        columns: [
          { label: 'Бренд', render: (b) => <div><div className="font-medium">{b.name}</div><div className="text-xs text-muted-foreground">{b.slug}</div></div> },
          { label: 'Товаров', render: (b) => b.products_count },
          { label: 'Статус', render: (b) => (b.is_active ? <Pill tone="green">Активен</Pill> : <Pill>Скрыт</Pill>) },
        ],
        fields: [
          { type: 'text', key: 'name', label: 'Название', required: true, half: true },
          slugField('Латиницей. Пусто — создастся из названия'),
          { type: 'image', key: 'logo', label: 'Логотип', folder: 'brands' },
          { type: 'number', key: 'sort', label: 'Порядок', half: true },
          { type: 'switch', key: 'is_active', label: 'Активен', half: true },
        ],
      }}
    />
  );
}
