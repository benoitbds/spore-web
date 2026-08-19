# S7.3-residual-fix — Translation Notes

Decisions taken during the residual chrome chase post S7.3-residual Lot 1.
Continues `s7-3-residual-lot1.md`. Branch:
`feat/s7-3-residual-fix-chrome`.

## Sprint scope (per the spec)

Chase visible FR chrome leaks on `/en/...` pages:

- AuthWidget header / drawer (Sign in, sign out, my account)
- Anthology page intro (kicker, title, intro, "Inside this anthology")
- Brief detail breadcrumb + neighbours + CustomCollisionCta
- ShareButtons (Share, Copy link, share-on-X / share-on-LinkedIn)
- Score badges on home FeaturedHero (verdict sub-labels)

Discovered at execution time (audit oversight rule applied — see
CLAUDE.md): three additional chrome leaks, all mechanical and within
the same taxonomy:

- `EditorialBriefCard` — "Publié", "nouveauté", "Lire →",
  "Non productive", FR-locked date format. Visible in the home grid
  and on `/briefs`.
- `CustomCollisionCta` — `aria-label`, kicker, default `cta` all
  hardcoded FR. Promoted to a `'use client'` component so it can call
  `useTranslations` directly.
- `BriefDetailClient` header date + verdict badge — date locked to
  `fr-FR`, verdict badge calling `verdictLabel()` (FR-only). Rest of
  the BriefDetailClient (RechercheSections, ReviewerPanel inner
  copy) stays out of scope per Lot 1 deferral to S7.4.

## New namespaces

Added to `messages/{fr,en}.json`:

- `auth.*` — `signIn`, `myAccount`, `signOut`, `connected`,
  `freeAccess`, `connectionHeadline`, `connectionSubtext`,
  `connectionCta`. Drives AuthWidget header + drawer + EmailGate
  drop-down strings.
- `share.*` — `label`, `copyLink`, `linkCopied`, `shareOnX`,
  `shareOnLinkedIn`. Drives ShareButtons.
- `verdicts.*` — full panel + novelty taxonomy in EN/FR.
  Replaces `verdictLabel()` (FR-only) at every locale-aware call site
  (home FeaturedHero, BriefDetailClient header, EditorialBriefCard,
  briefs/[id] neighbour cards, BriefJsonLd keywords).
  See "Verdict translations" below.
- `briefCard.*` — `novelty`, `read`, `nonProductive`. Drives the
  EditorialBriefCard footer.

Extended:

- `briefDetailPage.*` — `backToList`, `notFoundTitle`,
  `neighborsAria`, `customCtaHeadline`, `customCtaSubtext`,
  `customCtaButton`. Drives breadcrumb, neighbours, and the bottom
  CustomCollisionCta on brief detail.
- `briefsPage.ctaButton` — adds an explicit translated label so the
  bottom-of-list CTA stops falling back to the FR default that
  CustomCollisionCta used to ship.

## Verdict translations

The FR labels in `src/lib/verdicts.ts` were the source. EN mirrors:

| Key | FR | EN | Note |
|---|---|---|---|
| `publish_brief` | Publié | **Published** | Direct |
| `revise_and_resubmit` | À réviser | **Revise and resubmit** | Standard peer-review register |
| `reject` | Rejeté | **Rejected** | Direct |
| `killed` | Abandonné | **Discontinued** | "Killed" reads slangy in EN; "Discontinued" matches the SPORE editorial register |
| `strong_accept` / `accept` / `weak_accept` / `weak_reject` | Fortement accepté / Accepté / Accepté avec réserves / Réserves | **Strong accept** / **Accept** / **Weak accept** / **Weak reject** | Mirrors NeurIPS / ICLR convention — these are the literal panel verdicts |
| `novel` | Inédit | **Novel** | See decision below |
| `incremental` | Incrémental | **Incremental** | Direct |
| `already_explored` / `already_proven` | Déjà exploré / Déjà démontré | **Already explored** / **Already proven** | Direct |

### Decision: "Inédit" → "Novel"

The user's spec proposed **"Unprecedented"** as the working candidate
and asked for a chat confirmation if a better word emerged.
Picked **"Novel"** instead because:

1. **Mirrors the source verdict key.** The pipeline emits `novel` as
   the literal verdict token. "Novel" is the natural human-readable
   form of that key in EN — the same way "Inédit" is in FR.
2. **Standard scientific register.** Nature, Science, and the broader
   scientific literature use "novel" routinely as the editorial
   adjective for new findings. It does not read as boosterish.
3. **"Unprecedented" carries hyperbole.** It implies a stronger claim
   ("never before seen in history") than the SPORE pipeline can
   actually back up. Inconsistent with the project's epistemic
   modesty stance ("AI-generated hypothesis · Pre-publication · To
   be tested experimentally").
4. **"Previously unproposed"** was considered. Accurate but verbose;
   does not fit a one-word badge sub-label.

To revisit: if you want to project a stronger marketing tone on the
home hero, swap to "Unprecedented" (it is one key change in
`messages/en.json` → `verdicts.novel`).

## Component-level decisions

### AuthWidget — drawer "Custom collision" link

The vertical-orientation drawer surfaces a `/custom` link that
previously read "Collision sur mesure" hardcoded. Wired to
`navigation.custom` (already shipped in S7.1) to keep all nav-style
labels aligned. Gives "Custom collision" / "Collision sur mesure"
without spawning a duplicate key.

### CustomCollisionCta — promoted to client component

The component was a server component (no `'use client'`). It carried
3 FR strings: `aria-label`, kicker text ("🎯 Collision sur mesure"),
and a `cta = '...'` default value. The cleanest way to translate all
three was to add `'use client'` and call `useTranslations`. Justified:

- All three callers (`briefs/page.tsx`, `briefs/[id]/page.tsx`,
  `StubBriefClient.tsx`) sit under `[locale]` so the
  `NextIntlClientProvider` is in scope.
- `StubBriefClient` is already a client component, so the import
  graph is not changed.
- The two remaining server callers can still render this as a Server-
  to-Client boundary without serialization concerns (only string
  props cross the boundary).

The `cta` prop is now optional and defaults to
`tBriefs('ctaButton')`. The kicker reads `tNav('custom')` and the
`aria-label` does the same — single source of truth for that phrase.

### EditorialBriefCard — locale-aware date

The footer time element used `'fr-FR'` hardcoded
(`toLocaleDateString`). Switched to `useLocale()` and a 2-line
`dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US'` ternary. Same
pattern as the home page (where the locale was already passed
explicitly via prop).

### BriefJsonLd — verdictKeywords now a prop

The component used to call `verdictLabel()` (FR-only) at render
time, leaking "Inédit, Publié" into the JSON-LD `keywords` field on
`/en/briefs/[id]`. SEO crawlers see it.

The fix moves verdict-translation **out** of BriefJsonLd. The parent
server page now precomputes the locale-translated tokens via
`getTranslations('verdicts')` and passes them in via a
`verdictKeywords` prop. BriefJsonLd stays a server component, no
hooks added.

### BriefDetailClient — header verdict only

Refactored the **header** verdict badge (line 174) and the **header
date** (line 165) only. The deeper RechercheSections + ReviewerPanel
verdicts stay FR-locked — these are inside the "Recherche" tab whose
content (panel review prose, evidence text, protocol sections) is
FR-only until S7.4 generates the EN versions. Translating the
verdict labels alone there would mix EN labels with FR prose, which
is worse than fully FR.

## What is still NOT bilingual on /en/

Carry-over from Lot 1, unchanged:

1. **Featured-brief title and hook on `/en/`** — stays FR.
   `vulgarization_fr.title_fr` and `imagine_that` are read until S7.4
   adds an EN vulgarisation column.
2. **The 8 anthology preview titles** — kept in original FR per the
   editorial signature decision (S7.2). The bilingual notice on
   `/en/anthology` explains.
3. **Brief detail RechercheSections + ReviewerPanel** — full FR
   content, FR verdict labels inside. Defer to S7.4.
4. **`briefMetaTitle` / `briefMetaDescription` / `briefOgDescription`
   helpers in `src/lib/seo.ts`** — still emit FR strings on `/en`.
   Per Lot 1 the bilingualisation of brief metadata is a S7.4 chore
   (depends on DB schema extension for EN vulgarisation).
5. **Brief content** appearing in the BriefsClient search haystack —
   serialized brief data is FR; visible inside the page HTML. Not
   user-visible chrome but appears in a `view-source` / scraping
   context. Will resolve when S7.4 lands EN brief data.
6. **AccountClient** (`/account`) — not under `[locale]`. S7.2-bis
   tree migration.
7. **StubBriefClient inner copy** ("Cette paire n'a pas produit de
   pont.", panel-style text) — FR only. Stub flow is rare, deferred.

## Hreflangs added this sprint

- ✅ `/[locale]/anthology` — added (was missing in Lot 1).
- ✅ `/[locale]/briefs/[id]` — added per-page now that the route is
  async + locale-aware (was sitemap-only in Lot 1).

Sitemap site-level hreflangs (S7.2) still cover all routes as a
backstop.

## Word count

| Surface | New EN strings | Total this sprint |
|---|---|---|
| auth.* | 8 | — |
| share.* | 5 | — |
| verdicts.* | 12 | — |
| briefCard.* | 3 | — |
| briefDetailPage.* (added) | 6 | — |
| briefsPage.ctaButton | 1 | — |
| **Total** | **35** keys (~80 EN words) | minimal — chrome is short |

## Verification

Built locally with `npm run build` (113 static pages OK), spun up
`next start -p 5005`, and curled every translated route in both
locales. Final audit (paths × leak markers): every `/fr` page is
clean of EN chrome leaks and every `/en` page is clean of FR chrome
leaks, except the deferred items listed above (brief content in
search haystack, anthology preview titles, stub briefs).

## Items where Bac may want to revise

1. **"Discontinued"** for `killed`. The FR is "Abandonné". Other
   options: "Killed", "Aborted". Picked "Discontinued" for the calm
   editorial register, but if you want closer parity to the FR sense
   of "we gave up on this", "Abandoned" mirrors directly.
2. **"Novel"** for `novel`. See decision above. "Unprecedented" was
   the spec's working candidate.
3. **"Strong accept" / "Weak reject"** — kept literal NeurIPS-style.
   Accurate but a touch jargon-y for general readers. Could soften
   to "Strong recommendation to accept" but the badge is small.
