import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tarifs',
  description:
    "Tous les briefs SPORE sont gratuits pendant la période de lancement. Inscrivez-vous pour accéder à l'intégralité des recherches.",
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <div className="mb-6 text-5xl">✨</div>
      <h1 className="font-display text-4xl text-mist-100">
        Tous les briefs sont gratuits
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-mist-400">
        Pendant la période de lancement, l&apos;intégralité des briefs SPORE est
        accessible gratuitement après inscription par email. Hypothèse
        formalisée, protocole expérimental, panel de review, base de preuves
        — tout est inclus.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/discoveries"
          className="rounded-xl bg-emerald-bio px-6 py-3 text-sm font-semibold text-ink-900 hover:bg-emerald-glow"
        >
          Explorer les découvertes →
        </Link>
        <Link
          href="/custom"
          className="rounded-xl border border-ink-500 bg-ink-800/60 px-6 py-3 text-sm text-mist-200 hover:text-mist-100"
        >
          Commander une collision
        </Link>
      </div>
    </div>
  );
}
