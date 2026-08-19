# S7.3-bis — Translation Notes for Human Review

This file documents non-trivial translation choices made during the
S7.3-bis editorial sprint. It is **gitignored** so it can hold WIP
review comments without polluting the repository history.

Pages translated this sprint:
- `/about` — fully translated (EN), 7 sections + signature personnelle
- `/methodology` — fully translated (EN), 6 sections + technical stack
- `/how-it-works` — fully translated (EN), funnel + 3 principles + CTA

Pages NOT translated this sprint (deferred to S7.3-residual):
- Home page editorial (manifesto already aligned in S7.3-foundation;
  metric labels already in chrome translation; FeaturedHero copy still FR)
- `/anthology` page text (preview headers, "Au sommaire", form copy)
- `/custom` form labels (CustomClient.tsx, ~457 lines, complex)
- `/pricing` cards (PricingClient.tsx, ~265 lines)
- `/privacy`, `/legal` (legal text — needs lawyer review for EN)
- BriefDetailClient deep strings (~1100 lines, overlap with S7.4)
- Page-level UI strings on `/briefs` listing, `/stats`, sort buttons

---

## Style guide compliance — choices I made

### "discover" → forbidden

Style guide explicitly bans "discover" / "discovery" given the
epistemic critique from Robert and Margaux. Replacement choices:

| FR original | Chosen EN | Discarded alternatives |
|---|---|---|
| "découvertes scientifiques" | "scientific advances" | "scientific discoveries" (forbidden), "scientific breakthroughs" (marketing-speak) |
| "Pas un outil de découverte scientifique" | "Not a scientific discovery tool" | This is the ONE place I keep "discovery" — it is intentional because the section title is precisely the negation of that label. The alternative "Not a scientific finding tool" is awkward. **Question for Bac**: is this acceptable, or rephrase? |
| `actions.discover` UI string | "Browse" | "Discover" / "Explore" — "Browse" is more honest given the action is reading a list of briefs |

### "scientist" → "researcher"

Applied throughout. Notable cases:
- "des chercheurs humains" → "human researchers"
- "des chercheurs, ingénieurs R&D, polymathes professionnels" →
  "researchers, R&D engineers, working polymaths"

### "we" → "SPORE" or "I"

The /about section 1 ("Who is behind") uses third-person SPORE for
the project but switches to the implicit "from Nantes" / personal
detail without explicit "I". I chose **"from Nantes. Solo developer,
engineer by training, polymath by temperament."** instead of "I am
a solo developer..." to match the FR's cool detachment. Bac may want
this to be more personal/warm.

### Manifesto and tagline

Adopted directly from the spec:
- Manifesto: **"A well-documented dead end is worth more than a glib unification."**
- Tagline: **"SPORE — A research collision engine"**

These are decisions, not translations — confirmed in the spec.

### Panel reviewers naming

| FR | Chosen EN | Alternatives discarded |
|---|---|---|
| Méthodologue | Methodologist | "Methods reviewer" (less natural) |
| Expert du domaine | Domain expert | "Field expert" (forbidden — "domain" mandatory) |
| Avocat du diable | Devil's advocate | "Critic" (loses the rhetorical weight) |
| Industriel | **Industrial reviewer** | "Industry reviewer" — chose "Industrial reviewer" for symmetry with the other 4 nouns. **Question for Bac**: "Industry reviewer" reads more naturally in EN; willing to change. |
| Stratège financement | Funding strategist | "Investment strategist" (too narrow), "Money guy" (too informal) |

### "fécond" / "féconds"

In `/about` section 5: "plausibles au sens linguistique — pas
nécessairement *féconds* au sens expérimental".

| Chosen EN | Discarded |
|---|---|
| "productive in an experimental one" | "fertile" (too biological connotation), "fruitful" (sounds religious) |

`/methodology` section "novelty" uses similar "féconds" idea:
- I removed the italics on "fécond" since the EN word "productive" is
  not as flagged in casual reading. Keep italics if you prefer.

### "kill rate" — kept

Per spec, "kill rate" stays as a product term. It appears 3 times in
EN methodology (page heading, intro, why-it-is-high section).

### "brief" / "briefs"

Kept as product term. NOT translated to "report" or "summary" anywhere.

### "collision" / "domain"

Kept as product terms. The page `/custom` is "Custom collision",
NOT "Custom intersection" (was tempted but spec forbids).

### Specific phrases I needed to refactor for English flow

**FR**: "qu'aucune discipline isolée n'aurait formulée"
**EN**: "no isolated field would have formulated"
*Note*: "discipline" → "field" here is an exception to the spec's
"prefer domain" rule, because "no isolated domain would have
formulated" sounds wrong (domain is reserved for SPORE's product
sense — pairs of domains in a collision). Letting "field" mean the
broader academic concept makes the prose cleaner. **Question for Bac.**

**FR**: "Une seule personne qui code, lit, ajuste les prompts, paie
le serveur, et regarde les hypothèses sortir."
**EN**: "One person who codes, reads, tunes the prompts, pays the
server, and watches the hypotheses come out."
*Note*: "watches the hypotheses come out" is colloquial. Considered
"observes the hypotheses emerge" but went for the FR cool detachment.

**FR**: "Cette transparence est constitutive du projet"
**EN**: "This transparency is constitutive of the project"
*Note*: "constitutive" is rare in EN editorial; could be "intrinsic
to" or "central to". Kept the rarer word for the formal register the
spec asks for.

**FR**: "C'est la position épistémiquement correcte."
**EN**: "This is the epistemically correct stance."
*Note*: "stance" rather than "position" to avoid repetition with
SPORE's "claims a position" language elsewhere.

**FR**: "Pas de label, pas de tutelle, pas d'agenda caché."
**EN**: "No badge, no oversight, no hidden agenda."
*Note*: "oversight" for "tutelle" is the closest. "No supervision"
sounds bureaucratic; "no patronage" sounds aristocratic; "no oversight"
is the cleanest.

**FR**: "Cette distinction est centrale et SPORE l'assume."
**EN**: "This distinction is central, and SPORE owns it."
*Note*: "owns it" is the cleanest EN idiom for "l'assume" in this
context. "Assumes it" is a false friend.

**FR**: "le panel ne constitue pas une validation indépendante"
**EN**: "the five reviewers do not constitute independent validation"
*Note*: Switched subject from "panel" to "five reviewers" because the
plural noun reads more concretely in EN.

### Methodology section — technical density

**FR**: "Compteur public mis à jour à chaque cycle"
**EN**: "a public counter, updated on each cycle"
*Note*: Used "Each cycle" instead of "every cycle" per style guide.

**FR**: "ce sont des projections du même espace de représentation
linguistique que celui qui a généré l'hypothèse"
**EN**: "they are projections of the same linguistic representational
space as the one that generated the hypothesis"
*Note*: "Linguistic representational space" is dense but technically
accurate. Considered "embedding space" but that overspecifies (we're
not literally talking embeddings here).

**FR**: "« évalue à quel point cette hypothèse est nouvelle par
rapport à ce qui existe déjà »"
**EN**: "« assess how novel this hypothesis is against what already
exists »"
*Note*: French quotation marks « » preserved since the visual style
of the methodology page uses them as a typographical signature.
Bac may prefer "..." or '...' for the EN version. **Question for Bac.**

**FR**: "Sélection rigoureuse en action"
**EN**: "rigorous selection at work"
*Note*: "in action" → "at work" reads more natural in EN editorial.

**FR**: "Publier toutes les collisions reviendrait à publier 95 % de
bruit."
**EN**: "Publishing every collision would amount to publishing 95%
noise."
*Note*: Removed FR space before "%" per EN typographic convention.

### How-it-works specifics

**FR**: "Onze étapes. Deux pipelines : L0 génère les hypothèses, le
post-🔥 valide les meilleures en profondeur."
**EN**: "Eleven steps. Two pipelines: L0 generates the hypotheses;
the post-🔥 stage validates the strongest ones in depth."
*Note*: Used semicolon instead of comma for the second clause — the
EN reads as two independent statements rather than a contrasting
pair (which the FR comma suggests).

**FR**: "Sélectionnées" (in funnel)
**EN**: "Shortlisted"
*Note*: "Selected" is too generic; "Shortlisted" carries the right
sense of curation.

**FR**: "Aucun angle mort. Tous les doutes sont exprimés."
**EN**: "No blind spot. Every doubt is voiced."
*Note*: "Voiced" is slightly more formal than "expressed", and pairs
better with the punctuated single-sentence rhythm.

### Plurals

The EN "domain" stays singular for the corpus (`a corpus of 500`)
and uses "domains" plural for "two scientific domains". Kept
consistent.

### Numbers

Used EN convention: comma thousands separator, period decimal:
- `2,095 collisions`
- `$0.51`
- `98.2%` (no space before `%`)

FR uses non-breaking space + comma decimal which is preserved in the
FR version.

---

## Items where I am LESS confident — Bac please review

1. **`/methodology` "fécond" italics** — kept in FR, removed in EN.
   Should they stay italicised in EN too?

2. **"Industrial reviewer" vs "Industry reviewer"** — chose the
   former for symmetry; reads slightly stiff. OK to swap to "Industry
   reviewer" if you prefer.

3. **`/about` section 4 "Pas un outil de découverte"** — EN keeps
   "discovery" because it is the negation of that label. Confirm.

4. **"discipline" allowed in `/about` section 2** — only place I
   relaxed the "domain" rule, because "domain" is product-reserved.

5. **`/methodology` panel rules visual** — kept the inline `<span
   font-mono>` markup for `consensus_score ≥ 7.0`. The EN reads fine
   but the bullet points are dense; consider whether the visual
   structure should be reformatted for EN scanability.

6. **/about section 7 closing** — "delivered with its doubts intact"
   is a literal translation of "livrée avec ses doutes intacts".
   Slightly poetic for a Nature-grade EN; alternative: "delivered
   with its uncertainties acknowledged" (more clinical).

---

## Word count

| Page | FR words (approx) | EN words (approx) | Ratio |
|---|---|---|---|
| /about | 700 | 660 | 0.94× ✓ |
| /methodology | 760 | 720 | 0.95× ✓ |
| /how-it-works | 270 | 250 | 0.93× ✓ |
| **Total** | **~1,730** | **~1,630** | **0.94×** |

Within the spec's 0.85-1.0× target window.

---

## Deferred to S7.3-residual or S7.4

Spec'd in S7.3-bis but NOT delivered this sprint:

1. **Home `[locale]/page.tsx`** — manifesto + tagline already aligned
   in S7.3-foundation. FeaturedHero brief title chrome and "Le pipeline
   en chiffres" not yet i18n-wired. ~30 strings remaining.

2. **`/anthology` editorial text** — "Au sommaire" header, preview
   block, form labels in AnthologyClient.tsx. ~15 strings.

3. **`/custom` CustomClient form** — labels, status messages, error
   messages. 457-line component with ~30 strings.

4. **`/pricing` PricingClient cards** — 3 plan cards + FAQ + manifesto
   reprise. ~30 strings.

5. **`/privacy`, `/legal`** — legal text needs lawyer review for EN
   legitimacy; defer to a sprint where Bac can pair with a lawyer.

6. **BriefDetailClient.tsx** strings — overlap with S7.4 briefs
   bilingues. Defer to that sprint where DB schema decision shapes
   the translation strategy.

7. **Per-page hreflangs** — added on /about, /methodology,
   /how-it-works via `localeAlternates()`. NOT YET on /home, /anthology,
   /custom, /pricing, /privacy, /legal, /briefs, /briefs/[id], /stats.
   Mechanical work, ~30 min if all pages refactored to async
   `generateMetadata`.

Estimated effort to close all of the above: **3-4 hours focused work**.
Recommend a S7.3-residual sprint dedicated to closing this gap before
S7.4 starts.
