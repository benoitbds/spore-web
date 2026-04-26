import type { Metadata } from 'next';
import Link from 'next/link';
import PipelineAnimation from '@/components/PipelineAnimation';
import { getStats } from '@/lib/db';
import { SITE_URL } from '@/lib/seo';

const _desc =
  'De la collision de domaines au brief de recherche : le pipeline SPORE étape par étape, avec 5 relecteurs IA, ancrage sur Semantic Scholar et zéro hallucination bibliographique.';

export const metadata: Metadata = {
  title: 'Comment ça marche',
  description: _desc,
  alternates: { canonical: '/how-it-works' },
  openGraph: {
    title: 'Comment ça marche | SPORE',
    description: _desc,
    url: `${SITE_URL}/how-it-works`,
    type: 'article',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comment ça marche | SPORE',
    description: _desc,
  },
};

export default function HowItWorksPage() {
  const stats = getStats();
  const totalCollisions = stats?.totals.collisions ?? 0;
  const totalBriefs = stats?.totals.briefs ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      {/* Hero */}
      <header className="mb-16 text-center md:mb-24">
        <span className="mb-4 inline-block text-xs uppercase tracking-[0.3em] text-emerald-glow">
          Le pipeline
        </span>
        <h1 className="font-display text-4xl leading-tight text-mist-100 md:text-6xl">
          De la collision au brief
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-mist-400">
          Onze étapes. Deux pipelines : L0 génère les hypothèses, le post-🔥
          valide les meilleures en profondeur.
        </p>
      </header>

      {/* Pipeline visualization */}
      <section className="mb-24">
        <PipelineAnimation />
      </section>

      {/* Numbers funnel */}
      <section className="mb-24 rounded-2xl border border-ink-500 bg-ink-800/40 p-8 md:p-12">
        <h2 className="mb-8 text-center font-display text-2xl text-mist-100 md:text-3xl">
          L'entonnoir en chiffres (100 collisions typiques)
        </h2>
        <div className="grid gap-6 md:grid-cols-5">
          <FunnelStep number="100" label="Collisions" accent="emerald" />
          <FunnelStep number="30-60" label="Passent le filtre" accent="emerald" />
          <FunnelStep number="~20" label="Hypothèses" accent="cyan" />
          <FunnelStep number="~3" label="Sélectionnées" accent="cyan" />
          <FunnelStep number="~0.5" label="🔥 briefs" accent="amber" />
        </div>
        <p className="mt-8 text-center text-sm text-mist-400">
          Sur l'ensemble de SPORE :{' '}
          <span className="font-mono text-emerald-glow">{totalCollisions.toLocaleString('fr-FR')}</span>{' '}
          collisions explorées →{' '}
          <span className="font-mono text-amber-glow">{totalBriefs}</span> briefs publiés.
        </p>
      </section>

      {/* Philosophy */}
      <section className="space-y-8">
        <div className="text-center">
          <span className="mb-3 inline-block text-xs uppercase tracking-[0.3em] text-cyan-glow">
            La philosophie
          </span>
          <h2 className="font-display text-3xl text-mist-100 md:text-5xl">
            Trois principes non négociables
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Principle
            icon="🤝"
            title="SPORE propose, les humains disposent"
            description="L'IA génère et valide, mais ne remplace pas le jugement humain. Chaque brief est une invitation à penser, pas une conclusion."
          />
          <Principle
            icon="🎯"
            title="Zéro hallucination bibliographique"
            description="Chaque référence est vérifiée via Semantic Scholar. Si un DOI n'est pas réel, il est exclu. Les citations sont les fondations."
          />
          <Principle
            icon="🎭"
            title="5 relecteurs, 5 perspectives"
            description="Méthodologue, expert du domaine, avocat du diable, industriel, stratège financement. Aucun angle mort. Tous les doutes sont exprimés."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mt-24 text-center">
        <p className="mb-6 text-mist-400">Prêt à explorer ?</p>
        <Link
          href="/briefs"
          className="inline-flex items-center gap-2 rounded-full border border-emerald-bio/40 bg-emerald-bio/10 px-6 py-3 text-sm font-medium text-emerald-glow transition-all hover:border-emerald-bio/60 hover:bg-emerald-bio/20 hover:shadow-[0_0_40px_rgba(16,185,129,0.25)]"
        >
          Voir les découvertes →
        </Link>
      </section>
    </div>
  );
}

function FunnelStep({
  number,
  label,
  accent,
}: {
  number: string;
  label: string;
  accent: 'emerald' | 'cyan' | 'amber';
}) {
  const colors = {
    emerald: 'text-emerald-glow',
    cyan: 'text-cyan-glow',
    amber: 'text-amber-glow',
  };
  return (
    <div className="text-center">
      <div className={`font-display text-4xl md:text-5xl ${colors[accent]}`}>
        {number}
      </div>
      <div className="mt-1 text-xs uppercase tracking-widest text-mist-500">
        {label}
      </div>
    </div>
  );
}

function Principle({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-ink-500 bg-ink-800/40 p-6">
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="mb-3 font-display text-xl text-mist-100">{title}</h3>
      <p className="text-sm leading-relaxed text-mist-400">{description}</p>
    </div>
  );
}
