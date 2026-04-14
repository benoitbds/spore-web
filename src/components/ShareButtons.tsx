'use client';

import { useState } from 'react';

interface Props {
  /** Text used as the share message on X and the visible label. */
  title: string;
  /** Optional absolute URL. Defaults to window.location.href at click time. */
  url?: string;
  className?: string;
}

/**
 * Compact share row for a discovery page — copy link, X, LinkedIn.
 *
 * Icons are inline SVG so we ship no extra dep. Each button has a min
 * touch target of 44×44px via p-2.5 on a 24px icon.
 */
export default function ShareButtons({ title, url, className = '' }: Props) {
  const [copied, setCopied] = useState(false);

  const resolveUrl = () => {
    if (url) return url;
    if (typeof window !== 'undefined') return window.location.href;
    return '';
  };

  const onCopy = async () => {
    const link = resolveUrl();
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard denied — nothing useful we can do silently.
    }
  };

  const twitterHref = () => {
    const link = resolveUrl();
    const params = new URLSearchParams({ text: title, url: link });
    return `https://twitter.com/intent/tweet?${params.toString()}`;
  };

  const linkedinHref = () => {
    const link = resolveUrl();
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`;
  };

  const btn =
    'inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full ' +
    'border border-ink-500 bg-ink-800/40 px-3 text-xs text-mist-300 ' +
    'transition-all hover:border-emerald-bio/50 hover:bg-ink-800/70 hover:text-mist-100';

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="mr-1 text-[11px] uppercase tracking-widest text-mist-500">
        Partager
      </span>

      <button type="button" onClick={onCopy} className={btn} aria-label="Copier le lien">
        <IconLink className="h-4 w-4" />
        <span className="hidden sm:inline">
          {copied ? 'Lien copié ✓' : 'Copier le lien'}
        </span>
      </button>

      <a
        href={twitterHref()}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
        aria-label="Partager sur X"
      >
        <IconX className="h-4 w-4" />
        <span className="hidden sm:inline">X</span>
      </a>

      <a
        href={linkedinHref()}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
        aria-label="Partager sur LinkedIn"
      >
        <IconLinkedIn className="h-4 w-4" />
        <span className="hidden sm:inline">LinkedIn</span>
      </a>
    </div>
  );
}

function IconLink({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.5" />
      <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L12.5 19.5" />
    </svg>
  );
}

function IconX({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.97 6.817H1.677l7.73-8.835L1.25 2.25h6.829l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconLinkedIn({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.777 13.019H3.555V9h3.559v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />
    </svg>
  );
}
