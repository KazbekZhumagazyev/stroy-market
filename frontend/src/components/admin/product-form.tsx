'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, ImagePlus, LoaderCircle, Search, Star, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { mutate as globalMutate } from 'swr';
import { ApiError, adminFetch, storageUrl, useMeta } from '@/lib/admin/client';
import type { Field } from '@/lib/admin/fields';
import { toPayload } from '@/lib/admin/product';
import { fmt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useConfirm } from './confirm';
import { IconBtn, inputCls, SchemaForm, useUpload } from './schema-form';
import { seoFields } from './seo-fields';
import { btn, Card, PageHeader } from './ui';

export type ProductData = Record<string, unknown> & {
  id?: number; name: string; slug?: string; images: string[]; bundle_ids: number[]; is_active: boolean;
};

export const EMPTY_PRODUCT: ProductData = {
  name: '', slug: '', sku: '', category_id: null, brand_id: null, price: 0, old_price: null, unit: 'шт', rating: 5, sold: 0, stock: 0, badge: null,
  images: [], short_description: '', description: '', specs: [], calc: { label: '', per_unit: null, hint: '' },
  is_active: true, is_featured: false, sort: 0, seo_title: '', seo_description: '', bundle_ids: [],
};

const UNITS = ['шт', 'упак', 'мешок', 'лист', 'м²', 'м³', 'м', 'кг', 'л', 'бухта', 'рулон', 'компл'];

export function ProductForm({ initial }: { initial: ProductData }) {
  const router = useRouter();
  const confirm = useConfirm();
  const { data: meta } = useMeta();
  const [p, setP] = useState<ProductData>(initial);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const update = (v: ProductData) => { setP(v); setDirty(true); };

  const opts = (list?: { id: number; name: string }[]) => (list ?? []).map((x) => ({ value: x.id, label: x.name }));

  const main: Field[] = [
    { type: 'text', key: 'name', label: 'Название', required: true },
    { type: 'select', key: 'category_id', label: 'Категория', options: opts(meta?.categories), required: true, empty: 'Выберите категорию', half: true },
    { type: 'select', key: 'brand_id', label: 'Бренд', options: opts(meta?.brands), empty: 'Без бренда', half: true },
    { type: 'text', key: 'sku', label: 'Артикул', hint: 'Пусто — присвоится автоматически', half: true },
    { type: 'text', key: 'slug', label: 'Адрес в URL', hint: 'Пусто — из названия', half: true },
    { type: 'textarea', key: 'short_description', label: 'Краткое описание', rows: 2, hint: 'Под названием на странице товара' },
  ];
  const price: Field[] = [
    { type: 'number', key: 'price', label: 'Цена', suffix: '₸', required: true, half: true },
    { type: 'number', key: 'old_price', label: 'Старая цена', suffix: '₸', hint: 'Если указана — показывается скидка', half: true },
    { type: 'select', key: 'unit', label: 'Единица продажи', options: UNITS.map((u) => ({ value: u, label: u })), required: true, half: true },
    { type: 'number', key: 'stock', label: 'Остаток на складе', half: true },
    { type: 'select', key: 'badge', label: 'Бейдж', empty: 'Без бейджа', options: Object.entries(meta?.badges ?? {}).map(([value, label]) => ({ value, label })), half: true },
    { type: 'number', key: 'rating', label: 'Рейтинг', step: 0.1, hint: 'От 0 до 5', half: true },
    { type: 'number', key: 'sold', label: 'Продано, шт', hint: 'Растёт автоматически с заказами', half: true },
  ];
  const content: Field[] = [
    { type: 'textarea', key: 'description', label: 'Описание', rows: 8, hint: '## Заголовок, «- пункт» — список, пустая строка — новый абзац. Пусто — стандартный текст из настроек' },
    { type: 'repeater', key: 'specs', label: 'Характеристики', itemLabel: 'Строка', fields: [
      { type: 'text', key: 'key', label: 'Параметр', placeholder: 'Толщина', half: true },
      { type: 'text', key: 'value', label: 'Значение', placeholder: '50 мм', half: true },
    ] },
  ];
  const calc: Field[] = [
    { type: 'group', label: 'Калькулятор расхода', hint: 'Покупатель вводит площадь/объём → нужно = вверх(значение ÷ «сколько покрывает 1 единица»). Пусто — калькулятор скрыт', fields: [
      { type: 'text', key: 'calc.label', label: 'Что вводит покупатель', placeholder: 'Площадь утепления, м²', half: true },
      { type: 'number', key: 'calc.per_unit', label: 'Сколько покрывает 1 единица', step: 0.0001, placeholder: '6', half: true },
      { type: 'text', key: 'calc.hint', label: 'Подсказка', placeholder: '6 м² в одной упаковке (слой 50 мм)' },
    ] },
  ];
  const publish: Field[] = [
    { type: 'switch', key: 'is_active', label: 'Показывать на сайте' },
    { type: 'switch', key: 'is_featured', label: 'Рекомендуемый', hint: 'Блок «Новинки и рекомендуем», выше в каталоге' },
    { type: 'number', key: 'sort', label: 'Порядок в каталоге', hint: 'Меньше — выше' },
  ];

  async function save() {
    setBusy(true);
    setErrors({});
    try {
      const res = await adminFetch<{ data: ProductData }>(p.id ? `products/${p.id}` : 'products', { method: p.id ? 'PUT' : 'POST', json: toPayload(p) });
      toast.success(p.id ? 'Товар сохранён' : 'Товар создан');
      setDirty(false);
      globalMutate('meta');
      if (!p.id) router.replace(`/admin/products/${res.data.id}`);
      else setP({ ...res.data, images: (res.data.images as unknown as { path: string }[]).map((i) => i.path) });
    } catch (e) {
      if (e instanceof ApiError) setErrors(e.errors);
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!p.id || !(await confirm({ title: `Удалить «${p.name}»?`, text: 'Товар пропадёт с сайта. В старых заказах он останется.' }))) return;
    await adminFetch(`products/${p.id}`, { method: 'DELETE' });
    toast.success('Товар удалён');
    router.replace('/admin/products');
  }

  const saveBtn = (
    <button form="product-form" disabled={busy} className={btn.primary}>
      {busy && <LoaderCircle className="size-4 animate-spin" />} {p.id ? 'Сохранить' : 'Создать товар'}
    </button>
  );

  return (
    <form id="product-form" onSubmit={(e) => { e.preventDefault(); save(); }}>
      <PageHeader title={p.id ? p.name || 'Товар' : 'Новый товар'} back="/admin/products"
        actions={<>
          {p.id && p.slug && <a href={`/product/${p.slug}`} target="_blank" className={btn.light}><ExternalLink className="size-4" /> На сайте</a>}
          {saveBtn}
        </>} />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-5">
          <Card title="Основное"><SchemaForm fields={main} value={p} onChange={update} errors={errors} /></Card>
          <Card title="Фотографии"><Images value={p.images} onChange={(images) => update({ ...p, images })} /></Card>
          <Card title="Цена и склад"><SchemaForm fields={price} value={p} onChange={update} errors={errors} /></Card>
          <Card title="Описание и характеристики"><SchemaForm fields={content} value={p} onChange={update} errors={errors} /></Card>
          <Card><SchemaForm fields={calc} value={p} onChange={update} errors={errors} /></Card>
          <Card title="Купите вместе" actions={<span className="text-xs text-muted-foreground">до 5 товаров</span>}>
            <BundlePicker value={p.bundle_ids} self={p.id} onChange={(bundle_ids) => update({ ...p, bundle_ids })} />
          </Card>
          <Card><SchemaForm fields={seoFields} value={p} onChange={update} errors={errors} /></Card>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-8 lg:self-start">
          <Card title="Публикация">
            <SchemaForm fields={publish} value={p} onChange={update} errors={errors} />
            <div className="mt-5 grid gap-2">
              {saveBtn}
              {dirty && <p className="text-center text-xs text-warn">Есть несохранённые изменения</p>}
              {p.id && <button type="button" onClick={remove} className={cn(btn.ghost, 'text-destructive hover:bg-destructive/10 hover:text-destructive')}><Trash2 className="size-4" /> Удалить товар</button>}
            </div>
          </Card>
          <Card title="Превью цены">
            <div className="text-3xl font-bold">{fmt(Number(p.price) || 0)}</div>
            {Number(p.old_price) > Number(p.price) && (
              <div className="mt-1 text-sm"><s className="text-muted-foreground">{fmt(Number(p.old_price))}</s> <span className="font-semibold text-brand">−{Math.round((1 - Number(p.price) / Number(p.old_price)) * 100)}%</span></div>
            )}
            <div className="mt-1 text-sm text-muted-foreground">за {String(p.unit)}</div>
          </Card>
        </aside>
      </div>
    </form>
  );
}

function Images({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const { busy, upload } = useUpload('products');
  const move = (i: number, d: number) => { const n = [...value]; [n[i], n[i + d]] = [n[i + d], n[i]]; onChange(n); };
  const add = async (files: FileList | null) => { if (files?.length) onChange([...value, ...(await upload(files))]); };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files); }}
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {value.map((path, i) => (
        <div key={path} className="group relative aspect-square overflow-hidden rounded-2xl bg-surface ring-1 ring-black/5">
          <Image src={storageUrl(path)!} alt="" fill sizes="200px" className="object-contain p-2" />
          {i === 0 && <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold text-white"><Star className="size-3" /> Главное</span>}
          <div className="absolute inset-x-2 bottom-2 flex justify-center gap-1 rounded-xl bg-white/90 p-1 opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100">
            <IconBtn label="Левее" disabled={i === 0} onClick={() => move(i, -1)}><ArrowLeft className="size-4" /></IconBtn>
            <IconBtn label="Сделать главным" disabled={i === 0} onClick={() => onChange([path, ...value.filter((x) => x !== path)])}><Star className="size-4" /></IconBtn>
            <IconBtn label="Правее" disabled={i === value.length - 1} onClick={() => move(i, 1)}><ArrowRight className="size-4" /></IconBtn>
            <IconBtn label="Удалить" danger onClick={() => onChange(value.filter((x) => x !== path))}><Trash2 className="size-4" /></IconBtn>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => input.current?.click()}
        className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-ink/15 text-center text-sm text-muted-foreground transition hover:border-ink hover:text-ink">
        {busy ? <LoaderCircle className="size-6 animate-spin" /> : <span className="flex flex-col items-center gap-2 px-2"><ImagePlus className="size-7" /> Загрузить или перетащить</span>}
      </button>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
    </div>
  );
}

function BundlePicker({ value, self, onChange }: { value: number[]; self?: number; onChange: (v: number[]) => void }) {
  const { data: meta } = useMeta();
  const [q, setQ] = useState('');
  const all = meta?.products ?? [];
  const byId = new Map(all.map((x) => [x.id, x]));
  const found = q.length > 1 ? all.filter((x) => x.id !== self && !value.includes(x.id) && x.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8) : [];

  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-3 space-y-2">
          {value.map((id) => (
            <li key={id} className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2 text-sm">
              <span className="flex-1 truncate">{byId.get(id)?.name ?? `Товар #${id}`}</span>
              <span className="text-muted-foreground">{byId.get(id) && fmt(byId.get(id)!.price)}</span>
              <IconBtn label="Убрать" danger onClick={() => onChange(value.filter((x) => x !== id))}><X className="size-4" /></IconBtn>
            </li>
          ))}
        </ul>
      )}
      {value.length < 5 && (
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input className={cn(inputCls, 'pl-10')} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Найти товар для комплекта…" />
          {found.length > 0 && (
            <ul className="absolute inset-x-0 top-12 z-10 max-h-64 overflow-y-auto rounded-xl bg-white p-1 shadow-lift ring-1 ring-black/5">
              {found.map((x) => (
                <li key={x.id}>
                  <button type="button" onClick={() => { onChange([...value, x.id]); setQ(''); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary">
                    <span className="flex-1 truncate">{x.name}</span><span className="text-muted-foreground">{fmt(x.price)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {!value.length && <p className="mt-2 text-xs text-muted-foreground">Если пусто — блок «Купите вместе» на странице товара не показывается</p>}
    </div>
  );
}
