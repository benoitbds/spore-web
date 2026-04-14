import type { Metadata } from 'next';
import { getAllBriefs } from '@/lib/briefs';
import { SITE_URL } from '@/lib/seo';
import DiscoveriesClient from './DiscoveriesClient';

const _briefs = getAllBriefs();
const _domainCount = new Set(_briefs.flatMap((b) => b.domains)).size;
const _description =
  _briefs.length > 0
    ? `Explorez les hypothèses de recherche générées par SPORE : ${_briefs.length} brief${_briefs.length > 1 ? 's' : ''} publié${_briefs.length > 1 ? 's' : ''}, couvrant ${_domainCount} domaines scientifiques, validés par 5 reviewers IA.`
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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Découvertes scientifiques | SPORE',
    description: _description,
  },
};

export default function DiscoveriesPage() {
  const briefs = getAllBriefs();

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
          <span className="text-emerald-glow">5 reviewers IA</span>, sourcées sur
          Semantic Scholar.
        </p>
      </header>

      <DiscoveriesClient briefs={briefs} allDomains={allDomains} />
    </div>
  );
}
