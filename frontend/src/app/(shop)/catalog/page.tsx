import type { Metadata } from 'next';
import { CatalogView } from '@/components/catalog/catalog-view';
import { api } from '@/lib/api';
import { catalogParams, toQuery } from '@/lib/catalog';

type Search = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const p = catalogParams(await searchParams);
  return { title: p.q ? `Поиск: ${p.q}` : 'Каталог стройматериалов', robots: p.q || p.page ? { index: false } : undefined };
}

export default async function CatalogPage({ searchParams }: { searchParams: Search }) {
  const params = catalogParams(await searchParams);
  const [result, settings] = await Promise.all([api.products(toQuery(params)), api.settings()]);
  const cats = params.category?.split(',') ?? [];
  const title = params.q
    ? 'Результаты поиска'
    : cats.length === 1
      ? (result.facets.categories.find((c) => c.slug === cats[0])?.name ?? 'Каталог')
      : params.sale
        ? 'Акции и скидки'
        : 'Все товары';

  return <CatalogView key={JSON.stringify(params)} title={title} result={result} params={params} lowStock={settings.cart.low_stock} />;
}
