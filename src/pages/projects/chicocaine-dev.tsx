import Prompt from "../../components/Prompt";
import { Link } from "react-router-dom";

function ChicocaineDev() {
  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">cat</span>{" "}
          <span className="text-secondary">~</span>
          <span className="text-text-muted">
            /projects/chicocaine-dev/README.md
          </span>
        </Prompt>
      </p>

      <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
        <p className="text-text-muted text-xs mb-2">
          <span className="text-primary">chicocaine-dev</span>
          <span className="text-text-muted select-none"> · </span>
          <span className="text-quaternary">React TypeScript</span>
          <span className="text-text-muted select-none"> · </span>
          <span className="text-tertiary">Cloudflare Workers</span>
        </p>
        <p className="text-text-muted select-none mb-4">
          ─────────────────────────────
        </p>

        <div className="text-text space-y-3 leading-relaxed">
          <div>
            <p className="text-quaternary text-xs select-none mb-1">## What it is</p>
            <p>
              It's this site that you are viewing this on, a web portfolio that
              also acts as a personal site, where I could add and deploy
              features and content that I want to.
            </p>
          </div>

          <div>
            <p className="text-quaternary text-xs select-none mb-1">## Why I built it</p>
            <p>
              They say that web portfolios are the new hip thing as a developer.
              I also needed it for my internship applications.
            </p>
            <p className="mt-2">
              And I think the idea of a personal site, where you can deploy and
              put out features and content in the internet, free to see out
              there, is fun and cool.
            </p>
          </div>

          <div>
            <p className="text-quaternary text-xs select-none mb-1">## Tech Stack</p>
            <div className="flex flex-wrap gap-x-6 gap-y-0.5">
              <span className="text-quaternary">
                <span className="text-text-muted select-none">[</span>React<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-warning">
                <span className="text-text-muted select-none">[</span>TypeScript<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-tertiary">
                <span className="text-text-muted select-none">[</span>Tailwind CSS<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-primary">
                <span className="text-text-muted select-none">[</span>Cloudflare Workers + Wrangler<span className="text-text-muted select-none">]</span>
              </span>
            </div>
          </div>

          <div>
            <p className="text-quaternary text-xs select-none mb-1">## Challenges</p>
            <p>
              The main challenge was learning the tech stack. I am not claiming
              to have completed the learning journey but this is something that
              should become constant and natural over time.
            </p>
          </div>

          <div>
            <p className="text-quaternary text-xs select-none mb-1">## Current Features</p>
            <p>
              Apart from being a web portfolio, it also features a page where
              you can view encrypted messages that I put in using a specific
              key. Other hidden pages also show things that I want to share.
            </p>
          </div>

          <div>
            <p className="text-quaternary text-xs select-none mb-1">## Source Code</p>
            <p>
              <span className="text-text-muted select-none">[</span>
              <a
                href="https://github.com/chicocaine/chicocaine-dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-text-bright transition-colors"
              >
                github.com/chicocaine/chicocaine-dev
              </a>
              <span className="text-text-muted select-none">]</span>
            </p>
          </div>
        </div>

        <p className="text-text-muted select-none mt-6">
          ─────────────────────────────
        </p>

        <Link
          to="/projects"
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

export default ChicocaineDev;
