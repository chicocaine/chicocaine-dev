# encryptor

A small C tool that encrypts a plaintext file into the JSON envelope the
`/arcana` page reads.

- **Cipher:** XChaCha20-Poly1305 (IETF), detached — ciphertext and the 16-byte
  Poly1305 tag are stored as separate fields
- **Nonce:** fresh 24-byte random nonce per invocation (`randombytes_buf`)
- **Key:** exactly 32 bytes, supplied as 64 hex characters
- **Output:** `<outdir>/<title>.json` — one line, no trailing newline

The tool lives at `secret/encryptor` inside the project, which is how it finds
the project root for its default `outdir` (`src/messages`).

---

## 1. Build

Requires a C compiler and `libsodium` ≥ 1.0.18 plus its headers.

```bash
# Debian/Ubuntu
sudo apt install build-essential libsodium-dev
# Fedora
sudo dnf install gcc libsodium-devel
# macOS
brew install libsodium
```

```bash
cd secret
make            # -> cc -O2 -Wall -Wextra -o encryptor encryptor.c -lsodium
```

`make clean` removes the binary. Without `make`:

```bash
gcc -O2 -Wall -Wextra -o encryptor encryptor.c -lsodium
```

> `secret/.gitignore` ignores the binary, `*.o`, and `*.txt` — keep plaintext
> drafts in this directory as `.txt` so they can never be committed by accident.

---

## 2. Generate a key

```bash
make keygen     # prints 64 hex characters, e.g. 3d532467...4a14d468
```

That target is `xxd -l 32 -p /dev/urandom`. If `xxd` is missing:

```bash
openssl rand -hex 32
```

Store it somewhere safe and out of the repo — anyone with this string can read
every message encrypted with it.

---

## 3. Encrypt

```bash
./encryptor --key <64-hex-key> [--author A] [--keep] [--outdir D] <plaintext-file>
```

| Flag | Meaning |
| --- | --- |
| `--key <hex>` | **Required.** Exactly 64 hex chars (256 bits). |
| `--author <name>` | Envelope author. Default `chicocaine`. |
| `--keep`, `-k` | Keep the plaintext file after encrypting. |
| `--outdir <dir>` | Output directory. Default `<project-root>/src/messages`. |

The positional argument is the plaintext file. Anything else starting with `-`
is rejected as an unknown flag.

```bash
# typical: writes ../src/messages/the-first-text.json and deletes the draft
./encryptor --key "$KEY" the-first-text.txt

# preview into a scratch dir, keep the draft around
./encryptor --key "$KEY" --outdir /tmp/check --keep the-first-text.txt
```

On success it prints the title, author, UTC timestamp, plaintext length, cipher
length (equal to plaintext — detached ciphertext carries no tag), and tag size.

The output directory is created recursively if it does not exist, and the
plaintext is deleted after a successful write unless `--keep` is passed.

To delete the draft yourself, pass the key from a file rather than the command
line — `--key` values end up in your shell history and in `ps` output:

```bash
./encryptor --key "$(cat ~/.secrets/message.key)" the-first-text.txt
```

---

## 4. Output format (v2)

```json
{"title":"the-first-text","author":"chicocaine","utc_timestamp":"2026-06-12T08:30:57Z","nonce":"CnGn06xRcOO9SsZW5WiHKIjWPuv43lr4","ciphertext":"d3imlCOT5k3rEgZV...","auth_tag":"WMWz687Ea/YRuTNLfEJLxw=="}
```

| Field | Source |
| --- | --- |
| `title` | Input file's basename with the extension stripped (`notes/a.b.txt` → `a.b`) |
| `author` | `--author`, default `chicocaine` |
| `utc_timestamp` | UTC at encryption time, `%Y-%m-%dT%H:%M:%SZ` |
| `nonce` | Base64 of the fresh 24-byte nonce |
| `ciphertext` | Base64 of the ciphertext alone — same length as the plaintext, no tag appended |
| `auth_tag` | Base64 of the 16-byte Poly1305 MAC |

All three binary fields use libsodium's `ORIGINAL` base64 variant (padded, `+`
and `/`), matching `sodium.from_base64(..., ORIGINAL)` in the reader.

Keeping the tag separate is deliberate: `src/scripts/decryptor.ts` uses it for
two paths — **strict** (AEAD detached decrypt, authenticated) and
**interpretive** (raw XChaCha20 stream XOR with no tag check, so alternate keys
still produce *something*). Envelopes without `auth_tag` are treated as v1 and
only support strict decryption.

---

## 5. Publishing the message

The reader globs `/src/messages/*.json` eagerly at build time, and the slug is
the filename without `.json`.

1. Encrypt with the default `--outdir` so the envelope lands in
   `src/messages/<title>.json`.
2. Rebuild and deploy — `pnpm run dev` or `pnpm run deploy`. A new envelope is
   **not** picked up until the bundle is rebuilt.
3. The message appears on `/arcana` under `<title>`; give readers the key
   out of band.

Verify the envelope decrypts before publishing:

```bash
node --input-type=module -e '
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const _sodium = require("libsodium-wrappers");
await _sodium.ready;
const env = JSON.parse(readFileSync(process.argv[1], "utf8"));
const key = Uint8Array.from(process.argv[2].match(/../g).map((h) => parseInt(h, 16)));
const b64 = (s) => _sodium.from_base64(s, _sodium.base64_variants.ORIGINAL);
const out = _sodium.crypto_aead_xchacha20poly1305_ietf_decrypt_detached(
  null, b64(env.ciphertext), b64(env.auth_tag), null, b64(env.nonce), key,
);
process.stdout.write(new TextDecoder().decode(out));
' src/messages/the-first-text.json "$KEY"
```

---

## 6. Gotchas

- **The key must be exactly 64 hex characters.** `hex_to_bin` rejects both a
  short string (`key must be 64 hex characters (256 bits)`) and a 64-character
  string containing non-hex characters (`invalid hex key`). The *site* is far
  more forgiving — `hexKeyToBytes` strips non-hex characters and pads or
  truncates to 64 — so a reader who types sloppily can still land on your key,
  but you cannot encrypt with a memorable passphrase. Generate the key with
  `make keygen` and hand readers that exact hex string.
- **Re-encrypting the same title silently overwrites** `src/messages/<title>.json`;
  there is no collision check. Rename the input file if you want both.
- **An empty input file produces an envelope the site refuses**, because
  `ciphertext` encodes to `""` and `validateEnvelope` rejects an empty
  ciphertext. Encrypt at least one byte.
- **The plaintext is deleted by default.** Use `--keep` until you have confirmed
  the envelope decrypts — there is no undo.
- **A wrong key is not an error on the site.** The interpretive path renders
  garbage instead of failing, so a mistyped key looks like a message rather than
  a rejection; only strict mode's `authenticated: true` means the plaintext is
  genuine.
- **The default `outdir` only resolves to the project root on Linux.** It is
  derived by `readlink("/proc/self/exe")`, so on macOS the fallback is the
  relative path `src/messages`, taken from your current directory — run from the
  project root or pass `--outdir` explicitly.
- **This is a one-way tool.** There is no C decryptor; the only reader is
  `src/scripts/decryptor.ts`.
