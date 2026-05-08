'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import DomainBridge from '@/components/DomainBridge';
import ReviewerPanel from '@/components/ReviewerPanel';
import ProtocolTimeline from '@/components/ProtocolTimeline';
import ShareButtons from '@/components/ShareButtons';
import EmailGate from '@/components/EmailGate';
import NewsletterOptIn from '@/components/NewsletterOptIn';
import NoveltyScoreTooltip from '@/components/NoveltyScoreTooltip';
import type {
  BriefTeaser,
  CounterEvidence,
  EvidencePaper,
  MetaReview,
  Panel,
  Prediction,
  Protocol,
  Review,
  Sharpened,
  VulgarizationFr,
  VulgarizationEn,
} from '@/lib/types';
import { verdictChipClasses } from '@/lib/verdicts';
import { SITE_URL } from '@/lib/seo';
import { useAuth } from '@/contexts/AuthContext';
import { api, ApiError, type FullBriefResponse } from '@/lib/api';

interface Props {
  teaser: BriefTeaser;
}

type Tab = 'comprendre' | 'recherche';
type Lang = 'fr' | 'en';

/**
 * Unlocked full-brief shape — the four JSON blobs from the API
 * reshaped to match the types the old component knows how to render.
 */
interface UnlockedBrief {
  sharpened: Sharpened;
  panel: Panel;
  protocol: Protocol;
  grounding: {
    evidence_base: EvidencePaper[];
    counter_evidence: CounterEvidence[];
    gap_manifest_update: {
      closed_gaps: string[];
      new_gaps: string[];
      data_available: string[];
    };
  };
  markdown: string | null;
  delivery_reason: 'owned' | 'free' | 'credit';
}

function reshapeFull(res: FullBriefResponse): UnlockedBrief {
  const sharpened = (res.sharpened_data as unknown as Sharpened) ?? {
    title: '',
    formal_statement: '',
    independent_variables: [],
    dependent_variables: [],
    proposed_mechanism: { causal_chain: [], key_assumptions: [], known_unknowns: [] },
    falsifiable_predictions: [],
    boundary_conditions: [],
    theoretical_framework: '',
  };
  const panel = (res.panel_data as unknown as Panel) ?? {
    reviews: [],
    meta_review: {
      consensus_score: 0,
      verdict: 'publish_brief',
      key_consensus: [],
      key_disagreements: [],
      critical_path: '',
      final_recommendation: '',
      brief_quality_gate: false,
    } satisfies MetaReview,
  };
  const protocol = (res.protocol_data as unknown as Protocol) ?? {
    protocol_title: '',
    overall_timeline: '',
    overall_budget_estimate: '',
    phases: [],
    phase_1_quick_start: {
      can_start_today: false,
      first_action: '',
      tools_needed: [],
      open_data_sources: [],
    },
  };
  const grounding = {
    evidence_base: (res.grounding_data?.evidence_base as EvidencePaper[]) ?? [],
    counter_evidence:
      (res.grounding_data?.counter_evidence as CounterEvidence[]) ?? [],
    gap_manifest_update: (res.grounding_data?.gap_manifest_update as {
      closed_gaps: string[];
      new_gaps: string[];
      data_available: string[];
    }) ?? { closed_gaps: [], new_gaps: [], data_available: [] },
  };
  return {
    sharpened,
    panel,
    protocol,
    grounding,
    markdown: res.markdown,
    delivery_reason: res.delivery_reason,
  };
}

export default function BriefDetailClient({ teaser }: Props) {
  const t = useTranslations('briefDetailPage');
  const tVerdicts = useTranslations('verdicts');
  const locale = useLocale();
  const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US';
  const safeVerdictLabel = (v: string | null | undefined): string => {
    if (!v) return '—';
    try {
      return tVerdicts(v);
    } catch {
      return v;
    }
  };
  // Default tab + content language follow the page locale.
  // - On /en/, the user landed expecting EN content. Default lang=en and
  //   default tab=recherche (the technical EN content lives there
  //   natively — sharpened.title, formal predictions, references).
  // - On /fr/, default lang=fr and default tab=comprendre (the FR
  //   vulgarisation is the editorial entry point for the FR audience).
  // The user can flip both at any time via the controls.
  const [tab, setTab] = useState<Tab>(locale === 'en' ? 'recherche' : 'comprendre');
  const [lang, setLang] = useState<Lang>(locale === 'en' ? 'en' : 'fr');

  // When the user picks a language whose payload is missing, surface the
  // fallback transparently instead of rendering an empty section. The
  // toggle keeps the user's choice; only the rendered content & labels
  // follow ``effectiveLang``.
  const effectiveLang: Lang = (() => {
    if (lang === 'en' && !teaser.vulgarization_en) return 'fr';
    if (lang === 'fr' && !teaser.vulgarization_fr) return 'en';
    return lang;
  })();
  const showLangFallbackBadge = effectiveLang !== lang;
  const { user, isAuthenticated, isLoading, refresh } = useAuth();
  const [full, setFull] = useState<UnlockedBrief | null>(null);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'error' | 'payment_required'>(
    'idle',
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  const headerTitle = (() => {
    if (effectiveLang === 'en' && teaser.vulgarization_en?.title) {
      return teaser.vulgarization_en.title;
    }
    if (effectiveLang === 'fr' && teaser.vulgarization_fr?.title_fr) {
      return teaser.vulgarization_fr.title_fr;
    }
    return teaser.title;
  })();

  const fetchFull = useCallback(async () => {
    setLoadState('loading');
    setLoadError(null);
    try {
      const res = await api.getFullBrief(teaser.brief_id);
      setFull(reshapeFull(res));
      setLoadState('idle');
      // Refresh credits / free flag after delivery.
      refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        setLoadState('payment_required');
      } else if (err instanceof ApiError && err.status === 401) {
        setLoadState('idle');
        // Trigger the email gate path below.
      } else {
        setLoadState('error');
        setLoadError(
          (err as Error).message || 'Impossible de charger le brief — réessayez.',
        );
      }
    }
  }, [teaser.brief_id, refresh]);

  return (
    <article className="space-y-12">
      {/* HEADER */}
      <header>
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-mono text-mist-500">{teaser.brief_id}</span>
          <span className="text-mist-600">·</span>
          <span className="text-mist-500">
            {new Date(teaser.generated_at).toLocaleDateString(dateLocale, {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 font-medium ${verdictChipClasses(teaser.verdict)}`}
          >
            {safeVerdictLabel(teaser.verdict)}
          </span>

          <div className="ml-auto flex items-center gap-2">
            {showLangFallbackBadge && (
              <span
                className="rounded-full border border-amber-bio/40 bg-amber-bio/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-glow"
                title={
                  lang === 'en'
                    ? 'English vulgarisation is pending for this brief — showing the French version.'
                    : 'La vulgarisation française est en attente pour ce brief — affichage de la version anglaise.'
                }
              >
                {lang === 'en' ? 'FR fallback' : 'EN fallback'}
              </span>
            )}
            <div className="flex rounded-full border border-ink-500 bg-ink-800/60 p-0.5">
              <LangButton active={lang === 'fr'} onClick={() => setLang('fr')}>
                🇫🇷 FR
              </LangButton>
              <LangButton active={lang === 'en'} onClick={() => setLang('en')}>
                🇬🇧 EN
              </LangButton>
            </div>
          </div>
        </div>

        <h1 className="mb-6 font-display text-3xl leading-tight text-mist-100 md:text-5xl">
          {headerTitle}
        </h1>

        {/* Badge épistémique — honnêteté sur le statut du contenu (test users N1.4) */}
        <p className="mb-6 text-xs uppercase tracking-[0.18em] text-mist-500">
          {t('epistemicBadge')}
        </p>

        <DomainBridge
          domainA={teaser.domains[0]}
          domainB={teaser.domains[1] || '—'}
          compact
        />

        <ShareButtons
          title={`${headerTitle} — SPORE`}
          url={`${SITE_URL}/briefs/${teaser.brief_id}`}
          className="mt-6"
        />
      </header>

      {/* TABS */}
      <div className="flex gap-1 rounded-full border border-ink-500 bg-ink-800/60 p-1 w-fit mx-auto md:mx-0">
        <TabButton active={tab === 'comprendre'} onClick={() => setTab('comprendre')}>
          {t('tabUnderstand')}
        </TabButton>
        <TabButton active={tab === 'recherche'} onClick={() => setTab('recherche')}>
          {t('tabResearch')}
        </TabButton>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'comprendre' ? (
          <motion.div
            key={`comprendre-${effectiveLang}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-12"
          >
            <ComprendreTab teaser={teaser} lang={effectiveLang} />
          </motion.div>
        ) : (
          <motion.div
            key={`recherche-${effectiveLang}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-12"
          >
            {/* RECHERCHE tab is gated — show paywall state machine. */}
            {full ? (
              <RechercheSections
                sharpened={full.sharpened}
                panel={full.panel}
                panelEn={teaser.panel_en}
                grounding={full.grounding}
                protocol={full.protocol}
                markdown={full.markdown}
                briefId={teaser.brief_id}
                lang={effectiveLang}
              />
            ) : (
              <>
                <RecherchePreview teaser={teaser} lang={effectiveLang} />
                <PaywallPanel
                  briefId={teaser.brief_id}
                  isAuthenticated={isAuthenticated}
                  isAuthLoading={isLoading}
                  user={user}
                  onUnlock={fetchFull}
                  loadState={loadState}
                  loadError={loadError}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Newsletter capture (N4.1) — visible at the bottom of every brief
          page on both tabs. Source carries the brief id so the analytics
          can attribute future signups to the brief that drove them. */}
      <div className="mt-16 border-t border-ink-500/50 pt-10">
        <NewsletterOptIn
          variant="full"
          source={`brief:${teaser.brief_id}`}
          briefId={teaser.brief_id}
        />
      </div>
    </article>
  );
}

// ── Recherche preview — shown before the unlock CTA ───────────────
//
// Three stacked blocks (TOC, references, panel scores) fed by the
// non-sensitive summary fields denormalised on the teaser. Any block
// whose data isn't available on a given brief (e.g. grounding_degraded
// with zero references) is silently dropped so the preview never
// renders an empty shell.
function RecherchePreview({
  teaser,
  lang,
}: {
  teaser: BriefTeaser;
  lang: Lang;
}) {
  const hasRefs =
    Array.isArray(teaser.references_preview) &&
    teaser.references_preview.length > 0;
  // Prefer the EN panel_preview when the active content language is EN
  // and the EN payload is present. Falls back to FR otherwise.
  const reviewers =
    lang === 'en' && teaser.panel_preview_en
      ? teaser.panel_preview_en
      : teaser.panel_preview;
  const hasPanel = Array.isArray(reviewers) && reviewers.length > 0;
  return (
    <div className="space-y-8">
      <BriefToc />
      {hasRefs && (
        <ReferencesPreview
          refs={teaser.references_preview!}
          total={teaser.references_total ?? teaser.references_preview!.length}
        />
      )}
      {hasPanel && <PanelPreview reviewers={reviewers!} />}
    </div>
  );
}

// TOC entries map to the briefDetailPage.toc_*_title / toc_*_sub key pairs.
// The icon stays in the array; the labels resolve via translations at
// render time so /en gets EN, /fr stays FR.
const TOC_ITEMS: ReadonlyArray<{ icon: string; key: string }> = [
  { icon: '🧩', key: 'hypothesis' },
  { icon: '📚', key: 'stateOfArt' },
  { icon: '🔮', key: 'predictions' },
  { icon: '🧪', key: 'protocol' },
  { icon: '💥', key: 'impactAnalysis' },
  { icon: '🎭', key: 'panel' },
];

function BriefToc() {
  const t = useTranslations('briefDetailPage');
  return (
    <section>
      <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-emerald-glow">
        {t('toc_title')}
      </h3>
      <ul className="space-y-2">
        {TOC_ITEMS.map((item) => (
          <li
            key={item.key}
            className="flex items-start gap-3 rounded-xl border border-ink-500 bg-ink-800/40 px-4 py-3"
          >
            <span className="mt-0.5 text-xl leading-none" aria-hidden>
              {item.icon}
            </span>
            <div>
              <div className="text-sm font-medium text-mist-100">
                {t(`toc_${item.key}_title`)}
              </div>
              <div className="text-xs text-mist-500">
                {t(`toc_${item.key}_sub`)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReferencesPreview({
  refs,
  total,
}: {
  refs: NonNullable<BriefTeaser['references_preview']>;
  total: number;
}) {
  const shown = refs.length;
  const t = useTranslations('briefDetailPage');
  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h3 className="text-xs font-medium uppercase tracking-widest text-emerald-glow">
          {t('references_title')}
        </h3>
        <span className="text-xs text-mist-500">
          {t('references_count', { verified: shown, total })}
        </span>
      </div>
      <ul className="space-y-2">
        {refs.map((r, i) => (
          <li
            key={i}
            className="flex flex-col gap-1 rounded-xl border border-ink-500 bg-ink-800/40 p-4 md:flex-row md:items-baseline md:justify-between md:gap-4"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm text-mist-100 line-clamp-2">{r.title}</p>
              {r.year !== null && (
                <span className="mt-1 inline-block text-xs text-mist-500">
                  {r.year}
                </span>
              )}
            </div>
            {r.doi && (
              <a
                href={`https://doi.org/${r.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block shrink-0 self-start font-mono text-xs text-emerald-glow hover:text-emerald-bio md:self-auto"
              >
                DOI: {r.doi} ↗
              </a>
            )}
          </li>
        ))}
      </ul>
      {total > shown && (
        <p className="mt-3 text-xs text-mist-500">
          {t('references_more', { count: total - shown })}
        </p>
      )}
    </section>
  );
}

function PanelPreview({
  reviewers,
}: {
  reviewers: NonNullable<BriefTeaser['panel_preview']>;
}) {
  const t = useTranslations('briefDetailPage');
  return (
    <section>
      <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-emerald-glow">
        {t('panelHeader_title')}
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {reviewers.map((r, i) => (
          <PanelPreviewCard key={i} reviewer={r} />
        ))}
      </div>
    </section>
  );
}

function PanelPreviewCard({
  reviewer,
}: {
  reviewer: NonNullable<BriefTeaser['panel_preview']>[number];
}) {
  const tPersonas = useTranslations('personas');
  const tVerdicts = useTranslations('verdicts');
  const safe = (ns: ReturnType<typeof useTranslations>, key: string) => {
    if (!key) return '—';
    try {
      return ns(key);
    } catch {
      return key;
    }
  };
  const scoreTone =
    reviewer.score >= 7
      ? 'text-emerald-glow'
      : reviewer.score >= 5
        ? 'text-amber-glow'
        : 'text-red-400';
  return (
    <div className="flex h-full flex-col rounded-xl border border-ink-500 bg-ink-800/40 p-4">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-mist-400">
          {safe(tPersonas, reviewer.persona)}
        </span>
        <span className={`font-display text-2xl ${scoreTone}`}>
          {reviewer.score.toFixed(1)}
        </span>
      </div>
      <span
        className={`mb-2 inline-block w-fit rounded-full px-2 py-0.5 text-[10px] font-medium ${verdictChipClasses(reviewer.verdict)}`}
      >
        {safe(tVerdicts, reviewer.verdict)}
      </span>
      {reviewer.key_point && (
        <p className="mt-auto text-xs leading-relaxed text-mist-300 line-clamp-3">
          {reviewer.key_point}
        </p>
      )}
    </div>
  );
}

// ── Launch mode: email gate only, all briefs free ─────────────────
//
// Two paths:
//   1. not authenticated → EmailGate
//   2. authenticated     → free download CTA
function PaywallPanel({
  briefId,
  isAuthenticated,
  isAuthLoading,
  onUnlock,
  loadState,
  loadError,
}: {
  briefId: string;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  user: { email: string; credits: number; free_brief_used: boolean } | null;
  onUnlock: () => void;
  loadState: 'idle' | 'loading' | 'error' | 'payment_required';
  loadError: string | null;
}) {
  const t = useTranslations('paywall');
  if (isAuthLoading) {
    return (
      <div className="rounded-2xl border border-ink-500 bg-ink-800/40 p-6 text-sm text-mist-400">
        {t('loadingSession')}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <EmailGate
          headline={t('headline')}
          subtext={t('description')}
          cta={t('cta')}
          next={`/briefs/${briefId}`}
        />
        <p className="text-center text-sm text-mist-500">
          {t('magicLinkPrompt')}{' '}
          <Link
            href={`/auth/verify?next=/briefs/${briefId}`}
            className="text-emerald-glow hover:text-emerald-bio"
          >
            {t('requestNewAccess')}
          </Link>
          .
        </p>
      </div>
    );
  }

  // Authenticated → always free during launch
  return (
    <UnlockCta
      headline={t('unlockHeadline')}
      subtext={t('unlockDescription')}
      cta={t('downloadCta')}
      onClick={onUnlock}
      loadState={loadState}
      loadError={loadError}
    />
  );
}

function UnlockCta({
  headline,
  subtext,
  cta,
  onClick,
  loadState,
  loadError,
}: {
  headline: string;
  subtext: string;
  cta: string;
  onClick: () => void;
  loadState: 'idle' | 'loading' | 'error' | 'payment_required';
  loadError: string | null;
}) {
  const t = useTranslations('paywall');
  return (
    <div className="rounded-2xl border border-emerald-bio/40 bg-emerald-bio/5 p-6">
      <h3 className="mb-2 font-display text-xl text-mist-100">{headline}</h3>
      <p className="mb-5 text-sm text-mist-300">{subtext}</p>
      <button
        onClick={onClick}
        disabled={loadState === 'loading'}
        className="rounded-xl bg-emerald-bio px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-emerald-glow disabled:opacity-50"
      >
        {loadState === 'loading' ? t('downloadingShort') : cta}
      </button>
      {loadState === 'error' && (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {loadError}
        </p>
      )}
      {loadState === 'payment_required' && (
        <p className="mt-3 text-sm text-amber-glow">
          {t('quotaExhausted')}{' '}
          <Link href="/pricing" className="underline">
            {t('topUp')}
          </Link>
          .
        </p>
      )}
    </div>
  );
}

// ── Recherche sections (post-unlock) ──────────────────────────────
function RechercheSections({
  sharpened,
  panel,
  panelEn,
  grounding,
  protocol,
  markdown,
  briefId,
  lang,
}: {
  sharpened: Sharpened;
  panel: Panel;
  /** EN translation forwarded from BriefTeaser. When ``lang === 'en'``
   *  and present, this replaces the FR ``panel`` for prose rendering;
   *  scores and tokens come from ``panel`` (canonical) in either case. */
  panelEn?: Panel;
  grounding: UnlockedBrief['grounding'];
  protocol: Protocol;
  markdown: string | null;
  briefId: string;
  lang: Lang;
}) {
  // Pick the locale-appropriate panel for the prose rendering. The
  // numbers and verdicts come from the FR canonical regardless — they
  // are tokens/numbers, not language-dependent.
  const panelForProse = lang === 'en' && panelEn ? panelEn : panel;
  const t = useTranslations('briefDetailPage');
  const tSupport = useTranslations('support_type');
  const tSeverity = useTranslations('severity');
  const safe = (ns: ReturnType<typeof useTranslations>, key: string) => {
    if (!key) return '—';
    try {
      return ns(key);
    } catch {
      return key;
    }
  };
  return (
    <>
      {lang === 'fr' && (
        <div className="rounded-xl border border-amber-bio/30 bg-amber-bio/5 p-4 text-sm text-amber-glow">
          {t('research_translationNotice')}
        </div>
      )}

      <div className="rounded-xl border border-emerald-bio/30 bg-emerald-bio/5 p-4 text-sm text-emerald-glow">
        {t('research_unlocked')}
      </div>

      {/* Panel */}
      <section>
        <h2 className="mb-6 font-display text-2xl text-mist-100">
          {t('research_panelReview')}
        </h2>
        <ReviewerPanel
          reviews={panelForProse.reviews}
          meta={panelForProse.meta_review}
        />
      </section>

      {/* Protocole */}
      <section>
        <h2 className="mb-6 text-xs font-medium uppercase tracking-widest text-emerald-glow">
          {t('research_experimentalProtocol')}
        </h2>
        <ProtocolTimeline protocol={protocol} />
      </section>

      {/* Predictions */}
      {sharpened.falsifiable_predictions?.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-2xl text-mist-100">
            {t('research_falsifiablePredictions')}
          </h2>
          <div className="space-y-4">
            {sharpened.falsifiable_predictions.map((p: Prediction, i: number) => (
              <div
                key={i}
                className="rounded-xl border border-ink-500 bg-ink-800/40 p-5"
              >
                <div className="mb-3 flex items-baseline gap-3">
                  <span className="font-mono text-sm text-emerald-glow">
                    P{i + 1}
                  </span>
                  <p className="text-base font-medium text-mist-100">
                    {p.prediction}
                  </p>
                </div>
                <dl className="grid gap-2 text-sm md:grid-cols-2">
                  <Dt label={t('predictions_quantitativeBound')} value={p.quantitative_bound} />
                  <Dt label={t('predictions_measurementMethod')} value={p.measurement_method} />
                  <Dt label={t('predictions_nullHypothesis')} value={p.null_hypothesis} />
                  <Dt label={t('predictions_statisticalTest')} value={p.statistical_test} />
                </dl>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Evidence base */}
      {grounding.evidence_base?.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-2xl text-mist-100">
            {t('research_evidenceBase')}
          </h2>
          <ul className="space-y-3">
            {grounding.evidence_base.map((p, i) => (
              <li
                key={i}
                className="rounded-xl border border-ink-500 bg-ink-800/40 p-4"
              >
                <div className="mb-1 flex flex-wrap items-baseline gap-2 text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      p.support_type === 'direct'
                        ? 'bg-emerald-bio/15 text-emerald-glow'
                        : p.support_type === 'contradictory'
                          ? 'bg-red-500/15 text-red-400'
                          : 'bg-ink-500 text-mist-300'
                    }`}
                  >
                    {safe(tSupport, p.support_type)}
                  </span>
                  <span className="text-mist-500">{p.year}</span>
                  {p.citation_count !== undefined && (
                    <span className="text-mist-500">
                      · {p.citation_count} citations
                    </span>
                  )}
                </div>
                <h3 className="mb-1 font-medium text-mist-100">{p.title}</h3>
                {p.authors && p.authors.length > 0 && (
                  <p className="mb-1 text-xs text-mist-500">
                    {p.authors.slice(0, 3).join(', ')}
                    {p.authors.length > 3 ? ' et al.' : ''}
                  </p>
                )}
                {p.relevance && (
                  <p className="text-sm text-mist-400">{p.relevance}</p>
                )}
                {p.doi && (
                  <a
                    href={`https://doi.org/${p.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block font-mono text-xs text-emerald-glow hover:text-emerald-bio"
                  >
                    DOI: {p.doi} ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Counter evidence */}
      {grounding.counter_evidence?.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-2xl text-mist-100">
            {t('research_counterEvidence')}
          </h2>
          <ul className="space-y-3">
            {grounding.counter_evidence.map((p, i) => (
              <li
                key={i}
                className="rounded-xl border border-red-500/20 bg-red-500/5 p-4"
              >
                <div className="mb-1 flex items-baseline gap-2 text-xs">
                  <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-red-400">
                    {safe(tSeverity, p.severity)}
                  </span>
                  <span className="text-mist-500">{p.year}</span>
                </div>
                <h3 className="mb-1 font-medium text-mist-100">{p.title}</h3>
                <p className="text-sm text-mist-400">{p.finding}</p>
                {p.doi && (
                  <a
                    href={`https://doi.org/${p.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block font-mono text-xs text-red-400 hover:text-red-300"
                  >
                    DOI: {p.doi} ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Gap manifest */}
      <section>
        <h2 className="mb-4 font-display text-2xl text-mist-100">
          {t('research_residualGaps')}
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <GapBlock
            title={t('research_openGaps')}
            items={grounding.gap_manifest_update?.new_gaps ?? []}
            accent="amber"
          />
          <GapBlock
            title={t('research_availableData')}
            items={grounding.gap_manifest_update?.data_available ?? []}
            accent="emerald"
          />
        </div>
      </section>

      {/* Documents */}
      <section>
        <h2 className="mb-4 font-display text-2xl text-mist-100">
          {t('documents_title')}
        </h2>
        <div className="mb-6 flex flex-wrap gap-3">
          {markdown && (
            <a
              href={`data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`}
              download={`${briefId}.md`}
              className="rounded-full border border-emerald-bio/40 bg-emerald-bio/10 px-4 py-2 text-sm text-emerald-glow transition-colors hover:bg-emerald-bio/20"
            >
              📥 Markdown
            </a>
          )}
        </div>

        {markdown && (
          <details className="group rounded-xl border border-ink-500 bg-ink-800/40 p-5">
            <summary className="cursor-pointer text-sm font-medium text-mist-200 group-open:mb-4">
              {t('documents_viewMarkdown')}
            </summary>
            <div className="prose-bio max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            </div>
          </details>
        )}
      </section>
    </>
  );
}

// ── Comprendre tab (teaser-only) ──────────────────────────────────
//
// FR path uses `vulgarization_fr` which is public. EN path uses
// ``vulgarization_en`` (S7.4 Phase 2 backfill — Nature-grade UK
// translation of every published brief). Both render the same five-
// section layout (hypothesis / why / imagine / concretely / reviewers).
//
// The summary-based fallback at the bottom of this function only fires
// for legacy briefs that have neither vulgarisation payload — at the
// time of writing that is a no-op in production (every public brief
// has at least the FR layer) but the path stays as a safety net.
function ComprendreTab({ teaser, lang }: { teaser: BriefTeaser; lang: Lang }) {
  if (lang === 'en' && teaser.vulgarization_en) {
    const v: VulgarizationEn = teaser.vulgarization_en;
    return (
      <>
        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-emerald-glow">
            The hypothesis in brief
          </h2>
          <p className="text-xl leading-relaxed text-mist-100 font-display">
            {v.hypothesis_in_brief}
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-amber-glow">
            Why it matters
          </h2>
          <div className="rounded-xl border border-amber-bio/20 bg-amber-bio/5 p-6">
            <p className="text-sm text-mist-200 leading-relaxed whitespace-pre-line">
              {v.why_it_matters}
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-cyan-glow">
            Imagine that...
          </h2>
          <div className="rounded-xl border border-cyan-bio/20 bg-cyan-bio/5 p-6">
            <p className="text-base italic text-mist-100 leading-relaxed whitespace-pre-line">
              {v.imagine_that}
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-emerald-glow">
            Concretely
          </h2>
          {v.concretely?.intro && (
            <p className="mb-4 text-sm text-mist-300">{v.concretely.intro}</p>
          )}
          <ol className="space-y-3">
            {[v.concretely?.phase1, v.concretely?.phase2, v.concretely?.phase3]
              .filter(Boolean)
              .map((step, i) => (
                <li
                  key={i}
                  className="flex gap-4 rounded-xl border border-ink-500 bg-ink-800/40 p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-bio/15 font-mono text-sm text-emerald-glow">
                    {i + 1}
                  </span>
                  <p className="text-sm text-mist-300 leading-relaxed">{step}</p>
                </li>
              ))}
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-mist-400">
            What the reviewers say
          </h2>
          <div className="rounded-xl border border-ink-500 bg-ink-800/40 p-6">
            <p className="text-sm text-mist-200 leading-relaxed whitespace-pre-line">
              {v.reviewers_say}
            </p>
          </div>
        </section>
      </>
    );
  }

  if (lang === 'fr' && teaser.vulgarization_fr) {
    const v: VulgarizationFr = teaser.vulgarization_fr;
    return (
      <>
        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-emerald-glow">
            L&apos;hypothèse en quelques mots
          </h2>
          <p className="text-xl leading-relaxed text-mist-100 font-display">
            {v.hypothesis_in_brief}
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-amber-glow">
            Pourquoi c&apos;est important
          </h2>
          <div className="rounded-xl border border-amber-bio/20 bg-amber-bio/5 p-6">
            <p className="text-sm text-mist-200 leading-relaxed whitespace-pre-line">
              {v.why_it_matters}
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-cyan-glow">
            Imaginez que...
          </h2>
          <div className="rounded-xl border border-cyan-bio/20 bg-cyan-bio/5 p-6">
            <p className="text-base italic text-mist-100 leading-relaxed whitespace-pre-line">
              {v.imagine_that}
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-emerald-glow">
            Et concrètement ?
          </h2>
          {v.concretely?.intro && (
            <p className="mb-4 text-sm text-mist-300">{v.concretely.intro}</p>
          )}
          <ol className="space-y-3">
            {[v.concretely?.phase1, v.concretely?.phase2, v.concretely?.phase3]
              .filter(Boolean)
              .map((step, i) => (
                <li
                  key={i}
                  className="flex gap-4 rounded-xl border border-ink-500 bg-ink-800/40 p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-bio/15 font-mono text-sm text-emerald-glow">
                    {i + 1}
                  </span>
                  <p className="text-sm text-mist-300 leading-relaxed">{step}</p>
                </li>
              ))}
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-mist-400">
            Ce que disent les relecteurs
          </h2>
          <div className="rounded-xl border border-ink-500 bg-ink-800/40 p-6">
            <p className="text-sm text-mist-200 leading-relaxed whitespace-pre-line">
              {v.reviewers_say}
            </p>
          </div>
        </section>
      </>
    );
  }

  // Legacy fallback: lang/payload mismatch reaches here only when the
  // brief has neither ``vulgarization_en`` nor ``vulgarization_fr``.
  // Rare in production now that S7.4 Phase 2 backfilled every published
  // brief; kept as a safety net so the page never renders empty.
  const pendingCopy =
    'Data pending — this brief was generated with limited literature access.';

  return (
    <>
      {/* 1. Hypothesis */}
      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-emerald-glow">
          The hypothesis in brief
        </h2>
        <p className="text-xl leading-relaxed text-mist-100 font-display">
          {teaser.formal_statement}
        </p>
      </section>

      {/* 2. Proposed mechanism */}
      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-amber-glow">
          Proposed mechanism
        </h2>
        <div className="rounded-xl border border-amber-bio/20 bg-amber-bio/5 p-6">
          {teaser.mechanism_summary ? (
            <p className="text-sm text-mist-200 leading-relaxed">
              {teaser.mechanism_summary}
            </p>
          ) : (
            <p className="text-sm italic text-mist-400">{pendingCopy}</p>
          )}
        </div>
      </section>

      {/* 3. Novelty assessment */}
      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-cyan-glow">
          Novelty assessment
        </h2>
        <div className="rounded-xl border border-cyan-bio/20 bg-cyan-bio/5 p-6">
          {teaser.novelty_summary ? (
            <>
              <div className="mb-3 flex items-baseline gap-3">
                <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-cyan-glow">
                  <span>Novelty score</span>
                  <NoveltyScoreTooltip />
                </span>
                <span className="font-display text-2xl text-mist-100">
                  {teaser.novelty_summary.score.toFixed(2)}
                </span>
              </div>
              {teaser.novelty_summary.key_difference ? (
                <p className="text-base italic text-mist-100 leading-relaxed">
                  {teaser.novelty_summary.key_difference}
                </p>
              ) : (
                <p className="text-sm italic text-mist-400">
                  Novelty assessment pending — limited literature access during
                  generation.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm italic text-mist-400">
              Novelty assessment pending — limited literature access during
              generation.
            </p>
          )}
        </div>
      </section>

      {/* 4. Experimental roadmap */}
      <section>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-emerald-glow">
          Experimental roadmap
        </h2>
        {teaser.protocol_summary && teaser.protocol_summary.length > 0 ? (
          <ol className="space-y-3">
            {teaser.protocol_summary.map((phase, i) => (
              <li
                key={i}
                className="flex gap-4 rounded-xl border border-ink-500 bg-ink-800/40 p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-bio/15 font-mono text-sm text-emerald-glow">
                  {i + 1}
                </span>
                <div className="text-sm text-mist-300 leading-relaxed">
                  {phase.phase_name && (
                    <div className="mb-1 font-medium text-mist-100">
                      {phase.phase_name}
                    </div>
                  )}
                  {phase.objective && <p>{phase.objective}</p>}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="rounded-xl border border-ink-500 bg-ink-800/40 p-6">
            <p className="text-sm italic text-mist-400">{pendingCopy}</p>
          </div>
        )}
      </section>

      {/* 5. Panel review summary */}
      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-mist-400">
          Panel review summary
        </h2>
        <div className="rounded-xl border border-ink-500 bg-ink-800/40 p-6">
          {teaser.panel_summary ? (
            <>
              <div className="mb-3 flex items-baseline gap-3">
                <span className="font-mono text-xs uppercase tracking-wider text-mist-500">
                  Consensus
                </span>
                <span className="font-display text-2xl text-mist-100">
                  {teaser.panel_summary.consensus_score.toFixed(1)}
                  <span className="text-sm text-mist-500">/10</span>
                </span>
              </div>
              {teaser.panel_summary.final_recommendation && (
                <p className="mb-4 text-sm text-mist-200 leading-relaxed">
                  {teaser.panel_summary.final_recommendation}
                </p>
              )}
              {teaser.panel_summary.key_consensus.length > 0 && (
                <ul className="space-y-1.5 text-sm text-mist-300">
                  {teaser.panel_summary.key_consensus.slice(0, 3).map((p, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-glow">✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="text-sm italic text-mist-400">{pendingCopy}</p>
          )}
        </div>
      </section>

      {/* Gated teaser — reformulated */}
      <section className="rounded-2xl border border-emerald-bio/30 bg-emerald-bio/5 p-6">
        <h3 className="mb-2 font-display text-xl text-mist-100">
          Want the full picture?
        </h3>
        <p className="text-sm text-mist-300">
          The full evidence base, detailed protocol, falsifiable predictions and
          5-persona panel review are inside the{' '}
          <span className="font-medium text-emerald-glow">Research</span> tab.
          The first brief is free.
        </p>
      </section>
    </>
  );
}

// ── Small presentational primitives ───────────────────────────────

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
        active
          ? 'bg-emerald-bio/20 text-emerald-glow shadow-[0_0_20px_rgba(16,185,129,0.15)]'
          : 'text-mist-400 hover:text-mist-100'
      }`}
    >
      {children}
    </button>
  );
}

function LangButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
        active ? 'bg-mist-100/10 text-mist-100' : 'text-mist-500 hover:text-mist-300'
      }`}
    >
      {children}
    </button>
  );
}

function Dt({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-mist-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-mist-200">{value}</dd>
    </div>
  );
}

function GapBlock({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: 'amber' | 'emerald';
}) {
  const tone =
    accent === 'amber'
      ? 'border-amber-bio/20 bg-amber-bio/5 text-amber-glow'
      : 'border-emerald-bio/20 bg-emerald-bio/5 text-emerald-glow';

  return (
    <div className={`rounded-xl border ${tone} p-4`}>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wider">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-mist-500">—</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((g, i) => (
            <li key={i} className="text-xs text-mist-300">
              • {g}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
