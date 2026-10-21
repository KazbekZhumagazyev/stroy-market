import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { CMS_TAG } from '@/lib/api';

/** Вебхук из Laravel: после изменений в админке сбрасываем кеш данных витрины. */
export async function POST(request: Request) {
  const { secret } = await request.json().catch(() => ({ secret: null }));
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  revalidateTag(CMS_TAG, { expire: 0 });
  return NextResponse.json({ ok: true });
}
