/*
 * entry_01.tsx — GENERATED FILE, DO NOT EDIT BY HAND.
 *
 * Source:  entries/entry_01.md
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
  id: "entry_01",
  title: "The Cost of Efficiency",
  date: "10-10-2026",
  label: "entry_01.md",
} as const;

function Entry01() {
  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">cat</span>{" "}
          <span className="text-secondary">~</span>
          <span className="text-text-muted">/blog/entry_01.md</span>
        </Prompt>
      </p>

      <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
        <p className="text-text-muted text-xs mb-2">
          <span className="text-primary">entry_01</span>
          <span className="text-text-muted select-none"> · </span>
          <span className="text-quaternary">10-10-2026</span>
        </p>
        <p className="text-text-muted select-none mb-4">
          ─────────────────────────────
        </p>

        <p className="text-lg sm:text-xl text-text-bright mb-6">
          <span className="text-tertiary select-none"># </span>
          The Cost of Efficiency
        </p>

        <div className="text-text space-y-4">
          <p>
            I started learning how to program right as I entered my first year at
            university as a computer science student. I would not say that I was
            good at programming. I could deal with simple code: variables,
            conditionals, loops, functions, and the like. However, it would take
            me a long time to know what a piece of code does. I even struggled
            with concepts most would consider basic programming paradigms.
          </p>

          <p>
            One of my first software projects for a class was with a group. I
            tried my hand at writing some good code; well, I thought it was
            decent enough, only to be entirely rewritten by a peer better than I
            was. I ended up being{" "}
            <span className="text-text-muted italic">&ldquo;the guy who buys snacks and coffee for the team&rdquo;</span>{" "}
            or{" "}
            <span className="text-text-muted italic">&ldquo;the guy who talks&rdquo;</span>
            . Needless to say, I felt entirely{" "}
            <span className="text-danger font-bold">useless</span>.
          </p>

          <p>
            LLMs at this time are relatively on the young side. OpenAI just
            released ChatGPT about half a year ago, but I did not know anything
            about them until a quarter into 2023. Stumbling upon LLMs was like
            stumbling upon a list of GTA cheat codes. A hack. I could instruct it
            to get information or do things for me, and bam, just like that,
            seconds later we get some text. Was the output good? I wouldn&rsquo;t know
            at that time. I was clueless that I couldn&rsquo;t tell. For a beginner
            however, it was{" "}
            <span className="text-success font-bold">empowering</span>.
          </p>

          <p>
            Since then, when learning how to code, or when doing a project, the
            process almost always included an LLM in the middle. I mean, it was
            just more <span className="text-primary font-bold">efficient</span>{" "}
            that way: I could instruct it to explain how snippets of code worked;
            I could instruct it to teach me how to code; I could instruct it to
            tell me what the best architecture is for a specific set of
            requirements; I could instruct it to write code for me; Fuck it, I
            could instruct it to tell me how to instruct it better. It felt so{" "}
            <span className="text-primary font-bold">fast</span> and so{" "}
            <span className="text-primary font-bold">good</span>. I could make
            decent projects. I can finally be{" "}
            <span className="text-success font-bold">useful</span>.
          </p>

          <p>
            A few more dances and now I&rsquo;m tired. The way I use the{" "}
            <span className="text-text-muted italic">&ldquo;tool&rdquo;</span>{" "}
            feels like <span className="text-danger font-bold">slop</span>.
            Projects became unsatisfyingly exhausting. I find it harder to be
            proud of what{" "}
            <span className="text-text-muted italic">&ldquo;I&rdquo;</span> made.
            I find myself asking instead of looking for answers. I find myself
            telling more than doing. I find myself learning for the sake of
            necessity, instead of curiosity. The efficiency that felt so good
            then now feels like{" "}
            <span className="text-danger font-bold">shit</span>.
          </p>

          <p>
            This is where I am currently at, and I would like to change. I&rsquo;m
            looking for the joy of making cool shit. The passion that I had is
            probably still in there. I just need to slow down.
          </p>

          <p className="text-text-muted text-xs italic pt-2">
            P.S. I am no pro. Just a guy learning about stuff.
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

export default Entry01;
