'use client';

/**
 * Inline email-gate form.
 *
 * Used in places where we need the user's email before unlocking content
 * (brief detail page, custom collision form, …). Submitting POSTs to
 * ``/api/auth/magic-link`` and switches to a "check your inbox" state.
 *
 * The form is deliberately controlled-by-the-caller: the caller passes
 * a ``headline`` and an optional ``subtext`` so the copy matches its
 * context (free-brief CTA vs. pre-checkout gate).
 */
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  headline?: string;
  subtext?: string;
  cta?: string;
  onSent?: (email: string) => void;
  className?: string;
}

export default function EmailGate({
  headline = 'Téléchargez le brief complet — gratuit',
  subtext = 'Un lien d\'accès sera envoyé à votre email. Pas de mot de passe.',
  cta = 'Recevoir le lien',
  onSent,
  className = '',
}: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'sent' | 'error'>(
    'idle',
  );
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === 'pending') return;
    setStatus('pending');
    setError(null);
    try {
      await login(email);
      setStatus('sent');
      onSent?.(email);
    } catch (err) {
      setStatus('error');
      setError((err as Error).message || 'Envoi impossible — réessayez.');
    }
  }

  if (status === 'sent') {
    return (
      <div
        className={`rounded-xl border border-emerald-bio/40 bg-emerald-bio/5 p-5 ${className}`}
      >
        <p className="text-sm text-emerald-glow">
          ✉️ Lien envoyé à <span className="font-mono">{email}</span>.
          <br />
          Ouvrez-le dans les 24 h pour débloquer votre brief.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={`rounded-2xl border border-ink-500 bg-ink-800/40 p-6 ${className}`}
    >
      <h3 className="mb-1 font-display text-xl text-mist-100">{headline}</h3>
      {subtext && <p className="mb-4 text-sm text-mist-400">{subtext}</p>}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          placeholder="vous@labo.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-xl border border-ink-500 bg-ink-900 px-4 py-3 text-sm text-mist-100 placeholder:text-mist-500 focus:border-emerald-bio focus:outline-none"
          disabled={status === 'pending'}
        />
        <button
          type="submit"
          disabled={status === 'pending' || !email}
          className="rounded-xl bg-emerald-bio px-5 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-emerald-glow disabled:opacity-50"
        >
          {status === 'pending' ? 'Envoi…' : cta}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
