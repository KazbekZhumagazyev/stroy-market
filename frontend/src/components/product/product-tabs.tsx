'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export function ProductTabs({ tabs }: { tabs: { id: string; label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0].id);
  return (
    <section id="tabs" className="mt-6 scroll-mt-28 rounded-3xl bg-white p-5 ring-1 ring-black/5 md:p-8">
      <div role="tablist" className="-mx-1 flex gap-1 overflow-x-auto px-1 no-scrollbar">
        {tabs.map((t) => (
          <button key={t.id} role="tab" type="button" aria-selected={active === t.id} onClick={() => setActive(t.id)}
            className={cn('h-10 shrink-0 rounded-full px-4 text-sm font-medium transition', active === t.id ? 'bg-ink text-white' : 'text-ink/60 hover:bg-secondary')}>
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" hidden={active !== t.id} className="mt-6">{t.content}</div>
      ))}
    </section>
  );
}
