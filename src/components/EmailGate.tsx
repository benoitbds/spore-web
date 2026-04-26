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
  /**
   * Optional handler that replaces the default ``login(email)`` call.
   *
   * When provided, the submit flow dispatches to this callback with the
   * entered email instead of sending a plain magic-link request. Callers
   * use it to attach context (e.g. a pending custom-collision selection)
   * to the signup/login request before the magic link is sent.
   *
   * Must throw (or reject) on failure so the gate can surface an error.
   */
  onSubmitWithContext?: (email: string) => Promise<void>;
  /**
   * Optional post-verify redirect path forwarded to the magic-link
   * request body. Used when the CTA lives on a content page (e.g. a
   * brief detail) and we want the user to land back on that page after
   * clicking the emailed link, rather than the default /briefs.
   * Ignored when ``onSubmitWithContext`` is provided — callers using the
   * context branch already persist their own intent server-side.
   */
  next?: string;
  className?: string;
}

export default function EmailGate({
  headline = 'Téléchargez le brief complet — gratuit',
  subtext = 'Un lien d\'accès sera envoyé à votre email. Pas de mot de passe.',
  cta = 'Recevoir le lien',
  onSent,
  onSubmitWithContext,
  next,
  className = '',
}: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'sent' | 'error'>(
    'idle',
  );
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  function validateEmail(v: string): boolean {
    setValidationError(null);
    if (!v) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      setValidationError('Email invalide. Merci de vérifier le format.');
      return false;
    }
    return true;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === 'pending') return;
    if (!validateEmail(email)) return;
    setStatus('pending');
    setError(null);
    try {
      if (onSubmitWithContext) {
        await onSubmitWithContext(email);
      } else {
        await login(email, next);
      }
      setStatus('sent');
      // Delay onSent so the parent (e.g. header dropdown) doesn't
      // close before the user reads the confirmation message.
      setTimeout(() => onSent?.(email), 8000);
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
        <div className="flex items-start gap-3">
          <span className="text-xl">✅</span>
          <div>
            <p className="text-sm font-medium text-emerald-glow">
              Lien envoyé à <span className="font-mono">{email}</span>
            </p>
            <p className="mt-1 text-xs text-mist-300">
              Vérifiez votre boîte de réception (et vos spams).
              Le lien est valable 24 h.
            </p>
          </div>
        </div>
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
          title="Veuillez entrer une adresse email valide"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (validationError) setValidationError(null);
          }}
          className={`flex-1 rounded-xl border bg-ink-900 px-4 py-3 text-sm text-mist-100 placeholder:text-mist-500 focus:outline-none ${
            validationError
              ? 'border-red-500 focus:border-red-400'
              : 'border-ink-500 focus:border-emerald-bio'
          }`}
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
      {validationError && (
        <p className="mt-2 text-sm text-red-400" role="alert">
          {validationError}
        </p>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
