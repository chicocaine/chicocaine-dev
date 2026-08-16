## Personal Site + Web Portfolio

> Made using React + TypeScript + TailwindCSS
> Full-stack on Cloudflare Workers (D1 + `@cloudflare/vite-plugin`)

### Requirements

- Node.js 24+
- [pnpm](https://pnpm.io)

### Dev Commands

| Command | Description |
| --- | --- |
| `pnpm install` | Install dependencies |
| `pnpm run dev` | Full-stack dev server (frontend + Worker) at http://localhost:5173 |
| `pnpm exec wrangler dev` | Run just the Worker at http://localhost:8787 |
| `pnpm run build` | Type-check and build to `dist/` |
| `pnpm run deploy` | Build and deploy to Cloudflare |
| `pnpm run lint` | Run ESLint |
| `pnpm run cf-typegen` | Regenerate `worker-configuration.d.ts` after config/binding changes |

### Local D1 (`streak-db`)

Both dev servers persist local state to `.wrangler/state/` — it's gitignored and safe to delete (dev data only, recreated from migrations).

```sh
# Apply migrations to the local database
pnpm exec wrangler d1 migrations apply streak-db --local

# Seed local dev rows
pnpm exec wrangler d1 execute streak-db --local --file=seed/dev.sql

# Apply migrations to the remote (production) database
pnpm exec wrangler d1 migrations apply streak-db --remote
```

### Notes

- Keep `wrangler` and `@cloudflare/vite-plugin` versions aligned so both resolve to a single workerd (`pnpm why workerd`). If they diverge, `pnpm run dev` crashes on startup with `table _cf_ALARM ... SQLITE_ERROR`.
