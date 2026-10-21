'use client';

import { createContext, useContext } from 'react';
import type { Category, DeliveryOption, Settings } from './types';

type Site = { settings: Settings; categories: Category[]; delivery: DeliveryOption[]; apiUrl: string };

const SiteContext = createContext<Site | null>(null);

export function SiteProvider({ value, children }: { value: Site; children: React.ReactNode }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite outside SiteProvider');
  return ctx;
}

/** Запрос к публичному API из браузера. */
export async function clientApi<T>(apiUrl: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.message ?? `Ошибка ${res.status}`), { status: res.status, errors: body.errors ?? {} });
  return body as T;
}
