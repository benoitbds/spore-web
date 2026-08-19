import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { localeAlternates } from '@/lib/i18n-seo';
import PricingClient from './PricingClient';

// S1/F02: static metadata made /fr/pricing and /en/pricing both declare
// canonical /pricing, which is not a real page — only a middleware
// rescue redirect. generateMetadata sees the locale.
// S2/F03: and now uses it for the copy too, so /en/pricing stops serving
// a French title and description.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pricingPage' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: localeAlternates(locale, '/pricing'),
  };
}

export default function PricingPage() {
  return <PricingClient />;
}
