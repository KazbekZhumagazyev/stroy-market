import type { Metadata } from 'next';
import { InfoPage } from '@/components/info-page';
import { api } from '@/lib/api';

type Params = Promise<{ page: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const page = await api.page((await params).page);
  return { title: page.seo_title || page.title, description: page.seo_description || page.lead || undefined };
}

/** Страницы из админки: /delivery, /b2b и любые новые. */
export default async function Page({ params }: { params: Params }) {
  return <InfoPage page={await api.page((await params).page)} />;
}
