// TypeScript types for SPORE research briefs.
// Matches the JSON schema produced by agents/research_brief_generator.py.

export interface PaperReference {
  paper_id: string;
  title: string;
  doi: string | null;
  year: number | null;
  authors?: string[];
}

export interface EvidencePaper extends PaperReference {
  citation_count?: number;
  support_type: 'direct' | 'indirect' | 'analogous' | 'contradictory' | string;
  relevance?: string;
  key_finding?: string;
}

export interface CounterEvidence extends PaperReference {
  finding: string;
  severity: 'fatal' | 'serious' | 'minor' | 'addressable' | string;
}

export interface ClosestWork extends PaperReference {
  similarity: string;
  key_difference: string;
}

export interface NoveltyAssessment {
  score: number;
  verdict: 'novel' | 'incremental' | 'already_explored' | 'already_proven' | string;
  closest_existing_work: ClosestWork[];
}

export interface Grounding {
  novelty_assessment: NoveltyAssessment;
  evidence_base: EvidencePaper[];
  counter_evidence: CounterEvidence[];
  gap_manifest_update: {
    closed_gaps: string[];
    new_gaps: string[];
    data_available: string[];
  };
  search_queries: { query: string; type: string; rationale?: string }[];
}

export interface Variable {
  name: string;
  type: string;
  range?: string;
  unit?: string;
  expected_direction?: string;
}

export interface Prediction {
  prediction: string;
  quantitative_bound: string;
  measurement_method: string;
  null_hypothesis: string;
  statistical_test: string;
}

export interface BoundaryCondition {
  condition: string;
  justification: string;
}

export interface Sharpened {
  title: string;
  formal_statement: string;
  independent_variables: Variable[];
  dependent_variables: Variable[];
  proposed_mechanism: {
    causal_chain: string[];
    key_assumptions: string[];
    known_unknowns: string[];
  };
  falsifiable_predictions: Prediction[];
  boundary_conditions: BoundaryCondition[];
  theoretical_framework: string;
}

export interface ProtocolPhase {
  phase_number: number;
  phase_name: string;
  objective: string;
  methodology: string;
  required_resources: {
    equipment?: string[];
    software?: string[];
    datasets?: string[];
    competences?: string[];
    estimated_cost: string;
    estimated_duration: string;
  };
  expected_outputs: string[];
  success_criteria: { metric: string; threshold: string; measurement?: string }[];
  go_nogo_decision: {
    go_if: string;
    nogo_if: string;
    pivot_if?: string;
  };
  risks?: { risk: string; probability: string; mitigation: string }[];
}

export interface Protocol {
  protocol_title: string;
  overall_timeline: string;
  overall_budget_estimate: string;
  phases: ProtocolPhase[];
  phase_1_quick_start: {
    can_start_today: boolean;
    first_action: string;
    tools_needed: string[];
    open_data_sources: string[];
  };
}

export type ReviewerPersona =
  | 'methodologist'
  | 'domain_expert'
  | 'contrarian'
  | 'industrialist'
  | 'funding_strategist';

export interface Review {
  reviewer_persona: ReviewerPersona | string;
  overall_score: number;
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  critical_questions: string[];
  recommendation: string;
  confidence: number;
  funding_programs?: {
    program: string;
    agency: string;
    fit_score?: number;
    typical_budget?: string;
    success_rate?: string;
    next_deadline?: string;
    rationale: string;
  }[];
}

export interface MetaReview {
  consensus_score: number;
  verdict: 'publish_brief' | 'revise_and_resubmit' | 'reject' | string;
  key_consensus: string[];
  key_disagreements: string[];
  critical_path: string;
  final_recommendation: string;
  brief_quality_gate: boolean;
  revision_guidance?: string[];
}

export interface Panel {
  reviews: Review[];
  meta_review: MetaReview;
}

export interface VulgarizationFr {
  title_fr: string;
  hypothesis_in_brief: string;
  why_it_matters: string;
  imagine_that: string;
  concretely: {
    intro: string;
    phase1: string;
    phase2: string;
    phase3: string;
  };
  reviewers_say: string;
}

export interface Brief {
  brief_id: string;
  generated_at: string;
  domains: string[];
  original_hypothesis: string;
  grounding: Grounding;
  sharpened: Sharpened;
  protocol: Protocol;
  panel: Panel;
  vulgarization_fr?: VulgarizationFr;
}

/**
 * Public subset of a Brief rendered without auth.
 *
 * Everything gated behind the paywall (panel reviews, evidence base,
 * counter evidence, predictions, protocol, mechanism, markdown, JSON
 * download) MUST NOT appear on this type — it becomes part of the
 * `__NEXT_DATA__` JSON shipped to the client.
 */
export interface BriefTeaser {
  brief_id: string;
  generated_at: string;
  domains: string[];
  title: string;            // sharpened.title (English)
  formal_statement: string; // sharpened.formal_statement — the one-liner
  verdict: string;          // panel.meta_review.verdict (for the chip only)
  vulgarization_fr?: VulgarizationFr;

  // ── EN "Comprendre" summaries ───────────────────────────────────
  // Denormalised, non-sensitive extracts from the full brief used to
  // build a structured EN view of the public tab. None of these
  // expose gated content (no DOIs, no full reviewer breakdown, no
  // quantitative predictions) — they're headline summaries.
  mechanism_summary?: string;
  novelty_summary?: { score: number; key_difference: string } | null;
  protocol_summary?: Array<{ phase_name: string; objective: string }>;
  panel_summary?: {
    final_recommendation: string;
    consensus_score: number;
    key_consensus: string[];
  };
}

export function briefToTeaser(b: Brief): BriefTeaser {
  const causalChain = b.sharpened.proposed_mechanism?.causal_chain ?? [];
  const mechanism_summary = causalChain.slice(0, 2).join(' ').trim() || undefined;

  const nov = b.grounding?.novelty_assessment;
  const novelty_summary = nov
    ? {
        score: nov.score ?? 0,
        key_difference:
          nov.closest_existing_work?.[0]?.key_difference ?? '',
      }
    : null;

  const protocol_summary = (b.protocol?.phases ?? [])
    .slice(0, 3)
    .map((p) => ({
      phase_name: p.phase_name,
      objective: p.objective,
    }))
    .filter((p) => p.phase_name || p.objective);

  const meta = b.panel?.meta_review;
  const panel_summary = meta
    ? {
        final_recommendation: meta.final_recommendation ?? '',
        consensus_score: meta.consensus_score ?? 0,
        key_consensus: meta.key_consensus ?? [],
      }
    : undefined;

  return {
    brief_id: b.brief_id,
    generated_at: b.generated_at,
    domains: b.domains,
    title: b.sharpened.title,
    formal_statement: b.sharpened.formal_statement,
    verdict: b.panel.meta_review.verdict,
    vulgarization_fr: b.vulgarization_fr,
    mechanism_summary,
    novelty_summary,
    protocol_summary: protocol_summary.length > 0 ? protocol_summary : undefined,
    panel_summary,
  };
}

// Summary stats (from export_stats.py)
export interface Stats {
  generated_at: string;
  totals: {
    collisions: number;
    hypotheses: number;
    curated: number;
    fire_hypotheses: number;
    briefs: number;
  };
  quality: {
    avg_novelty_score: number | null;
    avg_panel_consensus: number | null;
    fire_rate: number;
  };
  cost: {
    total_usd: number;
    per_brief_usd: number | null;
  };
  activity_30d: {
    collisions_by_day: { day: string; count: number }[];
    briefs_by_day: { day: string; count: number }[];
  };
  reviewer_distribution: Record<string, number>;
  top_domains: { domain: string; count: number }[];
}
