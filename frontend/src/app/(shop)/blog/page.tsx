import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ArticleCard } from '@/components/article-card';
import { EmptyState } from '@/components/catalog/catalog-view';
import { api } from '@/lib/api';

export const metadata: Metadata = { title: 'Полезные статьи' };

type Search = Promise<{ page?: string }>;

export default async function BlogPage({ searchParams }: { searchParams: Search }) {
  const page = Number((await searchParams).page) || 1;
  const { data, meta } = await api.articles(page);
  return (
    <div className="container-x pt-6">
      <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Хлебные крошки">
        <Link href="/" className="hover:text-ink">Главная</Link><ChevronRight className="size-3.5" /><span className="text-ink">Статьи</span>
      </nav>
      <h1 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">Полезные статьи</h1>
      {data.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{data.map((a) => <ArticleCard key={a.id} a={a} />)}</div>
      ) : (
        <EmptyState title="Статей пока нет" text="Скоро здесь появятся советы по выбору материалов" />
      )}
      {meta.last_page > 1 && (
        <nav className="mt-8 flex justify-center gap-1.5">
          {Array.from({ length: meta.last_page }, (_, i) => (
            <Link key={i} href={i ? `/blog?page=${i + 1}` : '/blog'}
              className={`grid size-10 place-items-center rounded-full text-sm font-semibold ${i + 1 === meta.current_page ? 'bg-ink text-white' : 'bg-white ring-1 ring-black/10'}`}>
              {i + 1}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
