/*
 * entry_92.tsx — GENERATED FILE, DO NOT EDIT BY HAND.
 *
 * Source:  entries/fixtures/links-images.md
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
  id: "entry_92",
  title: "Links and images",
  date: "03-01-2026",
  label: "entry_92.md",
} as const;

function Entry92() {
  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">cat</span>{" "}
          <span className="text-secondary">~</span>
          <span className="text-text-muted">/blog/entry_92.md</span>
        </Prompt>
      </p>

      <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
        <p className="text-text-muted text-xs mb-2">
          <span className="text-primary">entry_92</span>
          <span className="text-text-muted select-none"> · </span>
          <span className="text-quaternary">03-01-2026</span>
        </p>
        <p className="text-text-muted select-none mb-4">
          ─────────────────────────────
        </p>

        <p className="text-lg sm:text-xl text-text-bright mb-6">
          <span className="text-tertiary select-none"># </span>
          Links and images
        </p>

        <div className="text-text space-y-4">
          <p>
            Inline:{" "}
            <a href="https://example.com" className="text-tertiary hover:text-primary transition-colors underline">a</a>
            .
          </p>

          <p>
            With title:{" "}
            <a href="https://example.com" title="Title here" className="text-tertiary hover:text-primary transition-colors underline">a</a>
            .
          </p>

          <p>
            Angle destination:{" "}
            <a href="https://example.com/a b" className="text-tertiary hover:text-primary transition-colors underline">a</a>
            .
          </p>

          <p>
            Label with emphasis:{" "}
            <a href="https://example.com" className="text-tertiary hover:text-primary transition-colors underline">b <span className="font-bold text-text-bright">c</span></a>
            .
          </p>

          <p>
            Nested brackets:{" "}
            <a href="https://example.com" className="text-tertiary hover:text-primary transition-colors underline">a [b] c</a>
            .
          </p>

          <p>
            Not a link: [not a link] stays literal.
          </p>

          <p>
            Image:{" "}
            <img src="/blog/x.png" alt="alt text" className="my-2 max-w-full rounded border border-border" />
            .
          </p>

          <p>
            Unsafe scheme:{" "}
            <a href="#" className="text-tertiary hover:text-primary transition-colors underline">x</a>{" "}
            becomes a hash.
          </p>

          <p>
            Safe schemes:{" "}
            <a href="mailto:a@b.c" className="text-tertiary hover:text-primary transition-colors underline">m</a>{" "}
            and{" "}
            <a href="/about" className="text-tertiary hover:text-primary transition-colors underline">r</a>{" "}
            and{" "}
            <a href="#top" className="text-tertiary hover:text-primary transition-colors underline">t</a>
            .
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

export default Entry92;
