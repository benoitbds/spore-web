// Server-side data loader for research briefs and stats.
// All reads happen at build time (SSG).

import fs from 'node:fs';
import path from 'node:path';
import type { Brief, Stats } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const BRIEFS_DIR = path.join(DATA_DIR, 'briefs');
const STATS_PATH = path.join(DATA_DIR, 'stats.json');

let _cache: Brief[] | null = null;

/**
 * Load all briefs from disk, deduplicated by brief_id.
 * Returns briefs sorted by generated_at descending (most recent first).
 */
export function getAllBriefs(): Brief[] {
  if (_cache) return _cache;

  if (!fs.existsSync(BRIEFS_DIR)) {
    _cache = [];
    return _cache;
  }

  const files = fs.readdirSync(BRIEFS_DIR).filter((f) => f.endsWith('.json'));
  const briefs: Brief[] = [];

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(BRIEFS_DIR, file), 'utf-8');
      const data = JSON.parse(raw) as Brief;
      // Regular briefs carry a full pipeline payload; stub briefs (honest
      // "no bridge" analyses for custom runs) only carry a body_markdown.
      // Accept both shapes.
      const hasPipeline = Boolean(data.sharpened);
      const isStub = Boolean((data as unknown as { is_stub?: boolean }).is_stub);
      if (data.brief_id && (hasPipeline || isStub)) {
        briefs.push(data);
      }
    } catch (err) {
      console.error(`Failed to parse ${file}:`, err);
    }
  }

  briefs.sort((a, b) => (b.generated_at || '').localeCompare(a.generated_at || ''));
  _cache = briefs;
  return _cache;
}

/** Get one brief by ID, or null. */
export function getBriefById(id: string): Brief | null {
  return getAllBriefs().find((b) => b.brief_id === id) ?? null;
}

/** Get the brief to feature at the top of the homepage.
 *
 * Priority order:
 *   1. Most recent brief that has a vulgarization_fr block AND panel
 *      verdict == 'publish_brief'.
 *   2. Most recent brief with a vulgarization_fr block (any verdict).
 *   3. Most recent brief overall (falls back to EN in the UI).
 */
export function getFeaturedBrief(): Brief | null {
  const all = getAllBriefs(); // already sorted by generated_at desc
  if (all.length === 0) return null;

  const published = all.find(
    (b) => b.vulgarization_fr && b.panel?.meta_review?.verdict === 'publish_brief'
  );
  if (published) return published;

  const anyVulg = all.find((b) => b.vulgarization_fr);
  if (anyVulg) return anyVulg;

  return all[0];
}

/** Load the accompanying markdown file for a brief, if it exists. */
export function getBriefMarkdown(id: string): string | null {
  const p = path.join(BRIEFS_DIR, `${id}.md`);
  if (!fs.existsSync(p)) return null;
  try {
    return fs.readFileSync(p, 'utf-8');
  } catch {
    return null;
  }
}

/** Load global stats JSON. */
export function getStats(): Stats | null {
  if (!fs.existsSync(STATS_PATH)) return null;
  try {
    const raw = fs.readFileSync(STATS_PATH, 'utf-8');
    return JSON.parse(raw) as Stats;
  } catch {
    return null;
  }
}

/** Format a brief ID for URLs (same for now, kept for future slugification). */
export function briefToSlug(brief: Brief): string {
  return brief.brief_id;
}

/** Neighbors of a brief in the generated_at-desc ordering used across the UI.
 *
 * `prev` = older brief (lower generated_at).
 * `next` = newer brief (higher generated_at).
 * Both are null at the ends of the list.
 */
export function getBriefNeighbors(
  id: string,
): { prev: Brief | null; next: Brief | null } {
  const all = getAllBriefs(); // generated_at desc
  const idx = all.findIndex((b) => b.brief_id === id);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx + 1 < all.length ? all[idx + 1] : null,
    next: idx - 1 >= 0 ? all[idx - 1] : null,
  };
}
