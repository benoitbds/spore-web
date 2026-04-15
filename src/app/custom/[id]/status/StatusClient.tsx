'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api, ApiError, type CustomStatusResponse } from '@/lib/api';

const POLL_MS = 30_000;

export default function StatusClient({ requestId }: { requestId: string }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<CustomStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initial, setInitial] = useState(true);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let stopped = false;

    async function tick() {
      try {
        const res = await api.customStatus(requestId);
        if (stopped) return;
        setData(res);
        setError(null);
        setInitial(false);
      } catch (err) {
        if (stopped) return;
        if (err instanceof ApiError && err.status === 404) {
          setError('Commande introuvable ou non autorisée.');
        } else {
          setError((err as Error).message || 'Erreur réseau');
        }
        setInitial(false);
      }
    }

    tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [requestId, isAuthenticated, authLoading]);

  if (authLoading || initial) {
    return (
      <Shell>
        <p className="text-mist-400">Chargement…</p>
      </Shell>
    );
  }

  if (!isAuthenticated) {
    return (
      <Shell>
        <p className="text-mist-300">
          Pour suivre votre commande, connectez-vous avec l&apos;email utilisé
          lors du paiement.
        </p>
        <p className="mt-4">
          <Link
            href={`/auth/verify?next=/custom/${requestId}/status`}
            className="text-emerald-glow hover:text-emerald-bio"
          >
            Demander un lien de connexion
          </Link>
        </p>
      </Shell>
    );
  }

  if (error && !data) {
    return (
      <Shell>
        <p className="text-red-400">{error}</p>
      </Shell>
    );
  }

  if (!data) return null;

  return (
    <Shell>
      <StatusView data={data} />
      {error && (
        <p className="mt-4 text-xs text-amber-glow">
          (dernière synchro en échec : {error})
        </p>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-6 font-display text-3xl text-mist-100 md:text-4xl">
        Votre collision sur mesure
      </h1>
      {children}
    </div>
  );
}

function StatusView({ data }: { data: CustomStatusResponse }) {
  const meta = (
    <p className="mb-4 text-sm text-mist-400">
      <span className="font-mono">{data.domain_a}</span> ×{' '}
      <span className="font-mono">{data.domain_b}</span>
    </p>
  );

  switch (data.status) {
    case 'pending':
    case 'paid':
      return (
        <>
          {meta}
          <StatusCard tone="mist" emoji="⏳" title="Votre collision est en file d'attente">
            Nous avons reçu votre paiement. Le pipeline SPORE démarre dans
            les prochaines minutes. Vous pouvez quitter cette page — nous
            vous enverrons un email quand le brief sera prêt.
          </StatusCard>
        </>
      );
    case 'running':
      return (
        <>
          {meta}
          <StatusCard
            tone="emerald"
            emoji="🧬"
            title={`SPORE explore la connexion entre ${data.domain_a} et ${data.domain_b}…`}
          >
            Synthèse de l&apos;hypothèse, débat adversarial, curation, impact,
            literature grounding, panel de review. Temps typique : 10–30 min.
          </StatusCard>
        </>
      );
    case 'complete':
      return (
        <>
          {meta}
          <StatusCard tone="emerald" emoji="✅" title="Votre brief est prêt">
            La collision a produit une hypothèse et un brief complet.
            {data.brief_id ? (
              <span className="mt-4 block">
                <Link
                  href={`/discoveries/${data.brief_id}`}
                  className="inline-block rounded-xl bg-emerald-bio px-5 py-3 font-semibold text-ink-900 hover:bg-emerald-glow"
                >
                  Ouvrir le brief →
                </Link>
              </span>
            ) : null}
          </StatusCard>
        </>
      );
    case 'failed':
      return (
        <>
          {meta}
          <StatusCard tone="red" emoji="⚠️" title="La collision n'a pas abouti">
            SPORE n&apos;a pas identifié d&apos;hypothèse exploitable pour ce
            couple de domaines.{' '}
            {data.error_message ? `Détail : ${data.error_message}.` : ''}{' '}
            Vous serez remboursé intégralement sous 48 h — pas d&apos;action
            requise de votre part.
          </StatusCard>
        </>
      );
    default:
      return (
        <>
          {meta}
          <StatusCard tone="mist" emoji="ℹ️" title={`Statut : ${data.status}`}>
            Nous suivons l&apos;avancement en arrière-plan.
          </StatusCard>
        </>
      );
  }
}

function StatusCard({
  tone,
  emoji,
  title,
  children,
}: {
  tone: 'mist' | 'emerald' | 'red';
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  const toneCls =
    tone === 'emerald'
      ? 'border-emerald-bio/40 bg-emerald-bio/5'
      : tone === 'red'
        ? 'border-red-500/40 bg-red-500/5'
        : 'border-ink-500 bg-ink-800/40';
  return (
    <div className={`rounded-2xl border ${toneCls} p-6`}>
      <div className="mb-3 text-3xl">{emoji}</div>
      <h2 className="mb-3 font-display text-xl text-mist-100">{title}</h2>
      <div className="text-sm text-mist-300 leading-relaxed">{children}</div>
    </div>
  );
}
