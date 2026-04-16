'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

type VerifyStatus = 'pending' | 'success' | 'error';

function VerifyClient() {
  const params = useSearchParams();
  const router = useRouter();
  const { verify } = useAuth();
  const [status, setStatus] = useState<VerifyStatus>('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setError('Lien invalide : aucun token fourni.');
      return;
    }
    (async () => {
      try {
        await verify(token);
        setStatus('success');
        const redirect = params.get('next') || '/discoveries';
        // Small delay so the user sees the confirmation before redirect.
        setTimeout(() => router.replace(redirect), 900);
      } catch (err) {
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
              href="/discoveries"
              className="rounded-xl border border-ink-500 bg-ink-800/60 px-5 py-3 text-sm text-mist-200 hover:text-mist-100"
            >
              ← Retour aux découvertes
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
