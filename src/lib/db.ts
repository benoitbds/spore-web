import 'server-only';

/**
 * SQLite read-only data access for SPORE — Phase 1 of the SSG-to-DB refactor.
 *
 * This module exposes typed read functions backed by ``better-sqlite3``
 * pointing at the same database file the Python backend (spore-poc) writes
 * to. It is the single source of truth for every read path in the
 * frontend since Phase 2 (PR #3 removed the legacy JSON loader + the
 * static rebuild loop).
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
import {
  briefToTeaser,
  type Brief,
  type BriefTeaser,
  type Grounding,
  type Sharpened,
  type Protocol,
  type Panel,
  type VulgarizationFr,
  type VulgarizationEn,
  type Stats,
} from './types';

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
  /** S7.4 Phase 1+2: Nature-grade EN translation of vulgarization_data.
   *  NULL on rows that pre-date the translation script run. */
  vulgarization_data_en: unknown;
  low_confidence: number;
  low_evidence: number;
  is_stub: number;
  stub_reason: string | null;
  /** Phase 2 mirror of outputs/briefs/{id}.md. May be NULL on rows
   *  that pre-date the migration and haven't been backfilled. */
  body_markdown: string | null;
}

/**
 * Lightweight card shape for the ``/briefs`` index. Drops the
 * heavy JSON blobs and exposes only what the editorial card needs.
 */
export interface BriefCard {
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
  'vulgarization_data_en',
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
 * Lightweight cards for ``/briefs``. Same visibility rules as
 * ``getAllBriefs`` but with only the fields the editorial card needs.
 */
export function getVisibleBriefs(): BriefCard[] {
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

// ── Adapters: BriefRow → existing nested Brief / BriefTeaser ─────────
//
// The rest of the codebase (pages, components) consumes the nested
// ``Brief`` shape from src/lib/types.ts — the contract set when briefs
// were JSON files on disk. Rather than refactor every consumer, this
// adapter reconstructs the nested shape from the flat ``BriefRow``.

function asObjectOrNull(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

function defaultGrounding(): Grounding {
  return {
    novelty_assessment: { score: 0, verdict: 'novel', closest_existing_work: [] },
    evidence_base: [],
    counter_evidence: [],
    gap_manifest_update: { closed_gaps: [], new_gaps: [], data_available: [] },
    search_queries: [],
  };
}

function defaultSharpened(): Sharpened {
  return {
    title: '',
    formal_statement: '',
    independent_variables: [],
    dependent_variables: [],
    proposed_mechanism: { causal_chain: [], key_assumptions: [], known_unknowns: [] },
    falsifiable_predictions: [],
    boundary_conditions: [],
    theoretical_framework: '',
  };
}

function defaultProtocol(): Protocol {
  return {
    protocol_title: '',
    overall_timeline: '',
    overall_budget_estimate: '',
    phases: [],
    phase_1_quick_start: {
      can_start_today: false,
      first_action: '',
      tools_needed: [],
      open_data_sources: [],
    },
  };
}

function defaultPanel(): Panel {
  return {
    reviews: [],
    meta_review: {
      consensus_score: 0,
      verdict: 'reject',
      key_consensus: [],
      key_disagreements: [],
      critical_path: '',
      final_recommendation: '',
      brief_quality_gate: false,
    },
  };
}

/**
 * Reconstruct the nested ``Brief`` shape consumed by existing components
 * from a flat ``BriefRow``. Defensive: missing or corrupted JSON blobs
 * collapse to safe defaults rather than throwing — a partially-broken
 * brief should still render the unbroken parts of the page instead of
 * tripping the whole route to 500.
 *
 * Includes ``body_markdown`` as a non-standard top-level extension that
 * Phase 2 consumers (the Markdown rendering path) can read without a
 * disk fallback. When body_markdown is NULL on a not-yet-backfilled
 * row, the field is omitted (consumers should guard for it).
 */
export interface BriefWithBody extends Brief {
  body_markdown?: string;
  is_stub?: boolean;
  stub_reason?: string | null;
}

function extractMarkdownTitle(md: string | null): string {
  if (!md) return '';
  for (const rawLine of md.split('\n')) {
    const line = rawLine.trim();
    if (line.startsWith('# ')) return line.slice(2).trim();
  }
  return '';
}

export function briefRowToBrief(row: BriefRow): BriefWithBody {
  const grounding = (asObjectOrNull(row.grounding_data) as unknown as Grounding | null) ?? defaultGrounding();
  // sharpened_data can legitimately be a partial object — stubs only
  // carry ``{domains: [...]}`` there. Shallow-merge with the full default
  // so downstream card code never reads ``undefined.formal_statement``.
  const sharpenedRaw = asObjectOrNull(row.sharpened_data) as unknown as Partial<Sharpened> | null;
  const sharpened: Sharpened = { ...defaultSharpened(), ...(sharpenedRaw ?? {}) };
  const protocol = (asObjectOrNull(row.protocol_data) as unknown as Protocol | null) ?? defaultProtocol();
  const panel = (asObjectOrNull(row.panel_data) as unknown as Panel | null) ?? defaultPanel();

  // Stub briefs don't have sharpened_data but their body_markdown
  // starts with a ``# ...`` line that the old JSON path surfaced as
  // ``title``. Hydrate sharpened.title from there so consumers that
  // read brief.sharpened.title (neighbor links, metadata) don't get
  // an empty string for stubs.
  if (row.is_stub === 1 && !sharpened.title) {
    sharpened.title = extractMarkdownTitle(row.body_markdown);
  }

  const vulgRaw = asObjectOrNull(row.vulgarization_data);
  const vulgarization_fr = vulgRaw
    ? (vulgRaw as unknown as VulgarizationFr)
    : undefined;

  const vulgEnRaw = asObjectOrNull(row.vulgarization_data_en);
  const vulgarization_en = vulgEnRaw
    ? (vulgEnRaw as unknown as VulgarizationEn)
    : undefined;

  // Domains live inside the JSON sidecars — most often on the panel /
  // protocol or in the original_hypothesis blob. We surface a best-effort
  // list from sharpened_data.domains then grounding_data.domains; fall
  // back to an empty array for stubs and pre-Phase-2 rows.
  const domainsFromSharpened = asStringArray(
    (asObjectOrNull(row.sharpened_data) ?? {}).domains,
  );
  const domainsFromGrounding = asStringArray(
    (asObjectOrNull(row.grounding_data) ?? {}).domains,
  );
  const domains = domainsFromSharpened.length
    ? domainsFromSharpened
    : domainsFromGrounding;

  // ``original_hypothesis`` lives in the JSON file but not in any DB
  // column. The Markdown body is now in body_markdown so we don't need
  // to recover original_hypothesis for the rendering path; expose an
  // empty string for type completeness.
  const result: BriefWithBody = {
    brief_id: row.id,
    generated_at: row.created_at,
    domains,
    original_hypothesis: '',
    grounding,
    sharpened,
    protocol,
    panel,
    vulgarization_fr,
    vulgarization_en,
    is_stub: row.is_stub === 1,
    stub_reason: row.stub_reason,
  };
  if (row.body_markdown !== null) {
    result.body_markdown = row.body_markdown;
  }
  return result;
}

/**
 * Direct DB → BriefTeaser projection. Reuses the existing
 * ``briefToTeaser`` so the public-vs-paywall split stays in one place.
 */
export function briefRowToTeaser(row: BriefRow): BriefTeaser {
  return briefToTeaser(briefRowToBrief(row));
}

/**
 * Same as ``getVisibleBriefs`` but built on top of the adapter so
 * the card shape stays in lockstep with what ``EditorialBriefCard``
 * consumes. The Phase 1 helper still exists for read-paths that don't
 * need the full Brief reshape.
 */
export function getBriefsViaAdapter(): BriefWithBody[] {
  return getAllBriefs().map(briefRowToBrief);
}

// ── Featured + neighbors ─────────────────────────────────────────────

// ── Stats (replacement for briefs.ts::getStats) ─────────────────────

interface RunAggRow {
  runs: number;
  collisions: number;
  cost: number;
}

interface CountByDayRow {
  day: string;
  count: number;
}

/**
 * Computes the full ``Stats`` shape that ``StatsClient`` and
 * ``how-it-works`` consume from a single SQLite read. Replaces
 * ``briefs.ts::getStats()`` which used to read ``data/stats.json``
 * produced by the manual ``export_stats.py`` script.
 *
 * Every aggregate is a straight SQL query against the live DB —
 * no disk reads, no caching beyond the shared singleton connection.
 * Returns null only when the briefs table is empty (fresh install).
 */
export function getStats(): Stats | null {
  const conn = db();
  try {
    const totalBriefs = (
      conn.prepare(
        `SELECT COUNT(*) AS n FROM briefs
         WHERE (status='complete' AND hypothesis_id IS NOT NULL)
            OR COALESCE(is_stub,0)=1`,
      ).get() as { n: number }
    ).n;

    if (totalBriefs === 0) return null;

    const totalHypotheses = (
      conn.prepare('SELECT COUNT(*) AS n FROM hypotheses').get() as { n: number }
    ).n;

    const curatedCount = (
      conn
        .prepare(`SELECT COUNT(*) AS n FROM hypotheses WHERE status='curated'`)
        .get() as { n: number }
    ).n;

    // ``fire_hypotheses``: reviewer verdict 'a_tester' lives inside the
    // auto_feedback_json blob. Mirror what dashboard.py does — LIKE on
    // the raw JSON for speed. False positives on the literal token
    // inside a free-text field are astronomically rare in practice.
    const fireCount = (
      conn
        .prepare(
          `SELECT COUNT(*) AS n FROM hypotheses
           WHERE auto_feedback_json LIKE '%a_tester%'`,
        )
        .get() as { n: number }
    ).n;

    const totalReviewed = (
      conn
        .prepare(
          `SELECT COUNT(*) AS n FROM hypotheses
           WHERE auto_feedback_json IS NOT NULL`,
        )
        .get() as { n: number }
    ).n;

    const runsAgg = conn
      .prepare(
        `SELECT
           COUNT(*) AS runs,
           COALESCE(SUM(collisions_processed), 0) AS collisions,
           COALESCE(SUM(total_cost_usd), 0.0) AS cost
         FROM runs WHERE status='completed'`,
      )
      .get() as RunAggRow;

    const avgNovelty = (
      conn
        .prepare(
          `SELECT AVG(novelty_score) AS v FROM briefs
           WHERE novelty_score IS NOT NULL`,
        )
        .get() as { v: number | null }
    ).v;

    const avgPanel = (
      conn
        .prepare(
          `SELECT AVG(panel_consensus_score) AS v FROM briefs
           WHERE panel_consensus_score IS NOT NULL`,
        )
        .get() as { v: number | null }
    ).v;

    // Activity by day — 30 days back. DATE() truncates to YYYY-MM-DD.
    const collisionsByDay = conn
      .prepare(
        `SELECT DATE(started_at) AS day, COALESCE(SUM(collisions_processed), 0) AS count
         FROM runs
         WHERE status='completed'
           AND started_at >= DATE('now', '-30 days')
         GROUP BY DATE(started_at)
         ORDER BY day`,
      )
      .all() as CountByDayRow[];

    const briefsByDay = conn
      .prepare(
        `SELECT DATE(created_at) AS day, COUNT(*) AS count
         FROM briefs
         WHERE ((status='complete' AND hypothesis_id IS NOT NULL)
             OR COALESCE(is_stub,0)=1)
           AND created_at >= DATE('now', '-30 days')
         GROUP BY DATE(created_at)
         ORDER BY day`,
      )
      .all() as CountByDayRow[];

    // Reviewer distribution — same LIKE-on-JSON as fireCount, applied
    // to each verdict. Cheap since the hypotheses table is small and
    // the column is a TEXT blob, not indexed.
    const verdictRow = conn
      .prepare(
        `SELECT
           SUM(CASE WHEN auto_feedback_json LIKE '%a_tester%' THEN 1 ELSE 0 END) AS a_tester,
           SUM(CASE WHEN auto_feedback_json LIKE '%intéressant%' THEN 1 ELSE 0 END) AS interessant,
           SUM(CASE WHEN auto_feedback_json LIKE '%poubelle%' THEN 1 ELSE 0 END) AS poubelle
         FROM hypotheses
         WHERE auto_feedback_json IS NOT NULL`,
      )
      .get() as { a_tester: number; interessant: number; poubelle: number };
    const reviewer_distribution: Record<string, number> = {};
    if (verdictRow.a_tester > 0) reviewer_distribution.a_tester = verdictRow.a_tester;
    if (verdictRow.interessant > 0) reviewer_distribution['intéressant'] = verdictRow.interessant;
    if (verdictRow.poubelle > 0) reviewer_distribution.poubelle = verdictRow.poubelle;

    // Top domains — iterate briefs in memory. With ≤ a few hundred
    // briefs this is faster than a SQL JSON extract and portable across
    // SQLite builds that may or may not have the json1 extension.
    const domainCounts = new Map<string, number>();
    for (const row of getAllBriefs()) {
      const adapted = briefRowToBrief(row);
      for (const d of adapted.domains) {
        if (!d) continue;
        domainCounts.set(d, (domainCounts.get(d) ?? 0) + 1);
      }
    }
    const top_domains = Array.from(domainCounts.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count);

    const costTotal = Number(runsAgg.cost) || 0;
    const perBrief = totalBriefs > 0 ? costTotal / totalBriefs : null;
    const fireRate = totalReviewed > 0 ? fireCount / totalReviewed : 0;

    return {
      generated_at: new Date().toISOString(),
      totals: {
        collisions: Number(runsAgg.collisions) || 0,
        hypotheses: totalHypotheses,
        curated: curatedCount,
        fire_hypotheses: fireCount,
        briefs: totalBriefs,
      },
      quality: {
        avg_novelty_score: avgNovelty !== null ? Number(avgNovelty) : null,
        avg_panel_consensus: avgPanel !== null ? Number(avgPanel) : null,
        fire_rate: fireRate,
      },
      cost: {
        total_usd: costTotal,
        per_brief_usd: perBrief,
      },
      activity_30d: {
        collisions_by_day: collisionsByDay.map((r) => ({
          day: r.day,
          count: Number(r.count) || 0,
        })),
        briefs_by_day: briefsByDay.map((r) => ({
          day: r.day,
          count: Number(r.count) || 0,
        })),
      },
      reviewer_distribution,
      top_domains,
    };
  } catch (err) {
    console.error('[spore-web/db] getStats failed:', err);
    throw err;
  }
}

/**
 * Replacement for ``briefs.ts::getFeaturedBrief`` — three-tier preference:
 *   1. brief with vulgarization_data AND panel_verdict='publish_brief'
 *   2. brief with vulgarization_data (any verdict)
 *   3. most recent brief overall
 * Each tier is a single-row LIMIT 1 query, evaluated in order.
 */
export function getFeaturedBrief(): BriefWithBody | null {
  const conn = db();
  try {
    const tier1 = conn
      .prepare(
        `SELECT * FROM briefs
         WHERE vulgarization_data IS NOT NULL
           AND panel_verdict = 'publish_brief'
         ORDER BY created_at DESC LIMIT 1`,
      )
      .get() as Record<string, unknown> | undefined;
    if (tier1) return briefRowToBrief(hydrateBriefRow(tier1));

    const tier2 = conn
      .prepare(
        `SELECT * FROM briefs
         WHERE vulgarization_data IS NOT NULL
         ORDER BY created_at DESC LIMIT 1`,
      )
      .get() as Record<string, unknown> | undefined;
    if (tier2) return briefRowToBrief(hydrateBriefRow(tier2));

    const tier3 = conn
      .prepare(`SELECT * FROM briefs ORDER BY created_at DESC LIMIT 1`)
      .get() as Record<string, unknown> | undefined;
    return tier3 ? briefRowToBrief(hydrateBriefRow(tier3)) : null;
  } catch (err) {
    console.error('[spore-web/db] getFeaturedBrief failed:', err);
    throw err;
  }
}

/**
 * Replacement for ``briefs.ts::getBriefNeighbors``. Returns the brief
 * immediately older (``previous``) and newer (``next``) than ``id``,
 * by created_at. Either side may be null at the bounds of the list.
 */
export function getBriefNeighbors(
  id: string,
): { previous: BriefWithBody | null; next: BriefWithBody | null } {
  const conn = db();
  try {
    const previous = conn
      .prepare(
        `SELECT * FROM briefs
         WHERE created_at < (SELECT created_at FROM briefs WHERE id = ?)
         ORDER BY created_at DESC LIMIT 1`,
      )
      .get(id) as Record<string, unknown> | undefined;

    const next = conn
      .prepare(
        `SELECT * FROM briefs
         WHERE created_at > (SELECT created_at FROM briefs WHERE id = ?)
         ORDER BY created_at ASC LIMIT 1`,
      )
      .get(id) as Record<string, unknown> | undefined;

    return {
      previous: previous ? briefRowToBrief(hydrateBriefRow(previous)) : null,
      next: next ? briefRowToBrief(hydrateBriefRow(next)) : null,
    };
  } catch (err) {
    console.error(`[spore-web/db] getBriefNeighbors(${id}) failed:`, err);
    throw err;
  }
}
