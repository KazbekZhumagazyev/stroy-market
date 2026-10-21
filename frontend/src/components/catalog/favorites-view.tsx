'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { ProductGrid } from '@/components/product-grid';
import { goods } from '@/lib/format';
import { clientApi, useSite } from '@/lib/site';
import { useHydrated, useShop } from '@/lib/store';
import type { ProductCard } from '@/lib/types';
import { EmptyState } from './catalog-view';

export function FavoritesView() {
  const { apiUrl, settings } = useSite();
  const ready = useHydrated();
  const wish = useShop((s) => s.wish);
  const [items, setItems] = useState<ProductCard[] | null>(null);
  const key = wish.join(',');

  useEffect(() => {
    if (!ready || !key) return;
    clientApi<{ data: ProductCard[] }>(apiUrl, `/products?ids=${key}`).then((r) => setItems(r.data)).catch(() => setItems([]));
  }, [ready, key, apiUrl]);

  // Убранные из избранного исчезают сразу, без повторного запроса
  const shown = ready && !key ? [] : (items?.filter((p) => wish.includes(p.id)) ?? null);

  return (
    <div className="container-x pt-6">
      <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Хлебные крошки">
        <Link href="/" className="hover:text-ink">Главная</Link><ChevronRight className="size-3.5" /><span className="text-ink">Избранное</span>
      </nav>
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Избранное</h1>
        {shown && <span className="pb-1 text-muted-foreground">{goods(shown.length)}</span>}
      </div>
      {shown == null ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-white" />)}
        </div>
      ) : shown.length ? (
        <ProductGrid items={shown} lowStock={settings.cart.low_stock} />
      ) : (
        <EmptyState title="В избранном пока пусто" text="Нажмите ♡ на карточке товара, чтобы сохранить его здесь" />
      )}
    </div>
  );
}
