'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { LoaderCircle, LockKeyhole } from 'lucide-react';
import { inputCls } from '@/components/admin/schema-form';
import { Logo } from '@/components/logo';

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get('next');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        const f = new FormData(e.currentTarget);
        const res = await fetch('/admin-api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: f.get('email'), password: f.get('password') }),
        });
        const body = await res.json().catch(() => ({}));
        setBusy(false);
        if (!res.ok) return setError(body.errors?.email?.[0] ?? body.message ?? 'Не удалось войти');
        router.replace(next?.startsWith('/admin') ? next : '/admin');
        router.refresh();
      }}
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium">E-mail</label>
        <input name="email" type="email" required autoComplete="username" className={inputCls} autoFocus />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Пароль</label>
        <input name="password" type="password" required autoComplete="current-password" className={inputCls} />
      </div>
      {error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      <button disabled={busy} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
        {busy ? <LoaderCircle className="size-5 animate-spin" /> : <LockKeyhole className="size-4" />} Войти
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-ink p-4">
      <div className="pointer-events-none fixed -top-40 -right-40 size-[600px] rounded-full bg-brand/30 blur-[140px]" />
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-lift">
        <Logo />
        <h1 className="mt-6 text-2xl font-bold">Вход в админку</h1>
        <p className="mt-1 text-sm text-muted-foreground">Управление товарами, заказами и текстами сайта</p>
        <Suspense><LoginForm /></Suspense>
      </div>
    </div>
  );
}
