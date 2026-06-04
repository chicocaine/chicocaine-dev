import Prompt from "../components/Prompt";

function Contact() {
  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">cat</span>{" "}
          <span className="text-text-muted">~/contact.md</span>
        </Prompt>
      </p>
      <div className="mt-6 pl-4 border-l-2 border-border text-text-muted space-y-4 max-w-2xl">
        <p>
          <span className="text-primary">[WIP]</span> Contact form coming soon.
        </p>
        <p className="text-text-muted select-none">
          ─────────────────────────────
        </p>
        <p className="text-text">
          In the meantime, reach me at{" "}
          <a
            href="mailto:hi@chicocaine.dev"
            className="text-primary hover:text-secondary transition-colors"
          >
            hi@chicocaine.dev
          </a>
        </p>
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
