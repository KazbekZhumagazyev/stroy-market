import 'server-only';

export const ADMIN_COOKIE = 'ygm_admin';
export const API_URL = process.env.API_URL ?? 'http://localhost:8010/api';

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
};
