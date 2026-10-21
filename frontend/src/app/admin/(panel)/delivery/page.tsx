'use client';

import { ResourceManager, type Row } from '@/components/admin/resource-manager';
import { Pill } from '@/components/admin/ui';
import { fmt } from '@/lib/format';

type Option = Row & { title: string; note: string | null; price: number; free_from: number | null; requires_address: boolean; is_active: boolean };

export default function DeliveryPage() {
  return (
    <ResourceManager<Option>
      config={{
        endpoint: 'delivery-options',
        title: 'Способы доставки',
        description: 'Варианты получения заказа в корзине',
        addLabel: 'Новый способ',
        itemTitle: (o) => o.title,
        defaults: { title: '', note: '', price: 0, free_from: null, requires_address: true, sort: 0, is_active: true },
        columns: [
          { label: 'Способ', render: (o) => <div><div className="font-medium">{o.title}</div><div className="text-xs text-muted-foreground">{o.note}</div></div> },
          { label: 'Цена', render: (o) => (o.price ? fmt(o.price) : 'Бесплатно') },
          { label: 'Бесплатно от', render: (o) => (o.free_from ? fmt(o.free_from) : '—') },
          { label: 'Статус', render: (o) => (o.is_active ? <Pill tone="green">Включён</Pill> : <Pill>Выключен</Pill>) },
        ],
        fields: [
          { type: 'text', key: 'title', label: 'Название', required: true },
          { type: 'text', key: 'note', label: 'Подпись', placeholder: 'Завтра, бортовая машина до 1,5 т' },
          { type: 'number', key: 'price', label: 'Стоимость', suffix: '₸', required: true, half: true },
          { type: 'number', key: 'free_from', label: 'Бесплатно от суммы', suffix: '₸', hint: 'Пусто — всегда платно', half: true },
          { type: 'number', key: 'sort', label: 'Порядок', half: true },
          { type: 'switch', key: 'requires_address', label: 'Нужен адрес', hint: 'Выключите для самовывоза', half: true },
          { type: 'switch', key: 'is_active', label: 'Включён' },
        ],
      }}
    />
  );
}
