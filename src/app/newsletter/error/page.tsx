import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Lien invalide',
  description:
    'Ce lien de confirmation ou de désinscription newsletter SPORE est invalide ou expiré.',
  alternates: { canonical: '/newsletter/error' },
  robots: { index: false, follow: false },
};

export default function NewsletterErrorPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <header className="mb-8">
        <span className="mb-4 inline-block text-xs uppercase tracking-[0.3em] text-amber-glow">
          Newsletter
        </span>
        <h1 className="font-display text-4xl leading-tight text-mist-100 md:text-5xl">
          Lien invalide ou expiré
        </h1>
      </header>
      <p className="mb-4 text-mist-300 leading-relaxed">
        Ce lien de confirmation ou de désinscription n&apos;est pas valide. Il
        a peut-être expiré, ou il a déjà été utilisé.
      </p>
      <p className="mb-10 text-sm text-mist-500 leading-relaxed">
        Si vous tentiez de vous inscrire, vous pouvez recommencer depuis
        n&apos;importe quel brief — un nouveau lien de confirmation vous sera
        envoyé.
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
