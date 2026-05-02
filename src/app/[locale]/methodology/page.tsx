import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { SITE_URL } from '@/lib/seo';

const _title = 'Méthodologie — SPORE';
const _desc =
  'Comment SPORE calcule (ou pas) ses métriques : score de Nouveauté, ' +
  'consensus du Panel, kill rate, vérification bibliographique. ' +
  'Transparence sur les méthodes et leurs limites assumées.';

export const metadata: Metadata = {
  title: 'Méthodologie',
  description: _desc,
  alternates: { canonical: '/methodology' },
  openGraph: {
    title: _title,
    description: _desc,
    url: `${SITE_URL}/methodology`,
    type: 'article',
    locale: 'fr_FR',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'SPORE — Le moteur d\'hypothèses interdisciplinaires',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: _title,
    description: _desc,
    images: ['/og-default.png'],
  },
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <header className="mb-12">
        <span className="mb-4 inline-block text-xs uppercase tracking-[0.3em] text-emerald-glow">
          Transparence
        </span>
        <h1 className="font-display text-4xl leading-tight text-mist-100 md:text-6xl">
          Méthodologie SPORE
        </h1>
        <p className="mt-6 text-mist-300 leading-relaxed">
          Cette page documente avec transparence le fonctionnement réel des
          métriques affichées sur SPORE. Le projet revendique la rigueur
          scientifique — la rigueur commence par dire honnêtement comment
          chaque chiffre est produit, y compris quand la méthode est
          imparfaite.
        </p>
      </header>

      <Section id="novelty" title="Le score de Nouveauté (0,00 à 1,00)">
        <Field label="Ce que c'est">
          une estimation, par le LLM lui-même, de l&apos;originalité de
          l&apos;hypothèse formulée par rapport à la littérature scientifique
          récente trouvée via Semantic Scholar.
        </Field>
        <Field label="Comment il est produit">
          après avoir interrogé l&apos;API Semantic Scholar sur les mots-clés
          de l&apos;hypothèse, SPORE soumet l&apos;ensemble des papiers
          trouvés au LLM (DeepSeek ou Claude selon l&apos;étape) avec une
          consigne explicite : <em>« évalue à quel point cette hypothèse est
          nouvelle par rapport à ce qui existe déjà »</em>. Le LLM retourne un
          score entre 0 et 1 et un verdict catégoriel{' '}
          <span className="font-mono text-xs text-mist-400">
            (novel · incremental · already_explored · already_proven)
          </span>
          .
        </Field>
        <Field label="Ce que ce n'est PAS">
          une mesure objective basée sur des embeddings, une distance
          cosinus, ou une analyse statistique du graphe de citations. Il
          n&apos;y a pas de formule mathématique derrière. C&apos;est une
          auto-évaluation heuristique.
        </Field>
        <div className="mt-4 rounded-xl border border-amber-bio/30 bg-amber-bio/5 p-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-amber-glow">
            Limites assumées
          </p>
          <ul className="space-y-2 text-sm text-mist-300">
            <Bullet>
              Le score reflète le biais d&apos;auto-évaluation du LLM
              (tendance à surévaluer ses propres productions, ou à
              sous-évaluer si entraîné à la prudence).
            </Bullet>
            <Bullet>
              La fenêtre temporelle de comparaison dépend des résultats
              Semantic Scholar et n&apos;est pas strictement bornée.
            </Bullet>
            <Bullet>
              Un concept « redécouvert » qui existe depuis 30 ans mais
              n&apos;apparaît pas dans le top 10 Semantic Scholar peut être
              scoré comme nouveau.
            </Bullet>
            <Bullet>
              Le score moyen observé sur les briefs publiés est de 0,80 —
              c&apos;est un signal de surévaluation systématique, pas une
              mesure neutre.
            </Bullet>
          </ul>
        </div>
        <Field label="Comment le lire">
          utilisez le score Nouveauté comme un indicateur <em>relatif</em>{' '}
          (cette hypothèse semble plus nouvelle que celle-là, selon le
          modèle), pas comme une mesure absolue. Pour évaluer la vraie
          nouveauté d&apos;une hypothèse, lisez la section « Évaluation de
          nouveauté » du brief, qui liste les travaux les plus proches
          identifiés.
        </Field>
        <Field label="Évolution prévue">
          un sprint futur (référencé en backlog comme <span className="font-mono text-xs">N2.7-bis</span>) implémentera un score
          algorithmique basé sur la distance sémantique (embeddings
          sentence-transformers) et l&apos;absence de cooccurrence dans le
          corpus. Le score actuel sera conservé en parallèle pour
          comparaison.
        </Field>
      </Section>

      <Section id="panel" title="Le score de consensus du Panel (0 à 10)">
        <Field label="Ce que c'est">
          la moyenne pondérée des scores individuels donnés par les 5
          reviewers IA du panel post-publication.
        </Field>
        <Field label="Comment il est produit">
          chaque reviewer (Méthodologue, Expert du domaine, Avocat du diable,
          Industriel, Stratège financement) attribue un score sur 10 selon
          ses critères propres, accompagné d&apos;un verdict catégoriel{' '}
          <span className="font-mono text-xs text-mist-400">
            (strong_accept · accept · weak_accept · weak_reject · reject)
          </span>{' '}
          et d&apos;une note de confiance (0 à 1). Le{' '}
          <span className="font-mono text-xs">consensus_score</span> est une
          moyenne pondérée par la confidence de chaque reviewer.
        </Field>
        <div className="mt-4 rounded-xl border border-cyan-bio/30 bg-cyan-bio/5 p-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-cyan-glow">
            Verdict du Meta-Reviewer
          </p>
          <ul className="space-y-2 text-sm text-mist-300">
            <Bullet>
              Si <span className="font-mono text-xs">consensus_score ≥ 7,0</span>{' '}
              et verdict iter1 ≥ majorité accept →{' '}
              <span className="font-mono text-xs text-emerald-glow">
                publish_brief
              </span>
            </Bullet>
            <Bullet>
              Si <span className="font-mono text-xs">4,5 ≤ consensus_score &lt; 7,0</span>{' '}
              →{' '}
              <span className="font-mono text-xs text-amber-glow">
                revise_and_resubmit
              </span>{' '}
              (1 itération maximum)
            </Bullet>
            <Bullet>
              Si <span className="font-mono text-xs">consensus_score &lt; 4,5</span>{' '}
              →{' '}
              <span className="font-mono text-xs text-mist-400">reject</span>
            </Bullet>
          </ul>
        </div>
        <Field label="Ce que ce n'est PAS">
          une validation indépendante. Les 5 reviewers sont des projections
          du même espace de représentation linguistique que celui qui a
          généré l&apos;hypothèse. Ils détectent les incohérences internes,
          pas la contradiction expérimentale.
        </Field>
      </Section>

      <Section id="kill-rate" title="Le taux de rejet (kill rate)">
        <Field label="Ce que c'est">
          la proportion de collisions tentées qui n&apos;aboutissent pas à un
          brief publié.
        </Field>
        <Field label="Comment il est produit">
          compteur public mis à jour à chaque cycle, visible sur la page{' '}
          <Link
            href="/stats"
            className="text-emerald-glow underline-offset-2 hover:underline"
          >
            Statistiques
          </Link>
          .
        </Field>
        <Field label="Pourquoi il est élevé">
          sur 2 095 collisions tentées, 38 briefs publiés (taux de rejet de
          98,2 %). Ce chiffre n&apos;est PAS un défaut — c&apos;est la
          sélection rigoureuse en action. La majorité des paires de domaines
          aléatoires ne produisent pas de pont causal scientifiquement
          défendable. Publier toutes les collisions reviendrait à publier
          95 % de bruit.
        </Field>
      </Section>

      <Section id="references" title="Vérification des références bibliographiques">
        <Field label="Ce que c'est">
          chaque DOI cité dans un brief publié a été vérifié techniquement
          via l&apos;API Semantic Scholar.
        </Field>
        <Field label="Ce que ça signifie">
          le DOI existe, il pointe vers un article identifié sur Semantic
          Scholar, le titre et les auteurs récupérés correspondent à ce qui
          est cité dans le brief.
        </Field>
        <Field label="Ce que ça ne signifie PAS">
          la conclusion citée n&apos;a pas été vérifiée. SPORE garantit que
          les références existent et sont correctement identifiées. SPORE ne
          garantit pas que le LLM a correctement interprété le contenu de
          chaque article. Pour les briefs critiques, vérifier toujours la
          conclusion en consultant l&apos;article original.
        </Field>
      </Section>

      <Section id="costs" title="Coûts publics">
        <p className="text-mist-300 leading-relaxed">
          Tous les coûts d&apos;inférence LLM sont publiés en temps réel sur
          la page{' '}
          <Link
            href="/stats"
            className="text-emerald-glow underline-offset-2 hover:underline"
          >
            Statistiques
          </Link>
          . Coût moyen par brief : <span className="font-mono text-mist-100">~0,51 $</span>.
          Coût total cumulé depuis le lancement : visible publiquement.
        </p>
      </Section>

      <Section id="stack" title="Stack technique">
        <ul className="space-y-2 text-mist-300">
          <Bullet>
            <Strong>LLM</Strong> : DeepSeek V3.2 (primaire) + Claude (étapes
            critiques)
          </Bullet>
          <Bullet>
            <Strong>Embeddings</Strong> : sentence-transformers
            all-MiniLM-L6-v2
          </Bullet>
          <Bullet>
            <Strong>Bibliographie</Strong> : Semantic Scholar API
          </Bullet>
          <Bullet>
            <Strong>Domaines scientifiques</Strong> : OpenAlex (500 concepts
            level 2)
          </Bullet>
          <Bullet>
            <Strong>Pipeline</Strong> : Python 3.12, LangGraph, SQLite
          </Bullet>
          <Bullet>
            <Strong>Frontend</Strong> : Next.js 14, App Router
          </Bullet>
        </ul>
      </Section>

      <hr className="my-12 border-ink-500/50" />
      <p className="mb-2 text-sm italic text-mist-400">
        Cette page est un document évolutif. Si vous trouvez une formulation
        imprécise, contactez{' '}
        <a
          href="mailto:benoit@spore-research.com"
          className="text-emerald-glow underline-offset-2 hover:underline"
        >
          benoit@spore-research.com
        </a>
        .
      </p>
      <p className="text-xs italic text-mist-500">Mise à jour : mai 2026.</p>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-14 scroll-mt-24">
      <h2 className="mb-5 font-display text-2xl text-mist-100 md:text-3xl">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <p className="text-mist-300 leading-relaxed">
      <strong className="font-medium text-mist-100">{label}</strong> :{' '}
      {children}
    </p>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-medium text-mist-100">{children}</strong>;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 leading-relaxed">
      <span aria-hidden className="mt-1 select-none text-emerald-glow">
        •
      </span>
      <span>{children}</span>
    </li>
  );
}
