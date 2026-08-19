'use client';

import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import type { Brief } from '@/lib/types';
import { briefCardHook, briefCardTitle } from '@/lib/seo';

interface Props {
  brief: Brief;
  index?: number;
}

/**
 * Editorial-style card for the homepage grid.
 *
 * Uses the French vulgarization (title_fr + imagine_that) when available,
 * falls back to the academic title + formal statement otherwise. Built
 * for the "grand public" reader: hook first, metrics as secondary detail.
 *
 * S2c/C13-C14 — stub briefs are the exception on both counts: their
 * title and hook come from the Markdown body (never the vulgarisation,
 * which is fabricated for a collision that produced no hypothesis), and
 * their score row is hidden because a stub was never evaluated.
 */
export default function EditorialBriefCard({ brief, index = 0 }: Props) {
  const t = useTranslations('briefCard');
  const tVerdicts = useTranslations('verdicts');
  const locale = useLocale();
  const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US';
  const { domains, grounding, panel, brief_id, generated_at, is_stub } = brief;

  // Cards follow the page locale, falling back across languages when
  // the preferred payload is missing (rare in prod after S7.4 Phase 2).
  // The two-level fallback keeps the card usable for legacy briefs:
  // /en card -> ve.title -> vf.title_fr -> sharpened.title. Stubs skip
  // the vulgarisation entirely — see lib/seo.ts.
  const title = briefCardTitle(brief, locale);
  const hook = briefCardHook(brief, locale);
  // Hook comes in the form "Imaginez que…" — keep the flavour without
  // repeating the lead-in on each card; trim to ~180 chars.
  const hookTrimmed = hook.length > 180 ? hook.slice(0, 177).trimEnd() + '…' : hook;

  // S2c/C14 — the scores rendered here are NOT the DB values: a stub has
  // novelty_score and panel_consensus_score NULL, and briefRowToBrief's
  // defaultGrounding/defaultPanel collapse that to 0, which the card then
  // printed as "nouveauté 0.00 · panel 0.0". A stub was never evaluated;
  // zero is a claim about quality it never earned. The whole row is
  // hidden rather than labelled "non évalué" — the card already carries
  // the `nonProductive` badge, so a second disclaimer is redundant.
  const novelty = grounding.novelty_assessment.score;
  const panelScore = panel.meta_review.consensus_score;
  const isPublished = !is_stub && panel.meta_review.verdict === 'publish_brief';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.07, 0.35) }}
      className={`h-full ${
        is_stub ? 'opacity-60 transition-opacity duration-300 hover:opacity-100' : ''
      }`}
    >
      <Link href={`/briefs/${brief_id}`} className="block h-full">
        <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink-500 bg-ink-800/40 p-7 transition-all duration-500 hover:-translate-y-0.5 hover:border-emerald-bio/50 hover:bg-ink-800/70 hover:shadow-[0_0_80px_rgba(16,185,129,0.10)]">
          {is_stub && (
            <span className="absolute right-4 top-4 rounded-full border border-mist-500/40 bg-ink-900/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-mist-400">
              {t('nonProductive')}
            </span>
          )}
          {/* top accent hairline on hover */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bio/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Domains */}
          <div className="mb-5 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-full border border-emerald-bio/30 bg-emerald-bio/5 px-2.5 py-1 text-emerald-glow">
              {domains[0]}
            </span>
            <span className="text-mist-600">×</span>
            <span className="rounded-full border border-cyan-bio/30 bg-cyan-bio/5 px-2.5 py-1 text-cyan-glow">
              {domains[1] || '—'}
            </span>
          </div>

          {/* Title — editorial serif, large, wraps up to 3 lines */}
          <h3 className="mb-4 font-display text-[1.7rem] leading-[1.12] tracking-tight text-mist-100 line-clamp-3 transition-colors group-hover:text-white">
            {title}
          </h3>

          {/* Hook — imagine_that truncated */}
          <p className="mb-6 text-[0.95rem] leading-relaxed text-mist-300 italic line-clamp-4">
            {hookTrimmed}
          </p>

          {/* Footer — metrics + date */}
          <div className="mt-auto flex items-center justify-between border-t border-ink-500/70 pt-4 text-xs">
            <div className="flex items-center gap-4">
              {!is_stub && (
                <>
                  <span className="flex items-center gap-1.5 text-mist-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-glow" />
                    <span className="font-mono">{t('novelty')} {novelty.toFixed(2)}</span>
                  </span>
                  <span
                    className={`font-mono ${
                      panelScore >= 7
                        ? 'text-emerald-glow'
                        : panelScore >= 5.5
                          ? 'text-amber-glow'
                          : 'text-mist-500'
                    }`}
                  >
                    panel {panelScore.toFixed(1)}
                  </span>
                </>
              )}
              {isPublished && (
                <span className="rounded-full bg-emerald-bio/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-glow">
                  {tVerdicts('publish_brief')}
                </span>
              )}
            </div>
            <time className="text-mist-500" dateTime={generated_at}>
              {new Date(generated_at).toLocaleDateString(dateLocale, {
                day: '2-digit',
                month: 'short',
              })}
            </time>
          </div>

          {/* Read affordance */}
          <div className="mt-4 flex items-center justify-between text-[11px]">
            <span className="font-mono uppercase tracking-widest text-mist-600">
              {brief_id}
            </span>
            <span className="text-emerald-glow opacity-0 transition-opacity group-hover:opacity-100">
              {t('read')}
            </span>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
