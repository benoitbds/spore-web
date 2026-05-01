import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/seo';

const _title = 'À propos — SPORE';
const _desc =
  "SPORE est développé par Benoît Baqué de Sariac, ingénieur basé à Nantes. " +
  "Solo developer, side project transparent, micro-entreprise SoBaq. " +
  "Découvrez la démarche derrière ce moteur d'hypothèses scientifiques " +
  'interdisciplinaires.';

export const metadata: Metadata = {
  title: 'À propos',
  description: _desc,
  alternates: { canonical: '/about' },
  openGraph: {
    title: _title,
    description: _desc,
    url: `${SITE_URL}/about`,
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

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <header className="mb-12">
        <span className="mb-4 inline-block text-xs uppercase tracking-[0.3em] text-emerald-glow">
          Le projet
        </span>
        <h1 className="font-display text-4xl leading-tight text-mist-100 md:text-6xl">
          À propos de SPORE
        </h1>
      </header>

      <Section title="Qui est derrière ce projet">
        <P>
          SPORE est conçu, développé et opéré par{' '}
          <Strong>Benoît Baqué de Sariac</Strong> depuis Nantes. Solo developer,
          ingénieur de formation, polymathe par tempérament. Side project
          structuré, hébergé et maintenu en autonomie.
        </P>
        <P>
          Pas d&apos;équipe, pas de levée de fonds, pas de label institutionnel.
          Une seule personne qui code, lit, ajuste les prompts, paie le serveur,
          et regarde les hypothèses sortir. Cette transparence est constitutive
          du projet : SPORE revendique une rigueur scientifique, et la rigueur
          commence par dire qui parle.
        </P>
        <P>
          Si vous souhaitez échanger sur le projet, proposer un retour, signaler
          une erreur, ou imaginer une collaboration : un email suffit.
        </P>
        <ul className="mt-6 space-y-2 text-sm text-mist-300">
          <li>
            <Strong>Contact</Strong> :{' '}
            <A href="mailto:benoit@spore-research.com">
              benoit@spore-research.com
            </A>
          </li>
          <li>
            <Strong>Code source (frontend)</Strong> :{' '}
            <A
              href="https://github.com/benoitbds/spore-web"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/benoitbds/spore-web
            </A>
          </li>
          <li>
            <Strong>Statut juridique</Strong> : SoBaq — micro-entreprise
            enregistrée en mai 2026.
          </li>
        </ul>
      </Section>

      <Section title="Pourquoi SPORE existe">
        <P>
          Les découvertes scientifiques les plus disruptives naissent souvent à
          l&apos;intersection de domaines éloignés. La pénicilline
          (microbiologie × chimie des moisissures), CRISPR (immunologie
          bactérienne × édition génomique), PageRank (citations académiques ×
          algèbre linéaire), AlphaFold (bioinformatique × deep learning) —
          autant de cas où la rencontre entre disciplines distantes a produit
          une avancée qu&apos;aucune discipline isolée n&apos;aurait formulée.
        </P>
        <P>
          SPORE part d&apos;un pari : automatiser la <em>détection</em> de ces
          intersections non-explorées. Pas pour remplacer le travail
          scientifique — un LLM ne fait pas d&apos;expériences, ne valide rien
          par le réel — mais pour générer en continu les ponts plausibles que
          personne n&apos;a encore eu le temps ou le réflexe de formuler. Un
          moteur de sérendipité structurée.
        </P>
      </Section>

      <Section title="Ce que SPORE fait, concrètement">
        <P>À chaque cycle, le système :</P>
        <ol className="mb-6 space-y-3 text-mist-300">
          <Step n={1}>
            Tire au sort deux domaines scientifiques parmi 500 (sourcés
            OpenAlex)
          </Step>
          <Step n={2}>
            Génère via LLM (DeepSeek + Claude) un pont causal hypothétique entre
            les deux
          </Step>
          <Step n={3}>
            Soumet ce pont à un pipeline de critique : avocat du diable,
            méthodologue, expert du domaine, panel de 5 reviewers IA
          </Step>
          <Step n={4}>
            Vérifie chaque référence bibliographique via l&apos;API Semantic
            Scholar (zéro hallucination tolérée)
          </Step>
          <Step n={5}>
            Publie le résultat sous forme de brief structuré : hypothèse
            formelle, protocole expérimental en 3 phases avec critères GO/NO-GO
            chiffrés, prédictions falsifiables, base de preuves cliquable
          </Step>
        </ol>
        <P>
          Sur 2095 collisions explorées, 38 briefs publiés. Le taux de rejet
          (98,2%) est public et assumé. Le coût moyen par brief est de $0.51,
          pour un total cumulé de $19.49 — chiffres consultables en temps réel
          sur la <Link href="/stats" className="text-emerald-glow underline-offset-2 hover:underline">page Statistiques</Link>.
        </P>
      </Section>

      <Section title="Ce que SPORE n'est pas">
        <ul className="space-y-4 text-mist-300">
          <Bullet>
            <Strong>Pas un outil de découverte scientifique</Strong> au sens
            classique. SPORE produit des hypothèses, pas des résultats. Les
            hypothèses doivent être confrontées au réel par des chercheurs
            humains.
          </Bullet>
          <Bullet>
            <Strong>Pas un media de vulgarisation grand public</Strong>. La
            couche de vulgarisation française aide à la diffusion, mais le
            produit s&apos;adresse principalement aux chercheurs, ingénieurs
            R&amp;D, polymathes professionnels et étudiants en thèse.
          </Bullet>
          <Bullet>
            <Strong>Pas une publication scientifique validée par des pairs</Strong>.
            Chaque brief porte un badge «&nbsp;Hypothèse générée par IA ·
            Pré-publication · À tester expérimentalement&nbsp;». C&apos;est la
            position épistémiquement correcte.
          </Bullet>
          <Bullet>
            <Strong>Pas un projet financé ou affilié</Strong>. Pas de label, pas
            de tutelle, pas d&apos;agenda caché. Juste un développeur curieux
            qui pense qu&apos;on peut outiller la pensée analogique.
          </Bullet>
        </ul>
      </Section>

      <Section title="Limites assumées">
        <P>
          SPORE croise des <em>textes</em> sur la science, pas la science
          elle-même. La littérature scientifique est une représentation filtrée,
          retardée et socialement construite du réel. SPORE peut identifier des
          lacunes dans le discours scientifique, pas dans la nature. Les ponts
          générés sont <em>plausibles</em> au sens linguistique — pas
          nécessairement <em>féconds</em> au sens expérimental. Cette
          distinction est centrale et SPORE l&apos;assume.
        </P>
        <P>
          Le panel de 5 reviewers IA ne constitue pas une validation
          indépendante : ce sont des projections du même espace de
          représentation que le générateur. Ils détectent les incohérences
          internes, pas la contradiction du réel. La seule validation qui compte
          est expérimentale, et elle dépasse le périmètre de SPORE.
        </P>
      </Section>

      <Section title="Comment soutenir le projet">
        <P>SPORE est gratuit pendant la phase de lancement. À terme :</P>
        <ul className="mb-6 space-y-3 text-mist-300">
          <Bullet>
            <Strong>Brief unitaire 9€</Strong> — paiement à l&apos;acte, accès
            illimité au brief acheté.
          </Bullet>
          <Bullet>
            <Strong>Abonnement thématique 15€/mois</Strong> — 5 briefs/mois sur
            les domaines de votre choix (en préparation, prévu juin 2026).
          </Bullet>
          <Bullet>
            <Strong>Collision sur mesure 25€</Strong> — vous proposez deux
            domaines, SPORE génère une hypothèse inédite avec protocole et
            bibliographie en 24h. Première collision offerte pendant le
            lancement.
          </Bullet>
        </ul>
        <P>
          Pour les équipes de recherche ou R&amp;D corporate intéressées par une
          intégration sur mesure : un email à{' '}
          <A href="mailto:benoit@spore-research.com">
            benoit@spore-research.com
          </A>{' '}
          suffit pour démarrer la conversation.
        </P>
      </Section>

      <Section title="Une dernière chose">
        <blockquote className="my-6 border-l-2 border-emerald-bio/60 pl-6 font-display text-xl italic text-mist-100 md:text-2xl">
          Une hypothèse nulle bien documentée vaut mieux qu&apos;une fausse
          promesse d&apos;unification.
        </blockquote>
        <P>
          C&apos;est la phrase qui guide SPORE. Le succès n&apos;est pas mesuré
          au nombre de briefs publiés, mais à la qualité des hypothèses
          générées et à l&apos;honnêteté de leur statut. Chaque brief est une
          proposition exploratoire, livrée avec ses doutes intacts.
        </P>
      </Section>

      <hr className="my-12 border-ink-500/50" />
      <p className="text-xs italic text-mist-500">
        Page mise à jour : mai 2026.
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="mb-5 font-display text-2xl text-mist-100 md:text-3xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-mist-300 leading-relaxed">{children}</p>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-medium text-mist-100">{children}</strong>;
}

function A({
  href,
  target,
  rel,
  children,
}: {
  href: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className="text-emerald-glow underline-offset-2 hover:underline"
    >
      {children}
    </a>
  );
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

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 leading-relaxed">
      <span
        aria-hidden
        className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-bio/40 bg-emerald-bio/10 font-mono text-xs text-emerald-glow"
      >
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}
