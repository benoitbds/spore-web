import type { Metadata } from 'next';
import { getStats, getAllBriefs } from '@/lib/briefs';
import { SITE_URL } from '@/lib/seo';
import StatsClient from './StatsClient';

const _desc =
  'Métriques publiques de SPORE : collisions explorées, briefs publiés, novelty scores, coûts par brief. Transparence totale sur ce que produit le pipeline.';

export const metadata: Metadata = {
  title: 'Statistiques',
  description: _desc,
  alternates: { canonical: '/stats' },
  openGraph: {
    title: 'Statistiques | SPORE',
    description: _desc,
    url: `${SITE_URL}/stats`,
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Statistiques | SPORE',
    description: _desc,
  },
};

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

  return <StatsClient stats={stats} briefCount={briefs.length} />;
}
