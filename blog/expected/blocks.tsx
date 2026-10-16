/*
 * entry_93.tsx — GENERATED FILE, DO NOT EDIT BY HAND.
 *
 * Source:  entries/fixtures/blocks.md
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
  id: "entry_93",
  title: "Blocks",
  date: "04-01-2026",
  label: "entry_93.md",
} as const;

function Entry93() {
  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">cat</span>{" "}
          <span className="text-secondary">~</span>
          <span className="text-text-muted">/blog/entry_93.md</span>
        </Prompt>
      </p>

      <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
        <p className="text-text-muted text-xs mb-2">
          <span className="text-primary">entry_93</span>
          <span className="text-text-muted select-none"> · </span>
          <span className="text-quaternary">04-01-2026</span>
        </p>
        <p className="text-text-muted select-none mb-4">
          ─────────────────────────────
        </p>

        <p className="text-lg sm:text-xl text-text-bright mb-6">
          <span className="text-tertiary select-none"># </span>
          Blocks
        </p>

        <div className="text-text space-y-4">
          <p className="text-sm text-quaternary">
            <span className="text-quaternary select-none">## </span>Second level
          </p>

          <p className="text-sm text-tertiary">
            <span className="text-tertiary select-none">### </span>Third level
          </p>

          <p className="text-sm text-secondary">
            <span className="text-secondary select-none">#### </span>Fourth level
          </p>

          <p className="text-sm text-primary">
            <span className="text-primary select-none">##### </span>Fifth level
          </p>

          <p className="text-xs text-text-muted">
            <span className="text-text-muted select-none">###### </span>Sixth level
          </p>

          <p className="text-text-muted select-none">─────────────────────────────</p>

          <p>
            A paragraph after a rule.
          </p>

          <blockquote className="border-l-2 border-border pl-4 text-text-muted">
            <p>
              A quoted line. Second quoted line.
            </p>
            <p>
              A second quoted paragraph.
            </p>
          </blockquote>

          <blockquote className="border-l-2 border-border pl-4 text-text-muted">
            <p>
              Quoted list:
            </p>
            <ul className="space-y-1">
              <li className="pl-6 -indent-6"><span className="text-tertiary select-none">- </span>one</li>
              <li className="pl-6 -indent-6"><span className="text-tertiary select-none">- </span>two</li>
            </ul>
          </blockquote>

          <p>
            #no space is not a heading
          </p>

          <p>
            -- is not a horizontal rule
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

export default Entry93;
