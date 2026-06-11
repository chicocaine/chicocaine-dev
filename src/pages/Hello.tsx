import { useEffect, useState } from "react";
import Prompt from "../components/Prompt";
import { getTheme } from "../scripts/themes";
import { getLocalTime, getSessionUptime, initSession } from "../scripts/clock";

initSession();

function AsciiArt() {
  return (
    <pre className="text-primary leading-none select-none text-[8px] sm:text-sm">
{`          @@@@@@@@@@@@@@@
       @@@@             @@@@
     @@@                   @@@
   @@@                       @@@
  @@                           @@
 @@                             @@
 @      @@@                @@@   @
@@      @@@                @@@   @@
@@                               @@
@@         @@@@@@@@@@@@@@@@@     @@
 @                               @
 @@                             @@
  @@                           @@
   @@@                       @@@
     @@@                   @@@
       @@@@             @@@@
          @@@@@@@@@@@@@@@
`}
    </pre>
  );
}

function Home() {
  const [localTime, setLocalTime] = useState(getLocalTime);
  const [uptime, setUptime] = useState(getSessionUptime);
  const [theme, setTheme] = useState(getTheme().name);

  useEffect(() => {
    const tick = setInterval(() => {
      setLocalTime(getLocalTime());
      setUptime(getSessionUptime());
      setTheme(getTheme().name);
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 flex flex-col gap-8 text-sm leading-relaxed">
      {/* fastfetch section */}
      <section>
        <p>
          <Prompt><span className="text-text">fastfetch</span></Prompt>
        </p>
        <div className="flex flex-col lg:flex-row gap-x-12 gap-y-4 mt-3 border-l-2 border-border pl-3">
          <AsciiArt />
          <div className="text-text-muted space-y-0.5">
            <p>
              <span className="text-primary font-bold">visitor</span>
              <span className="text-tertiary font-bold">@</span>
              <span className="text-quaternary font-bold">chicocaine</span>
            </p>
            <p className="text-text-muted select-none">──────────────────</p>
            <p>
              <span className="text-primary font-bold">OS:</span>{" "}
              <span className="text-text">Ubuntu 26.04 LTS</span>
            </p>
            <p>
              <span className="text-primary font-bold">Host:</span>{" "}
              <span className="text-text">Windows Subsystem for Linux</span>
            </p>
            <p>
              <span className="text-primary font-bold">Shell:</span>{" "}
              <span className="text-text">zsh</span>
            </p>
            <p>
              <span className="text-primary font-bold">Uptime:</span>{" "}
              <span className="text-text">{uptime}</span>
            </p>
            <p>
              <span className="text-primary font-bold">Time:</span>{" "}
              <span className="text-text">{localTime}</span>
            </p>
            <p>
              <span className="text-primary font-bold">Editor:</span>{" "}
              <span className="text-text">Neovim</span>
            </p>
            <p>
              <span className="text-primary font-bold">WM:</span>{" "}
              <span className="text-text">Hyprland</span>
            </p>
            <p>
              <span className="text-primary font-bold">Packages:</span>{" "}
              <span className="text-text">42 (dpkg)</span>
            </p>
            <p>
              <span className="text-primary font-bold">Theme:</span>{" "}
              <span className="text-text">{theme}</span>
            </p>
          </div>
        </div>
      </section>

      {/* about section */}
      <section>
        <p>
          <Prompt>
            <span className="text-text">cat</span>{" "}
            <span className="text-secondary">~</span>
            <span className="text-text-muted">/intro.md</span>
          </Prompt>
        </p>
        <div className="mt-4 space-y-4 text-text pl-4 border-l-2 border-border">
          <div>
            <p className="text-primary">
              <span className="text-tertiary select-none"># </span>
              Hello, I am
            </p>
            <p className="text-lg sm:text-xl text-text-bright mt-1">
              Eduard Anthony
            </p>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mt-1">
              "chicocaine"
            </p>
            <p className="text-lg sm:text-xl text-secondary mt-0.5">
              Pechayco
            </p>
          </div>

          <p className="text-text-muted max-w-2xl">
            Just a Computer Science student currently interested in AI &
            Machine Learning, Modeling & Simulation, WebDev, and Game
            Development. Always learning ;p.
          </p>
        </div>
      </section>

      {/* skills section */}
      <section>
        <p>
          <Prompt>
            <span className="text-text">ls</span>{" "}
            <span className="text-secondary">~</span>
            <span className="text-text-muted">/skills/</span>
          </Prompt>
        </p>
        <div className="mt-3 space-y-3 pl-4 border-l-2 border-border">
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

          {/* tools */}
          <div>
            <p className="text-text-muted text-xs select-none mb-1">
              ── tools ──
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-0.5">
              <span className="text-primary">
                <span className="text-text-muted select-none">[</span>Git<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-secondary">
                <span className="text-text-muted select-none">[</span>VSCode<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-success">
                <span className="text-text-muted select-none">[</span>Bash<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-quaternary">
                <span className="text-text-muted select-none">[</span>Copilot<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-text-bright">
                <span className="text-text-muted select-none">[</span>Claude Code<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-warning">
                <span className="text-text-muted select-none">[</span>Godot<span className="text-text-muted select-none">]</span>
              </span>
              <span className="text-tertiary">
                <span className="text-text-muted select-none">[</span>Unity<span className="text-text-muted select-none">]</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* blinking cursor prompt */}
      <p className="pt-4">
        <Prompt>
          <span className="inline-block w-3 h-5 bg-text align-middle animate-pulse" />
        </Prompt>
      </p>
    </main>
  );
}

export default Home;
