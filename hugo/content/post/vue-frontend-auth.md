---
date: "2017-09-30"
title: "Vue.js front end app, part 3: Authentication"
coverImage: /media/odoor.jpeg
tags:
- frontend
- vue.js
- vue-router
- vue-axios
- vue-frontend-series
- follow me
comments: true
draft: false
twitterTitle: "Vue.js front end app: JWT auth"
---

In this part we'll allow the user to log in to our frontend app, using the [auth mechanism](/2017/07/rails-5.1-api-app-part-4-authentication-and-authorization/) we've built on the back end earlier. A lot of topics in this one, so jump right in!

<!--more-->

<details>
  <summary>_This series is composed of multiple articles! Click here for a table of contents._</summary>

  * [Part 1: Setting up the app](/2017/09/vue.js-front-end-app-part-1-setting-up-the-app/)
  * [Part 2: Design is (not) hard](/2017/09/vue.js-front-end-app-part-2-design-is-not-hard/)
  * Part 3: Authentication
  * [Part 4: Keeping state with Vuex](/2017/10/vue.js-front-end-app-part-4-keeping-state-with-vuex/)
  * [Part 5: Data presentation](/2018/01/vue.js-front-end-app-part-5-data-presentation/)
  * [Part 6: Deploying to S3](/2018/04/vue.js-front-end-app-part-6-deploying-to-s3/)
</details>

We did a lot of talking in the previous post, a bunch of drawing squares, and almost zero coding. And with good reason, too. But I'm raring to code already, and I guess so are you! No worries: today's post is all code, all the time.

When we've last parted ways with our app, it looked like this:

{{< figure src="/media/hello.png" link="/media/hello.png" >}}

Well - that's no bookstore, is it. We need to do something about it, and as we've discussed last time the first thing we need is a login screen. 

Usually a log-in screen might be located at `/login`, `/sign-in` or other such URL. But our app cannot be used at all without logging in - that's how we designed the API - so we'll be justified in just putting the log in screen on `/` in this case.

So what needs to happen when the user arrives at the app is:

* If they are not logged in, they are redirected to `/`
* When they provide their username and password, an AJAX request is made to the backend
* If the backend responds with a token, store the token for future use and redirect the user to `/authors`
* If the backend responds with an error, display an error message

Let's start somewhat in the middle and build the login form first.

## Login form

Right now our `src/router/index.js` file looks something like this:

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

The default route renders the `Hello` component within the `<router-view>` container within `App`. Let's see what `App` looks like:

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

We'll rip all that out, drop in Bootstrap and make a `Login` component.

### Bootstrap

We'll just go the fastest and easiest route and import Bootstrap from a CDN. You can get a link at Bootstrap's [Quick Start](https://getbootstrap.com/docs/4.0/getting-started/introduction/) guide. After that, just place it in `/index.html` file within the `<head>` section.

``` html
<!DOCTYPE html>
<html>
  <head>
    <!-- ... //-->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css" integrity="sha384-/Y6pD6FV/Vv2HJnA6t+vslU6fwYXjCFtcEpHbNJ0lyAFsXTsjBbfaDjzALeQsN6M" crossorigin="anonymous">
  </head>
  <!-- ... //-->
</html>
```

Let's also put a `#container` div in the `App` component. While we're doing it, we can get rid of the unnecessary default styling, so it looks like this:

``` html
<template>
  <div id="app">
    <div class="container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
</style>
```

### Login component

Let's take a look at a first version of the `Login` component in it's entirety, and then drill down to the important bits.

``` html
<template>
  <div class="login-wrapper border border-light">
    <form class="form-signin" @submit.prevent="login">
      <h2 class="form-signin-heading">Please sign in</h2>
      <label for="inputEmail" class="sr-only">Email address</label>
      <input v-model="email" type="email" id="inputEmail" class="form-control" placeholder="Email address" required autofocus>
      <label for="inputPassword" class="sr-only">Password</label>
      <input v-model="password" type="password" id="inputPassword" class="form-control" placeholder="Password" required>
      <button class="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    login () {
      console.log(this.email)
      console.log(this.password)
    }
  }
}
</script>

<style lang="css">
body {
  background: #605B56;
}

.login-wrapper {
  background: #fff;
  width: 70%;
  margin: 12% auto;
}

.form-signin {
  max-width: 330px;
  padding: 10% 15px;
  margin: 0 auto;
}
.form-signin .form-signin-heading,
.form-signin .checkbox {
  margin-bottom: 10px;
}
.form-signin .checkbox {
  font-weight: normal;
}
.form-signin .form-control {
  position: relative;
  height: auto;
  -webkit-box-sizing: border-box;
          box-sizing: border-box;
  padding: 10px;
  font-size: 16px;
}
.form-signin .form-control:focus {
  z-index: 2;
}
.form-signin input[type="email"] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
.form-signin input[type="password"] {
  margin-bottom: 10px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
```

Let's look closer at the script itself:

``` javascript
export default {
  name: 'Login',
  data () {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    login () {
      console.log(this.email)
      console.log(this.password)
    }
  }
}
```

We're adding placeholders in the `data()` section (remember that this needs to be a function - it's something that tended to trip me up!) for the email and password. We also have a super-simple `login()` method - it's just something to verify that the form works.

We need to tell Vue to bind the inputs to the placeholder values. We can do that with the `v-model` directive:

``` html
<input v-model="email" type="email" ...>
<input v-model="password" type="password" ...>
```

That's it - Vue will update the fields of the component automatically now.

When the form submits, we don't really want the browser to perform the regular submit action - rather, we'd like to run the `login()` method we've defined. One more directive and we're golden:

``` html
<form class="form-signin" @submit.prevent="login">
```

Pay attention to the `prevent` qualifier: if we omitted it, Vue would run our method, but after that allow the event to bubble up to the browser, messing up our flow.

### Mounting it

Now that we have the `Login` component in place and `App` changed for Bootstrap, let's change the routing so that we route to `Login` on the path `/`:

``` javascript
import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login
    }
  ]
})
```

If we check the browser now, this is the reward for our efforts:

{{< figure src="/media/vue-auth/login.png" link="/media/vue-auth/login.png" >}}

Yay! Now, to actually make it _do_ something.

## vue-axios

A couple months back when I wrote the original post on [stack choices](/2017/07/rails-5.1-api-with-vue.js-frontend-part-0-stack-choices/) I said that we will use vue-resource. Since then it has come to my attention that the creator of Vue decided to [retire vue-resource](https://medium.com/the-vue-point/retiring-vue-resource-871a82880af4) as far back as November 2016.

Because of that I've decided to replace it with [vue-axios](https://github.com/imcvampire/vue-axios) which provides Vue-style binding to the [axios](https://github.com/axios/axios) library. Let's drop that into our project:

``` bash
$ npm install --save axios vue-axios
```

We will need to tell Vue to use axios, and we will need to tell axios where our API is and how to authorize itself properly.

I like all my things neatly tucked away in obvious locations (well, obvious to me at least) - I guess it's a Rails-person thing. Anyway, I tucked the files we'll discuss momentarily in `src/backend/vue-axios`. That way I know this talks to the backend and has to do with this library by glancing at the directory structure itself.

``` bash
$ tree src/backend
src/backend
└── vue-axios
    ├── axios.js
    └── index.js

1 directory, 2 files
```

### Configuring axios

axios has a couple of configuration options we can leverage here.

First off, there's `baseURL`. When we tell axios to contact e.g. `/authors`, it will prepend the `baseURL` automatically. Thanks to this we can easily switch between local development (seen here as default value), staging and production. And if we ever need to change it, it's in one place.

Secondly we have the headers. Right now we only want JSON responses, and we will attach a JWT token to each of our calls. Note that while the user is not authorized (and we didn't set up the `token` variable in localStorage) this will still be sent with just a space and nothing more after `Bearer`. That's fine: our backend can deal with this situation and properly bail on such a request if need be.

``` javascript
/* global localStorage */

import axios from 'axios'

const API_URL = process.env.API_URL || 'http://localhost:3000/api/v1'

export default axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.token
  }
})
```

### Configuring vue-axios with "our" axios

The contents of `index.js` are basically boilerplate Vue-extension-to-Vue-connection code:

``` javascript
import Vue from 'vue'
import VueAxios from 'vue-axios'

import axios from './axios'

Vue.use(VueAxios, axios)
```

There is one important twist. We instruct vue-axios to use _our configured axios instance_ and attach to Vue. If we just used boilerplate code from GitHub, the `axios` instance that attaches to vue-axios would just have default settings.

### Acquainting Vue with axios

One last thing to do: we need to make sure it actually attaches to our instance. We can to this in `src/main.js` by adding two new lines:

``` javascript
// ... other imports ...
import axios from './backend/vue-axios'

// ...

new Vue({
  el: '#app',
  router,
  axios,
  // ...
})
```

Now our Vue instance knows it has two extensions: `router` and `axios`. Let's do something with it, shall we?

## Getting a token

Let's go back to our `Login` component and its `login` method. We will expand it a bit to call axios:

``` javascript
login () {
  this.$http.post('/auth', { user: this.email, password: this.password })
    .then(request => this.loginSuccessful(request))
    .catch(() => this.loginFailed())
}
```

vue-axios mounted our axios instance under `$http` - it's available in all components. With it we make a POST request to our `/auth` endpoint, passing `user` and `password` along.

axios returns [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). It's a catch worth knowing about: if you expect to run in an environment where they are not supported, you may need to e.g. polyfill them.

Anyway, we're telling axios that the promise it returns should call `loginSuccessful` with the request object if everything goes well, and if it does not - `loginFailed` should be called. Let's implement those methods now.

``` javascript
loginSuccessful (req) {
  if (!req.data.token) {
    this.loginFailed()
    return
  }

  localStorage.token = req.data.token
  this.error = false

  this.$router.replace(this.$route.query.redirect || '/authors')
}

loginFailed () {
  this.error = 'Login failed!'
  delete localStorage.token
}
```

You will notice that if the server decides to respond with 200, but does not generate a token, we fail either way. If we _do_ get a proper token, we put it into local storage and redirect to `/authors`. You will notice that we've also prepared ourselves for a `redirect` parameter that might happen to be present on the query. We'll use it for clean redirection after an auth failure later. For all our routing needs we use `$router` - it was mounted by the `vue-router` extension we generated our app with.

When the login fails we delete whatever there might be in the `localStorage`. We also set an error message. But wait, we didn't define it yet! We should let the component know that we require it to have such a variable. We can do this in the `data` section, expanding it to look like so:

``` javascript
data () {
  return {
    email: '',
    password: '',
    error: false
  }
}
```

One finishing touch: displaying the error to the user. We can use a Bootstrap alert with a div that will only display if there is an error to be shown:

``` html
<h2 class="form-signin-heading">Please sign in</h2>
<div class="alert alert-danger" v-if="error">{{ error }}</div>
```

How shall we test it? Let's just attach something under `/authors`. We do have a perfectly good `Hello` component laying around after all:

``` javascript
// src/router/index.js

// ...
    {
      path: '/authors',
      name: 'Authors',
      component: Hello
    }
```

We can run the API in the background, try to log in and it should show the (slightly mangled, but that's just for testing) contents of `Hello`!

## Locking it down

We know that our login works and we got redirected to `/authors` after logging in. Now that I'm logged in, let me just go to `/` real quick...

{{< figure src="/media/vue-auth/login.png" link="/media/vue-auth/login.png" caption="Huh. That again.">}}

From a modern web application I'd expect a redirect if I'm already logged in. I am, right? Let's go to `/authors`...

{{< figure src="/media/vue-auth/authors.png" link="/media/vue-auth/authors.png" caption="Okay, I think I'm logged in.">}}

Good, so that works. Let's check it once more, somewhere where my `localStorage` cannot follow me: in incognito mode. We'll copy the direct link to authors and...

{{< figure src="/media/vue-auth/authors_private.png" link="/media/vue-auth/authors_private.png" >}}

Dang. That's not very secure, is it. Let's fix it.

### Where should I actually go?

The proper routing can be summarized to two sentences:

* If I am logged in, and on `/`, I should be redirected to `/authors`.
* If I am not logged in, and not on `/`, I should be redirected to `/`.

The first sentence we can implement directly in the `Login` component, since that's where I will end up if I go to `/` - whether I am logged in or not.

### Redirecting to app when logged in

_Note: the next paragraph originally only talked about the `updated()` method, which created a bug when revisiting the app while being logged in. Thanks to Michiel Schukking for continuously poking at my code and finding things like these!_

When a Vue component is updated, it fires it's `updated()` method. We also need to take care of what happens when it's created. We'll add simple `created()` and `updated()` methods which will take care of the redirect:

``` javascript
updated () {
  if (localStorage.token) {
    this.$router.replace(this.$route.query.redirect || '/authors')
  }
},
created () {
  if (localStorage.token) {
    this.$router.replace(this.$route.query.redirect || '/authors')
  }
}
```

We shouldn't be repeating ourselves though, so let's kick the body of those out to a method and call that instead:

``` javascript
created () {
  this.checkCurrentLogin()
},
updated () {
  this.checkCurrentLogin()
},
methods: {
  checkCurrentLogin () {
    if (localStorage.token) {
      this.$router.replace(this.$route.query.redirect || '/authors')
    }
  },
  // ...
}
```

_Note: if you've a keen eye, you will have noticed something wrong with this code. We'll talk about it - please carry on reading for now._

Anyway: if I have a token set and I happen to go to `/`, I get redirected to `/authors`.

### Redirecting to login when not logged in

We definitely do not want to have to check whether we're logged in in every component. We'll have a bunch of them down the line and we might slip up. Besides, that's not very [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself).

There is however one component through which _every_ request must come through: `App`. We can put the kick-you-out logic there.

``` javascript
updated () {
  if (!localStorage.token && this.$route.path !== '/') {
    this.$router.push('/?redirect=' + this.$route.path)
  }
}
```

That's where the `redirect` parameter comes into play: if I go to `/authors` and get redirected to login, after logging in I will continue to `/authors` again - similarly with `/books` etc.

## Closing thoughts

Remember that mistake I talked about earlier, that you might have spotted? It was in this function:

``` javascript
updated () {
  if (localStorage.token) {
    this.$router.replace(this.$route.query.redirect || '/authors')
  }
}
```

Let's do an experiment: I'll open a new incognito window where I have no `localStorage.token` and I have not logged in. I'll go into the developer tools and set it to `nonsense`.

{{< figure src="/media/vue-auth/nonsense.png" link="/media/vue-auth/nonsense.png" >}}

Now let me just refresh, and...

{{< figure src="/media/vue-auth/nonsense_authors.png" link="/media/vue-auth/nonsense_authors.png" >}}

Congratulations to us, we have a huge auth bug! We shouldn't be checking _whether_ the token exists, but _what_ it contains. We will need to pry open the JWT token and see whether it's valid We would have to do that kind of often, though - on pretty much every component update - and that can't be cheap.

It would make a lot of sense if we could store our state somewhere and just look at it every now and again - and change it very rarely. Guess what - that's what we're going to do in the next part, which will focus on storing state with [vuex](https://github.com/vuejs/vuex/).

As always, the code for this part is available on GitHub at [paweljw/bookstore-frontend](https://github.com/paweljw/bookstore-frontend/releases/tag/part-2). See you in [part 4](/2017/10/vue.js-front-end-app-part-4-keeping-state-with-vuex/)!

---

Top image credit: [Gallila-Photo via PixaBay](https://pixabay.com/en/old-church-door-architecture-1341628/) (CC0)

