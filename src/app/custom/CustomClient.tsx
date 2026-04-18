'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import EmailGate from '@/components/EmailGate';
import { useAuth } from '@/contexts/AuthContext';
import { api, ApiError, type AccountCustomRequest } from '@/lib/api';
import { label } from '@/lib/labels';

const EXCLUDED_KEYWORDS = [
  'weapons', 'weapon', 'armament', 'munition', 'ballistic',
  'surveillance', 'mass monitoring', 'facial recognition', 'spyware',
];

function isDomainExcluded(domain: string): boolean {
  const lower = domain.toLowerCase();
  return EXCLUDED_KEYWORDS.some((kw) =>
    new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(lower),
  );
}

const DOMAIN_SUGGESTIONS = [
  'Ant Colony Optimization',
  'Archaeogenetics',
  'Atmospheric Chemistry',
  'Computational Neuroscience',
  'Condensed Matter Physics',
  'Cryogenic Electronics',
  'Evolutionary Ecology',
  'Experimental Economics',
  'Federated Learning',
  'Gene Regulatory Networks',
  'Glaciology',
  'Graph Neural Networks',
  'Human Factors Engineering',
  'Mathematical Biology',
  'Metabolomics',
  'Molecular Gastronomy',
  'Neuromorphic Computing',
  'Nonlinear Dynamics',
  'Optogenetics',
  'Origami Engineering',
  'Particle Astrophysics',
  'Quantum Thermodynamics',
  'Reinforcement Learning',
  'Soft Robotics',
  'Stellar Archaeology',
  'Structural Geology',
  'Swarm Intelligence',
  'Synthetic Biology',
  'Systems Biology',
  'Topological Data Analysis',
  'Urban Metabolism',
  'Xenobiology',
];

type Mode = 'surprise' | 'targeted';

export default function CustomClient() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [mode, setMode] = useState<Mode>('surprise');
  const [domainA, setDomainA] = useState('');
  const [domainB, setDomainB] = useState('');
  const [showGate, setShowGate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [existing, setExisting] = useState<AccountCustomRequest | null>(null);
  const [existingLoaded, setExistingLoaded] = useState(false);

  // Check if the user already used their free custom collision.
  useEffect(() => {
    if (!isAuthenticated || isLoading) {
      setExistingLoaded(!isLoading);
      setExisting(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const list = await api.accountCustomRequests();
        if (cancelled) return;
        setExisting(list.length > 0 ? list[0] : null);
      } catch {
        if (!cancelled) setExisting(null);
      } finally {
        if (!cancelled) setExistingLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading]);

  const aClean = domainA.trim();
  const bClean = domainB.trim();
  const aReady = aClean.length > 2;
  const bReady = bClean.length > 2;
  const ready = mode === 'surprise' ? aReady : aReady && bReady;
  const identical =
    mode === 'targeted' &&
    aClean.length > 0 &&
    bClean.length > 0 &&
    aClean.toLowerCase() === bClean.toLowerCase();
  const excludedA = aReady && isDomainExcluded(domainA);
  const excludedB = mode === 'targeted' && bReady && isDomainExcluded(domainB);
  const hasExclusion = excludedA || excludedB;
  const quotaExhausted = Boolean(existing);
  const formDisabled = quotaExhausted;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!ready || formDisabled) return;
    if (identical) {
      setError('Les deux domaines doivent être différents.');
      return;
    }
    if (!isAuthenticated) {
      setShowGate(true);
      return;
    }
    setBusy(true);
    try {
      const payload =
        mode === 'surprise'
          ? { mode: 'surprise' as const, domain_a: aClean }
          : { mode: 'targeted' as const, domain_a: aClean, domain_b: bClean };
      const { custom_request_id } = await api.customFree(payload);
      router.push(`/custom/${custom_request_id}/status`);
    } catch (err) {
      setBusy(false);
      if (err instanceof ApiError && err.status === 409) {
        setError(
          "Vous avez déjà utilisé votre collision gratuite. Le service payant ouvrira prochainement.",
        );
      } else {
        setError((err as Error).message || 'Erreur lors du lancement de la collision.');
      }
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-bio/40 bg-emerald-bio/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-emerald-glow">
          🚀 Offre de lancement
        </div>
        <h1 className="font-display text-4xl text-mist-100 md:text-5xl">
          Votre collision à la carte
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-mist-400">
          Une collision sur mesure offerte par utilisateur pendant le lancement.
          Panel de 5 relecteurs, protocole en 3 phases, brief complet.
        </p>
      </header>

      {quotaExhausted && existing && (
        <div className="mb-8 rounded-2xl border border-amber-bio/30 bg-amber-bio/5 p-6">
          <h2 className="mb-2 font-display text-xl text-mist-100">
            Vous avez déjà utilisé votre collision gratuite
          </h2>
          <p className="mb-4 text-sm text-mist-300">
            Collision : <span className="font-mono text-mist-200">{existing.domain_a} × {existing.domain_b || '???'}</span>
            {' — '}
            <span className="text-amber-glow">{label(existing.status)}</span>
          </p>
          <p className="mb-4 text-sm text-mist-400">
            Le service payant (25 €/collision) ouvrira prochainement — inscrivez-vous
            à la newsletter pour être informé.
          </p>
          <div className="flex flex-wrap gap-3">
            {existing.id && (
              <Link
                href={`/custom/${existing.id}/status`}
                className="rounded-xl border border-emerald-bio/40 bg-emerald-bio/10 px-4 py-2 text-sm font-semibold text-emerald-glow hover:bg-emerald-bio/20"
              >
                Voir ma collision →
              </Link>
            )}
            <Link
              href="/discoveries"
              className="rounded-xl border border-ink-500 bg-ink-900 px-4 py-2 text-sm text-mist-200 hover:text-mist-100"
            >
              Explorer les briefs existants
            </Link>
          </div>
        </div>
      )}

      {/* Mode toggle */}
      <div
        className={`mb-4 flex rounded-full border border-ink-500 bg-ink-800/60 p-1 ${
          formDisabled ? 'pointer-events-none opacity-50' : ''
        }`}
        role="tablist"
        aria-label="Mode de collision"
      >
        <ModeTab
          active={mode === 'surprise'}
          onClick={() => setMode('surprise')}
          icon="🎲"
          label="Surprise"
          hint="SPORE choisit le 2ᵉ domaine"
        />
        <ModeTab
          active={mode === 'targeted'}
          onClick={() => setMode('targeted')}
          icon="🎯"
          label="Ciblée"
          hint="Vous choisissez les deux domaines"
        />
      </div>

      <form
        onSubmit={submit}
        className={`space-y-6 rounded-2xl border border-ink-500 bg-ink-800/40 p-6 md:p-8 ${
          formDisabled ? 'pointer-events-none opacity-50' : ''
        }`}
        aria-disabled={formDisabled}
      >
        {mode === 'surprise' ? (
          <>
            <DomainField
              label="Votre domaine de recherche"
              value={domainA}
              onChange={setDomainA}
              placeholder="ex. Quantum Thermodynamics"
              listId="domain-a-list"
              hint="Celui qui vous intéresse, peu importe lequel."
              disabled={formDisabled}
            />
            <p className="text-sm text-mist-400">
              SPORE va croiser votre domaine avec un domaine scientifique
              éloigné, choisi aléatoirement. C&apos;est là que naissent les
              meilleures surprises.
            </p>
          </>
        ) : (
          <>
            <DomainField
              label="Domaine A"
              value={domainA}
              onChange={setDomainA}
              placeholder="ex. Quantum Thermodynamics"
              listId="domain-a-list"
              hint="Choisissez parmi la liste ou tapez le vôtre."
              disabled={formDisabled}
            />
            <DomainField
              label="Domaine B"
              value={domainB}
              onChange={setDomainB}
              placeholder="ex. Reinforcement Learning"
              listId="domain-b-list"
              hint="Le plus éloigné de A, le mieux — c'est là que naît la nouveauté."
              disabled={formDisabled}
            />
          </>
        )}

        <datalist id="domain-a-list">
          {DOMAIN_SUGGESTIONS.map((d) => (
            <option key={`a-${d}`} value={d} />
          ))}
        </datalist>
        {mode === 'targeted' && (
          <datalist id="domain-b-list">
            {DOMAIN_SUGGESTIONS.map((d) => (
              <option key={`b-${d}`} value={d} />
            ))}
          </datalist>
        )}

        {ready && !identical && !formDisabled && (
          <CollisionRecap a={aClean} b={mode === 'surprise' ? null : bClean} />
        )}

        {identical && (
          <p className="text-sm text-amber-glow">
            ⚠️ Les deux domaines sont identiques — choisissez deux domaines distincts.
          </p>
        )}

        {hasExclusion && !identical && (
          <div className="space-y-1">
            {excludedA && (
              <p className="text-sm text-red-400">
                ⛔ Le domaine {mode === 'surprise' ? 'saisi' : 'A'} est exclu par notre charte éthique. Merci d&apos;en choisir un autre.
              </p>
            )}
            {excludedB && (
              <p className="text-sm text-red-400">
                ⛔ Le domaine B est exclu par notre charte éthique. Merci d&apos;en choisir un autre.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink-500 pt-6">
          <div>
            <div className="font-display text-2xl text-emerald-glow">
              🚀 Offre de lancement
            </div>
            <div className="text-xs text-mist-500">
              1 collision sur mesure offerte · sans carte · livraison en quelques minutes.
            </div>
          </div>
          <button
            type="submit"
            disabled={
              !ready || identical || hasExclusion || busy || isLoading || formDisabled
            }
            className="rounded-xl bg-emerald-bio px-6 py-3 text-sm font-semibold text-ink-900 hover:bg-emerald-glow disabled:opacity-50"
          >
            {busy
              ? 'Lancement…'
              : mode === 'surprise'
                ? '🎲 Lancer une collision surprise'
                : 'Lancer ma collision ciblée →'}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </form>

      {showGate && !isAuthenticated && (
        <div className="mt-8">
          <EmailGate
            headline="Un pas avant le lancement"
            subtext={
              mode === 'surprise'
                ? `Votre domaine : ${aClean}. Connectez-vous par email pour finaliser.`
                : `Votre collision : ${aClean} × ${bClean}. Connectez-vous par email pour finaliser.`
            }
            cta="Continuer"
            onSent={() => setShowGate(false)}
          />
        </div>
      )}

      {!existingLoaded && isAuthenticated && (
        <p className="mt-4 text-center text-xs text-mist-500">
          Vérification de votre quota de lancement…
        </p>
      )}
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  icon,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
        active
          ? 'bg-emerald-bio/20 text-emerald-glow shadow-[0_0_20px_rgba(16,185,129,0.15)]'
          : 'text-mist-400 hover:text-mist-100'
      }`}
    >
      <span aria-hidden className="text-base">{icon}</span>
      <span>{label}</span>
      <span className="hidden text-xs font-normal text-mist-500 sm:inline">— {hint}</span>
    </button>
  );
}

function DomainField({
  label,
  value,
  onChange,
  placeholder,
  listId,
  hint,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  listId: string;
  hint: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium text-mist-200">{label}</span>
        <span className="text-xs text-mist-500">{hint}</span>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        list={listId}
        required
        minLength={3}
        maxLength={80}
        disabled={disabled}
        className="w-full rounded-xl border border-ink-500 bg-ink-900 px-4 py-3 text-base text-mist-100 placeholder:text-mist-500 focus:border-emerald-bio focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

function CollisionRecap({ a, b }: { a: string; b: string | null }) {
  return (
    <div className="rounded-xl border border-emerald-bio/30 bg-emerald-bio/5 p-5">
      <p className="text-sm text-mist-200">
        SPORE va croiser{' '}
        <span className="font-display text-lg text-emerald-glow">{a}</span>{' '}
        ×{' '}
        {b ? (
          <span className="font-display text-lg text-emerald-glow">{b}</span>
        ) : (
          <span className="font-display text-lg text-mist-500" title="SPORE choisira un domaine éloigné au hasard">
            ???
          </span>
        )}{' '}
        et générer un brief de recherche complet.
      </p>
    </div>
  );
}
