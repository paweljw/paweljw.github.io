---
date: "2017-09-07T17:00:00+02:00"
title: "Vue.js front end app, part 1: Setting up the app"
coverImage: /media/tools.jpg
tags:
- saturdayproject
- follow me
- javascript
- es6
- vue.js
- vue-frontend-series
comments: true
draft: false
twitterTitle: "Vue.js front end app: Basic tools and setup"
---

Last time we’ve seen each other, we’ve just deployed our Rails 5.1 API app. Time to put an end to this! A _front_ end, of course.

<!--more-->

_We'll be using a Rails API backend which we've made in a previous series of posts, [check it out](/2017/07/rails-5.1-api-with-vue.js-frontend-part-0-stack-choices/)!_

In this part we'll go over the basics: how to get everything related to Vue.js installed, how to set up our app, and how the different bits and pieces fit together. This might seem like starting a step lower than my Rails series - and it is, since I've done a lot with Rails previously but I'm just starting with Vue. If you're already a pro, this part might be safe to skip, and if you're just starting like me - we'll do it together!

## But first: thanks!

Many people have shown their support for this series by explaining some concepts to me, tweeting, opening issues and pull requests on GitHub - at this point the back end app really is _ours_, not just mine. Even more people have posted links to my articles all over the internet. While doing research for this new series, I’ve even stumbled upon a [Stack Overflow answer](https://twitter.com/paweljwal/status/904819908848091137) linking back to my posts!

In the past month since the first series ended, people have e-mailed me, tweeted at me, DMed me, posted comments on Disqus - basically contacted me in every way except slinging a letter-wrapped brick through my window - to ask when is the next part coming. I originally hoped to just keep on trucking right after the Rails series, but then offline life happened. Sorry.

I’m amazed, overwhelmed and humbled by the response the Rails series got. From the bottom of my heart - thank you, everyone, for making all of this happen. You rock.

Okay, okay. I’m done being emotional. Let’s get ~~dangerous~~ _technical_.

## The basics: Node.js, NPM and NVM

Especially for modern languages, I like to keep my runtime versions separated. In my Ruby work this is actually a necessity - I’m frequently dealing with a lot of different projects which run on different interpreter versions. In about 90% of those the Ruby version cannot be bumped simply, whether because I cannot make such a decision single-handedly, or because the project priorities currently do not include allocating engineering time required to roll out new environments with updated Ruby. This is why for years I’ve been using [RVM](https://rvm.io), though I’ve switched to [rbenv](https://github.com/rbenv/rbenv) in the past year or so.

Naturally, when going into a new (for me) language I tend to sniff around the community and ecosystem for similar tools. The tool that does this with Node.js is called, somewhat unimaginatively, Node.js Version Manager, or [NVM](https://github.com/creationix/nvm) for short. This GitHub link has installation instructions.

There’s a caveat: NVM does not currently support Windows. If developing on Windows is your thing, alternatives such as [nvm-windows](https://github.com/coreybutler/nvm-windows) and [nodist](https://github.com/marcelklehr/nodist) exist. Since I don’t do any development on Windows, aside from developing my hand-eye coordination, I don’t know how well they work or indeed whether they work at all. Sorry 😔

After installing NVM, installing Node.js and NPM is as easy as:

``` bash
$ nvm install stable
$ nvm use stable
$ node -v
v8.4.0
$ npm -v
5.4.1
```

## Vue.js CLI

We're going for the full Vue.js development experience. We're going to be using ES2015 (a.k.a. ES6) - there's no reason not to give ourselves all that `import` and `class` goodnes to play with.

Then again, we'll want our code to run in browsers which do not support ES6 fully yet... and the sheer amount of _thinking_ required to figure out [which browsers support which features of ES6](https://kangax.github.io/compat-table/es6/) can make your head spin. I don't know about you, but I like my head non-spinny, so we definitely want [Babel](http://babeljs.io) in the mix. If you don't know what Babel is - it's pretty complex, but the short-and-innacurate of it is it's a translator. It takes ES6 and converts it to older-style JavaScript thus magically ([caveats](http://babeljs.io/docs/usage/caveats/) apply) making it work in older browsers.

We'll also want one-command bundling of all those files that we'll make into one file that we can deploy, and tests, and... oh my, this is starting to look complicated, isn't it.

Thankfully we don't need to bang out all that boilerplate code. There's a tool called [Vue.js CLI](https://github.com/vuejs/vue-cli) that'll do most of that not-heavy-but-boring lifting for us.

Since we already have Node.js and NPM installed, installing the CLI is as easy as:

``` bash
$ npm install --global vue-cli
```

The basic syntax for app initialization is `vue init [template-name] [app-name]`. There are several vue-provided templates, and you can check them all out at [github.com/vuejs-templates](https://github.com/vuejs-templates). The template that sets up all the goodies we've talked about above is called `webpack`, so we can initialize our application like this:

``` bash
$ vue init webpack bookstore-frontend
```

The CLI asks us a couple of questions - what the app name should be (again), some description and who's the author. Then we get into some technical details.

<script type="text/javascript" src="https://asciinema.org/a/B1K9LL4MKw0Cfldf3UPi7J3Q7.js" id="asciicast-B1K9LL4MKw0Cfldf3UPi7J3Q7" async></script>

* Do we want vue-router? Yes we do, and we'll talk about the basics of it in a bit.
* Do we want ESLint? Also yes, this will keep us honest and our code great! I use [StandardJS](https://standardjs.com) for all my JS work. The others IMHO are "StandardJS, but we pulled out some parts and put in some new ones" - if you're working alone, try and experiment a bit with different st
* Do we want to unit-test with Karma and Mocha? Of course we want to test!
* Do we want to test end-to-end with Nightwatch? You'll notice that I've answered "No" here. I feel like end-to-end testing might be out of scope for this series, and if we want to revisit it in the future, we can easily add it ourselves later.

The app is all generated now, so we can go ahead and install all the dependencies. Go get yourself something to drink - this'll take a _while_ on a fresh Node.js install (depending largely on your network speed, hard drive throughput and, ocasionally, current moon phase).

``` bash
$ cd bookstore-frontend
$ npm install
```

When that's done, we can run

``` bash
$ npm run dev
```

to start the development server. On my machine, this also opens the default browser to port 8080 on localhost, where the dev server listens. If everything went well, you should be able to feast your eyes on this:

{{< figure src="/media/npm_run_dev.png" link="/media/npm_run_dev.png" caption="Hold on, that's not a bookstore." >}}

## Wait, so what's showing this?

I thought you'd never ask! Let's look at the directory structure Vue.js CLI generated for us.

``` bash
$ tree .
```

\*Hits Ctrl+C after 30s of scrolling\* okay, just _how many_ lines are you trying to print here, `tree`?


``` bash
$ tree . | wc -l
   21376
```

_Ruh roh, Shaggy_. That's a _ton_ of files. Did the CLI really generate all those?

Not really. Much like Bundler works in vendor mode, `npm install` directed NPM to download and store local copies of all the necessary packages in the `node_modules` folder within our app's directory. Let's just direct `tree` to skip all that.

``` bash
$ tree . -I "node_modules"
.
├── README.md
├── build
│   ├── build.js
│   ├── check-versions.js
│   ├── dev-client.js
│   ├── dev-server.js
│   ├── utils.js
│   ├── vue-loader.conf.js
│   ├── webpack.base.conf.js
│   ├── webpack.dev.conf.js
│   ├── webpack.prod.conf.js
│   └── webpack.test.conf.js
├── config
│   ├── dev.env.js
│   ├── index.js
│   ├── prod.env.js
│   └── test.env.js
├── index.html
├── package-lock.json
├── package.json
├── src
│   ├── App.vue
│   ├── assets
│   │   └── logo.png
│   ├── components
│   │   └── Hello.vue
│   ├── main.js
│   └── router
│       └── index.js
├── static
└── test
    └── unit
        ├── index.js
        ├── karma.conf.js
        └── specs
            └── Hello.spec.js

10 directories, 26 files
```

Phew! That's much more manageable. But we can trim this down even further - the `build` and `config` directories are not of interest to us for now, we'll get to those a bit later. Let's drop those too.

``` bash
$ tree . -I "node_modules|build|config"
.
├── README.md
├── index.html
├── package-lock.json
├── package.json
├── src
│   ├── App.vue
│   ├── assets
│   │   └── logo.png
│   ├── components
│   │   └── Hello.vue
│   ├── main.js
│   └── router
│       └── index.js
├── static
└── test
    └── unit
        ├── index.js
        ├── karma.conf.js
        └── specs
            └── Hello.spec.js

8 directories, 12 files
```

Okay, lovely! Let's see what we have here:

* A README.md - this baby is GitHub-ready.
* An index.html which is used as the "HTML entry-point" of our app. This is the basic HTML template that our app gets loaded into when it's built. If for some reason we decided to pull something from CDN, like Bootstrap, we could place the references in there.
* package*.json - built for and by NPM, we don't need to touch those right now (but we will eventually).
* A `static` directory, where we could place static assets which we don't need to reference from Vue.js.
* A `test` directory, where we can already see a spec for `Hello`. What's that? We'll see in a minute.
* And the main event of the evening: the `src` directory. Let's take a closer look.

``` bash
tree src
src
├── App.vue
├── assets
│   └── logo.png
├── components
│   └── Hello.vue
├── main.js
└── router
    └── index.js

3 directories, 5 files
```

`main.js` is the actual entry point for our Vue application. It imports `Vue`, `App` and the `router`, and mounts the Vue app to the HTML template in `index.html`.

`App.vue` is what gets first loaded - it's our base _component_. We also have a child component in `Hello` (so that's what it was!).

### What are components?

[Components](https://vuejs.org/v2/guide/components.html) are the building blocks of a Vue.js application. They are used similarly to HTML tags in Vue.js templates. Each component has its own template (made by mixing HTML and Vue.js markup), its code and it can have a style, which can be scoped so that it only affects the particular component.

Since we're running the `webpack` scaffolding template, we're set up to use "single-file templates". These take the three parts mentioned above - template, code and style - and jam them into a single file with a `.vue` extension. Let's take a peek at what our `App` component looks like.

``` html
<template>
  <div id="app">
    <img src="./assets/logo.png">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
```

The three parts are clearly separated: the `<template>` at the top delimits our template's code, the `<script>` contains the logic and `<style>` is just CSS. We should keep in mind that this component's style is not `scoped`, so it will affect everything that is nested within `App`.

In the script we can see that a component should export a default object. There's not much in there, just a name. This is the name that components can be referenced in templates; if we were to nest `App` somewhere, we could say `<app></app>` in our template and it'd get embedded there. Since `App` is a top-level component, we don't want to do it, but the name is required nonetheless.

Looking at the template we notice that it is not congruent with what we see in our browser. There's the logo, all right, but where's all the text below? The answer lies in the `<router-view>` tag below.

It does not look like regular HTML, so it must be a component. Also we did not define a component by that name (and we don't see it anywhere in `src`). But we did use vue-router, so this is probably what provides this component.

All that means that we need to dig into the router configuration now to unravel what is going on here.

### vue-router

Where is our router config? Let's look at the imports in main.js again:

``` javascript
// ...
import router from './router'
// ...
```

Since `./router.js` does not exist, it follows that `./router/index.js` is loaded here. Let's take a peek.

``` javascript
import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    }
  ]
})
```

Even if we don't know how everything here works, we can infer enough. So far, the routes only say "when path is /, load component Hello". The name is for named routes, which are easy to link to - think of it like of path helpers in Rails. We'll go over this in much more detail when laying out the routing structure for our app in a future episode.

Okay, "load component Hello". What's in Hello?

``` html
<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h2>Essential Links</h2>
    <ul>
      <li><a href="https://vuejs.org" target="_blank">Core Docs</a></li>
      <li><a href="https://forum.vuejs.org" target="_blank">Forum</a></li>
      <li><a href="https://chat.vuejs.org" target="_blank">Community Chat</a></li>
      <li><a href="https://twitter.com/vuejs" target="_blank">Twitter</a></li>
      <br>
      <li><a href="http://vuejs-templates.github.io/webpack/" target="_blank">Docs for This Template</a></li>
    </ul>
    <h2>Ecosystem</h2>
    <ul>
      <li><a href="http://router.vuejs.org/" target="_blank">vue-router</a></li>
      <li><a href="http://vuex.vuejs.org/" target="_blank">vuex</a></li>
      <li><a href="http://vue-loader.vuejs.org/" target="_blank">vue-loader</a></li>
      <li><a href="https://github.com/vuejs/awesome-vue" target="_blank">awesome-vue</a></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'hello',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
```

Jackpot. These are all the links we saw in the browser. But wait a minute - there's no logo here!

vue-router doesn't just load a component - it loads the component into the `<router-view>` placeholder in a top level component. Whatever we define in `App` will always wrap what is in the component that router loaded - think of it like the `application` layout in Rails, and `<router-view>` as akin to `yield` in that layout.

What does this component do? Nothing much, apparently - it does have its own `scoped` style and a single piece of data - `msg` - being displayed in the header.

If there's one nice feature about the development server that we're running, it's the live regeneration of the app views. If we change the `<script>` section of `Hello.vue` to say, e.g.

``` javascript
export default {
  name: 'hello',
  data () {
    return {
      msg: 'Hello from paweljw.github.io!'
    }
  }
}
```

the browser will show this _immediately after saving_ the file - no reloads there:

{{< figure src="/media/hello.png" link="/media/hello.png" caption="Hello!" >}}

## What's next?

When we were designing our Rails API app, we took a little bit of time before typing a single line of code to [think about the reality we were trying to model](https://paweljw.github.io/2017/07/rails-5.1-api-app-part-2-modeling-reality/) and how to express it in code. That's of course done now and we don't need to do this again for the front end, at least not to the same extent.

Remember the key things we learned about Vue, though:

* Vue applications are (largely) composed of components.
* Components are reusable and nestable.

Therefore it seems pretty obvious that we can have our components as fine-grained, or as broad, as we would like them to be. It'll be a fine balancing act to split them finely enough that they have a single responsibility each - identically to how we observe SRP in Ruby and other OOP. We'll also need to keep ourselves in check to not split too much, lest we end up in infinite component tree hell.

Of course we could just go ahead guns blazing, but then we'd just probably make a mess of things and simply cost ourselves more time than we saved on proper design. Therefore next time (in a week or two) we'll take a bit of a breather from the code itself and spend a little time designing our app.

In order to avoid wasting time later we'll throw together a quick mock-up of the few screens we need and see how they can be cut neatly into components. We'll also talk about the process of mocking up itself as well, such as what tools you can use (and why you don't need any). Finally we will touch very lightly on some issues we can run into when dealing with UI and UX.

As always, the code for this part is available on GitHub at [paweljw/bookstore-frontend](https://github.com/paweljw/bookstore-frontend/releases/tag/part-1).

See you in part 2!

---

Top image credit: Biser Todorov via https://commons.wikimedia.org/wiki/File:Rusty_tools.JPG (CC-BY 3.0)
