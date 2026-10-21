import type { Metadata } from 'next';
import { BottomNav } from '@/components/bottom-nav';
import { CartDrawer } from '@/components/cart-drawer';
import { Floating } from '@/components/floating';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { api } from '@/lib/api';
import { SiteProvider } from '@/lib/site';

export async function generateMetadata(): Promise<Metadata> {
  const s = await api.settings();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3010'),
    title: { default: s.seo.title, template: `%s — ${s.general.brand}` },
    description: s.seo.description,
    icons: { icon: '/logo-mark.svg' },
    openGraph: { siteName: s.general.brand, locale: 'ru_KZ', type: 'website' },
  };
}

export default async function ShopLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [settings, categories, delivery] = await Promise.all([api.settings(), api.categories(), api.deliveryOptions()]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8010/api';
  return (
    <SiteProvider value={{ settings, categories, delivery, apiUrl }}>
      <SiteHeader settings={settings} categories={categories} />
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter settings={settings} categories={categories} />
      <BottomNav />
      <CartDrawer />
      <Floating />
    </SiteProvider>
  );
}
