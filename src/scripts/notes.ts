export interface Note {
  slug: string;
  title: string;
  author: string;
  date: string;
  content: string;
}

export const notes: Note[] = [
    {
    slug: "my-simple-not-so-secret-note",
    title: "my simple not so secret note",
    author: "chicocaine",
    date: "2026-06-05 14:32 UTC+8",
    content: `# My Secrets
    
I am bad at taking notes and also I have a girlfriend.
`,
  },
  {
    slug: "why-zsh-over-bash",
    title: "why zsh over bash",
    author: "chicocaine",
    date: "2026-06-03 09:17 UTC+8",
    content: `# why zsh over bash

I switched to zsh two years ago and haven't looked back. Here's why.

## Autosuggestions

zsh-autosuggestions remembers your history and ghosts in the rest
of the command. Press right arrow to accept. It's like copilot
for your terminal, except it actually works offline.

## Syntax highlighting

zsh-syntax-highlighting colors your command as you type. Valid
commands in green, invalid in red, paths in another color. You
catch typos before you even press enter.

## Better globbing

Bash: \`ls *.txt\` — fine for basic cases.
Zsh: \`ls **/*.txt\` — recursive globbing built-in, no \`find\` needed.
\`ls *(.)\` — only regular files. \`ls *(/)\` — only directories.
It's like having a query language for your filesystem.

## The prompt

Oh-my-zsh or starship make it trivial to have a prompt that shows
git status, node version, python venv, and more. You always know
where you are and what you're running.

## The cost

Startup time. zsh with plugins can be slower to launch than bash.
I keep a vanilla bash profile around for quick one-off commands.

Also, some scripts assume /bin/bash. That's fine — just don't
write zsh-only syntax in scripts you share.`,
  },
  {
    slug: "git-commits-that-dont-suck",
    title: "git commits that don't suck",
    author: "chicocaine",
    date: "2026-05-28 22:45 UTC+8",
    content: `# git commits that don't suck

After reading too many commit messages like "fix stuff some bug" and
"update", I wrote down some rules for myself.

## The format

\`\`\`
<type>(<scope>): <short description>

[optional body with what and why]
\`\`\`

Types: feat, fix, refactor, chore, docs, test, perf

## Examples

Good:
\`\`\`
fix(auth): handle expired JWT tokens gracefully
\`\`\`

Bad:
\`\`\`
fix bug
\`\`\`

Good:
\`\`\`
feat(search): add fuzzy matching to project filter
\`\`\`

Bad:
\`\`\`
update search
\`\`\`

## The golden rule

A commit message should answer: "If I apply this commit, what
will happen?" — not "What did I do?" because six months from now,
you won't remember what you were thinking.

## Atomic commits

One logical change per commit. Not "added feature X and fixed
typo and reformatted file." Three separate commits. Yes, it
takes discipline. Yes, git bisect will thank you later.

That's the note. Commit early, commit often, write good messages.`,
  },
  {
    slug: "wsl2-Workflow-Wisdom",
    title: "WSL2 Workflow Wisdom",
    author: "chicocaine",
    date: "2026-05-20 16:10 UTC+8",
    content: `# WSL2 Workflow Wisdom

Running Linux on Windows. It's better than you think.

## The setup

WSL2 with Ubuntu.
Windows Terminal as the frontend. VSCode with the Remote-WSL
extension. Files live in the Linux filesystem, not /mnt/c.

## Why not /mnt/c

Cross-filesystem I/O is painfully slow. Node modules on /mnt/c
will make \`npm install\` take minutes instead of seconds.

Keep everything in \`~/projects\` on the ext4 side. Access it
via \`\\\\\\\\wsl$\\\` in Windows Explorer if you really need to.

## GPU passthrough

CUDA works in WSL2 now. PyTorch, TensorFlow, all of it.
No dual-boot needed for ML work.

## The verdict

It's not a VM replacement. It's not bare metal. But for web dev,
ML prototyping, and general Linux-ing on a Windows laptop, it's
the best of both worlds. Just don't put your files on /mnt/c.`,
  },
  {
    slug: "claude-code-pro-tips",
    title: "claude code pro tips",
    author: "chicocaine",
    date: "2026-06-05 11:03 UTC+8",
    content: `# claude code pro tips

Things I've learned from using Claude Code daily.

## Context is everything

The more context you give, the better the output. Paste in
your schema types. Mention file paths. Explain the WHY, not
just the WHAT.

Bad: "fix the login"
Good: "fix the login form — the JWT refresh isn't triggering
on 401 responses, check src/api/client.ts around line 40"

## Iterate don't dictate

Let Claude explore the codebase first. Ask "how would you
approach this?" before "write the code." You'll catch design
issues before they become PR comments.

## Use /memory and CLAUDE.md

CLAUDE.md is project context that gets loaded every session.
Put your project conventions, important paths, and gotchas
there. Saves you from repeating yourself.

## Skills and slash commands

/theme, /font — build custom slash commands for your workflow.
It's like aliases but for AI-assisted workflows.

## The sweet spot

Claude Code shines for:
- Refactoring across multiple files
- Writing tests and documentation
- Debugging with stack traces
- Boilerplate generation
- Explaining unfamiliar code

It's less good for:
- Novel algorithm design from scratch
- Tasks requiring very specific domain knowledge
- Anything where the correct answer is "don't do this"

Keep a human in the loop. Review every diff. Trust but verify.`,
  },
];
