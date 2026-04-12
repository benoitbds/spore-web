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

export interface Brief {
  brief_id: string;
  generated_at: string;
  domains: string[];
  original_hypothesis: string;
  grounding: Grounding;
  sharpened: Sharpened;
  protocol: Protocol;
  panel: Panel;
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
