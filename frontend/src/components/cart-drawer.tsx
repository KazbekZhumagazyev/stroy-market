'use client';

import Link from 'next/link';
import { ShoppingCart, Trash2, Truck } from 'lucide-react';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { fmt, productHref } from '@/lib/format';
import { useSite } from '@/lib/site';
import { cartCount, cartTotals, useShop } from '@/lib/store';
import { ProductThumb } from './product-thumb';
import { QtyStepper } from './qty-stepper';

export function CartDrawer() {
  const { settings, delivery } = useSite();
  const { cart, bundles, cartOpen, setCartOpen, setQty, remove } = useShop();
  const { total } = cartTotals(cart, bundles, settings.cart.bundle_discount_percent);
  const freeFrom = Math.max(0, ...delivery.map((d) => d.free_from ?? 0));
  const left = freeFrom - total;
  const close = () => setCartOpen(false);

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b p-5">
          <SheetTitle className="text-lg font-bold">Корзина {cart.length > 0 && <span className="text-muted-foreground">· {cartCount(cart)}</span>}</SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="grid size-20 place-items-center rounded-full bg-secondary"><ShoppingCart className="size-8 text-muted-foreground" /></div>
            <p className="font-semibold">Корзина пуста</p>
            <p className="text-sm text-muted-foreground">{settings.cart.empty_text}</p>
            <Link href="/catalog" onClick={close} className="mt-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand">
              В каталог
            </Link>
          </div>
        ) : (
          <>
            {freeFrom > 0 && (
              <div className="border-b px-5 py-3">
                <div className="mb-2 flex items-center gap-2 text-xs">
                  <Truck className="size-4 text-success" />
                  {left > 0 ? <span>До бесплатной доставки ещё <b>{fmt(left)}</b></span> : <b className="text-success">Доставка по городу бесплатно</b>}
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-success transition-all" style={{ width: `${Math.min(100, (total / freeFrom) * 100)}%` }} />
                </div>
              </div>
            )}
            <ul className="flex-1 divide-y overflow-y-auto px-5">
              {cart.map(({ id, qty, product: p }) => (
                <li key={id} className="flex gap-3 py-4">
                  <Link href={productHref(p)} onClick={close} className="shrink-0"><ProductThumb p={p} className="size-20 rounded-xl" iconClass="size-8" sizes="80px" /></Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Link href={productHref(p)} onClick={close} className="line-clamp-2 text-sm font-medium hover:text-brand">{p.name}</Link>
                    <div className="flex items-center gap-2">
                      <QtyStepper size="sm" value={qty} onChange={(v) => setQty(id, v)} />
                      <button type="button" onClick={() => remove(id)} aria-label="Удалить" className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-brand">
                        <Trash2 className="size-4" />
                      </button>
                      <span className="ml-auto text-sm font-bold">{fmt(p.price * qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <SheetFooter className="border-t bg-surface p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">Итого</span>
                <span className="text-2xl font-bold">{fmt(total)}</span>
              </div>
              <Link href="/cart" onClick={close} className="grid h-12 place-items-center rounded-full bg-brand font-semibold text-white transition hover:bg-brand-dark">
                Оформить заказ
              </Link>
              <button type="button" onClick={close} className="h-10 text-sm font-medium text-muted-foreground hover:text-ink">
                Продолжить покупки
              </button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
