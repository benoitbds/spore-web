'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

/**
 * Inline tooltip rendered next to any "Nouveauté" score on the site (home,
 * stats, briefs index sort, brief detail). Click-to-toggle on mobile,
 * hover-to-reveal on desktop, keyboard-accessible via the trigger button.
 *
 * Single source of truth for the disclaimer copy — keep all four
 * placements consistent.
 */
export default function NoveltyScoreTooltip({
  className = '',
}: {
  className?: string;
}) {
  const t = useTranslations('novelty');
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <span
      ref={root}
      className={`group relative inline-flex align-middle ${className}`}
    >
      <button
        type="button"
        aria-label={t('tooltipAria')}
        aria-describedby={tooltipId}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-mist-500/40 text-[10px] leading-none text-mist-400 transition-colors hover:border-mist-400/70 hover:text-mist-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-bio/60"
      >
        <span aria-hidden>i</span>
      </button>

      <span
        id={tooltipId}
        role="tooltip"
        className={`absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-xl border border-ink-500 bg-ink-900/95 p-3 text-[11px] normal-case leading-relaxed text-mist-300 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-sm transition-opacity duration-150 ${
          open
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100'
        }`}
      >
        {t('tooltipBody')}{' '}
        <Link
          href="/methodology#novelty"
          className="text-emerald-glow underline-offset-2 hover:underline"
        >
          {t('tooltipLink')}
        </Link>
        .
      </span>
    </span>
  );
}
