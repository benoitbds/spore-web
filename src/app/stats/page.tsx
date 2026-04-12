import type { Metadata } from 'next';
import { getStats, getAllBriefs } from '@/lib/briefs';
import StatsClient from './StatsClient';

export const metadata: Metadata = {
  title: 'Statistiques',
  description: 'Métriques publiques en temps (quasi-)réel de SPORE.',
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
