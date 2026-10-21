import Link from 'next/link';
import { Star } from 'lucide-react';
import { fmt, productHref } from '@/lib/format';
import type { ProductCard as Card } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AddToCart } from './add-to-cart';
import { ProductBadge } from './product-badge';
import { ProductThumb } from './product-thumb';
import { WishButton } from './wish-button';

export function ProductCard({ p, lowStock = 50, className }: { p: Card; lowStock?: number; className?: string }) {
  const href = productHref(p);
  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-2xl bg-card p-2 shadow-card ring-1 ring-black/[0.03] transition duration-300 hover:-translate-y-0.5 hover:shadow-lift',
        className,
      )}
    >
      <Link href={href} className="block" tabIndex={-1} aria-hidden>
        <ProductThumb p={p} className="aspect-square rounded-xl [&_svg]:transition-transform [&_svg]:duration-500 group-hover:[&_svg]:scale-110" />
      </Link>
      <ProductBadge p={p} className="absolute top-4 left-4" />
      <WishButton id={p.id} className="absolute top-4 right-4" />

      <div className="flex flex-1 flex-col px-2 pt-3 pb-2">
        <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate font-medium uppercase tracking-wide">{p.brand ?? p.category.name}</span>
          <span className="ml-auto inline-flex shrink-0 items-center gap-0.5 font-medium text-ink">
            <Star className="size-3 fill-sun text-sun" />
            {p.rating}
          </span>
        </div>
        <Link href={href} className="line-clamp-2 min-h-10 text-sm leading-5 font-medium hover:text-brand">
          {p.name}
        </Link>
        <div className="mt-1 text-xs">
          {p.stock > lowStock ? (
            <span className="text-success">В наличии</span>
          ) : p.stock > 0 ? (
            <span className="text-warn">Осталось {p.stock}</span>
          ) : (
            <span className="text-muted-foreground">Под заказ</span>
          )}
          <span className="hidden text-muted-foreground sm:inline"> · продано {p.sold.toLocaleString('ru-RU')}</span>
        </div>
        <div className="mt-auto pt-3">
          <div className="h-4 text-xs text-muted-foreground">{p.old_price && <s>{fmt(p.old_price)}</s>}</div>
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className={cn('text-lg font-bold tracking-tight', p.old_price && 'text-brand')}>{fmt(p.price)}</span>
            <span className="text-xs text-muted-foreground">/ {p.unit}</span>
          </div>
        </div>
        <AddToCart p={p} className="mt-3" />
      </div>
    </article>
  );
}
