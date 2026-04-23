'use client';

/**
 * StubBriefClient — renders the honest "no bridge" analysis produced by
 * ``agents/stub_brief.py`` for custom collisions that Synthesis refused
 * to bridge. Deliberately simple: an info-banner (neutral tone, not red)
 * + the Markdown body + an invitation to try another collision.
 *
 * The regular BriefDetailClient expects a full pipeline payload
 * (sharpened / panel / protocol / grounding), none of which exists on
 * a stub brief. Rather than branching a 600-line component, we route
 * the stub case to this dedicated renderer from page.tsx.
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

interface Props {
  briefId: string;
  title: string;
  domainA: string;
  domainB: string;
  markdown: string;
  generatedAt: string | null;
}

export default function StubBriefClient({
  briefId,
  title,
  domainA,
  domainB,
  markdown,
  generatedAt,
}: Props) {
  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-8">
        <p className="mb-3 font-mono text-xs text-mist-500">{briefId}</p>
        <h1 className="font-display text-3xl text-mist-100 md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-mist-400">
          <span className="font-mono">{domainA}</span> ×{' '}
          <span className="font-mono">{domainB}</span>
          {generatedAt ? (
            <span className="ml-3 text-mist-500">
              · {new Date(generatedAt).toLocaleDateString('fr-FR')}
            </span>
          ) : null}
        </p>
      </header>

      <div className="mb-8 rounded-2xl border border-mist-400/30 bg-mist-500/5 p-5">
        <div className="flex items-start gap-3">
          <span className="text-xl leading-none">ℹ️</span>
          <div className="text-sm text-mist-300 leading-relaxed">
            <p className="mb-1 font-medium text-mist-200">
              Cette collision n&apos;a pas produit d&apos;hypothèse exploitable.
            </p>
            <p>
              SPORE privilégie l&apos;honnêteté scientifique à une synthèse
              forcée. Voici l&apos;analyse des raisons de cet échec et des
              pistes alternatives.
            </p>
          </div>
        </div>
      </div>

      <div className="prose prose-invert max-w-none prose-headings:font-display prose-headings:text-mist-100 prose-p:text-mist-300 prose-li:text-mist-300 prose-strong:text-mist-100">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>

      <div className="mt-12 flex flex-wrap gap-3 border-t border-ink-500 pt-8">
        <Link
          href="/custom"
          className="rounded-xl bg-emerald-bio px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-emerald-glow"
        >
          Essayer une autre collision →
        </Link>
        <Link
          href="/discoveries"
          className="rounded-xl border border-ink-500 bg-ink-800/60 px-5 py-3 text-sm text-mist-200 hover:text-mist-100"
        >
          Parcourir les briefs existants
        </Link>
      </div>
    </article>
  );
}
