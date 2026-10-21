'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Award, ExternalLink, FileText, FolderTree, LayoutDashboard, LogOut, Mail, Menu, MessageSquareQuote, Newspaper, Package, Settings, ShoppingBag, Truck,
} from 'lucide-react';
import { SWRConfig } from 'swr';
import { Logo } from '@/components/logo';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { adminFetch, useAdmin, useMeta } from '@/lib/admin/client';
import { cn } from '@/lib/utils';
import { ConfirmProvider } from './confirm';

const NAV = [
  { href: '/admin', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Заказы', icon: ShoppingBag, badge: true },
  { group: 'Каталог' },
  { href: '/admin/products', label: 'Товары', icon: Package },
  { href: '/admin/categories', label: 'Категории', icon: FolderTree },
  { href: '/admin/brands', label: 'Бренды', icon: Award },
  { group: 'Контент' },
  { href: '/admin/reviews', label: 'Отзывы', icon: MessageSquareQuote },
  { href: '/admin/articles', label: 'Статьи', icon: Newspaper },
  { href: '/admin/pages', label: 'Страницы', icon: FileText },
  { group: 'Магазин' },
  { href: '/admin/delivery', label: 'Доставка', icon: Truck },
  { href: '/admin/subscribers', label: 'Подписчики', icon: Mail },
  { href: '/admin/settings', label: 'Настройки сайта', icon: Settings },
] as const;

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const { data: meta } = useMeta();
  const { data: me } = useAdmin<{ user: { name: string; email: string } }>('me');
  const router = useRouter();

  return (
    <div className="flex h-full flex-col bg-ink text-white/70">
      <div className="flex h-20 items-center px-6">
        <Logo className="text-white" />
        <span className="ml-2 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white/70 uppercase">Admin</span>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4 no-scrollbar">
        {NAV.map((item, i) => {
          if ('group' in item) return <div key={i} className="px-3 pt-5 pb-1.5 text-[11px] font-semibold tracking-wider text-white/35 uppercase">{item.group}</div>;
          const active = item.href === '/admin' ? path === '/admin' : path.startsWith(item.href);
          const Icon = item.icon;
          const badge = 'badge' in item && meta?.new_orders ? meta.new_orders : 0;
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}
              className={cn('flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition', active ? 'bg-white text-ink' : 'hover:bg-white/10 hover:text-white')}>
              <Icon className="size-[18px]" />
              {item.label}
              {badge > 0 && <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">{badge}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <a href="/" target="_blank" className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm hover:bg-white/10 hover:text-white">
          <ExternalLink className="size-[18px]" /> Открыть сайт
        </a>
        <div className="mt-2 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white">{me?.user.name?.[0] ?? 'A'}</div>
          <div className="min-w-0 flex-1 text-xs">
            <div className="truncate font-semibold text-white">{me?.user.name ?? '…'}</div>
            <div className="truncate">{me?.user.email}</div>
          </div>
          <button type="button" aria-label="Выйти" title="Выйти" className="grid size-8 place-items-center rounded-lg hover:bg-white/10 hover:text-white"
            onClick={async () => { await adminFetch('logout', { method: 'POST' }).catch(() => {}); router.replace('/admin/login'); }}>
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <SWRConfig value={{ revalidateOnFocus: false }}>
      <ConfirmProvider>
        <div className="min-h-dvh bg-surface lg:pl-64">
          <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block"><Nav /></aside>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-black/5 bg-white/85 px-4 backdrop-blur-xl lg:hidden">
            <button type="button" aria-label="Меню" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-full hover:bg-secondary"><Menu className="size-5" /></button>
            <span className="font-semibold">Админка</span>
          </header>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="left" showCloseButton={false} className="w-72 border-0 p-0">
              <SheetTitle className="sr-only">Меню</SheetTitle>
              <Nav onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <main className="mx-auto max-w-7xl p-4 pb-16 md:p-8">{children}</main>
        </div>
      </ConfirmProvider>
    </SWRConfig>
  );
}
