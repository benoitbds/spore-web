# spore-web — Frontend Next.js de SPORE

## Remote git

- Remote : `git@github.com:benoitbds/spore-web.git` (privé)
- Auth : clé SSH `~/.ssh/id_ed25519_github` via `~/.ssh/config`
- Convention : push après chaque sprint mergé sur master, ou immédiatement pour les commits sensibles
- Backup : GitHub privé est le backup distant officiel de SPORE

## Déploiement

- Servi par pm2 (process `spore-web`, port 3012)
- Reverse proxy openresty → spore-research.com
- Restart : `pm2 restart spore-web --update-env`
- Logs : `pm2 logs spore-web`

## Build

- `npm run build` (Next 14, app router)
- Si bug bizarre après deploy : `rm -rf .next && npm run build && pm2 restart spore-web`
