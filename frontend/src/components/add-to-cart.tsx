'use client';

import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { type CartProduct, useHydrated, useShop } from '@/lib/store';
import { cn } from '@/lib/utils';
import { QtyStepper } from './qty-stepper';

/** Кнопка «В корзину», которая после добавления превращается в счётчик количества. */
export function AddToCart({ p, className }: { p: CartProduct; className?: string }) {
  const ready = useHydrated();
  const qty = useShop((s) => s.cart.find((i) => i.id === p.id)?.qty ?? 0);
  const add = useShop((s) => s.add);
  const setQty = useShop((s) => s.setQty);

  if (ready && qty > 0) {
    return <QtyStepper size="sm" min={0} value={qty} onChange={(v) => setQty(p.id, v)} className={cn('w-full justify-between', className)} />;
  }
  return (
    <button
      type="button"
      onClick={() => {
        add(p);
        toast.success('Добавлено в корзину', { description: p.name });
      }}
      className={cn(
        'inline-flex h-9 w-full items-center justify-center gap-2 rounded-full bg-ink text-sm font-medium text-white transition hover:bg-brand active:scale-[0.98]',
        className,
      )}
    >
      <ShoppingBag className="size-4" /> В корзину
    </button>
  );
}
