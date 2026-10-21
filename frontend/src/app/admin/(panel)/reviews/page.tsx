'use client';

import { ResourceManager, type Row } from '@/components/admin/resource-manager';
import { Pill } from '@/components/admin/ui';
import { Stars } from '@/components/stars';
import { useMeta } from '@/lib/admin/client';

type Review = Row & { name: string; city: string | null; rating: number; text: string; is_published: boolean; product: { id: number; name: string } | null };

export default function ReviewsPage() {
  const { data: meta } = useMeta();
  return (
    <ResourceManager<Review>
      config={{
        endpoint: 'reviews',
        title: 'Отзывы',
        description: 'Показываются на главной и на страницах товаров',
        addLabel: 'Новый отзыв',
        itemTitle: (r) => `Отзыв: ${r.name}`,
        omit: ['product'],
        defaults: { name: '', city: '', rating: 5, text: '', product_id: null, is_published: true, sort: 0 },
        columns: [
          { label: 'Автор', render: (r) => <div><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.city}</div></div> },
          { label: 'Оценка', render: (r) => <Stars value={r.rating} /> },
          { label: 'Текст', render: (r) => <p className="line-clamp-2 max-w-md text-muted-foreground">{r.text}</p> },
          { label: 'Товар', render: (r) => <span className="line-clamp-1 max-w-48">{r.product?.name ?? '—'}</span> },
          { label: 'Статус', render: (r) => (r.is_published ? <Pill tone="green">Опубликован</Pill> : <Pill>Скрыт</Pill>) },
        ],
        fields: [
          { type: 'text', key: 'name', label: 'Имя', required: true, half: true },
          { type: 'text', key: 'city', label: 'Город', half: true },
          { type: 'select', key: 'rating', label: 'Оценка', options: [5, 4, 3, 2, 1].map((n) => ({ value: n, label: '★'.repeat(n) })), required: true, half: true },
          { type: 'select', key: 'product_id', label: 'Товар', empty: 'Без товара (общий отзыв)', options: (meta?.products ?? []).map((p) => ({ value: p.id, label: p.name })), half: true },
          { type: 'textarea', key: 'text', label: 'Текст отзыва', rows: 5, required: true },
          { type: 'number', key: 'sort', label: 'Порядок', half: true },
          { type: 'switch', key: 'is_published', label: 'Опубликован', half: true },
        ],
      }}
    />
  );
}
