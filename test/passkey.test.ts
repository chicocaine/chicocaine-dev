import { describe, it, expect } from "vitest";
import { verifyArgon2, authorize } from "../src/scripts/passkey";

// Known Argon2id v=19 hashes produced by the reference implementation
// (`argon2` npm package). Salt is the 16 bytes 01..10 in both.
const PRIMARY_HASH =
  "$argon2id$v=19$m=65536,p=1,t=3$AQIDBAUGBwgJCgsMDQ4PEA$Co2j2jdpnKFUrdEfowqeZAfpqM0a8xexR2W2wMv5i3I";
const PRIMARY_PASSKEY = "correct-horse-battery-staple";

const FAST_HASH =
  "$argon2id$v=19$m=64,p=1,t=2$AQIDBAUGBwgJCgsMDQ4PEA$C+LXr0bXgTveECRhg3dQh/SWcU4/jrSiC2qjBv+9XaY";
const FAST_PASSKEY = "test-passkey";

describe("verifyArgon2", () => {
  it("accepts the correct passkey against a known Argon2id PHC hash", () => {
    expect(verifyArgon2(PRIMARY_PASSKEY, PRIMARY_HASH)).toBe(true);
  });

  it("rejects an incorrect passkey", () => {
    expect(verifyArgon2("wrong-passkey", PRIMARY_HASH)).toBe(false);
  });

  it("rejects malformed PHC strings", () => {
    expect(verifyArgon2("x", "")).toBe(false);
    expect(verifyArgon2("x", "not-a-phc")).toBe(false);
    expect(verifyArgon2("x", "$argon2id$v=19")).toBe(false);
    expect(verifyArgon2("x", "$argon2id$v=19$m=64,p=1,t=2$AQIDBAUGBwgJCgsMDQ4PEA")).toBe(false);
  });

  it("rejects a non-argon2id algorithm (argon2i)", () => {
    expect(
      verifyArgon2(
        FAST_PASSKEY,
        "$argon2i$v=19$m=64,p=1,t=2$AQIDBAUGBwgJCgsMDQ4PEA$C+LXr0bXgTveECRhg3dQh/SWcU4/jrSiC2qjBv+9XaY"
      )
    ).toBe(false);
  });

  it("rejects an invalid version", () => {
    expect(
      verifyArgon2(
        FAST_PASSKEY,
        "$argon2id$v=16$m=64,p=1,t=2$AQIDBAUGBwgJCgsMDQ4PEA$C+LXr0bXgTveECRhg3dQh/SWcU4/jrSiC2qjBv+9XaY"
      )
    ).toBe(false);
  });

  it("rejects missing or non-numeric parameters", () => {
    // missing t
    expect(
      verifyArgon2(
        FAST_PASSKEY,
        "$argon2id$v=19$m=64,p=1$AQIDBAUGBwgJCgsMDQ4PEA$C+LXr0bXgTveECRhg3dQh/SWcU4/jrSiC2qjBv+9XaY"
      )
    ).toBe(false);
    // non-numeric m
    expect(
      verifyArgon2(
        FAST_PASSKEY,
        "$argon2id$v=19$m=abc,p=1,t=2$AQIDBAUGBwgJCgsMDQ4PEA$C+LXr0bXgTveECRhg3dQh/SWcU4/jrSiC2qjBv+9XaY"
      )
    ).toBe(false);
  });

  it("rejects parameters outside the safety bounds", () => {
    // memory cost above the 64 MiB cap
    expect(
      verifyArgon2(
        FAST_PASSKEY,
        "$argon2id$v=19$m=999999,p=1,t=2$AQIDBAUGBwgJCgsMDQ4PEA$C+LXr0bXgTveECRhg3dQh/SWcU4/jrSiC2qjBv+9XaY"
      )
    ).toBe(false);
    // iterations above the cap
    expect(
      verifyArgon2(
        FAST_PASSKEY,
        "$argon2id$v=19$m=64,p=1,t=999$AQIDBAUGBwgJCgsMDQ4PEA$C+LXr0bXgTveECRhg3dQh/SWcU4/jrSiC2qjBv+9XaY"
      )
    ).toBe(false);
    // parallelism above the cap
    expect(
      verifyArgon2(
        FAST_PASSKEY,
        "$argon2id$v=19$m=64,p=999,t=2$AQIDBAUGBwgJCgsMDQ4PEA$C+LXr0bXgTveECRhg3dQh/SWcU4/jrSiC2qjBv+9XaY"
      )
    ).toBe(false);
  });

  it("keeps verifying the existing app-config hash (m=65536,t=3,p=1)", () => {
    expect(verifyArgon2(PRIMARY_PASSKEY, PRIMARY_HASH)).toBe(true);
  });
});

describe("authorize", () => {
  it("returns false when no passkey is provided", () => {
    expect(authorize({ PASSKEY_HASH: FAST_HASH }, undefined)).toBe(false);
    expect(authorize({}, "")).toBe(false);
  });

  it("returns true when the passkey matches PASSKEY_HASH", () => {
    expect(authorize({ PASSKEY_HASH: FAST_HASH }, FAST_PASSKEY)).toBe(true);
    expect(authorize({ PASSKEY_HASH: PRIMARY_HASH }, PRIMARY_PASSKEY)).toBe(true);
  });

  it("returns false when the passkey does not match PASSKEY_HASH", () => {
    expect(authorize({ PASSKEY_HASH: PRIMARY_HASH }, "nope")).toBe(false);
    expect(authorize({ PASSKEY_HASH: PRIMARY_HASH }, FAST_PASSKEY)).toBe(false);
  });

  it("returns false when no hash is configured", () => {
    expect(authorize({}, FAST_PASSKEY)).toBe(false);
  });
});
