/*
 * encryptor.c — Encrypt a plaintext file with XChaCha20-Poly1305 via libsodium.
 *
 * Usage:
 *   encryptor --key <64-char-hex-key> [--author "author"]
 *             [--keep] [--outdir <dir>] <plaintext-file>
 *
 * The 256-bit key is supplied as 64 hexadecimal characters.
 * A fresh 24-byte (192-bit) nonce is generated for every invocation via
 * randombytes_buf().  The nonce is never reused as long as the RNG is seeded.
 *
 * The title is automatically derived from the input filename (basename
 * without extension).  A UTC timestamp is recorded in the envelope at
 * encryption time.
 *
 * Output is written as JSON (version 2) to <outdir>/<basename>.json
 * (default outdir is src/messages relative to the project root).  The
 * plaintext file is removed after successful encryption unless --keep is
 * passed.
 *
 * Version 2 uses detached XChaCha20-Poly1305 encryption so that the
 * ciphertext and 16-byte Poly1305 authentication tag are stored as
 * separate fields.  This enables dual-layer decryption: strict (AEAD
 * verified) and interpretive (raw XChaCha20 stream without Poly1305
 * verification).
 *
 * Build:
 *   gcc -O2 -Wall -Wextra -o encryptor encryptor.c -lsodium
 *
 * Dependencies: libsodium >= 1.0.18 (libsodium-dev for headers)
 */

#include <sodium.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <libgen.h>
#include <sys/stat.h>
#include <sys/types.h>

#define KEY_HEX_LEN   (crypto_aead_xchacha20poly1305_ietf_KEYBYTES * 2)  /* 64 */
#define NONCE_B64_LEN sodium_base64_ENCODED_LEN(                          \
                          crypto_aead_xchacha20poly1305_ietf_NPUBBYTES,   \
                          sodium_base64_VARIANT_ORIGINAL)

/* ---------- helpers ---------- */

static int hex_to_bin(unsigned char *out, const char *hex, size_t hex_len) {
    if (hex_len != KEY_HEX_LEN) return -1;
    for (size_t i = 0; i < crypto_aead_xchacha20poly1305_ietf_KEYBYTES; i++) {
        unsigned int byte;
        if (sscanf(hex + 2 * i, "%2x", &byte) != 1) return -1;
        out[i] = (unsigned char)byte;
    }
    return 0;
}

static char *read_whole_file(const char *path, size_t *out_len) {
    FILE *f = fopen(path, "rb");
    if (!f) { perror("fopen"); return NULL; }
    fseek(f, 0, SEEK_END);
    long flen = ftell(f);
    if (flen < 0) { perror("ftell"); fclose(f); return NULL; }
    rewind(f);
    char *buf = malloc((size_t)flen + 1);
    if (!buf) { fclose(f); return NULL; }
    size_t n = fread(buf, 1, (size_t)flen, f);
    if (ferror(f)) { perror("fread"); free(buf); fclose(f); return NULL; }
    fclose(f);
    buf[n] = '\0';
    *out_len = n;
    return buf;
}

static int write_file(const char *path, const char *data, size_t len) {
    FILE *f = fopen(path, "wb");
    if (!f) { perror("fopen"); return -1; }
    size_t written = fwrite(data, 1, len, f);
    fclose(f);
    return (written == len) ? 0 : -1;
}

/*
 * Minimal JSON string escaping — handles ", \, and common control chars.
 * Safe for human-readable titles/authors.
 */
static char *json_escape(const char *s) {
    if (!s) return strdup("");
    size_t len = strlen(s);
    char *out = malloc(2 * len + 1);  /* worst case: every char needs escaping */
    if (!out) return NULL;
    size_t j = 0;
    for (size_t i = 0; i < len; i++) {
        switch (s[i]) {
        case '"':  out[j++] = '\\'; out[j++] = '"';  break;
        case '\\': out[j++] = '\\'; out[j++] = '\\'; break;
        case '\n': out[j++] = '\\'; out[j++] = 'n';  break;
        case '\r': out[j++] = '\\'; out[j++] = 'r';  break;
        case '\t': out[j++] = '\\'; out[j++] = 't';  break;
        default:   out[j++] = s[i]; break;
        }
    }
    out[j] = '\0';
    return out;
}

/* ---------- main ---------- */

int main(int argc, char **argv) {
    const char *key_hex   = NULL;
    const char *author    = "chicocaine";
    const char *outdir    = "src/messages";
    int         keep      = 0;
    const char *inpath    = NULL;

    /* ---- parse args ---- */
    for (int i = 1; i < argc; i++) {
        if (!strcmp(argv[i], "--key") && i + 1 < argc) {
            key_hex = argv[++i];
        } else if (!strcmp(argv[i], "--author") && i + 1 < argc) {
            author = argv[++i];
        } else if (!strcmp(argv[i], "--outdir") && i + 1 < argc) {
            outdir = argv[++i];
        } else if (!strcmp(argv[i], "-k") || !strcmp(argv[i], "--keep")) {
            keep = 1;
        } else if (argv[i][0] != '-') {
            inpath = argv[i];
        } else {
            fprintf(stderr, "Unknown flag: %s\n", argv[i]);
            return 1;
        }
    }

    if (!key_hex || !inpath) {
        fprintf(stderr,
                "Usage: %s --key <64-hex-key> [--author A] "
                "[--keep] [--outdir D] <plaintext-file>\n",
                argv[0]);
        return 1;
    }

    /* ---- resolve default outdir relative to project root ---- */
    int free_outdir = 0;
    {
        int outdir_overridden = 0;
        for (int i = 1; i < argc; i++) {
            if (!strcmp(argv[i], "--outdir")) { outdir_overridden = 1; break; }
        }
        if (!outdir_overridden) {
            char exe_path[4096];
            ssize_t len = readlink("/proc/self/exe", exe_path, sizeof(exe_path) - 1);
            if (len > 0) {
                exe_path[len] = '\0';
                /* exe is at <project-root>/secret/encryptor */
                char *exe_dir = dirname(exe_path);       /* <project-root>/secret */
                char *proj_root = dirname(exe_dir);      /* <project-root> */
                size_t n = strlen(proj_root) + 1 + strlen(outdir) + 1;
                char *resolved = malloc(n);
                if (resolved) {
                    snprintf(resolved, n, "%s/%s", proj_root, outdir);
                    outdir = resolved;
                    free_outdir = 1;
                }
            }
        }
    }

    if (strlen(key_hex) != KEY_HEX_LEN) {
        fprintf(stderr, "Error: key must be %d hex characters (256 bits)\n",
                KEY_HEX_LEN);
        return 1;
    }

    /* ---- derive title from input filename (basename without extension) ---- */
    char *inpath_copy = strdup(inpath);
    if (!inpath_copy) {
        fprintf(stderr, "Error: out of memory\n");
        return 1;
    }
    char *base = basename(inpath_copy);
    char *dot = strrchr(base, '.');
    size_t title_len = dot ? (size_t)(dot - base) : strlen(base);
    char *title = malloc(title_len + 1);
    if (!title) {
        fprintf(stderr, "Error: out of memory\n");
        free(inpath_copy);
        return 1;
    }
    memcpy(title, base, title_len);
    title[title_len] = '\0';

    /* ---- capture UTC timestamp ---- */
    time_t now = time(NULL);
    struct tm *utc = gmtime(&now);
    char utc_timestamp[32];  /* "YYYY-MM-DDThh:mm:ssZ" = 20 chars + safety */
    strftime(utc_timestamp, sizeof utc_timestamp, "%Y-%m-%dT%H:%M:%SZ", utc);

    /* ---- init libsodium ---- */
    if (sodium_init() < 0) {
        fprintf(stderr, "Error: sodium_init() failed\n");
        return 1;
    }

    /* ---- decode hex key ---- */
    unsigned char key[crypto_aead_xchacha20poly1305_ietf_KEYBYTES];
    if (hex_to_bin(key, key_hex, KEY_HEX_LEN) != 0) {
        fprintf(stderr, "Error: invalid hex key\n");
        return 1;
    }

    /* ---- read plaintext ---- */
    size_t plain_len = 0;
    char *plaintext = read_whole_file(inpath, &plain_len);
    if (!plaintext) {
        fprintf(stderr, "Error: cannot read %s\n", inpath);
        return 1;
    }

    /* ---- generate fresh random nonce ---- */
    unsigned char nonce[crypto_aead_xchacha20poly1305_ietf_NPUBBYTES];
    randombytes_buf(nonce, sizeof nonce);

    /* ---- encrypt (detached — ciphertext and mac stored separately) ---- */
    unsigned char ciphertext[plain_len];  /* same length as plaintext */
    unsigned char mac[crypto_aead_xchacha20poly1305_ietf_ABYTES];  /* 16 bytes */
    unsigned long long mac_len = sizeof mac;

    if (crypto_aead_xchacha20poly1305_ietf_encrypt_detached(
            ciphertext, mac, &mac_len,
            (unsigned char *)plaintext, plain_len,
            NULL, 0,            /* additional data */
            NULL,                /* nsec (always NULL) */
            nonce, key) != 0) {
        fprintf(stderr, "Error: encryption failed\n");
        free(plaintext);
        return 1;
    }

    /* ---- base64-encode nonce, ciphertext, and auth tag ---- */
    char nonce_b64[NONCE_B64_LEN];
    sodium_bin2base64(nonce_b64, sizeof nonce_b64,
                      nonce, sizeof nonce,
                      sodium_base64_VARIANT_ORIGINAL);

    size_t cipher_b64_len = sodium_base64_ENCODED_LEN(plain_len,
                                sodium_base64_VARIANT_ORIGINAL);
    char *cipher_b64 = malloc(cipher_b64_len);
    if (!cipher_b64) {
        fprintf(stderr, "Error: out of memory\n");
        free(plaintext);
        return 1;
    }
    sodium_bin2base64(cipher_b64, cipher_b64_len,
                      ciphertext, plain_len,
                      sodium_base64_VARIANT_ORIGINAL);

    size_t mac_b64_len = sodium_base64_ENCODED_LEN(sizeof mac,
                                sodium_base64_VARIANT_ORIGINAL);
    char *mac_b64 = malloc(mac_b64_len);
    if (!mac_b64) {
        fprintf(stderr, "Error: out of memory\n");
        free(plaintext);
        free(cipher_b64);
        return 1;
    }
    sodium_bin2base64(mac_b64, mac_b64_len,
                      mac, sizeof mac,
                      sodium_base64_VARIANT_ORIGINAL);

    /* ---- build JSON output ---- */
    char *escaped_title  = json_escape(title);
    char *escaped_author = json_escape(author);
    char *escaped_utc    = json_escape(utc_timestamp);

    /* build output path: outdir/<title>.json */
    size_t outpath_len = strlen(outdir) + 1 + title_len + 6;
    char *outpath = malloc(outpath_len);
    if (!outpath) {
        fprintf(stderr, "Error: out of memory\n");
        goto cleanup;
    }
    snprintf(outpath, outpath_len, "%s/%s.json", outdir, title);

    /* ensure outdir exists (recursive, like mkdir -p) */
    {
        char *tmp = strdup(outdir);
        if (tmp) {
            for (char *p = tmp; *p; p++) {
                if (*p == '/' && p > tmp) {
                    *p = '\0';
                    mkdir(tmp, 0755);
                    *p = '/';
                }
            }
            mkdir(tmp, 0755);
            free(tmp);
        }
    }

    /*
     * JSON format v2 (single line) — detached: ciphertext and auth_tag
     * are stored separately so interpretive (unauthenticated) decryption
     * can be attempted with alternate keys.
     * {"version":2,"title":"...","author":"...","utc_timestamp":"...",
     *  "nonce":"...","ciphertext":"...","auth_tag":"..."}
     */
    size_t json_len = (size_t)snprintf(NULL, 0,
        "{\"version\":2,\"title\":\"%s\",\"author\":\"%s\","
        "\"utc_timestamp\":\"%s\","
        "\"nonce\":\"%s\",\"ciphertext\":\"%s\",\"auth_tag\":\"%s\"}",
        escaped_title, escaped_author, escaped_utc,
        nonce_b64, cipher_b64, mac_b64);
    char *json = malloc(json_len + 1);
    if (!json) {
        fprintf(stderr, "Error: out of memory\n");
        free(outpath);
        goto cleanup;
    }
    snprintf(json, json_len + 1,
        "{\"version\":2,\"title\":\"%s\",\"author\":\"%s\","
        "\"utc_timestamp\":\"%s\","
        "\"nonce\":\"%s\",\"ciphertext\":\"%s\",\"auth_tag\":\"%s\"}",
        escaped_title, escaped_author, escaped_utc,
        nonce_b64, cipher_b64, mac_b64);

    /* ---- write output ---- */
    if (write_file(outpath, json, json_len) != 0) {
        fprintf(stderr, "Error: cannot write %s\n", outpath);
        free(json);
        free(outpath);
        goto cleanup;
    }

    printf("Encrypted: %s -> %s\n", inpath, outpath);
    printf("  title      : %s\n", title);
    printf("  author     : %s\n", author);
    printf("  utc        : %s\n", utc_timestamp);
    printf("  plain len  : %zu bytes\n", plain_len);
    printf("  cipher len : %zu bytes (same as plain, detached)\n", plain_len);
    printf("  auth tag   : %u bytes (Poly1305 MAC)\n",
           crypto_aead_xchacha20poly1305_ietf_ABYTES);

    /* ---- remove plaintext (unless --keep) ---- */
    if (!keep) {
        if (unlink(inpath) != 0) {
            perror("unlink");
        } else {
            printf("  (plaintext removed)\n");
        }
    }

    free(json);
    free(outpath);

cleanup:
    free(escaped_title);
    free(escaped_author);
    free(escaped_utc);
    free(title);
    free(inpath_copy);
    if (free_outdir) free((void *)outdir);
    free(plaintext);
    free(cipher_b64);
    free(mac_b64);
    sodium_memzero(key, sizeof key);   /* wipe key from memory */
    sodium_memzero(ciphertext, sizeof ciphertext);
    sodium_memzero(mac, sizeof mac);
    return 0;
}
