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

/** Pick the locale-appropriate vulgarisation prose, falling back across
 *  layers: ``en`` row → ``fr`` row → sharpened formal_statement →
 *  empty. The function returns objects with the same shape the helpers
 *  below need, so each helper just pulls the field it cares about. */
function _localisedSummary(brief: Brief, locale: string) {
  const ve = brief.vulgarization_en;
  const vf = brief.vulgarization_fr;
  const fallbackSharpened = brief.sharpened.formal_statement || '';
  if (locale === 'en' && ve) {
    return {
      title: ve.title || brief.sharpened.title,
      description:
        ve.why_it_matters ||
        ve.hypothesis_in_brief ||
        fallbackSharpened,
    };
  }
  if (vf) {
    return {
      title: vf.title_fr || brief.sharpened.title,
      description:
        vf.why_it_matters ||
        vf.hypothesis_in_brief ||
        fallbackSharpened,
    };
  }
  return {
    title: brief.sharpened.title,
    description: fallbackSharpened,
  };
}

/** The description text to use in meta tags for a brief.
 *
 * Locale-aware: prefers ``vulgarization_en.why_it_matters`` when locale
 * is 'en' and the EN payload exists; otherwise falls back to the FR
 * payload, then to the sharpened formal_statement.
 */
export function briefMetaDescription(brief: Brief, locale: string = 'fr'): string {
  return truncate(_localisedSummary(brief, locale).description, 155);
}

/** Longer description (OpenGraph allows more than Google SERP). */
export function briefOgDescription(brief: Brief, locale: string = 'fr'): string {
  return truncate(_localisedSummary(brief, locale).description, 200);
}

/** The title to use in meta tags for a brief — locale-aware. */
export function briefMetaTitle(brief: Brief, locale: string = 'fr'): string {
  return _localisedSummary(brief, locale).title;
}
