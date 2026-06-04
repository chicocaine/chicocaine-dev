import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cycleTheme, getTheme } from "../scripts/themes";
import { cycleFont, getFont } from "../scripts/fonts";

const links = [
  { to: "/", label: "_hello" },
  { to: "/about", label: "_about" },
  { to: "/projects", label: "_projects" },
  { to: "/blog", label: "_blog" },
  { to: "/contact", label: "_contact" },
];

function Navbar() {
  const location = useLocation();
  const [theme, setTheme] = useState(getTheme().name);
  const [font, setFont] = useState(getFont().name);

  const handleCycleTheme = () => {
    const next = cycleTheme();
    setTheme(next.name);
  };

  const handleCycleFont = () => {
    const next = cycleFont();
    setFont(next.name);
  };

  return (
    <nav className="font-body bg-background border-b border-border flex items-center px-6 py-3 text-sm sticky top-0">
      <Link to="/" className="flex items-center">
        <span className="text-primary select-none">visitor</span>
        <span className="text-tertiary select-none">@</span>
        <span className="text-quaternary select-none">chicocaine.dev</span>
      </Link>

      <div className="flex gap-5 ml-8">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={
              location.pathname === to
                ? "text-primary transition-colors"
                : "text-text-muted hover:text-primary transition-colors"
            }
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-4">
        <button
          onClick={handleCycleTheme}
          className="text-text-muted hover:text-primary transition-colors cursor-pointer"
        >
          <span className="text-tertiary select-none">theme:</span>
          <span className="text-quaternary ml-1">{theme}</span>
        </button>
        <button
          onClick={handleCycleFont}
          className="text-text-muted hover:text-primary transition-colors cursor-pointer"
        >
          <span className="text-tertiary select-none">font:</span>
          <span className="text-quaternary ml-1">{font}</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
