'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/components/admin/confirm';
import { btn, Card, Empty, PageHeader, Pager, Pill, SearchInput, Skeleton, Table, td } from '@/components/admin/ui';
import { ProductThumb } from '@/components/product-thumb';
import { Switch } from '@/components/ui/switch';
import { adminFetch, type ListResponse, storageUrl, useAdmin, useMeta } from '@/lib/admin/client';
import { toPayload } from '@/lib/admin/product';
import { fmt } from '@/lib/format';

type P = {
  id: number; name: string; sku: string; price: number; old_price: number | null; stock: number; sold: number; is_active: boolean; badge: string | null;
  images: { path: string; url: string }[]; category: { name: string; icon: string; color: string; bg: string }; brand: { name: string } | null;
};

const selectCls = 'h-10 appearance-none rounded-full bg-white pr-9 pl-4 text-sm ring-1 ring-black/10 outline-none focus:ring-ink';

export default function ProductsPage() {
  const router = useRouter();
  const confirm = useConfirm();
  const { data: meta } = useMeta();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, mutate } = useAdmin<ListResponse<P>>(`products?page=${page}&q=${encodeURIComponent(q)}&category_id=${cat}&status=${status}&sort=${sort}`);

  const toggle = async (p: P, is_active: boolean) => {
    mutate((d) => d && { ...d, data: d.data.map((x) => (x.id === p.id ? { ...x, is_active } : x)) }, false);
    const full = await adminFetch<{ data: Record<string, unknown> }>(`products/${p.id}`);
    await adminFetch(`products/${p.id}`, { method: 'PUT', json: toPayload({ ...full.data, is_active }) }).catch((e) => toast.error(e.message));
    mutate();
  };

  const remove = async (p: P) => {
    if (!(await confirm({ title: `Удалить «${p.name}»?`, text: 'Товар пропадёт с сайта. В старых заказах он останется.' }))) return;
    await adminFetch(`products/${p.id}`, { method: 'DELETE' }).then(() => toast.success('Товар удалён')).catch((e) => toast.error(e.message));
    mutate();
  };


  return (
    <>
      <PageHeader title="Товары" description="Цены, остатки, фото, характеристики и калькулятор расхода"
        actions={<Link href="/admin/products/new" className={btn.primary}><Plus className="size-4" /> Добавить товар</Link>} />
      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Название или артикул" />
          <Select value={cat} onChange={(v) => { setCat(v); setPage(1); }}>
            <option value="">Все категории</option>
            {meta?.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }}>
            <option value="">Любой статус</option><option value="active">На сайте</option><option value="hidden">Скрытые</option>
          </Select>
          <Select value={sort} onChange={(v) => { setSort(v); setPage(1); }}>
            <option value="">Сначала новые</option><option value="sold">По продажам</option><option value="stock">По остатку</option><option value="price">По цене</option>
          </Select>
          {data && <span className="ml-auto text-sm text-muted-foreground">Всего: {data.meta.total}</span>}
        </div>
        {isLoading && !data ? (
          <div className="space-y-2">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : (
          <Table head={['Товар', 'Категория', 'Цена', 'Остаток', 'Продано', 'На сайте', '']} empty={!data?.data.length && <Empty text="Товаров не найдено" />}>
            {data?.data.map((p) => (
              <tr key={p.id} className="cursor-pointer transition hover:bg-surface" onClick={() => router.push(`/admin/products/${p.id}`)}>
                <td className={td}>
                  <div className="flex items-center gap-3">
                    <ProductThumb p={{ name: p.name, image: storageUrl(p.images[0]?.path), category: { ...p.category, slug: '' } }} className="size-12 shrink-0 rounded-xl" iconClass="size-5" sizes="48px" />
                    <div className="min-w-0">
                      <div className="line-clamp-1 font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.sku}{p.brand && ` · ${p.brand.name}`}</div>
                    </div>
                  </div>
                </td>
                <td className={td}>{p.category.name}</td>
                <td className={`${td} whitespace-nowrap`}>
                  <div className="font-semibold">{fmt(p.price)}</div>
                  {p.old_price && <s className="text-xs text-muted-foreground">{fmt(p.old_price)}</s>}
                </td>
                <td className={td}>{p.stock <= 0 ? <Pill tone="gray">Нет</Pill> : p.stock <= 50 ? <Pill tone="yellow">{p.stock}</Pill> : p.stock.toLocaleString('ru-RU')}</td>
                <td className={td}>{p.sold.toLocaleString('ru-RU')}</td>
                <td className={td} onClick={(e) => e.stopPropagation()}><Switch checked={p.is_active} onCheckedChange={(v) => toggle(p, v)} /></td>
                <td className={`${td} text-right`} onClick={(e) => e.stopPropagation()}>
                  <button type="button" aria-label="Удалить" onClick={() => remove(p)} className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></button>
                </td>
              </tr>
            ))}
          </Table>
        )}
        {data && <Pager page={data.meta.page} last={data.meta.last_page} onPage={setPage} />}
      </Card>
    </>
  );
}

function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>{children}</select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
    </label>
  );
}
