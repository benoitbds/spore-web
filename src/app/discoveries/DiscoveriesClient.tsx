'use client';

import { useEffect, useMemo, useState } from 'react';
import EditorialBriefCard from '@/components/EditorialBriefCard';
import type { Brief } from '@/lib/types';

type SortMode = 'panel' | 'novelty' | 'date';

interface Props {
  briefs: Brief[];
  allDomains: string[];
}

/** Lowercased haystack of the fields we want searchable. Memoised per render. */
function briefHaystack(b: Brief): string {
  return [
    b.sharpened?.title,
    b.vulgarization_fr?.title_fr,
    b.vulgarization_fr?.hypothesis_in_brief,
    ...(b.domains ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export default function DiscoveriesClient({ briefs, allDomains }: Props) {
  const [sort, setSort] = useState<SortMode>('panel');
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // 200 ms debounce — avoids re-running the haystack build on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [query]);

  // Pre-compute haystacks once per brief list so the filter is a plain
  // substring check at query time.
  const haystacks = useMemo(
    () => new Map(briefs.map((b) => [b.brief_id, briefHaystack(b)])),
    [briefs],
  );

  const filtered = useMemo(() => {
    let list = briefs;

    if (selectedDomains.size > 0) {
      list = list.filter((b) => b.domains.some((d) => selectedDomains.has(d)));
    }

    if (debouncedQuery) {
      list = list.filter((b) =>
        (haystacks.get(b.brief_id) ?? '').includes(debouncedQuery),
      );
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
  }, [briefs, sort, selectedDomains, debouncedQuery, haystacks]);

  const hasFilter = selectedDomains.size > 0 || debouncedQuery.length > 0;

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
      {/* Search */}
      <div className="relative mb-6">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un domaine, un sujet..."
          aria-label="Rechercher parmi les découvertes"
          className="w-full rounded-2xl border border-ink-500 bg-ink-800/40 py-3.5 pl-11 pr-12 text-sm text-mist-100 placeholder:text-mist-500 transition-colors focus:border-emerald-bio focus:outline-none focus:ring-2 focus:ring-emerald-bio/20"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Effacer la recherche"
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-mist-500 hover:bg-ink-700/60 hover:text-mist-200"
          >
            <IconClose className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

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

        <div className="flex items-center gap-3">
          <span className="text-sm text-mist-400">
            {filtered.length} découverte{filtered.length > 1 ? 's' : ''}
          </span>
          {hasFilter && (
            <button
              onClick={() => {
                setSelectedDomains(new Set());
                setQuery('');
              }}
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
          <p className="text-mist-400">
            Aucune découverte ne correspond à votre recherche.
          </p>
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

function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconClose({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}
