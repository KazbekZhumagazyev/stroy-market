import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-x pt-16 text-center">
      <div className="text-8xl font-bold tracking-tighter text-brand">404</div>
      <h1 className="mt-4 text-2xl font-bold">Страница не найдена</h1>
      <p className="mt-2 text-muted-foreground">Возможно, товар закончился или ссылка устарела.</p>
      <Link href="/catalog" className="mt-6 inline-block h-12 rounded-full bg-ink px-8 leading-[3rem] font-semibold text-white hover:bg-brand">В каталог</Link>
    </div>
  );
}
