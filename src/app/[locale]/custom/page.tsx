import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/i18n-seo';
import CustomClient from './CustomClient';

// S1/F02 — see pricing/page.tsx for the rationale.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Collision sur mesure',
    description:
      "Choisissez deux domaines scientifiques, SPORE génère une hypothèse inédite à leur intersection. Offre de lancement : votre première collision est gratuite.",
    alternates: localeAlternates(locale, '/custom'),
  };
}

export default function CustomPage() {
  return <CustomClient />;
}
