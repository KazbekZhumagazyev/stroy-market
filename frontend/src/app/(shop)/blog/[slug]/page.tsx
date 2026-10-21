import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { RichText } from '@/components/rich-text';
import { api } from '@/lib/api';
import { catHref, formatDate } from '@/lib/format';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const a = await api.article((await params).slug);
  return {
    title: a.seo_title || a.title,
    description: a.seo_description || a.excerpt || undefined,
    openGraph: { type: 'article', images: a.cover ? [a.cover] : undefined },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const a = await api.article((await params).slug);
  return (
    <article className="container-x pt-6">
      <nav className="mb-3 flex items-center gap-1.5 overflow-hidden text-sm whitespace-nowrap text-muted-foreground" aria-label="Хлебные крошки">
        <Link href="/" className="hover:text-ink">Главная</Link><ChevronRight className="size-3.5 shrink-0" />
        <Link href="/blog" className="hover:text-ink">Статьи</Link><ChevronRight className="size-3.5 shrink-0" />
        <span className="truncate text-ink">{a.title}</span>
      </nav>
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {a.tag && <span className="rounded-full bg-brand-soft px-3 py-1 font-semibold text-brand">{a.tag}</span>}
          {a.published_at && <span className="inline-flex items-center gap-1.5 text-muted-foreground"><CalendarDays className="size-4" /> {formatDate(a.published_at)}</span>}
        </div>
        <h1 className="mt-4 text-3xl leading-tight font-bold tracking-tight md:text-5xl">{a.title}</h1>
        {a.excerpt && <p className="mt-4 text-lg text-muted-foreground">{a.excerpt}</p>}
        {a.cover && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl">
            <Image src={a.cover} alt={a.title} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
          </div>
        )}
        <div className="mt-8 rounded-3xl bg-white p-6 ring-1 ring-black/5 md:p-10">
          <RichText text={a.body} className="text-[16px] text-ink/85" />
        </div>
        {a.category && (
          <Link href={catHref(a.category.slug)} className="mt-6 flex items-center justify-between rounded-3xl bg-ink p-6 text-white hover:bg-black">
            <span><span className="text-sm text-white/60">Товары по теме</span><br /><b className="text-lg">{a.category.name}</b></span>
            <ChevronRight className="size-6" />
          </Link>
        )}
      </div>
    </article>
  );
}
