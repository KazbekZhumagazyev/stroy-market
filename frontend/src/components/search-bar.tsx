'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SearchBar(props: { className?: string; placeholder: string }) {
  return (
    <Suspense fallback={<div className={props.className}><div className="h-11 w-full rounded-full bg-secondary" /></div>}>
      <SearchForm {...props} />
    </Suspense>
  );
}

function SearchForm({ className, placeholder }: { className?: string; placeholder: string }) {
  const router = useRouter();
  const params = useSearchParams();
  return (
    <form
      role="search"
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get('q')?.toString().trim();
        router.push(q ? `/catalog?q=${encodeURIComponent(q)}` : '/catalog');
      }}
    >
      <label className={cn('flex h-11 w-full items-center gap-2 rounded-full bg-secondary px-4 ring-brand/30 transition focus-within:bg-white focus-within:ring-2')}>
        <Search className="size-[18px] shrink-0 text-muted-foreground" />
        <input
          key={params.get('q') ?? ''}
          name="q"
          type="search"
          defaultValue={params.get('q') ?? ''}
          placeholder={placeholder}
          autoComplete="off"
          data-search-input
          className="h-full w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button type="submit" className="hidden h-8 shrink-0 rounded-full bg-ink px-4 text-xs font-semibold text-white hover:bg-brand sm:block">
          Найти
        </button>
      </label>
    </form>
  );
}
