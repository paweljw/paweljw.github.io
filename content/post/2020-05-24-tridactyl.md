---
date: "2020-05-24T00:00:00+02:00"
title: "Things I use: Tridactyl"
coverImage: /media/dactyl.jpg
tags:
- tools
- i-use-this
- tridactyl
comments: true
draft: false
twitterTitle: "Things I use: Tridactyl"
---

I'm on a quest of sorts, a quest for max home row time for my fingers. I'm using various tricks to make my computer easier to operate without ever touching a mouse. Enter [Tridactyl](https://github.com/tridactyl/tridactyl), vim-like navigation for your Firefox.

<!--more-->

I favor the vim editor. Since my day job is slinging code, and most of my odd jobs will also require text input of some kind, one can safely say that I spend a decent chunk of my screentime within it. So much so, that certain navigation primitives have... stuck. Quite _hard_.

This used to lead to me browsing the Web, reading through some article, absentmindedly hitting `j` or `ctrl+f`, and wondering why, exactly, didn't I advance by a line or by a screen. Is this the definition of a first-world problem? Possibly. Is it wildly frustrating? Definitely.

## Just use arrows!

I can hear a certain amount of you screaming this at me through your screens. _"Just move your hand over a scooch to the right, hit those arrow keys and you'll be golden!"_ Well, of course I don't go reaching all the way for my mouse just to scroll a website, that would be silly. But I've taken quite great pains to wean myself off of arrow key navigation in vim, in favor of the `hjkl` control scheme. The issue is not moving my hand over, it's messing with muscle memory that's just waiting to regress.

## Vim-like navigation for the web

So I installed Tridactyl, and fell in love. Not only did scrolling work as I expected, with `hjkl` and `ctrl+f/b`, things like going to the beginning or end with `gg/G` worked brilliantly as well. My workflow in vim utilises tabs, so `gt/gT` for navigating between tabs works the same in my editor and in my browser now.

Tridactyl also enables following links with the keyboard. When I press `f`, I get an overlay - something like this:

{{< figure src="/media/2020-05-24-tridactyl.png" link="/media/2020-05-24-tridactyl.png">}}

If I were to tap `hq` now, I'd go to the Ruby vs Elixir article.

Similarly, marking sections of text for yanking is possible with `v`. I'll admit I haven't gotten fully used to it yet, as it only allows yanking text in pretty broad strokes, and the benefit of grabbing it with the keyboard doesn't outweigh the cost of trimming it down to size later. I still use the mouse for that a lot.

## What I don't like

As all software, Tridactyl is not without it's issues.

One of the most obvious ones: if you're not in an input field, Tridactyl grabs the input. This messes with software like [Miniflux](https://miniflux.app/). It uses `j` and `k` for previous/next article, and if Tridactyl is active on the page it will intercept these. Also websites which accept key shortcuts, such as Google Meet (enable/disable camera, mute etc) will get no joy. There's an option to blacklist certain sites from Tridactyl, but where a single-screen app like Meet does not benefit from it, reading-oriented software like Miniflux is hurt by lacking Tridactyl's scroll and navigation commands.

I've alluded to the second already: it's disabled in input fields. So if I forget myself e.g. in a GitHub pull request comment, someone will get `jjkkk` in their review, as I try in vain to exit insert mode and head up three lines.

Thirdly - though that's not exactly on Tridactyl, rather on Firefox's design. It requires installing tab containers along with it, and hijacks your start page. You can replace the start page with an appropriate command, but the behavior around initial focus on such replacements is wonky at best.

And the final one (which is a feature that no one would expect, but it would be _so, so nice_): this emulates vim's navigation only. Rebinding and vimscript are out of the question. Which is a shame, since `/` search behavior in Tridactyl is something I would _love_ to rebind and possibly replace entirely - it throws me off every time.

## I use this

Despite its shortcomings, I still enjoy using Tridactyl and it does improve my workflow - mostly since almost all of my productive screentime not spent in an editor will be spent in a web browser. Being able to use similar, keyboard-centric navigation schemes in both of these improves my productivity and prevents absent-minded mistakes.

If you use vim already, I recommend you give Tridactyl a try - maybe you'll like it. And if you don't, but enjoy a challenge - try it anyway! It might be a gateway drug to modal editing. And modal editing is awesome.

---

Top image credit: https://pxhere.com/en/photo/690147 (CC0)
