/*
 * entry_04.tsx — GENERATED FILE, DO NOT EDIT BY HAND.
 *
 * Source:  entries/entry_04.md
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
  id: "entry_04",
  title: "Hello :)",
  date: "08-11-2026",
  label: "entry_04.md",
} as const;

function Entry04() {
  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">cat</span>{" "}
          <span className="text-secondary">~</span>
          <span className="text-text-muted">/blog/entry_04.md</span>
        </Prompt>
      </p>

      <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
        <p className="text-text-muted text-xs mb-2">
          <span className="text-primary">entry_04</span>
          <span className="text-text-muted select-none"> · </span>
          <span className="text-quaternary">08-11-2026</span>
        </p>
        <p className="text-text-muted select-none mb-4">
          ─────────────────────────────
        </p>

        <p className="text-lg sm:text-xl text-text-bright mb-6">
          <span className="text-tertiary select-none"># </span>
          Hello :)
        </p>

        <div className="text-text space-y-4">
          <p>
            As of right now, I really don't have anything in mind to write about.
            Projects and milestones and such are currently still in progress.
            There's not much to talk about, so instead, this will be a simple
            update with some thoughts sprinkled here and there.
          </p>

          <p className="text-sm text-quaternary">
            <span className="text-quaternary select-none">## </span>cs thesis
          </p>

          <p>
            Recently, I've been putting most of my time into the CS course
            thesis. We're still early into the implementation. Is it fun?{" "}
            <span className="text-text-muted italic">eh~</span> The status quo is
            not going as smooth as it could be but it's not going too bad. I'm
            definitely going to write about it once some rough edges are
            smoothed, and setbacks have been settled.
          </p>

          <p className="text-sm text-quaternary">
            <span className="text-quaternary select-none">## </span>dual booting
          </p>

          <p>
            I am also trying dual booting. I did manage to install base Arch
            Linux, but I have not made the time to setup and build the
            environment from the bottom. I could squeeze some time into slowly
            building Arch, but given how I have other projects and that this is
            also a university project with a deadline, I might just try a
            pre-configured Arch Linux.{" "}
            <span className="text-danger font-bold">Ryoku</span>{" "}
            <span className="text-danger font-bold">Arch</span> seems cool.
          </p>

          <p className="text-sm text-quaternary">
            <span className="text-quaternary select-none">## </span>specialization and job?
          </p>

          <p>
            I am a CS student in the last year of my degree. Well, if all goes
            well then it{" "}
            <span className="font-bold text-text-bright">should</span> be the
            last year, and that I'd be off to graduate in{" "}
            <span className="text-primary font-bold">2027</span>. This also means
            that I am going to start thinking about applying and getting a job. I
            don't know much about what the current landscape is for CS graduates,
            but I will start looking around. There are many paths I can take or
            start with, and choosing the{" "}
            <span className="text-text-muted italic">&quot;right one&quot;</span>{" "}
            has always been something on my mind.{" "}
            <span className="text-text-muted italic">What should I go for?</span>
          </p>

          <p className="text-sm text-quaternary">
            <span className="text-quaternary select-none">## </span>other side-projects and stuff
          </p>

          <p>
            I haven't put much time into side projects that I actually want to
            do. I am currently stressing on school work, keeping scholarships and
            such, and recently I've been putting too much time into{" "}
            <span className="text-secondary">games</span> and scrolling in{" "}
            <span className="text-danger font-bold">social</span>{" "}
            <span className="text-danger font-bold">media</span>, instead of
            actually being smart and working on putting myself at an advantage.{" "}
            <span className="text-text-muted italic">AWARE,,, I'd better lock in~</span>
          </p>

          <p className="text-text-muted text-xs italic pt-2">
            P.S. Wish me wishes. o7
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

export default Entry04;
