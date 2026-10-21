'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QtyStepper({
  value, onChange, min = 1, size = 'md', className,
}: { value: number; onChange: (v: number) => void; min?: number; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const h = { sm: 'h-9', md: 'h-10', lg: 'h-12' }[size];
  return (
    <div className={cn('inline-flex items-center rounded-full bg-secondary p-1', h, className)}>
      <button type="button" aria-label="Меньше" onClick={() => onChange(Math.max(min, value - 1))}
        className="grid aspect-square h-full place-items-center rounded-full transition hover:bg-white">
        <Minus className="size-4" />
      </button>
      <input
        type="number" inputMode="numeric" min={min} value={value} aria-label="Количество"
        onChange={(e) => onChange(Math.max(min, parseInt(e.target.value, 10) || min))}
        className="w-10 bg-transparent text-center text-sm font-semibold outline-none"
      />
      <button type="button" aria-label="Больше" onClick={() => onChange(value + 1)}
        className="grid aspect-square h-full place-items-center rounded-full transition hover:bg-white">
        <Plus className="size-4" />
      </button>
    </div>
  );
}
