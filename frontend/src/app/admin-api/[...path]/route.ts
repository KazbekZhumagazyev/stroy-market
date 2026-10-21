import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, API_URL } from '@/lib/admin/server';

type Ctx = { params: Promise<{ path: string[] }> };

/** Прокси админки: /admin-api/* → Laravel /api/admin/* с токеном из cookie. */
async function proxy(request: Request, { params }: Ctx) {
  const { path } = await params;
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: 'Требуется вход' }, { status: 401 });

  const url = new URL(request.url);
  const target = `${API_URL}/admin/${path.map(encodeURIComponent).join('/')}${url.search}`;
  const headers: Record<string, string> = { Accept: 'application/json', Authorization: `Bearer ${token}` };
  const type = request.headers.get('content-type');
  if (type) headers['Content-Type'] = type;

  const res = await fetch(target, {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
    cache: 'no-store',
  });

  const out = new NextResponse(res.body, {
    status: res.status,
    headers: Object.fromEntries(['content-type', 'content-disposition'].flatMap((h) => (res.headers.get(h) ? [[h, res.headers.get(h)!]] : []))),
  });
  if (res.status === 401 || (path[0] === 'logout' && res.ok)) out.cookies.delete(ADMIN_COOKIE);
  return out;
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
