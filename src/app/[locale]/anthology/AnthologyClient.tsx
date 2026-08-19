'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { api, ApiError } from '@/lib/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string };

export default function AnthologyClient() {
  const router = useRouter();
  const t = useTranslations('anthologyPage');
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setState({ kind: 'error', message: t('form_errorInvalidEmail') });
      return;
    }

    setState({ kind: 'loading' });
    try {
      await api.requestAnthology({ email: trimmed });
      router.push('/anthology/sent');
    } catch (err) {
      const fallback = t('form_errorFallback');
      const msg =
        err instanceof ApiError
          ? typeof err.message === 'string' && err.message.length > 0
            ? err.message
            : fallback
          : fallback;
      setState({ kind: 'error', message: msg });
    }
  };

  const isBusy = state.kind === 'loading';

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-emerald-bio/40 bg-emerald-bio/5 p-6 md:p-8"
    >
      <label
        htmlFor="anthology-email"
        className="mb-2 block text-xs font-medium uppercase tracking-widest text-emerald-glow"
      >
        {t('form_label')}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <input
          id="anthology-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isBusy}
          placeholder={t('form_emailPlaceholder')}
          className="flex-1 rounded-xl border border-ink-500 bg-ink-900/60 px-4 py-3 text-sm text-mist-100 placeholder:text-mist-500 focus:border-emerald-bio/60 focus:outline-none focus:ring-1 focus:ring-emerald-bio/40 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isBusy}
          className="rounded-xl bg-emerald-bio px-5 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-emerald-glow disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? t('form_buttonLoading') : t('form_buttonIdle')}
        </button>
      </div>

      <div aria-live="polite" className="mt-3 min-h-[1.25rem] text-xs">
        {state.kind === 'error' && (
          <p className="text-amber-glow">{state.message}</p>
        )}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-mist-500">
        {t('form_privacyNote')}
      </p>
    </form>
  );
}
