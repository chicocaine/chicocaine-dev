import { useState } from "react";
import Prompt from "../components/Prompt";

const STORAGE_KEY = "contact-form-draft";

function loadDraft() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupt or unavailable */ }
  return { name: "", email: "", message: "" };
}

function saveDraft(name: string, email: string, message: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ name, email, message }));
  } catch { /* quota exceeded or unavailable */ }
}

function clearDraft() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch { /* unavailable */ }
}

function Contact() {
  const draft = loadDraft();
  const [name, setName] = useState(draft.name);
  const [email, setEmail] = useState(draft.email);
  const [message, setMessage] = useState(draft.message);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorText("");

    try {
      const formData = new FormData();
      formData.append("access_key", "04bca680-f8a4-4563-bf18-c57ae6133f5f");
      formData.append("name", name);
      formData.append("email", email);
      formData.append("message", message);

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
        clearDraft();
      } else {
        setStatus("error");
        setErrorText(data.message ?? "Something went wrong. Try again later.");
      }
    } catch {
      setStatus("error");
      setErrorText("Network error. Please check your connection and try again.");
    }
  };

  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">cat</span>{" "}
          <span className="text-text-muted">~/contact.md</span>
        </Prompt>
      </p>

      <div className="mt-4 pl-4 border-l-2 border-border space-y-5 max-w-2xl">
        <p>
          <span className="text-text-bright">Get in touch</span>
          <span className="text-text-muted"> — I usually respond within a day.</span>
        </p>

        <p className="text-text-muted select-none">
          ─────────────────────────────
        </p>

        {status === "success" ? (
          <div className="space-y-3">
            <p>
              <span className="text-success">[✓]</span>{" "}
              <span className="text-text">Message sent successfully.</span>
            </p>
            <p className="text-text-muted">
              Thanks for reaching out! I'll get back to you soon.
            </p>
            <p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="text-primary hover:text-secondary transition-colors cursor-pointer"
              >
                &gt; send another?
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* name */}
            <div>
              <label className="block">
                <span className="text-primary select-none">name</span>
                <span className="text-text-muted select-none">:</span>{" "}
              </label>
              <input
                type="text"
                name="name"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  saveDraft(e.target.value, email, message);
                }}
                disabled={status === "submitting"}
                className="w-full bg-transparent border-0 border-b border-border
                           text-text placeholder:text-text-muted/50
                           pb-1 pt-0.5 focus:border-primary focus:outline-none
                           transition-colors disabled:opacity-50"
                placeholder="Your name"
              />
            </div>

            {/* email */}
            <div>
              <label className="block">
                <span className="text-primary select-none">email</span>
                <span className="text-text-muted select-none">:</span>{" "}
              </label>
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  saveDraft(name, e.target.value, message);
                }}
                disabled={status === "submitting"}
                className="w-full bg-transparent border-0 border-b border-border
                           text-text placeholder:text-text-muted/50
                           pb-1 pt-0.5 focus:border-primary focus:outline-none
                           transition-colors disabled:opacity-50"
                placeholder="you@example.com"
              />
            </div>

            {/* message */}
            <div>
              <label className="block">
                <span className="text-primary select-none">message</span>
                <span className="text-text-muted select-none">:</span>{" "}
              </label>
              <textarea
                name="message"
                required
                rows={5}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  saveDraft(name, email, e.target.value);
                }}
                disabled={status === "submitting"}
                className="w-full bg-transparent border border-border
                           text-text placeholder:text-text-muted/50
                           p-2 mt-0.5 focus:border-primary focus:outline-none
                           transition-colors resize-none disabled:opacity-50"
                placeholder="What's on your mind?"
              />
            </div>

            {/* error */}
            {status === "error" && (
              <p>
                <span className="text-danger">[✗]</span>{" "}
                <span className="text-text-muted">{errorText}</span>
              </p>
            )}

            {/* submit */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="text-primary hover:text-secondary transition-colors
                           cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="select-none">&gt; </span>
                {status === "submitting" ? "sending..." : "send"}
              </button>
              <span className="text-text-muted text-xs select-none">
                ── via web3forms
              </span>
            </div>
          </form>
        )}

        {/* alternative channels */}
        <p className="text-text-muted select-none">
          ─────────────────────────────
        </p>

        <p className="text-text-muted">
          <span className="text-tertiary select-none">## </span>
          <span className="text-primary">Other Channels</span>
        </p>

        <div className="space-y-1">
          <p>
            <span className="text-text-muted select-none">[</span>
            <a
              href="mailto:hi@chicocaine.dev"
              className="text-primary hover:text-text-bright transition-colors"
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
              href="https://www.linkedin.com/in/chicocaine/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-text-bright transition-colors"
            >
              LinkedIn
            </a>
            <span className="text-text-muted select-none">]</span>
            <span className="text-text-muted ml-2 select-none">──</span>
            <span className="text-text ml-2">linkedin.com/in/chicocaine</span>
          </p>
          <p>
            <span className="text-text-muted select-none">[</span>
            <a
              href="https://discordapp.com/users/chicocaine"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-text-bright transition-colors"
            >
              Discord
            </a>
            <span className="text-text-muted select-none">]</span>
            <span className="text-text-muted ml-2 select-none">──</span>
            <span className="text-text ml-2">@chicocaine</span>
          </p>
          <p>
            <span className="text-text-muted select-none">[</span>
            <a
              href="https://x.com/_chicocaine"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-text-bright transition-colors"
            >
              Twitter
            </a>
            <span className="text-text-muted select-none">]</span>
            <span className="text-text-muted ml-2 select-none">──</span>
            <span className="text-text ml-2">@_chicocaine</span>
          </p>
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

export default Contact;
