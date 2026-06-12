import Prompt from "../components/Prompt";
import { Link } from "react-router-dom";

function About() {
  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed space-y-12">
      {/* introduction */}
      <section>
        <p>
          <Prompt>
            <span className="text-text">cat</span>{" "}
            <span className="text-secondary">~</span>
            <span className="text-text-muted">/about.md</span>
          </Prompt>
        </p>
        <div className="mt-4 pl-4 border-l-2 border-border space-y-4 max-w-2xl">
          <div>
            <p className="text-primary">
              <span className="text-tertiary select-none"># </span>
              About Me
            </p>
            <p className="text-lg sm:text-xl text-text-bright mt-1">
              Eduard Anthony Pechayco
            </p>
            <p className="text-secondary mt-0.5">
              a.k.a. <span className="text-primary font-bold">chicocaine</span>
            </p>
          </div>

          <p className="text-text-muted select-none">
            ─────────────────────────────────────────
          </p>

          <p className="text-text">
            Halo! I'm a Computer Science student with a small simple curiosity for 
            how and why things work, don't work, should work and shouldn't work. I 
            enjoy building things that I feel are{" "}
            <span className="text-primary">cool</span>, whether it's a web app, a{" "} 
            <Link to="/secret-fun/gaming" 
                  className="hover:text-primary transition-colors"
            >game</Link>{" "}
            prototype, or a simulation.
          </p>

          <p className="text-text">
            I'm drawn to the intersections of{" "}
            <span className="text-quaternary">AI &amp; Machine Learning</span>,{" "}
            <span className="text-success">Modeling &amp; Simulation</span>,{" "}
            <span className="text-warning">Web Development</span> and{" "}
            <span className="text-danger">Game Development</span>. My goal is to
            create things that I find both cool and functional, that I, and hopefully 
            others, would want to use.
          </p>

          <p className="text-text">
            When I'm not coding, you'll find me listening to{" "}
            <span className="text-tertiary">music</span>, be in a{" "}
            <span className="text-quaternary">discord call</span> playing{" "}
            <span className="text-primary">video games</span>, or just generally{" "}
            <span className="text-secondary">chilling and learning</span>. I also occasionally{" "}
            <Link to="/secret-fun/read" className="text-text hover:text-primary transition-colors">
              read
            </Link> and take some{" "}
            <Link to="/secret-fun/notes" className="text-text hover:text-primary transition-colors">
              notes
            </Link>
            .
          </p>
        </div>
      </section>

      {/* currently */}
      <section>
        <p>
          <Prompt>
            <span className="text-text">cat</span>{" "}
            <span className="text-secondary">~</span>
            <span className="text-text-muted">/currently.md</span>
          </Prompt>
        </p>
        <div className="mt-4 pl-4 border-l-2 border-border space-y-3 max-w-2xl">
          <p className="text-primary">
            <span className="text-tertiary select-none">## </span>
            What I'm Currently Doing
          </p>

          <div className="space-y-2 text-text">
            <p>
              <span className="text-success select-none">→ </span>
              Pursuing a Bachelor's degree in{" "}
              <span className="text-primary">Computer Science</span>
            </p>
            <p>
              <span className="text-success select-none">→ </span>
              Doing my{" "}
              <span className="text-primary">Bachelor's thesis</span> on{" "}
              [redacted]
            </p>
            <p>
              <span className="text-success select-none">→ </span>
              Exploring{" "}
              <span className="text-quaternary">Machine Learning</span> and{" "}
              <span className="text-quaternary">Deep Learning</span>{" "}
              fundamentals
            </p>
            <p>
              <span className="text-success select-none">→ </span>
              Building this portfolio with{" "}
              <span className="text-warning">React</span>,{" "}
              <span className="text-warning">TypeScript</span>, and{" "}
              <span className="text-warning">Cloudflare Workers</span>
            </p>
            {/* <p>
              <span className="text-success select-none">→ </span>
              Learning{" "}
              <span className="text-danger">game development</span> with{" "}
              <span className="text-tertiary">Godot</span> and{" "}
              <span className="text-tertiary">Unity</span>
            </p> */}
            {/* <p>
              <span className="text-success select-none">→ </span>
              Diving deeper into{" "}
              <span className="text-secondary">software architecture</span> and{" "}
              <span className="text-secondary">system design</span>
            </p> */}
          </div>

          <p className="text-text-muted text-xs select-none">
            ── last updated: June 2026 ──
          </p>
        </div>
      </section>

      {/* technologies & languages */}
      <section>
        <p>
          <Prompt>
            <span className="text-text">ls</span>{" "}
            <span className="text-secondary">~</span>
            <span className="text-text-muted">/skills/</span>
          </Prompt>
        </p>
        <div className="mt-3 space-y-4 pl-4 border-l-2 border-border max-w-2xl">
          {/* languages */}
          <div>
            <p className="text-text-muted text-xs select-none mb-1">
              ── languages ──
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-0.5">
              <span className="text-success">
                <span className="text-text-muted select-none">[</span>Python<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-warning">
                <span className="text-text-muted select-none">[</span>TypeScript<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-text-bright">
                <span className="text-text-muted select-none">[</span>JavaScript<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-danger">
                <span className="text-text-muted select-none">[</span>C<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-primary">
                <span className="text-text-muted select-none">[</span>C++<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-secondary">
                <span className="text-text-muted select-none">[</span>C#<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-quaternary">
                <span className="text-text-muted select-none">[</span>Java<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-text">
                <span className="text-text-muted select-none">[</span>HTML<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-success">
                <span className="text-text-muted select-none">[</span>CSS<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-danger">
                <span className="text-text-muted select-none">[</span>SQL<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-tertiary">
                <span className="text-text-muted select-none">[</span>GDScript<span className="text-text-muted select-none">]</span>
              </span>
            </div>
          </div>

          {/* frameworks & libraries */}
          <div>
            <p className="text-text-muted text-xs select-none mb-1">
              ── frameworks &amp; libraries ──
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-0.5">
              <span className="text-quaternary">
                <span className="text-text-muted select-none">[</span>React<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-warning">
                <span className="text-text-muted select-none">[</span>Tailwind CSS<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-primary">
                <span className="text-text-muted select-none">[</span>Node.js<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-text-bright">
                <span className="text-text-muted select-none">[</span>Vite<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-secondary">
                <span className="text-text-muted select-none">[</span>NumPy<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-danger">
                <span className="text-text-muted select-none">[</span>Pandas<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-tertiary">
                <span className="text-text-muted select-none">[</span>scikit-learn<span className="text-text-muted select-none">]</span>
              </span>
            </div>
          </div>

          {/* tools & platforms */}
          <div>
            <p className="text-text-muted text-xs select-none mb-1">
              ── tools &amp; platforms ──
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-0.5">
              <span className="text-primary">
                <span className="text-text-muted select-none">[</span>Git<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-success">
                <span className="text-text-muted select-none">[</span>Linux<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-quaternary">
                <span className="text-text-muted select-none">[</span>Cloudflare<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-warning">
                <span className="text-text-muted select-none">[</span>Godot<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-tertiary">
                <span className="text-text-muted select-none">[</span>Unity<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-text-bright">
                <span className="text-text-muted select-none">[</span>Figma<span className="text-text-muted select-none">]</span>
              </span>
            </div>
          </div>

          {/* databases */}
          <div>
            <p className="text-text-muted text-xs select-none mb-1">
              ── databases ──
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-0.5">
              <span className="text-primary">
                <span className="text-text-muted select-none">[</span>PostgreSQL<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-success">
                <span className="text-text-muted select-none">[</span>SQLite<span className="text-text-muted select-none">]</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* certifications */}
      <section>
        <p>
          <Prompt>
            <span className="text-text">ls</span>{" "}
            <span className="text-secondary">~</span>
            <span className="text-text-muted">/certs/</span>
          </Prompt>
        </p>
        <div className="mt-4 pl-4 border-l-2 border-border space-y-3 max-w-2xl">
          <p className="text-primary">
            <span className="text-tertiary select-none">## </span>
            Certifications
          </p>

          <div className="space-y-3 text-text">
            <div>
              <p>
                <span className="text-success select-none">[✓] </span>
                <span className="text-text-bright">
                  Information Technology Specialist in Databases
                </span>
              </p>
              <p className="text-text-muted ml-5 text-xs">
                Certiport — 2025
              </p>
              <p className="text-text-muted ml-5 text-xs">
                Database design, SQL, and data management fundamentals.
              </p>
            </div>

            <div>
              <p>
                <span className="text-success select-none">[✓] </span>
                <span className="text-text-bright">
                  Information Technology Specialist in Java
                </span>
              </p>
              <p className="text-text-muted ml-5 text-xs">
                Certiport — 2024
              </p>
              <p className="text-text-muted ml-5 text-xs">
                Java programming fundamentals, OOP, and software development.
              </p>
            </div>
          </div>

          <p className="text-text-muted select-none text-xs">
            ── <span className="text-success">[✓]</span> completed &nbsp;
            <span className="text-warning">[~]</span> in progress ──
          </p>
        </div>
      </section>

      {/* interests */}
      <section>
        <p>
          <Prompt>
            <span className="text-text">cat</span>{" "}
            <span className="text-secondary">~</span>
            <span className="text-text-muted">/interests.md</span>
          </Prompt>
        </p>
        <div className="mt-4 pl-4 border-l-2 border-border space-y-3 max-w-2xl">
          <p className="text-primary">
            <span className="text-tertiary select-none">## </span>
            Interests &amp; Hobbies
          </p>

          <div className="space-y-1 text-text">
            <p>
              <span className="text-quaternary select-none">▸ </span>
              <span className="text-text-bright">Philosophy</span>
              <span className="text-text-muted">
                {" "}
                — thinking about the why, the how, and the what of existence, 
                knowledge, truth and ethics
              </span>
            </p>
            <p>
              <span className="text-quaternary select-none">▸ </span>
              <span className="text-text-bright">Stories</span>
              <span className="text-text-muted">
                {" "}
                — narratives, perspectives and exploring the human experience through 
                mediums
              </span>
            </p>
            <p>
              <span className="text-quaternary select-none">▸ </span>
              <span className="text-text-bright">Artificial Intelligence</span>
              <span className="text-text-muted">
                {" "}
                — machine learning, neural networks, NLP, reinforcement learning
                and the philosophy of intelligence
              </span>
            </p>
            <p>
              <span className="text-quaternary select-none">▸ </span>
              <span className="text-text-bright">Game Development</span>
              <span className="text-text-muted">
                {" "}
                — prototyping mechanics, level design and interactive storytelling
              </span>
            </p>
            <p>
              <span className="text-quaternary select-none">▸ </span>
              <span className="text-text-bright">Simulation, Visualization, Theory &amp; Modeling</span>
              <span className="text-text-muted">
                {" "}
                — physics engines, agent-based models, mathematics and procedural generation
              </span>
            </p>
            <p>
              <span className="text-quaternary select-none">▸ </span>
              <span className="text-text-bright">Open Source</span>
              <span className="text-text-muted">
                {" "}
                — contributing to and learning from community-driven projects
              </span>
            </p>
            <p>
              <span className="text-quaternary select-none">▸ </span>
              <span className="text-text-bright">TUI &amp; Ricing</span>
              <span className="text-text-muted">
                {" "}
                — it just hits the right spot between coolness and functionality
              </span>
            </p>
            <p>
              <span className="text-quaternary select-none">▸ </span>
              <span className="text-text-bright">Music</span>
              <span className="text-text-muted">
                {" "}
                — listening, curating playlists, and occasionally making noise
              </span>
            </p>
            <p>
              <span className="text-quaternary select-none">▸ </span>
              <span className="text-text-bright">Rhythm Games</span>
              <span className="text-text-muted">
                {" "}
                — osu!, because clicking circles is oddly satisfying
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* links */}
      <section>
        <p>
          <Prompt>
            <span className="text-text">ls</span>{" "}
            <span className="text-secondary">~</span>
            <span className="text-text-muted">/links/</span>
          </Prompt>
        </p>
        <div className="mt-3 pl-4 border-l-2 border-border space-y-1 max-w-2xl">
          <p>
            <span className="text-text-muted select-none">[</span>
            <a
              href="https://github.com/chicocaine"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-text-bright transition-colors"
            >
              GitHub
            </a>
            <span className="text-text-muted select-none">]</span>
            <span className="text-text-muted ml-2 select-none">──</span>
            <span className="text-text ml-2">github.com/chicocaine</span>
          </p>
          <p>
            <span className="text-text-muted select-none">[</span>
            <a
              href="mailto:hi@chicocaine.dev"
              className="text-success hover:text-text-bright transition-colors"
            >
              Email
            </a>
            <span className="text-text-muted select-none">]</span>
            <span className="text-text-muted ml-2 select-none">──</span>
            <span className="text-text ml-2">hi@chicocaine.dev</span>
          </p>
          <p>
            <span className="text-text-muted select-none">[</span>
            <a
              href="https://www.linkedin.com/in/chicocaine/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-quaternary hover:text-text-bright transition-colors"
            >
              LinkedIn
            </a>
            <span className="text-text-muted select-none">]</span>
            <span className="text-text-muted ml-2 select-none">──</span>
            <span className="text-text ml-2">linkedin.com/in/chicocaine</span>
          </p>
          <p>
            <span className="text-text-muted select-none">[</span>
            <span className="text-warning">Resume</span>
            <span className="text-text-muted select-none">]</span>
            <span className="text-text-muted ml-2 select-none">──</span>
            <span className="text-text-muted ml-2 italic">
              PDF resume will be available for viewing and download soon.
            </span>
          </p>
          <p>
            <span className="text-text-muted select-none">[</span>
            <span className="text-danger">CV</span>
            <span className="text-text-muted select-none">]</span>
            <span className="text-text-muted ml-2 select-none">──</span>
            <span className="text-text-muted ml-2 italic">
              Full curriculum vitae will be available for viewing and download
              soon.
            </span>
          </p>
        </div>
      </section>

      {/* blinking cursor */}
      <p>
        <Prompt>
          <span className="inline-block w-3 h-5 bg-text align-middle animate-pulse" />
        </Prompt>
      </p>
    </main>
  );
}

export default About;
