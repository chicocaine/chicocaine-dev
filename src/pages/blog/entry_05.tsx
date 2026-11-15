/*
 * entry_05.tsx — GENERATED FILE, DO NOT EDIT BY HAND.
 *
 * Source:  entries/entry_05.md
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
  id: "entry_05",
  title: "Ryoku Linux",
  date: "15-11-2026",
  label: "entry_05.md",
} as const;

function Entry05() {
  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">cat</span>{" "}
          <span className="text-secondary">~</span>
          <span className="text-text-muted">/blog/entry_05.md</span>
        </Prompt>
      </p>

      <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
        <p className="text-text-muted text-xs mb-2">
          <span className="text-primary">entry_05</span>
          <span className="text-text-muted select-none"> · </span>
          <span className="text-quaternary">15-11-2026</span>
        </p>
        <p className="text-text-muted select-none mb-4">
          ─────────────────────────────
        </p>

        <p className="text-lg sm:text-xl text-text-bright mb-6">
          <span className="text-tertiary select-none"># </span>
          Ryoku Linux
        </p>

        <div className="text-text space-y-4">
          <p>
            I don't think I am ready for setting up and ricing my own Arch Linux.
            So, I turned to pre-built, opinionated flavors of Arch Linux. I
            randomly stumbled upon{" "}
            <span className="text-danger font-bold">Ryoku</span> in the wild,
            thought it was cool, and decided to go for it.
          </p>

          <p>
            Installing was very straightforward. Download the Ryoku ISO, write it
            on a FAT32 flash drive using Rufus, turn off secure boot, and boot on
            the drive. I was impressed with how easy and streamlined installing
            it was. Partitioning, UEFI, drivers, window managers, themes, file
            managers, tools, terminal, users; all of it was already ready to go.
            All I had to do was pick what I wanted and boom, I had a working
            Linux environment. Then, I setup my secure boot keys using{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`sbctl`}</code>
            : generate, sign, and append.
          </p>

          <p>
            Now, basically, I haven't used a Linux UI before. I also haven't used{" "}
            <span className="text-primary font-bold">Wayland</span> or{" "}
            <span className="text-secondary">Hyprland</span> before. I only used
            the terminal of Linux with WSL2. Since I was already familiar with [zsh]&#123;.warning&#125;,{" "}
            <span className="text-success font-bold">fish</span> felt familiar to
            use. What I had to learn was how to navigate the binds and how tiling
            worked, which came naturally after a few rounds of using Ryoku Linux.
          </p>

          <p>
            I then spent a few hours on the settings menu. I do not kid, there
            are so many settings and themes. I wanted to streamline or make the
            environment my own, so a few moments were fairly justified. I do have
            to say, however, that there are just so much to take in, but at the
            same time, it is very beginner friendly and simple once I got used to
            it.
          </p>

          <p>
            <span className="text-danger font-bold">Ryoku</span> is pretty
            stacked, and it looks good.
          </p>

          <p>
            I will now try to spend most of my non-gaming, non-heavy{" "}
            <span className="text-tertiary">dev</span> work, and daily drive on
            Ryoku Linux,,, see how it feels.
          </p>

          <p>
            
            <span className="text-text-muted italic">I must confess that, I only had 80GB for this Ryoku install to test it. And looking back, maybe I do regret it.</span>
          </p>

          <p>
            <span className="text-text-muted italic">PS. Ryoku is nice. o7</span>
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

export default Entry05;
