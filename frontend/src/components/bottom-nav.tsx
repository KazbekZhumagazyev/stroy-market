'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Home, LayoutGrid, Search, ShoppingCart } from 'lucide-react';
import { cartCount, useHydrated, useShop } from '@/lib/store';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const path = usePathname();
  const ready = useHydrated();
  const count = useShop((s) => cartCount(s.cart));
  const items = [
    { href: '/', label: 'Главная', icon: Home, active: path === '/' },
    { href: '/catalog', label: 'Каталог', icon: LayoutGrid, active: path.startsWith('/catalog') || path.startsWith('/product') },
    { href: '#search', label: 'Поиск', icon: Search, active: false },
    { href: '/cart', label: 'Корзина', icon: ShoppingCart, active: path === '/cart', badge: ready ? count : 0 },
    { href: '/favorites', label: 'Избранное', icon: Heart, active: path === '/favorites' },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="grid h-16 grid-cols-5">
        {items.map(({ href, label, icon: Icon, active, badge }) => {
          const cls = cn('relative flex flex-col items-center justify-center gap-1 text-[11px] font-medium', active ? 'text-brand' : 'text-ink/60');
          const inner = (
            <>
              <span className="relative">
                <Icon className="size-[22px]" strokeWidth={active ? 2.2 : 1.8} />
                {!!badge && <span className="absolute -top-1.5 -right-2.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">{badge}</span>}
              </span>
              {label}
            </>
          );
          return href === '#search' ? (
            <button key={label} type="button" className={cls} onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => [...document.querySelectorAll<HTMLInputElement>('[data-search-input]')].find((el) => el.offsetParent)?.focus(), 250);
            }}>{inner}</button>
          ) : (
            <Link key={label} href={href} className={cls}>{inner}</Link>
          );
        })}
      </div>
    </nav>
  );
}
