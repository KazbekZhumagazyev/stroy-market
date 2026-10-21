import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Page } from '@/lib/types';
import { RichText } from './rich-text';

export function InfoPage({ page }: { page: Page }) {
  return (
    <div className="container-x pt-6">
      <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Хлебные крошки">
        <Link href="/" className="hover:text-ink">Главная</Link><ChevronRight className="size-3.5" /><span className="text-ink">{page.title}</span>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{page.title}</h1>
      {page.lead && <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{page.lead}</p>}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {page.sections.map((s, i) => (
          <section key={i} id={s.anchor ?? undefined} className="scroll-mt-32 rounded-3xl bg-white p-6 ring-1 ring-black/5 md:p-8">
            <h2 className="text-xl font-bold">{s.title}</h2>
            <RichText text={s.body} className="mt-3 text-ink/80" />
          </section>
        ))}
      </div>
    </div>
  );
}
