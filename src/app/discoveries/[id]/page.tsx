import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllBriefs, getBriefById, getBriefMarkdown } from '@/lib/briefs';
import BriefDetailClient from './BriefDetailClient';

interface Params {
  params: { id: string };
}

export async function generateStaticParams() {
  return getAllBriefs().map((b) => ({ id: b.brief_id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const brief = getBriefById(params.id);
  if (!brief) return { title: 'Brief introuvable' };
  return {
    title: brief.sharpened.title,
    description: brief.sharpened.formal_statement.slice(0, 160),
  };
}

export default function BriefDetailPage({ params }: Params) {
  const brief = getBriefById(params.id);
  if (!brief) notFound();

  const markdown = getBriefMarkdown(params.id);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link
        href="/discoveries"
        className="group mb-8 inline-flex items-center gap-2 text-sm text-mist-400 hover:text-emerald-glow transition-colors"
      >
        <span className="transition-transform group-hover:-translate-x-1">←</span>
        Toutes les découvertes
      </Link>

      <BriefDetailClient brief={brief} markdown={markdown} />
    </div>
  );
}
