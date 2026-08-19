import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Inscription confirmée',
  description:
    'Votre inscription à la newsletter SPORE est confirmée. Vous recevrez les prochaines hypothèses scientifiques par email.',
  alternates: { canonical: '/newsletter/confirmed' },
  robots: { index: false, follow: false },
};

export default function NewsletterConfirmedPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <header className="mb-8">
        <span className="mb-4 inline-block text-xs uppercase tracking-[0.3em] text-emerald-glow">
          Newsletter
        </span>
        <h1 className="font-display text-4xl leading-tight text-mist-100 md:text-5xl">
          Merci, votre inscription est confirmée
        </h1>
      </header>
      <p className="mb-4 text-mist-300 leading-relaxed">
        Vous recevrez les prochaines hypothèses SPORE par email — une à deux
        fois par mois, jamais plus. La prochaine publication arrive dans
        quelques jours.
      </p>
      <p className="mb-10 text-sm text-mist-500 leading-relaxed">
        En attendant, vous pouvez parcourir les briefs déjà publiés et explorer
        les hypothèses générées par le pipeline.
      </p>
      <Link
        href="/briefs"
        className="inline-flex items-center gap-2 rounded-full border border-emerald-bio/40 bg-emerald-bio/10 px-6 py-3 text-sm font-medium text-emerald-glow transition-all hover:border-emerald-bio/60 hover:bg-emerald-bio/20"
      >
        Découvrir les briefs publiés →
      </Link>
    </div>
  );
}
