'use client';

import { useState } from 'react';
import Link from 'next/link';
import EmailGate from '@/components/EmailGate';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

type CheckoutType = 'single' | 'pack_5';

export default function PricingClient() {
  const { isAuthenticated, isLoading } = useAuth();
  const [pendingGate, setPendingGate] = useState<CheckoutType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<CheckoutType | null>(null);

  async function startCheckout(type: CheckoutType) {
    setError(null);
    if (!isAuthenticated) {
      setPendingGate(type);
      return;
    }
    setBusy(type);
    try {
      const { checkout_url } = await api.createCheckout({ type });
      window.location.href = checkout_url;
    } catch (err) {
      setBusy(null);
      setError((err as Error).message || 'Erreur de paiement');
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-12 text-center">
        <h1 className="font-display text-4xl text-mist-100 md:text-5xl">
          Un brief de recherche, un prix clair
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-mist-400">
          Chaque brief livre une hypothèse formalisée, un protocole expérimental
          en 3 phases, un panel de review par 5 personas (méthodologue, expert
          domaine, contrarien, industriel, stratège du financement) et une base
          de preuves sourcée — avec DOIs vérifiés.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Découverte */}
        <Card
          title="Découverte"
          price="Gratuit"
          bullets={[
            'Votre premier brief complet offert',
            'Hypothèse + protocole + panel + preuves',
            'Aucune carte demandée',
          ]}
          cta={
            isAuthenticated ? (
              <Link
                href="/discoveries"
                className="block rounded-xl border border-ink-500 bg-ink-900 px-5 py-3 text-center text-sm text-mist-200 hover:text-mist-100"
              >
                Parcourir les briefs →
              </Link>
            ) : (
              <button
                onClick={() => setPendingGate('single')}
                className="block w-full rounded-xl border border-emerald-bio bg-emerald-bio/10 px-5 py-3 text-center text-sm font-semibold text-emerald-glow hover:bg-emerald-bio/20"
              >
                Commencer gratuitement
              </button>
            )
          }
        />

        {/* Unitaire */}
        <Card
          title="Brief unitaire"
          price="9 €"
          sub="par brief"
          bullets={[
            'Un brief complet de votre choix',
            'Re-téléchargements illimités',
            'Paiement par carte via Stripe',
          ]}
          cta={
            <button
              onClick={() => startCheckout('single')}
              disabled={busy === 'single' || isLoading}
              className="block w-full rounded-xl bg-emerald-bio px-5 py-3 text-center text-sm font-semibold text-ink-900 hover:bg-emerald-glow disabled:opacity-50"
            >
              {busy === 'single' ? 'Redirection…' : 'Acheter un brief'}
            </button>
          }
        />

        {/* Pack 5 (highlighted) */}
        <Card
          title="Pack 5 briefs"
          price="29 €"
          sub="soit 5,80 €/brief"
          badge="Populaire"
          bullets={[
            '5 crédits (un par brief)',
            'Valables sans expiration',
            'Idéal pour explorer une thématique',
          ]}
          highlight
          cta={
            <button
              onClick={() => startCheckout('pack_5')}
              disabled={busy === 'pack_5' || isLoading}
              className="block w-full rounded-xl bg-emerald-bio px-5 py-3 text-center text-sm font-semibold text-ink-900 hover:bg-emerald-glow disabled:opacity-50"
            >
              {busy === 'pack_5' ? 'Redirection…' : 'Acheter le pack'}
            </button>
          }
        />

        {/* Custom */}
        <Card
          title="Collision sur mesure"
          price="25 €"
          sub="livraison sous 24 h"
          bullets={[
            'Vous choisissez 2 domaines',
            'SPORE génère une hypothèse inédite',
            'Brief livré par email',
          ]}
          cta={
            <Link
              href="/custom"
              className="block w-full rounded-xl border border-cyan-bio/40 bg-cyan-bio/10 px-5 py-3 text-center text-sm font-semibold text-cyan-glow hover:bg-cyan-bio/20"
            >
              Commander une collision
            </Link>
          }
        />
      </div>

      {error && (
        <p className="mt-8 text-center text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {pendingGate && (
        <div className="mt-10">
          <EmailGate
            headline="Un pas avant le paiement"
            subtext="Connectez-vous par email pour associer votre achat à votre compte. Un lien d'accès vous sera envoyé."
            cta="Continuer"
            onSent={() => setPendingGate(null)}
          />
        </div>
      )}

      <FaqStrip />
    </div>
  );
}

function Card({
  title,
  price,
  sub,
  bullets,
  cta,
  highlight,
  badge,
}: {
  title: string;
  price: string;
  sub?: string;
  bullets: string[];
  cta: React.ReactNode;
  highlight?: boolean;
  badge?: string;
}) {
  return (
    <article
      className={`relative flex flex-col rounded-2xl border p-6 ${
        highlight
          ? 'border-emerald-bio/60 bg-emerald-bio/5 shadow-[0_0_40px_rgba(16,185,129,0.08)]'
          : 'border-ink-500 bg-ink-800/40'
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-6 rounded-full bg-emerald-bio px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink-900">
          {badge}
        </span>
      )}
      <h2 className="mb-1 font-display text-xl text-mist-100">{title}</h2>
      <div className="mb-5">
        <span className="font-display text-3xl text-mist-100">{price}</span>
        {sub && <span className="ml-2 text-xs text-mist-500">{sub}</span>}
      </div>
      <ul className="mb-6 flex-1 space-y-2 text-sm text-mist-300">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-emerald-glow">✓</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      {cta}
    </article>
  );
}

function FaqStrip() {
  const items = [
    {
      q: 'Quelle est la différence entre un brief et une hypothèse ?',
      a: "L'hypothèse est la formulation scientifique (1 phrase). Le brief ajoute : formalisation testable, protocole expérimental en 3 phases, panel de review par 5 personas, base de preuves, contre-preuves, gap manifest.",
    },
    {
      q: 'Puis-je re-télécharger un brief sans payer à nouveau ?',
      a: 'Oui. Chaque achat vous attribue le brief à vie. Les re-téléchargements ne consomment ni crédit ni euro.',
    },
    {
      q: 'La collision sur mesure, c\'est quoi ?',
      a: 'Vous nous donnez 2 domaines scientifiques (p. ex. "Quantum Thermodynamics × Reinforcement Learning"). SPORE force la collision et produit un brief complet en 24 h. Vous recevez le lien par email.',
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
