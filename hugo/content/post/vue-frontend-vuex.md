---
date: "2017-10-28T14:00:00+02:00"
title: "Vue.js front end app, part 4: Keeping state with Vuex"
coverImage: /media/persistence.jpg
tags:
- follow me
- javascript
- es6
- vue.js
- vue-frontend-series
- vuex
comments: true
draft: false
twitterTitle: "Vue.js front end app: Vuex"
---

Last time we built an [authentication mechanism](/2017/09/vue.js-front-end-app-part-3-authentication/) with a pretty glaring bug - you can just set the `token` in `localStorage` to whatever and it'll let you in. We need to actually read the token, and persist what we've read so we don't have to do it over and over.

<!--more-->

<details>
  <summary>_This series is composed of multiple articles! Click here for a table of contents._</summary>

  * [Part 1: Setting up the app](/2017/09/vue.js-front-end-app-part-1-setting-up-the-app/)
  * [Part 2: Design is (not) hard](/2017/09/vue.js-front-end-app-part-2-design-is-not-hard/)
  * [Part 3: Authentication](/2017/09/vue.js-front-end-app-part-3-authentication/)
  * Part 4: Keeping state with Vuex
  * [Part 5: Data presentation](/2018/01/vue.js-front-end-app-part-5-data-presentation/)
</details>

## What is Vuex?

Quoting the [getting started guide](https://vuex.vuejs.org/en/intro.html),

> Vuex is a state management pattern + library for Vue.js applications. It serves as a centralized store for all the components in an application, with rules ensuring that the state can only be mutated in a predictable fashion.

But what does it do for us? Vuex provides us with a **store** for our state. This store will have variables with **getters**, and we will only be able to change these with **mutations**. To simplify commiting those mutations, we'll use **actions**.

Now that we know what we want to do, let's get to it!

## Installing Vuex

Since we're using npm, we'll just tell it to install Vuex:

```
npm install vuex --save
```

I'm installing version 3.0.0, so be wary of that if you're reading this in the future when this article has inevitably fallen out of sync with reality. It's a tiny library so the install should be a breeze. Time to set up ~~shop~~ the store.

## Setting up the store

Similar to how we set up axios in the previous part, we'll create a directory for "all things Vuex" in `src`, and we'll call it `store`. The main entry point for the directory will be `index.js`. In it, we need to require Vuex, and hook it up to Vue.

``` javascript
import Vue from 'vue'
import Vuex from 'vuex'

import auth from './auth'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    auth
  }
})
```

Not much meat on the bones here, but hold on - what's that `auth` import doing there?

We only have the one lonely store module in this application (so far at least), but when building a real-world application, we may have a bunch of different ones. Say we wanted to track how many pages the user has navigated to. That'd be a different module - a `counter` perhaps - and an entirely silly thing to do.

Anyway, let's flesh out the `auth` module.

## Building out the auth module

There are four things that go into a Vuex module: the initial state, getters, mutations and actions.

### The state

The nice thing about Vuex stores is that we're not restricted to primitive types. I was afraid that was the case after getting burned on the [Window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) API on a project recently. However, since that's not an issue, I think we'll store a custom `User` object in there. Let's build that first.

#### The `User` model

I'll admit that I'm not sure whether I should be calling this a model. From a Ruby/Rails standpoint, it makes perfect sense - it's an object with attributes, reflecting a particular bit of reality. While I did a bit of research and did not find equivalent JavaScript parlance, I simply might not have been asking the right questions, so feel free to correct me down below. For now - a model it is.

What I'd like for `User` to do for us is thus:

* It needs to be able to build itself from decoded JWT token,
* and it should expose methods for easy access to the user's e-mail and admin status.

I'll plop this into `src/models`:

``` javascript
import JwtDecode from 'jwt-decode'

export default class User {
  static from (token) {
    try {
      let obj = JwtDecode(token)
      return new User(obj)
    } catch (_) {
      return null
    }
  }

  constructor ({ user_id, admin, email }) {
    this.id = user_id // eslint-disable-line camelcase
    this.admin = admin
    this.email = email
  }

  get isAdmin () {
    return this.admin
  }
}
```

_Note: I've extended the token that is sent from the backend app to include info about admin status and email; if you are following the series using that app as your backend, take a look at [this commit](https://github.com/paweljw/bookstore-backend/commit/94eda960e8e0d1815e90207582ea0277a0c8acd8) and pull it into your local repository or fork._

We'll need jwt-decode, too:

```
npm install jwt-decode --save
```

We destructure whatever comes into the constructor. We also have a static method that tries to build an instance of User from the decoded token, and returns a `null` if the token is empty or invalid. Containing this logic here means we won't have to worry about it anywhere else, and we'll either have a valid user or null. It just works!

#### Setting the initial state

Let's start fleshing out the `src/store/auth.js` file:

``` javascript
/* global localStorage */

import User from '@/models/User'

const state = {
  user: User.from(localStorage.token)
}
```

As soon as the app starts, the state will be initialized to either contain a proper user if the token is still hanging around in the local storage, or we'll have a null in there - which means we need to drop the user into login again. Neat.

### Getters

Actually, just the one:

``` javascript
const getters = {
  currentUser (state) {
    return state.user
  }
}
```

Thanks to this we'll be able to add a computed getter in our components and just ask the store about `currentUser`. It's simple. I like simple.

### Mutations

There are two ways to identify to Vuex what mutations we want to do on the store. The first one is to just throw strings around, e.g. `store.commit('logout')` - that would call the `logout` mutation function. But like everything to do with strings, it's error prone and overall rickety, and that will simply not do. Another way is using mutation types.

#### Mutation types

Mutation types are simply constants that we'll use throughout our application to refer to particular kinds of mutations. For now, we just need two kinds: login and logout. Let's create yet another file, `src/store/mutation_types.js` and add those two constants:

``` javascript
export const LOGIN = 'LOGIN'
export const LOGOUT = 'LOGOUT'
```

Now whenever we need to refer to those, we can just `import * as MutationTypes from '@/store/mutation-types'` and refer to them like `MutationTypes.LOGIN`.

#### Defining the mutations

Our mutations are functions bound to a particular mutation type. They get passed the actual `state` object, and any other parameters we might want to pass while commiting the mutation. For now, we're fine working with just the state.

``` javascript
const mutations = {
  [MutationTypes.LOGIN] (state) {
    state.user = User.from(localStorage.token)
  },
  [MutationTypes.LOGOUT] (state) {
    state.user = null
  }
}
```

When the user logs in, we'll assume the token is already updated and set the store state to our model, and when the user logs out we remove the reference to that object.

### Actions

Actions will provide us with a clean, unified way of commiting the mutations - instead of trying to get directly at a mutation, we dispatch a particular action. This will also give us a place to do whatever other tasks are necessary before the commit itself if we need it.

``` javascript
const actions = {
  login ({ commit }) {
    commit(MutationTypes.LOGIN)
  },

  logout ({ commit }) {
    commit(MutationTypes.LOGOUT)
  }
}
```

The object that gets passed into these functions is a Vuex context, so we could do this:

``` javascript
login(context) {
  context.commit(...)
}
```

But we're making our lives a little bit easier and destructuring out just the function we need. After all, ES2015 is all about typing less (looking at you, fat arrow operator)!

### Putting it all together

Now we just need to export a default object with all our goodies. This'll be our store.

``` javascript
export default {
  state,
  mutations,
  getters,
  actions
}
```

Final change comes in `main.js`. We just need to wire our store into Vue and it'll automagically know what to do with it thanks to that `Vue.use(Vuex)` line:

``` javascript
// ...
import store from './store'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  axios,
  store,
  template: '<App/>',
  components: { App }
})
```

Done, we now have a complete working store! Time to put it to use.

## Who uses the User?

`Login` and `App`, so far.

### Updating the `Login` component

We need to change some bits of logic in the `Login` component to have it use the store. The first thing to do will be mapping a getter for `currentUser`, so we can refer to it through the Vue instance as `this.currentUser`. It would be a bit tricky to do by hand, so it's a good thing that Vuex provides a helper method.

``` javascript
# src/components/Login.vue

import { mapGetters } from 'vuex'

export default {
  name: 'Login',
  // ...
  computed: {
    ...mapGetters({ currentUser: 'currentUser' })
  },
  // ...
}
```

Next stop: when we login in the user successfully, we need to dispatch the `login` action. Our `logout` action destroys the user in the store, so we'll dispatch it when the login fails, just to be on the safe side. We've prepared well while augmenting our store with actions, so this requires adding just two lines to our `loginSuccessful` and `loginFailed` methods. I've marked them below:

``` javascript
loginSuccessful (req) {
  if (!req.data.token) {
    this.loginFailed()
    return
  }
  this.error = false
  localStorage.token = req.data.token
  this.$store.dispatch('login') // <=
  this.$router.replace(this.$route.query.redirect || '/authors')
},
loginFailed () {
  this.error = 'Login failed!'
  this.$store.dispatch('logout') // <=
  delete localStorage.token
}
```

One final thing: we need to check for `this.currentUser` instead of the token in `checkCurrentLogin`.

``` javascript
checkCurrentLogin () {
  if (this.currentUser) {
    this.$router.replace(this.$route.query.redirect || '/authors')
  }
},
```

### Updating the `App` component

We're now storing User properly on login, but we're still vulnerable to the ol' "set `localStorage.token` to 'nonsense'" bug because we're referring straight to `localStorage` in `App`. At least I think that's the only place that's left; let me just do a quick search.

```
% rg localStorage.token
src/App.vue
13:    if (!localStorage.token && this.$route.path !== '/') {

src/store/auth.js
7:  user: User.from(localStorage.token)
12:    state.user = User.from(localStorage.token)

src/backend/vue-axios/axios.js
11:    'Authorization': 'Bearer ' + localStorage.token

src/components/Login.vue
55:      localStorage.token = req.data.token
62:      delete localStorage.token
```

I'm using [ripgrep](https://github.com/BurntSushi/ripgrep), by the way. If you're using Sublime Text, Atom or some kind of IDE you could use it's built-in project search. Atom's search was always painfully slow in my opinion, and while Sublime's is better by leaps and bounds it still takes too long for my tastes on projects towards the larger end of the scale. Ripgrep is consistently amazingly fast for me.

Anyway, the search confirms what my memory was telling me - time to update the `App`. You know the drill: import `mapGetters`, map a getter, check current login.

``` javascript
import { mapGetters } from 'vuex'

export default {
  name: 'app',
  computed: {
    ...mapGetters({ currentUser: 'currentUser' })
  },
  created () {
    this.checkCurrentLogin()
  },
  updated () {
    this.checkCurrentLogin()
  },
  methods: {
    checkCurrentLogin () {
      if (!this.currentUser && this.$route.path !== '/') {
        this.$router.push('/?redirect=' + this.$route.path)
      }
    }
  }
}
```

Let's see how that token replacement bug fares now:<br/><br/>

<video id="it-works" src="/media/vue-vuex/itworks.webm" controls style="width: 100%"></video>

Aww yeah, didn't stand a chance.

## Let me out! Or adding a logout button

Right now the only way to log out of the app in the browser is to go into the console, break the token and refresh. I've had to do it about 15 times in the past two hours, and I'm getting fed up. It's time we've built ourselves a navbar to tell us who we are (in case we forgot) and let us log out like regular users, and not the software magicians that we are.

We'll render the navbar as a child of `App`. We only want it to try and render for logged in users, though, so we'll do a bit of conditional rendering. First, let's update the template for `App`.

``` html
<template>
  <div id="app">
    <template v-if="currentUser">
      <Navbar></Navbar>
    </template>
    <div class="container-fluid">
      <router-view></router-view>
      <template v-if="currentUser">
        <Foot></Foot>
      </template>
    </div>
  </div>
</template>
```

If the user is set, we render the navbar and footer around the router view, otherwise we just want the router view since the login form is self-contained. Also, we don't want to use `Footer` as the name of our component: it's also the name of a regular HTML tag, and Vue will give us grief about it.

A couple more things before this clicks together. First of all, we need to import these new components in `App`:

``` javascript
import Navbar from '@/components/Navbar'
import Foot from '@/components/Foot'
```

Before Vue renders them, we also need to register them, so let's add a `components` section in `App`:

``` javascript
components: {
  Navbar,
  Foot
}
```

If we wanted to reference them by different names in the template, we could do it like so:

``` javascript
components: {
  MySuperSnazzyNavbar: Navbar
}
```

``` html
<div>
  <MySuperSnazzyNavbar></MySuperSnazzyNavbar>
</div>
```

If we just want the default names though, we can rely on object destructuring to build the `{ Navbar: Navbar }` setup for us.

If we were to look at our application right now, we'd find out that it crashed 😞 And with good reason: we're importing components that don't exist. We better fix that.

### Adding the footer component

For now I just want a static footer, nothing crazy. We'll put it in `src/components/Foot.vue`.

``` html
<template>
  <footer>
    <hr/>
    <p class="text-muted">Built with ♥︎ by <a href="https://github.com/paweljw">Paweł J. Wal</a></p>
  </footer>
</template>

<script>
export default {
  name: 'Foot'
}
</script>
```

12 lines of code and one shameless plug later, we've got a footer. Time to build a navbar.

### Adding the navbar component

This one is a bit more complicated:

``` html
<template>
  <nav class="navbar navbar-dark bg-bookstore">
    <a class="navbar-brand" href="/">Bookstore</a>

    <span class="navbar-text">
      {{ currentUser.email }}
      <router-link to="/logout" class="btn btn-logout btn-sm">Logout</router-link>
    </span>

  </nav>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Navbar',
  computed: {
    ...mapGetters({ currentUser: 'currentUser' })
  }
}
</script>

<style lang="scss" scoped>
.bg-bookstore {
  background: #605B56 !important;
}

.btn-logout {
  background-color: #837A75;
  border-color: #837A75;
  color: #fff;
}

.btn-logout:hover {
  background-color: darken(#837A75, 20%);
  border-color: darken(#837A75, 20%);
  color: #fff;
}
</style>
```

It's a typical Bootstrap 4.0 navbar, except for two things: we're rendering `currentUser.email`, and we're using a router link for logout. It's worth noting that I've added the `mapGetters` helper here and linked the `currentUser` getter as well.

`router-link` is a helper component from vue-router. We're using just the most bog-standard functionality here and routing to a path. We'll be using the fancier parts of this helper in future episodes while linking to authors and books.

You might notice one more thing: we're using SASS here, because I don't want to recalculate darker colors by hand if the client changes his mind about the navbar. We'll need to add a SASS loader for that in development:

```
npm install sass-loader node-sass style-loader --save-dev   
```

The file `build/webpack.base.conf.js` also requires a slight addition:

``` javascript
{
  test: /\.s[a|c]ss$/,
  loader: 'style!css!sass'
}
```

It's a big file, but it already contains a ton of loaders - you should have no problem figuring out where to add this one.

### Wiring together the logout

It's nice that we have a button, but it currently gets us nowhere. We'll add a route for logout to the router. Also, we'll switch the router to HTML5 history mode; this will let us get rid of that pesky `#` in the URLs, which I dislike thoroughly.

``` javascript
// ...
import Logout from '@/components/Logout'

export default new Router({
  mode: 'history', // <=
  routes: [
    // ...
    {
      path: '/logout',
      name: 'Logout',
      component: Logout
    }
  ]
})
```

And as you might have already guessed, we'll add a Logout component. It's a different kind than the ones we've built so far, though - no template, no styles and a minimal script:

``` html
<script>
export default {
  name: 'Logout',
  created () {
    delete localStorage.token
    this.$store.dispatch('logout')
    this.$router.push('/')
  }
}
</script>
```

Could we skip creating a component at all? It's certainly possible - we can add a script directly in the router to do conditional navigation guarding. However while attempting this I found that trying to access the store from the router was rather awkward and I didn't like any approach I could get to work.

We could also attach this action to the button in the navbar, but that's not very reusable. If I'm missing something and it could be done in a more elegant way, let me know down below - and if you agree with my approach, don't hestitate to let me know that, either! 😉

When we now click the logout button, we'll be dropped into the login screen. Differently from your typical HTTP-based logout button, however, the transition is instantaneous. It's jarring to me, and if something is jarring, that means some form of contract or expectation has been broken. To work around this a bit, I've added a fade-in animation to the login form:

``` css
.login-wrapper {
  // ...
  animation: fadein 0.6s;
}

@keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}
```

It's a very simple addition, but it smooths the transition over - my brain expected a "transition" instead of a "jump" and it seems satisfied with what it gets now (as in, the logout process no longer feels jarring).

## Closing thoughts

The app is coming together pretty nicely! If we were to compare this to building a house, we've got a solid foundation, a roof, some walls and a decent door. Next time we'll be replacing that "Welcome to Your Vue.js App" banner with our authors and books (it's about time)!

I've mentioned ripgrep in this episode. It's a great tool and I'm getting a ton of mileage out of it; I highly recommend it to every console jockey out there. I talk a lot about the tools I like when they get used in a particular episode, but there are still more awesome little scripts and programs out there that will probably never feel appropriate for any part of this series.

While these "big" articles take a lot of time to make (this one is currently clocking in at almost 10 hours of coding and writing alone), I'll be posting a couple of shorter posts between them about the tools that I just can't live without, so be on the lookout for those as well.

As always, thanks for reading - let me know your thoughts and questions in the comments below! I respond to every single one, even if it takes a little while sometimes. Check out the code for this part on GitHub at [paweljw/bookstore-frontend](https://github.com/paweljw/bookstore-frontend/tree/part-4) and I'll see you in the [next one](/2018/01/vue.js-front-end-app-part-5-data-presentation/)!

---

Top image credit: Dave Bezaire via https://www.flickr.com/photos/dlbezaire/6037859191 (CC-BY-SA 2.0, used without modification)