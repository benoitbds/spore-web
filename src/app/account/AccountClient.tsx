'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  api,
  type AccountBrief,
  type AccountCustomRequest,
  type AccountPurchase,
} from '@/lib/api';

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
        <p className="text-mist-300">
          Connectez-vous pour accéder à votre espace personnel.
        </p>
        <Link
          href="/pricing"
          className="mt-4 inline-block rounded-xl bg-emerald-bio px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-emerald-glow"
        >
          Commencer
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Credits */}
      <Section title="Mes crédits">
        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-2xl border border-ink-500 bg-ink-800/40 px-6 py-5">
            <div className="text-xs uppercase tracking-widest text-mist-500">
              Solde
            </div>
            <div className="mt-1 font-display text-4xl text-mist-100">
              {user?.credits ?? 0}{' '}
              <span className="text-xl text-mist-400">
                crédit{(user?.credits ?? 0) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          {user && !user.free_brief_used && (
            <div className="rounded-2xl border border-emerald-bio/40 bg-emerald-bio/5 px-6 py-5">
              <span className="text-2xl">🎁</span>
              <span className="ml-2 text-sm text-emerald-glow">
                1 brief offert disponible
              </span>
            </div>
          )}
          <Link
            href="/pricing"
            className="rounded-xl border border-ink-500 bg-ink-900 px-5 py-3 text-sm text-mist-200 hover:text-mist-100"
          >
            Acheter des crédits →
          </Link>
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
                      · {b.panel_verdict}
                    </span>
                  )}
                </div>
                <div className="text-xs text-mist-500">
                  {b.paid_at ? new Date(b.paid_at).toLocaleDateString('fr-FR') : ''}
                  <span className="ml-2">
                    {b.purchase_type === 'free' ? '🎁' : `${(b.amount_cents / 100).toFixed(0)} €`}
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
      {status}
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
    }[type] ?? type
  );
}
