import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Désinscription effectuée',
  description:
    "Vous êtes désinscrit de la newsletter SPORE. Vous ne recevrez plus d'emails.",
  alternates: { canonical: '/newsletter/unsubscribed' },
  robots: { index: false, follow: false },
};

export default function NewsletterUnsubscribedPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <header className="mb-8">
        <span className="mb-4 inline-block text-xs uppercase tracking-[0.3em] text-mist-400">
          Newsletter
        </span>
        <h1 className="font-display text-4xl leading-tight text-mist-100 md:text-5xl">
          Vous êtes désinscrit
        </h1>
      </header>
      <p className="mb-4 text-mist-300 leading-relaxed">
        Vous ne recevrez plus d&apos;emails de la newsletter SPORE.
      </p>
      <p className="mb-10 text-sm text-mist-500 leading-relaxed">
        Si c&apos;était une erreur, vous pouvez vous réinscrire à tout moment
        depuis n&apos;importe quel brief, ou directement depuis la page
        d&apos;accueil.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full border border-ink-500 bg-ink-800/40 px-6 py-3 text-sm font-medium text-mist-200 transition-all hover:border-mist-500/40 hover:text-mist-100"
      >
        Retour à l&apos;accueil →
      </Link>
    </div>
  );
}
