import type { Metadata } from 'next';

export const metadata: Metadata = { title: { default: 'Админка', template: '%s — Админка YGM IZOFLEX' }, robots: { index: false, follow: false } };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
