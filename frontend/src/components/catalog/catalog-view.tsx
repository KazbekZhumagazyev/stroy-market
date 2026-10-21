'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { fmt, goods } from '@/lib/format';
import type { Facets, Paginated, ProductCard as Card } from '@/lib/types';
import { cn } from '@/lib/utils';

export type CatalogParams = Record<string, string | undefined>;

/** Ключи URL, которые задают фильтры каталога. */
const FILTER_KEYS = ['q', 'category', 'brands', 'min', 'max', 'stock', 'sale'] as const;
const BRANDS_VISIBLE = 6;

const list = (v?: string) => (v ? v.split(',').filter(Boolean) : []);

export function CatalogView({
  title, result, params, fixedCategory, lowStock, crumbs,
}: {
  title: string;
  result: Paginated<Card> & { facets: Facets };
  params: CatalogParams;
  /** Страница категории /catalog/[slug]: категория задана путём, а не параметром. */
  fixedCategory?: string;
  lowStock: number;
  crumbs?: { label: string; href?: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [sheet, setSheet] = useState(false);
  const { data, meta, facets } = result;

  /** Применить изменения фильтров: новая ссылка, страница сбрасывается на первую. */
  const go = (patch: CatalogParams, { keepPage = false } = {}) => {
    const next: CatalogParams = { ...params, ...patch };
    if (!keepPage) delete next.page;
    let path = pathname;
    // Выбор нескольких категорий на странице категории — переход в общий каталог
    if (fixedCategory && 'category' in patch) {
      path = '/catalog';
    }
    const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v != null && v !== '') as [string, string][]).toString();
    startTransition(() => router.push(qs ? `${path}?${qs}` : path, { scroll: keepPage }));
  };

  const cats = fixedCategory ? [fixedCategory, ...list(params.category).filter((c) => c !== fixedCategory)] : list(params.category);
  const brands = list(params.brands);
  const toggle = (arr: string[], v: string, on: boolean) => (on ? [...arr, v] : arr.filter((x) => x !== v)).join(',');

  const chips: { label: string; clear: CatalogParams }[] = [
    ...(params.q ? [{ label: `«${params.q}»`, clear: { q: undefined } }] : []),
    ...(!fixedCategory ? cats.map((slug) => ({ label: facets.categories.find((c) => c.slug === slug)?.name ?? slug, clear: { category: toggle(cats, slug, false) } })) : []),
    ...brands.map((slug) => ({ label: facets.brands.find((b) => b.slug === slug)?.name ?? slug, clear: { brands: toggle(brands, slug, false) } })),
    ...(params.min || params.max ? [{ label: `${fmt(Number(params.min ?? facets.price.min))} – ${fmt(Number(params.max ?? facets.price.max))}`, clear: { min: undefined, max: undefined } }] : []),
    ...(params.stock ? [{ label: 'В наличии', clear: { stock: undefined } }] : []),
    ...(params.sale ? [{ label: 'Со скидкой', clear: { sale: undefined } }] : []),
  ];
  const reset = () => go(Object.fromEntries(FILTER_KEYS.map((k) => [k, undefined])));

  const panel = (
    <FilterPanel
      facets={facets} cats={cats} brands={brands} params={params} fixedCategory={fixedCategory}
      onCats={(slug, on) => go({ category: toggle(cats, slug, on) })}
      onBrands={(slug, on) => go({ brands: toggle(brands, slug, on) })}
      onPrice={(min, max) => go({ min: min > facets.price.min ? String(min) : undefined, max: max < facets.price.max ? String(max) : undefined })}
      onFlag={(key, on) => go({ [key]: on ? '1' : undefined })}
    />
  );

  return (
    <div className="container-x pt-6">
      <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Хлебные крошки">
        <Link href="/" className="hover:text-ink">Главная</Link>
        {(crumbs ?? [{ label: 'Каталог', href: title === 'Все товары' ? undefined : '/catalog' }, ...(title === 'Все товары' ? [] : [{ label: title }])]).map((c) => (
          <span key={c.label} className="flex items-center gap-1.5">
            <ChevronRight className="size-3.5" />
            {c.href ? <Link href={c.href} className="hover:text-ink">{c.label}</Link> : <span className="text-ink">{c.label}</span>}
          </span>
        ))}
      </nav>
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <span className="pb-1 text-muted-foreground">{goods(meta.total)}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-36 max-h-[calc(100dvh-10rem)] overflow-y-auto rounded-3xl bg-white p-5 ring-1 ring-black/5 no-scrollbar">
            {panel}
            {chips.length > 0 && (
              <button type="button" onClick={reset} className="mt-5 h-10 w-full rounded-full bg-secondary text-sm font-medium hover:bg-border">Сбросить всё</button>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex items-center gap-2">
            <button type="button" onClick={() => setSheet(true)}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium ring-1 ring-black/10 lg:hidden">
              <SlidersHorizontal className="size-4" /> Фильтры
              {chips.length > 0 && <span className="grid size-5 place-items-center rounded-full bg-brand text-[11px] font-bold text-white">{chips.length}</span>}
            </button>
            <span className="hidden text-sm text-muted-foreground lg:block">
              {meta.total ? <>Показано <b className="text-ink">{meta.from}–{meta.to}</b> из {goods(meta.total)}</> : 'Ничего не найдено'}
            </span>
            <label className="relative ml-auto">
              <span className="sr-only">Сортировка</span>
              <select value={params.sort ?? 'default'} onChange={(e) => go({ sort: e.target.value === 'default' ? undefined : e.target.value })}
                className="h-10 appearance-none rounded-full bg-white pr-9 pl-4 text-sm font-medium ring-1 ring-black/10 outline-none focus:ring-brand">
                {facets.sorts.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
            </label>
          </div>

          {chips.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {chips.map((c) => (
                <button key={c.label} type="button" onClick={() => go(c.clear)}
                  className="inline-flex h-8 items-center gap-1 rounded-full bg-ink pr-2 pl-3 text-xs font-medium text-white hover:bg-brand">
                  {c.label} <X className="size-3.5" />
                </button>
              ))}
              <button type="button" onClick={reset} className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-brand">Сбросить</button>
            </div>
          )}

          <div className={cn('transition-opacity', pending && 'pointer-events-none opacity-50')}>
            {data.length ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
                {data.map((p) => <ProductCard key={p.id} p={p} lowStock={lowStock} />)}
              </div>
            ) : (
              <EmptyState onReset={chips.length ? reset : undefined} />
            )}
          </div>

          {meta.last_page > 1 && (
            <nav className="mt-8 flex flex-wrap justify-center gap-1.5" aria-label="Страницы">
              <PageBtn disabled={meta.current_page === 1} onClick={() => go({ page: String(meta.current_page - 1) }, { keepPage: true })} label="Назад"><ChevronLeft className="size-4" /></PageBtn>
              {Array.from({ length: meta.last_page }, (_, i) => (
                <PageBtn key={i} active={i + 1 === meta.current_page} onClick={() => go({ page: i ? String(i + 1) : undefined }, { keepPage: true })}>{i + 1}</PageBtn>
              ))}
              <PageBtn disabled={meta.current_page === meta.last_page} onClick={() => go({ page: String(meta.current_page + 1) }, { keepPage: true })} label="Вперёд"><ChevronRight className="size-4" /></PageBtn>
            </nav>
          )}
        </div>
      </div>

      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent side="bottom" className="max-h-[88dvh] gap-0 rounded-t-3xl">
          <SheetHeader className="border-b p-5"><SheetTitle className="text-lg font-bold">Фильтры</SheetTitle></SheetHeader>
          <div className="overflow-y-auto p-5">{panel}</div>
          <SheetFooter className="flex-row border-t p-4">
            <button type="button" onClick={reset} className="h-12 flex-1 rounded-full bg-secondary font-medium">Сбросить</button>
            <button type="button" onClick={() => setSheet(false)} className="h-12 flex-[2] rounded-full bg-brand font-semibold text-white">
              {pending ? 'Загрузка…' : `Показать ${goods(meta.total)}`}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function EmptyState({ title = 'Ничего не найдено', text = 'Попробуйте изменить или сбросить фильтры', onReset }: { title?: string; text?: string; onReset?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-white px-6 py-16 text-center ring-1 ring-black/5">
      <div className="grid size-16 place-items-center rounded-full bg-secondary"><SearchX className="size-7 text-muted-foreground" /></div>
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground">{text}</p>
      {onReset && <button type="button" onClick={onReset} className="mt-2 h-10 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-brand">Сбросить фильтры</button>}
    </div>
  );
}

function PageBtn({ children, active, disabled, onClick, label }: {
  children: React.ReactNode; active?: boolean; disabled?: boolean; onClick: () => void; label?: string;
}) {
  return (
    <button type="button" aria-label={label} aria-current={active ? 'page' : undefined} disabled={disabled} onClick={onClick}
      className={cn('grid size-10 place-items-center rounded-full text-sm font-semibold transition disabled:opacity-30',
        active ? 'bg-ink text-white' : 'bg-white ring-1 ring-black/10 hover:ring-ink')}>
      {children}
    </button>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-border py-5 first:pt-0 last:border-0 last:pb-0">
      <legend className="float-left mb-3 w-full text-sm font-semibold">{title}</legend>
      <div className="clear-both space-y-1">{children}</div>
    </fieldset>
  );
}

function Check({ checked, onChange, label, count, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; count?: number; disabled?: boolean }) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-3 rounded-lg py-1.5 text-sm hover:text-brand', disabled && 'pointer-events-none opacity-60')}>
      <Checkbox checked={checked} disabled={disabled} onCheckedChange={(v) => onChange(!!v)} className="size-[18px] rounded-md" />
      <span className="flex-1">{label}</span>
      {count != null && <span className="text-xs text-muted-foreground">{count}</span>}
    </label>
  );
}

function FilterPanel({ facets, cats, brands, params, fixedCategory, onCats, onBrands, onPrice, onFlag }: {
  facets: Facets; cats: string[]; brands: string[]; params: CatalogParams; fixedCategory?: string;
  onCats: (slug: string, on: boolean) => void; onBrands: (slug: string, on: boolean) => void;
  onPrice: (min: number, max: number) => void; onFlag: (key: 'stock' | 'sale', on: boolean) => void;
}) {
  const [allBrands, setAllBrands] = useState(false);
  const { min: lo, max: hi } = facets.price;
  const [price, setPrice] = useState<[number, number]>([Number(params.min ?? lo), Number(params.max ?? hi)]);
  const shown = allBrands ? facets.brands : facets.brands.filter((b, i) => i < BRANDS_VISIBLE || brands.includes(b.slug));
  const step = Math.max(1, Math.round((hi - lo) / 100 / 100) * 100);

  return (
    <div>
      {facets.categories.length > 0 && (
        <Group title="Категории">
          {facets.categories.map((c) => (
            <Check key={c.slug} label={c.name} count={c.count} checked={cats.includes(c.slug)} disabled={c.slug === fixedCategory && cats.length === 1}
              onChange={(on) => onCats(c.slug, on)} />
          ))}
        </Group>
      )}
      {hi > lo && (
        <Group title="Цена, ₸">
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); onPrice(price[0], price[1]); }}>
            {[0, 1].map((i) => (
              <input key={i} type="number" inputMode="numeric" aria-label={i ? 'Цена до' : 'Цена от'} value={price[i]}
                onChange={(e) => { const n = [...price] as [number, number]; n[i] = Math.max(0, Number(e.target.value) || 0); setPrice(n); }}
                onBlur={() => onPrice(price[0], price[1])}
                className="h-10 w-full min-w-0 rounded-xl bg-secondary px-3 text-sm outline-none focus:ring-2 focus:ring-brand/30" />
            ))}
          </form>
          <Slider className="mt-4" min={lo} max={hi} step={step} value={price}
            onValueChange={(v) => Array.isArray(v) && setPrice([v[0], v[1]])}
            onValueCommitted={(v) => Array.isArray(v) && onPrice(v[0], v[1])} />
        </Group>
      )}
      {facets.brands.length > 0 && (
        <Group title="Бренд">
          {shown.map((b) => <Check key={b.slug} label={b.name} count={b.count} checked={brands.includes(b.slug)} onChange={(on) => onBrands(b.slug, on)} />)}
          {facets.brands.length > BRANDS_VISIBLE && (
            <button type="button" onClick={() => setAllBrands(!allBrands)} className="mt-1 text-sm font-medium text-brand">
              {allBrands ? 'Свернуть' : `Показать все (${facets.brands.length})`}
            </button>
          )}
        </Group>
      )}
      <Group title="Дополнительно">
        <Check label="В наличии" checked={!!params.stock} onChange={(on) => onFlag('stock', on)} />
        <Check label="Со скидкой" checked={!!params.sale} onChange={(on) => onFlag('sale', on)} />
      </Group>
    </div>
  );
}
