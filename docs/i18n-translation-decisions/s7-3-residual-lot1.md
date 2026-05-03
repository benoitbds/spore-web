# S7.3-residual Lot 1 — Translation Notes

Decisions taken during the post-S7.3-bis-fix sprint covering home,
briefs list, brief detail tabs, and anthology email form. Continues
the convention started in `s7-3-bis.md`.

## Pages translated this sprint

- **Home `[locale]/page.tsx`** — fully translated, chrome + featured-hero
  metrics + "How SPORE works" pitch (3 step cards) + empty state.
  Featured-brief title and hook stay FR by design (see decision below).
- **Brief detail tabs + epistemic badge** — `BriefDetailClient.tsx`
  Comprendre/Recherche → Understand/Research, FR provenance badge → EN.
- **Briefs list (sort UI)** — `BriefsClient.tsx` sort buttons, search
  placeholder, count copy with plural rules, reset link, no-results
  empty state.
- **Briefs list page** — `briefs/page.tsx` becomes async server
  component, generateMetadata with hreflangs, H1 + intro + CTA
  localised.
- **Anthology form** — `AnthologyClient.tsx` form label + email
  placeholder + buttons + error messages + GDPR note.

## Pages with translations ready in JSON but NOT yet wired

These have keys in messages/{fr,en}.json but the components still
render FR strings hardcoded — wiring deferred to S7.3-residual Lot 2:

- **`/anthology` page.tsx** — kicker, title, intro, "Inside this
  anthology" header, "What you will find in the PDF" + 3 bullet points.
  Keys: `anthologyPage.kicker / .title / .intro / .tocTitle /
  .whatTitle / .whatBullet1 / .whatBullet2 / .whatBullet3_*`.
- **`/custom` CustomClient.tsx** — meta title + description in JSON,
  but the 457-line form component (~30 strings) untouched.
- **Brief detail deeper section labels** — `briefDetailPage.section_*`
  + `label_*` keys exist in messages but BriefDetailClient
  RechercheSections / ComprendreTab still hardcoded FR. Overlap with
  S7.4 (briefs bilingual content) — defer there.

## Non-trivial translation choices

### Featured-hero title in FR even on `/en/`

The hero on /en/ keeps `vulgarization_fr.title_fr` as the brief title
and `vulgarization_fr.imagine_that` as the hook. **Reason**: brief
content is in FR until S7.4 generates the EN versions. Translating
the chrome (kicker / badges / CTA) but keeping the FR title is the
cleanest temporary stance — better than rendering "Read this brief"
above a nonsense title or fall back to a different EN representation
that doesn't exist yet.

Alternative considered: render `sharpened.title` (formal English
scientific title) instead of `title_fr` on /en/. Rejected because the
formal title reads like a Nature paper title, not a vulgarised hook —
it would degrade the editorial signal of the home hero.

To revisit when S7.4 (DB schema + EN vulgarisation) is delivered.

### "Read this brief" vs "Read more"

Chose **"Read this brief"** (matching FR "Lire ce brief"). "Read more"
is too generic; "this brief" reinforces the singular signal of the
hero block.

### "Other briefs" / "More ideas to explore"

| FR | EN | Rationale |
|----|----|-----------|
| "Les autres briefs" | "Other briefs" | Mirrored exactly — clean |
| "D'autres idées à explorer" | "More ideas to explore" | "Other ideas to explore" reads stiffer; "More" gives the EN equivalent of the FR "D'autres" sense |
| "Voir tous les briefs →" | "View all briefs →" | "See all briefs" considered, "View" lighter |

### Pitch section ("How SPORE works")

| FR | EN | Note |
|----|----|------|
| "Comment SPORE fonctionne" | "How SPORE works" | Direct |
| "Collision, validation, publication" | "Collision, validation, publication" | Identical — three loanwords |
| "Une IA qui croise aléatoirement..." | "A system that randomly collides..." | "AI" replaced by "system" — style guide bans "AI-driven" tone, "system" reads more sober |
| "domaines scientifiques éloignés" | "distant scientific domains" | "Distant" preserves the metaphor |
| "ne publie que ce qui résiste" | "publishes only what survives" | "Survives" stronger than "resists" in EN |

### Step cards

- Step 1 "Deux domaines très éloignés sont tirés au sort" → "Two distant
  domains are drawn at random." Considered "Two highly distant" but
  redundant with "distant" already.
- Step 2 panel — kept "industry reviewer" per S7.3-bis-fix decision.
- Step 3 "démarrage rapide actionnable" → "actionable quick-start" —
  hyphenated EN compound noun.

### Empty state

| FR | EN |
|----|----|
| "Aucun brief publié pour l'instant" | "No brief published yet" |
| "Le pipeline tourne — les prochains briefs apparaîtront ici." | "The pipeline is running — the next briefs will appear here." |

### Briefs list — sort buttons

The 3 sort modes use single keys: `sort_panel` / `sort_novelty` /
`sort_date`. Localised values are "Panel / Novelty / Date" (EN) and
"Panel / Nouveauté / Date" (FR). "Panel" and "Date" stay identical
across locales.

### Briefs list — count copy

Used next-intl's ICU plural for `{n, plural, =0 {no brief published}
one {# brief published} other {# briefs published}}`. Note `count_zero`
is "No brief" (singular) in EN — "No briefs" reads as "zero briefs
exist" rather than "the filter returned nothing". Bac may prefer
"No briefs" — flag if so.

### Briefs list — search placeholder

| FR | EN |
|----|----|
| "Rechercher un domaine, un sujet…" | "Search a domain, a topic…" |

The leading "Search" without "for" is intentional — direct imperative
matches the FR "Rechercher".

### Briefs list — no results

| FR | EN |
|----|----|
| "Aucun brief ne correspond à votre recherche." | "No brief matches your search." |

### Briefs page — accent span

The intro paragraph wraps "5 relecteurs IA" in `<span text-emerald-glow>`
for visual emphasis. The EN equivalent "5 AI reviewers" is wrapped
identically. Accent stays consistent.

### CTA

| FR | EN |
|----|----|
| "Vous avez un domaine précis en tête ?" | "Have a specific domain in mind?" |
| "Demandez une collision sur mesure" | "Request a custom collision" |

The FR "Demandez" softer than "Order" — chose "Request" in EN to
mirror that politeness register.

### Brief detail — epistemic badge

| FR | EN |
|----|----|
| "Hypothèse générée par IA · Pré-publication · À tester expérimentalement" | "AI-generated hypothesis · Pre-publication · To be tested experimentally" |

Kept identical to the version already in chrome translation (introduced
in S7.3-bis), no change.

### Brief detail — tabs

| FR | EN |
|----|----|
| 💡 Comprendre | 💡 Understand |
| 🔬 Recherche | 🔬 Research |

Single-word verbs are crisp; emoji preserved.

### Anthology form

| FR | EN |
|----|----|
| "Recevoir l'anthologie par email" (label) | "Receive the anthology by email" |
| "votre@email.fr" → "your@email.com" | "your@email.com" |
| "Recevoir l'anthologie" (button) | "Receive the anthology" |
| "Envoi en cours…" | "Sending…" |
| "Format d'email invalide." | "Invalid email format." |
| "Une erreur est survenue. Réessayez dans un instant." | "Something went wrong. Please try again in a moment." |
| "Conformité RGPD" | "GDPR-compliant" |

The FR "RGPD" (Règlement Général sur la Protection des Données) maps
to the better-known "GDPR" in EN. "GDPR-compliant" hyphenated EN
adjective reads cleaner than "GDPR compliant".

### Anthology page (NOT YET WIRED — deferred Lot 2)

The translations exist in messages/{fr,en}.json (`anthologyPage.tocTitle`
etc.) but the page.tsx still renders FR. The chosen EN strings:

- "Lead magnet · PDF gratuit" → "Lead magnet · Free PDF"
- "Anthologie SPORE — 6 premiers mois" → "SPORE Anthology — first six months"
- "Au sommaire" → **"Inside this anthology"** (NOT "Table of contents",
  too formal; NOT "Contents", too bare)
- "Ce que vous trouverez dans le PDF" → "What you will find in the PDF"

## Items where Bac may want to revise

1. **Featured-hero title FR on /en/** — temporary by design. Confirm
   acceptable until S7.4.
2. **"No brief" vs "No briefs" plural=0** — kept singular, may read
   stiff in EN context.
3. **"AI-generated hypothesis · Pre-publication · To be tested
   experimentally"** — still keeps "AI-generated" which the style
   guide normally avoids. Justified here because it is precisely the
   epistemic disclaimer the badge announces. To revisit if you want
   "machine-generated" or "automatically generated".
4. **"5 AI reviewers"** in /briefs page intro — same reasoning as above,
   accept the explicit AI signalling here.

## Word count

| Page chrome | FR words | EN words | Ratio |
|---|---|---|---|
| home | ~140 | ~130 | 0.93× |
| briefs list | ~50 | ~50 | 1.00× |
| brief detail (tabs+badge) | ~12 | ~13 | 1.08× |
| anthology form | ~50 | ~50 | 1.00× |

Total this sprint: **~250 EN words** (substantially less than the
1,630 of S7.3-bis because chrome strings are short; the heavy lifting
was the wiring + namespaces + page-level metadata).

## Hreflangs

Added per-page via `localeAlternates(locale, path)`:
- ✅ `/[locale]` (home) — added in this sprint
- ✅ `/[locale]/briefs` — added in this sprint
- ✅ `/[locale]/about`, `/[locale]/methodology`, `/[locale]/how-it-works`
  — added in S7.3-bis foundation
- ❌ `/[locale]/anthology`, `/[locale]/custom`, `/[locale]/pricing`,
  `/[locale]/privacy`, `/[locale]/legal`, `/[locale]/stats` — NOT YET
- ❌ `/[locale]/briefs/[id]` — NOT YET (the existing static metadata
  uses briefMetaTitle helper that is FR-only; refactor risky for SSG
  of 76 pages, deferred)

Sitemap site-level hreflangs (S7.2) still cover all routes.
