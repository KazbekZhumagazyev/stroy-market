'use client';

import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { fmt } from '@/lib/format';
import { useSite } from '@/lib/site';
import { cartCount, cartTotals, useHydrated, useShop } from '@/lib/store';

function Count({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span key={n} className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 animate-pop place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-white ring-2 ring-white">
      {n}
    </span>
  );
}

export function HeaderActions() {
  const ready = useHydrated();
  const { settings } = useSite();
  const cart = useShop((s) => s.cart);
  const bundles = useShop((s) => s.bundles);
  const wish = useShop((s) => s.wish.length);
  const open = useShop((s) => s.setCartOpen);
  const count = ready ? cartCount(cart) : 0;

  return (
    <>
      <Link href="/favorites" aria-label="Избранное" className="relative grid size-11 place-items-center rounded-full hover:bg-secondary">
        <Heart className="size-5" />
        <Count n={ready ? wish : 0} />
      </Link>
      <button type="button" onClick={() => open(true)} aria-label="Корзина"
        className="relative flex h-11 items-center gap-2 rounded-full px-3 hover:bg-secondary md:bg-secondary md:pr-4 md:hover:bg-border">
        <span className="relative">
          <ShoppingCart className="size-5" />
          <Count n={count} />
        </span>
        <span className="hidden text-sm font-semibold md:inline">{ready && count ? fmt(cartTotals(cart, bundles, settings.cart.bundle_discount_percent).total) : 'Корзина'}</span>
      </button>
    </>
  );
}
