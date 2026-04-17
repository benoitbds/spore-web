'use client';

import { motion } from 'framer-motion';
import type { Stats } from '@/lib/types';

function fmtNum(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

interface Props {
  stats: Stats;
  briefCount: number;
  last30: string[];
}

export default function StatsClient({ stats, briefCount, last30 }: Props) {
  const { totals, quality, cost, activity_30d, reviewer_distribution, top_domains } = stats;
  const collisionsMap = new Map(activity_30d.collisions_by_day.map((d) => [d.day, d.count]));
  const briefsMap = new Map(activity_30d.briefs_by_day.map((d) => [d.day, d.count]));
  const activityData = last30.map((day) => ({
    day,
    collisions: collisionsMap.get(day) ?? 0,
    briefs: briefsMap.get(day) ?? 0,
  }));

  const maxCollisions = Math.max(...activityData.map((d) => d.collisions), 1);
  const VERDICT_LABEL: Record<string, string> = {
    a_tester: '🔥 À tester',
    'intéressant': '🤔 Intéressant',
    poubelle: '🗑️ Rejeté',
  };
  const verdicts = Object.entries(reviewer_distribution);
  const totalVerdicts = verdicts.reduce((s, [, n]) => s + n, 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <header className="mb-12">
        <span className="mb-3 inline-block text-xs uppercase tracking-[0.3em] text-emerald-glow">
          Transparence
        </span>
        <h1 className="font-display text-4xl text-mist-100 md:text-6xl">Statistiques</h1>
        <p className="mt-4 max-w-2xl text-lg text-mist-400">
          Mesures publiques de l'activité de SPORE. Mise à jour à chaque run.
        </p>
        <p className="mt-2 text-xs text-mist-500 font-mono">
          Dernière mise à jour : {fmtDate(stats.generated_at)}
        </p>
      </header>

      {/* Top row: headline numbers */}
      <section className="mb-16 grid gap-4 md:grid-cols-4">
        <Metric
          label="Collisions explorées"
          value={fmtNum(totals.collisions)}
        />
        <Metric
          label="Hypothèses générées"
          value={fmtNum(totals.hypotheses)}
        />
        <Metric
          label="🔥 À tester"
          value={fmtNum(totals.fire_hypotheses)}
        />
        <Metric label="Briefs publiés" value={fmtNum(briefCount)} />
      </section>

      {/* Activity chart */}
      <section className="mb-16 rounded-2xl border border-ink-500 bg-ink-800/40 p-6 md:p-8">
        <h2 className="mb-6 font-display text-2xl text-mist-100">
          Activité — 30 derniers jours
        </h2>
        <div className="relative h-56 md:h-64">
          <div className="absolute inset-0 flex items-end gap-1">
            {activityData.map((d, i) => {
              const h = (d.collisions / maxCollisions) * 100;
              return (
                <motion.div
                  key={d.day}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.02 }}
                  className="group relative flex-1 rounded-t bg-emerald-bio/30 hover:bg-emerald-bio/60 transition-colors"
                >
                  {d.briefs > 0 && (
                    <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-amber-glow shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  )}
                  <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink-600 px-2 py-1 text-xs text-mist-100 group-hover:block">
                    {d.day}: {d.collisions} coll. · {d.briefs} briefs
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-6 text-xs text-mist-500">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-emerald-bio/60" />
            Collisions/jour
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-glow" />
            Brief généré
          </span>
        </div>
      </section>

      {/* Quality + cost */}
      <section className="mb-16 grid gap-6 md:grid-cols-3">
        <QualityCard
          label="Nouveauté moyenne"
          value={quality.avg_novelty_score?.toFixed(2) ?? 'N/A'}
          sub="sur /1.0"
        />
        <QualityCard
          label="Consensus du panel"
          value={quality.avg_panel_consensus?.toFixed(1) ?? 'N/A'}
          sub="moyen sur /10"
        />
        <QualityCard
          label="Coût par brief"
          value={cost.per_brief_usd ? `$${cost.per_brief_usd.toFixed(3)}` : 'N/A'}
          sub={`total: $${cost.total_usd.toFixed(2)}`}
        />
      </section>

      {/* Verdict distribution */}
      <section className="mb-16 rounded-2xl border border-ink-500 bg-ink-800/40 p-6 md:p-8">
        <h2 className="mb-6 font-display text-2xl text-mist-100">
          Distribution des verdicts des relecteurs
        </h2>
        {totalVerdicts === 0 ? (
          <p className="text-sm text-mist-400">Aucune donnée.</p>
        ) : (
          <div className="space-y-3">
            {verdicts.map(([verdict, n]) => {
              const pct = (n / totalVerdicts) * 100;
              const color =
                verdict === 'a_tester'
                  ? 'bg-emerald-bio'
                  : verdict === 'poubelle'
                    ? 'bg-red-500'
                    : 'bg-amber-bio';
              return (
                <div key={verdict}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="text-mist-200">
                      {VERDICT_LABEL[verdict] ?? verdict}
                    </span>
                    <span className="font-mono text-mist-500">
                      {n} · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink-500">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                      className={`h-full ${color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Top domains */}
      {top_domains.length > 0 && (
        <section className="mb-16 rounded-2xl border border-ink-500 bg-ink-800/40 p-6 md:p-8">
          <h2 className="mb-6 font-display text-2xl text-mist-100">
            Domaines les plus explorés dans les briefs
          </h2>
          <div className="flex flex-wrap gap-2">
            {top_domains.slice(0, 20).map((d, i) => (
              <span
                key={d.domain}
                className="rounded-full border border-ink-400 bg-ink-700/50 px-3 py-1.5 text-sm text-mist-200"
                style={{
                  opacity: 0.5 + (d.count / top_domains[0].count) * 0.5,
                }}
              >
                {d.domain}
                <span className="ml-2 font-mono text-xs text-emerald-glow">
                  ×{d.count}
                </span>
              </span>
            ))}
          </div>
        </section>
      )}

      <p className="text-center text-xs text-mist-600 font-mono">
        {briefCount} brief{briefCount > 1 ? 's' : ''} sur disque · données agrégées depuis SQLite
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-ink-500 bg-ink-800/40 p-6"
    >
      <div className="text-xs uppercase tracking-widest text-mist-500">{label}</div>
      <div className="mt-2 font-display text-4xl text-mist-100 md:text-5xl">
        {value}
      </div>
    </motion.div>
  );
}

function QualityCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-ink-500 bg-gradient-to-br from-emerald-bio/5 to-transparent p-6">
      <div className="text-xs uppercase tracking-widest text-mist-500">{label}</div>
      <div className="mt-2 font-display text-5xl text-gradient-bio">{value}</div>
      <div className="mt-1 text-xs text-mist-500">{sub}</div>
    </div>
  );
}

