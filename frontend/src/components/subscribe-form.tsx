'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { clientApi, useSite } from '@/lib/site';

export function SubscribeForm() {
  const { settings, apiUrl } = useSite();
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="relative flex w-full gap-2 md:max-w-md"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        setBusy(true);
        try {
          await clientApi(apiUrl, '/subscribe', { method: 'POST', body: JSON.stringify({ email: new FormData(form).get('email') }) });
          form.reset();
          toast.success(settings.footer.subscribe_success);
        } catch (err) {
          toast.error((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <input name="email" type="email" required placeholder="Ваш e-mail" aria-label="E-mail"
        className="h-12 min-w-0 flex-1 rounded-full bg-white px-5 text-sm text-ink outline-none placeholder:text-muted-foreground" />
      <button disabled={busy} className="h-12 shrink-0 rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-60">
        {settings.footer.subscribe_button}
      </button>
    </form>
  );
}
