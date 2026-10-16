/*
 * entry_90.tsx — GENERATED FILE, DO NOT EDIT BY HAND.
 *
 * Source:  entries/fixtures/code-fences.md
 * Command: make -C blog gen
 * Parser:  blog/blog-parser.c
 *
 * Edit the markdown and re-run `make -C blog gen`. Hand edits here
 * are overwritten. `make -C blog check` verifies this file is up to
 * date.
 */

import Prompt from "../../components/Prompt";
import { Link } from "react-router-dom";

export const meta = {
  id: "entry_90",
  title: "Code fences",
  date: "01-01-2026",
  label: "entry_90.md",
} as const;

function Entry90() {
  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">cat</span>{" "}
          <span className="text-secondary">~</span>
          <span className="text-text-muted">/blog/entry_90.md</span>
        </Prompt>
      </p>

      <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
        <p className="text-text-muted text-xs mb-2">
          <span className="text-primary">entry_90</span>
          <span className="text-text-muted select-none"> · </span>
          <span className="text-quaternary">01-01-2026</span>
        </p>
        <p className="text-text-muted select-none mb-4">
          ─────────────────────────────
        </p>

        <p className="text-lg sm:text-xl text-text-bright mb-6">
          <span className="text-tertiary select-none"># </span>
          Code fences
        </p>

        <div className="text-text space-y-4">
          <p>
            A fence with a language, containing every character that has to be
            escaped inside a template literal:
          </p>

          <div className="border border-border rounded overflow-hidden">
            <p className="text-text-muted text-xs px-3 py-1 border-b border-border select-none">c</p>
            <pre className="bg-surface p-3 overflow-x-auto text-xs leading-relaxed" data-lang="c"><code>{`
int main(void) {
    printf("hi \${name}\\n");
    char *s = "a \` backtick and a \\\\ backslash";
    return 0;
}
`}</code></pre>
          </div>

          <p>
            A fence with no language at all:
          </p>

          <div className="border border-border rounded overflow-hidden">
            <pre className="bg-surface p-3 overflow-x-auto text-xs leading-relaxed"><code>{`
just text
with a } brace
`}</code></pre>
          </div>

          <p>
            Text after a closed fence is not swallowed.
          </p>

          <div className="border border-border rounded overflow-hidden">
            <pre className="bg-surface p-3 overflow-x-auto text-xs leading-relaxed"><code>{`
$ alone is fine
`}</code></pre>
          </div>
        </div>

        <p className="text-text-muted select-none mt-6">
          ─────────────────────────────
        </p>

        <Link
          to="/blog"
          className="text-tertiary hover:text-primary transition-colors mt-2 inline-block"
        >
          <span className="select-none">&lt;- </span>
          <span className="text-text-muted">cd</span> ..
        </Link>
      </div>

      <p className="pt-8">
        <Prompt>
          <span className="inline-block w-3 h-5 bg-text align-middle animate-pulse" />
        </Prompt>
      </p>
    </main>
  );
}

export default Entry90;
