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
      if (data.brief_id && data.sharpened) {
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

/** Get the most recent brief (highest panel_consensus_score among recent ones). */
export function getFeaturedBrief(): Brief | null {
  const all = getAllBriefs();
  if (all.length === 0) return null;
  // Pick the one with the highest panel consensus among the 5 most recent
  const recent = all.slice(0, 5);
  recent.sort((a, b) => b.panel.meta_review.consensus_score - a.panel.meta_review.consensus_score);
  return recent[0];
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
