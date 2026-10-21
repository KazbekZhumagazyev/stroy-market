'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AlertTriangle, ArrowRight, Banknote, Mail, Package, ShoppingBag, TrendingUp, Wallet } from 'lucide-react';
import { Card, PageHeader, Pill, Skeleton, STATUS_TONE } from '@/components/admin/ui';
import { useAdmin, useMeta } from '@/lib/admin/client';
import { dateTime } from '@/lib/admin/format';
import { fmt } from '@/lib/format';

type Dashboard = {
  stats: Record<'orders_today' | 'revenue_today' | 'revenue_month' | 'new_orders' | 'products' | 'low_stock' | 'subscribers' | 'average_check', number>;
  chart: { date: string; orders: number; revenue: number }[];
  latest_orders: { id: number; number: string; status: string; customer_name: string; total: number; created_at: string }[];
  top_products: { id: number; name: string; sold: number; price: number; stock: number }[];
};

export default function DashboardPage() {
  const { data } = useAdmin<Dashboard>('dashboard', { refreshInterval: 60000 });
  const { data: meta } = useMeta();
  if (!data) return <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-28" />)}</div>;
  const s = data.stats;

  const tiles = [
    { label: 'Заказов сегодня', value: s.orders_today, icon: ShoppingBag, href: '/admin/orders' },
    { label: 'Выручка сегодня', value: fmt(s.revenue_today), icon: Banknote },
    { label: 'Выручка за месяц', value: fmt(s.revenue_month), icon: TrendingUp },
    { label: 'Средний чек (30 дней)', value: fmt(s.average_check), icon: Wallet },
    { label: 'Новые, ждут звонка', value: s.new_orders, icon: ShoppingBag, href: '/admin/orders', accent: s.new_orders > 0 },
    { label: 'Товаров в каталоге', value: s.products, icon: Package, href: '/admin/products' },
    { label: 'Заканчиваются (≤50)', value: s.low_stock, icon: AlertTriangle, href: '/admin/products' },
    { label: 'Подписчиков', value: s.subscribers, icon: Mail, href: '/admin/subscribers' },
  ];

  return (
    <>
      <PageHeader title="Дашборд" description="Продажи и состояние магазина" />
      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        {tiles.map(({ label, value, icon: Icon, href, accent }) => {
          const body = (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className={`grid size-9 place-items-center rounded-xl ${accent ? 'bg-brand text-white' : 'bg-secondary text-ink'}`}><Icon className="size-4" /></span>
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">{value}</div>
            </>
          );
          const cls = `rounded-3xl bg-white p-5 ring-1 ring-black/5 ${href ? 'transition hover:shadow-lift' : ''}`;
          return href ? <Link key={label} href={href} className={cls}>{body}</Link> : <div key={label} className={cls}>{body}</div>;
        })}
      </div>

      <Card title="Выручка за 30 дней" className="mt-5" actions={<span className="text-sm text-muted-foreground">без отменённых заказов</span>}>
        <RevenueChart data={data.chart} />
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card title="Последние заказы" actions={<Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand">Все <ArrowRight className="size-4" /></Link>}>
          {data.latest_orders.length ? (
            <ul className="divide-y">
              {data.latest_orders.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-3 py-3 text-sm hover:text-brand">
                    <span className="w-16 font-semibold">№{o.number}</span>
                    <span className="min-w-0 flex-1 truncate">{o.customer_name}<span className="block text-xs text-muted-foreground">{dateTime(o.created_at)}</span></span>
                    <Pill tone={STATUS_TONE[o.status]}>{meta?.order_statuses[o.status] ?? o.status}</Pill>
                    <span className="w-24 text-right font-semibold">{fmt(o.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="py-8 text-center text-sm text-muted-foreground">Заказов пока нет</p>}
        </Card>
        <Card title="Топ товаров по продажам">
          <ul className="divide-y">
            {data.top_products.map((p, i) => (
              <li key={p.id}>
                <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 py-3 text-sm hover:text-brand">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                  <span className="text-muted-foreground">{p.sold.toLocaleString('ru-RU')} продано</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

/** Столбики выручки по дням: один ряд — один цвет, подсказка при наведении. */
function RevenueChart({ data }: { data: Dashboard['chart'] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const total = data.reduce((s, d) => s + d.revenue, 0);
  const orders = data.reduce((s, d) => s + d.orders, 0);
  const day = (iso: string) => new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(iso));
  const h = hover != null ? data[hover] : null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <div><span className="text-2xl font-bold">{fmt(h ? h.revenue : total)}</span> <span className="text-sm text-muted-foreground">{h ? day(h.date) : 'за 30 дней'}</span></div>
        <div className="text-sm text-muted-foreground">{h ? h.orders : orders} заказ(ов)</div>
      </div>
      <div className="relative h-48" onMouseLeave={() => setHover(null)}>
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3].map((i) => <div key={i} className="border-t border-dashed border-border" />)}
        </div>
        <div className="relative flex h-full items-end gap-[2px]">
          {data.map((d, i) => (
            <button key={d.date} type="button" aria-label={`${day(d.date)}: ${fmt(d.revenue)}`} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)}
              className="group flex h-full flex-1 items-end">
              <span className="w-full rounded-t-[4px] bg-brand transition-opacity"
                style={{ height: `${Math.max(d.revenue ? 2 : 0.5, (d.revenue / max) * 100)}%`, opacity: hover == null || hover === i ? 1 : 0.35, background: d.revenue ? undefined : 'var(--border)' }} />
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{day(data[0].date)}</span><span>{day(data[Math.floor(data.length / 2)].date)}</span><span>Сегодня</span>
      </div>
    </div>
  );
}
