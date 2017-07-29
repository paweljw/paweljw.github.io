---
date: "2017-07-08T15:26:57+02:00"
title: "Rails 5.1 API with Vue.js frontend, part 0: stack choices"
coverImage: /media/bookstore.jpg
tags:
- javascript
- es6
- saturdayproject
- follow me
- rails
- api
- rails-api-series
comments: true
draft: false
---

I've been rather busy lately, and my progress in learning Vue.js has slowed down. However, I think that I'm ready to dive into making
something more resembling a real application than [Monster Hunter](http://localhost:1313/2017/06/saturday-project-monster-hunting-with-vue.js/) and [GalaxyQuest](/2017/06/saturday-project-galaxyquest---fuzzily-searching-github-stars/).

I believe that you learn best when your objective is teaching it to somebody else. Therefore, over the next couple of weeks
I'll be making and refining a simple bookstore app<sup><a href="#ft1" name="fr1">1</a></sup>, using Rails 5.1 for the API backend, and [vue.js](https://vuejs.org/)
with [vue-router](https://github.com/vuejs/vue-router) and [vue-resource](https://github.com/pagekit/vue-resource) on the
front end.

<!-- more //-->

_In this series, the following articles have been posted:_

* Part 0: Stack choices
* [Part 1: Setting up a Rails API app](/2017/07/rails-5.1-api-with-vue.js-frontend-part-1-setting-up-a-rails-api-app/)
* [Part 2: Modeling reality](/2017/07/rails-5.1-api-with-vue.js-frontend-part-2-modeling-reality/)
* [Part 3: API versioning](/2017/07/rails-5.1-api-with-vue.js-frontend-part-3-api-versioning/)
* [Part 4: Authentication and authorization](/2017/07/rails-5.1-api-with-vue.js-frontend-part-4-authentication-and-authorization/)
* [Part 5: Deploying with confidence](/2017/07/rails-5.1-api-app-part-4-deploying-with-confidence/)

The goal is that you should be able to follow along! I'll try to keep it simple, however  good command of your console,
a fair grasp on how a "regular" Rails app is put together and understanding of ES6's classes and imports should make for
smooth sailing.

We'll only discuss our architecture choices briefly in this article, and then get cracking in the next parts.

# Why Rails 5.1?

I love Ruby. I also feel strongly about Rails, since it was my first MVC framework. I have some equally strong and not
entirely positive feelings about the direction the framework is taking recently - these are perhaps better suited to become
a separate post. Despite this, however, I think that the API mode in Rails 5 is huge, and has a chance to save Rails from
losing steam amidst the push towards Single Page Applications.

Rails 5.1 is the newest in the 5.x branch at the time of writing, so we'll use that. This version also comes with support for
yarn and webpacker, which we could use, but will not - we'll discuss why later in the article.

So far, I've only had a chance to very cursorally play with the API app generation mode, so I'd like to do a bit more of
that. I'm also choosing Rails because this is what I'm proficient with, while I'm still learning Vue.js. I find that tackling
two new things at once is sometimes harder than necessary, so this is a nice and safe middle ground.

Other choices I would entertain, in the order I'd like to play with them:

* [Phoenix](http://www.phoenixframework.org/) - I've only taken Elixir for a bit of a spin so far, but I'd like to explore the
concepts of functional programming as applied to MVC frameworks.
* [Hanami](http://hanamirb.org/) - while it's Ruby, it's based around dry-rb concepts, so a step in an entirely different direction than Rails.
* [Sinatra](http://www.sinatrarb.com/) - perhaps the choice I'd find easiest to work with (and also one that I've used before).
If I wanted to make a really tiny app, really fast, I'd probably choose this one.

You might notice I've put Sinatra last. That is because I know it best of the mentioned frameworks, so the play factor is
not there. However, following the idea of simplifying the backend code because I might struggle with the frontend anyway,
Sinatra would probably be my choice of backend framework.

# Why Vue.js?

_It feels like every time someone says "I chose X JavaScript framework over Y" on the internet, a local holy crusade suddenly
erupts. Please remember that this is just my personal opinion and not Jerusalem. Thank you._

When I decided to learn a frontend framework in JavaScript, I was deciding between Angular, Ember, React (and it's many
compatible implementations, such as [Preact](https://github.com/developit/preact)) and Vue.js. Performance was one of the
key factors, but I would also decide against learning a more performant framework (right now) if the example code available
didn't sit right with me. This was the case with, for example, React, whose concept of JSX components seems a tad off to me
(on a completely instincitve level).

 Therefore my argument shall be simple and based in numbers. [Stefan Krause](http://www.stefankrause.net/wp/?p=431) has been
 benchmarking a whole bunch of JS frameworks for a while now, most recently in May 2017. You should [go see](http://www.stefankrause.net/js-frameworks-benchmark6/webdriver-ts-results/table.html) the full results for yourself. The short of it
 is that Vue.js simply outperforms React, Preact, Angular and Ember **in the cases that Stefan threw at it**. I feel that
 the benchmark he prepared is reasonably representative and chose to trust it.

# What's the plan?

In theory, you could combine a Vue.js app and a Rails app in a single repository. Rails 5.1 now supports the
[yarn](https://yarnpkg.com/lang/en/) package manager and [webpack](https://webpack.github.io/) through some switches to the
`rails new` command.

I've looked over what Rails generates when these options are enabled, and I'm nonplussed. There were generated controllers
and layouts to include the JavaScript that webpack generates. This makes some sense when you want your HTML to be dynamically
generated even before JavaScript gets to it, but this is not what we want. Therefore if we went this route, we would just
be using an application server, such as [Puma](https://github.com/puma/puma), to serve content which is one hundred percent
static. For what we want, this makes no sense.

We'll be making two applications and placing them in two repositories. The API app will live in one, and we'll be deploying
it to [Heroku](https://heroku.com) using the free Hobby Dev plan. The frontend Vue.js app will live in the other repository,
and we'll walk over how to deploy it to Amazon's S3. I'll also be hosting a copy here on GitHub Pages, so keep in mind that's
an option.

We could host our front end on Heroku as well, but that would defeat the purpose of learning how to build a modern single
page application with strong decoupling between the front and back end. If you really want to do it, go for it though. After
all, this is an experiment for all of us.

We'll also be using [Docker](https://www.docker.com/) for local Rails development (to run PostgreSQL in), and the
[vue-cli](https://github.com/vuejs/vue-cli) tool to set ourselves up with an app template for the front end.

See you in [part 1](/2017/07/rails-5.1-api-with-vue.js-frontend-part-1-setting-up-a-rails-api-app/), where we'll dig into making ourselves a Rails API app!

---

1. <a name="ft1"></a> This could also be a TODO app, a recipe app or one of the other three apps that everybody seems to be
doing for intros and tutorials. I'd rather do a bookstore this time. <a href="#fr1">back</a>

---

Top image credit: https://commons.wikimedia.org/wiki/File:Bookstore_(Eugene,_Oregon).JPG (CC BY-SA 3.0)
