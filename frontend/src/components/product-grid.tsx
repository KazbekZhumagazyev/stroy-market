import type { ProductCard as Card } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ProductCard } from './product-card';

/** Сетка на десктопе, горизонтальная лента с прокруткой на телефоне (scroll). */
export function ProductGrid({ items, scroll = false, lowStock, className }: { items: Card[]; scroll?: boolean; lowStock?: number; className?: string }) {
  return (
    <div
      className={cn(
        scroll
          ? '-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 no-scrollbar md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-4 xl:grid-cols-5 [&>*]:w-[46%] [&>*]:shrink-0 [&>*]:snap-start md:[&>*]:w-auto'
          : 'grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4',
        className,
      )}
    >
      {items.map((p) => (
        <ProductCard key={p.id} p={p} lowStock={lowStock} />
      ))}
    </div>
  );
}
