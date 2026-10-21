'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CircleCheck, LoaderCircle, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ProductThumb } from '@/components/product-thumb';
import { QtyStepper } from '@/components/qty-stepper';
import { fmt, goods, productHref, tpl } from '@/lib/format';
import { clientApi, useSite } from '@/lib/site';
import { cartCount, cartTotals, useHydrated, useShop } from '@/lib/store';
import type { ProductCard } from '@/lib/types';
import { cn } from '@/lib/utils';

const field = 'h-12 w-full rounded-xl bg-secondary px-4 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-ink aria-invalid:ring-2 aria-invalid:ring-destructive';

export function CartView() {
  const { settings, delivery, apiUrl } = useSite();
  const c = settings.cart;
  const ready = useHydrated();
  const { cart, bundles, setQty, remove, clear, refresh } = useShop();
  const [deliveryId, setDeliveryId] = useState<number | undefined>(delivery[0]?.id);
  const [order, setOrder] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const { subtotal, saved, bundle, total } = cartTotals(cart, bundles, c.bundle_discount_percent);

  const opt = delivery.find((o) => o.id === deliveryId);
  const deliveryPrice = !cart.length || !opt || (opt.free_from && total >= opt.free_from) ? 0 : opt.price;

  // Актуальные цены и наличие: корзина могла пролежать в браузере несколько дней
  const ids = cart.map((i) => i.id).join(',');
  useEffect(() => {
    if (!ready || !ids) return;
    clientApi<{ data: ProductCard[] }>(apiUrl, `/products?ids=${ids}`).then((r) => refresh(r.data)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps -- только при открытии страницы
  }, [ready]);

  async function submit(form: HTMLFormElement) {
    const f = new FormData(form);
    setBusy(true);
    setErrors({});
    try {
      const res = await clientApi<{ number: string }>(apiUrl, '/orders', {
        method: 'POST',
        body: JSON.stringify({
          name: f.get('name'), phone: f.get('phone'), email: f.get('email') || null, address: f.get('address') || null,
          comment: f.get('comment') || null, delivery_option_id: deliveryId,
          items: cart.map(({ id, qty }) => ({ id, qty })), bundles,
        }),
      });
      setOrder(res.number);
      clear();
      window.scrollTo({ top: 0 });
    } catch (err) {
      const e = err as Error & { errors?: Record<string, string[]> };
      setErrors(e.errors ?? {});
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <div className="container-x min-h-[50vh] pt-6" />;

  if (order) {
    return (
      <div className="container-x pt-10">
        <div className="mx-auto flex max-w-lg flex-col items-center rounded-3xl bg-white p-10 text-center ring-1 ring-black/5">
          <div className="grid size-20 place-items-center rounded-full bg-success/10 text-success"><CircleCheck className="size-10" /></div>
          <h1 className="mt-5 text-2xl font-bold">{tpl(c.success_title, { number: order })}</h1>
          <p className="mt-2 text-muted-foreground">{c.success_text}</p>
          <Link href="/" className="mt-6 h-12 rounded-full bg-ink px-8 leading-[3rem] font-semibold text-white hover:bg-brand">На главную</Link>
        </div>
      </div>
    );
  }

  const err = (k: string) => errors[k]?.[0];

  return (
    <div className="container-x pt-6">
      <h1 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
        Корзина {cart.length > 0 && <span className="text-muted-foreground">· {goods(cartCount(cart))}</span>}
      </h1>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white px-6 py-16 text-center ring-1 ring-black/5">
          <div className="grid size-20 place-items-center rounded-full bg-secondary"><ShoppingCart className="size-8 text-muted-foreground" /></div>
          <p className="text-lg font-semibold">Корзина пуста</p>
          <p className="text-sm text-muted-foreground">{c.empty_text}</p>
          <Link href="/catalog" className="mt-2 h-12 rounded-full bg-brand px-8 leading-[3rem] font-semibold text-white hover:bg-brand-dark">Перейти в каталог</Link>
        </div>
      ) : (
        <form className="grid gap-6 lg:grid-cols-[1fr_380px]" onSubmit={(e) => { e.preventDefault(); submit(e.currentTarget); }}>
          <div className="min-w-0 space-y-6">
            <section className="rounded-3xl bg-white p-5 ring-1 ring-black/5 md:p-6">
              <div className="mb-2 flex items-center">
                <h2 className="font-semibold">Товары</h2>
                <button type="button" onClick={clear} className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand">
                  <Trash2 className="size-4" /> Очистить
                </button>
              </div>
              {err('items') && <p className="mb-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{err('items')}</p>}
              <ul className="divide-y">
                {cart.map(({ id, qty, product: p }) => (
                  <li key={id} className="grid grid-cols-[72px_1fr] gap-x-4 gap-y-3 py-4 md:grid-cols-[88px_1fr_auto_120px_auto] md:items-center">
                    <Link href={productHref(p)} className="row-span-2 md:row-span-1">
                      <ProductThumb p={p} className="aspect-square rounded-2xl" iconClass="size-8" sizes="88px" />
                    </Link>
                    <div className="min-w-0">
                      {p.brand && <div className="text-xs text-muted-foreground uppercase">{p.brand}</div>}
                      <Link href={productHref(p)} className="line-clamp-2 text-sm font-medium hover:text-brand">{p.name}</Link>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {fmt(p.price)} / {p.unit} {p.old_price && p.old_price > p.price && <s className="ml-1">{fmt(p.old_price)}</s>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:contents">
                      <QtyStepper size="sm" value={qty} onChange={(v) => setQty(id, v)} />
                      <div className="ml-auto font-bold md:ml-0 md:text-right">{fmt(p.price * qty)}</div>
                      <button type="button" onClick={() => remove(id)} aria-label="Удалить"
                        className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-brand">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-3xl bg-white p-5 ring-1 ring-black/5 md:p-6">
              <h2 className="mb-4 font-semibold">Получение заказа</h2>
              <div className="grid gap-3 md:grid-cols-3">
                {delivery.map((o) => {
                  const free = !!o.free_from && total >= o.free_from;
                  return (
                    <label key={o.id} className={cn('relative cursor-pointer rounded-2xl p-4 ring-1 transition',
                      deliveryId === o.id ? 'bg-ink/[0.03] ring-2 ring-ink' : 'ring-black/10 hover:ring-black/30')}>
                      <input type="radio" name="delivery" value={o.id} checked={deliveryId === o.id} onChange={() => setDeliveryId(o.id)} className="sr-only" />
                      <div className="font-semibold">{o.title}</div>
                      {o.note && <div className="mt-1 text-xs text-muted-foreground">{o.note}</div>}
                      <div className="mt-3 text-sm font-bold">
                        {o.price && !free ? fmt(o.price) : <span className="text-success">Бесплатно</span>}
                        {free && o.price > 0 && <s className="ml-2 font-normal text-muted-foreground">{fmt(o.price)}</s>}
                      </div>
                    </label>
                  );
                })}
              </div>

              <h2 className="mt-8 mb-4 font-semibold">Контакты</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <Field error={err('name')}><input className={field} name="name" placeholder="Имя *" required autoComplete="name" aria-invalid={!!err('name')} /></Field>
                <Field error={err('phone')}><input className={field} name="phone" type="tel" placeholder="+7 (___) ___-__-__ *" required autoComplete="tel" aria-invalid={!!err('phone')} /></Field>
                <Field error={err('email')}><input className={field} name="email" type="email" placeholder="E-mail (необязательно)" autoComplete="email" aria-invalid={!!err('email')} /></Field>
                {opt?.requires_address && (
                  <Field error={err('address')}><input className={field} name="address" placeholder="Адрес объекта *" required autoComplete="street-address" aria-invalid={!!err('address')} /></Field>
                )}
                <Field error={err('comment')} className="md:col-span-2"><input className={field} name="comment" placeholder="Комментарий: этаж, подъезд, время" /></Field>
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-36 lg:self-start">
            <div className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
              <h2 className="mb-4 text-lg font-bold">Ваш заказ</h2>
              <dl className="space-y-3 text-sm">
                <Row label={`Товары (${cartCount(cart)})`} value={fmt(subtotal + saved)} />
                {saved > 0 && <Row label="Скидка" value={`−${fmt(saved)}`} green />}
                {bundle > 0 && <Row label="Скидка за комплект" value={`−${fmt(bundle)}`} green />}
                <Row label="Доставка" value={deliveryPrice ? fmt(deliveryPrice) : 'Бесплатно'} />
              </dl>
              <div className="mt-4 flex items-baseline justify-between border-t pt-4">
                <span className="font-semibold">Итого</span>
                <span className="text-3xl font-bold tracking-tight">{fmt(total + deliveryPrice)}</span>
              </div>
              <button disabled={busy || !deliveryId}
                className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brand text-lg font-semibold text-white transition hover:bg-brand-dark active:scale-[0.99] disabled:opacity-60">
                {busy && <LoaderCircle className="size-5 animate-spin" />} Оформить заказ
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">{c.checkout_note}</p>
            </div>
          </aside>
        </form>
      )}
    </div>
  );
}

function Field({ error, className, children }: { error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      {children}
      {error && <p className="mt-1 px-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn('font-medium', green && 'text-success')}>{value}</dd>
    </div>
  );
}
