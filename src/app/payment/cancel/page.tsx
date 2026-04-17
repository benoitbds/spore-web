import type { Metadata } from 'next';
import Link from 'next/link';
import { LAUNCH_MODE } from '@/lib/launch';

export const metadata: Metadata = {
  title: 'Paiement annulé',
  description: 'Votre paiement a été annulé. Aucun montant n\'a été débité.',
  robots: { index: false, follow: false },
};

export default function CancelPage() {
  if (LAUNCH_MODE) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <div className="mb-6 text-5xl">🚀</div>
        <h1 className="font-display text-3xl text-mist-100 md:text-4xl">
          Votre accès est déjà actif
        </h1>
        <p className="mx-auto mt-4 max-w-md text-mist-400">
          SPORE est en offre de lancement — tous les briefs sont gratuits
          après inscription. Aucun paiement n&apos;est nécessaire.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/discoveries"
            className="rounded-xl bg-emerald-bio px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-emerald-glow"
          >
            Explorer les découvertes →
          </Link>
          <Link
            href="/pricing"
            className="rounded-xl border border-ink-500 bg-ink-800/60 px-5 py-3 text-sm text-mist-200 hover:text-mist-100"
          >
            Voir l&apos;offre de lancement
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <div className="mb-6 text-5xl">↩︎</div>
      <h1 className="font-display text-3xl text-mist-100 md:text-4xl">
        Paiement annulé
      </h1>
      <p className="mt-4 text-mist-400">
        Aucun montant n&apos;a été débité. Vous pouvez reprendre quand vous
        voulez.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/pricing"
          className="rounded-xl bg-emerald-bio px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-emerald-glow"
        >
          ← Retour aux tarifs
        </Link>
        <Link
          href="/discoveries"
          className="rounded-xl border border-ink-500 bg-ink-800/60 px-5 py-3 text-sm text-mist-200 hover:text-mist-100"
        >
          Explorer les briefs publics
        </Link>
      </div>
    </div>
  );
}
