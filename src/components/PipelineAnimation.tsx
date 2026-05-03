'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface Step {
  id: string;
  icon: string;
  postFire?: boolean;
}

const STEPS: readonly Step[] = [
  { id: 'collision', icon: '🎲' },
  { id: 'gate', icon: '🚪' },
  { id: 'synthesis', icon: '🧩' },
  { id: 'critics', icon: '⚔️' },
  { id: 'curator', icon: '🎯' },
  { id: 'reviewer', icon: '⚖️' },
  { id: 'literature_grounding', icon: '📚', postFire: true },
  { id: 'hypothesis_sharpening', icon: '🔬', postFire: true },
  { id: 'protocol', icon: '🧪', postFire: true },
  { id: 'panel', icon: '🎭', postFire: true },
  { id: 'research_brief', icon: '📄', postFire: true },
];

export default function PipelineAnimation() {
  const t = useTranslations('howItWorks');
  return (
    <div className="space-y-4">
      {STEPS.map((step, i) => {
        const metric = t(`steps.${step.id}.metric`);
        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
            className="relative flex gap-6"
          >
            {/* Node */}
            <div className="relative flex w-16 flex-col items-center">
              <div
                className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 ${
                  step.postFire
                    ? 'border-amber-bio/50 bg-amber-bio/10'
                    : 'border-emerald-bio/50 bg-emerald-bio/10'
                } shadow-[0_0_30px_rgba(16,185,129,0.15)]`}
              >
                <span className="text-2xl">{step.icon}</span>
              </div>
              {/* Connector */}
              {i < STEPS.length - 1 && (
                <div
                  className={`absolute left-1/2 top-14 h-[calc(100%+16px)] w-px -translate-x-1/2 ${
                    step.postFire
                      ? 'bg-gradient-to-b from-amber-bio/40 to-amber-bio/20'
                      : 'bg-gradient-to-b from-emerald-bio/40 to-emerald-bio/20'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="mb-1 flex items-center gap-3">
                <h3 className="font-display text-xl text-mist-100">
                  {t(`steps.${step.id}.title`)}
                </h3>
                {step.postFire && (
                  <span className="rounded-full border border-amber-bio/40 bg-amber-bio/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-amber-glow">
                    {t('postFireBadge')}
                  </span>
                )}
                {metric && (
                  <span className="font-mono text-xs text-mist-500">
                    {metric}
                  </span>
                )}
              </div>
              <p className="text-sm text-mist-400 leading-relaxed">
                {t(`steps.${step.id}.description`)}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
