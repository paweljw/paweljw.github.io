---
date: "2017-09-23"
title: "Vue.js front end app, part 2: Design is (not) hard"
coverImage: /media/design.jpeg
tags:
- design
- frontend
- vue.js
- vue-frontend-series
- follow me
comments: true
draft: false
twitterTitle: "Vue.js front end app: Design"
---

Now that we have our environment running, the app is initialized, and we know a little bit about what's going on in there, it's time to take a little bit of time to design our front end.

<!--more-->

<details>
  <summary>_This series is composed of multiple articles! Click here for a table of contents._</summary>

  * [Part 1: Setting up the app](/2017/09/vue.js-front-end-app-part-1-setting-up-the-app/)
  * Part 2: Design is (not) hard
  * [Part 3: Authentication](/2017/09/vue.js-front-end-app-part-3-authentication/)
</details>

My relationship with web design (as opposed to web development) is of a somewhat... _rotary_ nature. I started by banging out simple web apps (though we called them pages back then) in PHP way-back-when. It was a hobby, so obviously any front end design was also done by yours truly.

Then I got serious about web programming, started researching how other, more professional people did things, looked at what I made and said to myself, _"Wow, isn't that a pile of dung"._ I solemnly swore to myself to leave front end design to people who could do it properly and stick to back end programming.

Well, it turns out that when you're a freelancer you can choose between this attitude and being able to buy food. Solemn oath scrapped, I decided instead to figure out this design beast. Did it work? Maybe. 😀

## What's your story?

There's a saying that goes, "hardly any good story begins with 'this one time I was eating a salad'". Similarly, hardly any good web app begins without a story - a [user story](https://en.wikipedia.org/wiki/User_story) to be exact. So what's that?

> User stories are a type of boundary object. They facilitate sensemaking and communication, that is, they help software teams organize their understanding of the system and its context.

Oh boy. For something that is supposed to "faciliate sensemaking", this description on Wikipedia does not make a lot of sense.

For me, a user story is something straight of an informal (or semi-formal) conversation with your client. When someone says "we'd like X to do Y", that's where a user story starts. It's high level, not very precise and does not concern implementation.

When we're making an app for ourselves - such as this learning project, something one-off for personal use, or the early stages of an open-source project - we're our own users. So it's time to switch hats! Developer hats off, user hats on, everyone:

<center>
	![](https://media.giphy.com/media/vs8k2WVRVfy36/giphy.gif)
</center>

So, user-Paweł, what do you want to be able to do with the app?

* Log in with my user account
* See all the authors
* See all the books by a given author

It's very broad - about what a first meeting with a prospective client might get us - but we can work with that already. We know that we want to have at least three different "screens" in our app, and what they should enable the user to do.

Time for another hat switch - this time to designer-mode.

## Design tools

In the first part of this series I said that you don't need any tools. U stand by that sentence, and am completely confident in it. I started my forays into design without any tools, since they either didn't exist or the price tag was too hefty.

What I'm about to show you are a couple of tools, both free and paid, that are nice to have up your sleeve. Remember, however, that you could to exactly the same with a couple pieces of paper and some color pencils. The tools are only there to speed up the process or work around skills one might lack.

### Color palettes

It's important for any app to have a consistent color scheme and layout. It's thanks to this that a lot of well-known apps can be identified at a large distance. Consider this example:

{{< figure src="/media/vue-design/fb.png" link="/media/vue-design/fb.png" >}}

This is a mockup from [Drew Matthews](http://drewmatthews.ca/projects/facebookPSD/), and not a screenshot. I've even removed the tell-tale brand icon. And yet, you could probably just glance at the image and tell with utter certainty what it's supposed to be.

That's in a large part due to the well known set of colors - the blue navbar, the gray background/sidebar, and the white "wall" in the middle. (Of course the recognizable layout doesn't hurt here.)

When you're thinking about building something professionally, you might want to procure the services of a proper designer. We can build something that looks sensible ourselves, though.

This is the place to admit it - I seemingly lack the part of brain responsible for picking colors that do not clash horribly. I notice when something clashes well enough, but balk at the thought of trying to pick out five colors (your typical web palette size) by hand. Thankfully, there are now tools that can supplant my missing brain-part.

#### Adobe Kuler

One of those tools is [Adobe Kuler](https://color.adobe.com/create/color-wheel/) (which works much better than it is named, and is free).

{{< figure src="/media/vue-design/kuler.png" link="/media/vue-design/kuler.png" >}}

Simple enough: you just grab one of the rings and twist it around until you get something you like. Meanwhile Kuler makes sure your colors stay in the relation to each other that you've specified (in the screenshots it's running in "analogous colors" mode).

{{< figure src="/media/vue-design/kuler2.png" link="/media/vue-design/kuler2.png" >}}

One of the problems I have with it is that it's pretty hard to compare what the colors would look like with your preferred background. It's also clearly not built with "modern web" in mind specifically, since it's hard to get it to produce a nice set of pastels. It likes its colors vibrant and that's it.

The way I usually use it is to pull the colors out, throw them into Photoshop or a similar graphics program onto a background color I want to use for the app, and then play with e.g. saturation until I'm satisfied.

#### Coolors

Another tool with a name that makes me cringe slightly, but works well enough and is also free, is [Coolors](https://coolors.co). This is geared more towards people like me, who don't really know what they want or how to get there.

{{< figure src="/media/vue-design/coolors.png" link="/media/vue-design/coolors.png" >}}

It's dead simple: you press the spacebar and it generates another set of colors. See something you like? Click the lock, and that color stays while other keep getting randomized. You can export the palette as PDF or SCSS, which comes in pretty handy (for either Photoshop or web work). Each combination is also identified with a GUID-style URL for sending to people e.g. for approval.

As with all randomness-based tools, it can take a while to get something you like. On the plus side, it can also make you consider palettes and colors that would not cross your mind normally. I actually quite like the palette in the above screenshot, and I'm dead sure I wouldn't come up with it on my own.

#### ColorPalettes.net

Not a tool, but a fine source, is [colorpalettes.net](http://colorpalettes.net).

{{< figure src="/media/vue-design/cpnet.png" link="/media/vue-design/cpnet.png" >}}

The advantage over Coolors is that these are made by humans. The advantage over Adobe Kuler is that these are made by supposedly _competent_ humans. The downside is that - even though it's an absolutely massive library - we might not find something that "feels" right and fits with the theme we're going for. No thornless roses, I guess.

### Mockup tools

Mockups are important. They're a low-cost (cost being expressed in time here) way to show your client what the thing they want might look like without writing a single line of code.

It also ropes the client into the design process. Over the years I've had numerous clients - probably 90% of them, in fact - who've said that they don't know what they want and it's totally up to me. When presented with a mockup, however, it often turns out that they _do_ know what they want, and it's invariably something _else_. 😒

If the mockup was in code, I'd then spend a bunch of time wrangling it into what the client said they want, and then probably would have to do it three or four times more. On a good day, of course. And when it was finally done, it'd probably be such a bunch of kludges and spaghetti that I'd have to look at it from the outside - kind of like a picture - and re-do all the code so that it's maintainable. It follows that it'd be easier to actually _start_ with a picture.

#### Balsamiq Mockups

[Balsamiq Mockups](https://balsamiq.com/products/mockups/) is a tool I've grown quite fond of in the past year and a half. It features a ton of components, drag-and-drop design, and a hand-drawn style which I find appealing.

Here's a quick one done with Mockups (in about 30s, too):

{{< figure src="/media/vue-design/pjwm.png" link="/media/vue-design/pjwm.png" >}}

The downside, of course, it's that Balsamiq Mockups cost a chunk of cash, coming in at $89 for a license at the time of writing. Also I'm certain that it's style will not appeal to everybody, whether that means you or a client. As with everything I present here, your mileage may vary (in this instance, a lot).

#### Pencil and paper

While decidedly low-tech, I'm 100% serious on this one. Sure, it'll lack features like exact 1:1 matching with the color scheme you chose - unless you have a kick-ass set of 16+ million colored pencils, in which case - send pics! It's also heavily dependent on your ability to draw for some more complicated elements. It is, however, perfectly viable. I hardly ever do that except for some personal projects, since my hand drawing ability is sub-par and I wouldn't feel comfortable presenting things done that way to a client.

## The actual design

That intro was lengthy, wasn't it? Let's get cracking on the actual design now. I'll be using some of the tools mentioned above - let's see what we get.

Just for a reminder, here's what user-Paweł wanted:

> * Log in with my user account
> * See all the authors
> * See all the books by a given author

### Color palette

This usually comes first, at least for me. Here's a nice one from Coolors:

{{< figure src="/media/vue-design/palette.png" link="/media/vue-design/palette.png" >}}

Expect those colors to keep popping up over and over again.

### Login page

So here's what I've whipped up in Mockups:

{{< figure src="/media/vue-design/login1.png" link="/media/vue-design/login1.png" >}}

I'm not sure about the colors, though. I have more primary colors in my palette that I could use.

Thankfully we have alternative versions of every mockup in Mockups that we can use here to keep multiple versions of the sketch for the login page alive.

{{< figure src="/media/vue-design/alternate.png" link="/media/vue-design/alternate.png" >}}

Let's see how it looks in a different color then:

{{< figure src="/media/vue-design/login2.png" link="/media/vue-design/login2.png" >}}

I can't decide which one I like. But that's fine; sometimes a mockup doesn't answer all your questions. And that's the whole point, really: if it took a couple of minutes to throw together, it's not that much of an issue if it's a throwaway. And besides, Bob Ross likes it:

![](https://media.giphy.com/media/1FXYMTuKX91hS/giphy.gif)

I agree. Let's just move on.

### General layout

When I'm designing a system with multiple screens that will have some identical elements, such as a navbar, I'll usually create a mockup containing only that, and use it as a template later on. Keep in mind that's good for small components not very likely to change a lot. Simply put, if you create a navbar, use it everywhere, and then need to make a change to it - you're out of luck. Hopefully I won't decide I need to later.

{{< figure src="/media/vue-design/navbar.png" link="/media/vue-design/navbar.png" >}}

### All authors listing

I've played a bunch with various versions of this view, and I came up with this:

{{< figure src="/media/vue-design/all_authors.png" link="/media/vue-design/all_authors.png" >}}

It's not what I'd normally do - I wasn't a fan of the tile menu design when Windows 8 did it, and I'm still not very fond of it. Since this is something like a storefront, however, I guess it makes sense to put all our goods on display.

You might remember that we do not have support for any images in our backend - neither for authors nor for books. That's all right. We'll figure out something cool we can put in instead while we're developing the views.

After all, we could even do [canvas-based graphics](2017/05/saturday-project-alien-generator-in-javascript/) in JavaScript. This'll also give us an incentive to figure out some interesting things later, such as automatically finding images for our authors and books during import, and supporting uploads in the API and frontend.

### Single author's books

Going further into this "storefront" metaphor, I came up with this:

{{< figure src="/media/vue-design/single_author.png" link="/media/vue-design/single_author.png" >}}

It puts the author front and center, so the user really knows what they're browsing. I've included a space for a little blurb about the author. It looks cool on the mockup, but may or may not work in the final design (remember, we don't have a description for books or authors in the backend either). Again, that's okay: we don't have to stick to the mockups 100% when coding the design, at least when we're doing it as a one developer, personal project.

### Single book

{{< figure src="/media/vue-design/single_book.png" link="/media/vue-design/single_book.png" >}}

Driving the storefront point home, and adopting a three-column layout, we get this: author is important, but the book is front and center now, really in-your-face type of UI. There's also space for a book blurb (a signal we should be seriously considering adding these to our backend), and, of course, an "Add to cart" button.

I think we're done here. Now let's package all these mockups and send them off to our imaginary client. My hands hurt from switching hats between user/client, developer and designer so often.

## Design, round 2

Okay, user-client-Paweł-thing, what do you think?

> Hey, designer-Paweł, I've received your mockups and they look great!

Yay!

> There's just a couple more tweaks we need to do before we go ahead.

Uh oh.

> I don't see a space where I could search for an author I like, or to look up a particular book when I know the author. Do you think we could add these before we move along?

Well, stop me if you've heard this one before.

Let me just get something clear here. I'm not trying to sound bitter, nor do I want to go into a whole _"clients never know what they want hurr durr"_ diatribe. Iteration upon designs is a fact of life. It ensures that clients get what they actually want, and I think that's great, since as web developers we're in the business of making dreams happen while performing small miracles on a daily basis.

I am however pretty sure that some seasoned freelancers in the reading crowd will look at the above smiling knowingly, and maybe shed a little tear. It's not the first round of refinements that's troubling and grueling, and not the fifth either, at least for me. But when we enter double digit revisions, it does get a little on my nerves, and I imagine I'm not alone in that.

That being said, while starting the designs for this series and articles I didn't think about search features. I'm my own client for this one - and I _still_ need to make adjustments when I thought I was done! The point here is: this is why we do mockups instead of just hip-shooty coding. I can now adjust my mockups in _minutes_ and then keep chugging happily along.

### Searching for authors

This is simple enough: let's just drop a big fat search bar right in the header!

{{< figure src="/media/vue-design/authors_search.png" link="/media/vue-design/authors_search.png" >}}

We'll probably go low-tech in our first revision for the UI and just filter in JavaScript instead of doing calls to the backend, but we'll see about that. Again: we don't need to decide this right now, this is a mockup.

### Searching for books

Also pretty simple. Push down all the books we have in there and voila:

{{< figure src="/media/vue-design/book_search.png" link="/media/vue-design/book_search.png" >}}

## Informing development from mockups

Now that the client is satisfied with the initial mockups, we can take a look at what the mockups tell us.

First of all, we can figure out what our basic routes will be:

* `/login`
* `/authors` - also the default route after logging in
* `/authors/:id`, synonymous with `/authors/:id/books`
* `/authors/:author_id/books/:book_id`

In the case of this particular project we could have figured that out at least two different ways, of course: from our API routes and - since the app is very simple - by just thinking for a minute 😃 But if we were designing something significantly more complex it wouldn't be all that easy.

You probably remember from the previous post in this series that Vue.js apps are split into nested components. This is where our mockups _really_ shine, since they provide a superb visual aid: we can imagine how to split our app into components - again - before we write a line of code!

### Login

{{< figure src="/media/vue-design/login2.png" link="/media/vue-design/login2.png" >}}

Well, I don't think we'll be doing a lot of splitting here. Any, in fact: it's a single form communicating with a single API endpoint, and then setting state and routing accordingly.

As a side note - squishing logic and view into a single file feels weird and "wrong" to me after observing SRP for so long. I wonder whether any other Rubyists feel the same.

### All authors view

{{< figure src="/media/vue-design/all_authors_components.png" link="/media/vue-design/all_authors_components.png" >}}

Initially we can just split it like this:

* A base container component, where we can mount our router-view for nested routes,
* The `AllAuthors` index view rendered in the container (this will do the AJAX lifting necessary to grab data from the API),
* `AuthorSquare` for each of the authors pulled from the backend,
* `AuthorSearch` to contain the search logic (it will inform AllAuthors of its inputs with events - we'll talk about it when we get to implementing all this).

I also threw the splitup for the navbar on the same screenshot: it'll be a very simple component with possibly one or none subcomponents - I'm not very happy with the UserEmail, since it seems too simple to necessitate its own component.

### Books view

{{< figure src="/media/vue-design/book_search_components.png" link="/media/vue-design/book_search_components.png" >}}

Splitting this view up similarly, we get:

* An `Author` component to mount in our router container,
* An `AuthorFull` component (including author blurb),
* A `BookSearch` bar,
* And a `BookSquare` in the same vein as `AuthorSquare`.

### Single book view

{{< figure src="/media/vue-design/single_book_components.png" link="/media/vue-design/single_book_components.png" >}}

One last mockup to split:

* `Book` component to mount in router container,
* We can reuse the `AuthorFull` component, which is always nice,
* And we get a new `BookFull` component.

Looks like our job is done here! For now.

## Closing thoughts

This post is significantly longer (and took significantly longer to write, too) than I originally thought it would, so I'll keep this short.

All this might seem like wasting time - I know that in the past it would certainly seem like that to me. However we have in fact saved time: the time that we would otherwise spend on writing, rewriting and re-rewriting our code if we started slinging from the hip.

Hopefully you find this selection of tools and techniques useful, and I promise - we'll get back to coding our app in the next post, now that we actually have an idea what we're going to do. See you in part 3!