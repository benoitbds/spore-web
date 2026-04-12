'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DomainBridge from '@/components/DomainBridge';
import ReviewerPanel from '@/components/ReviewerPanel';
import ProtocolTimeline from '@/components/ProtocolTimeline';
import type { Brief } from '@/lib/types';

interface Props {
  brief: Brief;
  markdown: string | null;
}

type Tab = 'comprendre' | 'recherche';

export default function BriefDetailClient({ brief, markdown }: Props) {
  const [tab, setTab] = useState<Tab>('comprendre');

  const { sharpened, domains, grounding, panel, protocol, brief_id, generated_at } = brief;

  return (
    <article className="space-y-12">
      {/* HEADER */}
      <header>
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-mono text-mist-500">{brief_id}</span>
          <span className="text-mist-600">·</span>
          <span className="text-mist-500">
            {new Date(generated_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <span
            className={`ml-auto rounded-full px-2.5 py-1 font-medium ${
              panel.meta_review.verdict === 'publish_brief'
                ? 'border border-emerald-bio/40 bg-emerald-bio/10 text-emerald-glow'
                : panel.meta_review.verdict === 'reject'
                  ? 'border border-red-500/40 bg-red-500/10 text-red-400'
                  : 'border border-amber-bio/40 bg-amber-bio/10 text-amber-glow'
            }`}
          >
            {panel.meta_review.verdict}
          </span>
        </div>

        <h1 className="mb-6 font-display text-3xl leading-tight text-mist-100 md:text-5xl">
          {sharpened.title}
        </h1>

        <DomainBridge
          domainA={domains[0]}
          domainB={domains[1] || '—'}
          compact
        />
      </header>

      {/* TABS */}
      <div className="flex gap-1 rounded-full border border-ink-500 bg-ink-800/60 p-1 w-fit mx-auto md:mx-0">
        <TabButton active={tab === 'comprendre'} onClick={() => setTab('comprendre')}>
          💡 Comprendre
        </TabButton>
        <TabButton active={tab === 'recherche'} onClick={() => setTab('recherche')}>
          🔬 Recherche
        </TabButton>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'comprendre' ? (
          <motion.div
            key="comprendre"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-12"
          >
            {/* Accessible explanation */}
            <section>
              <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-emerald-glow">
                L'hypothèse en quelques mots
              </h2>
              <p className="text-xl leading-relaxed text-mist-100 font-display">
                {sharpened.formal_statement}
              </p>
            </section>

            {/* Mechanism — causal chain */}
            <section>
              <h2 className="mb-6 text-xs font-medium uppercase tracking-widest text-cyan-glow">
                Le mécanisme, étape par étape
              </h2>
              <ol className="space-y-4">
                {sharpened.proposed_mechanism.causal_chain.map((step, i) => (
                  <li
                    key={i}
                    className="flex gap-4 rounded-xl border border-ink-500 bg-ink-800/40 p-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-bio/15 font-mono text-sm text-cyan-glow">
                      {i + 1}
                    </span>
                    <p className="text-sm text-mist-300 leading-relaxed">
                      {step.replace(/^Step \d+:\s*/i, '')}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            {/* Why it matters */}
            <section>
              <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-amber-glow">
                Pourquoi c'est important
              </h2>
              <div className="rounded-xl border border-amber-bio/20 bg-amber-bio/5 p-6">
                <p className="text-sm text-mist-200 leading-relaxed">
                  {panel.meta_review.final_recommendation ||
                    panel.meta_review.critical_path}
                </p>
              </div>
            </section>

            {/* And next? Protocol */}
            <section>
              <h2 className="mb-6 text-xs font-medium uppercase tracking-widest text-emerald-glow">
                Et ensuite ? Comment le tester
              </h2>
              <ProtocolTimeline protocol={protocol} />
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="recherche"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-12"
          >
            {/* Panel */}
            <section>
              <h2 className="mb-6 font-display text-2xl text-mist-100">
                Panel de review
              </h2>
              <ReviewerPanel reviews={panel.reviews} meta={panel.meta_review} />
            </section>

            {/* Predictions */}
            {sharpened.falsifiable_predictions?.length > 0 && (
              <section>
                <h2 className="mb-4 font-display text-2xl text-mist-100">
                  Prédictions falsifiables
                </h2>
                <div className="space-y-4">
                  {sharpened.falsifiable_predictions.map((p, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-ink-500 bg-ink-800/40 p-5"
                    >
                      <div className="mb-3 flex items-baseline gap-3">
                        <span className="font-mono text-sm text-emerald-glow">
                          P{i + 1}
                        </span>
                        <p className="text-base font-medium text-mist-100">
                          {p.prediction}
                        </p>
                      </div>
                      <dl className="grid gap-2 text-sm md:grid-cols-2">
                        <Dt label="Borne quantitative" value={p.quantitative_bound} />
                        <Dt label="Méthode de mesure" value={p.measurement_method} />
                        <Dt label="Hypothèse nulle" value={p.null_hypothesis} />
                        <Dt label="Test statistique" value={p.statistical_test} />
                      </dl>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Evidence base */}
            {grounding.evidence_base?.length > 0 && (
              <section>
                <h2 className="mb-4 font-display text-2xl text-mist-100">
                  Base de preuves
                </h2>
                <ul className="space-y-3">
                  {grounding.evidence_base.map((p, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-ink-500 bg-ink-800/40 p-4"
                    >
                      <div className="mb-1 flex flex-wrap items-baseline gap-2 text-xs">
                        <span
                          className={`rounded-full px-2 py-0.5 ${
                            p.support_type === 'direct'
                              ? 'bg-emerald-bio/15 text-emerald-glow'
                              : p.support_type === 'contradictory'
                                ? 'bg-red-500/15 text-red-400'
                                : 'bg-ink-500 text-mist-300'
                          }`}
                        >
                          {p.support_type}
                        </span>
                        <span className="text-mist-500">{p.year}</span>
                        {p.citation_count !== undefined && (
                          <span className="text-mist-500">
                            · {p.citation_count} citations
                          </span>
                        )}
                      </div>
                      <h3 className="mb-1 font-medium text-mist-100">
                        {p.title}
                      </h3>
                      {p.authors && p.authors.length > 0 && (
                        <p className="mb-1 text-xs text-mist-500">
                          {p.authors.slice(0, 3).join(', ')}
                          {p.authors.length > 3 ? ' et al.' : ''}
                        </p>
                      )}
                      {p.relevance && (
                        <p className="text-sm text-mist-400">{p.relevance}</p>
                      )}
                      {p.doi && (
                        <a
                          href={`https://doi.org/${p.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block font-mono text-xs text-emerald-glow hover:text-emerald-bio"
                        >
                          DOI: {p.doi} ↗
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Counter evidence */}
            {grounding.counter_evidence?.length > 0 && (
              <section>
                <h2 className="mb-4 font-display text-2xl text-mist-100">
                  Contre-preuves
                </h2>
                <ul className="space-y-3">
                  {grounding.counter_evidence.map((p, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-red-500/20 bg-red-500/5 p-4"
                    >
                      <div className="mb-1 flex items-baseline gap-2 text-xs">
                        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-red-400">
                          {p.severity}
                        </span>
                        <span className="text-mist-500">{p.year}</span>
                      </div>
                      <h3 className="mb-1 font-medium text-mist-100">{p.title}</h3>
                      <p className="text-sm text-mist-400">{p.finding}</p>
                      {p.doi && (
                        <a
                          href={`https://doi.org/${p.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block font-mono text-xs text-red-400 hover:text-red-300"
                        >
                          DOI: {p.doi} ↗
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Gap manifest */}
            <section>
              <h2 className="mb-4 font-display text-2xl text-mist-100">
                Gap Manifest résiduel
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                <GapBlock
                  title="Gaps ouverts"
                  items={grounding.gap_manifest_update?.new_gaps ?? []}
                  accent="amber"
                />
                <GapBlock
                  title="Data disponible"
                  items={grounding.gap_manifest_update?.data_available ?? []}
                  accent="emerald"
                />
              </div>
            </section>

            {/* Downloads + full brief */}
            <section>
              <h2 className="mb-4 font-display text-2xl text-mist-100">
                Documents
              </h2>
              <div className="mb-6 flex flex-wrap gap-3">
                {markdown && (
                  <a
                    href={`data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`}
                    download={`${brief_id}.md`}
                    className="rounded-full border border-emerald-bio/40 bg-emerald-bio/10 px-4 py-2 text-sm text-emerald-glow transition-colors hover:bg-emerald-bio/20"
                  >
                    📥 Markdown
                  </a>
                )}
                <a
                  href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(brief, null, 2))}`}
                  download={`${brief_id}.json`}
                  className="rounded-full border border-cyan-bio/40 bg-cyan-bio/10 px-4 py-2 text-sm text-cyan-glow transition-colors hover:bg-cyan-bio/20"
                >
                  📥 JSON
                </a>
              </div>

              {markdown && (
                <details className="group rounded-xl border border-ink-500 bg-ink-800/40 p-5">
                  <summary className="cursor-pointer text-sm font-medium text-mist-200 group-open:mb-4">
                    Afficher le brief complet (markdown)
                  </summary>
                  <div className="prose-bio max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {markdown}
                    </ReactMarkdown>
                  </div>
                </details>
              )}
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
        active
          ? 'bg-emerald-bio/20 text-emerald-glow shadow-[0_0_20px_rgba(16,185,129,0.15)]'
          : 'text-mist-400 hover:text-mist-100'
      }`}
    >
      {children}
    </button>
  );
}

function Dt({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-mist-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-mist-200">{value}</dd>
    </div>
  );
}

function GapBlock({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: 'amber' | 'emerald';
}) {
  const tone =
    accent === 'amber'
      ? 'border-amber-bio/20 bg-amber-bio/5 text-amber-glow'
      : 'border-emerald-bio/20 bg-emerald-bio/5 text-emerald-glow';

  return (
    <div className={`rounded-xl border ${tone} p-4`}>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wider">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-mist-500">—</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((g, i) => (
            <li key={i} className="text-xs text-mist-300">
              • {g}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
