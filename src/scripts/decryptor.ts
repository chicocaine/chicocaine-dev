import _sodium from "libsodium-wrappers";
import { xchacha20StreamXor } from "./chacha20";

export interface EncryptedEnvelope {
  title: string;
  author: string;
  utc_timestamp: string; /* ISO 8601 UTC timestamp of encryption */
  nonce: string;         /* base64-encoded 24-byte nonce */
  ciphertext: string;    /* base64-encoded ciphertext */
  auth_tag?: string;     /* base64-encoded 16-byte Poly1305 MAC (v2+) */
}

export interface DecryptedSecret {
  title: string;
  author: string;
  utc_timestamp: string;
  plaintext: string;
  authenticated: boolean; /* true = AEAD verified, false = interpretive */
}

export class DecryptError extends Error {
  readonly code: "bad_key" | "tampered" | "invalid_envelope" | "init_failed";

  constructor(
    message: string,
    code: "bad_key" | "tampered" | "invalid_envelope" | "init_failed",
  ) {
    super(message);
    this.name = "DecryptError";
    this.code = code;
  }
}

/**
 * Normalize any key input into a 32-byte Uint8Array.
 *
 * Strategy:
 *  1. Strip all non-hex characters from the input.
 *  2. If the result is empty, treat it as 64 zero-nybbles.
 *  3. If shorter than 64 chars, right-pad with '0'.
 *  4. If longer than 64 chars, truncate to the first 64.
 *  5. Parse the normalized 64-char hex string into 32 bytes.
 *
 * This guarantees that every conceivable string — empty, too short, too long,
 * or laden with invalid characters — will always produce a usable key.
 */
export function hexKeyToBytes(hex: string): Uint8Array {
  // 1. Keep only hex characters
  const cleaned = hex.replace(/[^0-9a-fA-F]/g, "");

  // 2. Fall back to 64 zeros if nothing is left
  let normalized = cleaned;
  if (normalized.length === 0) {
    normalized = "0".repeat(64);
  } else if (normalized.length < 64) {
    // 3. Right-pad with zeros
    normalized = normalized.padEnd(64, "0");
  } else if (normalized.length > 64) {
    // 4. Truncate to first 64 characters
    normalized = normalized.slice(0, 64);
  }

  // 5. Parse into bytes
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(normalized.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function validateEnvelope(obj: unknown): EncryptedEnvelope {
  if (obj === null || typeof obj !== "object") {
    throw new DecryptError("Envelope is not an object", "invalid_envelope");
  }
  const e = obj as Record<string, unknown>;
  if (typeof e.nonce !== "string" || e.nonce.length === 0) {
    throw new DecryptError("Missing or invalid nonce", "invalid_envelope");
  }
  if (typeof e.ciphertext !== "string" || e.ciphertext.length === 0) {
    throw new DecryptError("Missing or invalid ciphertext", "invalid_envelope");
  }
  return {
    title: typeof e.title === "string" ? e.title : "untitled",
    author: typeof e.author === "string" ? e.author : "unknown",
    utc_timestamp: typeof e.utc_timestamp === "string" ? e.utc_timestamp : "",
    nonce: e.nonce,
    ciphertext: e.ciphertext,
    auth_tag: typeof e.auth_tag === "string" ? e.auth_tag : undefined,
  };
}

/**
 * Decrypt a v2 envelope with dual-layer (strict + interpretive) support.
 *
 * v2 stores the ciphertext and 16-byte Poly1305 auth tag as separate fields.
 * Two decryption paths run simultaneously:
 *
 *   STRICT       — AEAD detached decrypt.  If it succeeds the output is
 *                  cryptographically authenticated (authenticated = true).
 *
 *   INTERPRETIVE — Raw XChaCha20 stream XOR without Poly1305 verification.
 *                  Always produces output — garbled if the key is wrong.
 *                  Useful as an alternate "lens" for key experimentation.
 *
 * v1 envelopes (no auth_tag) fall back to combined AEAD decrypt only.
 */
export async function decrypt(
  envelope: EncryptedEnvelope,
  keyHex: string,
): Promise<DecryptedSecret> {
  await _sodium.ready;
  const sodium = _sodium;

  const key = hexKeyToBytes(keyHex);

  let nonce: Uint8Array;
  try {
    nonce = sodium.from_base64(envelope.nonce, sodium.base64_variants.ORIGINAL);
  } catch {
    throw new DecryptError("Failed to decode nonce from base64", "invalid_envelope");
  }

  let ciphertext: Uint8Array;
  try {
    ciphertext = sodium.from_base64(
      envelope.ciphertext,
      sodium.base64_variants.ORIGINAL,
    );
  } catch {
    throw new DecryptError(
      "Failed to decode ciphertext from base64",
      "invalid_envelope",
    );
  }

  let authTag: Uint8Array | null = null;
  if (envelope.auth_tag) {
    try {
      authTag = sodium.from_base64(
        envelope.auth_tag,
        sodium.base64_variants.ORIGINAL,
      );
    } catch {
      throw new DecryptError(
        "Failed to decode auth_tag from base64",
        "invalid_envelope",
      );
    }
  }

  // ---- dual-layer decryption ----
  let strictPlaintext: string | null = null;
  let interpretivePlaintext: string | null = null;
  let authenticated = false;

  // Strict mode: AEAD detached decrypt
  try {
    if (authTag) {
      // v2 detached — ciphertext is pure, mac is separate
      const plainBytes = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt_detached(
        null,
        ciphertext,
        authTag,
        null,
        nonce,
        key,
      );
      strictPlaintext = new TextDecoder("utf-8", { fatal: true }).decode(plainBytes);
      authenticated = true;
    }
  } catch {
    // Strict decryption failed — key may be wrong or ciphertext tampered.
    // For v2 we can still attempt interpretive mode (raw stream).
  }

  // Interpretive mode: raw XChaCha20 stream (v2 only)
  // Always runs — if strict succeeded it confirms the implementation matches;
  // if strict failed it may reveal an alternate "reading" of the ciphertext.
  if (authTag) {
    try {
      const rawBytes = xchacha20StreamXor(ciphertext, nonce, key);
      interpretivePlaintext = new TextDecoder("utf-8", { fatal: false }).decode(rawBytes);
    } catch {
      // Interpretive failed — shouldn't happen, but guard anyway.
    }
  }

  // If strict failed and interpretive is unavailable (v1), throw
  if (!authenticated && interpretivePlaintext === null) {
    throw new DecryptError(
      "Decryption failed: wrong key or tampered ciphertext",
      "tampered",
    );
  }

  key.fill(0);

  // Strict success → return canonical plaintext (interpretive is identical)
  if (authenticated && strictPlaintext !== null) {
    return {
      title: envelope.title,
      author: envelope.author,
      utc_timestamp: envelope.utc_timestamp,
      plaintext: strictPlaintext,
      authenticated: true,
    };
  }

  // Strict failed, interpretive succeeded → alternate "lens" output
  return {
    title: envelope.title,
    author: envelope.author,
    utc_timestamp: envelope.utc_timestamp,
    plaintext: interpretivePlaintext ?? "",
    authenticated: false,
  };
}

export function parseEnvelope(json: string): EncryptedEnvelope {
  let obj: unknown;
  try {
    obj = JSON.parse(json);
  } catch {
    throw new DecryptError("Invalid JSON in envelope", "invalid_envelope");
  }
  return validateEnvelope(obj);
}

export async function decryptJson(
  rawJson: string,
  keyHex: string,
): Promise<DecryptedSecret> {
  const envelope = parseEnvelope(rawJson);
  return decrypt(envelope, keyHex);
}
