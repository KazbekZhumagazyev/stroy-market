'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { Check, LoaderCircle, Mail, MapPin, MessageCircle, Phone, Trash2, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { mutate as globalMutate } from 'swr';
import { useConfirm } from '@/components/admin/confirm';
import { inputCls } from '@/components/admin/schema-form';
import { btn, Card, PageHeader, Pill, Skeleton, STATUS_TONE } from '@/components/admin/ui';
import { adminFetch, useAdmin, useMeta } from '@/lib/admin/client';
import { dateTime } from '@/lib/admin/format';
import { fmt, phoneHref, waHref } from '@/lib/format';
import { cn } from '@/lib/utils';

type Order = {
  id: number; number: string; status: string; customer_name: string; phone: string; email: string | null; address: string | null; comment: string | null;
  delivery_title: string; delivery_price: number; subtotal: number; discount: number; bundle_discount: number; total: number; manager_note: string | null; created_at: string;
  items: { id: number; name: string; sku: string; unit: string; price: number; old_price: number | null; qty: number; total: number; product: { slug: string } | null }[];
};

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const confirm = useConfirm();
  const { data: meta } = useMeta();
  const { data, mutate } = useAdmin<{ data: Order }>(`orders/${id}`, { keepPreviousData: false });
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!data) return <div className="space-y-4"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-96" /></div>;
  const o = data.data;
  const statuses = meta?.order_statuses ?? {};

  const save = async (patch: Partial<Order>) => {
    setBusy(true);
    try {
      const res = await adminFetch<{ data: Order }>(`orders/${o.id}`, { method: 'PUT', json: patch });
      mutate(res, false);
      globalMutate('meta');
      toast.success('Сохранено');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!(await confirm({ title: `Удалить заказ №${o.number}?`, text: 'Заказ исчезнет из списка и статистики.' }))) return;
    await adminFetch(`orders/${o.id}`, { method: 'DELETE' });
    globalMutate('meta');
    toast.success('Заказ удалён');
    router.replace('/admin/orders');
  };

  return (
    <>
      <PageHeader title={`Заказ №${o.number}`} description={`Оформлен ${dateTime(o.created_at)}`} back="/admin/orders"
        actions={<Pill tone={STATUS_TONE[o.status]}>{statuses[o.status]}</Pill>} />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-5">
          <Card title="Статус заказа">
            <div className="flex flex-wrap gap-2">
              {Object.entries(statuses).map(([key, label]) => (
                <button key={key} type="button" disabled={busy || key === o.status} onClick={() => save({ status: key })}
                  className={cn('inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition',
                    key === o.status ? 'bg-ink text-white' : 'bg-secondary hover:bg-border')}>
                  {key === o.status && <Check className="size-4" />} {label}
                </button>
              ))}
            </div>
          </Card>

          <Card title={`Товары (${o.items.length})`}>
            <ul className="divide-y">
              {o.items.map((it) => (
                <li key={it.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
                  <div className="min-w-0 flex-1">
                    {it.product ? <Link href={`/product/${it.product.slug}`} target="_blank" className="font-medium hover:text-brand">{it.name}</Link> : <span className="font-medium">{it.name}</span>}
                    <div className="text-xs text-muted-foreground">{it.sku}</div>
                  </div>
                  <div className="text-muted-foreground">{it.qty} {it.unit} × {fmt(it.price)}</div>
                  <div className="w-28 text-right font-semibold">{fmt(it.total)}</div>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
              <Row label="Товары" value={fmt(o.subtotal)} />
              {o.discount > 0 && <Row label="Скидка по старым ценам (уже в цене)" value={`−${fmt(o.discount)}`} muted />}
              {o.bundle_discount > 0 && <Row label="Скидка за комплект" value={`−${fmt(o.bundle_discount)}`} />}
              <Row label={o.delivery_title} value={o.delivery_price ? fmt(o.delivery_price) : 'Бесплатно'} />
              <div className="flex items-baseline justify-between pt-2 text-base"><dt className="font-semibold">Итого</dt><dd className="text-2xl font-bold">{fmt(o.total)}</dd></div>
            </dl>
          </Card>

          <Card title="Заметка менеджера">
            <textarea className={cn(inputCls, 'h-auto py-2.5')} rows={3} value={note ?? o.manager_note ?? ''} onChange={(e) => setNote(e.target.value)}
              placeholder="Видна только в админке: договорённости, время доставки…" />
            <button type="button" disabled={busy || note === null} onClick={() => save({ manager_note: note })} className={cn(btn.dark, 'mt-3')}>
              {busy && <LoaderCircle className="size-4 animate-spin" />} Сохранить заметку
            </button>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card title="Покупатель">
            <div className="text-lg font-semibold">{o.customer_name}</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-2"><Phone className="size-4 text-muted-foreground" /> {o.phone}</li>
              {o.email && <li className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" /> {o.email}</li>}
              <li className="flex items-start gap-2"><Truck className="mt-0.5 size-4 text-muted-foreground" /> {o.delivery_title}</li>
              {o.address && <li className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 text-muted-foreground" /> {o.address}</li>}
            </ul>
            {o.comment && <p className="mt-3 rounded-xl bg-sun/15 p-3 text-sm">💬 {o.comment}</p>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href={phoneHref(o.phone)} className={btn.dark}><Phone className="size-4" /> Позвонить</a>
              <a href={waHref(o.phone)} target="_blank" className={cn(btn.light, 'text-[#128c4a]')}><MessageCircle className="size-4" /> WhatsApp</a>
            </div>
          </Card>
          <button type="button" onClick={remove} className={cn(btn.ghost, 'w-full text-destructive hover:bg-destructive/10 hover:text-destructive')}>
            <Trash2 className="size-4" /> Удалить заказ
          </button>
        </aside>
      </div>
    </>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return <div className={cn('flex justify-between', muted && 'text-muted-foreground')}><dt>{label}</dt><dd>{value}</dd></div>;
}
