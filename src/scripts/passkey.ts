/// <reference path="../types/wasm.d.ts" />
import setupWasm from "argon2id/lib/setup.js";
import simdModule from "argon2id/dist/simd.wasm";
import noSimdModule from "argon2id/dist/no-simd.wasm";

// ---------------------------------------------------------------------------
// Argon2id passkey verification
//
// `hash-wasm` compiled its Argon2id WASM at runtime via `WebAssembly.compile`,
// which Cloudflare Workers blocks ("Wasm code generation disallowed by
// embedder"). We instead use `argon2id` (openpgpjs/argon2id), which ships
// precompiled `.wasm` binaries. Importing a `.wasm` file in a Worker yields a
// pre-compiled `WebAssembly.Module` (bundled by Wrangler), so no runtime code
// generation occurs.
// ---------------------------------------------------------------------------

// Safety bounds. Chosen for this app's config (m=65536, t=3, p=1, 32-byte tag,
// 16-byte salt) and Cloudflare Workers limits (~128 MiB memory). A stored PHC
// string outside these bounds is rejected rather than risking OOM or CPU
// exhaustion during the derivation.
const LIMITS = {
  memoryMinKiB: 8, // Argon2 spec floor (>= 8 * p)
  memoryMaxKiB: 65536, // 64 MiB — this app's config; fits Workers 128 MiB + JS heap
  passesMin: 1,
  passesMax: 16,
  parallelismMin: 1,
  parallelismMax: 8,
  saltMinBytes: 8,
  saltMaxBytes: 64,
  hashMinBytes: 16,
  hashMaxBytes: 64,
} as const;

// `WebAssembly.instantiate(module, imports)` returns just the `Instance` in
// Workers (the bytes overload that returns { instance, module } is disallowed),
// so wrap it into the shape `setupWasm` expects. SIMD is tried first with a
// non-SIMD fallback (matching the package's default entrypoint).
const loadWasm = (module: WebAssembly.Module) => {
  return async (imports: WebAssembly.Imports) => {
    const instance = await WebAssembly.instantiate(module, imports);
    return { instance, module };
  };
};

// Instantiate the Argon2id wasm once at module load, allocating the 65 MiB of
// wasm memory up front (matches this app's 64 MiB `m` cost without growing).
const argon2id = await setupWasm(loadWasm(simdModule), loadWasm(noSimdModule));

// decode the no-padding base64 used by the argon2 PHC format
function b64NoPadToBytes(b64: string): Uint8Array {
  const pad = (4 - (b64.length % 4)) % 4;
  const bin = atob(b64 + "=".repeat(pad));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// constant-time byte comparison for the derived tag
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// parse one "key=digits" pair out of the params section; false if malformed
function parseParam(params: Map<string, number>, kv: string): boolean {
  const eq = kv.indexOf("=");
  if (eq <= 0) return false;
  const key = kv.slice(0, eq);
  const value = kv.slice(eq + 1);
  if (key === "" || value === "" || !/^\d+$/.test(value)) return false;
  params.set(key, Number(value));
  return true;
}

// verify a passkey against an argon2id PHC string like:
//   $argon2id$v=19$m=65536,p=1,t=3$<salt>$<hash>
export function verifyArgon2(passkey: string, stored: string): boolean {
  // "$argon2id$..." splits into ["", "argon2id", "v=19", "m=..,t=..,p=..", salt, hash]
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "" || parts[1] !== "argon2id") return false;
  if (parts[2] !== "v=19") return false;

  const params = new Map<string, number>();
  for (const kv of parts[3].split(",")) {
    if (!parseParam(params, kv)) return false;
  }

  const m = params.get("m");
  const t = params.get("t");
  const p = params.get("p");
  if (m === undefined || t === undefined || p === undefined) return false;

  // validate parameters against the safety bounds before the expensive derivation
  if (
    !Number.isInteger(m) || m < LIMITS.memoryMinKiB || m > LIMITS.memoryMaxKiB ||
    !Number.isInteger(t) || t < LIMITS.passesMin || t > LIMITS.passesMax ||
    !Number.isInteger(p) || p < LIMITS.parallelismMin || p > LIMITS.parallelismMax ||
    m < 8 * p
  ) {
    return false;
  }

  const salt = b64NoPadToBytes(parts[4]);
  const expected = b64NoPadToBytes(parts[5]);

  if (salt.length < LIMITS.saltMinBytes || salt.length > LIMITS.saltMaxBytes) return false;
  if (expected.length < LIMITS.hashMinBytes || expected.length > LIMITS.hashMaxBytes) return false;

  let derived: Uint8Array;
  try {
    derived = argon2id({
      password: new TextEncoder().encode(passkey),
      salt,
      parallelism: p,
      passes: t,
      memorySize: m,
      tagLength: expected.length,
    });
  } catch {
    // never throw on malformed input; treat as a failed match
    return false;
  }

  return constantTimeEqual(derived, expected);
}

// The subset of Env that passkey authorization reads. Kept narrow so `authorize`
// is testable with a plain object and doesn't drag in D1 bindings.
export interface PasskeyConfig {
  PASSKEY_HASH?: string;
}

// a command is authentic if the passkey matches the configured hash.
export function authorize(config: PasskeyConfig, passkey: string | undefined): boolean {
  if (!passkey) return false;
  if (config.PASSKEY_HASH && verifyArgon2(passkey, config.PASSKEY_HASH)) return true;
  return false;
}
