import { useState } from "react";
import Prompt from "../../components/Prompt";
import { notes } from "../../scripts/notes";

function Notes() {
  const [selected, setSelected] = useState<number | null>(null);

  if (selected !== null) {
    const note = notes[selected];
    return (
      <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
        <p>
          <Prompt>
            <span className="text-text">cat</span>{" "}
            <span className="text-secondary">~</span>
            <span className="text-text-muted">
              /secret-fun/notes/{note.slug}.md
            </span>
          </Prompt>
        </p>

        <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
          <p className="text-text-muted text-xs mb-2">
            <span className="text-primary">{note.title}</span>
            <span className="text-text-muted select-none"> · </span>
            <span className="text-quaternary">{note.author}</span>
            <span className="text-text-muted select-none"> · </span>
            <span className="text-tertiary">{note.date}</span>
          </p>
          <p className="text-text-muted select-none mb-4">
            ─────────────────────────────
          </p>
          <div className="text-text space-y-3 leading-relaxed whitespace-pre-wrap font-body">
            {note.content}
          </div>
          <p className="text-text-muted select-none mt-6">
            ─────────────────────────────
          </p>
          <button
            onClick={() => setSelected(null)}
            className="text-tertiary hover:text-primary transition-colors cursor-pointer mt-2 inline-block"
          >
            <span className="select-none">&lt;- </span>
            <span className="text-text-muted">cd</span> ..
          </button>
        </div>

        <p className="pt-8">
          <Prompt>
            <span className="inline-block w-3 h-5 bg-text align-middle animate-pulse" />
          </Prompt>
        </p>
      </main>
    );
  }

  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">ls</span>{" "}
          <span className="text-secondary">~</span>
          <span className="text-text-muted">/secret-fun/notes/</span>
        </Prompt>
      </p>
      <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
        <p className="text-text-muted text-xs select-none mb-4">
          <span className="text-primary">total</span>{" "}
          <span className="text-text">{notes.length}</span>
        </p>
        <div className="space-y-3">
          {notes.map((note, i) => (
            <button
              key={note.slug}
              onClick={() => setSelected(i)}
              className="block text-left w-full hover:bg-surface rounded px-2 py-1 -mx-2 transition-colors cursor-pointer"
            >
              <p>
                <span className="text-text-muted select-none">-rw-r--r-- </span>
                <span className="text-primary hover:text-quaternary transition-colors">
                  {note.slug}.md
                </span>
              </p>
              <p className="text-text-muted text-xs ml-4">
                <span className="text-quaternary">{note.author}</span>
                <span className="text-text-muted select-none"> · </span>
                <span className="text-tertiary">{note.date}</span>
              </p>
            </button>
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

export default Notes;
