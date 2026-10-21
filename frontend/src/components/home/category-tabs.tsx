'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Icon } from '@/components/icon';
import { ProductGrid } from '@/components/product-grid';
import { catHref } from '@/lib/format';
import type { HomeData } from '@/lib/types';
import { cn } from '@/lib/utils';

export function CategoryTabs({ tabs, lowStock }: { tabs: HomeData['tabs']; lowStock: number }) {
  const [active, setActive] = useState(0);
  const tab = tabs[active] ?? tabs[0];
  return (
    <div>
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 no-scrollbar md:mx-0 md:px-0">
        {tabs.map((t, i) => (
          <button key={t.category.id} type="button" onClick={() => setActive(i)}
            className={cn('inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition',
              i === active ? 'bg-ink text-white' : 'bg-white text-ink/70 ring-1 ring-black/5 hover:text-ink')}>
            <Icon name={t.category.icon} className="size-4" /> {t.category.name}
          </button>
        ))}
        <Link href={catHref(tab.category.slug)} className="ml-auto hidden shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-brand md:inline-flex">
          Все товары категории <ArrowRight className="size-4" />
        </Link>
      </div>
      <ProductGrid items={tab.products} scroll lowStock={lowStock} />
    </div>
  );
}
