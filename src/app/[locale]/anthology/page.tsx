import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { SITE_URL } from '@/lib/seo';
import AnthologyClient from './AnthologyClient';

const _title = 'Anthologie SPORE — 6 premiers mois';
const _desc =
  'Anthologie SPORE — un PDF gratuit de 8 hypothèses scientifiques ' +
  'interdisciplinaires sélectionnées dans les 6 premiers mois du projet. ' +
  'Envoyé par email contre votre adresse.';

export const metadata: Metadata = {
  title: 'Anthologie',
  description: _desc,
  alternates: { canonical: '/anthology' },
  openGraph: {
    title: _title,
    description: _desc,
    url: `${SITE_URL}/anthology`,
    type: 'article',
    locale: 'fr_FR',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'SPORE — Anthologie',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: _title,
    description: _desc,
    images: ['/og-default.png'],
  },
};

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

export default function AnthologyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <header className="mb-12">
        <span className="mb-4 inline-block text-xs uppercase tracking-[0.3em] text-emerald-glow">
          Lead magnet · PDF gratuit
        </span>
        <h1 className="font-display text-4xl leading-tight text-mist-100 md:text-6xl">
          Anthologie SPORE — 6 premiers mois
        </h1>
        <p className="mt-6 text-mist-300 leading-relaxed">
          Huit hypothèses scientifiques interdisciplinaires, sélectionnées
          parmi les 38 publiées sur SPORE depuis le lancement. Format PDF
          (≈ 350 ko, A4 imprimable), envoyé par email — gratuit, sans achat.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="mb-4 font-display text-2xl text-mist-100 md:text-3xl">
          Au sommaire
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
          Ce que vous trouverez dans le PDF
        </h2>
        <ul className="space-y-2 text-mist-300">
          <li className="flex gap-3">
            <span aria-hidden className="mt-1 select-none text-emerald-glow">
              •
            </span>
            <span>
              Pour chaque hypothèse : analogie d&apos;entrée, synthèse,
              pourquoi c&apos;est intéressant, protocole expérimental en 3
              phases, et l&apos;avis du panel de relecture IA.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-1 select-none text-emerald-glow">
              •
            </span>
            <span>
              Lien direct vers chaque brief complet en ligne (avec sa
              bibliographie vérifiée et ses prédictions chiffrées).
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-1 select-none text-emerald-glow">
              •
            </span>
            <span>
              Préambule honnête sur ce que SPORE est, et ce qu&apos;il
              n&apos;est pas. Lecture critique encouragée — voir{' '}
              <Link
                href="/methodology"
                className="text-emerald-glow underline-offset-2 hover:underline"
              >
                la méthodologie
              </Link>{' '}
              pour les limites assumées.
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
