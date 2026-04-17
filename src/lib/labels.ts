/**
 * Centralised display-label dictionary.
 *
 * Back-end tokens (snake_case English) map to user-visible French
 * strings here. Use ``label()`` to get the translation, falling back
 * to the raw token when the key is unknown — so a new backend value
 * never renders as a blank but as its raw identifier.
 *
 * This is the single source of truth for UI copy tied to machine-
 * readable identifiers (status, severity, persona, pipeline step…).
 * Free-form prose stays in its component.
 */

export const LABELS: Record<string, string> = {
  // grounding.evidence_base[].support_type
  direct: 'Direct',
  indirect: 'Indirect',
  analogous: 'Analogue',
  contradictory: 'Contradictoire',
  tangential: 'Tangentiel',

  // grounding.counter_evidence[].severity
  fatal: 'Fatal',
  serious: 'Sérieuse',
  minor: 'Mineure',
  addressable: 'Corrigeable',

  // panel.reviews[].reviewer_persona
  methodologist: 'Méthodologue',
  domain_expert: 'Expert du domaine',
  contrarian: 'Avocat du diable',
  industrialist: 'Industriel',
  funding_strategist: 'Stratège financement',

  // custom_request.status
  pending: 'En attente',
  paid: 'Payé',
  running: 'En cours',
  complete: 'Terminé',
  failed: 'Échoué',

  // pipeline steps (see /how-it-works)
  collision: 'Collision',
  gate: 'Filtre',
  synthesis: 'Synthèse',
  critics: 'Critiques',
  curator: 'Sélection',
  reviewer: 'Relecture',
  literature_grounding: 'Ancrage littérature',
  hypothesis_sharpening: 'Affinage hypothèse',
  protocol: 'Protocole',
  panel: 'Panel (5 relecteurs)',
  research_brief: 'Brief de recherche',

  // misc reusable UI labels
  novelty: 'Nouveauté',
  quick_start: 'Démarrage rapide',
  critical_path: 'Chemin critique',
  full_protocol: 'Protocole complet',
  timeline: 'Calendrier',
  curated: 'Sélectionnées',
};

/**
 * Look up a translation. Returns the mapped French string, or the raw
 * ``key`` as a graceful fallback (so an unknown backend token still
 * renders something rather than an empty string).
 */
export function label(key: string | null | undefined): string {
  if (!key) return '—';
  return LABELS[key] ?? key;
}
