import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { localeAlternates } from '@/lib/i18n-seo';

// S1/F02 + S2/F03 — same as privacy: metadata translated, French legal
// body left alone.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legalPage' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: localeAlternates(locale, '/legal'),
  };
}

export default function LegalPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 text-mist-200">
      <h1 className="mb-10 font-display text-4xl text-mist-100">
        Mentions légales
      </h1>

      <Section title="Éditeur">
        <p>
          SPORE est un projet de recherche édité par{' '}
          <span className="font-medium text-mist-100">
            SPORE Research (structure en cours de création)
          </span>
          .
        </p>
        <p>
          Email :{' '}
          <a
            href="mailto:benoit@spore-research.com"
            className="text-emerald-glow hover:text-emerald-bio"
          >
            benoit@spore-research.com
          </a>
        </p>
        <p>Directeur de la publication : l&apos;éditeur</p>
      </Section>

      <Section title="Hébergement">
        <p>Hébergement autogéré par l&apos;éditeur (serveur personnel).</p>
      </Section>

      <Section title="Propriété intellectuelle">
        <p>
          Le contenu du site (textes, briefs, design) est protégé par le
          droit d&apos;auteur. Les hypothèses générées par SPORE sont des
          propositions exploratoires, pas des publications scientifiques
          validées par des pairs. Les références bibliographiques proviennent
          de Semantic Scholar et sont vérifiées par API.
        </p>
      </Section>

      <Section title="Responsabilité">
        <p>
          SPORE est un outil de génération d&apos;hypothèses. Les briefs ne
          constituent ni un conseil scientifique, ni une recommandation
          d&apos;investissement, ni un avis médical. L&apos;utilisateur est
          seul responsable de l&apos;usage qu&apos;il fait des contenus.
        </p>
        <p>
          SPORE est actuellement en phase de lancement gratuit. Aucun
          paiement n&apos;est collecté.
        </p>
      </Section>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10 space-y-3 text-sm leading-relaxed">
      <h2 className="font-display text-xl text-mist-100">{title}</h2>
      <div className="space-y-2 text-mist-300">{children}</div>
    </section>
  );
}
