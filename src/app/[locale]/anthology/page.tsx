import type { Metadata } from 'next';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { SITE_URL } from '@/lib/seo';
import { localeAlternates } from '@/lib/i18n-seo';
import AnthologyClient from './AnthologyClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'anthologyPage' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: localeAlternates(locale, '/anthology'),
    openGraph: {
      title: t('title'),
      description: t('metaDescription'),
      url: `${SITE_URL}/${locale}/anthology`,
      type: 'article',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      images: [
        {
          url: '/og-default.png',
          width: 1200,
          height: 630,
          alt: 'SPORE — Anthology',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('metaDescription'),
      images: ['/og-default.png'],
    },
  };
}

// The 8 anthology preview titles stay in their original French phrasing
// (editorial signature decision in S7.2). The bilingual notice below the
// section header explains this to /en/ visitors.
const PREVIEW_TITLES: ReadonlyArray<{ title: string; domains: string }> = [
  {
    title:
      'Les métalloprotéines passent aux aveux : une méthode quantique pour décoder leurs secrets électroniques',
    domains: 'Inorganic Chemistry × Structural Biology',
  },
  {
    title:
      'Construire des nano-objets en ADN sans défauts : le secret du repli contrôlé',
    domains: 'Molecular Biology × Nanotechnology',
  },
  {
    title:
      "Éclairer une réaction chimique comme on dose l'arrosage d'une plante",
    domains: 'Photochemistry × Chemical Engineering',
  },
  {
    title:
      'Fabriquer des pièces métalliques sans défauts : un cerveau numérique pour la fabrication additive',
    domains: 'Chemical Engineering × Manufacturing Engineering',
  },
  {
    title:
      'Des cellules souches intelligentes pour réparer les artères abîmées',
    domains: 'Synthetic Biology × Tissue Regeneration',
  },
  {
    title:
      'Des médicaments à la catalyse : une méthode de la chimie pharmaceutique',
    domains: 'Catalytic Materials × Surface Science',
  },
  {
    title:
      "Le catalyseur qui respire : quand une surface s'use pour mieux fonctionner",
    domains: 'Catalytic Materials × Surface Science',
  },
  {
    title:
      "L'ADN d'un métal en fusion : peut-on prédire sa structure en temps réel ?",
    domains: 'Materials Science × Physics',
  },
];

export default async function AnthologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'anthologyPage' });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <header className="mb-12">
        <span className="mb-4 inline-block text-xs uppercase tracking-[0.3em] text-emerald-glow">
          {t('kicker')}
        </span>
        <h1 className="font-display text-4xl leading-tight text-mist-100 md:text-6xl">
          {t('title')}
        </h1>
        <p className="mt-6 text-mist-300 leading-relaxed">{t('intro')}</p>
      </header>

      <section className="mb-12">
        <h2 className="mb-4 font-display text-2xl text-mist-100 md:text-3xl">
          {t('tocTitle')}
        </h2>
        <BilingualNotice />
        <ol className="space-y-3">
          {PREVIEW_TITLES.map((entry, i) => (
            <li
              key={i}
              className="flex gap-4 rounded-xl border border-ink-500 bg-ink-800/40 px-4 py-3"
            >
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-bio/40 bg-emerald-bio/10 font-mono text-xs text-emerald-glow"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-mist-100 leading-snug">
                  {entry.title}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-mist-500">
                  {entry.domains}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-12">
        <AnthologyClient />
      </section>

      <section className="mb-12 rounded-xl border border-ink-500 bg-ink-800/40 p-6 text-sm text-mist-300 leading-relaxed">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-mist-500">
          {t('whatTitle')}
        </h2>
        <ul className="space-y-2 text-mist-300">
          <li className="flex gap-3">
            <span aria-hidden className="mt-1 select-none text-emerald-glow">
              •
            </span>
            <span>{t('whatBullet1')}</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-1 select-none text-emerald-glow">
              •
            </span>
            <span>{t('whatBullet2')}</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-1 select-none text-emerald-glow">
              •
            </span>
            <span>
              {t('whatBullet3_before')}
              <Link
                href="/methodology"
                className="text-emerald-glow underline-offset-2 hover:underline"
              >
                {t('whatBullet3_link')}
              </Link>
              {t('whatBullet3_after')}
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}

// Bilingual notice rendered above the FR titles list, ONLY on /en/.
// The 8 anthology titles are kept in their original French phrasing
// (editorial signature decision in S7.2). EN visitors see this notice
// explaining the choice; FR visitors see nothing extra.
async function BilingualNotice() {
  const locale = await getLocale();
  if (locale !== 'en') return null;
  return (
    <div className="mb-6 rounded-xl border border-amber-bio/30 bg-amber-bio/5 p-4 text-xs italic text-mist-300 leading-relaxed">
      This anthology contains briefs originally vulgarised in French.
      Their introductory titles below preserve the original French
      phrasing; the scientific content within each brief (hypothesis,
      predictions, protocol, references, panel review) is in English.
      The full PDF is bilingual.
    </div>
  );
}
