import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, API_URL, cookieOptions } from '@/lib/admin/server';

/** Вход: Laravel выдаёт токен, браузер получает его только в httpOnly-cookie. */
export async function POST(request: Request) {
  const res = await fetch(`${API_URL}/admin/login`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Forwarded-For': request.headers.get('x-forwarded-for') ?? '' },
    body: await request.text(),
  });
  const body = await res.json().catch(() => ({ message: 'Сервер недоступен' }));
  if (!res.ok) return NextResponse.json(body, { status: res.status });

  const response = NextResponse.json({ user: body.user });
  response.cookies.set(ADMIN_COOKIE, body.token, cookieOptions);
  return response;
}
