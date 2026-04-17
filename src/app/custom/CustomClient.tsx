'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import EmailGate from '@/components/EmailGate';
import { useAuth } from '@/contexts/AuthContext';
import { api, ApiError, type AccountCustomRequest } from '@/lib/api';

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

export default function CustomClient() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
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

  const ready = domainA.trim().length > 2 && domainB.trim().length > 2;
  const identical =
    domainA.trim().toLowerCase() === domainB.trim().toLowerCase() &&
    domainA.trim() !== '';
  const excludedA = ready && isDomainExcluded(domainA);
  const excludedB = ready && isDomainExcluded(domainB);
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
      const { custom_request_id } = await api.customFree({
        domain_a: domainA.trim(),
        domain_b: domainB.trim(),
      });
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
          Donnez-nous 2 domaines scientifiques. SPORE force la collision,
          produit une hypothèse, la valide par un panel de 5 reviewers et
          vous livre le brief complet.{' '}
          <span className="font-medium text-emerald-glow">
            Une collision sur mesure offerte par utilisateur pendant le lancement.
          </span>
        </p>
      </header>

      {quotaExhausted && existing && (
        <div className="mb-8 rounded-2xl border border-amber-bio/30 bg-amber-bio/5 p-6">
          <h2 className="mb-2 font-display text-xl text-mist-100">
            Vous avez déjà utilisé votre collision gratuite
          </h2>
          <p className="mb-4 text-sm text-mist-300">
            Collision : <span className="font-mono text-mist-200">{existing.domain_a} × {existing.domain_b}</span>
            {' — '}
            <span className="text-amber-glow">{existing.status}</span>
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

      <form
        onSubmit={submit}
        className={`space-y-6 rounded-2xl border border-ink-500 bg-ink-800/40 p-6 md:p-8 ${
          formDisabled ? 'pointer-events-none opacity-50' : ''
        }`}
        aria-disabled={formDisabled}
      >
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
        <datalist id="domain-a-list">
          {DOMAIN_SUGGESTIONS.map((d) => (
            <option key={`a-${d}`} value={d} />
          ))}
        </datalist>
        <datalist id="domain-b-list">
          {DOMAIN_SUGGESTIONS.map((d) => (
            <option key={`b-${d}`} value={d} />
          ))}
        </datalist>

        {ready && !identical && !formDisabled && (
          <CollisionRecap a={domainA} b={domainB} />
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
                ⛔ Le domaine A est exclu par notre charte éthique. Merci d&apos;en choisir un autre.
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
            {busy ? 'Lancement…' : 'Lancer ma collision gratuite →'}
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
            subtext={`Votre collision : ${domainA} × ${domainB}. Connectez-vous par email pour finaliser.`}
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

function CollisionRecap({ a, b }: { a: string; b: string }) {
  return (
    <div className="rounded-xl border border-emerald-bio/30 bg-emerald-bio/5 p-5">
      <p className="text-sm text-mist-200">
        SPORE va croiser{' '}
        <span className="font-display text-lg text-emerald-glow">{a}</span>{' '}
        ×{' '}
        <span className="font-display text-lg text-emerald-glow">{b}</span>{' '}
        et générer un brief de recherche complet.
      </p>
    </div>
  );
}
