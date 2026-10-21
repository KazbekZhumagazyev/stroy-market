'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({ title, description, back, actions }: { title: string; description?: string; back?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-3">
      <div className="min-w-0 flex-1">
        {back && (
          <Link href={back} className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ink">
            <ChevronLeft className="size-4" /> Назад
          </Link>
        )}
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, actions, className, children }: { title?: string; actions?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section className={cn('rounded-3xl bg-white p-5 ring-1 ring-black/5 md:p-6', className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-center gap-3">
          {title && <h2 className="font-semibold">{title}</h2>}
          {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export const btn = {
  primary: 'inline-flex h-10 items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60',
  dark: 'inline-flex h-10 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-60',
  light: 'inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium ring-1 ring-black/10 transition hover:ring-ink disabled:opacity-60',
  ghost: 'inline-flex h-9 items-center justify-center gap-2 rounded-full px-3 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-ink',
};

export function SearchInput({ value, onChange, placeholder = 'Поиск…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [local, setLocal] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => local !== value && onChange(local), 300);
    return () => clearTimeout(t);
  }, [local, value, onChange]);
  return (
    <label className="flex h-10 w-full items-center gap-2 rounded-full bg-white px-4 ring-1 ring-black/10 focus-within:ring-ink sm:w-72">
      <Search className="size-4 text-muted-foreground" />
      <input value={local} onChange={(e) => setLocal(e.target.value)} placeholder={placeholder} className="h-full w-full bg-transparent text-sm outline-none" />
    </label>
  );
}

export function Pager({ page, last, onPage }: { page: number; last: number; onPage: (p: number) => void }) {
  if (last <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-sm">
      <span className="text-muted-foreground">Страница {page} из {last}</span>
      <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className="grid size-9 place-items-center rounded-full ring-1 ring-black/10 disabled:opacity-30"><ChevronLeft className="size-4" /></button>
      <button type="button" disabled={page >= last} onClick={() => onPage(page + 1)} className="grid size-9 place-items-center rounded-full ring-1 ring-black/10 disabled:opacity-30"><ChevronRight className="size-4" /></button>
    </div>
  );
}

export function Pill({ tone = 'gray', children }: { tone?: 'gray' | 'green' | 'red' | 'yellow' | 'blue' | 'dark'; children: React.ReactNode }) {
  const tones = {
    gray: 'bg-secondary text-ink/70',
    green: 'bg-success/10 text-success',
    red: 'bg-brand-soft text-brand',
    yellow: 'bg-sun/20 text-[#8a6500]',
    blue: 'bg-sky-100 text-sky-700',
    dark: 'bg-ink text-white',
  };
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap', tones[tone])}>{children}</span>;
}

export const STATUS_TONE: Record<string, 'gray' | 'green' | 'red' | 'yellow' | 'blue' | 'dark'> = {
  new: 'red', confirmed: 'blue', delivering: 'yellow', completed: 'green', cancelled: 'gray',
};

/** Таблица: на телефоне превращается в карточки (каждая строка — блок). */
export function Table({ head, children, empty }: { head: React.ReactNode[]; children: React.ReactNode; empty?: React.ReactNode }) {
  return (
    <div className="-mx-5 overflow-x-auto md:-mx-6">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b text-left text-xs tracking-wide text-muted-foreground uppercase">
            {head.map((h, i) => <th key={i} className="px-5 py-3 font-medium first:pl-5 md:first:pl-6 last:pr-5 md:last:pr-6">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
      {empty}
    </div>
  );
}

export const td = 'px-5 py-3 align-middle first:pl-5 md:first:pl-6 last:pr-5 md:last:pr-6';

export function Empty({ text }: { text: string }) {
  return <div className="py-14 text-center text-sm text-muted-foreground">{text}</div>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-secondary', className)} />;
}
