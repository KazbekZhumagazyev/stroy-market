import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Phone, Quote } from 'lucide-react';
import { ArticleCard } from '@/components/article-card';
import { CategoryTabs } from '@/components/home/category-tabs';
import { Countdown } from '@/components/home/countdown';
import { Hero } from '@/components/home/hero';
import { Icon } from '@/components/icon';
import { ProductGrid } from '@/components/product-grid';
import { SectionHead } from '@/components/section-head';
import { Stars } from '@/components/stars';
import { Tile } from '@/components/tile';
import { api } from '@/lib/api';
import { catHref, goods, initials, plural, productHref } from '@/lib/format';

export default async function HomePage() {
  const [s, home] = await Promise.all([api.settings(), api.home()]);
  const { home: h } = s;
  const low = s.cart.low_stock;

  return (
    <>
      <Hero hero={s.hero} />

      {h.features.length > 0 && (
        <section className="container-x mt-3 md:mt-4">
          <div className="grid grid-cols-2 gap-3 rounded-3xl bg-white p-4 ring-1 ring-black/5 md:grid-cols-4 md:p-6">
            {h.features.map((f) => (
              <div key={f.title} className="flex items-center gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand"><Icon name={f.icon} className="size-5" /></div>
                <div className="min-w-0">
                  <div className="text-[13px] leading-tight font-semibold sm:text-sm">{f.title}</div>
                  <div className="hidden text-xs text-muted-foreground sm:block">{f.text}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {home.categories.length > 0 && (
        <section className="container-x mt-14">
          <SectionHead title={h.categories_title} href="/catalog" link="Весь каталог" />
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:gap-4 lg:grid-cols-6">
            {home.categories.map((c) => (
              <Link key={c.id} href={catHref(c.slug)}
                className="group flex flex-col items-center gap-3 rounded-2xl bg-white p-3 pb-4 text-center ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lift md:p-4">
                <Tile c={c} className="aspect-square w-full rounded-xl">
                  {c.image ? (
                    <Image src={c.image} alt={c.name} fill sizes="(max-width: 768px) 33vw, 16vw" className="object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <Icon name={c.icon} className="size-1/2 transition duration-500 group-hover:scale-110" />
                  )}
                </Tile>
                <div>
                  <div className="text-[13px] leading-tight font-semibold md:text-sm">{c.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{goods(c.products_count ?? 0)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {home.deals.length > 0 && (
        <section className="container-x mt-14">
          <div className="rounded-3xl bg-gradient-to-br from-brand-soft to-white p-4 ring-1 ring-brand/10 md:p-6">
            <SectionHead title={h.deals_title} href="/catalog?sale=1" link="Все акции">
              <Countdown label={h.deals_timer_label} />
            </SectionHead>
            <ProductGrid items={home.deals} scroll lowStock={low} />
          </div>
        </section>
      )}

      {home.hits.length > 0 && (
        <section className="container-x mt-14">
          <SectionHead title={h.hits_title} href="/catalog?sort=popular" />
          <ProductGrid items={home.hits} scroll lowStock={low} />
        </section>
      )}

      {h.banner.title && (
        <section className="container-x mt-14">
          <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white md:flex md:items-center md:gap-10 md:p-12">
            <div className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-brand/30 blur-[100px]" />
            <div className="relative md:flex-1">
              {h.banner.eyebrow && <span className="text-sm font-semibold text-sun">{h.banner.eyebrow}</span>}
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{h.banner.title}</h2>
              {h.banner.text && <p className="mt-3 max-w-lg text-white/65">{h.banner.text}</p>}
            </div>
            {h.banner.button_label && (
              <a href={h.banner.button_href} className="relative mt-6 inline-flex h-14 shrink-0 items-center gap-2 rounded-full bg-white px-7 font-semibold text-ink transition hover:bg-sun md:mt-0">
                <Phone className="size-5" /> {h.banner.button_label}
              </a>
            )}
          </div>
        </section>
      )}

      {home.tabs.length > 1 && (
        <section className="container-x mt-14">
          <SectionHead title={h.tabs_title} />
          <CategoryTabs tabs={home.tabs} lowStock={low} />
        </section>
      )}

      {home.fresh.length > 0 && (
        <section className="container-x mt-14">
          <SectionHead title={h.fresh_title} href="/catalog?sort=new" />
          <ProductGrid items={home.fresh} scroll lowStock={low} />
        </section>
      )}

      {h.show_brands && home.brands.length > 2 && (
        <section className="mt-14 overflow-hidden">
          <div className="flex w-max animate-marquee gap-3 hover:[animation-play-state:paused]">
            {[...home.brands, ...home.brands].map((b, i) => (
              <Link key={i} href={`/catalog?brands=${b.slug}`} aria-hidden={i >= home.brands.length} tabIndex={i >= home.brands.length ? -1 : undefined}
                className="grid h-16 min-w-44 place-items-center rounded-2xl bg-white px-8 text-lg font-bold tracking-tight text-ink/40 ring-1 ring-black/5 transition hover:text-ink">
                {b.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {home.reviews.length > 0 && (
        <section id="reviews" className="container-x mt-14 scroll-mt-28">
          <SectionHead title={h.reviews_title}>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{s.general.rating}</span>
              <div className="leading-none">
                <Stars value={s.general.rating} />
                <div className="mt-1 text-xs text-muted-foreground">{plural(s.general.reviews_count, 'отзыв', 'отзыва', 'отзывов')}</div>
              </div>
            </div>
          </SectionHead>
          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 no-scrollbar md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:px-0">
            {home.reviews.map((r) => (
              <figure key={r.id} className="relative flex w-[85%] shrink-0 snap-start flex-col rounded-3xl bg-white p-6 ring-1 ring-black/5 md:w-auto">
                <Quote className="absolute top-5 right-5 size-8 text-brand/15" />
                <Stars value={r.rating} />
                <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed">{r.text}</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-full bg-ink text-sm font-semibold text-white">{initials(r.name)}</div>
                  <div>
                    <div className="text-sm font-semibold">{r.name}</div>
                    {r.city && <div className="text-xs text-muted-foreground">{r.city}</div>}
                  </div>
                </figcaption>
                {r.product && (
                  <Link href={productHref(r.product)} className="mt-4 line-clamp-1 rounded-xl bg-secondary px-3 py-2 text-xs text-muted-foreground hover:text-brand">
                    Купил(а): <span className="font-medium text-ink">{r.product.name}</span>
                  </Link>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      {home.articles.length > 0 && (
        <section className="container-x mt-14">
          <SectionHead title={h.articles_title} href="/blog" link="Все статьи" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {home.articles.map((a) => <ArticleCard key={a.id} a={a} />)}
          </div>
        </section>
      )}

      <div className="container-x mt-10 text-center">
        <Link href="/catalog" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-semibold ring-1 ring-black/10 hover:ring-ink">
          Весь каталог <ArrowRight className="size-4" />
        </Link>
      </div>
    </>
  );
}
