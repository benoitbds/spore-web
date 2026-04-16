'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import EmailGate from '@/components/EmailGate';

/**
 * Header auth slot. Renders:
 *   - skeleton dot while rehydrating
 *   - "Se connecter" button (opens inline EmailGate dropdown) if anonymous
 *   - email + credits badge + logout menu if signed in
 *
 * Desktop-first; mobile surface is handled by the drawer separately.
 */
export default function AuthWidget({
  orientation = 'horizontal',
}: {
  orientation?: 'horizontal' | 'vertical';
}) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Click-outside to close (both dropdown and gate)
  useEffect(() => {
    if (!open && !showGate) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowGate(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, showGate]);

  if (isLoading) {
    return (
      <span
        aria-hidden="true"
        className="inline-block h-2 w-2 animate-pulse rounded-full bg-mist-500"
      />
    );
  }

  if (!isAuthenticated) {
    if (orientation === 'vertical') {
      return (
        <div className="border-t border-ink-500/50 px-4 pt-4">
          {showGate ? (
            <EmailGate
              headline="Connexion"
              subtext="Un lien magique vous sera envoyé par email."
              cta="Recevoir le lien"
              onSent={() => setShowGate(false)}
            />
          ) : (
            <button
              onClick={() => setShowGate(true)}
              className="w-full rounded-xl border border-emerald-bio bg-emerald-bio/10 px-4 py-3 text-sm font-semibold text-emerald-glow hover:bg-emerald-bio/20"
            >
              Se connecter
            </button>
          )}
        </div>
      );
    }

    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setShowGate((s) => !s)}
          className="text-sm text-mist-400 hover:text-emerald-glow"
        >
          Se connecter
        </button>
        {showGate && (
          <div className="absolute right-0 top-full z-50 mt-3 w-80">
            <EmailGate
              headline="Connexion"
              subtext="Un lien magique vous sera envoyé par email."
              cta="Recevoir le lien"
              onSent={() => setShowGate(false)}
            />
          </div>
        )}
      </div>
    );
  }

  const email = user?.email ?? '';
  const credits = user?.credits ?? 0;
  const freeAvailable = user ? !user.free_brief_used : false;
  const emailShort = email.length > 22 ? `${email.slice(0, 20)}…` : email;
  const creditLabel = freeAvailable
    ? '🎁 1 brief offert'
    : `${credits} crédit${credits !== 1 ? 's' : ''}`;

  if (orientation === 'vertical') {
    return (
      <div className="space-y-1 border-t border-ink-500/50 pt-4">
        <div className="px-4 text-xs text-mist-500">Connecté</div>
        <div className="px-4 text-sm text-mist-200">{emailShort}</div>
        <div className="px-4 text-xs text-emerald-glow">
          {creditLabel}
        </div>
        <button
          onClick={logout}
          className="mt-2 w-full rounded-xl px-4 py-2 text-left text-sm text-mist-400 hover:bg-ink-800/60 hover:text-red-400"
        >
          Déconnexion
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-ink-500 bg-ink-800/60 px-3 py-1.5 text-xs text-mist-200 hover:text-mist-100"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="hidden md:inline">{emailShort}</span>
        <span className="rounded-full bg-emerald-bio/15 px-2 py-0.5 font-mono text-emerald-glow">
          {freeAvailable ? '🎁' : `${credits} cr`}
        </span>
        <span className="text-mist-500">▾</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-ink-500 bg-ink-800 shadow-2xl"
        >
          <div className="border-b border-ink-500/50 px-4 py-3">
            <div className="text-xs text-mist-500">Connecté</div>
            <div className="text-sm text-mist-100">{emailShort}</div>
            <div className="mt-1 text-xs text-emerald-glow">
              {creditLabel}
            </div>
          </div>
          <Link
            href="/pricing"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-mist-200 hover:bg-ink-700/60"
          >
            Acheter des crédits
          </Link>
          <Link
            href="/custom"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-mist-200 hover:bg-ink-700/60"
          >
            Collision sur mesure
          </Link>
          <button
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="block w-full px-4 py-2 text-left text-sm text-mist-400 hover:bg-ink-700/60 hover:text-red-400"
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
