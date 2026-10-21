'use client';

import useSWR, { type SWRConfiguration } from 'swr';

export class ApiError extends Error {
  constructor(message: string, public status: number, public errors: Record<string, string[]> = {}) {
    super(message);
  }
}

/** Запрос к API админки через прокси Next.js (токен в httpOnly-cookie). */
export async function adminFetch<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  const res = await fetch(`/admin-api/${path.replace(/^\//, '')}`, {
    ...rest,
    headers: { Accept: 'application/json', ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...rest.headers },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (res.status === 401 && typeof window !== 'undefined') {
    // Полная перезагрузка: сессия истекла, клиентское состояние админки больше не нужно
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`${location.origin}/admin/login?next=${encodeURIComponent(location.pathname)}`);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.message ?? `Ошибка ${res.status}`, res.status, body.errors ?? {});
  return body as T;
}

export function useAdmin<T>(path: string | null, config?: SWRConfiguration<T>) {
  return useSWR<T>(path, (p: string) => adminFetch<T>(p), { revalidateOnFocus: false, keepPreviousData: true, ...config });
}

export async function uploadFile(file: File, folder: string) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('folder', folder);
  return adminFetch<{ path: string; url: string }>('upload', { method: 'POST', body: fd });
}

export type ListResponse<T> = { data: T[]; meta: { total: number; page: number; last_page: number } };

export type Meta = {
  categories: { id: number; name: string }[];
  brands: { id: number; name: string }[];
  products: { id: number; name: string; price: number }[];
  order_statuses: Record<string, string>;
  badges: Record<string, string>;
  new_orders: number;
};

export const useMeta = () => useAdmin<Meta>('meta', { revalidateOnMount: true });

export const storageUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (/^https?:/.test(path)) return path;
  const api = new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8010/api');
  return `${api.origin}/storage/${path}`;
};
