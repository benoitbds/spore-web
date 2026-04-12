export default function Footer() {
  return (
    <footer className="border-t border-ink-500/50 bg-ink-800/30 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl">🧬</span>
              <span className="font-display text-lg text-mist-100">SPORE</span>
            </div>
            <p className="text-sm text-mist-400 leading-relaxed">
              Système de Production d'Opportunités de Recherche par Exploration.
              L'IA qui croise les sciences pour imaginer les découvertes de demain.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-mist-500">
              Explorer
            </h4>
            <ul className="space-y-2 text-sm text-mist-400">
              <li><a href="/discoveries" className="hover:text-emerald-glow transition-colors">Découvertes</a></li>
              <li><a href="/how-it-works" className="hover:text-emerald-glow transition-colors">Comment ça marche</a></li>
              <li><a href="/stats" className="hover:text-emerald-glow transition-colors">Statistiques</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-mist-500">
              À propos
            </h4>
            <ul className="space-y-2 text-sm text-mist-400">
              <li>
                <span className="text-mist-300">Construit par</span>{' '}
                <span className="font-medium text-mist-100">Bac</span>
              </li>
              <li>
                <span className="text-mist-300">Propulsé par</span>{' '}
                <span className="font-medium text-emerald-glow">DeepSeek · Claude · Semantic Scholar</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-ink-500/50 pt-6 text-xs text-mist-500 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} SPORE. Zero bibliographic hallucinations.</p>
          <p className="font-mono">v2 · post-fire pipeline active</p>
        </div>
      </div>
    </footer>
  );
}
