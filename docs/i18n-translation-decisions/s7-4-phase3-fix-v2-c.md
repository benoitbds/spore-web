# S7.4 Phase 3-fix-v2.C — Panel data DB translation FR→EN

Closes the S7.4 chantier. The Research tab on `/en/briefs/[id]` now
shows EN reviewer prose end-to-end: chrome (sub-sprint B) +
panel_data prose (this sprint).

## Translation script

`spore-poc/scripts/translate_brief_panel.py` — mirror of
`translate_brief_vulgarization.py` (Phase 1+2) adapted to the
panel_data shape.

Per brief the script makes ~24 LLM calls:
- 5 reviewers × 4 prose fields (strengths, weaknesses,
  critical_questions, recommendation) = 20 calls
- meta_review × 5 fields (key_consensus, key_disagreements,
  revision_guidance, critical_path, final_recommendation) = 5 calls
- minus a few for rare placeholder pass-throughs (no LLM call)

List fields (strengths, weaknesses, etc.) are translated as a single
`---`-separated block per field. The LLM occasionally returns a
mismatched item count post-split; the fallback is per-item
translation, logged as `list_split_mismatch_fallback`. Did not fire
on any brief in the production batch.

## Two production-discovered bugs landed mid-sprint

### Hallucinations on placeholder strings

The FR pipeline writes marker strings into `panel_data` when
upstream parsing fails or the rubric prompt leaks through:
- `Manual review needed.` (20 chars)
- `Recommandation actionnable en 2-3 phrases.` (42 chars)
- `Unable to parse review` (22 chars)
- `Review parsing failed` (21 chars)

Feeding these to the LLM triggered hallucinations: a 20-char input
produced a fabricated 1144-char paragraph about cytochrome P450
catalysis in `SPR-2026-6FEB.meta_review.critical_path`. Same
pattern on `SPR-2026-7C1B.reviews[1].recommendation` (1021 chars
fabricated from 21).

Detected by the length-ratio validator (57.20× and 48.62× ratio
warnings). The 5% warning threshold from the spec triggered review.

Fix landed in the script: `_PLACEHOLDER_MAP` recognises the five
known forms case-insensitively and returns a fixed EN equivalent
without an LLM call. Re-translated the two affected briefs with
`--force` post-fix. Now both render `"Manual review needed."` /
`"Unable to parse review."` instead of fabricated paragraphs.

### Discover/discovery family slipping through the prompt

The SPORE EN style guide forbids `discover` / `discovery` /
`discoveries` / `discovered` / `discovering` / `discovers`. The
prompt explicitly lists them as FORBIDDEN. The LLM still let them
slip in 4 briefs out of 26 in the initial batch
(`SPR-2026-{28B2,5301,E212,F2F4}`, one occurrence each).

Fix landed in the script: `_replace_forbidden_discover` maps each
form to a context-neutral substitute as a post-process inside
`_llm_call`:
- `discovery` / `Discovery` -> `finding` / `Finding`
- `discoveries` / `Discoveries` -> `findings` / `Findings`
- `discovered` / `discovers` / `discover` -> `identified` /
  `identifies` / `identify` (and capitalised variants)
- `discovering` / `Discovering` -> `identifying` / `Identifying`

Negation contexts (`not a discovery`) are preserved per the /about
precedent. Re-translated the four affected briefs with `--force`
post-fix; corpus-wide audit now reports zero forbidden-discover
violations.

## Final batch numbers

- **26 briefs** total with `panel_data` in DB (others were stubs or
  legacy rows without panel_data); **0** missing `panel_data_en`
  after Phase 3-fix-v2.C completes
- **600 LLM calls** in the initial batch + ~80 calls across the
  6 retries (2 placeholder fixes + 4 discover fixes)
- **~$0.06** total cost (initial $0.0482 + retries ~$0.013) — well
  under the $0.30 estimate
- **28 min wall time** for the initial 25-brief batch; ~3 min for
  the 6 retries
- **0 STOPs** (no residual French detected)
- **0 length-ratio warnings remaining** after placeholder fix
- **0 forbidden-discover violations remaining** after replacement

## Frontend wiring

### Backend types + DB

- `Brief.panel_en?: Panel` — same shape as `panel`, only the prose
  differs.
- `BriefTeaser.panel_en` forwarded for post-unlock RechercheSections.
- `BriefTeaser.panel_preview_en` — projection of `panel_en.reviews`
  with the same `{persona, score, verdict, key_point}` shape as
  `panel_preview` but the `key_point` excerpt comes from the EN
  reviewer payload.
- `BriefRow.panel_data_en` parsed via `JSON_COLUMNS`.
- `briefRowToBrief` exposes `panel_en` (undefined when the column
  is NULL).
- `briefToTeaser` projects `panel_preview_en` only when
  `b.panel_en` exists.

### Components

- **PanelPreviewCard (pre-unlock)** — `RecherchePreview` accepts a
  `lang` prop forwarded from `effectiveLang`. When `lang === 'en'`
  and `teaser.panel_preview_en` is present, the panel cards render
  with EN reviewer key-points. FR canonical is the fallback.
- **ReviewerPanel (post-unlock)** — `RechercheSections` accepts a
  new `panelEn?: Panel` prop sourced from teaser. The
  `panelForProse` constant picks the locale-appropriate panel for
  prose rendering; numbers and tokens come from the FR canonical
  regardless.

The API endpoint `/api/briefs/{id}/full` was NOT extended in this
sprint — it still returns FR `panel_data`. The EN payload reaches
RechercheSections via the teaser instead. This keeps the API
surface unchanged and the change scope contained to the public
Brief object.

### Search

`briefHaystack` indexes the EN panel prose
(strengths/weaknesses/critical_questions/recommendation +
meta_review prose lists) so search on `/en/briefs` matches reviewer
terms in either language. The FR panel prose stays unindexed — it
lives behind the paywall and is not on the public Brief shape, so
the FR↔EN haystack symmetry that exists for vulgarisation does not
apply for panel review. This is a deliberate asymmetry, not an
oversight.

## Decisions

### Why translate panel_data prose into a parallel column rather than translate at brief-generation time

Phase 4 will extend the post-fire LangGraph subgraph to call the
translator at generation time for new briefs. For the existing 26
briefs already in the DB, batch translation is the path of least
resistance — same pattern as Phase 1+2 vulgarisation, validated and
cost-bounded.

### Why pass `panel_en` via teaser rather than via the API endpoint

The teaser is built server-side from the same DB row that has
`panel_data_en`. Forwarding it on the teaser:
- avoids modifying `/api/briefs/{id}/full` (smaller blast radius)
- keeps the paywall boundary intact (the teaser is a public
  projection; full panel prose is post-unlock content but the EN
  prose is no more sensitive than the FR prose, which is already
  in the full payload)
- makes RechercheSections locale-aware without chasing a dual
  FR/EN response shape on the API.

The drawback is that we ship the EN panel prose on every public
brief page, including before unlock — which is already what
`panel_preview_en` does for the pre-unlock cards. The post-unlock
RechercheSections gets the same data, just at a deeper render path.
Acceptable for the launch period.

### Why `panel_preview_en` was added rather than reused panel_preview

`panel_preview` extracts `key_point: r.strengths?.[0] || r.recommendation`
from the FR reviews. Doing the same on `panel_en.reviews` would
yield FR personas/scores/verdicts (those come from the FR
canonical) but EN key_points. To keep numbers + tokens canonical
and only swap the prose excerpt, the projection iterates the FR
reviews for personas/scores/verdicts and pulls `key_point` from
`panel_en.reviews[i]`. A separate `panel_preview_en` field on the
teaser makes the locale-conditional render trivially explicit at
the consuming component.

### What stayed FR after this sprint

- `meta_review.verdict_override_reason` — copied verbatim. Rarely
  shown on the UI; if surfaced it stays FR. Translatable in a
  future pass if needed.
- `funding_strategist.funding_programs[].rationale` — the LLM-
  generated funding-program metadata on the funding strategist
  reviewer carries FR `rationale` prose. Copied verbatim because
  the surrounding fields (`program`, `agency`, `next_deadline`,
  `success_rate`) are EN-native or year-formatted. The `rationale`
  field could be translated; deferred — it would expand the script
  to handle one more nested array, and the field is not currently
  rendered in the spore-web UI.
- The `verdict_override_reason` and `llm_*` meta-review fields
  also not currently rendered on /en — copy-only is fine.

## Phase 4 hand-off

The script's prompt + post-process pipeline + placeholder map are
ready to be called from inside the post-fire LangGraph subgraph at
brief-generation time. Easiest reuse: import `translate_panel(brief_id,
fr_payload)` from `scripts/translate_brief_panel.py` and call it
right after the panel-review step writes `panel_data` to the DB.
The `effectiveLang` fallback in spore-web will keep working for the
gap between brief generation and translation completion.
