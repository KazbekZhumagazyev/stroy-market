import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { formatDate } from '@/lib/format';
import type { Article } from '@/lib/types';
import { Icon } from './icon';
import { Tile } from './tile';

export function ArticleCard({ a }: { a: Article }) {
  const c = a.category ?? { bg: '#f2f1ee', color: '#121212', icon: 'sparkles' };
  return (
    <Link href={`/blog/${a.slug}`} className="group overflow-hidden rounded-3xl bg-white ring-1 ring-black/5 transition hover:shadow-lift">
      <Tile c={c} className="aspect-[16/10]">
        {a.cover ? (
          <Image src={a.cover} alt={a.title} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <Icon name={c.icon} className="size-16 transition duration-500 group-hover:scale-110" />
        )}
      </Tile>
      <div className="p-5">
        {a.tag && <span className="text-xs font-semibold text-brand">{a.tag}</span>}
        <h3 className="mt-1.5 leading-snug font-semibold group-hover:text-brand">{a.title}</h3>
        {a.published_at && <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="size-3.5" /> {formatDate(a.published_at)}</div>}
      </div>
    </Link>
  );
}
