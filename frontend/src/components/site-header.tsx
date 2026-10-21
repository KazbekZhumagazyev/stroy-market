import Link from 'next/link';
import { Flame, LayoutGrid, MapPin, Phone, Star, User } from 'lucide-react';
import { catHref, phoneHref } from '@/lib/format';
import type { Category, Settings } from '@/lib/types';
import { HeaderActions } from './header-actions';
import { Icon } from './icon';
import { Logo } from './logo';
import { SearchBar } from './search-bar';

export function SiteHeader({ settings, categories }: { settings: Settings; categories: Category[] }) {
  const { general: g, header: h } = settings;
  const menu = categories.filter((c) => c.show_in_menu);
  return (
    <>
      <div className="hidden bg-ink text-[13px] text-white/70 md:block">
        <div className="container-x flex h-9 items-center gap-6">
          <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" /> {g.address} · {g.hours}</span>
          <Link href="/#reviews" className="inline-flex items-center gap-1.5 hover:text-white">
            <Star className="size-3.5 fill-sun text-sun" /> <b className="text-white">{g.rating}</b> ({g.reviews_count} отзывов)
          </Link>
          <div className="ml-auto flex items-center gap-6">
            {h.topbar_links.map((l) => (
              <Link key={l.href + l.label} href={l.href} className="inline-flex items-center gap-1.5 hover:text-white">
                {l.icon && <Icon name={l.icon} className="size-3.5" />} {l.label}
              </Link>
            ))}
            <a href={phoneHref(g.phone)} className="inline-flex items-center gap-1.5 font-medium text-white"><Phone className="size-3.5" /> {g.phone}</a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/85 backdrop-blur-xl">
        <div className="container-x flex h-16 items-center gap-3 md:h-20 md:gap-6">
          <Logo brand={g.brand} caption={g.tagline} />
          <Link
            href="/catalog"
            className="hidden h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-dark md:inline-flex"
          >
            <LayoutGrid className="size-4" /> {h.catalog_button}
          </Link>
          <SearchBar placeholder={h.search_placeholder} className="hidden flex-1 md:flex" />
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Link href="/account" aria-label="Профиль" className="hidden size-11 place-items-center rounded-full hover:bg-secondary md:grid">
              <User className="size-5" />
            </Link>
            <HeaderActions />
          </div>
        </div>
        <SearchBar placeholder={h.search_placeholder} className="container-x flex pb-3 md:hidden" />
        {menu.length > 0 && (
          <nav className="hidden border-t border-black/5 md:block">
            <div className="container-x flex h-11 items-center gap-1 overflow-x-auto text-sm no-scrollbar">
              {menu.slice(0, 10).map((c) => (
                <Link key={c.id} href={catHref(c.slug)} className="shrink-0 rounded-full px-3 py-1.5 text-ink/75 transition hover:bg-secondary hover:text-ink">
                  {c.name}
                </Link>
              ))}
              <Link href="/catalog?sale=1" className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-soft px-3 py-1.5 font-semibold text-brand">
                <Flame className="size-4" /> {h.sale_label}
              </Link>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
