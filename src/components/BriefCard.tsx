'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Brief } from '@/lib/types';

interface BriefCardProps {
  brief: Brief;
  index?: number;
}

function noveltyDots(score: number) {
  const filled = Math.round(score * 5);
  return Array.from({ length: 5 }, (_, i) => i < filled);
}

export default function BriefCard({ brief, index = 0 }: BriefCardProps) {
  const { sharpened, domains, grounding, panel, brief_id, generated_at } = brief;
  const novelty = grounding.novelty_assessment.score;
  const panelScore = panel.meta_review.consensus_score;
  const verdict = panel.meta_review.verdict;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.4) }}
    >
      <Link href={`/discoveries/${brief_id}`} className="block h-full">
        <article className="group relative h-full overflow-hidden rounded-2xl border border-ink-500 bg-ink-800/40 p-6 transition-all duration-500 hover:border-emerald-bio/40 hover:bg-ink-800/70 hover:shadow-[0_0_60px_rgba(16,185,129,0.08)]">
          {/* subtle top gradient */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bio/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Domains */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-bio/30 bg-emerald-bio/5 px-2.5 py-1 text-xs text-emerald-glow">
              {domains[0]}
            </span>
            <span className="text-mist-600">×</span>
            <span className="rounded-full border border-cyan-bio/30 bg-cyan-bio/5 px-2.5 py-1 text-xs text-cyan-glow">
              {domains[1] || '—'}
            </span>
          </div>

          {/* Title */}
          <h3 className="mb-3 font-display text-xl leading-tight text-mist-100 line-clamp-2 transition-colors group-hover:text-white">
            {sharpened.title}
          </h3>

          {/* Formal statement (accessible snippet) */}
          <p className="mb-5 text-sm text-mist-400 line-clamp-3 leading-relaxed">
            {sharpened.formal_statement}
          </p>

          {/* Footer */}
          <div className="mt-auto space-y-3 border-t border-ink-500 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {noveltyDots(novelty).map((filled, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-4 rounded-full transition-all ${
                      filled ? 'bg-emerald-glow' : 'bg-ink-400'
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono text-xs text-mist-500">
                novelty {novelty.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-mist-500">Panel </span>
                <span
                  className={`font-medium ${
                    panelScore >= 7
                      ? 'text-emerald-glow'
                      : panelScore >= 5
                        ? 'text-amber-glow'
                        : 'text-red-400'
                  }`}
                >
                  {panelScore.toFixed(1)}/10
                </span>
              </div>
              <span className="text-mist-500">
                {new Date(generated_at).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-mist-600">
                {brief_id}
              </span>
              <span className="text-xs text-emerald-glow opacity-0 transition-opacity group-hover:opacity-100">
                Lire →
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
