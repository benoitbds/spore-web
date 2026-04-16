'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import DomainBridge from '@/components/DomainBridge';
import ReviewerPanel from '@/components/ReviewerPanel';
import ProtocolTimeline from '@/components/ProtocolTimeline';
import ShareButtons from '@/components/ShareButtons';
import EmailGate from '@/components/EmailGate';
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
} from '@/lib/types';
import { verdictLabel, verdictChipClasses } from '@/lib/verdicts';
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
  const [tab, setTab] = useState<Tab>('comprendre');
  const [lang, setLang] = useState<Lang>('fr');
  const { user, isAuthenticated, isLoading, refresh } = useAuth();
  const [full, setFull] = useState<UnlockedBrief | null>(null);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'error' | 'payment_required'>(
    'idle',
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  const headerTitle =
    lang === 'fr' && teaser.vulgarization_fr?.title_fr
      ? teaser.vulgarization_fr.title_fr
      : teaser.title;

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
            {new Date(teaser.generated_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 font-medium ${verdictChipClasses(teaser.verdict)}`}
          >
            {verdictLabel(teaser.verdict)}
          </span>

          <div className="ml-auto flex rounded-full border border-ink-500 bg-ink-800/60 p-0.5">
            <LangButton active={lang === 'fr'} onClick={() => setLang('fr')}>
              🇫🇷 FR
            </LangButton>
            <LangButton active={lang === 'en'} onClick={() => setLang('en')}>
              🇬🇧 EN
            </LangButton>
          </div>
        </div>

        <h1 className="mb-6 font-display text-3xl leading-tight text-mist-100 md:text-5xl">
          {headerTitle}
        </h1>

        <DomainBridge
          domainA={teaser.domains[0]}
          domainB={teaser.domains[1] || '—'}
          compact
        />

        <ShareButtons
          title={`${headerTitle} — SPORE`}
          url={`${SITE_URL}/discoveries/${teaser.brief_id}`}
          className="mt-6"
        />
      </header>

      {/* TABS */}
      <div className="flex gap-1 rounded-full border border-ink-500 bg-ink-800/60 p-1 w-fit mx-auto md:mx-0">
        <TabButton active={tab === 'comprendre'} onClick={() => setTab('comprendre')}>
          💡 Comprendre
        </TabButton>
        <TabButton active={tab === 'recherche'} onClick={() => setTab('recherche')}>
          🔬 Recherche
        </TabButton>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'comprendre' ? (
          <motion.div
            key={`comprendre-${lang}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-12"
          >
            <ComprendreTab teaser={teaser} lang={lang} />
          </motion.div>
        ) : (
          <motion.div
            key={`recherche-${lang}`}
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
                grounding={full.grounding}
                protocol={full.protocol}
                markdown={full.markdown}
                deliveryReason={full.delivery_reason}
                briefId={teaser.brief_id}
                lang={lang}
              />
            ) : (
              <PaywallPanel
                briefId={teaser.brief_id}
                isAuthenticated={isAuthenticated}
                isAuthLoading={isLoading}
                user={user}
                onUnlock={fetchFull}
                loadState={loadState}
                loadError={loadError}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

// ── Paywall state machine ─────────────────────────────────────────
//
// Four paths depending on auth + credits state:
//   1. not authenticated            → EmailGate + "free first brief" pitch
//   2. authenticated, free unused   → "Download free" CTA
//   3. authenticated, credits > 0   → "Download (1 credit)" CTA
//   4. authenticated, credits == 0  → "Buy brief" CTA → Stripe checkout
function PaywallPanel({
  briefId,
  isAuthenticated,
  isAuthLoading,
  user,
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
  const [buyError, setBuyError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);

  async function buyThisBrief() {
    setBuying(true);
    setBuyError(null);
    try {
      const { checkout_url } = await api.createCheckout({
        type: 'single',
        brief_id: briefId,
      });
      window.location.href = checkout_url;
    } catch (err) {
      setBuying(false);
      setBuyError((err as Error).message || 'Erreur de paiement');
    }
  }

  if (isAuthLoading) {
    return (
      <div className="rounded-2xl border border-ink-500 bg-ink-800/40 p-6 text-sm text-mist-400">
        Chargement de votre session…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <EmailGate
          headline="Accédez au brief scientifique complet"
          subtext="Panel de review (5 personas), base de preuves, contre-preuves, protocole expérimental, prédictions falsifiables. Le 1er brief est offert."
          cta="Recevoir mon accès"
        />
        <p className="text-center text-sm text-mist-500">
          Déjà un compte ? Utilisez votre dernier lien magique ou{' '}
          <Link
            href={`/auth/verify?next=/discoveries/${briefId}`}
            className="text-emerald-glow hover:text-emerald-bio"
          >
            redemandez un accès
          </Link>
          .
        </p>
      </div>
    );
  }

  // Authenticated paths
  if (user && !user.free_brief_used) {
    return (
      <UnlockCta
        headline="🎁 Votre 1er brief est offert"
        subtext="Une seule fois, sans carte. Les briefs suivants utilisent vos crédits ou un achat ponctuel (9 €)."
        cta="Télécharger gratuitement"
        onClick={onUnlock}
        loadState={loadState}
        loadError={loadError}
      />
    );
  }

  if (user && user.credits > 0) {
    return (
      <UnlockCta
        headline="Télécharger le brief complet"
        subtext={`Utilise 1 de vos ${user.credits} crédit${user.credits > 1 ? 's' : ''}. Re-téléchargements gratuits ensuite.`}
        cta="Télécharger (1 crédit)"
        onClick={onUnlock}
        loadState={loadState}
        loadError={loadError}
      />
    );
  }

  // Out of credits → buy path
  return (
    <div className="space-y-4 rounded-2xl border border-ink-500 bg-ink-800/40 p-6">
      <h3 className="font-display text-xl text-mist-100">
        Achat du brief complet
      </h3>
      <p className="text-sm text-mist-400">
        Brief unitaire : 9 € · ou pack 5 briefs à 29 € (5,80 €/brief) sur la{' '}
        <Link href="/pricing" className="text-emerald-glow hover:text-emerald-bio">
          page pricing
        </Link>
        .
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={buyThisBrief}
          disabled={buying}
          className="rounded-xl bg-emerald-bio px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-emerald-glow disabled:opacity-50"
        >
          {buying ? 'Redirection…' : 'Acheter ce brief — 9 €'}
        </button>
        <Link
          href="/pricing"
          className="rounded-xl border border-ink-500 bg-ink-900 px-5 py-3 text-sm text-mist-200 hover:text-mist-100"
        >
          Voir les packs
        </Link>
      </div>
      {buyError && (
        <p className="text-sm text-red-400" role="alert">
          {buyError}
        </p>
      )}
    </div>
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
  return (
    <div className="rounded-2xl border border-emerald-bio/40 bg-emerald-bio/5 p-6">
      <h3 className="mb-2 font-display text-xl text-mist-100">{headline}</h3>
      <p className="mb-5 text-sm text-mist-300">{subtext}</p>
      <button
        onClick={onClick}
        disabled={loadState === 'loading'}
        className="rounded-xl bg-emerald-bio px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-emerald-glow disabled:opacity-50"
      >
        {loadState === 'loading' ? 'Chargement…' : cta}
      </button>
      {loadState === 'error' && (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {loadError}
        </p>
      )}
      {loadState === 'payment_required' && (
        <p className="mt-3 text-sm text-amber-glow">
          Votre quota est épuisé.{' '}
          <Link href="/pricing" className="underline">
            Recharger
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
  grounding,
  protocol,
  markdown,
  deliveryReason,
  briefId,
  lang,
}: {
  sharpened: Sharpened;
  panel: Panel;
  grounding: UnlockedBrief['grounding'];
  protocol: Protocol;
  markdown: string | null;
  deliveryReason: 'owned' | 'free' | 'credit';
  briefId: string;
  lang: Lang;
}) {
  return (
    <>
      {lang === 'fr' && (
        <div className="rounded-xl border border-amber-bio/30 bg-amber-bio/5 p-4 text-sm text-amber-glow">
          Traduction non disponible — contenu original en anglais.
        </div>
      )}

      <div className="rounded-xl border border-emerald-bio/30 bg-emerald-bio/5 p-4 text-sm text-emerald-glow">
        ✅ Brief débloqué ({deliveryReasonLabel(deliveryReason)}). Vous pouvez
        re-télécharger sans frais à tout moment.
      </div>

      {/* Panel */}
      <section>
        <h2 className="mb-6 font-display text-2xl text-mist-100">
          Panel de review
        </h2>
        <ReviewerPanel reviews={panel.reviews} meta={panel.meta_review} />
      </section>

      {/* Protocole */}
      <section>
        <h2 className="mb-6 text-xs font-medium uppercase tracking-widest text-emerald-glow">
          Protocole expérimental
        </h2>
        <ProtocolTimeline protocol={protocol} />
      </section>

      {/* Predictions */}
      {sharpened.falsifiable_predictions?.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-2xl text-mist-100">
            Prédictions falsifiables
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
                  <Dt label="Borne quantitative" value={p.quantitative_bound} />
                  <Dt label="Méthode de mesure" value={p.measurement_method} />
                  <Dt label="Hypothèse nulle" value={p.null_hypothesis} />
                  <Dt label="Test statistique" value={p.statistical_test} />
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
            Base de preuves
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
                    {p.support_type}
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
            Contre-preuves
          </h2>
          <ul className="space-y-3">
            {grounding.counter_evidence.map((p, i) => (
              <li
                key={i}
                className="rounded-xl border border-red-500/20 bg-red-500/5 p-4"
              >
                <div className="mb-1 flex items-baseline gap-2 text-xs">
                  <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-red-400">
                    {p.severity}
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
          Gap Manifest résiduel
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <GapBlock
            title="Gaps ouverts"
            items={grounding.gap_manifest_update?.new_gaps ?? []}
            accent="amber"
          />
          <GapBlock
            title="Data disponible"
            items={grounding.gap_manifest_update?.data_available ?? []}
            accent="emerald"
          />
        </div>
      </section>

      {/* Documents */}
      <section>
        <h2 className="mb-4 font-display text-2xl text-mist-100">Documents</h2>
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
              Afficher le brief complet (markdown)
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

function deliveryReasonLabel(r: 'owned' | 'free' | 'credit'): string {
  switch (r) {
    case 'owned':
      return 'déjà débloqué';
    case 'free':
      return 'offert — 1er brief';
    case 'credit':
      return '1 crédit utilisé';
  }
}

// ── Comprendre tab (teaser-only) ──────────────────────────────────
//
// FR path uses `vulgarization_fr` which is intended to be public. EN
// path falls back to a short preview (title + formal_statement) and a
// gentle nudge to try the Recherche tab. No gated fields leak here.
function ComprendreTab({ teaser, lang }: { teaser: BriefTeaser; lang: Lang }) {
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
            Ce que disent les reviewers
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

  // EN path or missing vulgarization_fr: minimal teaser + CTA.
  return (
    <>
      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-emerald-glow">
          The hypothesis in brief
        </h2>
        <p className="text-xl leading-relaxed text-mist-100 font-display">
          {teaser.formal_statement}
        </p>
      </section>

      <section className="rounded-2xl border border-emerald-bio/30 bg-emerald-bio/5 p-6">
        <h3 className="mb-2 font-display text-xl text-mist-100">
          Mechanism, protocol, reviewers — gated
        </h3>
        <p className="text-sm text-mist-300">
          The step-by-step mechanism, the experimental protocol, the 5-persona
          panel review and the evidence base are inside the{' '}
          <span className="font-medium text-emerald-glow">Recherche</span> tab.
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
