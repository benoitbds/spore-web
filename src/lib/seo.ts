/**
 * SEO constants and helpers used by the layout, sitemap, robots, and
 * every page's generateMetadata. Centralised so the canonical origin
 * lives in one place.
 */

import type { Brief } from './types';

export const SITE_URL = 'https://spore-research.com';

export const SITE_NAME = 'SPORE';

export const SITE_TAGLINE =
  "SPORE — Le moteur d'hypothèses interdisciplinaires";

export const SITE_DESCRIPTION =
  "SPORE génère des hypothèses scientifiques interdisciplinaires inédites par " +
  "croisement de domaines, ancrées sur de la littérature vérifiée.";

/** Trim a string to `max` chars, breaking at word boundaries when possible. */
export function truncate(text: string | undefined | null, max: number): string {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const base = lastSpace > max - 30 ? cut.slice(0, lastSpace) : cut;
  return base.trimEnd() + '…';
}

/**
 * Normalize a timestamp string to ISO 8601 UTC format.
 * Idempotent: returns input unchanged if already ISO with timezone marker.
 *
 * Handles:
 * - "2026-04-22 07:18:11" (SQLite CURRENT_TIMESTAMP, UTC by contract)
 *   → "2026-04-22T07:18:11Z"
 * - "2026-04-22T07:18:11.123Z" (Node.js toISOString())
 *   → unchanged
 * - "2026-04-22T07:18:11+02:00" (any ISO with offset)
 *   → unchanged
 */
export function toIsoUtc(timestamp: string): string {
  if (/T.*[Zz]|T.*[+-]\d{2}:\d{2}/.test(timestamp)) {
    return timestamp;
  }
  return timestamp.replace(' ', 'T') + 'Z';
}

/** The description text to use in meta tags for a brief — FR vulgarisation first. */
export function briefMetaDescription(brief: Brief): string {
  const v = brief.vulgarization_fr;
  const candidate =
    v?.why_it_matters ||
    v?.hypothesis_in_brief ||
    brief.sharpened.formal_statement ||
    '';
  return truncate(candidate, 155);
}

/** Longer description (OpenGraph allows more than Google SERP). */
export function briefOgDescription(brief: Brief): string {
  const v = brief.vulgarization_fr;
  const candidate =
    v?.why_it_matters ||
    v?.hypothesis_in_brief ||
    brief.sharpened.formal_statement ||
    '';
  return truncate(candidate, 200);
}

/** The title to use in meta tags for a brief — FR vulgarisation first. */
export function briefMetaTitle(brief: Brief): string {
  return brief.vulgarization_fr?.title_fr || brief.sharpened.title;
}
