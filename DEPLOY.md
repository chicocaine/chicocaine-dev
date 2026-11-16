# Deploy Runbook

Release checklist for pushing `chicocaine-dev` to Cloudflare Workers.

**Deploy order (do not skip):** commit → migrate → seed → secrets → deploy → verify.

- D1 binding: `streak_db`
- D1 database: `streak-db`
- Worker name: `chicocaine-dev`
- Secrets live in `.dev.vars` (gitignored — never commit them)

---

## 0. Pre-flight

```bash
# Confirm you're logged into the right account
wrangler whoami

# Confirm deps are installed and types are current
pnpm install
pnpm run cf-typegen   # regenerate worker-configuration.d.ts after any binding change
```

`wrangler whoami` should show the account that owns `streak-db` and the `chicocaine-dev` Worker.

---

## 1. Commit the changes

Commit in logical groups so each is independently reviewable/revertible.

```bash
# 1. Dependencies + workspace
git add package.json pnpm-lock.yaml pnpm-workspace.yaml
git commit -m "chore(deps): add argon2id and vitest, align pnpm workspace"

# 2. Database schema + seed data
git add migrations/ seed/
git commit -m "feat(db): add streak schema migration and seed data"

# 3. Worker API + passkey auth + tests
git add worker/index.ts src/scripts/ src/types/ test/ vitest.config.ts
git commit -m "feat(api): add streak CRUD API with argon2id passkey auth"

# 4. Streak page + routing + nav
git add src/pages/streak/ src/App.tsx src/components/Navbar.tsx
git commit -m "feat(streaks): add streak page with route and nav link"

# 5. Resume / CV pages
git add src/pages/resume-cv/
git commit -m "feat(resume): add resume and CV pages"

# 6. Small UI polish
git add src/components/Footer.tsx src/pages/Contact.tsx
git commit -m "chore(ui): add NGL footer link and type contact API response"

# 7. Docs
git add README.md DEPLOY.md
git commit -m "docs: add dev, D1, and deploy instructions"

# Push everything
git push
```

> Group 3 folds the passkey tests in with the API they exercise. If you prefer,
> split `test/` + `vitest.config.ts` into their own `test: add passkey auth tests`
> commit — the order above keeps them adjacent.

---

## 2. Migrate the remote D1 database

```bash
# Preview what will apply
pnpm exec wrangler d1 migrations list streak-db --remote

# Apply pending migrations
pnpm exec wrangler d1 migrations apply streak-db --remote
```

---

## 3. Seed the remote D1 database (production)

```bash
pnpm exec wrangler d1 execute streak-db --remote --file=./seed/prod.sql
```

> **One-time only.** `prod.sql` inserts explicit `id`s and fixed timestamps, so it
> is **not idempotent** — running it against a non-empty DB errors on UNIQUE
> constraints. To re-seed from scratch, clear the tables first:
>
> ```bash
> pnpm exec wrangler d1 execute streak-db --remote --command \
>   "DELETE FROM streak_logs; DELETE FROM streak_milestones; DELETE FROM streaks;"
> ```

Verify the seed landed:

```bash
pnpm exec wrangler d1 execute streak-db --remote --command "SELECT id, key, label FROM streaks ORDER BY id;"
```

---

## 4. Set Worker secret (passkey hash)

`PASSKEY_HASH` is the only credential the API accepts; it lives in `.dev.vars`.
Set it as a **Worker secret** (interactive prompt — paste only the value, not the
`PASSKEY_HASH=` prefix):

```bash
wrangler secret put PASSKEY_HASH
```

Verify:

```bash
wrangler secret list
```

> Never pass the value as a CLI argument or `echo` it into the command — use the
> interactive prompt (or `wrangler secret bulk secrets.json` if scripting).
> If you don't already have one, create a `.dev.vars.example` (gitignored entries
> are un-ignored for it) documenting the key with a placeholder value.

---

## 5. Deploy

```bash
pnpm run deploy   # == pnpm run build && wrangler deploy
```

`wrangler deploy` prints the live URL (default: `https://chicocaine-dev.<subdomain>.workers.dev`).

---

## 6. Verify

```bash
# Streak API should return seeded streaks (no auth needed for GET)
curl -s https://chicocaine-dev.<subdomain>.workers.dev/api/streak

# Mutation should 401 without a valid passkey
curl -s -o /dev/null -w "%{http_code}\n" \
  -X POST https://chicocaine-dev.<subdomain>.workers.dev/api/streak \
  -H 'content-type: application/json' \
  -d '{"action":"logStreak","passkey":"wrong","metadata":{"key":"doomscroll"}}'
```

Expected: GET returns the three seeded streaks; the unauthenticated POST returns `401`.

---

## Rollback

```bash
# Roll the Worker back to the previous version
wrangler rollback

# Or list versions and pick one
wrangler versions list
wrangler rollback <VERSION_ID>
```

Note: `wrangler rollback` reverts code only — it does **not** revert D1 data or
secrets. Revert data by clearing/re-seeding as shown in §3.
