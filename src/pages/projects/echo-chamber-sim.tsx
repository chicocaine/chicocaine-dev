import Prompt from "../../components/Prompt";
import { Link } from "react-router-dom";

function EchoChamberSim() {
  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">cat</span>{" "}
          <span className="text-secondary">~</span>
          <span className="text-text-muted">
            /projects/echo-chamber-sim/README.md
          </span>
        </Prompt>
      </p>

      <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
        <p className="text-text-muted text-xs mb-2">
          <span className="text-primary">echo-chamber-sim</span>
          <span className="text-text-muted select-none"> · </span>
          <span className="text-quaternary">Python</span>
          <span className="text-text-muted select-none"> · </span>
          <span className="text-tertiary">React TypeScript</span>
        </p>
        <p className="text-text-muted select-none mb-4">
          ─────────────────────────────
        </p>

        <div className="text-text space-y-3 leading-relaxed">
          <div>
            <p className="text-quaternary text-xs select-none mb-1">## What it is</p>
            <p>
              This is a simplified model and simulation of social media echo
              chambers. The goal was to model a network of agents, and to
              simulate how opinions and information affects the overall network,
              assessed using several different metrics.
            </p>
          </div>

          <div>
            <p className="text-quaternary text-xs select-none mb-1">## Why I built it</p>
            <p>
              This project is a university project for the class "Modeling and
              Simulation". I wanted something cool and interesting to model and
              simulate. And with the use of AI, while the timeframe was tight,
              made it more manageable when it came to research and
              implementation. So I went for it.
            </p>
          </div>

          <div>
            <p className="text-quaternary text-xs select-none mb-1">## Tech Stack</p>
            <div className="flex flex-wrap gap-x-6 gap-y-0.5">
              <span className="text-success">
                <span className="text-text-muted select-none">[</span>Python<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-quaternary">
                <span className="text-text-muted select-none">[</span>React<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-warning">
                <span className="text-text-muted select-none">[</span>TypeScript<span className="text-text-muted select-none">]</span>
              </span>
            </div>
          </div>

          <div>
            <p className="text-quaternary text-xs select-none mb-1">## Challenges</p>
            <p>
              The challenge was running the mathematics and calculations across
              a network of nodes under a short amount of time. In the end, with
              some assistance, I used some matrix operations and vectorization
              to optimize the calculations and speed things up. The other
              challenge was visualizing the network itself. I used
              react-force-graph-2d as it could handle around 1000 nodes fairly
              well whilst keeping it alive and interactive. Unfortunately, due
              to time constraints, I never got the real-time visualization to
              work, so I opted using simulation snapshots with intervals and
              used that to visualize the change over time.
            </p>
          </div>

          <div>
            <p className="text-quaternary text-xs select-none mb-1">## Source Code</p>
            <p>
              <span className="text-text-muted select-none">[</span>
              <a
                href="https://github.com/chicocaine/echo-chamber-sim"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-text-bright transition-colors"
              >
                github.com/chicocaine/echo-chamber-sim
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

export default EchoChamberSim;
