---
date: "2017-06-15T15:47:42+02:00"
tags:
- javascript
- vue.js
- fuse.js
- saturdayproject
title: "Saturday Project: GalaxyQuest - fuzzily searching github stars"
coverImage: /media/galaxyquest.jpg
bigimg: [{src: '/media/galaxyquest.jpg', desc: 'GalaxyQuest!'}]
comments: true
---

_Okay, Thursday project. It's my day off this week, what can I do._

I'm still on this Vue.js kick, so while studying Components, I built myself a little app.

<!--more-->

<img src="/media/galaxyquest.gif">

[GalaxyQuest](https://paweljw.github.io/galaxyquest/) is a very simple app, again. It hooks into the GitHub API and asks 
for a list of a particular user's starred repositories. It then makes a list
out of those and displays them.

The "killer feature" here is that the list can be searched fuzzily - similar to how CtrlP works for vim,
or Ctrl+T works in Sublime Text and Atom. This is achieved by using [fuse.js](http://fusejs.io/) with a minimal custom config.

You can view a working demo [here](https://paweljw.github.io/galaxyquest/), and the whole project is at [paweljw/galaxyquest](https://github.com/paweljw/galaxyquest).

## The Road Ahead

There's tons of room for improvement!

For one, all the logic is currently in the Vue.js components, and that seems very messy to me. I should totally refactor the app, move logic
into service objects, and throw some sense into the CSS for the components.

There's currently also a limit of 100 stars per user. GitHub API pages it's responses, and I ran out of time to make/use a proper API client and pull down all the starred repos.

Finally, I'm not completely happy how fuse.js works; for example, typing in "neovim" while looking at my repos will pull up both 'neovim' and 'vim-fugitive', which instinctively feels to me like "not how it should work". Maybe I'll try my hand at fuzzy searching "my way" sometime soon (though probably not with JavaScript).

