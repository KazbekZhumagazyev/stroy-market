import 'server-only';
import { notFound } from 'next/navigation';
import type { Article, Category, DeliveryOption, Facets, HomeData, Page, Paginated, ProductCard, ProductPageData, Settings } from './types';

const API_URL = process.env.API_URL ?? 'http://localhost:8010/api';

/** Тег кеша: Laravel сбрасывает его через /api/revalidate после изменений в админке. */
export const CMS_TAG = 'cms';

async function get<T>(path: string, { revalidate = 300 }: { revalidate?: number } = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: 'application/json' },
    cache: 'force-cache',
    next: { tags: [CMS_TAG], revalidate },
  });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
  return res.json();
}

export const api = {
  settings: () => get<{ data: Settings }>('/settings').then((r) => r.data),
  categories: () => get<{ data: Category[] }>('/categories').then((r) => r.data),
  home: () => get<HomeData>('/home'),
  products: (query: string) => get<Paginated<ProductCard> & { facets: Facets }>(`/products?${query}`, { revalidate: 60 }),
  product: (slug: string) => get<ProductPageData>(`/products/${encodeURIComponent(slug)}`),
  articles: (page = 1) => get<Paginated<Article>>(`/articles?page=${page}`),
  article: (slug: string) => get<{ data: Article }>(`/articles/${encodeURIComponent(slug)}`).then((r) => r.data),
  page: (slug: string) => get<{ data: Page }>(`/pages/${encodeURIComponent(slug)}`).then((r) => r.data),
  deliveryOptions: () => get<{ data: DeliveryOption[] }>('/delivery-options').then((r) => r.data),
};
