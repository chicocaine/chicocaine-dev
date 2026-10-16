/*
 * entry_91.tsx — GENERATED FILE, DO NOT EDIT BY HAND.
 *
 * Source:  entries/fixtures/inline-edge-cases.md
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
  id: "entry_91",
  title: "Inline edge cases",
  date: "02-01-2026",
  label: "entry_91.md",
} as const;

function Entry91() {
  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">cat</span>{" "}
          <span className="text-secondary">~</span>
          <span className="text-text-muted">/blog/entry_91.md</span>
        </Prompt>
      </p>

      <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
        <p className="text-text-muted text-xs mb-2">
          <span className="text-primary">entry_91</span>
          <span className="text-text-muted select-none"> · </span>
          <span className="text-quaternary">02-01-2026</span>
        </p>
        <p className="text-text-muted select-none mb-4">
          ─────────────────────────────
        </p>

        <p className="text-lg sm:text-xl text-text-bright mb-6">
          <span className="text-tertiary select-none"># </span>
          Inline edge cases
        </p>

        <div className="text-text space-y-4">
          <p>
            Strong containing em:{" "}
            <span className="font-bold text-text-bright">a <span className="text-text-muted italic">b</span> c</span>
            .
          </p>

          <p>
            Em containing strong:{" "}
            <span className="text-text-muted italic">a <span className="font-bold text-text-bright">b</span> c</span>
            .
          </p>

          <p>
            Triple:{" "}
            <span className="text-text-muted italic"><span className="font-bold text-text-bright">x</span></span>
            .
          </p>

          <p>
            Quadruple:{" "}
            <span className="font-bold text-text-bright"><span className="font-bold text-text-bright">y</span></span>
            .
          </p>

          <p>
            Unclosed em is literal: *unclosed and a bare ** here.
          </p>

          <p>
            Space delimited runs are literal: a * b * c.
          </p>

          <p>
            Identifiers keep their underscores: snake_case_here stays literal,
            but <span className="text-text-muted italic">emph</span> works.
          </p>

          <p>
            Escapes: *not em* and _not em_ and a literal ` backtick.
          </p>

          <p>
            Code spans:{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`*`}</code>{" "}
            and{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`a\`b`}</code>{" "}
            and{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`**strong**`}</code>
            .
          </p>

          <p>
            Multibyte adjacency: 日本語
            <span className="text-text-muted italic">強調</span>テスト.
          </p>

          <p>
            Braces and angles in text: &#123;like&#125; &#123;this&#125; and 5 &gt; 3 and 2 &lt; 4.
          </p>

          <p>
            A literal ampersand and a quote: AT&amp;T said &quot;hello&quot;.
          </p>
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

export default Entry91;
