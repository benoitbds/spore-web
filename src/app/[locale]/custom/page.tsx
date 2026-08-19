import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { localeAlternates } from '@/lib/i18n-seo';
import CustomClient from './CustomClient';

// S1/F02 + S2/F03 — see pricing/page.tsx. The customPage namespace
// already carried both translations; nothing was reading them.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'customPage' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: localeAlternates(locale, '/custom'),
  };
}

export default function CustomPage() {
  return <CustomClient />;
}
