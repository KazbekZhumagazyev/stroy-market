import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, CircleAlert, CircleCheck } from 'lucide-react';
import { Icon } from '@/components/icon';
import { ProductGrid } from '@/components/product-grid';
import { Bundle } from '@/components/product/bundle';
import { Gallery } from '@/components/product/gallery';
import { ProductBuy } from '@/components/product/product-buy';
import { ProductTabs } from '@/components/product/product-tabs';
import { RichText } from '@/components/rich-text';
import { SectionHead } from '@/components/section-head';
import { Stars } from '@/components/stars';
import { api } from '@/lib/api';
import { catHref, fmt, initials, plural } from '@/lib/format';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { data: p } = await api.product((await params).slug);
  const description = p.seo_description || `${p.name} — ${fmt(p.price)} за ${p.unit}. В наличии в Алматы, доставка за 1 день.`;
  return {
    title: p.seo_title || p.name,
    description,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { title: p.name, description, images: p.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [{ data: p, bundle, related, reviews, reviews_count }, s] = await Promise.all([api.product(slug), api.settings()]);
  const ps = s.product;
  const low = s.cart.low_stock;
  const bundleItems = bundle.length ? [p, ...bundle].slice(0, 3) : [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    sku: p.sku,
    image: p.images,
    description: p.short_description ?? undefined,
    brand: p.brand ? { '@type': 'Brand', name: p.brand } : undefined,
    category: p.category.name,
    aggregateRating: reviews_count ? { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: reviews_count } : undefined,
    offers: {
      '@type': 'Offer', price: p.price, priceCurrency: 'KZT',
      availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      seller: { '@type': 'Organization', name: s.general.brand },
    },
  };

  return (
    <div className="container-x pt-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mb-4 flex items-center gap-1.5 overflow-hidden text-sm whitespace-nowrap text-muted-foreground" aria-label="Хлебные крошки">
        <Link href="/" className="hover:text-ink">Главная</Link><ChevronRight className="size-3.5 shrink-0" />
        <Link href={catHref(p.category.slug)} className="hover:text-ink">{p.category.name}</Link><ChevronRight className="size-3.5 shrink-0" />
        <span className="truncate text-ink">{p.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div className="min-w-0 lg:sticky lg:top-36 lg:self-start">
          <Gallery p={p} />
        </div>

        <div className="min-w-0 rounded-3xl bg-white p-5 ring-1 ring-black/5 md:p-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-medium text-ink"><Icon name={p.category.icon} className="size-4" /> {p.brand ?? p.category.name}</span>
            {p.sku && <span>Арт. {p.sku}</span>}
          </div>
          <h1 className="mt-3 text-2xl leading-tight font-bold tracking-tight md:text-[32px]">{p.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5"><Stars value={p.rating} /> <b>{p.rating}</b></span>
            {reviews_count > 0 && <a href="#tabs" className="text-muted-foreground underline-offset-4 hover:underline">{plural(reviews_count, 'отзыв', 'отзыва', 'отзывов')}</a>}
            <span className="text-muted-foreground">Продано {p.sold.toLocaleString('ru-RU')}</span>
          </div>
          {p.short_description && <p className="mt-4 text-[15px] leading-relaxed text-ink/75">{p.short_description}</p>}

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="text-4xl font-bold tracking-tight">{fmt(p.price)}</span>
            <span className="text-muted-foreground">за {p.unit}</span>
            {p.old_price && p.old_price > p.price && (
              <>
                <s className="text-lg text-muted-foreground">{fmt(p.old_price)}</s>
                <span className="rounded-full bg-brand-soft px-2.5 py-1 text-sm font-semibold text-brand">Экономия {fmt(p.old_price - p.price)} · −{p.discount}%</span>
              </>
            )}
          </div>

          <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${p.stock > low ? 'bg-success/10 text-success' : 'bg-warn/10 text-warn'}`}>
            {p.stock > low
              ? <><CircleCheck className="size-4" /> В наличии на складе: {p.stock.toLocaleString('ru-RU')} {p.unit}</>
              : p.stock > 0
                ? <><CircleAlert className="size-4" /> Осталось всего {p.stock} {p.unit} — успейте заказать</>
                : <><CircleAlert className="size-4" /> Под заказ — уточните срок у менеджера</>}
          </div>

          <ProductBuy p={p} calcTitle={ps.calc_title} />

          {ps.info_lines.length > 0 && (
            <ul className="mt-6 space-y-3 border-t pt-6 text-sm">
              {ps.info_lines.map((l) => <li key={l.text} className="flex gap-3"><Icon name={l.icon} className="size-5 shrink-0 text-brand" /> {l.text}</li>)}
            </ul>
          )}
          {ps.perks.length > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-2">
              {ps.perks.map((k) => (
                <div key={k.title} className="rounded-2xl bg-secondary p-3">
                  <Icon name={k.icon} className="size-5 text-brand" />
                  <div className="mt-2 text-xs font-semibold">{k.title}</div>
                  <div className="text-[11px] text-muted-foreground">{k.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {bundleItems.length > 1 && <Bundle items={bundleItems} percent={s.cart.bundle_discount_percent} title={ps.bundle_title} text={ps.bundle_text} />}

      <ProductTabs
        tabs={[
          ...(p.specs.length ? [{
            id: 'specs', label: 'Характеристики', content: (
              <dl className="grid gap-x-10 md:grid-cols-2">
                {[...p.specs, { key: 'Единица продажи', value: p.unit }, ...(p.brand ? [{ key: 'Бренд', value: p.brand }] : [])].map(({ key, value }) => (
                  <div key={key} className="flex gap-4 border-b border-dashed py-3 text-sm">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="ml-auto text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            ),
          }] : []),
          {
            id: 'desc', label: 'Описание', content: (
              <div className="max-w-3xl">
                {p.description ? <RichText text={p.description} /> : (
                  <ul className="list-disc space-y-1 pl-5 text-[15px] leading-relaxed">{ps.default_description.map((t) => <li key={t}>{t}</li>)}</ul>
                )}
              </div>
            ),
          },
          ...(reviews.length ? [{
            id: 'reviews', label: `Отзывы (${reviews_count || reviews.length})`, content: (
              <div className="grid gap-4 md:grid-cols-3">
                {reviews.map((r) => (
                  <figure key={r.id} className="rounded-2xl bg-secondary p-5">
                    <Stars value={r.rating} />
                    <blockquote className="mt-3 text-sm leading-relaxed">{r.text}</blockquote>
                    <figcaption className="mt-4 flex items-center gap-3">
                      <div className="grid size-9 place-items-center rounded-full bg-ink text-xs font-semibold text-white">{initials(r.name)}</div>
                      <div className="text-sm"><b>{r.name}</b>{r.city && <div className="text-xs text-muted-foreground">{r.city}</div>}</div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ),
          }] : []),
          { id: 'delivery', label: 'Доставка и оплата', content: <RichText text={ps.delivery_tab} className="max-w-3xl" /> },
        ]}
      />

      {related.length > 0 && (
        <section className="mt-14">
          <SectionHead title={ps.related_title} href={catHref(p.category.slug)} />
          <ProductGrid items={related} scroll lowStock={low} />
        </section>
      )}
    </div>
  );
}
