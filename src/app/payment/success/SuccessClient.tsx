'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LAUNCH_MODE } from '@/lib/launch';

function LaunchSuccess() {
  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <div className="mb-6 text-5xl">🚀</div>
      <h1 className="font-display text-3xl text-mist-100 md:text-4xl">
        Votre accès est déjà actif
      </h1>
      <p className="mx-auto mt-4 max-w-md text-mist-400">
        SPORE est en offre de lancement — tous les briefs sont gratuits
        après inscription. Aucun paiement n&apos;est nécessaire pour
        l&apos;instant.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/briefs"
          className="rounded-xl bg-emerald-bio px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-emerald-glow"
        >
          Explorer les briefs →
        </Link>
        <Link
          href="/account"
          className="rounded-xl border border-ink-500 bg-ink-800/60 px-5 py-3 text-sm text-mist-200 hover:text-mist-100"
        >
          Mon compte
        </Link>
      </div>
    </div>
  );
}

function SuccessInner() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const { refresh, user } = useAuth();
  const [refreshed, setRefreshed] = useState(false);

  // The Stripe webhook credits the user asynchronously. We poll
  // /api/auth/me a few times to pick up credits as soon as the
  // webhook finishes; if the network is slow, the final fallback
  // tells the user to refresh.
  useEffect(() => {
    let cancelled = false;
    async function pull(attempt = 0) {
      if (cancelled) return;
      try {
        await refresh();
      } catch {
        // ignore — a later attempt will catch it
      }
      if (attempt < 5 && !cancelled) {
        setTimeout(() => pull(attempt + 1), 1500);
      } else {
        setRefreshed(true);
      }
    }
    pull();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <div className="mb-6 text-5xl">✅</div>
      <h1 className="font-display text-3xl text-mist-100 md:text-4xl">
        Paiement confirmé
      </h1>
      <p className="mt-4 text-mist-400">
        Merci ! Votre transaction a été validée par Stripe.
      </p>

      <div className="mx-auto mt-10 max-w-md rounded-2xl border border-emerald-bio/30 bg-emerald-bio/5 p-6 text-left">
        {!refreshed ? (
          <p className="text-sm text-mist-300">
            ⏳ Nous synchronisons votre compte avec Stripe…
          </p>
        ) : user ? (
          <p className="text-sm text-mist-200">
            Solde actuel :{' '}
            <span className="font-mono text-emerald-glow">
              {user.credits} crédit{user.credits > 1 ? 's' : ''}
            </span>
            .{' '}
            {user.credits > 0
              ? 'Utilisables sur n\'importe quel brief.'
              : user.free_brief_used
                ? 'Votre commande sera appliquée sous peu — rafraîchissez la page.'
                : ''}
          </p>
        ) : (
          <p className="text-sm text-mist-300">
            Si les crédits ne s&apos;affichent pas, reconnectez-vous avec le
            lien magique reçu par email.
          </p>
        )}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/briefs"
          className="rounded-xl bg-emerald-bio px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-emerald-glow"
        >
          Explorer les briefs →
        </Link>
        <Link
          href="/pricing"
          className="rounded-xl border border-ink-500 bg-ink-800/60 px-5 py-3 text-sm text-mist-200 hover:text-mist-100"
        >
          Retour aux tarifs
        </Link>
      </div>

      {sessionId && (
        <p className="mt-8 text-xs text-mist-500">
          Référence Stripe :{' '}
          <span className="font-mono">{sessionId.slice(0, 18)}…</span>
        </p>
      )}

      <p className="mt-6 text-xs text-mist-500">
        Pour une collision sur mesure, le brief est préparé sous 24 h et vous
        recevrez un email. Vous pouvez suivre son avancement dans votre{' '}
        <span className="text-mist-300">espace personnel</span>.
      </p>
    </div>
  );
}

export default function SuccessClient() {
  if (LAUNCH_MODE) {
    return <LaunchSuccess />;
  }
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl px-6 py-20 text-center text-mist-400">
          Chargement…
        </div>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}
