/**
 * Human-readable labels and tones for the technical verdict strings the
 * SPORE panel / pipeline emits. Used across cards and detail pages so we
 * never show raw `publish_brief` etc. to end users.
 */

export type Verdict =
  | 'publish_brief'
  | 'revise_and_resubmit'
  | 'reject'
  | 'killed'
  | (string & {});

export type VerdictTone = 'emerald' | 'amber' | 'red' | 'mist';

export function verdictLabel(v: string | null | undefined): string {
  switch (v) {
    case 'publish_brief':
      return 'Publié';
    case 'revise_and_resubmit':
      return 'En révision';
    case 'reject':
      return 'Rejeté';
    case 'killed':
      return 'Abandonné';
    default:
      return v ?? '—';
  }
}

export function verdictTone(v: string | null | undefined): VerdictTone {
  switch (v) {
    case 'publish_brief':
      return 'emerald';
    case 'revise_and_resubmit':
      return 'amber';
    case 'reject':
    case 'killed':
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
