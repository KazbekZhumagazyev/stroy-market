import Link from 'next/link';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { catHref, phoneHref, tpl } from '@/lib/format';
import type { Category, Settings } from '@/lib/types';
import { Logo } from './logo';
import { SocialIcon } from './social-icon';
import { SubscribeForm } from './subscribe-form';

export function SiteFooter({ settings, categories }: { settings: Settings; categories: Category[] }) {
  const { general: g, footer: f } = settings;
  return (
    <footer className="mt-28 bg-ink text-white/70">
      <div className="container-x">
        <div className="relative -top-14 -mb-4 overflow-hidden rounded-3xl bg-brand px-6 py-8 text-white md:flex md:items-center md:gap-8 md:px-10">
          <div className="pointer-events-none absolute -top-24 -right-10 size-72 rounded-full bg-white/10" />
          <div className="relative mb-5 md:mb-0 md:flex-1">
            <h3 className="text-2xl font-bold tracking-tight">{f.subscribe_title}</h3>
            <p className="mt-1 text-white/80">{f.subscribe_text}</p>
          </div>
          <SubscribeForm />
        </div>

        <div className="grid gap-10 pb-10 md:grid-cols-[1.4fr_repeat(var(--cols),1fr)_1.2fr]" style={{ '--cols': 1 + f.columns.length } as React.CSSProperties}>
          <div>
            <Logo className="text-white" brand={g.brand} caption={g.tagline} />
            <p className="mt-4 max-w-xs text-sm leading-6">{f.about}</p>
            <div className="mt-5 flex gap-2">
              {g.socials.filter((s) => s.url).map((s) => (
                <a key={s.network + s.url} href={s.url} aria-label={s.network} target="_blank" rel="noopener"
                  className="grid size-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-brand">
                  <SocialIcon network={s.network} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Каталог</h4>
            <ul className="space-y-2.5 text-sm">
              {categories.slice(0, 6).map((c) => (
                <li key={c.id}><Link href={catHref(c.slug)} className="hover:text-white">{c.name}</Link></li>
              ))}
              <li><Link href="/catalog" className="hover:text-white">Все товары</Link></li>
            </ul>
          </div>
          {f.columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-semibold text-white">{col.title}</h4>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((l) => <li key={l.href + l.label}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>)}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="mb-4 font-semibold text-white">Контакты</h4>
            <ul className="space-y-3 text-sm">
              <li><a href={phoneHref(g.phone)} className="flex items-center gap-2 text-lg font-semibold text-white"><Phone className="size-4 text-brand" /> {g.phone}</a></li>
              <li><a href={`mailto:${g.email}`} className="flex items-center gap-2 hover:text-white"><Mail className="size-4 text-brand" /> {g.email}</a></li>
              <li className="flex items-center gap-2"><MapPin className="size-4 shrink-0 text-brand" /> {g.address}</li>
              <li className="flex items-center gap-2"><Clock className="size-4 shrink-0 text-brand" /> {g.hours}</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-white/10 py-6 pb-24 text-xs md:flex-row md:justify-between md:pb-6">
          <span>{tpl(f.copyright)}</span>
          <span>{f.note}</span>
        </div>
      </div>
    </footer>
  );
}
