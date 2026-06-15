import Prompt from "../components/Prompt";
import { Link } from "react-router-dom";

const projects = [
  {
    slug: "game-master-ai-v3",
    label: "game-master-ai-v3",
    meta: "Python · OpenAI · LLM dungeon crawler",
  },
  {
    slug: "echo-chamber-sim",
    label: "echo-chamber-sim",
    meta: "Python · React TypeScript · agent-based simulation",
  },
  {
    slug: "eventara",
    label: "eventara",
    meta: "FastAPI · Next.js · event & community management",
  },
  {
    slug: "chicocaine-dev",
    label: "chicocaine-dev",
    meta: "React TypeScript · Cloudflare Workers · this site",
  },
  {
    slug: "physics101-2D-platformer",
    label: "physics101-2D-platformer",
    meta: "Godot · GDScript · 2D physics platformer",
  },
];

function Projects() {
  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">ls</span>{" "}
          <span className="text-text-muted">-la</span>{" "}
          <span className="text-secondary">~</span>
          <span className="text-text-muted">/projects/</span>
        </Prompt>
      </p>

      <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
        <p className="text-text-muted text-xs select-none mb-4">
          <span className="text-primary">total</span>{" "}
          <span className="text-text">{projects.length}</span>
        </p>

        <div className="space-y-3">
          {projects.map((project) => (
            <Link
              key={project.slug}
              to={`/projects/${project.slug}`}
              className="block text-left w-full hover:bg-surface rounded px-2 py-1 -mx-2 transition-colors"
            >
              <p>
                <span className="text-text-muted select-none">
                  drwxr-xr-x{" "}
                </span>
                <span className="text-primary hover:text-quaternary transition-colors">
                  {project.label}
                  <span className="text-text-muted select-none">/</span>
                </span>
              </p>
              <p className="text-text-muted text-xs ml-4">
                {project.meta}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <p className="pt-8">
        <Prompt>
          <span className="inline-block w-3 h-5 bg-text align-middle animate-pulse" />
        </Prompt>
      </p>
    </main>
  );
}

export default Projects;
