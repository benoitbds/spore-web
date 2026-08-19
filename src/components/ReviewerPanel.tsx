'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { Review, MetaReview } from '@/lib/types';

const PERSONA_META: Record<string, { icon: string; color: string }> = {
  methodologist: { icon: '🔬', color: '#10B981' },
  domain_expert: { icon: '🧪', color: '#06B6D4' },
  contrarian: { icon: '😈', color: '#EF4444' },
  industrialist: { icon: '🏭', color: '#F59E0B' },
  funding_strategist: { icon: '💰', color: '#8B5CF6' },
};

function scoreTone(score: number) {
  if (score >= 7) return 'text-emerald-glow';
  if (score >= 5) return 'text-amber-glow';
  return 'text-red-400';
}

interface ReviewerPanelProps {
  reviews: Review[];
  meta: MetaReview;
}

export default function ReviewerPanel({ reviews, meta }: ReviewerPanelProps) {
  const tPersonas = useTranslations('personas');
  const tVerdicts = useTranslations('verdicts');
  const tPanel = useTranslations('reviewerPanel');
  const safe = (ns: ReturnType<typeof useTranslations>, key: string) => {
    if (!key) return '—';
    try {
      return ns(key);
    } catch {
      return key;
    }
  };
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {reviews.slice(0, 5).map((r, i) => {
          const meta = PERSONA_META[r.reviewer_persona] ?? {
            icon: '👤',
            color: '#71717a',
          };
          const personaLabel = safe(tPersonas, r.reviewer_persona);
          const keyPoint =
            r.strengths[0] || r.recommendation || '';

          return (
            <motion.div
              key={r.reviewer_persona}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative overflow-hidden rounded-xl border border-ink-500 bg-ink-800/60 p-4"
              style={{
                background: `linear-gradient(180deg, ${meta.color}0c 0%, transparent 40%), rgb(17 17 22 / 0.6)`,
              }}
            >
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-2xl">{meta.icon}</span>
                <span
                  className={`font-display text-3xl ${scoreTone(r.overall_score)}`}
                >
                  {r.overall_score.toFixed(1)}
                </span>
              </div>
              <div className="mb-1 text-xs font-medium uppercase tracking-wider text-mist-400">
                {personaLabel}
              </div>
              <div className="mb-2 text-xs text-mist-500">
                {safe(tVerdicts, r.verdict)} · conf {Math.round(r.confidence * 100)}%
              </div>
              {keyPoint && (
                <div className="text-xs leading-relaxed text-mist-300 line-clamp-3">
                  {keyPoint}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="rounded-2xl border border-ink-500 bg-gradient-to-br from-ink-800/80 to-ink-700/30 p-6"
      >
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="md:border-r md:border-ink-500 md:pr-6">
            <div className="text-xs uppercase tracking-widest text-mist-500">
              {tPanel('consensus')}
            </div>
            <div
              className={`font-display text-5xl md:text-6xl ${scoreTone(
                meta.consensus_score,
              )}`}
            >
              {meta.consensus_score.toFixed(1)}
              <span className="text-xl text-mist-500">/10</span>
            </div>
            <div className="mt-1 text-sm font-medium text-mist-300">
              {safe(tVerdicts, meta.verdict)}
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {meta.key_consensus?.length > 0 && (
              <div>
                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-emerald-glow">
                  {tPanel('consensusPoints')}
                </div>
                <ul className="space-y-1 text-sm text-mist-300">
                  {meta.key_consensus.slice(0, 3).map((p, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-glow">✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {meta.critical_path && (
              <div className="border-l-2 border-amber-bio pl-3">
                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-amber-glow">
                  {tPanel('criticalPath')}
                </div>
                <p className="text-sm text-mist-300 leading-relaxed">
                  {meta.critical_path}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
