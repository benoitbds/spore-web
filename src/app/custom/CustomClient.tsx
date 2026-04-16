'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import EmailGate from '@/components/EmailGate';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

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

/**
 * A hand-picked whitelist of domains users can pick from. Free-text
 * input is still allowed (so researchers can request exotic domains),
 * but the suggestions keep the casual visitor anchored in scientific
 * territory — and steer away from the constitution-blocked terms.
 */
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
  const { isAuthenticated, isLoading } = useAuth();
  const [domainA, setDomainA] = useState('');
  const [domainB, setDomainB] = useState('');
  const [showGate, setShowGate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const ready = domainA.trim().length > 2 && domainB.trim().length > 2;
  const identical =
    domainA.trim().toLowerCase() === domainB.trim().toLowerCase() &&
    domainA.trim() !== '';
  const excludedA = ready && isDomainExcluded(domainA);
  const excludedB = ready && isDomainExcluded(domainB);
  const hasExclusion = excludedA || excludedB;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!ready) return;
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
      const { checkout_url } = await api.createCheckout({
        type: 'custom',
        domain_a: domainA.trim(),
        domain_b: domainB.trim(),
      });
      window.location.href = checkout_url;
    } catch (err) {
      setBusy(false);
      setError((err as Error).message || 'Erreur de paiement');
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10 text-center">
        <h1 className="font-display text-4xl text-mist-100 md:text-5xl">
          Votre collision à la carte
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-mist-400">
          Donnez-nous 2 domaines scientifiques. SPORE force la collision,
          produit une hypothèse, la valide par un panel de 5 reviewers et
          vous livre le brief complet sous 24 h.
        </p>
      </header>

      <form
        onSubmit={submit}
        className="space-y-6 rounded-2xl border border-ink-500 bg-ink-800/40 p-6 md:p-8"
      >
        <DomainField
          label="Domaine A"
          value={domainA}
          onChange={setDomainA}
          placeholder="ex. Quantum Thermodynamics"
          listId="domain-a-list"
          hint="Choisissez parmi la liste ou tapez le vôtre."
        />
        <DomainField
          label="Domaine B"
          value={domainB}
          onChange={setDomainB}
          placeholder="ex. Reinforcement Learning"
          listId="domain-b-list"
          hint="Le plus éloigné de A, le mieux — c'est là que naît la nouveauté."
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

        {ready && !identical && <CollisionRecap a={domainA} b={domainB} />}

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
            <div className="font-display text-2xl text-mist-100">25 €</div>
            <div className="text-xs text-mist-500">
              Paiement unique · livraison sous 24 h · remboursement si SPORE
              n&apos;identifie aucune hypothèse exploitable.
            </div>
          </div>
          <button
            type="submit"
            disabled={!ready || identical || hasExclusion || busy || isLoading}
            className="rounded-xl bg-emerald-bio px-6 py-3 text-sm font-semibold text-ink-900 hover:bg-emerald-glow disabled:opacity-50"
          >
            {busy ? 'Redirection…' : 'Commander — 25 €'}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </form>

      {showGate && (
        <div className="mt-8">
          <EmailGate
            headline="Un pas avant le paiement"
            subtext={`Votre collision : ${domainA} × ${domainB}. Connectez-vous par email pour finaliser la commande.`}
            cta="Continuer"
            onSent={() => setShowGate(false)}
          />
        </div>
      )}

      <p className="mt-10 text-center text-sm text-mist-500">
        Ou{' '}
        <Link href="/pricing" className="text-emerald-glow hover:text-emerald-bio">
          comparer les formules
        </Link>
        .
      </p>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  listId: string;
  hint: string;
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
        className="w-full rounded-xl border border-ink-500 bg-ink-900 px-4 py-3 text-base text-mist-100 placeholder:text-mist-500 focus:border-emerald-bio focus:outline-none"
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
