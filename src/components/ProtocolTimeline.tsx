'use client';

import { motion } from 'framer-motion';
import type { Protocol } from '@/lib/types';

const PHASE_META: Record<number, { icon: string; label: string; gradient: string; border: string }> = {
  1: {
    icon: '💻',
    label: 'In Silico',
    gradient: 'from-emerald-bio/20 to-transparent',
    border: 'border-emerald-bio/40',
  },
  2: {
    icon: '🧪',
    label: 'Minimal',
    gradient: 'from-amber-bio/20 to-transparent',
    border: 'border-amber-bio/40',
  },
  3: {
    icon: '🏗️',
    label: 'Protocole complet',
    gradient: 'from-cyan-bio/20 to-transparent',
    border: 'border-cyan-bio/40',
  },
};

interface ProtocolTimelineProps {
  protocol: Protocol;
  compact?: boolean;
}

export default function ProtocolTimeline({ protocol, compact = false }: ProtocolTimelineProps) {
  return (
    <div className="space-y-6">
      {!compact && (
        <div className="flex flex-wrap items-center gap-4 text-sm text-mist-400">
          <span>
            <span className="text-mist-500">Calendrier : </span>
            <span className="font-medium text-mist-100">{protocol.overall_timeline}</span>
          </span>
          <span className="text-mist-600">·</span>
          <span>
            <span className="text-mist-500">Budget: </span>
            <span className="font-medium text-mist-100">{protocol.overall_budget_estimate}</span>
          </span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {protocol.phases.map((phase, idx) => {
          const meta = PHASE_META[phase.phase_number] ?? PHASE_META[1];
          return (
            <motion.div
              key={phase.phase_number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className={`relative rounded-xl border ${meta.border} bg-gradient-to-br ${meta.gradient} bg-ink-800/40 p-5`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{meta.icon}</span>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-mist-500">
                      Phase {phase.phase_number}
                    </div>
                    <div className="text-sm font-medium text-mist-100">
                      {meta.label}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3 space-y-1 text-xs">
                <div className="flex items-baseline gap-2">
                  <span className="text-mist-500">Coût</span>
                  <span className="font-medium text-mist-200">
                    {phase.required_resources.estimated_cost}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-mist-500">Durée</span>
                  <span className="font-medium text-mist-200">
                    {phase.required_resources.estimated_duration}
                  </span>
                </div>
              </div>

              <p className="mb-3 text-xs leading-relaxed text-mist-400 line-clamp-3">
                {phase.objective}
              </p>

              {!compact && phase.go_nogo_decision && (
                <div className="space-y-1.5 border-t border-ink-500 pt-3 text-xs">
                  <div>
                    <span className="font-medium text-emerald-glow">GO:</span>{' '}
                    <span className="text-mist-400 line-clamp-2">
                      {phase.go_nogo_decision.go_if}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-red-400">NO-GO:</span>{' '}
                    <span className="text-mist-400 line-clamp-2">
                      {phase.go_nogo_decision.nogo_if}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {!compact && protocol.phase_1_quick_start?.can_start_today && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-emerald-bio/30 bg-emerald-bio/5 p-4"
        >
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-emerald-glow">
            🚀 Démarrage rapide
          </div>
          <p className="text-sm text-mist-200">
            {protocol.phase_1_quick_start.first_action}
          </p>
        </motion.div>
      )}
    </div>
  );
}
