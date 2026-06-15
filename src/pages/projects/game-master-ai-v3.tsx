import Prompt from "../../components/Prompt";
import { Link } from "react-router-dom";

function GameMasterAIV3() {
  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">cat</span>{" "}
          <span className="text-secondary">~</span>
          <span className="text-text-muted">
            /projects/game-master-ai-v3/README.md
          </span>
        </Prompt>
      </p>

      <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
        <p className="text-text-muted text-xs mb-2">
          <span className="text-primary">game-master-ai-v3</span>
          <span className="text-text-muted select-none"> · </span>
          <span className="text-quaternary">Python</span>
          <span className="text-text-muted select-none"> · </span>
          <span className="text-tertiary">OpenAI</span>
        </p>
        <p className="text-text-muted select-none mb-4">
          ─────────────────────────────
        </p>

        <div className="text-text space-y-3 leading-relaxed">
          <div>
            <p className="text-quaternary text-xs select-none mb-1">## What it is</p>
            <p>
              This is a Python text-based dungeon crawler and turn-based game
              engine built around a deterministic state machine,
              schema-validated JSON content and an LLM that is designed to act
              like the game master.
            </p>
            <p className="mt-2">
              Basically, this is a stripped DnD game, only showcasing simplified
              turn-based combat within a dungeon traversed via room crawling.
            </p>
            <p className="mt-2">
              The game is run using a deterministic engine, and is interacted
              with by talking to the game master (LLM). The game master parses
              your intent into an action that will then change or mutate the
              game state. The game master will narrate based on the events
              within the game.
            </p>
          </div>

          <div>
            <p className="text-quaternary text-xs select-none mb-1">## Why I built it</p>
            <p>
              Like many of my projects, this was one that surfaced from a
              university requirement, an Agentic NLP. I've always enjoyed the
              DnD experience so I thought, why not make a simplified DnD
              experience with the LLM as the dungeon master.
            </p>
          </div>

          <div>
            <p className="text-quaternary text-xs select-none mb-1">## Tech Stack</p>
            <div className="flex flex-wrap gap-x-6 gap-y-0.5">
              <span className="text-success">
                <span className="text-text-muted select-none">[</span>Python<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-primary">
                <span className="text-text-muted select-none">[</span>OpenAI<span className="text-text-muted select-none">]</span>
              </span>
            </div>
          </div>

          <div>
            <p className="text-quaternary text-xs select-none mb-1">## Challenges</p>
            <p>
              The main challenge I had with this was designing an architecture
              or a system that doesn't allow the LLM to hallucinate and make up
              incorrect or inconsistent changes, while simultaneously keeping
              the narration fresh and creative. I opted for "separation of
              domain" where each function of the game master — intent parsing,
              narration, conversing and the enemy LLM — was itself its own
              system of prompts and pipelines.
            </p>
            <p className="mt-2">
              As for the game engine itself, it was just a simple state machine,
              where a predefined schema and a predefined action will affect the
              current runtime states and objects, thus playing the game and
              moving it forward.
            </p>
          </div>

          <div>
            <p className="text-quaternary text-xs select-none mb-1">## Source Code</p>
            <p>
              <span className="text-text-muted select-none">[</span>
              <a
                href="https://github.com/chicocaine/game-master-ai-v3"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-text-bright transition-colors"
              >
                github.com/chicocaine/game-master-ai-v3
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

export default GameMasterAIV3;
