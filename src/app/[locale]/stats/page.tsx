import type { Metadata } from 'next';
import { getStats, getAllBriefs } from '@/lib/db';
import { SITE_URL } from '@/lib/seo';
import { localeAlternates } from '@/lib/i18n-seo';
import StatsClient from './StatsClient';

const _desc =
  'Métriques publiques de SPORE : collisions explorées, briefs publiés, scores de nouveauté, coûts par brief. Transparence totale sur ce que produit le pipeline.';

// Static metadata can't see the locale, so this page used to declare
// canonical /stats from both /fr/stats and /en/stats — an URL that only
// exists as a middleware rescue redirect. generateMetadata gets params,
// hence the active locale (S1/F02). The copy stays FR-only for now:
// translating it is content i18n, out of this sprint's scope.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Statistiques',
    description: _desc,
    alternates: localeAlternates(locale, '/stats'),
    openGraph: {
      title: 'Statistiques | SPORE',
      description: _desc,
      url: `${SITE_URL}/${locale}/stats`,
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Statistiques | SPORE',
      description: _desc,
    },
  };
}

function build30DayRange(): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export default function StatsPage() {
  const stats = getStats();
  const briefs = getAllBriefs();

  if (!stats) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-mist-100">Statistiques</h1>
        <p className="mt-6 text-mist-400">
          Aucune statistique disponible pour le moment.
        </p>
      </div>
    );
  }

  return (
    <StatsClient
      stats={stats}
      briefCount={briefs.length}
      last30={build30DayRange()}
    />
  );
}
