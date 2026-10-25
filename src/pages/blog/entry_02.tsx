/*
 * entry_02.tsx — GENERATED FILE, DO NOT EDIT BY HAND.
 *
 * Source:  entries/entry_02.md
 * Command: make -C blog gen
 * Parser:  blog/blog-parser.c
 *
 * Edit the markdown and re-run `make -C blog gen`. Hand edits here
 * are overwritten. `make -C blog check` verifies this file is up to
 * date.
 */

import Prompt from "../../components/Prompt";
import { Link } from "react-router-dom";

export const meta = {
  id: "entry_02",
  title: "Secure Boot Incident",
  date: "24-10-2026",
  label: "entry_02.md",
} as const;

function Entry02() {
  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">cat</span>{" "}
          <span className="text-secondary">~</span>
          <span className="text-text-muted">/blog/entry_02.md</span>
        </Prompt>
      </p>

      <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
        <p className="text-text-muted text-xs mb-2">
          <span className="text-primary">entry_02</span>
          <span className="text-text-muted select-none"> · </span>
          <span className="text-quaternary">24-10-2026</span>
        </p>
        <p className="text-text-muted select-none mb-4">
          ─────────────────────────────
        </p>

        <p className="text-lg sm:text-xl text-text-bright mb-6">
          <span className="text-tertiary select-none"># </span>
          Secure Boot Incident
        </p>

        <div className="text-text space-y-4">
          <p>
            After two years of using my laptop since I've had it, I started
            noticing that it started feeling bloated and sloppy. It wasn't slow;
            it's just that things were starting to feel unnecessarily messy. All
            the gaming and dev truly did a number on the machine. God, the
            fucking{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`Downloads`}</code>{" "}
            folder. It was bad, and I was lazy. I gave up trying to manually
            clean up my laptop and decided to have a fresh start instead. I moved
            the important stuff to a different drive, set up a FAT32 flash drive
            with the Windows 11 installer, and said good night.
          </p>

          <p>
            The reinstall went off without a hitch. I was feeling confident;{" "}
            <span className="text-text-muted italic">&quot;this wouldn't take more than a single morning&quot;</span>
            . Moment of truth, I turned it on to boot and:
          </p>

          <p>
            <span className="text-danger font-bold">Secure</span>{" "}
            <span className="text-danger font-bold">Boot</span>{" "}
            <span className="text-danger font-bold">Violation:</span>{" "}
            <span className="text-danger font-bold">Invalid</span>{" "}
            <span className="text-danger font-bold">Signature</span>{" "}
            <span className="text-danger font-bold">Detected</span>
          </p>

          <p>
            
            <span className="text-text-muted italic">&quot;What just happened?&quot;</span>
          </p>

          <p>
            The secure boot keys are{" "}
            <span className="font-bold text-text-bright">mismatched</span> or{" "}
            <span className="font-bold text-text-bright">invalid</span>.
          </p>

          <p>
            <span className="text-text-muted italic">&quot;WHYYY???&quot;</span>
          </p>

          <p>
            Turns out I can just disable secure boot{" "}
            <span className="text-primary font-bold">temporarily</span> to boot
            into Windows.
          </p>

          <p>
            
            <span className="text-text-muted italic">&quot;Okay, fine.&quot;</span>
          </p>

          <p>
            My secure boot option in the BIOS is{" "}
            <span className="font-bold text-text-bright">greyed</span> out but
            secure boot controls I can enable or disable; it toggles{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`Key Management`}</code>
            .
          </p>

          <p>
            <span className="text-text-muted italic">&quot;Hmm...&quot;</span>
          </p>

          <p>
            In key management, I saw that I can clear my keys, restoring it to
            factory default, putting me in setup mode. I can also restore factory
            keys.
          </p>

          <p>
            
            <span className="text-text-muted italic">&quot;Clearing my keys should disable secure boot.&quot;</span>
          </p>

          <p>
            It worked. I was able to boot into Windows.
          </p>

          <p>
            
            <span className="text-text-muted italic">&quot;Why do I need secure boot anyways?&quot;</span>
          </p>

          <p>
            I proceeded to set my machine up. First the essentials: browser,
            Discord, Spotify, VS Code; then WSL2; and then configs, themes, file
            structures, tools, accounts, games...
          </p>

          <p>
            
            <span className="text-text-muted italic">Some anti-cheat software require secure boot</span>
          </p>

          <p>
            By this point, the time was around noon. I felt a slight unease, but
            I was <span className="text-success font-bold">determined</span>.
          </p>

          <p>
            
            <span className="text-text-muted italic">&quot;Debugging secure boot can't be that bad.&quot;</span>
          </p>

          <p>
            I then spent <span className="text-tertiary">hours</span> and{" "}
            <span className="text-secondary">hours</span> of debugging,
            restarting, verifying boot keys, more restarting, powershell, UEFI,
            bcdboot, more debugging, and fighting with LLMs,,,{" "}
            <span className="font-bold text-text-bright">BELIEVE ME, THAT I, WITH AN LLM, WENT ON A DAMN RIDE.</span>{" "}
            I was <span className="text-danger font-bold">desperate</span>.
          </p>

          <p>
            A bit of pain later, fast forward to the late night, I finally
            decided to do a simple google search; maybe the LLM is not doing it
            for me, maybe someone out there have already dealt with what I've
            been agonizing upon. Then, not even 10 minutes in, the answer
            revealed itself.
          </p>

          <p>
            Apparently, the factory keys that I have are an older{" "}
            <span className="text-text-muted italic">&quot;unpatched&quot;</span>{" "}
            version. Over the years, Microsoft probably revoked or updated them,{" "}
            <span className="text-text-muted italic">2023 Secure Boot Certificate Authority (CA)</span>
            , and I have an ASUS TUF F15, a{" "}
            <span className="font-bold text-text-bright">2021</span> model.
            Basically, my motherboard keys are{" "}
            <span className="text-primary font-bold">outdated</span>.
          </p>

          <p>
            All I had to do was append the new keys to the motherboard. Either I
            append the new keys using the{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`SecureBootRecovery.efi`}</code>{" "}
            on a FAT32 flash drive, or I use a command in PowerShell that
            force-injects missing secure boot certificates directly into the
            NVRAM:
          </p>

          <div className="border border-border rounded overflow-hidden">
            <p className="text-text-muted text-xs px-3 py-1 border-b border-border select-none">powershell</p>
            <pre className="bg-surface p-3 overflow-x-auto text-xs leading-relaxed" data-lang="powershell"><code>{`
Set-SecureBootUEFI -Name db -ContentFilePath C:\\Windows\\System32\\SecureBootUpdates\\production_db.bin -AppendWrite:$true
`}</code></pre>
          </div>

          <p>
            I tried both. One restart later, secure boot now finally works.
          </p>

          <p>
            The lesson of the story is to maybe chill on the rabbit hole the LLMs
            take you to, or don't blame the LLM and just don't go bashing your
            head on a wall expecting things to change, and maybe just do a quick
            search first.
          </p>

          <p className="text-text-muted text-xs italic pt-2">
            P.S. Try a different wall. o7
          </p>
        </div>

        <p className="text-text-muted select-none mt-6">
          ─────────────────────────────
        </p>

        <Link
          to="/blog"
          className="text-tertiary hover:text-primary transition-colors mt-2 inline-block"
        >
          <span className="select-none">&lt;- </span>
          <span className="text-text-muted">cd</span> ..
        </Link>
      </div>

      <p className="pt-8">
        <Prompt>
          <span className="inline-block w-3 h-5 bg-text align-middle animate-pulse" />
        </Prompt>
      </p>
    </main>
  );
}

export default Entry02;
