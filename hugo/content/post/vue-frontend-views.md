---
date: "2018-01-06T00:00:00+02:00"
title: "Vue.js front end app, part 5: Data presentation"
coverImage: /media/magnifying-glass.jpg
tags:
- follow me
- javascript
- es6
- vue.js
- vue-frontend-series
- vuex
comments: true
draft: false
twitterTitle: "Vue.js front end app: Data presentation"
---

New year, new ~~you~~ blog post! In this long overdue part we'll strengthen our command of loading data from the server and take a look at presenting it.

<!--more-->

<details>
  <summary>_This series is composed of multiple articles! Click here for a table of contents._</summary>

  * [Part 1: Setting up the app](/2017/09/vue.js-front-end-app-part-1-setting-up-the-app/)
  * [Part 2: Design is (not) hard](/2017/09/vue.js-front-end-app-part-2-design-is-not-hard/)
  * [Part 3: Authentication](/2017/09/vue.js-front-end-app-part-3-authentication/)
  * [Part 4: Keeping state with Vuex](/2017/10/vue.js-front-end-app-part-4-keeping-state-with-vuex/)
  * Part 5: Data presentation
</details>

## Plan of attack

When we finished our login process last time, we've ended up with something looking roughly like this:

{{< figure src="/media/vue-views/last-time.png" link="/media/vue-views/last-time.png" caption="Last time, on Shenanigans..." >}}

The obvious problem with this image is: it's still not a bookstore! Unbelievable, right? After four whole articles. Well, time to do something. This time:

* We'll add the display of authors and books,
* We'll add a search,
* And we'll up our design game with Bootstrap.

One more note before we begin: contrary to what I usually try to achieve, this is not a definitive guide with "the right approach" to doing something. Instead consider this post a collection of doing things in different manners - they just happen to be in the same project. Normally this would constitute a symptom of lax coding standards or code reviews, and both the code and approach can and will feel somewhat disjointed here and there in this post.

So, if you spot the seams - good job! And regardless, consider this an experiment. As always I think we can all learn something here 😄

## Laying out the authors

First we need to get requests routed to some component that will act as an author "index". We've done this before - a simple change in [src/router/index.js](https://github.com/paweljw/bookstore-frontend/blob/part-5/src/router/index.js#L19) will suffice:

``` javascript
import AuthorsList from '@/components/Authors/List'

// ...

{
  path: '/authors',
  name: 'Authors',
  component: AuthorsList
},
```

I've decided that I want the components dealing with authors in `src/components/Authors`. Further down the line, if I get a whole lot of components (and need to do a whole lot of importing) I can just `import * from '@/components/Authors'` and refer to those like `Authors.List`.

Let's take a look how the Authors/List component is put together.

### Designing the list of authors

You can take a look at the complete file in [src/components/Authors/List.vue](https://github.com/paweljw/bookstore-frontend/blob/part-5/src/components/Authors/List.vue). We'll be dissecting it part by part here.

Let's see what's in our template this time.

``` html
<template>
  <div>
    <div class="page-header">
      <div class="float-right">
        <input type="text" name="search" v-model="search" placeholder="Search..." class="form-control"></input>
      </div>
      <h1>All authors</h1>
    </div>
    <div class="row">
      <Box v-for="author in authors" :key="author.id" :author="author" v-show="searchMatch(author.name)"></Box>
    </div>
  </div>
</template>
```

Going top-to-bottom, there's a pretty standard Bootstrap page header bar, with a search box tucked into it. The usual use case for search functions is "search, then scroll through search results", so ensuring that the search bar stays prominently on top at all resolutions is important. We can also note that the input field is wired to a `v-model` variable. We now know that we'll have a `data` section entry called `search` in our component script and that Vue will take care of updating this for us.

Next large part is a list of authors. There'll be an `authors` property in the script. The list is keyed (with the `:key` directive) on `author.id`. We can expect that this ID is the server-side one coming from our database. It's very important for performance reasons that a `v-for` directive comes with a `:key` at all times - try to remember that!

Speaking of performance, we've got our first glimpse into what our search does - it only displays these authors that match the current search (checked via the `searchMath` method). But why is this `v-show`? Wouldn't `v-if` work just as well?

`v-if` removes the element from the DOM completely while `v-show` just hides it. This is very important if you're trying to "hide" something and not have it visible with e.g. Developer Tools in a browser. Another interesting difference is that while `v-show` - by virtue of keeping the DOM element in the DOM - retains the component instance, while `v-if` will destroy the instance as soon as it goes `false`, and create it yet again when it flips `true`. The decision to use `v-show` here is important for this exact reason - we'll see why in just a simple while.

What else is in this template? Not much, actually - the list is composed of components called `Box`, with a parameter of `author` being passed to it. We'll figure out where `Box` is and what's going on under the hood from the script.

``` javascript
import Box from './Box'

export default {
  name: 'List',
  data () {
    return {
      search: '',
      authors: []
    }
  },
  created () {
    this.$http.get('/authors')
        .then(request => this.buildAuthorList(request.data))
        .catch(() => { alert('Something went wrong!') })
  },
  methods: {
    buildAuthorList (data) {
      this.authors = data
    },
    searchMatch (authorName) {
      return authorName.toLowerCase().match(this.searchRegExp)
    }
  },
  computed: {
    searchRegExp () {
      return new RegExp(`(.*)${this.search}(.*)`)
    }
  },
  components: {
    Box
  }
}
```

We can note that the `Box` component also lives under `Authors` - now we know where to go look for it. The `data` section indeed has slots for the `authors` and `search` variables, as we expected from analyzing the template.

In the `created` callback we see a single AJAX request for all the authors, which calls out to `buildAuthorsList` - a very simple and probably slightly unnecessary method - on success. On error it shows an `alert`, which is probably not something you want to do in production, but in development it's just fine.

We can also see that the `searchMath` just checks the given `authorName` against a regexp which is regenerated every time `search` changes. Therefore we can see that the search is purely front-end based.

For a production grade application:

* We'd probably paginate the authors collection on the server side and employ some kind of "next page" button or infinite scroll,
* We'd also probably farm the search off to the server side,
* And finally, we'd probably want to add some sort of indication to the user that the page is "doing" something - some kind of throbber, progressbar or the like.

### What's in the `Box`?

Now that we have `List` thoroughly figured out, we can take a look at [src/components/Authors/Box.vue](https://github.com/paweljw/bookstore-frontend/blob/part-5/src/components/Authors/Box.vue).

As previously, let's dig into the template first:

``` html
<template>
  <div class="col author text-center">
    <router-link :to="{ name: 'Author', params: { id: author.id } }">
      <img :src="image"></img>
      <p>{{ author.name }}</p>
    </router-link>
  </div>
</template>
```

Huh. That's pretty sparse, isn't it. There's one `router-link` that tells us we'll need to dig a little deeper still to get a complete look at authors. There's one image with it's `src` attribute bound to some variable or computed property, and there's a call to display `author.name`. We can also note that the CSS class `author` looks custom, so there's probably a `<style>` part to this component, but there's nothing there otherwise.

Hold on just a second, though. I don't remember adding an image property to the backend representation of author. It's also not clearly coming off of just `author.image`. What's going on? Let's look at the script.

``` javascript
export default {
  name: 'Box',
  props: ['author'],
  data () {
    return {
      image: `http://via.placeholder.com/200x200?text=${encodeURIComponent(this.author.name)}`
    }
  },
  created () {
    this.pullImage()
  },
  methods: {
    async pullImage () {
      const response = await fetch(`http://api.duckduckgo.com/?q=${encodeURIComponent(this.author.name)}&format=json&pretty=1`)
      const json = await response.json()
      if (json.Image) {
        this.image = json.Image
      }
    }
  }
}
```

Hel-_lo_ there. It seems that most of what this component does is pull an image! But how does it do it?

We can see that the default value for image is a placeholder image from [placeholder.com](https://placeholder.com). It's one of my favourite tools when I'd like a placeholder in a particular size, color, and with specified text, but don't feel like whipping up a gazillion of images in Photoshop or other graphics program. I recommend you look at it.

Some more fun stuff gets done in `pullImage`. Right off the bat we can see it's declared [`async`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function). That's a neat way to clean up a method relying on AJAX calls or any other asynchronous behavior. As you can see, we `await` a fetch, and then wait for it's results, without building a "callback christmas tree".

But what are we actually pulling? I'm an avid user of the [DuckDuckGo](https://duckduckgo.com) search engine. Aside from providing non-tracking search, they expose an [Instant Answers API](https://duckduckgo.com/api). On a theoretical level, it works similarly to the little box Google displays when you search for someone or something it "knows" about - this API powers a similar function in DuckDuckGo.

The important thing for us is - when you ask the API about someone of some celebrity, it will usually return an `Image` entry in it's JSON output. We don't have the capability to store images on the backend, so we put in a sort of a "smart placeholder": we either use an actual placeholder, or an image that DuckDuckGo provides.

And that's why author search is using `v-show`. Since this request happens when `created` happens, every time you type something into the search bar `v-if` would recreate components, spawning a series of requests to DuckDuckGo. While I haven't encountered any instance where I would be rate-limited into oblivion for hammering the API, doing that is simply not nice to both DDG and our user; after all we're using _their_ bandwidth for said hammering.

Let's shoot a quick look at the style section, too:

``` html
<style lang="scss" scoped>
.author {
  min-width: 260px;

  img {
    object-fit: cover;
    width: 100%;
    height: 260px;
  }
}
</style>
```

Since we don't know what image size the API will return - and it returns sizes best described as "assorted" - we use `object-fit` directive to fill the available space and the expense of trimming the image. We also say that our image boxes are "at least square" and 260x260px in size, with the possibility of growing sideways as needed. And that might be required due to how Bootstrap uses flex directives.

### Single author

We've noticed that a `router-link` is present in an author box. It's a named route called `Author`, so we can take a peek into our router:

``` javascript
import SingleAuthor from '@/components/Authors/Single'

// ...

{
  path: '/authors/:id',
  name: 'Author',
  component: SingleAuthor
},
```

So evidently what we're looking for is in [src/components/Authors/Single.vue](https://github.com/paweljw/bookstore-frontend/blob/part-5/src/components/Authors/Single.vue). Let's take a look at the template.

``` html
<template>
  <div class="row">
    <div class="col-12 col-md-3 border-right">
      <Box :author="author" v-if="author"></Box>
    </div>
    <div class="col-12 col-md-9">
      <List :author="author" v-if="author"></List>
    </div>
  </div>
</template>
```

Just a couple of interesting bits. The `v-if` rendering guard will make sense in a bit. We can however see that we're referencing `List` again. Now, remember that we're not in the author list anymore, so I have a strong suspicion that we're not, in fact, using `Authors/List` here. Let's see if we can confirm this by looking at the script.

``` javascript
import Box from './Box'
import List from '@/components/Books/List'

export default {
  name: 'Single',
  data () {
    return {
      author: null
    }
  },
  created () {
    this.$http.get(`/authors/${this.$route.params.id}`)
        .then(request => { this.author = request.data })
        .catch(() => { alert('Something went wrong!') })
  },
  components: {
    Box,
    List
  }
}
```

And there it is: this `List` references `src/components/Books/List.vue`. In a project where we expect somebody else working on it, this would probably be a no-no. We can alias this `List` as e.g. `BooksList` and be more explicit about what we're doing here that way.

The script also explains the `author` render guard made with `v-if`. When the component first loads, we don't have any data about a particular author, instead of rendering it. Since this is a component that is not directly tied to the `authors` list we pulled for the index, we can't depend on it.

That way we're also prepared for a situation where the backend returns different data about authors in the CRUD index and show actions, e.g. attempting to decrease the size of the initial index request by returning just the author's name and ID. This is something that would make perfect sense in a production, high-traffic environment, and we should always to decouple our frontend in such a way that code using different API endpoints doesn't share too many assumptions.

Going back to the code, we already know what `Box` does - it's just an author box. Let's dig into the book list.

### Displaying books for an author

Let's peek into [src/components/Books/List.vue](https://github.com/paweljw/bookstore-frontend/blob/288939193acc7116b963e0e56ea9754a2ed05c32/src/components/Books/List.vue). We'll take a slightly different approach here and just look at the whole code file at once:

``` html
<template>
  <div>
    <div class="page-header">
      <div class="float-right">
        <input type="text" name="search" v-model="search" placeholder="Search..." class="form-control"></input>
      </div>
      <h1>Books by {{ author.name }}</h1>
    </div>
    <div class="row">
      <Box v-for="book in books" :author="author" :book="book" :key="book.id" v-show="searchMatch(book.title)"></Box>
    </div>
  </div>
</template>

<script>
import Box from './Box'

export default {
  name: 'List',
  props: ['author'],
  data () {
    return {
      search: '',
      books: []
    }
  },
  created () {
    this.$http.get(`/authors/${this.author.id}/books`)
        .then(request => { this.books = request.data })
        .catch(() => { alert('Something went wrong!') })
  },
  methods: {
    searchMatch (bookTitle) {
      return bookTitle.toLowerCase().match(this.searchRegExp)
    }
  },
  computed: {
    searchRegExp () {
      return new RegExp(`(.*)${this.search}(.*)`)
    }
  },
  components: {
    Box
  }
}
</script>
```

And I guess you can see why already: because it's extremely similar to the authors list. In fact, on a conceptual level it's entirely identical: replace author box with book box and searching in author names with searching in book titles. It's almost like its a lazily copy-pasted and lightly reworked author index component. Which of course

But I have an idea how we can make it better. Smarter. We can rebuild him. We have the technology!

_Ahem._ Anyway: let's enhance this books listing!

## Books list v2: Revenge of the Sidebar

If you'll recall, in our design episode we came up with something like this for our book page:

{{< figure src="/media/vue-views/book-wireframe.png" link="/media/vue-views/book-wireframe.png" >}}

I have to admit, I no longer like this design. However, there's a saying in Polish which translates roughly to "only a cow does not change it's mind". The ridiculousness of the phrase being coined by a nation so stubborn it probably measures on the Richter scale aside, it's a good one.

If you don't like it and you designed it, change it. If someone else designed it or is implementing your design, talk to them first, then change it together. (Sometimes the best part about working alone is the complete lack of meetings. And sometimes it's the worst.)

I think we can get away with something like this:

{{< figure src="/media/vue-views/new-book-wireframe.png" link="/media/vue-views/new-book-wireframe.png" >}}

The reason for this is we now know we have much less information about a book than we used to think we would. No blurbs - certainly not enough to fill the space in the original design. (No author blurbs either, but it doesn't look to bad without them).

There's one more nice thing about this. Since our information about a book is so sparse, and we already have all of it loaded on the index view, we can get away with not making yet another AJAX request to our backend. Instead we'll do it all with frontend magic, elbow grease and duct tape!

### Splitting it three ways

We're already using `row` from Bootstrap, so we can delegate the work of making a nice split view to it. Barring any special directives, `row` splits it's `col`s equally, and they can be nested.

We'll need to update the template for [src/components/Books/List.vue](https://github.com/paweljw/bookstore-frontend/blob/part-5/src/components/Books/List.vue) slightly:

``` html
<template>
  <div>
    <!-- ... //-->
    <div class="row">
      <div class="row col">
        <Box v-for="book in books" :author="author" :book="book" :key="book.id"
          v-show="searchMatch(book.title)" v-on:click.native="setBook(book)"></Box>
      </div>
      <Full :book="currentBook" v-if="currentBook" v-on:close="closeBook"></Full>
    </div>
  </div>
</template>
```

That way we have two nested `row`s. Our book list and the new `Full` component will split one between themselves. By default `currentBook` is `null`, so the `Full` component will not be shown.

We'll also attach a _native_ click event to every book in the list. It's slightly complicated, but the short of it is - if you really need to register a click the "regular DOM way", it's better to attach it to the top element of a component via the `native` directive for `v-on`.

Once the book is set, `Full` springs to life. It's mostly based on Box, and you can just look up [src/components/Books/Full.vue](https://github.com/paweljw/bookstore-frontend/blob/part-5/src/components/Books/Full.vue) on GitHub, but we'll take a look at one interesting excerpt.

We have means to open a new book via the `click` event, but we'd like to also close it. You might remember, however, that the flow of data in Vue is one-directional. This means that we can't reach from `Full` into `List` and just unset `currentBook`. The right way for this is to emit an _event_ that the parent can listen for.

In the `Full` component we achieve it like so:

``` html
<template>
  <div class="col book text-center">
    <button class="btn btn-light btn-close" v-on:click="close">&times; close</button>
    <!-- ... //-->
</template>

<script>
export default {
  // ...
  methods: {
    // ...
    close () {
      this.$emit('close')
    }
  }
}
</script>
```

Every instance of a Vue object comes with a `$emit` method. In the parent we can just listen for this custom event with `v-on` on the component element as can be seen above.

## Conclusion

We've written a lot of code and covered a lot of ground in this post. We've looked at components, we've used props and events to pass data around and we've played a bit with Bootstrap. In all, we've got ourselves something decently presentable for a learning project:

{{< figure src="/media/vue-views/finish.png" link="/media/vue-views/finish.png" >}}

As always, the recommended reading is the documentation, particularly the [Components](https://vuejs.org/v2/guide/components.html) section. Any things that I might have ommited here for brevity (if we can even speak of brevity at this length) are sure to be found there.

As per usual, the full code for this part can be found over [on GitHub](https://github.com/paweljw/bookstore-frontend/tree/part-5).

In closing, I'd like to thank Y. K. whose kind contribution to this blog helped put things in perspective and start the new year off on the right footing. And thank you, dear readers and commenters, for helping make me a better coder and writer!

Happy 2018, and see you in the next one, where we'll finally do some data editing!

---

Top image credit: 
Maurício Mascaro via https://www.pexels.com/photo/person-holding-magnifying-glass-712786/ (CC0)