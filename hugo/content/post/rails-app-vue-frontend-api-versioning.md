---
date: "2017-07-18T15:00:00+02:00"
title: "Rails 5.1 API with Vue.js frontend, part 3: API versioning"
coverImage: /media/forking.jpg
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

We have two more things to tackle before our Rails API app is an MVP: namespacing the controllers and creating an authentication mechanism. We'll tackle namespacing the controllers in this article - it might seem wordy, but it's for a good reason.

<!--more-->

_This is an onging series of articles. It's highly recommended you start with [part 0](/2017/07/rails-5.1-api-with-vue.js-frontend-part-0-stack-choices/)!_

# Why namespace the API?

You might ask yourself that, and I get it. I used to ask myself the very same thing. When we're building a regular web app we never namespace anything, so why start now? Consider the following example.

---

You deploy your app and it's a smash hit - takes off almost overnight. You've made it big - you have users now! And they have demands. They want the front end to do so, so much more. You bring a buddy on the project with you - you crank out the back end, he cranks out the front. You hack side by side on weekends, so specifying APIs is done mostly by yelling to each other over pizza boxes. Life is good.

Time goes on. The app is now your day job. The users keep coming, and are now clamoring for a mobile app. You hire two bright kids to work on the mobile app. There's also now two more people on the backend team, and three more are hacking on the front. There is now a formal spec for the API and everyone follows it. There's tweaks to the API all the time, but it mostly just evolves - nothing changes drastically. Life is still good.

Then one day, at a planning meeting, a change request shows up. It doesn't matter what's in it: it means that a fundamental, breaking change will have to be introduced to the API. But your ecosystem is now distributed: you have a front end which may or may not be ready on time for the big release. You also have a mobile install base, which will probably not update in a millisecond. Life is not all that good anymore.

If your API is versioned, this is easy as pie: you create a new namespace, `v2`, under your API root, and all new features and the myriad apps that use the backend will use this new version. When your metrics show that no one hits the old v1 API anymore, you will simply sunset it and remove it from your code. If your API was not designed as versioned from the get go... you will have to do the same - but will suffer way more.

---

In "regular" MVC apps which spit out generated HTML the views are rather tightly coupled with the underlying controllers, and by proxy - with the underlying models. An API consumer is, for our purposes anyway, decoupled completely from our app. The consumer might be anything: a JS single page app, a mobile app, a desktop app, or maybe even a bot. We don't care what consumes the API as long as it behaves how we expect it to: reads the right fields, provides the right parameters. Similarly, our consumers don't care whether our backend is in Rails or we just rewrote it in Node (_*shudder*_), as long as it still speaks the same language.

It can then be inferred from the above that by providing an API, we create a contract to uphold with all these different consumers of our code. We certify that our service will work in predictable ways when provided expected inputs. We may expand on what is already there, but we shouldn't break backwards compatibility *implicitly*.

The v1 `books` endpoint will always serve books, with titles and author names. It may expand: we may start serving images of covers, for example, at some later date. This is fine: a consumer which uses just the title and author name will still work just fine, and newer consumers may also use the image. What is important that *the basic fields and structure hasn't changed*.

However, if we decided that `/books` should now be served under `/książki` (which is the Polish word for books), that is a good reason to release a new version of the API. If you're hanging around the Ruby gems ecosystem (and since we're talking Rails here, I sure hope you do), you probably know about [semantic versioning](http://semver.org/). The very same principle applies to APIs - you just have only the major version. If you want to break something - bump the major version and let consumers adopt it at their preferred rate.

# Namespacing our API

It's actually pretty straightforward. We need to change our routes:

``` ruby
namespace :api do
  namespace :v1 do
    resources :authors do
      resources :books
    end
  end
end
```

Then move our controllers into `app/controllers/api/v1`, so that we keep with the Rails convention.

```
app/controllers
├── api
│   └── v1
│       ├── authors_controller.rb
│       └── books_controller.rb
├── application_controller.rb
└── concerns
```

And finally, namespace the controllers themselves:

``` ruby
module Api
  module V1
    class AuthorsController < ApplicationController
      # ...
    end
  end
end
```

Now when we need to provide a non-backwards-compatible version of `AuthorsController`, we simply create a new module:

``` ruby
module Api
  module V2
    class AuthorsController < ApplicationController
      # some non-compatible changes
    end
  end
end
```

But what about the controllers that do not change? What if just the `AuthorsController` changed, but the `BooksController` is just fine and dandy, and should just be the same?

This could be approached from a couple of different sides, I think. I find that doing what seems easiest (and sometimes, even laziest) in Ruby works more often than not. If I was faced with a requirement of providing a V2 `BooksController` that was exactly identical to V1, I'd probably do something like this:

``` ruby
module Api
  module V2
    class BooksController < Api::V1::BooksController; end
  end
end
```

Of course, this means that when we phase out V1 completely and drop the now-dead code, this file will have to change. It could be argued that this would be confusing e.g. during code review - "why does this V2 thing change if all we're doing is kill V1?". Phasing out V1 is now no longer a matter of deleting `app/controllers/v1` and updating routes, too. However, I believe that code quality is something to be considered right now, so keeping two copies of exactly the same code in the app seems a no-go to me, even if the price is a slightly more complex refactor later.

What do you think about this? Let me know down below, and I'll see you in part 4, where we'll tackle token authentication in Rails!

---

Top image credit: https://commons.wikimedia.org/wiki/File:Line5066_-_Flickr_-_NOAA_Photo_Library.jpg (CC-BY 2.0)
