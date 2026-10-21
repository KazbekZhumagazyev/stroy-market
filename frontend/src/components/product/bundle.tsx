'use client';

import { useState } from 'react';
import { Check, PackagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { ProductThumb } from '@/components/product-thumb';
import { fmt, goods } from '@/lib/format';
import { useShop } from '@/lib/store';
import type { ProductCard } from '@/lib/types';
import { cn } from '@/lib/utils';

export function Bundle({ items, percent, title, text }: { items: ProductCard[]; percent: number; title: string; text: string }) {
  const [picked, setPicked] = useState(() => items.map((x) => x.id));
  const addBundle = useShop((s) => s.addBundle);
  const chosen = items.filter((x) => picked.includes(x.id));
  const full = chosen.reduce((s, x) => s + x.price, 0);
  const final = chosen.length > 1 ? full * (1 - percent / 100) : full;

  return (
    <section className="mt-6 rounded-3xl bg-white p-5 ring-1 ring-black/5 md:p-8">
      <div className="flex items-center gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand text-white"><PackagePlus className="size-5" /></div>
        <div>
          <h2 className="text-xl font-bold">{title}{percent > 0 && ` — скидка ${percent}%`}</h2>
          <p className="text-sm text-muted-foreground">{text}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-2 md:grid-cols-3 md:gap-3">
        {items.map((x, i) => {
          const on = picked.includes(x.id);
          return (
            <button key={x.id} type="button" disabled={i === 0} aria-pressed={on}
              onClick={() => setPicked(on ? picked.filter((id) => id !== x.id) : [...picked, x.id])}
              className={cn('relative flex items-center gap-3 rounded-2xl p-3 text-left ring-1 transition',
                on ? 'ring-2 ring-ink' : 'opacity-60 ring-black/10 hover:opacity-100')}>
              <span className={cn('absolute top-3 right-3 z-10 grid size-6 place-items-center rounded-full', on ? 'bg-ink text-white' : 'bg-secondary')}>
                {on && <Check className="size-3.5" />}
              </span>
              <ProductThumb p={x} className="size-16 shrink-0 rounded-xl" iconClass="size-8" sizes="64px" />
              <div className="min-w-0 pr-6">
                {i === 0 && <div className="text-xs font-semibold text-brand">Этот товар</div>}
                <div className="line-clamp-2 text-sm font-medium">{x.name}</div>
                <div className="mt-1 text-sm font-bold">{fmt(x.price)} <span className="font-normal text-muted-foreground">/ {x.unit}</span></div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4 border-t pt-5">
        <div className="text-sm">
          {chosen.length > 1 ? (
            <>
              Итого за {goods(chosen.length)}: <b className="text-xl">{fmt(final)}</b>{' '}
              {final < full && (
                <>
                  <s className="text-muted-foreground">{fmt(full)}</s>{' '}
                  <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">−{fmt(full - final)}</span>
                </>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">Отметьте хотя бы один товар к основному</span>
          )}
        </div>
        <button type="button"
          onClick={() => { addBundle(chosen); toast.success(`Комплект из ${goods(chosen.length)} добавлен в корзину`); }}
          className="ml-auto inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-semibold text-white hover:bg-brand">
          <PackagePlus className="size-5" /> Добавить комплект
        </button>
      </div>
    </section>
  );
}
