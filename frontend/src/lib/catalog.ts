import type { CatalogParams } from '@/components/catalog/catalog-view';

type Search = Record<string, string | string[] | undefined>;
const KEYS = ['q', 'category', 'brands', 'min', 'max', 'stock', 'sale', 'sort', 'page'];

/** Только известные параметры каталога, по одному значению. */
export function catalogParams(sp: Search): CatalogParams {
  const out: CatalogParams = {};
  for (const k of KEYS) {
    const v = sp[k];
    const s = Array.isArray(v) ? v[0] : v;
    if (s) out[k] = s;
  }
  return out;
}

export function toQuery(params: CatalogParams, extra: Record<string, string> = {}) {
  return new URLSearchParams({ ...(params as Record<string, string>), per_page: '12', ...extra }).toString();
}
