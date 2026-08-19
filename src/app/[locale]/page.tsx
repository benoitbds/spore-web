import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import EditorialBriefCard from '@/components/EditorialBriefCard';
import MyceliumBackground from '@/components/MyceliumBackground';
import NoveltyScoreTooltip from '@/components/NoveltyScoreTooltip';
import {
  briefRowToBrief,
  getAllBriefs,
  getFeaturedBrief,
  getStats,
} from '@/lib/db';
import type { Brief } from '@/lib/types';
import { localeAlternates } from '@/lib/i18n-seo';
import { SITE_URL, briefCardHook, briefCardTitle } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: localeAlternates(locale, '/'),
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: `${SITE_URL}/${locale}`,
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'home' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const tVerdicts = await getTranslations({ locale, namespace: 'verdicts' });

  const stats = getStats();
  const featured = getFeaturedBrief();
  const all: Brief[] = getAllBriefs().map(briefRowToBrief);
  const others = all
    .filter((b) => b.brief_id !== featured?.brief_id)
    .slice(0, 6);

  const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

  return (
    <>
      {featured ? (
        <FeaturedHero
          brief={featured}
          locale={locale}
          dateLocale={dateLocale}
          manifesto={tCommon('manifesto')}
          subtitle={t('tagline_subtitle')}
          kickerLastBrief={t('kicker_lastBrief')}
          panelLabel={t('featured_panelLabel')}
          noveltyLabel={t('featured_noveltyLabel')}
          readBrief={t('featured_readBrief')}
          verdictNoveltySub={(() => {
            const v = featured.grounding.novelty_assessment.verdict;
            try {
              return tVerdicts(v).toLowerCase();
            } catch {
              return v?.toLowerCase() ?? '';
            }
          })()}
          verdictPanelSub={(() => {
            const v = featured.panel.meta_review.verdict;
            try {
              return tVerdicts(v).toLowerCase();
            } catch {
              return v?.toLowerCase() ?? '';
            }
          })()}
        />
      ) : (
        <EmptyHero
          title={t('empty_title')}
          desc={t('empty_desc')}
        />
      )}

      {others.length > 0 && (
        <section className="relative border-t border-ink-500/50 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 flex items-end justify-between gap-4">
              <div>
                <span className="mb-3 inline-block text-xs uppercase tracking-[0.3em] text-emerald-glow">
                  {t('others_kicker')}
                </span>
                <h2 className="font-display text-3xl text-mist-100 md:text-4xl">
                  {t('others_title')}
                </h2>
              </div>
              <Link
                href="/briefs"
                className="hidden whitespace-nowrap text-sm text-emerald-glow transition-colors hover:text-emerald-bio md:inline-flex"
              >
                {t('others_allLink')}
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {others.map((brief, i) => (
                <EditorialBriefCard key={brief.brief_id} brief={brief} index={i} />
              ))}
            </div>

            <div className="mt-12 flex justify-center md:hidden">
              <Link
                href="/briefs"
                className="text-sm text-emerald-glow transition-colors hover:text-emerald-bio"
              >
                {t('others_allLink')}
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="relative border-t border-ink-500/50 bg-ink-800/30 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block text-xs uppercase tracking-[0.3em] text-cyan-glow">
              {t('pitch_kicker')}
            </span>
            <h2 className="font-display text-3xl text-mist-100 md:text-5xl">
              {t('pitch_title')}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-mist-400 md:text-base">
              {t('pitch_subtitle')}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <StepCard
              step="01"
              icon="🎲"
              title={t('step1_title')}
              description={t('step1_desc')}
              accent="emerald"
            />
            <StepCard
              step="02"
              icon="🧪"
              title={t('step2_title')}
              description={t('step2_desc')}
              accent="cyan"
            />
            <StepCard
              step="03"
              icon="📄"
              title={t('step3_title')}
              description={t('step3_desc')}
              accent="amber"
            />
          </div>

          {stats && (
            <div className="mt-16 grid gap-4 border-t border-ink-500/70 pt-10 md:grid-cols-4">
              <MiniStat
                value={formatInt(stats.totals.collisions, dateLocale)}
                label={t('metric_collisions')}
              />
              <MiniStat
                value={formatInt(stats.totals.briefs, dateLocale)}
                label={t('metric_briefs')}
              />
              <MiniStat
                value={
                  stats.quality.avg_novelty_score != null
                    ? stats.quality.avg_novelty_score.toFixed(2)
                    : '—'
                }
                label={t('metric_avgNovelty')}
                labelTooltip={<NoveltyScoreTooltip />}
              />
              <MiniStat value={t('metric_referencesPercentage')} label={t('metric_referencesVerified')} />
            </div>
          )}

          <div className="mt-12 flex justify-center">
            <Link
              href="/how-it-works"
              className="group inline-flex items-center gap-2 text-sm text-mist-300 transition-colors hover:text-emerald-glow"
            >
              {t('moreOnPipeline')}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

// ── Featured hero ───────────────────────────────────────────────

function FeaturedHero({
  brief,
  locale,
  dateLocale,
  manifesto,
  subtitle,
  kickerLastBrief,
  panelLabel,
  noveltyLabel,
  readBrief,
  verdictNoveltySub,
  verdictPanelSub,
}: {
  brief: Brief;
  locale: string;
  dateLocale: string;
  manifesto: string;
  subtitle: string;
  kickerLastBrief: string;
  panelLabel: string;
  noveltyLabel: string;
  readBrief: string;
  verdictNoveltySub: string;
  verdictPanelSub: string;
}) {
  const { domains, grounding, panel, brief_id, generated_at, is_stub } = brief;

  // Locale-aware title + hook. On /en we prefer the EN translation
  // (S7.4 Phase 2 backfill), falling back to the FR vulgarisation, then
  // to the formal sharpened title for legacy briefs. Stubs bypass the
  // vulgarisation and take both from their Markdown body — see
  // lib/seo.ts. getFeaturedBrief now skips stubs on its first two tiers,
  // but tier 3 is an unconditional "most recent brief", so the hero
  // still has to be stub-safe on its own.
  const title = briefCardTitle(brief, locale);
  const hook = briefCardHook(brief, locale);
  // S2c/C14 — NULL scores surface as 0 through the db adapter defaults.
  // A stub was never evaluated, so its score pills are hidden rather
  // than printed as a fabricated 0.00 / 0.0.
  const novelty = grounding.novelty_assessment.score;
  const panelScore = panel.meta_review.consensus_score;

  return (
    <section className="relative overflow-hidden border-b border-ink-500/40">
      <MyceliumBackground density={0.5} className="opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-mesh-1 opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bio/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-ink-900" />

      <div className="relative mx-auto flex max-w-6xl flex-col px-6 py-16 md:py-24 lg:py-28">
        <p className="mb-3 max-w-3xl text-sm leading-relaxed text-mist-200/70 md:text-base">
          <span className="font-display text-base italic text-mist-100 md:text-lg">SPORE</span>
          <span className="mx-2 text-mist-600">—</span>
          {manifesto}
        </p>
        <p className="mb-6 max-w-3xl text-xs italic leading-relaxed text-mist-400 md:text-sm">
          {subtitle}
        </p>

        <div className="mb-8 flex flex-wrap items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-bio/30 bg-emerald-bio/5 px-3 py-1 uppercase tracking-[0.22em] text-emerald-glow">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-glow" />
            {kickerLastBrief}
          </span>
          <time
            className="font-mono text-mist-500"
            dateTime={generated_at}
          >
            {new Date(generated_at).toLocaleDateString(dateLocale, {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </time>
          <span className="font-mono text-mist-600">·</span>
          <span className="font-mono text-mist-500">{brief_id}</span>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full border border-emerald-bio/40 bg-emerald-bio/10 px-3 py-1 text-emerald-glow">
            {domains[0]}
          </span>
          <span className="text-xl text-mist-500">×</span>
          <span className="rounded-full border border-cyan-bio/40 bg-cyan-bio/10 px-3 py-1 text-cyan-glow">
            {domains[1] || '—'}
          </span>
        </div>

        <h1 className="max-w-5xl font-display text-[2.25rem] leading-[1.05] tracking-tight text-mist-100 md:text-6xl lg:text-7xl">
          {title}
        </h1>

        {hook && (
          <blockquote className="relative mt-10 max-w-3xl border-l-2 border-emerald-bio/40 pl-6">
            <p className="font-display text-xl italic leading-relaxed text-mist-200 md:text-2xl">
              {hook}
            </p>
          </blockquote>
        )}

        <div className="mt-12 flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap gap-6">
            {!is_stub && (
              <>
                <HeroBadge
                  label={noveltyLabel}
                  value={novelty.toFixed(2)}
                  sub={verdictNoveltySub}
                  accent="emerald"
                  labelTooltip={<NoveltyScoreTooltip />}
                />
                <HeroBadge
                  label={panelLabel}
                  value={`${panelScore.toFixed(1)}/10`}
                  sub={verdictPanelSub}
                  accent="cyan"
                />
              </>
            )}
          </div>

          <Link
            href={`/briefs/${brief_id}`}
            className="group inline-flex items-center gap-2 rounded-full border border-emerald-bio/50 bg-emerald-bio/10 px-6 py-3 text-sm font-medium text-emerald-glow transition-all hover:border-emerald-bio hover:bg-emerald-bio/20 hover:shadow-[0_0_50px_rgba(16,185,129,0.3)]"
          >
            {readBrief}
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function EmptyHero({ title, desc }: { title: string; desc: string }) {
  return (
    <section className="relative flex min-h-[60vh] items-center border-b border-ink-500/40">
      <MyceliumBackground density={0.4} className="opacity-40" />
      <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl text-mist-100 md:text-6xl">{title}</h1>
        <p className="mt-6 text-mist-400">{desc}</p>
      </div>
    </section>
  );
}

function HeroBadge({
  label,
  value,
  sub,
  accent,
  labelTooltip,
}: {
  label: string;
  value: string;
  sub: string;
  accent: 'emerald' | 'cyan';
  labelTooltip?: React.ReactNode;
}) {
  const tone =
    accent === 'emerald'
      ? 'border-emerald-bio/30 bg-emerald-bio/5 text-emerald-glow'
      : 'border-cyan-bio/30 bg-cyan-bio/5 text-cyan-glow';
  return (
    <div className={`rounded-xl border ${tone} px-5 py-3`}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-mist-500">
        <span>{label}</span>
        {labelTooltip}
      </div>
      <div className="mt-1 font-display text-2xl text-mist-100">{value}</div>
      <div className="text-xs text-mist-400">{sub}</div>
    </div>
  );
}

function StepCard({
  step,
  icon,
  title,
  description,
  accent,
}: {
  step: string;
  icon: string;
  title: string;
  description: string;
  accent: 'emerald' | 'cyan' | 'amber';
}) {
  const tone = {
    emerald: 'from-emerald-bio/15 border-emerald-bio/25',
    cyan: 'from-cyan-bio/15 border-cyan-bio/25',
    amber: 'from-amber-bio/15 border-amber-bio/25',
  }[accent];
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br to-transparent ${tone} p-7`}>
      <div className="absolute right-4 top-4 font-mono text-xs text-mist-500">
        {step}
      </div>
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="mb-2 font-display text-xl text-mist-100">{title}</h3>
      <p className="text-sm leading-relaxed text-mist-400">{description}</p>
    </div>
  );
}

function MiniStat({
  value,
  label,
  labelTooltip,
}: {
  value: string;
  label: string;
  labelTooltip?: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <div className="font-display text-3xl text-mist-100 md:text-4xl">{value}</div>
      <div className="mt-1 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-mist-500">
        <span>{label}</span>
        {labelTooltip}
      </div>
    </div>
  );
}

function formatInt(n: number | undefined, dateLocale: string): string {
  if (n == null) return '—';
  return new Intl.NumberFormat(dateLocale).format(n);
}
