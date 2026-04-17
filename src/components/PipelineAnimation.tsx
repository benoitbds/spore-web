'use client';

import { motion } from 'framer-motion';
import { label } from '@/lib/labels';

interface Step {
  id: string;
  labelKey: string;
  icon: string;
  description: string;
  metric?: string;
  postFire?: boolean;
}

const STEPS: Step[] = [
  { id: 'collision', labelKey: 'collision', icon: '🎲', description: '200 domaines scientifiques. Un tirage aléatoire croise deux d\'entre eux.', metric: '~100 collisions/jour' },
  { id: 'gate', labelKey: 'gate', icon: '🚪', description: 'Un filtre rejette les paires triviales ou déjà explorées.', metric: '30-60% passent' },
  { id: 'synthesis', labelKey: 'synthesis', icon: '🧩', description: 'Un LLM génère un pont causal entre les deux domaines.', metric: '~70% de ponts' },
  { id: 'critics', labelKey: 'critics', icon: '⚔️', description: 'Un avocat du diable et un avocat de l\'ange débattent.', metric: '5 scores produits' },
  { id: 'curator', labelKey: 'curator', icon: '🎯', description: 'Top 15% retenu sur score composite.', metric: 'Top 15%' },
  { id: 'reviewer', labelKey: 'reviewer', icon: '⚖️', description: 'Verdict calibré : rejeté / intéressant / à tester 🔥.', metric: '~15-20% 🔥' },
  { id: 'grounding', labelKey: 'literature_grounding', icon: '📚', description: '8-12 requêtes Semantic Scholar. Zéro hallucination — chaque DOI est vérifié.', metric: '5+ références', postFire: true },
  { id: 'sharpening', labelKey: 'hypothesis_sharpening', icon: '🔬', description: 'Formulation rigoureuse avec variables, prédictions quantitatives, H0, tests statistiques.', postFire: true },
  { id: 'protocol', labelKey: 'protocol', icon: '🧪', description: '3 phases : in silico (€0-2k) → minimal (€2-15k) → full (€15-200k).', postFire: true },
  { id: 'panel', labelKey: 'panel', icon: '🎭', description: 'Méthodologue, expert du domaine, avocat du diable, industriel, stratège financement.', postFire: true },
  { id: 'brief', labelKey: 'research_brief', icon: '📄', description: 'Document publication-ready de 4-6 pages. Markdown + JSON.', postFire: true },
];

export default function PipelineAnimation() {
  return (
    <div className="space-y-4">
      {STEPS.map((step, i) => (
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
              <h3 className="font-display text-xl text-mist-100">{label(step.labelKey)}</h3>
              {step.postFire && (
                <span className="rounded-full border border-amber-bio/40 bg-amber-bio/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-amber-glow">
                  Post 🔥
                </span>
              )}
              {step.metric && (
                <span className="font-mono text-xs text-mist-500">
                  {step.metric}
                </span>
              )}
            </div>
            <p className="text-sm text-mist-400 leading-relaxed">
              {step.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
