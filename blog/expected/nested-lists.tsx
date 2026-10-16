/*
 * entry_94.tsx — GENERATED FILE, DO NOT EDIT BY HAND.
 *
 * Source:  entries/fixtures/nested-lists.md
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
  id: "entry_94",
  title: "Lists",
  date: "05-01-2026",
  label: "entry_94.md",
} as const;

function Entry94() {
  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">cat</span>{" "}
          <span className="text-secondary">~</span>
          <span className="text-text-muted">/blog/entry_94.md</span>
        </Prompt>
      </p>

      <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
        <p className="text-text-muted text-xs mb-2">
          <span className="text-primary">entry_94</span>
          <span className="text-text-muted select-none"> · </span>
          <span className="text-quaternary">05-01-2026</span>
        </p>
        <p className="text-text-muted select-none mb-4">
          ─────────────────────────────
        </p>

        <p className="text-lg sm:text-xl text-text-bright mb-6">
          <span className="text-tertiary select-none"># </span>
          Lists
        </p>

        <div className="text-text space-y-4">
          <ul className="space-y-1">
            <li className="pl-6 -indent-6"><span className="text-tertiary select-none">- </span>one</li>
            <li className="pl-6 -indent-6"><span className="text-tertiary select-none">- </span>two</li>
            <li className="pl-6 -indent-6"><span className="text-tertiary select-none">- </span>three</li>
          </ul>

          <ol className="space-y-1">
            <li className="pl-6 -indent-6"><span className="text-tertiary select-none">1. </span>first</li>
            <li className="pl-6 -indent-6"><span className="text-tertiary select-none">2. </span>second</li>
            <li className="pl-6 -indent-6"><span className="text-tertiary select-none">3. </span>third</li>
          </ol>

          <ul className="space-y-1">
            <li className="pl-6 -indent-6"><span className="text-tertiary select-none">- </span>outer one
            <ul className="space-y-1">
              <li className="pl-6 -indent-6"><span className="text-tertiary select-none">- </span>inner a</li>
              <li className="pl-6 -indent-6"><span className="text-tertiary select-none">- </span>inner b</li>
            </ul></li>
            <li className="pl-6 -indent-6"><span className="text-tertiary select-none">- </span>outer two</li>
          </ul>

          <p>
            <span className="text-text-muted italic">asterisk italic</span> at
            the start of a line is not a bullet.
          </p>

          <p className="text-text-muted select-none">─────────────────────────────</p>

          <ul className="space-y-1">
            <li className="pl-6 -indent-6"><span className="text-tertiary select-none">- </span>a final item</li>
          </ul>
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

export default Entry94;
