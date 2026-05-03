import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import {
  briefRowToBrief,
  briefRowToTeaser,
  getAllBriefs,
  getBriefById,
  getBriefNeighbors,
  type BriefWithBody,
} from '@/lib/db';
import {
  SITE_URL,
  SITE_NAME,
  briefMetaTitle,
  briefMetaDescription,
  briefOgDescription,
} from '@/lib/seo';
import { localeAlternates } from '@/lib/i18n-seo';
import BriefDetailClient from './BriefDetailClient';
import StubBriefClient from './StubBriefClient';
import BriefJsonLd from '@/components/BriefJsonLd';
import CustomCollisionCta from '@/components/CustomCollisionCta';
import type { Brief } from '@/lib/types';

interface RouteParams {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateStaticParams() {
  // Cross-product of all locales × all brief IDs. Without this every
  // /{locale}/briefs/{id} pair would fall back to dynamic rendering on
  // first hit. getAllBriefs() returns BriefRow[] keyed on .id (SPR-XXXX).
  const ids = getAllBriefs().map((b) => b.id);
  return routing.locales.flatMap((locale) =>
    ids.map((id) => ({ locale, id })),
  );
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'briefDetailPage' });
  const row = getBriefById(id);
  if (!row) {
    return {
      title: t('notFoundTitle'),
      robots: { index: false, follow: false },
    };
  }

  const brief: BriefWithBody = briefRowToBrief(row);

  // Stub briefs are user-specific honest-failure analyses; they shouldn't
  // appear in search, and the regular briefMetaTitle helper reads fields
  // that only exist on pipeline briefs (sharpened.title etc.).
  if (brief.is_stub) {
    return {
      title: brief.sharpened.title || 'SPORE',
      robots: { index: false, follow: false },
    };
  }

  // briefMetaTitle / briefMetaDescription are FR-only today; per S7.3-residual
  // Lot 1 the bilingualisation of brief metadata is deferred to S7.4 (DB
  // schema extension). We keep the FR strings on /en/ for now — better than
  // synthesising EN from sharpened.title (formal Nature-paper register).
  const title = briefMetaTitle(brief);
  const description = briefMetaDescription(brief);
  const ogDescription = briefOgDescription(brief);
  const url = `${SITE_URL}/${locale}/briefs/${brief.brief_id}`;

  return {
    title,
    description,
    alternates: localeAlternates(locale, `/briefs/${brief.brief_id}`),
    openGraph: {
      type: 'article',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      siteName: SITE_NAME,
      title,
      description: ogDescription,
      url,
      publishedTime: brief.generated_at,
      tags: brief.domains,
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
  };
}

export default async function BriefDetailPage({ params }: RouteParams) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'briefDetailPage' });
  const tVerdicts = await getTranslations({ locale, namespace: 'verdicts' });

  const row = getBriefById(id);
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
          href="/briefs"
          className="group mb-8 inline-flex items-center gap-2 text-sm text-mist-400 hover:text-emerald-glow transition-colors"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          {t('backToList')}
        </Link>
        <StubBriefClient
          briefId={brief.brief_id || id}
          title={brief.sharpened.title || 'SPORE'}
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
  const { previous: prev, next } = getBriefNeighbors(id);

  const verdictLabel = (v: string | null | undefined): string => {
    if (!v) return '—';
    // tVerdicts will gracefully fall back to the key if missing.
    try {
      return tVerdicts(v);
    } catch {
      return v;
    }
  };

  // Locale-translated verdict tokens for the JSON-LD keywords blob — keeps
  // SEO copy in the active locale instead of leaking FR-only labels.
  const verdictKeywords = [
    brief.grounding?.novelty_assessment?.verdict,
    brief.panel?.meta_review?.verdict,
  ]
    .filter((v): v is string => typeof v === 'string' && v.length > 0)
    .map((v) => {
      try {
        return tVerdicts(v);
      } catch {
        return null;
      }
    })
    .filter((v): v is string => typeof v === 'string' && v.length > 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <BriefJsonLd brief={brief} verdictKeywords={verdictKeywords} />

      <Link
        href="/briefs"
        className="group mb-8 inline-flex items-center gap-2 text-sm text-mist-400 hover:text-emerald-glow transition-colors"
      >
        <span className="transition-transform group-hover:-translate-x-1">←</span>
        {t('backToList')}
      </Link>

      <BriefDetailClient teaser={teaser} />

      <div className="mt-20">
        <CustomCollisionCta
          headline={t('customCtaHeadline')}
          subtext={t('customCtaSubtext')}
          cta={t('customCtaButton')}
        />
      </div>

      <BriefNeighbors
        prev={prev}
        next={next}
        previousLabel={t('previousBrief')}
        nextLabel={t('nextBrief')}
        ariaLabel={t('neighborsAria')}
        verdictLabel={verdictLabel}
      />
    </div>
  );
}

function neighborTitle(b: Brief): string {
  return b.vulgarization_fr?.title_fr || b.sharpened.title;
}

function BriefNeighbors({
  prev,
  next,
  previousLabel,
  nextLabel,
  ariaLabel,
  verdictLabel,
}: {
  prev: Brief | null;
  next: Brief | null;
  previousLabel: string;
  nextLabel: string;
  ariaLabel: string;
  verdictLabel: (v: string | null | undefined) => string;
}) {
  if (!prev && !next) return null;
  return (
    <nav
      aria-label={ariaLabel}
      className="mt-20 grid gap-4 border-t border-ink-500/60 pt-10 md:grid-cols-2"
    >
      {prev ? (
        <Link
          href={`/briefs/${prev.brief_id}`}
          className="group rounded-2xl border border-ink-500 bg-ink-800/40 p-5 transition-all hover:border-emerald-bio/40 hover:bg-ink-800/70"
        >
          <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-widest text-mist-500">
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            {previousLabel}
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
          href={`/briefs/${next.brief_id}`}
          className="group rounded-2xl border border-ink-500 bg-ink-800/40 p-5 text-right transition-all hover:border-emerald-bio/40 hover:bg-ink-800/70"
        >
          <div className="mb-2 flex items-center justify-end gap-2 text-[11px] uppercase tracking-widest text-mist-500">
            {nextLabel}
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
