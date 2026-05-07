# S7.4 Phase 3-fix-v2.B — Research tab UI strings

Wires every hardcoded FR string in the Research tab chrome (TOC,
preview, paywall, panel cards, protocol cards, post-unlock section
headers) to next-intl namespaces. Continuation of Phase 3 + sub-sprint
A — same pattern, different surfaces.

NON-OBJECTIVE here: the prose `panel_data.reviews[].strengths /
weaknesses / recommendation / critical_questions` and
`panel_data.meta_review.{key_consensus, key_disagreements,
critical_path, final_recommendation, revision_guidance}` is content
stored in FR in the DB. Translating that needs a `panel_data_en`
column + batch translation script (sub-sprint C).

## What was wired

Eleven new translation namespaces / namespace-extensions (~60 keys
total):

- **`paywall.*`** — 13 keys backing PaywallPanel + UnlockCta:
  loadingSession, headline, description, cta, magicLinkPrompt,
  requestNewAccess, unlockHeadline, unlockDescription, downloadCta,
  downloadingShort, quotaExhausted, topUp.
- **`protocol.*`** — 10 keys backing ProtocolTimeline: timeline,
  budget, phase ({n}), cost, duration, go, noGo, quickStart, plus
  phaseLabel_1 / phaseLabel_2 / phaseLabel_3 (the third differs
  between locales — "Full protocol" / "Protocole complet").
- **`reviewerPanel.*`** — 3 keys: consensus, consensusPoints,
  criticalPath.
- **`personas.*`** — 5 entries keyed on the DB tokens
  (methodologist, domain_expert, contrarian, industrialist,
  funding_strategist). EN labels: Methodologist, Domain expert,
  Devil's advocate, Industry reviewer, Funding strategist.
- **`severity.*`** — 4 entries: fatal, serious, minor, addressable.
- **`support_type.*`** — 5 entries: direct, indirect, analogous,
  contradictory, tangential.
- **`briefDetailPage.toc_*`** — 13 keys (1 title + 6 items × {title, sub}).
- **`briefDetailPage.references_*`** — title + ICU-pluralised count
  + ICU-pluralised "+N more".
- **`briefDetailPage.panelHeader_title`** — Detailed panel scores.
- **`briefDetailPage.research_*`** — 9 post-unlock h2 headers
  (panel review / experimental protocol / falsifiable predictions /
  evidence base / counter-evidence / residual gaps / open gaps /
  available data) + research_unlocked banner +
  research_translationNotice (FR fallback warning when lang=fr).
- **`briefDetailPage.predictions_*`** — 4 Dt labels
  (quantitativeBound, measurementMethod, nullHypothesis,
  statisticalTest).
- **`briefDetailPage.documents_*`** — title, viewMarkdown.

## Decisions

### Persona EN labels — keep "Industry reviewer", not "Industrialist"

The DB token is `industrialist`. The literal EN translation is
"Industrialist" — but the Lot 1 / S7.3-bis translation notes
already standardised on **"Industry reviewer"** for this persona
(more neutral, signals the role rather than the actor). Keeping
that choice for consistency.

`contrarian` → "Devil's advocate" (idiomatic, matches the FR
`Avocat du diable`). The DB token does not literally translate to
that phrase but the FR label was explicit about it.

### Critical path stays a label, the prose stays FR

`reviewerPanel.criticalPath` is the section heading. The actual
critical-path prose (`meta.critical_path` from DB) is a sentence in
French — that is panel_data content. The EN heading on top of FR
prose is jarring but preferable to a fully-FR section on /en/. The
prose translates in sub-sprint C.

### `lib/labels.ts` stays intact — additive approach

The legacy FR-only dictionary is consumed by 5 surfaces:
`AccountClient`, `CustomClient`, `StatusClient` (outside
`[locale]`), and `ReviewerPanel` + `BriefDetailClient` (inside
`[locale]`). This sub-sprint switched the latter two to next-intl
namespaces — the legacy dict is no longer imported by either. It
is **not** modified — the three out-of-`[locale]` surfaces continue
to consume it unchanged. Smoke-tested on `/fr/custom` and `/account`
post-build — both still render.

### `lib/verdicts.ts` partial cleanup

`verdictLabel()` (FR-only legacy) is no longer used anywhere in the
codebase. `verdictChipClasses()` is still used for the verdict-tone
CSS classes — kept. Could remove `verdictLabel` entirely but left
it in place to avoid touching the lib for a one-line cleanup; will
remove when other consumers (none currently) need the file edited.

### ICU plurals

`references_count` and `references_more` use the next-intl
`{var, plural, one {…} other {…}}` syntax. EN renders "2 of 2
references", "+ 1 more reference", "+ 12 more references"
correctly. FR mirrors with "référence" / "références".

### Phase labels split into separate keys

`PHASE_META` in ProtocolTimeline used to embed `label` per phase
number. Phases 1+2 are language-neutral ("In Silico", "Minimal");
phase 3 differs ("Full protocol" / "Protocole complet"). Split all
three into `protocol.phaseLabel_1/2/3` for symmetry — phase 1+2
have the same string in both locales but exposing them as keys
lets us override later if we want a stylised EN form.

### `research_translationNotice` (FR fallback banner)

Only shows when lang='fr' inside the Recherche tab — warns FR users
that the technical content underneath is in EN. Translated for
both locales because it could appear on /en/ with lang flipped to
'fr' via the toggle (effectiveLang fallback path from Phase 3).

## Volume + integrity

- 60+ keys added to `messages/{fr,en}.json`
- 0 strings removed (all changes additive — no breakage on existing
  callers)
- `lib/labels.ts` and `lib/verdicts.ts` modules unchanged
- Build clean (113 pages prerendered, 0 type errors)
- Smoke tested:
  - /en/briefs/[id] TOC visible in EN ✓
  - /en/briefs/[id] PanelPreviewCard personas in EN ✓
  - /en/briefs/[id] paywall CTA in EN ("Receive my access") ✓
  - /en/briefs/[id] references count "2 of 2 references" with ICU ✓
  - /fr/briefs/[id] Comprendre tab default unchanged (regression) ✓
  - /fr/briefs/[id] panel cards in FR (regression) ✓
  - /fr/custom h1 still in FR (labels.ts intact) ✓

## Items still in FR after this sprint

The Research tab on /en/ now has its **chrome** in EN. What remains
in FR is the **content** stored as FR-only strings in `panel_data`:

- `r.strengths[0] || r.recommendation` shown as the key-point card
  in PanelPreviewCard
- `meta.critical_path` prose under the "Critical path" heading
- `meta.key_consensus[]` bullet list under "Consensus points"
- `meta.key_disagreements[]` (not currently rendered but in the
  data)
- `meta.final_recommendation` (not currently rendered but in the
  data — would surface in a future deep-panel view)
- The deeper post-unlock RechercheSections views also pull from
  panel_data prose for the strengths/weaknesses lists per reviewer
  (rendered from `panel.reviews[]`)

These all need DB content translation. Sub-sprint C scope.
