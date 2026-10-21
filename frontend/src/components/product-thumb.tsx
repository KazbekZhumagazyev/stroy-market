import Image from 'next/image';
import type { ProductCard } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Icon } from './icon';
import { Tile } from './tile';

/** Фото товара или иконка категории на фирменной плитке, если фото нет. */
export function ProductThumb({
  p, src, className, iconClass = 'size-1/3', sizes = '(max-width: 768px) 50vw, 25vw', priority,
}: { p: Pick<ProductCard, 'name' | 'image' | 'category'>; src?: string | null; className?: string; iconClass?: string; sizes?: string; priority?: boolean }) {
  const image = src === undefined ? p.image : src;
  return (
    <Tile c={p.category} className={className}>
      {image ? (
        <Image src={image} alt={p.name} fill sizes={sizes} priority={priority} className="object-contain p-[6%] mix-blend-multiply" />
      ) : (
        <Icon name={p.category.icon} className={cn('drop-shadow-sm', iconClass)} />
      )}
    </Tile>
  );
}
