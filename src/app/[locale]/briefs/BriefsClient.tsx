'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import EditorialBriefCard from '@/components/EditorialBriefCard';
import NoveltyScoreTooltip from '@/components/NoveltyScoreTooltip';
import type { Brief } from '@/lib/types';

type SortMode = 'panel' | 'novelty' | 'date';

interface Props {
  briefs: Brief[];
  allDomains: string[];
}

/** Lowercased haystack of the fields we want searchable. Memoised per render.
 *
 * Testers reported that "CO2", "material" or "méthane" returned zero hits
 * because the filter only looked at titles + domain names. The haystack
 * now spans every user-visible text surface in the brief JSON already
 * shipped to the client:
 *
 *   - titles (FR + EN) and domain names
 *   - hypothesis formulations (formal_statement, original, brief)
 *   - FR vulgarisation (imagine_that, why_it_matters, reviewers_say,
 *     concretely.phase1/2/3)
 *   - sharpened technical text (theoretical_framework, mechanism
 *     causal_chain + assumptions + known unknowns, prediction
 *     statements, variable names)
 *   - grounding prose (evidence_base titles + key_finding + relevance,
 *     counter_evidence titles + finding, novelty_assessment
 *     closest_existing_work titles + key_difference)
 *   - protocol (phase_name, objective, methodology, expected_outputs,
 *     required_resources equipment / software / datasets, success
 *     criteria thresholds, quick_start first_action + tools_needed)
 *
 * Domain key_concepts live on the server-side domain map and aren't
 * exported into brief JSONs — skipped. Adding them would require
 * embedding key_concepts into the brief export; not worth the
 * plumbing for 13 briefs, since the adjacent prose almost always
 * surfaces the same concept.
 */
function briefHaystack(b: Brief): string {
  const v = b.vulgarization_fr;
  const s = b.sharpened;
  const mech = s?.proposed_mechanism;
  const concretely = v?.concretely;
  const predictions = (s?.falsifiable_predictions ?? [])
    .map((p) => p.prediction)
    .filter(Boolean);
  const variableNames = [
    ...(s?.independent_variables ?? []),
    ...(s?.dependent_variables ?? []),
  ]
    .map((x) => x?.name)
    .filter(Boolean) as string[];

  const g = b.grounding;
  const evidenceParts = (g?.evidence_base ?? []).flatMap((p) => [
    p.title,
    p.key_finding,
    p.relevance,
  ]);
  const counterParts = (g?.counter_evidence ?? []).flatMap((p) => [
    p.title,
    p.finding,
  ]);
  const closestParts = (
    g?.novelty_assessment?.closest_existing_work ?? []
  ).flatMap((p) => [p.title, p.key_difference]);

  const proto = b.protocol;
  const phaseParts = (proto?.phases ?? []).flatMap((ph) => {
    const rr = ph.required_resources;
    const thresholds = (ph.success_criteria ?? []).map((sc) => sc.threshold);
    return [
      ph.phase_name,
      ph.objective,
      ph.methodology,
      ...(ph.expected_outputs ?? []),
      ...(rr?.equipment ?? []),
      ...(rr?.software ?? []),
      ...(rr?.datasets ?? []),
      ...thresholds,
    ];
  });
  const quickStart = proto?.phase_1_quick_start;
  const quickStartParts = [
    quickStart?.first_action,
    ...(quickStart?.tools_needed ?? []),
  ];

  return [
    // Titles and domain names
    s?.title,
    v?.title_fr,
    ...(b.domains ?? []),
    // Hypothesis formulations
    s?.formal_statement,
    b.original_hypothesis,
    v?.hypothesis_in_brief,
    // FR vulgarisation narrative
    v?.imagine_that,
    v?.why_it_matters,
    v?.reviewers_say,
    concretely?.intro,
    concretely?.phase1,
    concretely?.phase2,
    concretely?.phase3,
    // Sharpened — mechanism prose + framework + predictions
    s?.theoretical_framework,
    ...(mech?.causal_chain ?? []),
    ...(mech?.key_assumptions ?? []),
    ...(mech?.known_unknowns ?? []),
    ...predictions,
    ...variableNames,
    // Grounding — papers, counter-evidence, novelty closest work
    ...evidenceParts,
    ...counterParts,
    ...closestParts,
    // Protocol — phase prose + resources + quick start
    ...phaseParts,
    ...quickStartParts,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export default function BriefsClient({ briefs, allDomains }: Props) {
  const tBriefs = useTranslations('briefsPage');
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
          placeholder={tBriefs('search_placeholder')}
          aria-label={tBriefs('search_aria')}
          className="w-full rounded-2xl border border-ink-500 bg-ink-800/40 py-3.5 pl-11 pr-12 text-sm text-mist-100 placeholder:text-mist-500 transition-colors focus:border-emerald-bio focus:outline-none focus:ring-2 focus:ring-emerald-bio/20"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label={tBriefs('search_clearAria')}
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-mist-500 hover:bg-ink-700/60 hover:text-mist-200"
          >
            <IconClose className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-ink-500 bg-ink-800/40 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-mist-500">{tBriefs('sort_by')}</span>
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
                {tBriefs(`sort_${mode}`)}
              </button>
            ))}
          </div>
          {sort === 'novelty' && <NoveltyScoreTooltip />}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-mist-400">
            {filtered.length === 0
              ? tBriefs('count_zero')
              : filtered.length === 1
                ? tBriefs('count_one', { n: filtered.length })
                : tBriefs('count_other', { n: filtered.length })}
          </span>
          {hasFilter && (
            <button
              onClick={() => {
                setSelectedDomains(new Set());
                setQuery('');
              }}
              className="text-xs text-emerald-glow hover:text-emerald-bio"
            >
              {tBriefs('filter_reset')}
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
            {tBriefs('noResults')}
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
