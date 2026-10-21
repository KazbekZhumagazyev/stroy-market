import type { ProductCard } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ProductBadge({ p, className }: { p: Pick<ProductCard, 'discount' | 'badge'>; className?: string }) {
  const [label, style] = p.discount
    ? [`−${p.discount}%`, 'bg-brand text-white']
    : p.badge === 'hot'
      ? ['Хит', 'bg-sun text-ink']
      : p.badge === 'new'
        ? ['Новинка', 'bg-success text-white']
        : p.badge === 'sale'
          ? ['Акция', 'bg-brand text-white']
          : [null, ''];
  if (!label) return null;
  return <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', style, className)}>{label}</span>;
}
