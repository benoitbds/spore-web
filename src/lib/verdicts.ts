/**
 * Human-readable labels and tones for the technical verdict strings the
 * SPORE panel / pipeline emits. Used across cards and detail pages so we
 * never show raw `publish_brief` etc. to end users.
 *
 * Covers:
 *  - Panel meta-review verdicts: publish_brief, revise_and_resubmit,
 *    reject, killed.
 *  - Individual reviewer verdicts: strong_accept, accept, weak_accept,
 *    weak_reject, reject.
 *  - Novelty verdicts (from grounding.novelty_assessment): novel,
 *    incremental, already_explored, already_proven.
 */

export type Verdict =
  | 'publish_brief'
  | 'revise_and_resubmit'
  | 'reject'
  | 'killed'
  | 'strong_accept'
  | 'accept'
  | 'weak_accept'
  | 'weak_reject'
  | (string & {});

export type VerdictTone = 'emerald' | 'amber' | 'red' | 'mist';

const VERDICT_LABELS: Record<string, string> = {
  // Panel meta-review
  publish_brief: 'Publié',
  revise_and_resubmit: 'À réviser',
  reject: 'Rejeté',
  killed: 'Abandonné',
  // Individual reviewer verdicts
  strong_accept: 'Fortement accepté',
  accept: 'Accepté',
  weak_accept: 'Accepté avec réserves',
  weak_reject: 'Réserves',
  // Novelty assessment
  novel: 'Inédit',
  incremental: 'Incrémental',
  already_explored: 'Déjà exploré',
  already_proven: 'Déjà démontré',
};

export function verdictLabel(v: string | null | undefined): string {
  if (!v) return '—';
  return VERDICT_LABELS[v] ?? v;
}

export function verdictTone(v: string | null | undefined): VerdictTone {
  switch (v) {
    case 'publish_brief':
    case 'strong_accept':
    case 'accept':
    case 'novel':
      return 'emerald';
    case 'revise_and_resubmit':
    case 'weak_accept':
    case 'incremental':
      return 'amber';
    case 'reject':
    case 'weak_reject':
    case 'killed':
    case 'already_explored':
    case 'already_proven':
      return 'red';
    default:
      return 'mist';
  }
}

/** Tailwind chip classes per tone. Safe for client or server components. */
export function verdictChipClasses(v: string | null | undefined): string {
  const tone = verdictTone(v);
  switch (tone) {
    case 'emerald':
      return 'border border-emerald-bio/40 bg-emerald-bio/10 text-emerald-glow';
    case 'amber':
      return 'border border-amber-bio/40 bg-amber-bio/10 text-amber-glow';
    case 'red':
      return 'border border-red-500/40 bg-red-500/10 text-red-400';
    default:
      return 'border border-ink-400 bg-ink-800/40 text-mist-400';
  }
}

/** Set of technical verdict strings that should never leak into SEO copy. */
const TECHNICAL_VERDICTS: ReadonlySet<string> = new Set(
  Object.keys(VERDICT_LABELS),
);

/** True if ``v`` is a known internal verdict token (so we can filter it out). */
export function isTechnicalVerdict(v: string | null | undefined): boolean {
  return typeof v === 'string' && TECHNICAL_VERDICTS.has(v);
}
