import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import Prompt from "../../components/Prompt";
import { StreakActions } from "../../types/streak";
import type { StreakAction, StreakApiResponse } from "../../types/streak";

const USER = "chico";

// ---- tokenizer -----------------------------------------------------------

// split on whitespace, honoring single/double quotes (no escapes)
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  const n = input.length;

  while (i < n) {
    while (i < n && /\s/.test(input[i])) i++;
    if (i >= n) break;

    let token = "";
    const quote = input[i];
    if (quote === '"' || quote === "'") {
      i++;
      while (i < n && input[i] !== quote) {
        token += input[i];
        i++;
      }
      i++; // skip the closing quote (or run off the end)
    } else {
      while (i < n && !/\s/.test(input[i])) {
        token += input[i];
        i++;
      }
    }
    tokens.push(token);
  }

  return tokens;
}

// pull the -p / --passkey flag out of a token list, returning the rest
function extractPasskey(
  tokens: string[]
): { passkey: string | undefined; args: string[] } {
  let passkey: string | undefined;
  const args: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === "-p" || token === "--passkey") {
      passkey = tokens[i + 1];
      i++;
    } else if (token.startsWith("--passkey=")) {
      passkey = token.slice("--passkey=".length);
    } else if (token.startsWith("-p=")) {
      passkey = token.slice("-p=".length);
    } else {
      args.push(token);
    }
  }

  return { passkey, args };
}

// ---- command registry ----------------------------------------------------

type ParseOutcome =
  | { ok: true; metadata: Record<string, unknown> }
  | { ok: false; error: string };

type CommandSpec = {
  name: string;
  aliases: string[];
  usage: string;
  help: string;
  clientOnly?: boolean;
  action?: StreakAction;
  parse?: (args: string[]) => ParseOutcome;
};

function oneKey(args: string[], usage: string): ParseOutcome {
  if (args.length < 1) return { ok: false, error: `usage: ${usage}` };
  return { ok: true, metadata: { key: args[0] } };
}

export const COMMANDS: CommandSpec[] = [
  {
    name: "log",
    aliases: [],
    action: StreakActions.LogStreak,
    usage: "log <key> -p <passkey>",
    help: "log today's streak for <key>",
    parse: (args) => oneKey(args, "log <key> -p <passkey>"),
  },
  {
    name: "create",
    aliases: [],
    action: StreakActions.CreateStreak,
    usage: "create <key> <label> [description] -p <passkey>",
    help: "create a new streak",
    parse: (args) => {
      if (args.length < 2) {
        return { ok: false, error: "usage: create <key> <label> [description] -p <passkey>" };
      }
      return {
        ok: true,
        metadata: {
          key: args[0],
          label: args[1],
          description: args.slice(2).join(" "),
        },
      };
    },
  },
  {
    name: "activate",
    aliases: ["on"],
    action: StreakActions.ActivateStreak,
    usage: "activate <key> -p <passkey>",
    help: "mark a streak active",
    parse: (args) => oneKey(args, "activate <key> -p <passkey>"),
  },
  {
    name: "deactivate",
    aliases: ["off"],
    action: StreakActions.DeactivateStreak,
    usage: "deactivate <key> -p <passkey>",
    help: "mark a streak inactive",
    parse: (args) => oneKey(args, "deactivate <key> -p <passkey>"),
  },
  {
    name: "delete",
    aliases: ["rm"],
    action: StreakActions.DeleteStreak,
    usage: "delete <key> -p <passkey>",
    help: "delete a streak (and its logs/milestones)",
    parse: (args) => oneKey(args, "delete <key> -p <passkey>"),
  },
  {
    name: "milestone",
    aliases: [],
    action: StreakActions.CreateMilestone,
    usage: "milestone <key> <length> [description] -p <passkey>",
    help: "add a milestone at <length> consecutive days",
    parse: (args) => {
      if (args.length < 2) {
        return { ok: false, error: "usage: milestone <key> <length> [description] -p <passkey>" };
      }
      const length = Number(args[1]);
      if (!Number.isInteger(length) || length < 1) {
        return { ok: false, error: "length must be a positive integer" };
      }
      return {
        ok: true,
        metadata: { key: args[0], length, description: args.slice(2).join(" ") },
      };
    },
  },
  {
    name: "rm-milestone",
    aliases: [],
    action: StreakActions.DeleteMilestone,
    usage: "rm-milestone <key> <length> -p <passkey>",
    help: "remove the milestone at <length>",
    parse: (args) => {
      if (args.length < 2) {
        return { ok: false, error: "usage: rm-milestone <key> <length> -p <passkey>" };
      }
      const length = Number(args[1]);
      if (!Number.isInteger(length) || length < 1) {
        return { ok: false, error: "length must be a positive integer" };
      }
      return { ok: true, metadata: { key: args[0], length } };
    },
  },
  {
    name: "help",
    aliases: ["?"],
    usage: "help",
    help: "list commands",
    clientOnly: true,
  },
  {
    name: "clear",
    aliases: [],
    usage: "clear",
    help: "clear the command log",
    clientOnly: true,
  },
];

type ParseResult =
  | { kind: "client"; command: string }
  | { kind: "dispatch"; action: StreakAction; passkey: string; metadata: Record<string, unknown> }
  | { kind: "error"; error: string };

export function parseCommand(input: string): ParseResult {
  const tokens = tokenize(input);
  if (tokens.length === 0) return { kind: "error", error: "empty command" };

  const name = tokens[0];
  const spec = COMMANDS.find(
    (c) => c.name === name || c.aliases.includes(name)
  );
  if (!spec) return { kind: "error", error: `unknown command: ${name}` };

  const { passkey, args } = extractPasskey(tokens.slice(1));

  if (spec.clientOnly) {
    return { kind: "client", command: spec.name };
  }

  if (!passkey || passkey === "") {
    return { kind: "error", error: "missing passkey (-p <passkey>)" };
  }

  const parsed = spec.parse!(args);
  if (!parsed.ok) return { kind: "error", error: parsed.error };

  return {
    kind: "dispatch",
    action: spec.action!,
    passkey,
    metadata: parsed.metadata,
  };
}

// ---- dispatcher ----------------------------------------------------------

async function dispatch(
  action: StreakAction,
  passkey: string,
  metadata: Record<string, unknown>
): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch("/api/streak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: USER, action, passkey, metadata }),
    });

    let body: StreakApiResponse<unknown> | null = null;
    try {
      body = (await res.json()) as StreakApiResponse<unknown>;
    } catch {
      body = null;
    }

    if (body && body.success) return { ok: true, message: action };
    if (body && !body.success) return { ok: false, message: body.error };
    return { ok: false, message: `request failed (${res.status})` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : String(err) };
  }
}

// ---- UI ------------------------------------------------------------------

type LogLine = { text: string; kind: "cmd" | "ok" | "err" | "info" };

export default function StreakCli({ onSuccess }: { onSuccess: () => void }) {
  const [input, setInput] = useState("");
  const [log, setLog] = useState<LogLine[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit() {
    const raw = input;
    if (raw.trim() === "" || busy) return;

    setHistory((prev) => [...prev, raw]);
    setHistIdx(null);
    setInput("");

    const result = parseCommand(raw);

    if (result.kind === "error") {
      setLog((prev) => [
        ...prev,
        { text: raw, kind: "cmd" },
        { text: result.error, kind: "err" },
      ]);
      return;
    }

    if (result.kind === "client") {
      if (result.command === "clear") {
        setLog([]);
        return;
      }
      // help
      setLog((prev) => [
        ...prev,
        { text: raw, kind: "cmd" },
        ...COMMANDS.map(
          (c): LogLine => ({ text: `${c.usage}  —  ${c.help}`, kind: "info" })
        ),
      ]);
      return;
    }

    setLog((prev) => [...prev, { text: raw, kind: "cmd" }]);
    setBusy(true);
    const res = await dispatch(result.action, result.passkey, result.metadata);
    setBusy(false);

    if (res.ok) {
      setLog((prev) => [...prev, { text: res.message, kind: "ok" }]);
      onSuccess();
    } else {
      setLog((prev) => [...prev, { text: res.message, kind: "err" }]);
    }
  }

  function handleKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleSubmit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const idx = histIdx === null ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(idx);
      setInput(history[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx === null) return;
      const idx = histIdx + 1;
      if (idx >= history.length) {
        setHistIdx(null);
        setInput("");
      } else {
        setHistIdx(idx);
        setInput(history[idx]);
      }
    }
  }

  const lineClass: Record<LogLine["kind"], string> = {
    cmd: "text-text",
    ok: "text-success",
    err: "text-danger",
    info: "text-text-muted",
  };

  return (
    <div className="pt-8">
      <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl space-y-1 font-body">
        {log.length === 0 ? (
          <p className="text-text-muted text-xs select-none">
            ── streak actions ── type <span className="text-text">help</span> ──
          </p>
        ) : (
          log.map((line, i) => (
            <p key={i} className={`${lineClass[line.kind]} text-sm`}>
              {line.kind === "cmd" ? (
                <>
                  <span className="text-text-muted select-none">$ </span>
                  {line.text}
                </>
              ) : (
                <>
                  <span className="select-none">
                    {line.kind === "ok" ? "[OK] " : line.kind === "err" ? "[ERR] " : ""}
                  </span>
                  {line.text}
                </>
              )}
            </p>
          ))
        )}
        {busy && <p className="text-text-muted animate-pulse text-sm">…</p>}
      </div>

      <div className="pt-4 flex items-center gap-2 max-w-2xl">
        <Prompt className="shrink-0">{""}</Prompt>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="type 'help' for commands"
          spellCheck={false}
          autoComplete="off"
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-text
                     placeholder:text-text-muted/30 font-body text-sm px-2 py-1 rounded"
        />
      </div>
    </div>
  );
}
