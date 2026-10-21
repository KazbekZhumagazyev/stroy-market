'use client';

import { useState } from 'react';
import { ProductBadge } from '@/components/product-badge';
import { ProductThumb } from '@/components/product-thumb';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

export function Gallery({ p }: { p: Product }) {
  const [i, setI] = useState(0);
  const images = p.images.length ? p.images : [null];
  return (
    <div>
      <div className="relative">
        <ProductThumb p={p} src={images[i]} priority className="aspect-square rounded-3xl md:aspect-[5/4]" iconClass="size-2/5" sizes="(max-width: 1024px) 100vw, 50vw" />
        <ProductBadge p={p} className="absolute top-5 left-5 px-3 py-1.5 text-sm" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((src, k) => (
            <button key={k} type="button" onClick={() => setI(k)} aria-label={`Фото ${k + 1}`}
              className={cn('overflow-hidden rounded-2xl ring-2 transition', k === i ? 'ring-ink' : 'ring-transparent opacity-70 hover:opacity-100')}>
              <ProductThumb p={p} src={src} className="aspect-square" sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
