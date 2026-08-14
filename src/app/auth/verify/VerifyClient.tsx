'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getToken } from '@/lib/auth-storage';
import { ROOT_LOCALE } from '@/i18n/routing';

type VerifyStatus = 'pending' | 'success' | 'error';

/** Landing page for a verified link, from the ?next= query parameter.
 *
 * Two things this guards. The value is handed to router.replace, and it
 * comes from a URL the user can be sent by anyone, so it must be a path
 * on this site — a single leading slash, since "//evil.com" is
 * protocol-relative and would leave the origin. And the fallback has to
 * carry a locale: a bare /briefs would go through the middleware's
 * rescue redirect, landing the reader in whichever locale their cookie
 * says rather than the one they were reading (GSC-F9). Callers all pass
 * a prefixed path now; this only catches hand-edited links. */
function safeRedirect(next: string | null): string {
  return next && /^\/(?!\/)/.test(next) ? next : `/${ROOT_LOCALE}/briefs`;
}

function VerifyClient() {
  const params = useSearchParams();
  const router = useRouter();
  const { verify, refresh } = useAuth();
  const [status, setStatus] = useState<VerifyStatus>('pending');
  const [error, setError] = useState<string | null>(null);
  // Guards against React StrictMode's double-invocation in dev, and any
  // accidental re-run of this effect — magic-link tokens are single-shot,
  // so a second call would always fail (400 "already used") and wipe the
  // JWT the first call just issued.
  const hasVerified = useRef(false);

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setError('Lien invalide : aucun token fourni.');
      return;
    }
    if (hasVerified.current) return;
    hasVerified.current = true;

    (async () => {
      try {
        await verify(token);
        setStatus('success');
        const redirect = safeRedirect(params.get('next'));
        // Small delay so the user sees the confirmation before redirect.
        setTimeout(() => router.replace(redirect), 900);
      } catch (err) {
        // Fallback: if the call failed but the session is actually live
        // (e.g. a prior call under StrictMode already succeeded before
        //  the backend fix landed), treat this as success instead of
        // dumping the user on an "invalid link" screen.
        try {
          await refresh();
        } catch {
          // swallow — we'll fall back to the error path below
        }
        if (getToken()) {
          setStatus('success');
          const redirect = safeRedirect(params.get('next'));
          setTimeout(() => router.replace(redirect), 900);
          return;
        }
        setStatus('error');
        setError(
          (err as Error).message ||
            'Lien expiré ou invalide. Redemandez un accès.',
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      {status === 'pending' && (
        <>
          <div className="mb-6 text-4xl">🧬</div>
          <h1 className="font-display text-3xl text-mist-100">
            Connexion en cours…
          </h1>
          <p className="mt-3 text-mist-400">Vérification du lien magique.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div className="mb-6 text-4xl">✅</div>
          <h1 className="font-display text-3xl text-mist-100">Connecté</h1>
          <p className="mt-3 text-mist-400">Redirection…</p>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="mb-6 text-4xl">⚠️</div>
          <h1 className="font-display text-3xl text-mist-100">
            Lien invalide
          </h1>
          <p className="mt-3 text-mist-400">
            {error || 'Lien expiré ou déjà utilisé.'}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={`/${ROOT_LOCALE}/briefs`}
              className="rounded-xl border border-ink-500 bg-ink-800/60 px-5 py-3 text-sm text-mist-200 hover:text-mist-100"
            >
              ← Retour aux briefs
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl px-6 py-20 text-center text-mist-400">
          Chargement…
        </div>
      }
    >
      <VerifyClient />
    </Suspense>
  );
}
