import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  briefRowToBrief,
  briefRowToTeaser,
  getAllBriefs,
  getBriefById,
  getBriefNeighbors,
  type BriefWithBody,
} from '@/lib/db';
import { verdictLabel } from '@/lib/verdicts';
import {
  SITE_URL,
  SITE_NAME,
  briefMetaTitle,
  briefMetaDescription,
  briefOgDescription,
} from '@/lib/seo';
import BriefDetailClient from './BriefDetailClient';
import StubBriefClient from './StubBriefClient';
import BriefJsonLd from '@/components/BriefJsonLd';
import CustomCollisionCta from '@/components/CustomCollisionCta';
import type { Brief } from '@/lib/types';

interface Params {
  params: { id: string };
}

export async function generateStaticParams() {
  // getAllBriefs returns BriefRow[] where the primary key lives on .id
  // (the SPR-XXXX string). Params expect { id } — direct pass-through.
  return getAllBriefs().map((b) => ({ id: b.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const row = getBriefById(params.id);
  if (!row) {
    return {
      title: 'Brief introuvable',
      robots: { index: false, follow: false },
    };
  }

  const brief: BriefWithBody = briefRowToBrief(row);

  // Stub briefs are user-specific honest-failure analyses; they shouldn't
  // appear in search, and the regular briefMetaTitle helper reads fields
  // that only exist on pipeline briefs (sharpened.title etc.).
  if (brief.is_stub) {
    return {
      title: brief.sharpened.title || 'Analyse SPORE',
      robots: { index: false, follow: false },
    };
  }

  const title = briefMetaTitle(brief);
  const description = briefMetaDescription(brief);
  const ogDescription = briefOgDescription(brief);
  const url = `${SITE_URL}/discoveries/${brief.brief_id}`;

  return {
    title, // uses the `%s | SPORE` template from layout
    description,
    openGraph: {
      type: 'article',
      locale: 'fr_FR',
      siteName: SITE_NAME,
      title,
      description: ogDescription,
      url,
      publishedTime: brief.generated_at,
      tags: brief.domains,
      // Reuses the site-wide OG image. A per-brief dynamic image will
      // land later (e.g. via @vercel/og or a /api/og/[id] route).
      images: [
        {
          url: '/og-default.png',
          width: 1200,
          height: 630,
          alt: `SPORE — ${title}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: ogDescription,
      images: ['/og-default.png'],
    },
    alternates: {
      canonical: `/discoveries/${brief.brief_id}`,
    },
  };
}

export default function BriefDetailPage({ params }: Params) {
  const row = getBriefById(params.id);
  if (!row) notFound();

  const brief: BriefWithBody = briefRowToBrief(row);

  // Stub briefs (custom runs where Synthesis refused to bridge the pair)
  // carry only { is_stub, title, domains, body_markdown }. They don't
  // have pipeline data for BriefDetailClient to render, so we route
  // them to a dedicated client that shows an info banner + the markdown.
  if (brief.is_stub && brief.body_markdown) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Link
          href="/discoveries"
          className="group mb-8 inline-flex items-center gap-2 text-sm text-mist-400 hover:text-emerald-glow transition-colors"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          Toutes les découvertes
        </Link>
        <StubBriefClient
          briefId={brief.brief_id || params.id}
          title={brief.sharpened.title || 'Analyse SPORE'}
          domainA={brief.domains[0] ?? '?'}
          domainB={brief.domains[1] ?? '?'}
          markdown={brief.body_markdown}
          generatedAt={brief.generated_at ?? null}
        />
      </div>
    );
  }

  // Paywall boundary: the full Brief never crosses into a client component.
  // BriefJsonLd is a pure server component (no "use client"), so its props
  // stay on the server. BriefDetailClient receives only the teaser subset;
  // the gated content is fetched from /api/briefs/{id}/full at interaction
  // time, which enforces free-brief / credit / 402 server-side.
  const teaser = briefRowToTeaser(row);
  // db.getBriefNeighbors returns {previous, next}; the local neighbors
  // component was built against the briefs.ts shape {prev, next}.
  // Alias the destructure so we don't need to rename the component API.
  const { previous: prev, next } = getBriefNeighbors(params.id);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <BriefJsonLd brief={brief} />

      <Link
        href="/discoveries"
        className="group mb-8 inline-flex items-center gap-2 text-sm text-mist-400 hover:text-emerald-glow transition-colors"
      >
        <span className="transition-transform group-hover:-translate-x-1">←</span>
        Toutes les découvertes
      </Link>

      <BriefDetailClient teaser={teaser} />

      <div className="mt-20">
        <CustomCollisionCta
          headline="Cette collision vous inspire ?"
          subtext="Demandez la vôtre sur un domaine de votre choix — gratuite pendant le lancement. SPORE croise vos domaines, génère une hypothèse et livre un brief complet en quelques minutes."
          cta="Demander ma collision →"
        />
      </div>

      <BriefNeighbors prev={prev} next={next} />
    </div>
  );
}

function neighborTitle(b: Brief): string {
  return b.vulgarization_fr?.title_fr || b.sharpened.title;
}

function BriefNeighbors({ prev, next }: { prev: Brief | null; next: Brief | null }) {
  if (!prev && !next) return null;
  return (
    <nav
      aria-label="Navigation entre découvertes"
      className="mt-20 grid gap-4 border-t border-ink-500/60 pt-10 md:grid-cols-2"
    >
      {prev ? (
        <Link
          href={`/discoveries/${prev.brief_id}`}
          className="group rounded-2xl border border-ink-500 bg-ink-800/40 p-5 transition-all hover:border-emerald-bio/40 hover:bg-ink-800/70"
        >
          <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-widest text-mist-500">
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            Découverte précédente
          </div>
          <div className="font-display text-lg leading-tight text-mist-100 line-clamp-2">
            {neighborTitle(prev)}
          </div>
          <div className="mt-1 text-xs text-mist-500">
            {prev.domains[0]} × {prev.domains[1] || '—'} ·{' '}
            {verdictLabel(prev.panel.meta_review.verdict)}
          </div>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}

      {next ? (
        <Link
          href={`/discoveries/${next.brief_id}`}
          className="group rounded-2xl border border-ink-500 bg-ink-800/40 p-5 text-right transition-all hover:border-emerald-bio/40 hover:bg-ink-800/70"
        >
          <div className="mb-2 flex items-center justify-end gap-2 text-[11px] uppercase tracking-widest text-mist-500">
            Découverte suivante
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </div>
          <div className="font-display text-lg leading-tight text-mist-100 line-clamp-2">
            {neighborTitle(next)}
          </div>
          <div className="mt-1 text-xs text-mist-500">
            {next.domains[0]} × {next.domains[1] || '—'} ·{' '}
            {verdictLabel(next.panel.meta_review.verdict)}
          </div>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}
