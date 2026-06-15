import Prompt from "../../components/Prompt";
import { Link } from "react-router-dom";

function Eventara() {
  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">cat</span>{" "}
          <span className="text-secondary">~</span>
          <span className="text-text-muted">
            /projects/eventara/README.md
          </span>
        </Prompt>
      </p>

      <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
        <p className="text-text-muted text-xs mb-2">
          <span className="text-primary">eventara</span>
          <span className="text-text-muted select-none"> · </span>
          <span className="text-quaternary">FastAPI</span>
          <span className="text-text-muted select-none"> · </span>
          <span className="text-tertiary">Next.js</span>
        </p>
        <p className="text-text-muted select-none mb-4">
          ─────────────────────────────
        </p>

        <div className="text-text space-y-3 leading-relaxed">
          <div>
            <p className="text-quaternary text-xs select-none mb-1">## What it is</p>
            <p>
              This is an integrated community and event management platform to
              support the Davao DeFi Community PH in managing participants,
              events, volunteers, venues and analytics.
            </p>
          </div>

          <div>
            <p className="text-quaternary text-xs select-none mb-1">## Why I built it</p>
            <p>
              Started out as a Software Engineering class project with Davao
              DeFi Community PH's requirements, originally with Laravel, Vite
              and Vue.js, which then was transformed into its current, more
              robust and production inclined development.
            </p>
          </div>

          <div>
            <p className="text-quaternary text-xs select-none mb-1">## Tech Stack</p>
            <div className="flex flex-wrap gap-x-6 gap-y-0.5">
              <span className="text-success">
                <span className="text-text-muted select-none">[</span>Python (uv) FastAPI Alembic<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-danger">
                <span className="text-text-muted select-none">[</span>ARQ Redis<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-quaternary">
                <span className="text-text-muted select-none">[</span>Next.js 16, React 19<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-warning">
                <span className="text-text-muted select-none">[</span>TypeScript<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-tertiary">
                <span className="text-text-muted select-none">[</span>Tailwind CSS v4, shadcn/ui, Radix UI<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-primary">
                <span className="text-text-muted select-none">[</span>Node.js<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-text-bright">
                <span className="text-text-muted select-none">[</span>PostgreSQL<span className="text-text-muted select-none">]</span>
              </span>
            </div>
          </div>

          <div>
            <p className="text-quaternary text-xs select-none mb-1">## Challenges</p>
            <p>
              The challenge was the development of the solution based on the
              client's requirements and specifications, figuring out the best or
              at least, feasible or realistic approach to the implementation and
              tech stack selection. It was made easier because we had a team,
              each with their own responsibilities. We also had the
              communication to guide each other and build from the first
              prototype to the current state or version.
            </p>
          </div>

          <div>
            <p className="text-quaternary text-xs select-none mb-1">## Source Code</p>
            <p className="text-text-muted italic">— private repository</p>
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

export default Eventara;
