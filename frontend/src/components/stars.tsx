import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('inline-flex gap-0.5 text-sun', className)} aria-label={`Рейтинг ${value} из 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className="size-3.5" fill={value >= i + 0.5 ? 'currentColor' : 'none'} strokeWidth={1.8} />
      ))}
    </span>
  );
}
