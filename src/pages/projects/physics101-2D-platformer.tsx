import Prompt from "../../components/Prompt";
import { Link } from "react-router-dom";

function Physics1012DPlatformer() {
  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">cat</span>{" "}
          <span className="text-secondary">~</span>
          <span className="text-text-muted">
            /projects/physics101-2D-platformer/README.md
          </span>
        </Prompt>
      </p>

      <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
        <p className="text-text-muted text-xs mb-2">
          <span className="text-primary">physics101-2D-platformer</span>
          <span className="text-text-muted select-none"> · </span>
          <span className="text-quaternary">Godot</span>
          <span className="text-text-muted select-none"> · </span>
          <span className="text-tertiary">GDScript</span>
        </p>
        <p className="text-text-muted select-none mb-4">
          ─────────────────────────────
        </p>

        <div className="text-text space-y-3 leading-relaxed">
          <div>
            <p className="text-quaternary text-xs select-none mb-1">## What it is</p>
            <p>
              This is a 2D platformer game made using Godot, that is also made
              to showcase physics behaviors and concepts like projectile motion,
              Newton's Laws of Motion, friction, springs and simple rope
              physics.
            </p>
          </div>

          <div>
            <p className="text-quaternary text-xs select-none mb-1">## Why I built it</p>
            <p>
              This was built for a physics project where we are supposed to
              highlight physics concepts using an interactive medium.
            </p>
          </div>

          <div>
            <p className="text-quaternary text-xs select-none mb-1">## Tech Stack</p>
            <div className="flex flex-wrap gap-x-6 gap-y-0.5">
              <span className="text-warning">
                <span className="text-text-muted select-none">[</span>Godot Game Engine<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-tertiary">
                <span className="text-text-muted select-none">[</span>GDScript<span className="text-text-muted select-none">]</span>
              </span>
            </div>
          </div>

          <div>
            <p className="text-quaternary text-xs select-none mb-1">## Challenges</p>
            <p>
              The challenge was well, learning how to make a game using Godot.
              Programming, scripting, nodes, animations, visuals, making the
              game engine, all of it. It involved a lot of tutorials, a lot of
              experimentation and AI guidance, but with a little pep, the ball
              started rolling and we were successfully able to produce a
              prototype and present it to the class.
            </p>
            <p className="mt-2">
              The part I really liked working on was the game engine systems
              like the audio bus, input system, HUD and menu system, event
              systems and the message bus. It is interesting that under the hood
              of a game, there are many sub systems required to keep the whole
              experience afloat.
            </p>
            <p className="text-text-muted mt-2 italic">
              PS. The professor liked it.
            </p>
          </div>

          <div>
            <p className="text-quaternary text-xs select-none mb-1">## Source Code</p>
            <p>
              <span className="text-text-muted select-none">[</span>
              <a
                href="https://github.com/chicocaine/physics101-2D-platformer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-text-bright transition-colors"
              >
                github.com/chicocaine/physics101-2D-platformer
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

export default Physics1012DPlatformer;
