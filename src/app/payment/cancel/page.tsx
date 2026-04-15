import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Paiement annulé',
  robots: { index: false, follow: false },
};

export default function CancelPage() {
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
