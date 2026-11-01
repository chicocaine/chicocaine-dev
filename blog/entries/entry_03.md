<!-- entry_03 -->
01-11-2026

# TITLE: The Dual Boot Experience

The stars finally aligned, and now I get to try my hand at dual-booting.

The pick was [Arch Linux]{.primary}. Why? Because I like the philosophy behind it: minimalist, pragmatic, modernity, versatile, do-it-yourself; It's not the ideal choice for beginners such as myself, but I also wanted to get hands on with the linux experience. Plus, I already have some WSL2 Ubuntu experience with dev work.

The first step is prepping the install. This meant two things: the Arch Linux ISO installer and the drive partitioning. Prepping the flash drive should be simple and easy, I already had some experience. I, for one, did not know that partitioning my drives was not as straight forward as I thought it would be.

I have two *500 GB* SSDs. `C:` had my Windows OS along with my WSL2. The other, `D:` was mainly for [games]{.secondary}. First I had to *shrink* my `D:` drive. The goal was to do about 150 GB of allocated space, that's around `153600 MB`. I had about 189 GB of free space, but `diskmgmt.msc` of Windows does not allow me to shrink my drive more than `86627 MB`. Odd, I tried uninstalling more games to see if I can luckily remove the unmovable files, extending the shrinkable end portion. That didn't work. I even considered formatting my game drive but ultimately decided that it was not worth the trouble.

Given the available 84.6 GB of shrinkable space, I decided to go with 80 GB, just for testing and ricing around. This meant around a `81920 MB` shrink that Windows gladly gave me.

Next, was to plan the two Arch partitions:

1. `EFI` System Partition \[1GB || FAT32\]: for the boot files
2. `/` Root \[79GB || ext4\]: for the actual Arch Linux OS and files

Now it was go time, I installed and configured **Rufus** to write the Arch ISO into the FAT32 flash drive. Then once that was completed, I disabled secure boot by resetting the keys to factory, booted into the UEFI flash disk, and selected the Arch Linux installer environment. After that, I connected to the internet using WiFi.

Then, it was time to actually make the partitions using `cfdisk` at the current `root@archiso`. This was more manual than I thought it would be. I was confused at first, with all the unallocated partitions, mounting and partition names, but eventually, the conventions and the interface started to click. 

Simply, I entered 1G for the first partition and set the type to `EFI System` and used the remaining 79G for `Linux filesystem`. This returned two new partitions, `/dev/nvme1n1p3` and `/dev/nvme1n1p4`. After was formatting the new partitions with `mkfs`, the first partition being FAT32, and the second as ext4. Then I mounted `/dev/nvme1n1p4` to `mnt/`, and `/dev/nvme1n1p3` to `mnt/boot/`.

Then next was checking the CPU and mounts. 

> Apparently there are different microcodes for both Intel and AMD CPUs,,, I don't know what that means

Then was using `pacstrap` to install base linux and packages like `sudo`, network manager, `nano`, `sbctl` for secure boot, etc., etc. After that was generating the filesystem configuration using `fstab`. The `fstab` file apparently tells Arch which filesystems to mount automatically when the OS boots.

Then finally, it was setting up Arch itself: The networking, timezone, language, hostname, root password, and the bootloader using `bootctl`. Then boom, we have a working base Arch Linux OS.

Oh, I almost forgot, there's still the secure boot. Remember when I said that I had to reset the keys to disable secure boot? Apparently, after one Google search about my BIOS model, all I had to do was disable `Secure Boot Control` to disable secure boot, [OBVIOUSLY]{.danger}. So at this point, not only can't I enter Arch Linux with secure boot, I also can't enter secure boot on Windows, **BECAUSE I RESET IT*.

So, I then proceeded to re-append my Windows keys, along with the Arch Linux keys.

*P.S. Just google it first... o7*