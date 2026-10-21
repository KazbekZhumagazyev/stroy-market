'use client';

import Image from 'next/image';
import { ResourceManager, type Row } from '@/components/admin/resource-manager';
import { seoFields, slugField } from '@/components/admin/seo-fields';
import { Pill } from '@/components/admin/ui';
import { Icon } from '@/components/icon';
import { storageUrl } from '@/lib/admin/client';

type Category = Row & { name: string; slug: string; icon: string; color: string; bg: string; image: string | null; is_active: boolean; show_in_menu: boolean; products_count: number; sort: number };

export default function CategoriesPage() {
  return (
    <ResourceManager<Category>
      config={{
        endpoint: 'categories',
        title: 'Категории',
        description: 'Разделы каталога: показываются в меню, на главной и в фильтрах',
        addLabel: 'Новая категория',
        itemTitle: (c) => c.name,
        omit: ['products_count', 'image_url'],
        deleteText: (c) => (c.products_count ? `В категории ${c.products_count} товар(ов) — сначала перенесите их.` : 'Действие нельзя отменить.'),
        defaults: { name: '', slug: '', icon: 'package', color: '#455a64', bg: '#eceff1', image: null, description: '', sort: 0, is_active: true, show_in_menu: true },
        columns: [
          {
            label: 'Категория',
            render: (c) => (
              <div className="flex items-center gap-3">
                <div className="tile relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl" style={{ '--tile-bg': c.bg, '--tile-fg': c.color } as React.CSSProperties}>
                  {c.image ? <Image src={storageUrl(c.image)!} alt="" fill sizes="44px" className="object-cover" /> : <Icon name={c.icon} className="size-5" />}
                </div>
                <div><div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground">/catalog/{c.slug}</div></div>
              </div>
            ),
          },
          { label: 'Товаров', render: (c) => c.products_count },
          { label: 'Порядок', render: (c) => c.sort },
          { label: 'Статус', render: (c) => <div className="flex gap-1">{c.is_active ? <Pill tone="green">Активна</Pill> : <Pill>Скрыта</Pill>}{c.show_in_menu && <Pill tone="blue">В меню</Pill>}</div> },
        ],
        fields: [
          { type: 'text', key: 'name', label: 'Название', required: true, half: true },
          slugField(),
          { type: 'icon', key: 'icon', label: 'Иконка', half: true },
          { type: 'number', key: 'sort', label: 'Порядок сортировки', hint: 'Меньше — выше', half: true },
          { type: 'color', key: 'color', label: 'Цвет иконки', half: true },
          { type: 'color', key: 'bg', label: 'Цвет фона плитки', half: true },
          { type: 'image', key: 'image', label: 'Фото категории', folder: 'categories', hint: 'Если загружено — показывается вместо иконки' },
          { type: 'textarea', key: 'description', label: 'Описание', rows: 3, hint: 'Выводится под товарами на странице категории' },
          { type: 'switch', key: 'is_active', label: 'Показывать на сайте', half: true },
          { type: 'switch', key: 'show_in_menu', label: 'Показывать в меню', half: true },
          ...seoFields,
        ],
      }}
    />
  );
}
