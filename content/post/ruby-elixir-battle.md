---
date: "2018-05-11T22:00:00+02:00"
title: "Ruby vs Elixir: an API battle royale"
coverImage: /media/race.jpg
tags:
- ruby
- elixir
comments: true
draft: false
twitterTitle: "Ruby vs Elixir: an API battle royale"
---

_"Ruby's dying, man"_, they keep telling me. _"Besides, it's OOP, and that's so 2013, functional programming is all the rage now. Oh, and there's this new kid on the blog, it's called Elixir. It's functional programming for the avid Rubyist!"_

<!--more-->

All right, all right, ladies and gentlemen, please stay your commenting blades. As you might have discerned from the _very first sentence_ in this intro, I'm joking about Ruby dying. But I'm not joking about Elixir and functional programming.

Since you hang around here, I'm tempted to assume you have more than a passing familiarity with [Ruby](/tags/rails). Or with front-end JavaScript frameworks such as [Vue.js](/tags/vue.js). Or [electronics](/tags/electronics). Or maybe you get your kicks tackling weird [science](/tags/science) questions. Err... okay, will someone throw me a shovel so I can dig myself out of this hole I have so expertly dug for myself?

However whatever brings you to this site, my dear reader, I'm sure we share at least one thing in common: the desire to experiment and explore new and unfamiliar concepts. We like the unknowns, you and I. And until just a couple of months ago, functional programming was one such unknown I wanted to explore.

# And what the heck is functional programming?

I guess to start here, we'll need a little bit of a story time. You see, I originally come from an imperative programming background. I moved on to object-oriented programming after that, and in my mind that was the next logical step. I can have my imperative "things", but now they are neatly stashed away in classes with single responsibilities. Over the years I've been around a few Rails shops and I've learned to step out a bit from the general MVC pattern. There'd be Command Objects and Service Objects so our controllers and [models don't grow too fat](https://codeclimate.com/blog/7-ways-to-decompose-fat-activerecord-models/). 

In particular, on the excellent team I have the immense pleasure of working with at [Codest](https://codesthq.com) we've gone full hog on the Service Object. So there'd be `ThisService.call(some, arguments)`. They do, of course, have single responsibilities, and sometimes our objects would need arguments that result from other objects. So sometimes we'd need something like `ThisService.call(ThatService.call(TheOtherService.call(foo)))`.

Now you see - functional programming is a little bit different. The first thing they tell you about functional programming is, of course, _"there are no classes"_. That's usually quite enough to make your average Rubyist balk at the though - heck, it was enough for me to balk at the thought for the longest time. _"What do you mean, there are no classes? But how do I even organize my code? Or my data? Or... anything? YOU PROPOSE UTTER CHAOS SIR"_. This used to be my reaction, almost to the letter! All the while I didn't realise that we were _using a functional programming pattern all along_.

## It's coming from inside the (software) house

The other thing they'll gladly tell you about functional programming is usually _"remember high school algebra, where there'd be `f(x)`? Now, consider `f(g(h(x)))` and there you go."_ And that's the key here: see any similarities to `ThisService.call(ThatService.call(TheOtherService.call(foo)))`?

## What's this got to do with Elixir?

Well, a couple of people seem to agree that the pattern we've been using with Service Objects fits neatly into a functional programming language. But Ruby's not exactly the best language to practice the pattern, with its "everything is an object" philosophy. 

So a bunch of extremely smart people - Jose Valim, whom you might recognize from [Plataformatec](https://github.com/plataformatec), amongst them - decided to build a language reasonably easy to be picked up by a Rubyist, built around the functional paradigm, and _fast_. Ludicrously fast.

They took a technology that was already tried and battle-tested - Erlang - and put a whole bunch of syntactic sugar on top of it that makes it a bit more palatable. Erlang is a compiled language, executed in a VM, and it's designed to make excellent use of multiple processing nodes (CPUs) and available memory. It doesn't come without downsides, however. Just for your reference, Erlang tends to look like this:

``` erlang
-spec loop(Req, Env, module(), any())
  -> {ok, Req, Env} | {suspend, ?MODULE, loop, [any()]}
  when Req::cowboy_req:req(), Env::cowboy_middleware:env().
```

That's taken from the leading HTTP server in Erlang, [Cowboy](https://github.com/ninenines/cowboy/blob/master/src/cowboy_loop.erl#L52), by the way. If this doesn't look confusing to you, you're probably way smarter than I am - congrats on that.

On the other hand, Elixir looks like this:

``` elixir
defp frames(stacktrace, opts) do
  app = opts[:otp_app]
  editor = System.get_env("PLUG_EDITOR")

  stacktrace
  |> Enum.map_reduce(0, &each_frame(&1, &2, app, editor))
  |> elem(0)
end
```

Aside from this weird `|>`, if you're a bit of a Rubyist yourself, I'm pretty sure you've already figured this code out, despite there being some quirks in there.

But I'm sure you're dying to know what that `|>` is. It's... _drum roll_... a **pipe** operator. It works a little bit like the `|` operator in Unix shells. It means "take the output of this expression and put it in the first argument place of the expression we're piping to". To illustrate with our previous example, this would be Ruby:

``` ruby
ThisService.call(ThatService.call(TheOtherService.call(foo)))
```

And this would be Elixir:

``` elixir
foo
|> TheOtherService.call
|> ThatService.call
|> ThisService.call
```

The second is a bit more readable, for me at least. But that alone is not a reason to hop languages, is it?

## The joy of concurrency (or lack thereof)

As I've said before, Erlang is designed to run concurrently - _very_ concurrently if it at all can. Using Elixir, you get all the benefits of Erlang with little overhead. Now, in Ruby concurrency is Hard™️. In web development, we work around this with multi-threaded application servers, offloading some of the issues onto gems like Unicorn or Puma, or putting nginx in front of our apps.

# The battle royale is here at last!

A couple of my associates at [Codest](https://codesthq.com) have decided to teach ourselves Elixir with a couple of side projects, and I've taken a keen interest in the language. I wanted to put Ruby in Elixir in a fair race, performing the same task. And the task itself had to be a varied workload itself: at the very least some disk I/O and some network I/O, and we'll want to read some data from the request. I also wanted to check how the library ecosystem of Elixir holds up, since I'm spoiled by RubyGems. And ideally, the task will be something I might need!

Thus, for this battle royale, the task at hand will be serving a JSON API that will take the incoming request's remote IP, hit the [MaxMind GeoIP2](https://dev.maxmind.com/geoip/geoip2/downloadable/) database (read from local disk) to read the country's ISO code and return that.

## Ruby tech choices

On the Ruby side we'll be running our service over [Unicorn](https://rubygems.org/gems/unicorn) - an application server I've learned to love and respect over the years, and of course there'll be [Rack](https://rubygems.org/gems/rack) underneath it. As for MaxMind database reading, there are a couple of options; I've chosen the [hive_geoip2](https://rubygems.org/gems/hive_geoip2) gem. I've worked with it in the past, its API is fine and its Ruby bindings to `libmaxmind` are top-notch.

## Elixir tech choices

I'll freely admit that I'm much less knowledgeable about the Elixir package ecosystem than I am about Ruby's. However during my somewhat cursory research it appears that the basic stack for an HTTP API server would be [cowboy](https://hex.pm/packages/cowboy) as the app server, [plug](https://hex.pm/packages/plug) as the router / glue and [poison](https://hex.pm/packages/poison) as the JSON encoder. On top of that, we'll be running the only adapter that is officially recognized by MaxMind, [geolix](https://hex.pm/packages/geolix).

## The code

The code for the Ruby side of things is available at [paweljw/geoip-unicorn](https://github.com/paweljw/geoip-unicorn), and the code for the Elixir side is available at [paweljw/unicorn-elixir](https://github.com/paweljw/geoip-elixir).

# Testing methodology

For now, we'll stick to the basics. Both sides will be ran through the [httperf](https://github.com/httperf/httperf) webapp benchmarking tool. Both the scanner and the service will be running on the same machine - a 2013 MacBook Pro with a 4-core i7 and 8GB of RAM. For the purposes of this post, we'll re-run this test 10 times and there'll be no special preparation steps done to the Mac - it hasn't been restarted for days, it's not the only workload running and there may or may not be a Safari instance running Neflix on there. 

This is by no means a scientific test - that'd ideally run in a cloud environment which better simulates what we might encounter in production. What we're interested in right now is: is there even a difference between those two implementations, one which I would hope is pretty decent and one which is probably as close to naive as they come?

Should you want to try and reproduce my results (and I encourage you to!), here are the httperf commands I ran:

``` bash
httperf --server localhost --port 9090 --num-conns 15000 --hog --timeout 1 # Ruby
httperf --server localhost --port 4000 --num-conns 15000 --hog --timeout 1 # Elixir
```

# The results

For the 10 tests I ran, the results are:

* Elixir: 1932.7 successfull requests per second, 0 failed requests
* Ruby: 1090.8 successfull requests per second, 0 failed requests

# The verdict

I have to admit, those results did flare up my imagination. If achieving twice the requests per second of finely-crafted Ruby was possible with a naive, tutorial-based implementation of the same thing in Elixir, I want to know more!

However, I freely admit that my testing was not scientific in the slightest, and that a MacBook running who-knows-what is hardly representative of anything, much less of a cloud server - which is what I'd be interested in running.

Thus it seems that we have our work cut out for us for another test: we should deploy both those implementations to the cloud and _then_ compare them. Nevertheless, I'll admit my interest was piqued by Elixir. We'll be performing those cloud tests (and looking at what exactly went into those two implementations) very soon. Until then - if you can get me any more experimental data, please do! I'll catch you in the comments section.

---

Top image credit: https://pxhere.com/en/photo/1223175 (CC0)