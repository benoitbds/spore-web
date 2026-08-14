/**
 * Standalone validation for the served sitemap.
 *
 * Checks every <lastmod> against the W3C Datetime profile Google
 * requires, and reconciles the URL count against what the DB says
 * should be there. Written after GSC-F3, where 162 entries carried
 * SQLite's "YYYY-MM-DD HH:MM:SS" (space separator, no timezone) and
 * Search Console stopped reading the file entirely.
 *
 * Reports on the FULL file, not a sample. Exits non-zero on any
 * violation so it can gate a deploy.
 *
 * Usage:
 *   npx tsx scripts/validate-sitemap.ts
 *   npx tsx scripts/validate-sitemap.ts https://spore-research.com/sitemap.xml
 *   SPORE_DB_PATH=/path/to/spore.db npx tsx scripts/validate-sitemap.ts
 */

import Database from 'better-sqlite3';

const SITEMAP_URL = process.argv[2] || 'https://spore-research.com/sitemap.xml';
const DB_PATH = process.env.SPORE_DB_PATH || '/home/baq/Projects/spore-poc/data/spore.db';

/**
 * W3C Datetime as Google accepts it in <lastmod>: a complete date, or a
 * complete date plus a time that carries an explicit timezone (Z or a
 * ±hh:mm offset). A naked "2026-04-11 20:08:15" matches neither.
 */
const W3C_DATETIME =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2}))?$/;

function matchAll(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}>([^<]*)</${tag}>`, 'g');
  return [...xml.matchAll(re)].map((m) => m[1]);
}

/**
 * Fetch with retries, reporting each failed attempt.
 *
 * Added when the apex carried a stale second A record pointing at an
 * OVH host that accepted no TLS connection, so roughly one HTTPS
 * request in five died with ECONNRESET before reaching the app. That
 * record was removed on 2026-08-14 and the apex now resolves to a
 * single address.
 *
 * The retry stays: this script asserts on sitemap content, and a
 * transport hiccup should not read as a content failure. The per-attempt
 * logging is the point — it keeps any recurrence visible instead of
 * silently absorbed. Pass http://127.0.0.1:3012/sitemap.xml to bypass
 * DNS entirely.
 */
async function fetchWithRetry(url: string, attempts = 4): Promise<string> {
  let lastErr: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (i > 1) console.log(`note  fetch succeeded on attempt ${i}/${attempts}`);
      return await res.text();
    } catch (err) {
      lastErr = err;
      console.log(`note  attempt ${i}/${attempts} failed: ${(err as Error).message}`);
    }
  }
  throw lastErr;
}

async function main() {
  const xml = await fetchWithRetry(SITEMAP_URL);

  const locs = matchAll(xml, 'loc');
  const lastmods = matchAll(xml, 'lastmod');
  let failures = 0;

  // --- 1. every lastmod is valid W3C Datetime -----------------------
  const badFormat = lastmods.filter((v) => !W3C_DATETIME.test(v));
  // A string can match the shape and still be a nonsense date
  // (2026-02-31). Round-trip through Date to catch those.
  const badValue = lastmods.filter(
    (v) => W3C_DATETIME.test(v) && Number.isNaN(new Date(v).getTime()),
  );

  console.log(`sitemap : ${SITEMAP_URL}`);
  console.log(`urls    : ${locs.length}`);
  console.log(`lastmod : ${lastmods.length} (optional per the protocol)`);
  console.log('');

  if (badFormat.length === 0 && badValue.length === 0) {
    console.log(`PASS  all ${lastmods.length} <lastmod> values are valid W3C Datetime`);
  } else {
    failures++;
    console.log(`FAIL  ${badFormat.length} malformed, ${badValue.length} unparseable`);
    for (const v of [...new Set([...badFormat, ...badValue])].slice(0, 10)) {
      console.log(`        ${JSON.stringify(v)}`);
    }
  }

  // --- 2. no duplicate <loc> ---------------------------------------
  const dupes = locs.filter((u, i) => locs.indexOf(u) !== i);
  if (dupes.length === 0) {
    console.log('PASS  no duplicate <loc>');
  } else {
    failures++;
    console.log(`FAIL  ${dupes.length} duplicate <loc>: ${[...new Set(dupes)].slice(0, 5).join(', ')}`);
  }

  // --- 3. url count reconciles with the DB -------------------------
  // Mirrors getAllBriefs' visibility rule in src/lib/db.ts.
  const db = new Database(DB_PATH, { readonly: true });
  const { n: briefCount } = db
    .prepare(
      `SELECT COUNT(*) AS n FROM briefs
        WHERE ((status = 'complete' AND hypothesis_id IS NOT NULL)
               OR COALESCE(is_stub, 0) = 1)`,
    )
    .get() as { n: number };
  db.close();

  const LOCALES = 2;
  const STATIC_PATHS = 11; // '', about, methodology, how-it-works, anthology,
  //                          briefs, pricing, custom, stats, legal, privacy
  const expected = (briefCount + STATIC_PATHS) * LOCALES;

  if (locs.length === expected) {
    console.log(
      `PASS  ${locs.length} urls = (${briefCount} briefs + ${STATIC_PATHS} static) × ${LOCALES} locales`,
    );
  } else {
    failures++;
    console.log(`FAIL  expected ${expected} urls, found ${locs.length}`);
  }

  console.log('');
  console.log(failures === 0 ? 'RESULT: PASS' : `RESULT: FAIL (${failures} check(s))`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
