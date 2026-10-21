import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CatalogView } from '@/components/catalog/catalog-view';
import { api } from '@/lib/api';
import { catalogParams, toQuery } from '@/lib/catalog';

type Params = Promise<{ cat: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

async function findCategory(slug: string) {
  return (await api.categories()).find((c) => c.slug === slug);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const c = await findCategory((await params).cat);
  if (!c) return {};
  return {
    title: c.seo_title || `${c.name} — купить в Алматы`,
    description: c.seo_description || c.description || `${c.name} с доставкой по Алматы и области.`,
    alternates: { canonical: `/catalog/${c.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { cat } = await params;
  const category = await findCategory(cat);
  if (!category) notFound();
  const sp = catalogParams(await searchParams);
  const [result, settings] = await Promise.all([api.products(toQuery(sp, { category: cat })), api.settings()]);

  return (
    <>
      <CatalogView key={JSON.stringify(sp)} title={category.name} result={result} params={sp} fixedCategory={cat} lowStock={settings.cart.low_stock} />
      {category.description && !sp.page && (
        <section className="container-x mt-10">
          <p className="max-w-3xl rounded-3xl bg-white p-6 text-[15px] leading-relaxed text-ink/75 ring-1 ring-black/5">{category.description}</p>
        </section>
      )}
    </>
  );
}
