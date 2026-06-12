import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Prompt from "../../components/Prompt";
import {
  decrypt,
  parseEnvelope,
  DecryptError,
  type EncryptedEnvelope,
  type DecryptedSecret,
} from "../../scripts/decryptor";

const messageModules = import.meta.glob<EncryptedEnvelope>(
  "/src/messages/*.json",
  { eager: true, import: "default" },
);

function loadEnvelopes(): Array<{ slug: string } & EncryptedEnvelope> {
  return Object.entries(messageModules).map(([path, obj]) => {
    const slug = path.replace("/src/messages/", "").replace(".json", "");
    const envelope = parseEnvelope(JSON.stringify(obj));
    return { slug, ...envelope } as { slug: string } & EncryptedEnvelope;
  });
}

function Cursor() {
  return (
    <span className="inline-block w-3 h-5 bg-text align-middle animate-pulse" />
  );
}

function TrueSecret() {
  const envelopes = useMemo(() => loadEnvelopes(), []);

  const [key, setKey] = useState<string>("");

  const [selected, setSelected] = useState<number | null>(null);
  const [decrypted, setDecrypted] = useState<DecryptedSecret | null>(null);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (selected === null || !key) return;
    const envelope = envelopes[selected];
    if (!envelope) return;

    let cancelled = false;
    setLoading(true);
    setDecrypted(null);

    decrypt(envelope, key)
      .then((result) => {
        if (!cancelled) {
          setDecrypted(result);
          setLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          if (e instanceof DecryptError) {
            console.error("Decryption error:", e.message);
          }
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [selected, key, envelopes]);

  const handleKeyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setKey(newValue);

      const trimmed = newValue.trim();
      setKey(trimmed);
    },
    [key],
  );

  {/* detail view */}
  if (selected !== null) {
    const envelope = envelopes[selected];

    return (
      <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
        <p>
          <Prompt>
            <span className="text-text">gpg</span>{" "}
            <span className="text-text-muted">--decrypt</span>{" "}
            <span className="text-secondary">~</span>
            <span className="text-text-muted">
              /true-secrets/{envelope.slug}.json
            </span>
          </Prompt>
        </p>

        <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
          <p className="text-text-muted text-xs mb-2">
            <span className="text-primary">{envelope.title}</span>
            <span className="text-text-muted select-none"> · </span>
            <span className="text-quaternary">{envelope.author}</span>
            {envelope.auth_tag && (
              <>
                <span className="text-text-muted select-none"> · </span>
                <span className="text-secondary/60">sig</span>
              </>
            )}
            {envelope.utc_timestamp && (
              <>
                <span className="text-text-muted select-none"> · </span>
                <span className="text-text-muted">{envelope.utc_timestamp}</span>
              </>
            )}
          </p>
          <p className="text-text-muted select-none mb-4">
            ─────────────────────────────
          </p>

          {loading && (
            <p className="text-text-muted animate-pulse">
              decrypting<span className="select-none">...</span>
            </p>
          )}

          {decrypted && (
            <div className="text-text/60 space-y-3 leading-relaxed whitespace-pre-wrap font-body">
              {decrypted.plaintext}
            </div>
          )}

          <p className="text-text-muted select-none mt-6">
            ─────────────────────────────
          </p>

          <button
            onClick={() => {
              setSelected(null);
              setDecrypted(null);
            }}
            className="text-tertiary hover:text-primary transition-colors cursor-pointer mt-2 inline-block"
          >
            <span className="select-none">&lt;- </span>
            <span className="text-text-muted">cd</span> ..
          </button>
        </div>

        <p className="pt-8">
          <Prompt>
            <Cursor />
          </Prompt>
        </p>
      </main>
    );
  }

  {/* main view */}
  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">cat</span>{" "}
          <span className="text-secondary">~</span>
          <span className="text-text-muted">/true-secret.md</span>
        </Prompt>
      </p>
      <div className="mt-4 pl-4 border-l-2 border-border space-y-4 max-w-2xl">
        <p className="text-text">
          You found the true secret page. Here lies words that are closest to
          my being. Only few are meant to uncover them or perhaps none at all.
        </p>
        <p className="text-text">
          This is a place of deep reflection and honesty, where I confess my
          innermost thoughts and feelings. If you have found this page and
          revealed what it holds, consider yourself one of billions.
        </p>
        <p className="text-text">
          You are not alone in your searching. I hope that my words can offer
          you comfort and relief, hope and despair, attraction and repulse,
          joy and sadness, fear and anger, love and apathy, jealousy and
          hatred, insight and perspective, celebration and condolence,
          stillness and change, confusion and understanding, and that you can
          find your own truth in them.
        </p>
      </div>

      <p className="pt-8">
        <Prompt>
          <span className="text-text">gpg</span>{" "}
          <span className="text-text-muted">--import-key</span>
        </Prompt>
      </p>

      <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
        <div className="flex items-center gap-2">
          <span className="text-primary select-none shrink-0">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={key}
            onChange={handleKeyChange}
            placeholder="[key]"
            spellCheck={false}
            autoComplete="off"
            className="flex-1 bg-transparent border-none outline-none text-text
                        placeholder:text-text-muted/30 font-body text-sm
                        px-2 py-1 rounded"
          />
        </div>
      </div>

      <p className="pt-8">
        <Prompt>
          <span className="text-text">ls</span>{" "}
          <span className="text-secondary">~</span>
          <span className="text-text-muted">/true-secrets/</span>
        </Prompt>
      </p>

      <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
        <p className="text-text-muted text-xs select-none mb-4">
          <span className="text-text">{envelopes.length}</span>
        </p>

        <div className="space-y-3">
          {envelopes.map((env, i) => (
            <button
              key={env.slug}
              onClick={() => setSelected(i)}
              className="block text-left w-full hover:bg-surface rounded px-2 py-1 -mx-2 transition-colors cursor-pointer"
            >
              <p>
                <span className="text-text-muted select-none">
                  {env.auth_tag ? "-rw-------" : "-rw-r--r--"}{" "}
                </span>
                <span className="text-primary hover:text-quaternary transition-colors">
                  {env.slug}.json
                </span>
                {env.auth_tag && (
                  <span className="text-secondary/60 text-xs ml-1 select-none">*</span>
                )}
              </p>
              <p className="text-text-muted text-xs ml-4">
                <span className="text-quaternary">{env.author}</span>
                <span className="text-text-muted select-none"> · </span>
                <span className="text-text-muted">{env.title}</span>
                {env.utc_timestamp && (
                  <>
                    <span className="text-text-muted select-none"> · </span>
                    <span className="text-text-muted/60">{env.utc_timestamp}</span>
                  </>
                )}
              </p>
            </button>
          ))}
        </div>
      </div>

      <p className="pt-8">
        <Prompt>
          <Cursor />
        </Prompt>
      </p>
    </main>
  );
}

export default TrueSecret;
