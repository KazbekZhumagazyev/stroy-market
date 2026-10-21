'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, Empty, PageHeader, Pager, Pill, SearchInput, Skeleton, STATUS_TONE, Table, td } from '@/components/admin/ui';
import { useAdmin, useMeta } from '@/lib/admin/client';
import { fmt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { dateTime } from '@/lib/admin/format';

type Order = { id: number; number: string; status: string; customer_name: string; phone: string; total: number; delivery_title: string; items_count: number; created_at: string };



export default function OrdersPage() {
  const router = useRouter();
  const { data: meta } = useMeta();
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdmin<{ data: Order[]; meta: { total: number; page: number; last_page: number }; counts: Record<string, number> }>(
    `orders?page=${page}&status=${status}&q=${encodeURIComponent(q)}`, { refreshInterval: 30000 },
  );
  const statuses = meta?.order_statuses ?? {};
  const all = Object.values(data?.counts ?? {}).reduce((s, n) => s + n, 0);

  return (
    <>
      <PageHeader title="Заказы" description="Новые заказы обновляются автоматически каждые 30 секунд" />
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 no-scrollbar md:mx-0 md:px-0">
        {[['', 'Все', all] as const, ...Object.entries(statuses).map(([k, label]) => [k, label, data?.counts[k] ?? 0] as const)].map(([key, label, count]) => (
          <button key={key} type="button" onClick={() => { setStatus(key); setPage(1); }}
            className={cn('inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition',
              status === key ? 'bg-ink text-white' : 'bg-white ring-1 ring-black/5 hover:ring-black/20')}>
            {label} <span className={cn('rounded-full px-1.5 text-xs', status === key ? 'bg-white/20' : 'bg-secondary')}>{count}</span>
          </button>
        ))}
      </div>
      <Card>
        <div className="mb-4"><SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Номер, имя или телефон" /></div>
        {isLoading && !data ? (
          <div className="space-y-2">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : (
          <Table head={['№', 'Дата', 'Покупатель', 'Доставка', 'Сумма', 'Статус']} empty={!data?.data.length && <Empty text="Заказов пока нет" />}>
            {data?.data.map((o) => (
              <tr key={o.id} className="cursor-pointer transition hover:bg-surface" onClick={() => router.push(`/admin/orders/${o.id}`)}>
                <td className={cn(td, 'font-semibold')}>{o.number}</td>
                <td className={cn(td, 'whitespace-nowrap text-muted-foreground')}>{dateTime(o.created_at)}</td>
                <td className={td}><div className="font-medium">{o.customer_name}</div><div className="text-xs text-muted-foreground">{o.phone}</div></td>
                <td className={td}>{o.delivery_title}</td>
                <td className={cn(td, 'whitespace-nowrap font-semibold')}>{fmt(o.total)}<div className="text-xs font-normal text-muted-foreground">{o.items_count} поз.</div></td>
                <td className={td}><Pill tone={STATUS_TONE[o.status]}>{statuses[o.status] ?? o.status}</Pill></td>
              </tr>
            ))}
          </Table>
        )}
        {data && <Pager page={data.meta.page} last={data.meta.last_page} onPage={setPage} />}
      </Card>
    </>
  );
}
