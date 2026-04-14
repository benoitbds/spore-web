import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getAllBriefs,
  getBriefById,
  getBriefMarkdown,
  getBriefNeighbors,
} from '@/lib/briefs';
import { verdictLabel } from '@/lib/verdicts';
import {
  SITE_URL,
  SITE_NAME,
  briefMetaTitle,
  briefMetaDescription,
  briefOgDescription,
} from '@/lib/seo';
import BriefDetailClient from './BriefDetailClient';
import BriefJsonLd from '@/components/BriefJsonLd';
import type { Brief } from '@/lib/types';

interface Params {
  params: { id: string };
}

export async function generateStaticParams() {
  return getAllBriefs().map((b) => ({ id: b.brief_id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const brief = getBriefById(params.id);
  if (!brief) {
    return {
      title: 'Brief introuvable',
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
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: ogDescription,
    },
    alternates: {
      canonical: `/discoveries/${brief.brief_id}`,
    },
  };
}

export default function BriefDetailPage({ params }: Params) {
  const brief = getBriefById(params.id);
  if (!brief) notFound();

  const markdown = getBriefMarkdown(params.id);
  const { prev, next } = getBriefNeighbors(params.id);

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

      <BriefDetailClient brief={brief} markdown={markdown} />

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
