import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/i18n-seo';
import PricingClient from './PricingClient';

// S1/F02: static metadata made /fr/pricing and /en/pricing both declare
// canonical /pricing, which is not a real page — only a middleware
// rescue redirect. generateMetadata sees the locale.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Tarifs',
    description:
      "Offre de lancement SPORE : tous les briefs de recherche sont gratuits. Hypothèse, protocole, panel de review, DOIs vérifiés sur Semantic Scholar. Inscrivez-vous pour accéder au service.",
    alternates: localeAlternates(locale, '/pricing'),
  };
}

export default function PricingPage() {
  return <PricingClient />;
}
