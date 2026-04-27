/**
 * Vitest test stub for src/lib/db.ts.
 *
 * Vitest is NOT yet wired into spore-web's package.json — adding the
 * dev dependency + vitest.config.ts is a Phase 2 follow-up. In the
 * meantime, run the standalone validation script:
 *
 *   SPORE_DB_PATH=/home/baq/Projects/spore-poc/data/spore.db \
 *     node --import tsx scripts/validate-db.ts
 *
 * which exercises the same paths against the live database.
 *
 * When vitest lands, this file is ready: replace the live DB pointer
 * with a fresh sqlite tempfile fixture in beforeAll, seed two rows
 * (one pipeline brief, one stub), assert the four functions return the
 * expected shapes, and assert query_only blocks any INSERT attempt.
 */

import { describe, it, expect } from 'vitest';
import { getAllBriefs, getBriefById, getVisibleBriefs, getBriefStats } from '../db';

describe('db.ts', () => {
  it('lists at least one brief from the live database', () => {
    const briefs = getAllBriefs();
    expect(briefs.length).toBeGreaterThan(0);
  });

  it('returns null for unknown brief ids', () => {
    expect(getBriefById('SPR-2026-DOES-NOT-EXIST')).toBeNull();
  });

  it('hydrates a known stub brief', () => {
    const stub = getBriefById('SPR-2026-F577');
    expect(stub).not.toBeNull();
    expect(stub?.is_stub).toBe(1);
    expect(stub?.stub_reason).toBe('no_bridge_found');
  });

  it('produces brief cards with the editorial fields', () => {
    const cards = getVisibleBriefs();
    expect(cards.length).toBeGreaterThan(0);
    for (const c of cards) {
      expect(typeof c.brief_id).toBe('string');
      expect(typeof c.is_stub).toBe('boolean');
    }
  });

  it('computes stats with non-negative counts', () => {
    const s = getBriefStats();
    expect(s.total_briefs).toBeGreaterThanOrEqual(s.stub_briefs);
    expect(s.total_briefs).toBe(s.stub_briefs + s.pipeline_briefs);
    expect(s.total_hypotheses).toBeGreaterThanOrEqual(0);
    expect(s.total_cost_usd).toBeGreaterThanOrEqual(0);
  });
});
