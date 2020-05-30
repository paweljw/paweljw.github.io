---
date: "2020-05-30T00:00:00+02:00"
title: "Homeserver Upgrade, Part 0: The Plan"
coverImage: /media/server.jpg
tags:
  - home-server
  - ubuntu
comments: true
draft: false
twitterTitle: "Homeserver Upgrade: The Plan"
---

Around September last year the fourth memory card in a row failed in the Raspberry Pi 3 that powered my home setup. I canvassed the house for parts, threw together a Frankenstein-style monstrosity, built what became [Jarvis](https://github.com/paweljw/jarvis) on it and called it a day. Since then the use case expanded - so it's time for an upgrade.

<!--more-->

_Be advised that this isn't a tutorial (yet), it's mostly a brain dump. If you're looking for a tutorial on how to run a server with ZFS RAIDZ on Ubuntu, that'll hopefully come in a few weeks._

Let's start out with what I like best: a hardware rundown. The current setup is as follows:

* Motherboard: MSI A55M-E33
* Processor: AMD Athlon X4 II
* RAM: 2x HyperX 8GB 1333 MHz module (16GB total)
* GPU: Nvidia GTX 960 (potentially unstable VRAM)
* OS drive: Random 256 GB SSD (replaced from a random 128GB that liked to go read-only)
* Storage: 2x 500 GB HDD (S.M.A.R.T. errors, overheated), 1TB HDD (severely overheated)

## [The Memory Remains](https://www.youtube.com/watch?v=RDN4awrpPQQ)

The motherboard, processor, RAM and GPU are the remains of my previous gaming PC. I kept it around less for spares, and more with the intent of giving it away - it was still a very respectable machine for office work and some older/esports titles - but with no takers, I decided to utilize it as a "free" hardware platform for this server. I'm a little confused about the GPU's instability (I don't remember it having issues when gaming) - I'd put it down to either low voltage on the PCI with multiple HDDs present or driver issues.

First OS drive in this system I found in a drawer. It's now the reason that I mark storage I know to be either faulty or "will work but is iffy" - I completely forgot that it was unreliable. You might wonder why I keep stuff like that around - it's good for short-term spares, recovering from unfortunately timed breakdowns (just to tide a setup over until proper replacement can be sourced) and the like. Anyway, I replaced it with a cheap generic SSD from a reputable retailer within about two weeks.

As for the HDDs... well, I used what I had lying around, which at the time was a bunch of drives from an old server. These ran constantly for good six or seven years, and thanks to someone not putting any cooling fans in the front of their tower-style case, ran at 100C+ most of that time. They are also mismatched in capacity. I threw them into a RAID5 array to have _some_ hope of recovering from a drive failure, but there's a reason I'm backing the important stuff off of this array off-site. The RAID of course comes with it's own drawbacks, and 1TB of effective storage for a household of two in 2020 feels cramped.

## The Laundry List of Wishes

Since I'm going to actually be spending a decent chunk of money this time around, I want to make sure I'm building something that will last for a few years at least. This means:

* I want a rackable chassis. I will definitely invest into a rack-mounted switch and routing hardware further down the line, since the consumer-grade stuff I'm using for network control is wheezing already.
* Hot-swap capable motherboard and drive bays. Over the course of enough years I'll definitely run some drives down and I want low-hassle replacements on them.
* Capability for at least four storage drives, ideally more.
* Hardware RAID controller for OS drives, because:
  * Software RAID would tax the processor. I will be taxing it myself, thanks.
  * OS drive RAID is a must-have - in the current setup if it croaks, it's stop the press until I reimage a new one from backup.
  * Hot-swappable OS drive mirror capability - again, low-hassle.
* _Decently_ multicore processor. I need this machine to run a bunch of Docker containers, the occasional KVM for testing, some video encoding and various other fun stuff - all at once. Single-core speed isn't a priority since most modern cores deliver enough oomph for my purposes.

## The Lucky Find

While I knew I would have to spend a coin or two this time around - on account of having literally none of the hardware I wanted - I was hoping to find a good deal on some used hardware that would do what I need it to.

And I did! About a week ago I got lost on the internet and found this beauty up for sale:

{{< figure src="/media/server-0-comeup.jpg" link="/media/server-0-comeup.jpg" >}}

It's a lovely Supermicro CSE-825 chassis with a matching X8STi-F motherboard. Even better, it has the _works_: a working SAS/SATA compatible 8x backplane, a 3ware hardware RAID controller, 12GB RAM and all the HDD caddies intact in the cages.

And it was posted for sale at ~85€.

Given that the chassis _itself_ can command upwards of 100€, I was somewhat skeptical that this is legit. But I decided to take the plunge. At worst, I'd have a rackable chassis for what in the glamorous world of used enterprise hardware could be considered cheap.

Somewhat to my surprise, it arrived quickly and aside from a few bends in the drive frames (taken care of with a pair of needlenose pliers and a modicum of elbow grease), exactly as described. Here it is, chilling on my kitchen table, open for initial inspection shortly after delivery:

{{< figure src="/media/server-0-chillin.jpg" link="/media/server-0-chillin.jpg" >}}

## The Hiccup(s)

Here's the thing: this machine is loud. If you've never heard a server cooler array at full blast, think lawnmower through an open window. That's of course not entirely accurate, but in a mostly-silent apartment it's _loud_.

Given how the apartment we rent is laid out, a dedicated machine room is out of the question. This means that the server will probably live in the kitchen, which is not ideal. Both for the server, and us - since it'll be in an environment that's sometimes inordinately humid, and it will still probably be audible at full blast. This is an issue easiest solved by moving apartments, though I'm not sure that's "easy" in anyone's book.

## The Plan

I think that building a server is an interesting thing that most geeks would love to do but not that many can, so I intend to document this process - for fun reads and for my own reference later down the line.

### Hardware

* Molex to 2x SATA power - for the OS drives. I will only have a single molex connector free after unplugging the optical drive.
* 2x ADATA Ultimate SU630 240 GB 2.5'' SATA SSDs - OS drives. Keyword: relatively cheap.
* 6x Toshiba DT01ACAxx 3 TB 3.5" SATA III HDDs - storage. Read below for explanation of disk choice.
* (Probably further down the road) 3x 8GB 1333 RAM stick, ideally ECC. Max supported memory for the board is 24GBs, and DDR3 is cheap enough that I should be able to max it out with just cursory budgeting.

I've decided on unpopular choices in terms of both hardware grade and capacity on the drives. I've briefly considered using real, SAS server drives, but with the premium they come at I could realistically afford some previously leased drives from a reseller. While I have a reputable reseller on hand, which I trust to not play games with S.M.A.R.T. error wiping and such, used drives are just that. Therefore I've decided on consumer-grade hardware - it should still live for a good few years before degrading, and at that point I may have both reason and spare cash enough to upgrade.

The 3TB capacity is quite a simple choice: it's the largest drives I can afford to get six of at once right now. And I need all the physical devices I plan on using at once due to a ZFS quirk: after creating a RAIDZ pool, you cannot increase the device count in it. There seems to have been some work going into an "online resize" feature, but it seems to unfortunately have stopped.

### Software

* Ubuntu 20.04 LTS Server edition. The current setup is running Ubuntu 18.04 LTS, and I will probably have enough headaches with this project to not introduce another one consciously.
* ZFS RAIDz1 (or RAIDz2) zpool over the storage drives. Less storage space "lost" to parity as compared to RAID5/RAID6 setups.
* KVM/virsh setup for one-off tryout virtual machines.
* Docker and all the jazz necessary for Jarvis workloads.
* Some custom scripts (using `ipmi-tool`) so I can tell the fans to chill with the cooling. This will probably take a few days/weeks of tuning to get to a point where it runs cool enough while quiet enough.

### Caveats

RAIDz1/2 is a choice between being able to suffer one or two concurrent drive failures. I've also found some recommendations as to when use which in relation to drive sizes and counts, which seem to suggest using RAIDz2 for even numbers of drives, but as it will lose more usable space to parity I will need to corroborate these further. Preferably with actual math explanation as opposed to folklore.

Whenever I look for info on quieting down servers, any answers tend to be prefaced with "you really shouldn't, it's an enterprise machine, these are high static pressure fans, that's what it's supposed to do". That's probably fair, but I'm still hopeful that I can get the system cool _enough_ while running the fans at 1.5K RPM instead of full 5K+ blast.

To be perfectly clear: I'm aware it's not the greatest idea and I don't recommend you do this. However given the choices of slightly too warm machine, going full Linus Sebastian and watercooling a server, and a spouse that no longer wishes to co-habitate with said machine, I'm gonna try option 1 first.

## What's next?

My HDDs are still on backorder. I'm willing to wait to get a deal, but it translates to being limited to research right now. However when all the hardware arrives and I can get into the thick of it, expect copious photos, screenshots, writeups and Ansible playbooks galore. Building a server for the home will be a first for me, so I'm excited to both learn and share this journey with you.

---

Top image credit: https://pxhere.com/en/photo/1136169 (CC0)
