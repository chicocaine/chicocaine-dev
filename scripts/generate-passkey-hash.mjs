#!/usr/bin/env node

import argon2 from "argon2";
import process from "node:process";

function parseArgs(argv) {
  const options = {
    passkey: process.env.PASSKEY_PLAINTEXT,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
    hashLength: 32,
    saltLength: 16,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === "--passkey" && next) {
      options.passkey = next;
      i += 1;
      continue;
    }
    if (arg === "--memory" && next) {
      options.memoryCost = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--time" && next) {
      options.timeCost = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--parallelism" && next) {
      options.parallelism = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--hash-length" && next) {
      options.hashLength = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--salt-length" && next) {
      options.saltLength = Number(next);
      i += 1;
      continue;
    }
    if (arg === "-h" || arg === "--help") {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log("Usage: node scripts/generate-passkey-hash.mjs [options]");
  console.log("");
  console.log("Options:");
  console.log("  --passkey <value>      Passkey to hash (avoid shell history if possible)");
  console.log("  --memory <KiB>         Argon2 memory cost in KiB (default: 65536)");
  console.log("  --time <n>             Argon2 time cost (default: 3)");
  console.log("  --parallelism <n>      Argon2 parallelism (default: 1)");
  console.log("  --hash-length <bytes>  Output hash length in bytes (default: 32)");
  console.log("  --salt-length <bytes>  Random salt length in bytes (default: 16)");
  console.log("  -h, --help             Show this help message");
  console.log("");
  console.log("Tip: run without --passkey to enter it in a hidden prompt.");
}

async function promptHidden(promptText) {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    if (!stdin.isTTY || !stdout.isTTY) {
      reject(new Error("No TTY available for hidden prompt. Use --passkey or PASSKEY_PLAINTEXT."));
      return;
    }

    let value = "";
    stdout.write(promptText);

    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    const onData = (char) => {
      if (char === "\u0003") {
        stdin.removeListener("data", onData);
        stdin.setRawMode(false);
        stdin.pause();
        stdout.write("\n");
        reject(new Error("Input cancelled."));
        return;
      }

      if (char === "\r" || char === "\n") {
        stdin.removeListener("data", onData);
        stdin.setRawMode(false);
        stdin.pause();
        stdout.write("\n");
        resolve(value);
        return;
      }

      if (char === "\u007f") {
        value = value.slice(0, -1);
        return;
      }

      value += char;
    };

    stdin.on("data", onData);
  });
}

function assertValidNumber(name, value, min) {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < min) {
    throw new Error(`${name} must be an integer >= ${min}.`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  assertValidNumber("memory", options.memoryCost, 8);
  assertValidNumber("time", options.timeCost, 1);
  assertValidNumber("parallelism", options.parallelism, 1);
  assertValidNumber("hash-length", options.hashLength, 16);
  assertValidNumber("salt-length", options.saltLength, 8);

  let passkey = options.passkey;
  if (!passkey) {
    passkey = await promptHidden("Enter passkey: ");
  }

  if (!passkey || passkey.trim().length === 0) {
    throw new Error("Passkey cannot be empty.");
  }

  const hash = await argon2.hash(passkey, {
    type: argon2.argon2id,
    memoryCost: options.memoryCost,
    timeCost: options.timeCost,
    parallelism: options.parallelism,
    hashLength: options.hashLength,
    saltLength: options.saltLength,
  });

  console.log("\nGenerated Argon2id hash:");
  console.log(`PASSKEY_HASH=${hash}`);
  console.log("\nLocal dev: put that line into .dev.vars");
  console.log("Remote: run wrangler secret put PASSKEY_HASH and paste only the hash value when prompted.");
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
