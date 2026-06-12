/**
 * chacha20.ts — Pure-TypeScript HChaCha20 + ChaCha20 stream for
 * interpretive (unauthenticated) XChaCha20 decryption.
 *
 * This is used alongside libsodium's AEAD detached decryption to
 * provide a dual-layer system: strict (authenticated) and
 * interpretive (raw stream without Poly1305 verification).
 *
 * Reference: RFC 8439, Sections 2.3, 2.4, 2.5
 */

const CONSTANT = new Uint32Array([
  0x61707865, 0x3320646e, 0x79622d32, 0x6b206574,
]); // "expand 32-byte k"

function rotl32(x: number, n: number): number {
  return ((x << n) | (x >>> (32 - n))) >>> 0;
}

/** ChaCha20 quarter round — mutates state in place */
function quarterRound(st: Uint32Array, a: number, b: number, c: number, d: number): void {
  st[a] = (st[a] + st[b]) >>> 0; st[d] = rotl32(st[d] ^ st[a], 16);
  st[c] = (st[c] + st[d]) >>> 0; st[b] = rotl32(st[b] ^ st[c], 12);
  st[a] = (st[a] + st[b]) >>> 0; st[d] = rotl32(st[d] ^ st[a], 8);
  st[c] = (st[c] + st[d]) >>> 0; st[b] = rotl32(st[b] ^ st[c], 7);
}

/** Apply 20 rounds (10 double rounds) to a 16-word state in place */
function permute(state: Uint32Array): void {
  for (let i = 0; i < 10; i++) {
    // column rounds
    quarterRound(state, 0, 4,  8, 12);
    quarterRound(state, 1, 5,  9, 13);
    quarterRound(state, 2, 6, 10, 14);
    quarterRound(state, 3, 7, 11, 15);
    // diagonal rounds
    quarterRound(state, 0, 5, 10, 15);
    quarterRound(state, 1, 6, 11, 12);
    quarterRound(state, 2, 7,  8, 13);
    quarterRound(state, 3, 4,  9, 14);
  }
}

function wordsToBytesLE(words: Uint32Array, wordStart: number, out: Uint8Array, byteOffset: number, wordCount: number): void {
  for (let i = 0; i < wordCount; i++) {
    const w = words[wordStart + i];
    out[byteOffset + i * 4]     = w & 0xff;
    out[byteOffset + i * 4 + 1] = (w >>> 8) & 0xff;
    out[byteOffset + i * 4 + 2] = (w >>> 16) & 0xff;
    out[byteOffset + i * 4 + 3] = (w >>> 24) & 0xff;
  }
}

function bytesToWordsLE(bytes: Uint8Array, offset: number, count: number): Uint32Array {
  const words = new Uint32Array(count);
  for (let i = 0; i < count; i++) {
    words[i] =
      (bytes[offset + i * 4]) |
      (bytes[offset + i * 4 + 1] << 8) |
      (bytes[offset + i * 4 + 2] << 16) |
      (bytes[offset + i * 4 + 3] << 24);
  }
  return words;
}

/**
 * HChaCha20(key, nonce_prefix[0:16]) → 32-byte subkey.
 *
 * Sets up the ChaCha20 state with the constant, full key, and first
 * 16 bytes of the XChaCha20 nonce, runs 20 rounds, then extracts
 * the first and last rows as the subkey.
 */
export function hchacha20(key: Uint8Array, noncePrefix: Uint8Array): Uint8Array {
  const state = new Uint32Array(16);
  state.set(CONSTANT, 0);                                // words 0-3
  state.set(bytesToWordsLE(key, 0, 8), 4);               // words 4-11
  state.set(bytesToWordsLE(noncePrefix, 0, 4), 12);       // words 12-15
  permute(state);
  // output = first row (words 0-3) + last row (words 12-15)
  const subkey = new Uint8Array(32);
  wordsToBytesLE(state, 0, subkey, 0, 4);   // words 0-3
  wordsToBytesLE(state, 12, subkey, 16, 4); // words 12-15
  return subkey;
}

/**
 * ChaCha20 stream XOR starting at a given block counter.
 *
 * Uses original ChaCha20 layout (not IETF):
 *   words 0-3:   "expand 32-byte k"
 *   words 4-11:  key (8 words, 32 bytes)
 *   words 12-13: block counter (64-bit, little-endian)
 *   words 14-15: nonce (8 bytes, 2 words)
 *
 * For XChaCha20-Poly1305 the encryption keystream starts at
 * counter=1 (counter=0 is used for Poly1305 key derivation).
 */
export function chacha20XorIc(
  input: Uint8Array,
  nonceSuffix: Uint8Array, // last 8 bytes of XChaCha20 nonce
  ic: number,              // initial counter (1 for AEAD ciphertext)
  key: Uint8Array,         // 32-byte subkey from HChaCha20
): Uint8Array {
  const out = new Uint8Array(input.length);
  let offset = 0;
  let counter = ic >>> 0;

  while (offset < input.length) {
    const state = new Uint32Array(16);
    state.set(CONSTANT, 0);                          // words 0-3
    state.set(bytesToWordsLE(key, 0, 8), 4);         // words 4-11
    state[12] = counter;                              // word 12 = counter (low)
    state[13] = 0;                                    // word 13 = counter (high, always 0)
    state.set(bytesToWordsLE(nonceSuffix, 0, 2), 14); // words 14-15 = nonce

    const working = new Uint32Array(state);
    permute(working);
    for (let i = 0; i < 16; i++) {
      working[i] = (working[i] + state[i]) >>> 0;
    }

    const keystream = new Uint8Array(64);
    wordsToBytesLE(working, 0, keystream, 0, 16);

    const chunk = Math.min(64, input.length - offset);
    for (let i = 0; i < chunk; i++) {
      out[offset + i] = input[offset + i] ^ keystream[i];
    }
    offset += chunk;
    counter++;
  }

  return out;
}

/**
 * Interpretive XChaCha20 decryption — raw stream without Poly1305.
 *
 * Given the 32-byte key and 24-byte XChaCha20 nonce, derives the
 * HChaCha20 subkey then XORs the ciphertext with the ChaCha20
 * keystream starting at counter=1 (matching the keystream used by
 * XChaCha20-Poly1305 AEAD encryption).
 */
export function xchacha20StreamXor(
  ciphertext: Uint8Array,
  nonce: Uint8Array,  // 24-byte XChaCha20 nonce
  key: Uint8Array,    // 32-byte original key
): Uint8Array {
  const subkey = hchacha20(key, nonce.subarray(0, 16));
  return chacha20XorIc(ciphertext, nonce.subarray(16, 24), 1, subkey);
}
