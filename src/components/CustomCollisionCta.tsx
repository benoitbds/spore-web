import Link from 'next/link';

type Variant = 'banner' | 'card';

interface Props {
  headline: string;
  subtext: string;
  cta?: string;
  /** Target href — defaults to /custom but callers may override (e.g. to
   *  point an already-served user at their existing request status). */
  href?: string;
  className?: string;
  /**
   * Visual shape of the CTA.
   *
   * - ``'banner'`` (default): horizontal two-column panel, strong visual
   *   weight. Used below the /discoveries grid and at the bottom of
   *   regular brief pages where the user has a lot of surrounding room.
   * - ``'card'``: vertical stacked layout, narrower max-width. Fits the
   *   article column at the bottom of a stub brief (where the user just
   *   read why the previous collision didn't work — the CTA invites them
   *   to retry with a different domain without dominating the closing).
   */
  variant?: Variant;
}

/**
 * Inline panel inviting the reader to request a custom collision.
 *
 * Rendered below the discoveries grid, at the bottom of brief detail
 * pages (normal AND stub), and wherever else we need to surface the
 * "/custom" path. Visually anchored by the emerald→cyan gradient
 * (SPORE's brand pair) so it reads as a primary CTA without shouting.
 */
export default function CustomCollisionCta({
  headline,
  subtext,
  cta = 'Demander une collision sur mesure →',
  href = '/custom',
  className = '',
  variant = 'banner',
}: Props) {
  const isCard = variant === 'card';
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-emerald-bio/30 bg-gradient-to-br from-emerald-bio/10 via-transparent to-cyan-bio/5 ${isCard ? 'p-6' : 'p-6 md:p-8'} ${className}`}
      aria-label="Demander une collision sur mesure"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bio/50 to-transparent" />

      <div
        className={
          isCard
            ? 'flex flex-col gap-4'
            : 'flex flex-col gap-6 md:flex-row md:items-center md:justify-between'
        }
      >
        <div className={isCard ? '' : 'flex-1'}>
          <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-glow">
            <span aria-hidden>🎯</span> Collision sur mesure
          </div>
          <h2
            className={`mb-2 font-display leading-tight text-mist-100 ${
              isCard ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'
            }`}
          >
            {headline}
          </h2>
          <p
            className={`leading-relaxed text-mist-400 ${
              isCard
                ? 'text-sm'
                : 'max-w-2xl text-sm md:text-base'
            }`}
          >
            {subtext}
          </p>
        </div>

        <Link
          href={href}
          className={`inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-emerald-bio/60 bg-emerald-bio/15 font-semibold text-emerald-glow transition-all hover:bg-emerald-bio/25 hover:shadow-[0_0_40px_rgba(16,185,129,0.25)] ${
            isCard ? 'px-5 py-2.5 text-sm' : 'px-6 py-3 text-sm md:self-auto'
          }`}
        >
          {cta}
        </Link>
      </div>
    </section>
  );
}
