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

// ── Stub briefs: body-derived title and excerpt (S2c/C13) ──────────
//
// A stub brief is the honest "this collision produced no bridge"
// analysis. It has no hypothesis, therefore no vulgarisation: the
// vulgarisation agent's prompt presupposes a hypothesis to popularise,
// so anything it wrote for a stub is fabricated (it invented titles
// like « Et si les muscles savaient guérir le cancer ? » for a page
// whose own body explains that no bridge was found).
//
// Every public surface therefore derives a stub's title and excerpt
// from ``body_markdown``, which is already accessible prose. This is a
// STRUCTURAL guarantee, not a consequence of clearing the column: the
// branch fires on ``is_stub`` and returns before the vulgarisation
// chain is ever consulted, so it holds whether the payload is NULL or
// not. Do not reorder it below the vulgarisation lookups.
//
// Bilingual note: there is no ``body_markdown_en`` column, so the EN
// locale derives from the same FR body. Those pages are noindex on EN
// (see briefs/[id]/page.tsx), so snippet language is not an issue yet.

/** First top-level ``# `` heading of a markdown body, or ''. */
export function markdownTitle(md: string | null | undefined): string {
  if (!md) return '';
  for (const rawLine of md.split('\n')) {
    const line = rawLine.trim();
    if (line.startsWith('# ')) return line.slice(2).trim();
  }
  return '';
}

/** First real paragraph of a markdown body — the first non-empty block
 *  that is not a heading, a list item, a quote or a rule. A stub body
 *  opens with ``# Analyse…`` then ``## Pourquoi…`` then the prose, so a
 *  naive first-block read would return a heading. Inline emphasis and
 *  link syntax are stripped so the text is usable in a meta tag. */
export function markdownLead(md: string | null | undefined): string {
  if (!md) return '';
  for (const block of md.split(/\n\s*\n/)) {
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .filter((l) => !/^(#{1,6}\s|[-*+]\s|\d+\.\s|>|\||```|---|===)/.test(l));
    const text = lines.join(' ').trim();
    if (!text) continue;
    return text
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[*_`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return '';
}

/** Title + description for a stub, taken from the body only. Never
 *  reads ``vulgarization_fr`` / ``vulgarization_en``. */
function _stubSummary(brief: Brief) {
  return {
    title: markdownTitle(brief.body_markdown) || brief.sharpened.title || brief.brief_id,
    description:
      markdownLead(brief.body_markdown) || brief.sharpened.formal_statement || '',
  };
}

/** Pick the locale-appropriate vulgarisation prose, falling back across
 *  layers: ``en`` row → ``fr`` row → sharpened formal_statement →
 *  empty. The function returns objects with the same shape the helpers
 *  below need, so each helper just pulls the field it cares about.
 *
 *  Stubs short-circuit to ``_stubSummary`` before any of that. */
function _localisedSummary(brief: Brief, locale: string) {
  if (brief.is_stub) return _stubSummary(brief);
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

/** Card title for a brief — the same stub-first rule as the meta
 *  helpers, but with the cards' cross-language fallback chain for
 *  non-stubs (preferred locale → other locale → sharpened title).
 *
 *  Shared by ``EditorialBriefCard`` and the homepage ``FeaturedHero``
 *  so a stub can never surface a fabricated hypothesis title in a grid
 *  or a hero, whatever the state of the vulgarisation columns. */
export function briefCardTitle(brief: Brief, locale: string): string {
  if (brief.is_stub) return _stubSummary(brief).title;
  const ve = brief.vulgarization_en;
  const vf = brief.vulgarization_fr;
  return (
    (locale === 'en' ? ve?.title : vf?.title_fr) ||
    ve?.title ||
    vf?.title_fr ||
    brief.sharpened.title
  );
}

/** Card hook (the "Imaginez que…" line) for a brief. Stubs get the
 *  first paragraph of their body instead — see ``briefCardTitle``. */
export function briefCardHook(brief: Brief, locale: string): string {
  if (brief.is_stub) return _stubSummary(brief).description;
  const ve = brief.vulgarization_en;
  const vf = brief.vulgarization_fr;
  return (
    (locale === 'en' ? ve?.imagine_that : vf?.imagine_that) ||
    ve?.imagine_that ||
    vf?.imagine_that ||
    brief.sharpened.formal_statement
  );
}
