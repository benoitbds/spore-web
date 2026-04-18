import Link from 'next/link';

interface Props {
  headline: string;
  subtext: string;
  cta?: string;
  /** Target href — defaults to /custom but callers may override (e.g. to
   *  point an already-served user at their existing request status). */
  href?: string;
  className?: string;
}

/**
 * Inline panel inviting the reader to request a custom collision.
 *
 * Rendered below the discoveries grid and at the bottom of each brief
 * detail page — both contexts where users are engaged with existing
 * discoveries and most likely to want their own. Visually anchored by
 * the emerald→cyan gradient (SPORE's brand pair) so it reads as a
 * primary CTA without shouting, and collapses from a two-column row
 * to a stacked block on narrow viewports.
 */
export default function CustomCollisionCta({
  headline,
  subtext,
  cta = 'Demander une collision sur mesure →',
  href = '/custom',
  className = '',
}: Props) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-emerald-bio/30 bg-gradient-to-br from-emerald-bio/10 via-transparent to-cyan-bio/5 p-6 md:p-8 ${className}`}
      aria-label="Demander une collision sur mesure"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bio/50 to-transparent" />

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-glow">
            <span aria-hidden>🎯</span> Collision sur mesure
          </div>
          <h2 className="mb-2 font-display text-2xl leading-tight text-mist-100 md:text-3xl">
            {headline}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-mist-400 md:text-base">
            {subtext}
          </p>
        </div>

        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-emerald-bio/60 bg-emerald-bio/15 px-6 py-3 text-sm font-semibold text-emerald-glow transition-all hover:bg-emerald-bio/25 hover:shadow-[0_0_40px_rgba(16,185,129,0.25)] md:self-auto"
        >
          {cta}
        </Link>
      </div>
    </section>
  );
}
