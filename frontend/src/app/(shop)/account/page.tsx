import type { Metadata } from 'next';
import Link from 'next/link';
import { UserRound } from 'lucide-react';

export const metadata: Metadata = { title: 'Личный кабинет', robots: { index: false } };

export default function AccountPage() {
  return (
    <div className="container-x pt-10">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl bg-white p-10 text-center ring-1 ring-black/5">
        <div className="grid size-16 place-items-center rounded-full bg-secondary"><UserRound className="size-7" /></div>
        <h1 className="mt-4 text-2xl font-bold">Личный кабинет</h1>
        <p className="mt-2 text-muted-foreground">Скоро здесь появятся история заказов, адреса доставки и персональные цены.</p>
        <Link href="/catalog" className="mt-6 h-12 rounded-full bg-ink px-8 leading-[3rem] font-semibold text-white hover:bg-brand">В каталог</Link>
      </div>
    </div>
  );
}
