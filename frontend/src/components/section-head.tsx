import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function SectionHead({ title, href, link = 'Смотреть все', children }: {
  title: string; href?: string; link?: string; children?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end gap-x-4 gap-y-2">
      <h2 className="text-2xl font-bold tracking-tight md:text-[28px]">{title}</h2>
      {children}
      {href && (
        <Link href={href} className="group ml-auto inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-brand">
          {link} <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
