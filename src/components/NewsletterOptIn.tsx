'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { api, ApiError } from '@/lib/api';

type Variant = 'compact' | 'full';
type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

interface Props {
  /** Signup origin marker — e.g. ``brief:SPR-2026-0386`` or ``about``. */
  source: string;
  /** Optional brief id when ``source`` starts with ``brief:``. */
  briefId?: string;
  /** Layout density — full = title + subtitle + form ; compact = form only. */
  variant?: Variant;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterOptIn({
  source,
  briefId,
  variant = 'full',
}: Props) {
  const t = useTranslations('newsletter');
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setState({
        kind: 'error',
        message: t('errorInvalidEmail'),
      });
      return;
    }

    setState({ kind: 'loading' });
    try {
      const res = await api.subscribeNewsletter({
        email: trimmed,
        source,
        ...(briefId ? { brief_id: briefId } : {}),
      });
      setState({ kind: 'success', message: res.message });
      setEmail('');
    } catch (err) {
      const fallback = t('errorFallback');
      const msg =
        err instanceof ApiError
          ? typeof err.message === 'string' && err.message.length > 0
            ? err.message
            : fallback
          : fallback;
      setState({ kind: 'error', message: msg });
    }
  };

  const isFull = variant === 'full';

  return (
    <section
      aria-labelledby="newsletter-optin-heading"
      className={`rounded-2xl border border-emerald-bio/30 bg-emerald-bio/5 ${
        isFull ? 'p-6 md:p-8' : 'p-5'
      }`}
    >
      {isFull && (
        <>
          <span className="mb-3 inline-block text-xs uppercase tracking-[0.3em] text-emerald-glow">
            Newsletter
          </span>
          <h2
            id="newsletter-optin-heading"
            className="mb-3 font-display text-2xl text-mist-100 md:text-3xl"
          >
            {t('headingFull')}
          </h2>
          <p className="mb-5 text-sm text-mist-300 leading-relaxed">
            {t('subtitleFull')}
          </p>
        </>
      )}

      <form
        onSubmit={submit}
        className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
      >
        <label htmlFor="newsletter-email" className="sr-only">
          {t('emailLabel')}
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state.kind === 'loading' || state.kind === 'success'}
          placeholder={t('emailPlaceholder')}
          className="flex-1 rounded-xl border border-ink-500 bg-ink-900/60 px-4 py-3 text-sm text-mist-100 placeholder:text-mist-500 focus:border-emerald-bio/60 focus:outline-none focus:ring-1 focus:ring-emerald-bio/40 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={state.kind === 'loading' || state.kind === 'success'}
          className="rounded-xl bg-emerald-bio px-5 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-emerald-glow disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.kind === 'loading' ? t('buttonLoading') : t('buttonIdle')}
        </button>
      </form>

      <div aria-live="polite" className="mt-3 min-h-[1.25rem] text-xs">
        {state.kind === 'success' && (
          <p className="text-emerald-glow">✓ {state.message}</p>
        )}
        {state.kind === 'error' && (
          <p className="text-amber-glow">{state.message}</p>
        )}
      </div>

      {isFull && (
        <p className="mt-4 text-[11px] leading-relaxed text-mist-500">
          {t('privacyNote')}
        </p>
      )}
    </section>
  );
}
