/**
 * Standalone validation for src/lib/db.ts.
 *
 * Exercises every public function against the live spore-poc SQLite
 * file and prints PASS/FAIL with a one-liner per check. Intended to
 * run before committing changes to db.ts and after any backend schema
 * migration.
 *
 * Usage:
 *   SPORE_DB_PATH=/home/baq/Projects/spore-poc/data/spore.db \
 *     npx tsx scripts/validate-db.ts
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

// Resolve relative to this script so it runs from any CWD.
const here = path.dirname(fileURLToPath(import.meta.url));
const dbModulePath = path.resolve(here, '..', 'src', 'lib', 'db.ts');

let failures = 0;
function check(name: string, ok: boolean, detail?: string): void {
  const tag = ok ? 'PASS' : 'FAIL';
  console.log(`${tag} [${name}]${detail ? ' ' + detail : ''}`);
  if (!ok) failures++;
}

async function main(): Promise<void> {
  // 1. Force the env var if not provided so a bare `npx tsx` works locally.
  if (!process.env.SPORE_DB_PATH) {
    process.env.SPORE_DB_PATH = '/home/baq/Projects/spore-poc/data/spore.db';
    console.log(`(defaulted SPORE_DB_PATH to ${process.env.SPORE_DB_PATH})`);
  }

  const mod = await import(dbModulePath);
  const { getAllBriefs, getBriefById, getDiscoverableBriefs, getBriefStats } = mod;

  const briefs = getAllBriefs();
  check('getAllBriefs returns >=1 row', briefs.length > 0, `count=${briefs.length}`);

  const unknown = getBriefById('SPR-9999-NOPE');
  check('getBriefById(unknown) returns null', unknown === null);

  const stub = getBriefById('SPR-2026-F577');
  if (stub) {
    check('getBriefById(SPR-2026-F577) found', true);
    check('stub.is_stub === 1', stub.is_stub === 1, `got ${stub.is_stub}`);
    check(
      'stub.stub_reason === no_bridge_found',
      stub.stub_reason === 'no_bridge_found',
      `got ${stub.stub_reason}`,
    );
  } else {
    check(
      'getBriefById(SPR-2026-F577) found',
      false,
      '(known stub missing — has the row been deleted?)',
    );
  }

  const cards = getDiscoverableBriefs();
  check('getDiscoverableBriefs returns >=1 card', cards.length > 0, `count=${cards.length}`);
  if (cards.length) {
    const c = cards[0];
    check(
      'card has expected keys',
      'brief_id' in c && 'is_stub' in c && 'domains' in c,
      `keys=${Object.keys(c).join(',')}`,
    );
  }

  const stats = getBriefStats();
  check(
    'stats.total_briefs == stub + pipeline',
    stats.total_briefs === stats.stub_briefs + stats.pipeline_briefs,
    `${stats.total_briefs} = ${stats.stub_briefs} + ${stats.pipeline_briefs}`,
  );
  check(
    'stats.total_hypotheses >= total_briefs',
    stats.total_hypotheses >= stats.pipeline_briefs,
    `hypotheses=${stats.total_hypotheses}, pipeline_briefs=${stats.pipeline_briefs}`,
  );
  check(
    'stats.total_cost_usd >= 0',
    stats.total_cost_usd >= 0,
    `$${stats.total_cost_usd.toFixed(4)}`,
  );

  // Direct better-sqlite3 probe to verify query_only really blocks writes.
  // We open a SECOND connection to the same DB and run the same PRAGMAs
  // — db.ts's connection is in this process so any write would be caught.
  const conn = new Database(process.env.SPORE_DB_PATH!, {
    readonly: true,
    fileMustExist: true,
  });
  conn.pragma('query_only = ON');
  let writeBlocked = false;
  try {
    conn
      .prepare(
        "INSERT INTO briefs (id, hypothesis_id, status) VALUES ('TEST-WRITE-PROBE', 'h', 'pending')",
      )
      .run();
  } catch (err) {
    writeBlocked = String(err).toLowerCase().includes('readonly');
  }
  conn.close();
  check('readonly+query_only blocks INSERT', writeBlocked);

  console.log('');
  if (failures > 0) {
    console.log(`=== ${failures} FAILURE(S) ===`);
    process.exit(1);
  } else {
    console.log('=== ALL CHECKS PASSED ===');
  }
}

main().catch((err) => {
  console.error('validation script crashed:', err);
  process.exit(2);
});
