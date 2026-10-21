'use client';

import { use } from 'react';
import { EMPTY_PRODUCT, type ProductData, ProductForm } from '@/components/admin/product-form';
import { Skeleton } from '@/components/admin/ui';
import { useAdmin } from '@/lib/admin/client';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data } = useAdmin<{ data: Omit<ProductData, 'images'> & { images: { path: string }[] } }>(`products/${id}`, { keepPreviousData: false });
  if (!data) return <div className="space-y-4"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-96" /></div>;
  const p = data.data;
  return <ProductForm key={id} initial={{ ...EMPTY_PRODUCT, ...p, calc: p.calc ?? EMPTY_PRODUCT.calc, images: p.images.map((i) => i.path) }} />;
}
