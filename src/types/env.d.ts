// Worker secret bindings, injected from `.dev.vars` locally and
// `wrangler secret put` remotely. Declaration-merges with the generated
// `Env` in worker-configuration.d.ts (which only covers D1 bindings), so
// `env.PASSKEY_HASH` is typed everywhere.
interface Env {
  PASSKEY_HASH: string;
}
