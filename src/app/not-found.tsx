import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page introuvable',
  description: "La page que vous cherchez n'existe pas ou a été déplacée.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-4 font-display text-7xl text-mist-100">404</h1>
      <p className="mb-2 text-xl text-mist-300">Cette page n&apos;existe pas.</p>
      <p className="mb-10 max-w-md text-mist-500">
        Peut-être qu&apos;elle a été déplacée, ou que le lien est erroné.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="rounded-xl bg-emerald-bio px-6 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-emerald-glow"
        >
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/briefs"
          className="rounded-xl border border-ink-500 bg-ink-800/60 px-6 py-3 text-sm text-mist-200 transition-colors hover:border-ink-400 hover:text-mist-100"
        >
          Explorer les briefs
        </Link>
      </div>
    </div>
  );
}
