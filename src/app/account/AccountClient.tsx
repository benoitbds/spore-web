'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import EmailGate from '@/components/EmailGate';
import { useAuth } from '@/contexts/AuthContext';
import {
  api,
  type AccountBrief,
  type AccountCustomRequest,
  type AccountPurchase,
} from '@/lib/api';
import { verdictLabel } from '@/lib/verdicts';
import { label } from '@/lib/labels';

export default function AccountClient() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [briefs, setBriefs] = useState<AccountBrief[]>([]);
  const [customs, setCustoms] = useState<AccountCustomRequest[]>([]);
  const [purchases, setPurchases] = useState<AccountPurchase[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    (async () => {
      const [b, c, p] = await Promise.all([
        api.accountBriefs().catch(() => []),
        api.accountCustomRequests().catch(() => []),
        api.accountPurchases().catch(() => []),
      ]);
      setBriefs(b);
      setCustoms(c);
      setPurchases(p);
      setLoaded(true);
    })();
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <Shell><p className="text-mist-400">Chargement…</p></Shell>;
  }

  if (!isAuthenticated) {
    return (
      <Shell>
        <p className="mb-6 text-mist-300">
          Connectez-vous pour accéder à votre espace personnel — briefs
          débloqués, collisions sur mesure et historique.
        </p>
        <EmailGate
          headline="Accès à mon compte"
          subtext="Un lien magique sera envoyé à votre email. Aucun mot de passe, aucune carte."
          cta="Recevoir le lien"
        />
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Launch mode — replaces the credits section while monetisation is paused */}
      <Section title="Mon accès">
        <div className="flex flex-col gap-5 rounded-2xl border border-emerald-bio/40 bg-emerald-bio/5 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="text-2xl leading-none">🚀</span>
            <div>
              <div className="font-display text-xl text-mist-100">
                Offre de lancement
              </div>
              <div className="mt-1 text-sm text-emerald-glow">
                Accès illimité aux briefs + 1 collision sur mesure offerte.
              </div>
            </div>
          </div>
          {loaded && customs.length > 0 ? (
            <Link
              href={`/custom/${customs[0].id}/status`}
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-emerald-bio/60 bg-emerald-bio/15 px-5 py-2.5 text-sm font-semibold text-emerald-glow transition-all hover:bg-emerald-bio/25 md:self-auto"
            >
              Voir ma collision →
            </Link>
          ) : (
            <Link
              href="/custom"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-emerald-bio/60 bg-emerald-bio/15 px-5 py-2.5 text-sm font-semibold text-emerald-glow transition-all hover:bg-emerald-bio/25 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] md:self-auto"
            >
              🎯 Demander ma collision →
            </Link>
          )}
        </div>
      </Section>

      {/* Unlocked briefs */}
      <Section title="Mes briefs débloqués">
        {!loaded ? (
          <p className="text-sm text-mist-400">Chargement…</p>
        ) : briefs.length === 0 ? (
          <Empty text="Vous n'avez pas encore débloqué de brief." />
        ) : (
          <div className="space-y-2">
            {briefs.map((b) => (
              <Link
                key={b.brief_id}
                href={`/discoveries/${b.brief_id}`}
                className="flex items-center justify-between rounded-xl border border-ink-500 bg-ink-800/40 px-5 py-3 transition-colors hover:border-emerald-bio/40"
              >
                <div>
                  <span className="font-mono text-xs text-mist-500">
                    {b.brief_id}
                  </span>
                  {b.panel_verdict && (
                    <span className="ml-2 text-xs text-mist-400">
                      · {verdictLabel(b.panel_verdict)}
                    </span>
                  )}
                </div>
                <div className="text-xs text-mist-500">
                  {b.paid_at ? new Date(b.paid_at).toLocaleDateString('fr-FR') : ''}
                  <span className="ml-2">
                    {b.amount_cents === 0
                      ? '🎁'
                      : `${(b.amount_cents / 100).toFixed(0)} €`}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* Custom requests */}
      <Section title="Mes collisions sur mesure">
        {!loaded ? (
          <p className="text-sm text-mist-400">Chargement…</p>
        ) : customs.length === 0 ? (
          <Empty text="Vous n'avez pas encore commandé de collision sur mesure." />
        ) : (
          <div className="space-y-3">
            {customs.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-ink-500 bg-ink-800/40 px-5 py-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm text-mist-200">
                    {c.domain_a} × {c.domain_b}
                  </span>
                  <StatusBadge status={c.status} />
                </div>
                <div className="mt-2 text-xs text-mist-500">
                  Commandé le{' '}
                  {c.created_at
                    ? new Date(c.created_at).toLocaleDateString('fr-FR')
                    : '—'}
                </div>
                {c.status === 'complete' && c.brief_id && (
                  <Link
                    href={`/discoveries/${c.brief_id}`}
                    className="mt-2 inline-block text-sm text-emerald-glow hover:text-emerald-bio"
                  >
                    Ouvrir le brief →
                  </Link>
                )}
                {c.status === 'running' && (
                  <p className="mt-1 text-xs text-amber-glow">
                    Estimation : quelques minutes
                  </p>
                )}
                {c.status === 'failed' && (
                  <p className="mt-1 text-xs text-red-400">
                    La collision n&apos;a pas produit de brief exploitable.
                    Remboursement en cours.
                    {' '}
                    <a
                      href="mailto:contact@spore-research.com"
                      className="underline"
                    >
                      Nous contacter
                    </a>
                    .
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Purchase history */}
      <Section title="Historique d'achats">
        {!loaded ? (
          <p className="text-sm text-mist-400">Chargement…</p>
        ) : purchases.length === 0 ? (
          <Empty text="Aucun achat pour le moment." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-500/50 text-xs uppercase tracking-widest text-mist-500">
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Montant</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2">Référence</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-ink-500/30 text-mist-200"
                  >
                    <td className="py-2 pr-4">{purchaseLabel(p.type)}</td>
                    <td className="py-2 pr-4 font-mono">
                      {p.amount_cents === 0
                        ? 'Gratuit'
                        : `${(p.amount_cents / 100).toFixed(2)} €`}
                    </td>
                    <td className="py-2 pr-4 text-mist-400">
                      {p.paid_at
                        ? new Date(p.paid_at).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="py-2 font-mono text-xs text-mist-500">
                      {p.stripe_session_id
                        ? p.stripe_session_id.slice(0, 16) + '…'
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-10 font-display text-4xl text-mist-100">Mon compte</h1>
      {children}
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
      <h2 className="mb-4 font-display text-2xl text-mist-100">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-ink-500 bg-ink-800/40 px-5 py-4 text-sm text-mist-400">
      {text}
    </p>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-mist-500/20 text-mist-400',
    paid: 'bg-cyan-bio/15 text-cyan-glow',
    running: 'bg-amber-bio/15 text-amber-glow animate-pulse',
    complete: 'bg-emerald-bio/15 text-emerald-glow',
    failed: 'bg-red-500/15 text-red-400',
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] ?? styles.pending
      }`}
    >
      {label(status)}
    </span>
  );
}

function purchaseLabel(type: string): string {
  return (
    {
      single: 'Brief unitaire',
      pack_5: 'Pack 5 briefs',
      custom: 'Collision custom',
      free: 'Brief gratuit',
      launch_free: 'Brief — offre de lancement',
      launch_custom_free: 'Collision — offre de lancement',
    }[type] ?? type
  );
}
