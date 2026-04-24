import 'server-only';

/**
 * SQLite read-only data access for SPORE — Phase 1 of the SSG-to-DB refactor.
 *
 * This module exposes typed read functions backed by ``better-sqlite3``
 * pointing at the same database file the Python backend (spore-poc) writes
 * to. The current frontend pages still read JSON files from disk via
 * ``src/lib/briefs.ts`` — Phase 2 will switch them to call this module
 * directly from React Server Components, killing the static rebuild loop.
 *
 * Safety properties enforced at connection time:
 *   - ``readonly: true`` on the better-sqlite3 driver — opens the DB with
 *     SQLITE_OPEN_READONLY.
 *   - ``PRAGMA query_only = ON`` — runtime guard, any DML/DDL raises.
 *   - ``PRAGMA journal_mode = WAL`` — idempotent; matches the writer
 *     side. Required so reads from this Node process don't block on a
 *     Python writer transaction.
 *   - ``import 'server-only'`` at the top — Next.js will error at build
 *     time if any client component imports from this file.
 */

import path from 'node:path';
import Database, { type Database as BetterSqlite3Database } from 'better-sqlite3';

// ── Environment configuration ─────────────────────────────────────────

const ENV_KEY = 'SPORE_DB_PATH';

function resolveDbPath(): string {
  const raw = process.env[ENV_KEY];
  if (!raw || !raw.trim()) {
    throw new Error(
      `[spore-web/db] ${ENV_KEY} is not set. Point it at the absolute path ` +
        `of the SPORE SQLite file shared with spore-api ` +
        `(e.g. /home/baq/Projects/spore-poc/data/spore.db).`,
    );
  }
  return path.resolve(raw.trim());
}

// ── Singleton connection ─────────────────────────────────────────────

let _db: BetterSqlite3Database | null = null;

function db(): BetterSqlite3Database {
  if (_db) return _db;
  const dbPath = resolveDbPath();
  try {
    const conn = new Database(dbPath, { readonly: true, fileMustExist: true });
    // WAL must be set on the writer side; setting it here when the file is
    // opened readonly is a no-op — the PRAGMA call still succeeds and
    // documents intent. query_only is the actual runtime guard.
    conn.pragma('journal_mode = WAL');
    conn.pragma('query_only = ON');
    conn.pragma('busy_timeout = 5000');
    _db = conn;
    console.info(
      `[spore-web/db] connected ${dbPath} (readonly, query_only=ON, WAL)`,
    );
    return conn;
  } catch (err) {
    console.error(`[spore-web/db] failed to open ${dbPath}:`, err);
    throw err;
  }
}

// ── Types matching the SQLite schema ─────────────────────────────────

/**
 * Raw row shape from the ``briefs`` table after JSON-blob columns are
 * parsed. Mirrors the schema exactly — every nullable SQLite column is
 * typed ``T | null``. JSON columns (``grounding_data``, ``panel_data``,
 * etc.) are decoded to ``unknown`` here; consumers narrow per use case.
 */
export interface BriefRow {
  id: string;
  hypothesis_id: string;
  created_at: string;
  status: string;
  novelty_score: number | null;
  novelty_verdict: string | null;
  evidence_count: number | null;
  counter_evidence_count: number | null;
  kill_reason: string | null;
  formal_statement: string | null;
  prediction_count: number | null;
  phase1_cost_estimate: string | null;
  phase1_duration: string | null;
  can_start_today: number | null;
  panel_consensus_score: number | null;
  panel_verdict: string | null;
  revision_count: number;
  brief_md_path: string | null;
  brief_pdf_path: string | null;
  brief_json_path: string | null;
  grounding_data: unknown;
  sharpened_data: unknown;
  protocol_data: unknown;
  panel_data: unknown;
  vulgarization_data: unknown;
  low_confidence: number;
  low_evidence: number;
  is_stub: number;
  stub_reason: string | null;
}

/**
 * Lightweight card shape for the ``/discoveries`` index. Drops the
 * heavy JSON blobs and exposes only what the editorial card needs.
 */
export interface DiscoveryCard {
  brief_id: string;
  title: string | null;
  imagine_that: string | null;
  domains: string[];
  panel_consensus_score: number | null;
  novelty_score: number | null;
  is_stub: boolean;
  created_at: string;
}

/**
 * Aggregates for the ``/stats`` page.
 */
export interface BriefStats {
  total_briefs: number;
  stub_briefs: number;
  pipeline_briefs: number;
  total_hypotheses: number;
  total_runs_completed: number;
  total_collisions_processed: number;
  total_cost_usd: number;
  panel_verdict_counts: Record<string, number>;
  novelty_verdict_counts: Record<string, number>;
}

// ── Helpers ──────────────────────────────────────────────────────────

const JSON_COLUMNS = [
  'grounding_data',
  'sharpened_data',
  'protocol_data',
  'panel_data',
  'vulgarization_data',
] as const;

function parseJsonColumn(value: unknown): unknown {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function hydrateBriefRow(raw: Record<string, unknown>): BriefRow {
  const out: Record<string, unknown> = { ...raw };
  for (const col of JSON_COLUMNS) {
    out[col] = parseJsonColumn(raw[col]);
  }
  return out as unknown as BriefRow;
}

function readJsonStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string');
  }
  return [];
}

// Domains live in the JSON sidecar file (same directory as the .json the
// runner writes). The DB carries no ``domains`` column; rather than do a
// disk read inside the cards path, we extract them from the parsed
// sharpened_data when present, else from the brief filename's collision
// pair for stubs (which we don't have here — return [] gracefully).
function extractDomainsFromBrief(row: BriefRow): string[] {
  const sharpened = row.sharpened_data as Record<string, unknown> | null;
  if (sharpened && typeof sharpened === 'object') {
    const direct = readJsonStringArray((sharpened as { domains?: unknown }).domains);
    if (direct.length) return direct;
  }
  const grounding = row.grounding_data as Record<string, unknown> | null;
  if (grounding && typeof grounding === 'object') {
    const direct = readJsonStringArray((grounding as { domains?: unknown }).domains);
    if (direct.length) return direct;
  }
  return [];
}

function extractTitle(row: BriefRow): string | null {
  const sharpened = row.sharpened_data as { title?: unknown } | null;
  if (sharpened && typeof sharpened === 'object' && typeof sharpened.title === 'string') {
    return sharpened.title;
  }
  // Stubs carry their title in vulgarization-like shape; fall back to formal_statement.
  if (row.formal_statement) return row.formal_statement;
  return null;
}

function extractImagineThat(row: BriefRow): string | null {
  const v = row.vulgarization_data as { imagine_that?: unknown } | null;
  if (v && typeof v === 'object' && typeof v.imagine_that === 'string') {
    return v.imagine_that;
  }
  return null;
}

// ── Query API ────────────────────────────────────────────────────────

export interface GetAllBriefsOptions {
  /** Include is_stub=1 rows. Defaults to true — stubs are valid briefs. */
  includeStubs?: boolean;
  /** Cap returned rows. Omit for no cap. */
  limit?: number;
  /**
   * Sort key. Default ``'created_at'`` (newest first). Other choices are
   * ``'panel_score'`` (highest panel_consensus_score first, NULLs last)
   * and ``'novelty_score'`` (highest novelty_score first, NULLs last).
   */
  sortBy?: 'created_at' | 'panel_score' | 'novelty_score';
}

/**
 * Returns all visible briefs. A brief is "visible" when it carries
 * a publishable payload — either ``is_stub=1`` (honest no-bridge analysis)
 * or has a hypothesis_id AND status='complete' (full pipeline output).
 * Drafts (status in {pending, grounding, sharpening, reviewing}) and
 * killed rows are excluded.
 */
export function getAllBriefs(options: GetAllBriefsOptions = {}): BriefRow[] {
  const { includeStubs = true, limit, sortBy = 'created_at' } = options;

  const orderBy =
    sortBy === 'panel_score'
      ? 'panel_consensus_score IS NULL, panel_consensus_score DESC, created_at DESC'
      : sortBy === 'novelty_score'
        ? 'novelty_score IS NULL, novelty_score DESC, created_at DESC'
        : 'created_at DESC';

  const stubClause = includeStubs ? '' : 'AND COALESCE(is_stub, 0) = 0';

  const sql = `
    SELECT * FROM briefs
    WHERE (
        (status = 'complete' AND hypothesis_id IS NOT NULL)
        OR COALESCE(is_stub, 0) = 1
    )
    ${stubClause}
    ORDER BY ${orderBy}
    ${limit !== undefined ? 'LIMIT ?' : ''}
  `;

  try {
    const stmt = db().prepare(sql);
    const rows = (limit !== undefined ? stmt.all(limit) : stmt.all()) as Record<
      string,
      unknown
    >[];
    return rows.map(hydrateBriefRow);
  } catch (err) {
    console.error('[spore-web/db] getAllBriefs failed:', err);
    throw err;
  }
}

/**
 * Returns a single brief by SPR-YYYY-XXXX id, or null when not found.
 * Both stub and pipeline briefs resolve through this entry point.
 */
export function getBriefById(id: string): BriefRow | null {
  try {
    const row = db()
      .prepare('SELECT * FROM briefs WHERE id = ?')
      .get(id) as Record<string, unknown> | undefined;
    return row ? hydrateBriefRow(row) : null;
  } catch (err) {
    console.error(`[spore-web/db] getBriefById(${id}) failed:`, err);
    throw err;
  }
}

/**
 * Lightweight cards for ``/discoveries``. Same visibility rules as
 * ``getAllBriefs`` but with only the fields the editorial card needs.
 */
export function getDiscoverableBriefs(): DiscoveryCard[] {
  return getAllBriefs().map((row) => ({
    brief_id: row.id,
    title: extractTitle(row),
    imagine_that: extractImagineThat(row),
    domains: extractDomainsFromBrief(row),
    panel_consensus_score: row.panel_consensus_score,
    novelty_score: row.novelty_score,
    is_stub: row.is_stub === 1,
    created_at: row.created_at,
  }));
}

interface CountRow {
  k: string | null;
  n: number;
}

/**
 * Aggregates for the ``/stats`` page. Replaces the manually-exported
 * ``data/stats.json`` for everything that can be computed from the live
 * DB. Today's ``data/stats.json`` script (``scripts/export_stats.py``)
 * stays in place for fields not yet mirrored here — Phase 2 will
 * deprecate it once the page consumes only this function.
 */
export function getBriefStats(): BriefStats {
  const conn = db();
  try {
    const totalBriefs = (
      conn.prepare(
        `SELECT COUNT(*) AS n FROM briefs
         WHERE (status='complete' AND hypothesis_id IS NOT NULL)
            OR COALESCE(is_stub,0)=1`,
      ).get() as { n: number }
    ).n;

    const stubBriefs = (
      conn.prepare(
        `SELECT COUNT(*) AS n FROM briefs WHERE COALESCE(is_stub,0)=1`,
      ).get() as { n: number }
    ).n;

    const totalHypotheses = (
      conn.prepare('SELECT COUNT(*) AS n FROM hypotheses').get() as { n: number }
    ).n;

    const runsAgg = conn
      .prepare(
        `SELECT
           COUNT(*) AS n,
           COALESCE(SUM(collisions_processed), 0) AS collisions,
           COALESCE(SUM(total_cost_usd), 0.0) AS cost
         FROM runs WHERE status='completed'`,
      )
      .get() as { n: number; collisions: number; cost: number };

    const panelRows = conn
      .prepare(
        `SELECT panel_verdict AS k, COUNT(*) AS n
         FROM briefs
         WHERE panel_verdict IS NOT NULL
         GROUP BY panel_verdict`,
      )
      .all() as CountRow[];

    const noveltyRows = conn
      .prepare(
        `SELECT novelty_verdict AS k, COUNT(*) AS n
         FROM briefs
         WHERE novelty_verdict IS NOT NULL
         GROUP BY novelty_verdict`,
      )
      .all() as CountRow[];

    return {
      total_briefs: totalBriefs,
      stub_briefs: stubBriefs,
      pipeline_briefs: totalBriefs - stubBriefs,
      total_hypotheses: totalHypotheses,
      total_runs_completed: runsAgg.n,
      total_collisions_processed: runsAgg.collisions,
      total_cost_usd: runsAgg.cost,
      panel_verdict_counts: Object.fromEntries(
        panelRows.filter((r) => r.k).map((r) => [r.k as string, r.n]),
      ),
      novelty_verdict_counts: Object.fromEntries(
        noveltyRows.filter((r) => r.k).map((r) => [r.k as string, r.n]),
      ),
    };
  } catch (err) {
    console.error('[spore-web/db] getBriefStats failed:', err);
    throw err;
  }
}
