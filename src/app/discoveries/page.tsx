import type { Metadata } from 'next';
import { briefRowToBrief, getAllBriefs } from '@/lib/db';
import type { Brief } from '@/lib/types';
import { SITE_URL } from '@/lib/seo';
import CustomCollisionCta from '@/components/CustomCollisionCta';
import DiscoveriesClient from './DiscoveriesClient';

// Executed once at module load (server-side) to pre-compute the page
// description. With the Phase-1 DB singleton this reads SQLite at boot
// rather than the disk JSON snapshot, so the count stays in sync with
// new briefs on the next process restart (no static rebuild required
// thanks to the sitemap's ISR revalidate window).
const _briefs: Brief[] = getAllBriefs().map(briefRowToBrief);
const _domainCount = new Set(_briefs.flatMap((b) => b.domains)).size;
const _description =
  _briefs.length > 0
    ? `Explorez les hypothèses de recherche générées par SPORE : ${_briefs.length} brief${_briefs.length > 1 ? 's' : ''} publié${_briefs.length > 1 ? 's' : ''}, couvrant ${_domainCount} domaines scientifiques, validés par 5 relecteurs IA.`
    : 'Hypothèses scientifiques interdisciplinaires générées et validées par SPORE.';

export const metadata: Metadata = {
  title: 'Découvertes scientifiques',
  description: _description,
  alternates: { canonical: '/discoveries' },
  openGraph: {
    title: 'Découvertes scientifiques | SPORE',
    description: _description,
    url: `${SITE_URL}/discoveries`,
    type: 'website',
    locale: 'fr_FR',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'SPORE — Découvertes scientifiques',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Découvertes scientifiques | SPORE',
    description: _description,
    images: ['/og-default.png'],
  },
};

export default function DiscoveriesPage() {
  const briefs: Brief[] = getAllBriefs().map(briefRowToBrief);

  // Extract all unique domains
  const allDomains = Array.from(
    new Set(briefs.flatMap((b) => b.domains)),
  ).sort();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <header className="mb-12 md:mb-16">
        <h1 className="mb-3 font-display text-4xl text-mist-100 md:text-6xl">
          Découvertes
        </h1>
        <p className="max-w-2xl text-lg text-mist-400">
          Hypothèses scientifiques générées par SPORE, validées par{' '}
          <span className="text-emerald-glow">5 relecteurs IA</span>, sourcées sur
          Semantic Scholar.
        </p>
      </header>

      <DiscoveriesClient briefs={briefs} allDomains={allDomains} />

      <div className="mt-20">
        <CustomCollisionCta
          headline="Vous avez un domaine précis en tête ?"
          subtext="Demandez une collision sur mesure — gratuite pendant le lancement. Choisissez un ou deux domaines, SPORE livre un brief complet (hypothèse, protocole, panel de 5 relecteurs) en quelques minutes."
        />
      </div>
    </div>
  );
}
