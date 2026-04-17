'use client';

import { useState } from 'react';
import Link from 'next/link';
import EmailGate from '@/components/EmailGate';
import { useAuth } from '@/contexts/AuthContext';

export default function PricingClient() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showGate, setShowGate] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-bio/40 bg-emerald-bio/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-emerald-glow">
          🚀 Offre de lancement
        </div>
        <h1 className="font-display text-4xl text-mist-100 md:text-5xl">
          SPORE est en accès libre
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-mist-400">
          Pour ses premiers utilisateurs, l&apos;intégralité des research briefs
          est gratuite — hypothèse formalisée, protocole expérimental, panel
          de review par 5 personas, références vérifiées. Créez votre compte
          pour y accéder.
        </p>
      </header>

      {/* Main launch card */}
      <section className="mx-auto mb-16 max-w-2xl">
        <article className="relative overflow-hidden rounded-2xl border border-emerald-bio/60 bg-emerald-bio/5 p-8 shadow-[0_0_60px_rgba(16,185,129,0.08)]">
          <span className="absolute -right-4 -top-4 text-6xl opacity-10">
            ✨
          </span>
          <div className="mb-2 text-xs font-medium uppercase tracking-widest text-emerald-glow">
            Accès complet
          </div>
          <h2 className="mb-3 font-display text-3xl text-mist-100">
            Découverte
          </h2>
          <div className="mb-6 flex items-baseline gap-3">
            <span className="font-display text-5xl text-mist-100">Gratuit</span>
            <span className="text-sm text-mist-500">pour le lancement</span>
          </div>
          <ul className="mb-8 space-y-2.5 text-sm text-mist-200">
            <Bullet>Tous les briefs débloqués, sans limite</Bullet>
            <Bullet>Hypothèse formalisée + protocole expérimental</Bullet>
            <Bullet>Panel de relecture par 5 personas + méta-relecture</Bullet>
            <Bullet>Base de preuves et contre-preuves (DOIs vérifiés)</Bullet>
            <Bullet>1 collision sur mesure offerte</Bullet>
            <Bullet>Aucune carte demandée</Bullet>
          </ul>
          {isAuthenticated ? (
            <Link
              href="/discoveries"
              className="block rounded-xl bg-emerald-bio px-5 py-4 text-center text-sm font-semibold text-ink-900 transition-colors hover:bg-emerald-glow"
            >
              Parcourir les briefs →
            </Link>
          ) : (
            <button
              onClick={() => setShowGate((s) => !s)}
              disabled={isLoading}
              className="block w-full rounded-xl bg-emerald-bio px-5 py-4 text-center text-sm font-semibold text-ink-900 transition-colors hover:bg-emerald-glow disabled:opacity-50"
            >
              Commencer gratuitement →
            </button>
          )}
        </article>

        {showGate && !isAuthenticated && (
          <div className="mt-6">
            <EmailGate
              headline="Créez votre compte"
              subtext="Un lien magique vous sera envoyé par email. Aucun mot de passe, aucune carte."
              cta="Recevoir le lien"
              onSent={() => setShowGate(false)}
            />
          </div>
        )}
      </section>

      {/* Coming soon */}
      <section>
        <h2 className="mb-2 text-center text-xs font-medium uppercase tracking-widest text-mist-500">
          Bientôt disponible
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-center text-sm text-mist-500">
          Une fois le service payant activé, voici les formules prévues.
          Inscrivez-vous maintenant pour bénéficier de l&apos;offre de lancement
          et être informé de l&apos;ouverture.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          <SoonCard
            title="Brief unitaire"
            price="9 €"
            sub="par brief"
            bullets={[
              'Un brief complet de votre choix',
              'Re-téléchargements illimités',
              'Paiement par carte',
            ]}
          />
          <SoonCard
            title="Pack 5 briefs"
            price="29 €"
            sub="soit 5,80 €/brief"
            bullets={[
              '5 crédits (un par brief)',
              'Valables sans expiration',
              'Idéal pour explorer une thématique',
            ]}
          />
          <SoonCard
            title="Collision sur mesure"
            price="25 €"
            sub="livraison sous 24 h"
            bullets={[
              'Vous choisissez 2 domaines',
              'SPORE génère une hypothèse inédite',
              'Brief livré par email',
            ]}
          />
        </div>
      </section>

      <FaqStrip />
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="text-emerald-glow">✓</span>
      <span>{children}</span>
    </li>
  );
}

function SoonCard({
  title,
  price,
  sub,
  bullets,
  badge,
}: {
  title: string;
  price: string;
  sub?: string;
  bullets: string[];
  badge?: string;
}) {
  return (
    <article className="relative flex flex-col rounded-2xl border border-ink-500 bg-ink-800/30 p-6 opacity-60">
      <span className="absolute -top-3 left-6 rounded-full border border-mist-500/40 bg-ink-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-mist-400">
        Prochainement
      </span>
      {badge && (
        <span className="absolute -top-3 right-6 rounded-full bg-mist-500/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-mist-400">
          {badge}
        </span>
      )}
      <h3 className="mb-1 font-display text-xl text-mist-200">{title}</h3>
      <div className="mb-5">
        <span className="font-display text-3xl text-mist-200">{price}</span>
        {sub && <span className="ml-2 text-xs text-mist-500">{sub}</span>}
      </div>
      <ul className="flex-1 space-y-2 text-sm text-mist-400">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-mist-500">·</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function FaqStrip() {
  const items = [
    {
      q: 'Pourquoi SPORE est-il gratuit en ce moment ?',
      a: "SPORE est en phase de lancement. L'accès gratuit nous permet de recueillir les retours des premiers utilisateurs, de calibrer le pipeline et d'affiner la qualité des briefs. Les tarifs affichés s'appliqueront lorsque le service payant sera ouvert.",
    },
    {
      q: 'Quelle est la différence entre un brief et une hypothèse ?',
      a: "L'hypothèse est la formulation scientifique (1 phrase). Le brief ajoute : formalisation testable, protocole expérimental en 3 phases, panel de review par 5 personas, base de preuves, contre-preuves, gap manifest.",
    },
    {
      q: 'Puis-je télécharger plusieurs briefs ?',
      a: "Oui. Pendant l'offre de lancement, vous pouvez télécharger tous les briefs disponibles sans limite après inscription.",
    },
    {
      q: 'La collision sur mesure, c\'est quoi ?',
      a: 'Vous nous donnez 2 domaines scientifiques (p. ex. "Quantum Thermodynamics × Reinforcement Learning"). SPORE force la collision et produit un brief complet en quelques minutes. Une collision offerte par utilisateur pendant le lancement.',
    },
  ];
  return (
    <div className="mt-20">
      <h2 className="mb-8 text-center font-display text-2xl text-mist-100">
        Questions fréquentes
      </h2>
      <div className="mx-auto max-w-3xl space-y-3">
        {items.map((f) => (
          <details
            key={f.q}
            className="group rounded-xl border border-ink-500 bg-ink-800/40 p-5"
          >
            <summary className="cursor-pointer list-none text-sm font-medium text-mist-100 group-open:mb-3">
              <span className="text-emerald-glow">› </span>
              {f.q}
            </summary>
            <p className="text-sm text-mist-300">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
