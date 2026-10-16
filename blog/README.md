# blog/ — markdown → TSX

Entries live in `entries/` as markdown. `blog-parser.c` turns each one into a
ready-to-import React component under `src/pages/blog/`, plus an `index.ts`
manifest the blog listing reads.

The generated files are **committed**, so building or deploying the site never
needs a C compiler — only writing an entry does.

```
blog/
  blog-parser.c        the generator (C99, no dependencies)
  Makefile             gen / check / asan
  entries/             the source of truth; entry_NN.md
    fixtures/          parser test inputs, never built into the site
  expected/            committed golden output for each fixture
  scripts/             fixture checks
```

## Build and run

```sh
make            # build the parser and regenerate every entry
make check      # determinism + drift + fixtures + typecheck
make asan       # rebuild with ASan/UBSan and run everything through it
make goldens    # regenerate expected/ after an intentional parser change
make clean
```

Or drive it directly:

```sh
./parser [options] <entry.md>
```

| Flag | Meaning |
| --- | --- |
| `--outdir <dir>` | Output directory. Defaults to `<repo>/src/pages/blog`. |
| `--manifest` | Write `index.ts` from all given entries instead of components. |
| `--stdout` | Print instead of writing a file. |
| `--date <DD-MM-YYYY>` | Override the entry's date. |
| `--root <dir>` | Override project-root autodetection. |
| `--wrap <n>` | Wrap column; `0` disables. Default 81. |
| `--no-footnote-heuristic` | Render a trailing italic `P.S.` as a normal paragraph. |
| `--quiet` | No progress line. |

`--outdir` defaults to `<repo>/src/pages/blog`, found from the binary's own
location via `/proc/self/exe` (falling back to walking up from the working
directory for `package.json`, so it also works off Linux).

## Writing an entry

`entries/entry_01.md`:

```markdown
<!-- entry_01 -->
10-10-2026

# TITLE: The Cost of Efficiency

Body text here.
```

- **Line 1** is the entry id. It is the entry's whole identity: the output file
  (`entry_01.tsx`), the route (`/blog/entry_01`), and the listing label
  (`entry_01.md`). It must be `entry_` followed by digits. Missing or malformed
  is a hard error — the parser will not guess from the filename.
- **Line 2** is the date, `DD-MM-YYYY`. It is validated through `mktime`, so
  `31-02-2026` is rejected rather than silently accepted.
- **`# TITLE:`** is the display title. It is *not* part of the identity, so
  retitling an entry never moves its URL.
- Other `KEY: value` lines are warned about and skipped, so a new key can be
  added later without breaking the parser.

Then:

```sh
make gen
```

That writes `src/pages/blog/entry_01.tsx` and refreshes
`src/pages/blog/index.ts`. Adding a post touches **no** other file — `Blog.tsx`
reads the manifest and `App.tsx` has one `/blog/:slug` route, so neither needs
editing per post.

## Markdown supported

| Syntax | Renders as |
| --- | --- |
| `**bold**` | `<span className="font-bold text-text-bright">` |
| `*italic*` | `<span className="text-text-muted italic">` |
| `` `code` `` | `<code className="bg-surface rounded px-1 text-text-bright">` |
| `[text](url)` | `<a>`, with an optional `"title"` and `<angle destinations>` |
| `![alt](src)` | `<img>` |
| `[word]{.danger}` | semantic span — see below |
| `# …` … `###### …` | headings |
| `- ` / `1. ` | lists, nested by indentation |
| `> ` | blockquote |
| ` ``` ` | fenced code with an optional language |
| `---` / `***` / `___` | horizontal rule |

### Semantic emphasis

Markdown cannot say *why* a word is emphasised, and the site colours bold words
by meaning. So the colour is written explicitly, using Pandoc-style attribute
spans:

```markdown
I felt entirely [useless]{.danger}.
For a beginner it was [empowering]{.success}.
It was just more [efficient]{.primary} that way.
```

| Class | Tailwind |
| --- | --- |
| `danger` | `text-danger font-bold` |
| `success` | `text-success font-bold` |
| `primary` | `text-primary font-bold` |
| `muted` | `text-text-muted` |
| `muted-bold` | `text-text-muted font-bold` |
| `tertiary` / `quaternary` / `secondary` | the matching text colour |
| `bright` | `text-text-bright font-bold` |

An unknown class name is left as literal text rather than being dropped, so a
typo is visible in the output instead of silently swallowing the span.

Plain `**bold**` renders neutral (`text-text-bright`) on purpose: it asserts no
emotion, so an un-annotated span reads as emphasis rather than as a wrong claim
about how the author feels.

### The P.S. footnote

A paragraph that is (a) the last block in the entry and (b) entirely one italic
run starting with `P.S.` or `Postscript` renders as the muted footnote line:

```markdown
*P.S. I am no pro. Just a guy learning about stuff.*
```

→ `<p className="text-text-muted text-xs italic pt-2">` with the `<em>`
dissolved. `--no-footnote-heuristic` turns this off if you ever want a literal
italic P.S.

## What the output looks like

The chrome — the `cat` prompt, the `entry_01 · 10-10-2026` meta row, the
dividers, the `# title` line, the trailing `<- cd ..` link and the blinking
cursor — is reproduced from the page this tool replaced. Per block:

- **Paragraphs** get no class; the `text-text space-y-4` wrapper owns spacing.
- **Headings** get no margins either, for the same reason.
- **Code blocks** are a bordered cell with a language header strip, and the code
  body sits at column 0 inside a template literal.

### Why `{" "}` appears in the output

JSX strips the leading whitespace of every line and drops a line break that sits
next to a tag. So a space in the source only survives a wrap if it is written
explicitly as `{" "}`. The emitter tracks whether a break lands next to a tag and
emits the marker only when it is needed. This is what lets the generator wrap
lines without ever gaining or losing a space — the space you see rendered is
exactly the space that was in the markdown.

Wrapping is **cosmetic**. `WRAP_COLUMNS` (81) is tuned to look like the
hand-written page, `--wrap 0` disables it, and the checks compare generated
output to generated output, so changing it is never a correctness change.

## Verification

```sh
make check
```

- **`check-stable`** runs the parser twice and compares. Catches a timestamp or
  any address-dependent ordering. This is what makes committing generated files
  safe.
- **`check-drift`** regenerates into a scratch directory and compares against
  what is committed. Catches the two failures that actually happen: a hand edit
  to a generated file (silently lost on the next `gen`), and a parser change
  whose regenerated output was never committed.
- **`check-fixtures`** compares each `entries/fixtures/*.md` against its golden
  in `expected/`, checks that malformed entries are rejected with a message, and
  runs hostile input (BOM, CRLF, 10 000-character delimiter runs, 2 000-deep
  nesting, an unclosed fence) to prove it exits rather than crashing.
- **`check-tsx`** typechecks the generated output. An unescaped `<` or an
  unbalanced element is invisible to a text diff but fails the compiler.

Run `make asan` before trusting the parser on a new entry. The inline scanner is
hand-rolled pointer arithmetic, and the sanitizers turn a latent overrun into a
test failure instead of a corrupted page.

## Gotchas

- **Run `make gen` after changing the parser.** `check-drift` compares committed
  output against freshly generated output, so a parser change that was not
  regenerated fails the check. That is the check working, not a false alarm.
- **Images need site-root paths.** `![x](foo.png)` is emitted verbatim, and Vite
  does not resolve relative assets in `.tsx`, so it will 404. Put the file in
  `public/` and write `![x](/blog/foo.png)`.
- **No syntax highlighting.** The language is carried as `data-lang` and shown
  in the header strip, but nothing colours the code.
- **Not supported**, and left as literal text rather than mis-rendered:
  reference links `[x][y]`, autolinks `<https://…>`, raw HTML, setext headings,
  tables, footnotes, strikethrough, hard line breaks, and indented code blocks.
  An indented fence is treated as a paragraph.
- **A single newline inside a paragraph is a space.** That is CommonMark
  behaviour; use a blank line between paragraphs.
- **Unsafe URL schemes are neutralised.** `[x](javascript:…)` becomes `#`. The
  entries are the author's own today, but a markdown file from anywhere else
  would otherwise be an XSS in a page with no other injection surface.
- **Titles should stay ASCII** — the title is shown in the `cat` prompt line.
  Filenames and routes are unaffected, since they come from the entry id.
- **Unknown metadata keys warn** on every run. That is deliberate noise; remove
  the key or the parser will keep mentioning it.

## Adding a fixture

1. Write `entries/fixtures/<name>.md` with a normal entry header.
2. `make goldens`
3. Read `expected/<name>.tsx` and confirm it is what you meant.
4. `make check`

`entries/fixtures/` is excluded from the build automatically — the Makefile
globs `entries/*.md`, which does not recurse — and lives outside `src/`, so
`tsc` never sees the goldens.
