import Link from 'next/link';
import Counter from '@/components/Counter';
import AnimatedTitle from '@/components/AnimatedTitle';
import DomainBridge from '@/components/DomainBridge';
import BriefCard from '@/components/BriefCard';
import MyceliumBackground from '@/components/MyceliumBackground';
import { getAllBriefs, getFeaturedBrief, getStats } from '@/lib/briefs';

export default function HomePage() {
  const stats = getStats();
  const featured = getFeaturedBrief();
  const all = getAllBriefs();
  const others = all
    .filter((b) => b.brief_id !== featured?.brief_id)
    .slice(0, 3);

  const totalCollisions = stats?.totals.collisions ?? 0;
  const totalFire = stats?.totals.fire_hypotheses ?? 0;
  const totalBriefs = stats?.totals.briefs ?? 0;
  const avgNovelty = stats?.quality.avg_novelty_score ?? 0;

  return (
    <>
      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative flex min-h-[calc(100vh-72px)] items-center overflow-hidden">
        <MyceliumBackground density={0.6} className="opacity-70" />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink-900/40 to-ink-900 pointer-events-none" />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 py-20 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-bio/30 bg-emerald-bio/5 px-3 py-1 text-xs uppercase tracking-widest text-emerald-glow backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-glow animate-pulse" />
            Système génératif · v2
          </span>

          <AnimatedTitle
            text="L'IA qui croise les sciences pour imaginer les découvertes de demain"
            highlight="découvertes"
            as="h1"
            className="font-display text-4xl leading-[1.1] tracking-tight text-mist-100 md:text-6xl lg:text-7xl"
          />

          <p
            className="mt-6 max-w-2xl text-lg text-mist-400 md:text-xl animate-fade-in-slow opacity-0"
            style={{ animationDelay: '1s' }}
          >
            SPORE génère des hypothèses scientifiques disruptives en croisant
            aléatoirement des domaines éloignés, puis les valide avec{' '}
            <span className="text-mist-100">5 reviewers IA spécialisés</span>.
          </p>

          <div className="mt-14 grid w-full max-w-3xl grid-cols-3 gap-4 md:gap-8">
            <Counter value={totalCollisions} label="Collisions explorées" />
            <Counter value={totalFire} label="Hypothèses 🔥" />
            <Counter value={totalBriefs} label="Briefs publiés" />
          </div>

          <div className="mt-16 flex flex-col items-center gap-3">
            <Link
              href="/discoveries"
              className="group inline-flex items-center gap-2 rounded-full border border-emerald-bio/40 bg-emerald-bio/10 px-6 py-3 text-sm font-medium text-emerald-glow transition-all hover:border-emerald-bio/60 hover:bg-emerald-bio/20 hover:shadow-[0_0_40px_rgba(16,185,129,0.25)]"
            >
              Explorer les découvertes
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/how-it-works"
              className="text-xs text-mist-500 hover:text-mist-300 transition-colors"
            >
              ou comprendre le fonctionnement ↓
            </Link>
          </div>
        </div>
      </section>

      {/* ── LATEST DISCOVERY ────────────────────────────────── */}
      {featured && (
        <section className="relative border-t border-ink-500/50 py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-12 text-center">
              <span className="mb-3 inline-block text-xs uppercase tracking-[0.3em] text-emerald-glow">
                Dernière découverte
              </span>
              <h2 className="font-display text-3xl text-mist-100 md:text-5xl">
                {featured.sharpened.title}
              </h2>
            </div>

            <DomainBridge
              domainA={featured.domains[0]}
              domainB={featured.domains[1] || '—'}
            />

            <div className="mt-10 grid gap-8 md:grid-cols-5">
              <div className="md:col-span-3">
                <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-mist-500">
                  L'hypothèse
                </h3>
                <p className="text-lg text-mist-200 leading-relaxed">
                  {featured.sharpened.formal_statement}
                </p>
                <div className="mt-6 rounded-xl border border-ink-500 bg-ink-800/40 p-5">
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-widest text-amber-glow">
                    Critical path — ce qu'il faut démontrer
                  </h4>
                  <p className="text-sm text-mist-300 leading-relaxed">
                    {featured.panel.meta_review.critical_path}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 md:col-span-2">
                <MetricCard
                  label="Novelty"
                  value={featured.grounding.novelty_assessment.score.toFixed(2)}
                  sub={featured.grounding.novelty_assessment.verdict}
                  accent="emerald"
                />
                <MetricCard
                  label="Panel consensus"
                  value={`${featured.panel.meta_review.consensus_score.toFixed(1)}/10`}
                  sub={featured.panel.meta_review.verdict}
                  accent="cyan"
                />
                <MetricCard
                  label="Protocole"
                  value={featured.protocol.overall_timeline}
                  sub={featured.protocol.overall_budget_estimate}
                  accent="amber"
                />
              </div>
            </div>

            <div className="mt-10 flex justify-center">
              <Link
                href={`/discoveries/${featured.brief_id}`}
                className="group inline-flex items-center gap-2 rounded-full border border-mist-600 px-5 py-2.5 text-sm text-mist-200 transition-all hover:border-emerald-bio hover:text-emerald-glow"
              >
                Lire le brief complet
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS (3 COLS) ───────────────────────────── */}
      <section className="relative border-t border-ink-500/50 bg-ink-800/30 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-16 text-center">
            <span className="mb-3 inline-block text-xs uppercase tracking-[0.3em] text-cyan-glow">
              Comment ça marche
            </span>
            <h2 className="font-display text-3xl text-mist-100 md:text-5xl">
              De la collision au brief, en trois phases
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <StepCard
              step="01"
              icon="🎲"
              title="Collision"
              description="200 domaines scientifiques croisés aléatoirement. Un filtre impitoyable ne garde que les paires non-triviales."
              accent="emerald"
            />
            <StepCard
              step="02"
              icon="🧪"
              title="Validation"
              description="5 reviewers IA spécialisés challengent chaque hypothèse : méthodologue, domain expert, contrarian, industriel, funding strategist."
              accent="cyan"
            />
            <StepCard
              step="03"
              icon="📄"
              title="Publication"
              description="Un brief de recherche complet, sourcé sur Semantic Scholar (zéro hallucination), actionnable — protocole en 3 phases avec quick start."
              accent="amber"
            />
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/how-it-works"
              className="text-sm text-mist-400 hover:text-emerald-glow transition-colors"
            >
              Découvrir le pipeline détaillé →
            </Link>
          </div>
        </div>
      </section>

      {/* ── MORE DISCOVERIES ─────────────────────────────────── */}
      {others.length > 0 && (
        <section className="border-t border-ink-500/50 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <span className="mb-3 inline-block text-xs uppercase tracking-[0.3em] text-emerald-glow">
                  Plus de découvertes
                </span>
                <h2 className="font-display text-3xl text-mist-100 md:text-4xl">
                  D'autres hypothèses à explorer
                </h2>
              </div>
              <Link
                href="/discoveries"
                className="hidden md:inline-flex text-sm text-emerald-glow hover:text-emerald-bio transition-colors"
              >
                Tout voir →
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {others.map((brief, i) => (
                <BriefCard key={brief.brief_id} brief={brief} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BIG STATS ───────────────────────────────────────── */}
      {stats && (
        <section className="relative border-t border-ink-500/50 bg-ink-800/20 py-24 overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-[0.15]" />
          <div className="relative mx-auto max-w-5xl px-6">
            <div className="mb-14 text-center">
              <span className="mb-3 inline-block text-xs uppercase tracking-[0.3em] text-amber-glow">
                Les chiffres
              </span>
              <h2 className="font-display text-3xl text-mist-100 md:text-5xl">
                Mesuré, calibré, transparent
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-4">
              <BigStat
                value={avgNovelty ? avgNovelty.toFixed(2) : 'N/A'}
                label="Novelty score moyen"
                detail="sur /1.0"
              />
              <BigStat
                value={stats.top_domains.length.toString()}
                label="Domaines croisés"
                detail="dans les briefs"
              />
              <BigStat
                value={
                  stats.cost.per_brief_usd
                    ? `$${stats.cost.per_brief_usd.toFixed(2)}`
                    : 'N/A'
                }
                label="Coût par brief"
                detail="end-to-end"
              />
              <BigStat
                value="100%"
                label="Références vérifiées"
                detail="zéro hallucination"
              />
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: 'emerald' | 'cyan' | 'amber';
}) {
  const accents = {
    emerald: 'border-emerald-bio/30 bg-emerald-bio/5 text-emerald-glow',
    cyan: 'border-cyan-bio/30 bg-cyan-bio/5 text-cyan-glow',
    amber: 'border-amber-bio/30 bg-amber-bio/5 text-amber-glow',
  };
  return (
    <div className={`rounded-xl border ${accents[accent]} p-4`}>
      <div className="text-xs uppercase tracking-wider text-mist-500">{label}</div>
      <div className="mt-1 font-display text-3xl text-mist-100">{value}</div>
      <div className="mt-0.5 text-xs text-mist-400">{sub}</div>
    </div>
  );
}

function StepCard({
  step,
  icon,
  title,
  description,
  accent,
}: {
  step: string;
  icon: string;
  title: string;
  description: string;
  accent: 'emerald' | 'cyan' | 'amber';
}) {
  const accents = {
    emerald: 'from-emerald-bio/20 border-emerald-bio/30',
    cyan: 'from-cyan-bio/20 border-cyan-bio/30',
    amber: 'from-amber-bio/20 border-amber-bio/30',
  };
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br to-transparent ${accents[accent]} p-8`}
    >
      <div className="absolute right-4 top-4 font-mono text-xs text-mist-500">
        {step}
      </div>
      <div className="mb-4 text-5xl">{icon}</div>
      <h3 className="mb-2 font-display text-2xl text-mist-100">{title}</h3>
      <p className="text-sm text-mist-400 leading-relaxed">{description}</p>
    </div>
  );
}

function BigStat({
  value,
  label,
  detail,
}: {
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <div className="text-center">
      <div className="font-display text-5xl text-gradient-bio md:text-6xl">
        {value}
      </div>
      <div className="mt-2 text-sm font-medium text-mist-200">{label}</div>
      <div className="text-xs text-mist-500">{detail}</div>
    </div>
  );
}
