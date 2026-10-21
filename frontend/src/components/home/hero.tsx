import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Icon } from '@/components/icon';
import type { Settings } from '@/lib/types';
import { cn } from '@/lib/utils';

const CARD_STYLES = {
  sun: 'bg-sun text-ink',
  white: 'bg-white ring-1 ring-black/5',
  ink: 'bg-ink text-white',
  brand: 'bg-brand text-white',
};

function Btn({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  return href.startsWith('/') ? <Link href={href} className={className}>{children}</Link> : <a href={href} className={className}>{children}</a>;
}

export function Hero({ hero: h }: { hero: Settings['hero'] }) {
  const cards = h.promo_cards.slice(0, 2);
  return (
    <section className="container-x grid gap-3 pt-4 md:grid-cols-3 md:grid-rows-2 md:gap-4 md:pt-6">
      <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white md:col-span-2 md:row-span-2 md:p-12">
        <div className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full bg-brand/40 blur-[120px]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative flex h-full flex-col">
          {h.badge && (
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur">
              <span className="size-1.5 rounded-full bg-sun" /> {h.badge}
            </span>
          )}
          <h1 className="mt-5 max-w-xl text-[34px] leading-[1.05] font-bold tracking-tight md:text-6xl">
            {h.title} {h.title_accent && <span className="text-brand">{h.title_accent}</span>} {h.title_end}
          </h1>
          {h.text && <p className="mt-4 max-w-md text-white/65 md:text-lg">{h.text}</p>}
          <div className="mt-7 flex flex-wrap gap-3">
            {h.primary_label && (
              <Btn href={h.primary_href} className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-6 font-semibold transition hover:bg-brand-dark">
                {h.primary_label} <ArrowRight className="size-4" />
              </Btn>
            )}
            {h.secondary_label && (
              <Btn href={h.secondary_href} className="inline-flex h-12 items-center rounded-full bg-white/10 px-6 font-semibold backdrop-blur transition hover:bg-white/20">
                {h.secondary_label}
              </Btn>
            )}
          </div>
          {h.stats.length > 0 && (
            <dl className="mt-auto grid gap-4 border-t border-white/10 pt-6 md:mt-12" style={{ gridTemplateColumns: `repeat(${h.stats.length}, minmax(0, 1fr))` }}>
              {h.stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-xs text-white/50">{s.label}</dt>
                  <dd className="mt-1 text-xl font-bold md:text-2xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      <Btn href={h.promo_main.href} className="group relative overflow-hidden rounded-3xl bg-brand p-6 text-white">
        {h.promo_main.badge && <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">{h.promo_main.badge}</span>}
        <h3 className="mt-3 max-w-[13rem] text-2xl leading-tight font-bold">{h.promo_main.title}</h3>
        <p className="mt-1 text-sm text-white/75">{h.promo_main.text}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">{h.promo_main.link_label} <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
        <Icon name={h.promo_main.icon} className="absolute -right-4 -bottom-6 size-40 text-white/15 transition duration-500 group-hover:-rotate-6 group-hover:scale-105" />
      </Btn>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {cards.map((c) => (
          <Btn key={c.title} href={c.href} className={cn('group relative overflow-hidden rounded-3xl p-5', CARD_STYLES[c.style] ?? CARD_STYLES.white)}>
            {c.accent ? <span className={cn('text-3xl font-bold tracking-tight', c.style === 'white' && 'text-brand')}>{c.accent}</span> : c.icon ? <Icon name={c.icon} className="size-7" /> : null}
            <h3 className="mt-2 leading-tight font-bold">{c.title}</h3>
            <p className="mt-1 text-xs opacity-70">{c.text}</p>
          </Btn>
        ))}
      </div>
    </section>
  );
}
