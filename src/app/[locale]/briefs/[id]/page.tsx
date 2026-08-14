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
import { localeAlternates, localeUrl } from '@/lib/i18n-seo';
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

  // S2b/C7c — indexability of stub briefs (honest "this collision led
  // nowhere" analyses) depends on the LOCALE, not just on the type.
  //
  // FR: indexable. The page renders real, substantial prose.
  // EN: not indexable, because it renders that same FRENCH prose. A
  //     stub's body comes from body_markdown, and there is no
  //     body_markdown_en column — only the chrome around it is
  //     translated. Indexing it would put French content under an
  //     English shell.
  //
  // The condition is on the body, not on the type: the vulgarization
  // payload these pages take their title and description from IS
  // already bilingual. Lift the EN half as soon as the bodies are
  // translated — do not let this outlive that, and do not widen it back
  // to `if (brief.is_stub)` without re-reading this.
  const isFrenchOnlyBody = brief.is_stub && locale !== 'fr';

  // S7.4 Phase 3: briefMeta* helpers now accept the active locale and
  // prefer ``vulgarization_en`` when present. Briefs that have not yet
  // been backfilled to EN fall back to the FR payload — by design, so a
  // freshly published brief still has SEO metadata even before the
  // translation script has run.
  const title = briefMetaTitle(brief, locale);
  const description = briefMetaDescription(brief, locale);
  const ogDescription = briefOgDescription(brief, locale);
  // Same derivation as the canonical and the JSON-LD (F08).
  const url = localeUrl(locale, `/briefs/${brief.brief_id}`);

  return {
    title,
    description,
    alternates: localeAlternates(locale, `/briefs/${brief.brief_id}`),
    // The key is omitted, not set to undefined: an explicit undefined
    // overrides the parent metadata instead of deferring to it, which
    // would drop the layout's googleBot directives (max-snippet,
    // max-image-preview) from every brief page. Only the EN half of a
    // stub opts out; everything else inherits.
    ...(isFrenchOnlyBody ? { robots: { index: false, follow: false } } : {}),
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
      <BriefJsonLd brief={brief} locale={locale} verdictKeywords={verdictKeywords} />

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
        locale={locale}
      />
    </div>
  );
}

function neighborTitle(b: Brief, locale: string): string {
  if (locale === 'en') {
    return (
      b.vulgarization_en?.title ||
      b.vulgarization_fr?.title_fr ||
      b.sharpened.title
    );
  }
  return b.vulgarization_fr?.title_fr || b.sharpened.title;
}

function BriefNeighbors({
  prev,
  next,
  previousLabel,
  nextLabel,
  ariaLabel,
  verdictLabel,
  locale,
}: {
  prev: Brief | null;
  next: Brief | null;
  previousLabel: string;
  nextLabel: string;
  ariaLabel: string;
  verdictLabel: (v: string | null | undefined) => string;
  locale: string;
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
            {neighborTitle(prev, locale)}
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
            {neighborTitle(next, locale)}
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
