import Prompt from "../components/Prompt";

function About() {
  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">cat</span>{" "}
          <span className="text-text-muted">~/about.md</span>
        </Prompt>
      </p>
      <div className="mt-6 pl-4 border-l-2 border-border text-text-muted space-y-4 max-w-2xl">
        <p>
          <span className="text-primary">[WIP]</span> This page is under
          construction. Come back soon!
        </p>
        <p className="text-text-muted select-none">
          ─────────────────────────────
        </p>
        <p className="text-text">
          More details about my background, education, and experience will live
          here.
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

export default About;
