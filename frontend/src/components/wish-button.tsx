'use client';

import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useHydrated, useShop } from '@/lib/store';
import { cn } from '@/lib/utils';

export function WishButton({ id, className }: { id: number; className?: string }) {
  const ready = useHydrated();
  const on = useShop((s) => s.wish.includes(id)) && ready;
  const toggle = useShop((s) => s.toggleWish);
  return (
    <button
      type="button"
      aria-label={on ? 'Убрать из избранного' : 'В избранное'}
      aria-pressed={on}
      onClick={() => toast(toggle(id) ? 'Добавлено в избранное' : 'Удалено из избранного')}
      className={cn(
        'grid size-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition hover:scale-105 hover:text-brand',
        on && 'text-brand',
        className,
      )}
    >
      <Heart className={cn('size-[18px]', on && 'animate-pop')} fill={on ? 'currentColor' : 'none'} />
    </button>
  );
}
