'use client';

import { useMemo, useState } from 'react';
import EditorialBriefCard from '@/components/EditorialBriefCard';
import type { Brief } from '@/lib/types';

type SortMode = 'panel' | 'novelty' | 'date';

interface Props {
  briefs: Brief[];
  allDomains: string[];
}

export default function DiscoveriesClient({ briefs, allDomains }: Props) {
  const [sort, setSort] = useState<SortMode>('panel');
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let list = briefs;

    if (selectedDomains.size > 0) {
      list = list.filter((b) => b.domains.some((d) => selectedDomains.has(d)));
    }

    const sorted = [...list];
    if (sort === 'panel') {
      sorted.sort(
        (a, b) =>
          b.panel.meta_review.consensus_score - a.panel.meta_review.consensus_score,
      );
    } else if (sort === 'novelty') {
      sorted.sort(
        (a, b) =>
          b.grounding.novelty_assessment.score -
          a.grounding.novelty_assessment.score,
      );
    } else {
      sorted.sort((a, b) =>
        (b.generated_at || '').localeCompare(a.generated_at || ''),
      );
    }
    return sorted;
  }, [briefs, sort, selectedDomains]);

  const toggleDomain = (d: string) => {
    setSelectedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  };

  return (
    <>
      {/* Filters bar */}
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-ink-500 bg-ink-800/40 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-mist-500">Trier par</span>
          <div className="flex overflow-hidden rounded-full border border-ink-400">
            {(['panel', 'novelty', 'date'] as SortMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setSort(mode)}
                className={`px-4 py-1.5 text-xs font-medium transition-colors ${
                  sort === mode
                    ? 'bg-emerald-bio/20 text-emerald-glow'
                    : 'text-mist-400 hover:text-mist-100'
                }`}
              >
                {mode === 'panel' ? 'Panel' : mode === 'novelty' ? 'Novelty' : 'Date'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-mist-500">
            {filtered.length} / {briefs.length} brief{briefs.length > 1 ? 's' : ''}
          </span>
          {selectedDomains.size > 0 && (
            <button
              onClick={() => setSelectedDomains(new Set())}
              className="text-xs text-emerald-glow hover:text-emerald-bio"
            >
              réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Domain tags */}
      {allDomains.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-2">
          {allDomains.map((d) => {
            const active = selectedDomains.has(d);
            return (
              <button
                key={d}
                onClick={() => toggleDomain(d)}
                className={`rounded-full border px-3 py-1 text-xs transition-all ${
                  active
                    ? 'border-emerald-bio bg-emerald-bio/20 text-emerald-glow'
                    : 'border-ink-400 text-mist-400 hover:border-ink-300 hover:text-mist-200'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-ink-500 bg-ink-800/40 py-16 text-center">
          <p className="text-mist-400">Aucun brief ne correspond aux filtres.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((brief, i) => (
            <EditorialBriefCard key={brief.brief_id} brief={brief} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
