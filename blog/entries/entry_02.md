<!-- entry_02 -->
24-10-2026

# TITLE: Secure Boot Incident

After two years of using my laptop since I've had it, I started noticing that it started feeling bloated and sloppy. It wasn't slow; it's just that things were starting to feel unnecessarily messy. All the gaming and dev truly did a number on the machine. God, the fucking `Downloads` folder. It was bad, and I was lazy. I gave up trying to manually clean up my laptop and decided to have a fresh start instead. I moved the important stuff to a different drive, set up a FAT32 flash drive with the Windows 11 installer, and said good night.

The reinstall went off without a hitch. I was feeling confident; *"this wouldn't take more than a single morning"*. Moment of truth, I turned it on to boot and:

[Secure]{.danger} [Boot]{.danger} [Violation:]{.danger} [Invalid]{.danger} [Signature]{.danger} [Detected]{.danger}

*"What just happened?"*

The secure boot keys are **mismatched** or **invalid**. 

*"WHYYY???"*

Turns out I can just disable secure boot [temporarily]{.primary} to boot into Windows. 

*"Okay, fine."*

My secure boot option in the BIOS is **greyed** out but secure boot controls I can enable or disable; it toggles `Key Management`.

*"Hmm..."*

In key management, I saw that I can clear my keys, restoring it to factory default, putting me in setup mode. I can also restore factory keys.

*"Clearing my keys should disable secure boot."*

It worked. I was able to boot into Windows.

*"Why do I need secure boot anyways?"*

I proceeded to set my machine up. First the essentials: browser, Discord, Spotify, VS Code; then WSL2; and then configs, themes, file structures, tools, accounts, games...

*Some anti-cheat software require secure boot*

By this point, the time was around noon. I felt a slight unease, but I was [determined]{.success}.

*"Debugging secure boot can't be that bad."*

I then spent [hours]{.tertiary} and [hours]{.secondary} of debugging, restarting, verifying boot keys, more restarting, powershell, UEFI, bcdboot, more debugging, and fighting with LLMs,,, **BELIEVE ME, THAT I, WITH AN LLM, WENT ON A DAMN RIDE.** I was [desperate]{.danger}.

A bit of pain later, fast forward to the late night, I finally decided to do a simple google search; maybe the LLM is not doing it for me, maybe someone out there have already dealt with what I've been agonizing upon. Then, not even 10 minutes in, the answer revealed itself.

Apparently, the factory keys that I have are an older *"unpatched"* version. Over the years, Microsoft probably revoked or updated them, *2023 Secure Boot Certificate Authority (CA)*, and I have an ASUS TUF F15, a **2021** model. Basically, my motherboard keys are [outdated]{.primary}.

All I had to do was append the new keys to the motherboard. Either I append the new keys using the `SecureBootRecovery.efi` on a FAT32 flash drive, or I use a command in PowerShell that force-injects missing secure boot certificates directly into the NVRAM:

```powershell
Set-SecureBootUEFI -Name db -ContentFilePath C:\Windows\System32\SecureBootUpdates\production_db.bin -AppendWrite:$true
```

I tried both. One restart later, secure boot now finally works.

The lesson of the story is to maybe chill on the rabbit hole the LLMs take you to, or don't blame the LLM and just don't go bashing your head on a wall expecting things to change, and maybe just do a quick search first.

*P.S. Try a different wall. o7*