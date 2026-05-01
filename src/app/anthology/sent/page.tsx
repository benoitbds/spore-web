import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Anthologie envoyée',
  description:
    "Le lien de téléchargement de l'Anthologie SPORE vient de partir vers votre boîte mail.",
  alternates: { canonical: '/anthology/sent' },
  robots: { index: false, follow: false },
};

export default function AnthologySentPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <header className="mb-8">
        <span className="mb-4 inline-block text-xs uppercase tracking-[0.3em] text-emerald-glow">
          Anthologie
        </span>
        <h1 className="font-display text-4xl leading-tight text-mist-100 md:text-5xl">
          Vérifiez votre boîte mail
        </h1>
      </header>
      <p className="mb-4 text-mist-300 leading-relaxed">
        Le lien de téléchargement de l&apos;Anthologie SPORE vient de partir
        vers l&apos;adresse que vous avez saisie. Il devrait arriver dans la
        minute.
      </p>
      <p className="mb-4 text-sm text-mist-400 leading-relaxed">
        Pas de mail&nbsp;? Vérifiez vos spams (ou les onglets Promotions /
        Notifications côté Gmail). Si rien dans 5 minutes, contactez{' '}
        <a
          href="mailto:benoit@spore-research.com"
          className="text-emerald-glow underline-offset-2 hover:underline"
        >
          benoit@spore-research.com
        </a>{' '}
        et je vous réponds en main propre.
      </p>
      <p className="mb-10 text-sm text-mist-500 leading-relaxed">
        L&apos;email contient aussi un lien optionnel pour confirmer votre
        inscription à la newsletter SPORE — 1 à 2 envois par mois, jamais
        plus. Désinscription en 1 clic à tout moment.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/briefs"
          className="inline-flex items-center gap-2 rounded-full border border-emerald-bio/40 bg-emerald-bio/10 px-6 py-3 text-sm font-medium text-emerald-glow transition-all hover:border-emerald-bio/60 hover:bg-emerald-bio/20"
        >
          Découvrir les briefs publiés →
        </Link>
        <Link
          href="/methodology"
          className="inline-flex items-center gap-2 rounded-full border border-ink-500 bg-ink-800/40 px-6 py-3 text-sm font-medium text-mist-200 transition-all hover:border-mist-500/40 hover:text-mist-100"
        >
          Méthodologie →
        </Link>
      </div>
    </div>
  );
}
