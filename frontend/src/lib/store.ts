'use client';

import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductCard } from './types';

/** Снимок товара в корзине: хватает для мини-корзины, итоговые цены пересчитывает сервер. */
export type CartProduct = Pick<ProductCard, 'id' | 'slug' | 'name' | 'brand' | 'price' | 'old_price' | 'unit' | 'image' | 'category'>;
export type CartItem = { id: number; qty: number; product: CartProduct };

const snapshot = (p: CartProduct): CartProduct => ({
  id: p.id, slug: p.slug, name: p.name, brand: p.brand, price: p.price, old_price: p.old_price, unit: p.unit, image: p.image, category: p.category,
});

type ShopState = {
  cart: CartItem[];
  wish: number[];
  /** Комплекты «Купите вместе»: [основной товар, ...сопутствующие]. */
  bundles: number[][];
  cartOpen: boolean;
  add: (p: CartProduct, qty?: number) => void;
  addBundle: (items: CartProduct[]) => void;
  setQty: (id: number, qty: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  /** Обновить снимки актуальными данными с сервера; пропавшие товары удаляются. */
  refresh: (fresh: CartProduct[]) => void;
  toggleWish: (id: number) => boolean;
  setCartOpen: (open: boolean) => void;
};

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      wish: [],
      bundles: [],
      cartOpen: false,
      add: (p, qty = 1) =>
        set(({ cart }) => ({
          cart: cart.some((i) => i.id === p.id)
            ? cart.map((i) => (i.id === p.id ? { ...i, qty: i.qty + qty, product: snapshot(p) } : i))
            : [...cart, { id: p.id, qty, product: snapshot(p) }],
        })),
      addBundle: (items) => {
        items.forEach((p) => get().add(p, 1));
        if (items.length > 1) set(({ bundles }) => ({ bundles: [...bundles, items.map((p) => p.id)] }));
      },
      setQty: (id, qty) =>
        set(({ cart }) => ({
          cart: qty < 1 ? cart.filter((i) => i.id !== id) : cart.map((i) => (i.id === id ? { ...i, qty } : i)),
        })),
      remove: (id) => set(({ cart }) => ({ cart: cart.filter((i) => i.id !== id) })),
      clear: () => set({ cart: [], bundles: [] }),
      refresh: (fresh) =>
        set(({ cart, bundles }) => {
          const byId = new Map(fresh.map((p) => [p.id, p]));
          const next = cart.filter((i) => byId.has(i.id)).map((i) => ({ ...i, product: snapshot(byId.get(i.id)!) }));
          return { cart: next, bundles: bundles.filter((ids) => ids.every((id) => byId.has(id))) };
        }),
      toggleWish: (id) => {
        const on = !get().wish.includes(id);
        set(({ wish }) => ({ wish: on ? [...wish, id] : wish.filter((x) => x !== id) }));
        return on;
      },
      setCartOpen: (cartOpen) => set({ cartOpen }),
    }),
    {
      name: 'ygm-shop-v2',
      partialize: ({ cart, wish, bundles }) => ({ cart, wish, bundles }),
    },
  ),
);

export const cartCount = (cart: CartItem[]) => cart.reduce((s, i) => s + i.qty, 0);

/** Предварительный расчёт в браузере — та же логика, что в Laravel OrderService. */
export function cartTotals(cart: CartItem[], bundles: number[][], bundlePercent: number) {
  let subtotal = 0;
  let saved = 0;
  const price = new Map<number, number>();
  for (const { id, qty, product: p } of cart) {
    price.set(id, p.price);
    subtotal += p.price * qty;
    if (p.old_price && p.old_price > p.price) saved += (p.old_price - p.price) * qty;
  }
  const left = Object.fromEntries(cart.map((i) => [i.id, i.qty]));
  let bundle = 0;
  for (const ids of bundles) {
    if (ids.length < 2 || !ids.every((id) => left[id] > 0)) continue;
    ids.forEach((id) => {
      left[id] -= 1;
      bundle += (price.get(id) ?? 0) * (bundlePercent / 100);
    });
  }
  bundle = Math.round(bundle);
  return { subtotal, saved, bundle, total: subtotal - bundle };
}

const noopSubscribe = () => () => {};
/** true после загрузки данных из localStorage — чтобы не было рассинхрона с серверным HTML. */
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
