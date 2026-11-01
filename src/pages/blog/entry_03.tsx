/*
 * entry_03.tsx — GENERATED FILE, DO NOT EDIT BY HAND.
 *
 * Source:  entries/entry_03.md
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
  id: "entry_03",
  title: "The Dual Boot Experience",
  date: "01-11-2026",
  label: "entry_03.md",
} as const;

function Entry03() {
  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">cat</span>{" "}
          <span className="text-secondary">~</span>
          <span className="text-text-muted">/blog/entry_03.md</span>
        </Prompt>
      </p>

      <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
        <p className="text-text-muted text-xs mb-2">
          <span className="text-primary">entry_03</span>
          <span className="text-text-muted select-none"> · </span>
          <span className="text-quaternary">01-11-2026</span>
        </p>
        <p className="text-text-muted select-none mb-4">
          ─────────────────────────────
        </p>

        <p className="text-lg sm:text-xl text-text-bright mb-6">
          <span className="text-tertiary select-none"># </span>
          The Dual Boot Experience
        </p>

        <div className="text-text space-y-4">
          <p>
            The stars finally aligned, and now I get to try my hand at
            dual-booting.
          </p>

          <p>
            The pick was{" "}
            <span className="text-primary font-bold">Arch Linux</span>. Why?
            Because I like the philosophy behind it: minimalist, pragmatic,
            modernity, versatile, do-it-yourself; It's not the ideal choice for
            beginners such as myself, but I also wanted to get hands on with the
            linux experience. Plus, I already have some WSL2 Ubuntu experience
            with dev work.
          </p>

          <p>
            The first step is prepping the install. This meant two things: the
            Arch Linux ISO installer and the drive partitioning. Prepping the
            flash drive should be simple and easy, I already had some experience.
            I, for one, did not know that partitioning my drives was not as
            straight forward as I thought it would be.
          </p>

          <p>
            I have two <span className="text-text-muted italic">500 GB</span>{" "}
            SSDs.{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`C:`}</code>{" "}
            had my Windows OS along with my WSL2. The other,{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`D:`}</code>{" "}
            was mainly for <span className="text-secondary">games</span>. First I
            had to <span className="text-text-muted italic">shrink</span> my{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`D:`}</code>{" "}
            drive. The goal was to do about 150 GB of allocated space, that's
            around{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`153600 MB`}</code>
            . I had about 189 GB of free space, but{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`diskmgmt.msc`}</code>{" "}
            of Windows does not allow me to shrink my drive more than{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`86627 MB`}</code>
            . Odd, I tried uninstalling more games to see if I can luckily remove
            the unmovable files, extending the shrinkable end portion. That
            didn't work. I even considered formatting my game drive but
            ultimately decided that it was not worth the trouble.
          </p>

          <p>
            Given the available 84.6 GB of shrinkable space, I decided to go with
            80 GB, just for testing and ricing around. This meant around a{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`81920 MB`}</code>{" "}
            shrink that Windows gladly gave me.
          </p>

          <p>
            Next, was to plan the two Arch partitions:
          </p>

          <ol className="space-y-1">
            <li className="pl-6 -indent-6"><span className="text-tertiary select-none">1. </span>
            <code className="bg-surface rounded px-1 text-text-bright">{`EFI`}</code>{" "}
            System Partition [1GB || FAT32]: for the boot files</li>
            <li className="pl-6 -indent-6"><span className="text-tertiary select-none">2. </span>
            <code className="bg-surface rounded px-1 text-text-bright">{`/`}</code>{" "}
            Root [79GB || ext4]: for the actual Arch Linux OS and files</li>
          </ol>

          <p>
            Now it was go time, I installed and configured{" "}
            <span className="font-bold text-text-bright">Rufus</span> to write
            the Arch ISO into the FAT32 flash drive. Then once that was
            completed, I disabled secure boot by resetting the keys to factory,
            booted into the UEFI flash disk, and selected the Arch Linux
            installer environment. After that, I connected to the internet using
            WiFi.
          </p>

          <p>
            Then, it was time to actually make the partitions using{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`cfdisk`}</code>{" "}
            at the current{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`root@archiso`}</code>
            . This was more manual than I thought it would be. I was confused at
            first, with all the unallocated partitions, mounting and partition
            names, but eventually, the conventions and the interface started to
            click.
          </p>

          <p>
            Simply, I entered 1G for the first partition and set the type to{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`EFI System`}</code>{" "}
            and used the remaining 79G for{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`Linux filesystem`}</code>
            . This returned two new partitions,{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`/dev/nvme1n1p3`}</code>{" "}
            and{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`/dev/nvme1n1p4`}</code>
            . After was formatting the new partitions with{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`mkfs`}</code>
            , the first partition being FAT32, and the second as ext4. Then I
            mounted{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`/dev/nvme1n1p4`}</code>{" "}
            to{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`mnt/`}</code>
            , and{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`/dev/nvme1n1p3`}</code>{" "}
            to{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`mnt/boot/`}</code>
            .
          </p>

          <p>
            Then next was checking the CPU and mounts.
          </p>

          <blockquote className="border-l-2 border-border pl-4 text-text-muted">
            <p>
              Apparently there are different microcodes for both Intel and AMD
              CPUs,,, I don't know what that means
            </p>
          </blockquote>

          <p>
            Then was using{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`pacstrap`}</code>{" "}
            to install base linux and packages like{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`sudo`}</code>
            , network manager,{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`nano`}</code>
            ,{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`sbctl`}</code>{" "}
            for secure boot, etc., etc. After that was generating the filesystem
            configuration using{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`fstab`}</code>
            . The{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`fstab`}</code>{" "}
            file apparently tells Arch which filesystems to mount automatically
            when the OS boots.
          </p>

          <p>
            Then finally, it was setting up Arch itself: The networking,
            timezone, language, hostname, root password, and the bootloader using{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`bootctl`}</code>
            . Then boom, we have a working base Arch Linux OS.
          </p>

          <p>
            Oh, I almost forgot, there's still the secure boot. Remember when I
            said that I had to reset the keys to disable secure boot? Apparently,
            after one Google search about my BIOS model, all I had to do was
            disable{" "}
            <code className="bg-surface rounded px-1 text-text-bright">{`Secure Boot Control`}</code>{" "}
            to disable secure boot,{" "}
            <span className="text-danger font-bold">OBVIOUSLY</span>. So at this
            point, not only can't I enter Arch Linux with secure boot, I also
            can't enter secure boot on Windows, **BECAUSE I RESET IT*.
          </p>

          <p>
            So, I then proceeded to re-append my Windows keys, along with the
            Arch Linux keys.
          </p>

          <p className="text-text-muted text-xs italic pt-2">
            P.S. Just google it first... o7
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

export default Entry03;
