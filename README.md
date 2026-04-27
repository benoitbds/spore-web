# SPORE — Public Site

Next.js 14 public website for SPORE (Système de Production d'Opportunités de Recherche par Exploration).

## Development

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Data

Research briefs are symlinked from `../spore-poc/outputs/briefs/`. Global stats are regenerated from the SQLite DB via a Python script in the spore-poc repo.

To refresh stats:
```bash
cd ../spore-poc && .venv/bin/python scripts/export_stats.py
```

## Pages

- `/` — Landing with hero, latest brief, how-it-works preview
- `/briefs` — Catalogue of research briefs
- `/briefs/[id]` — Full brief with Comprendre/Recherche tabs
- `/how-it-works` — Pipeline visualization
- `/stats` — Public dashboard

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- react-markdown
