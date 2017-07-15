---
date: "2017-07-11T15:26:57+02:00"
title: "Rails 5.1 API with Vue.js frontend, part 1: Setting up a Rails API app"
coverImage: /media/rails.jpg
tags:
- javascript
- es6
- saturdayproject
- follow me
- rails
- api
comments: true
draft: false
---

It's time to continue with our foray into Rails API app with Vue.js frontend! In [Part 0](/2017/07/rails-5.1-api-with-vue.js-frontend-part-0-stack-choices/) we discussed what technology we'll be using and why - I highly recommend you read through it if you haven't already. Now it's time to get our Rails on.

<!--more-->

_This is an onging series of articles. It's highly recommended you start with [part 0](/2017/07/rails-5.1-api-with-vue.js-frontend-part-0-stack-choices/)!_

# Installing the right version of Rails

Since we've decided to use Rails 5.1, that's what we should get. If you don't have it already,

```
gem install rails -v '~> 5.1'
```

should do the trick.

# Setting up a Rails API app

Let's look at the command first and pick it apart later:

```
rails new bookstore-backend -T --skip-spring -C -M -d postgresql --api
```

Whew! That's a mouthful. Let's see about all those switches.

* `-T` amounts to skipping the builtin testing framework. We'll test our API with something other than MiniTest, so let's drop it for now.
* `--skip-spring` removes Spring from our application; that's a personal preference. If you don't know what [Spring](https://github.com/rails/spring) does and whether you should remove it, I urge you to find out and decide for yourself.
* `-C` skips Action Cable. No web socket communication for us!
* `-M` skips Action Mailer, which wouldn't be of any use to us.
* `-d postgresql` of course sets us up for the PostgreSQL database.
* `--api` - now we're talking! This runs the Rails generator in the API mode, which sets us up for reading and writing JSON instead of pumping out HTML.

Now we can run `tree` on this new app, and... wow! When you compare that to a regular Rails app, this is really barebones. But we can trim this up a bit more:

* An `app/jobs` directory was generated for us. We know that there will be no jobs in this application for the foreseeable future, so we can drop that.
* There are four initializers that are commented out by default: `backtrace_silencers.rb`, `application_controller_renderer.rb`, `inflections.rb` and `mime_types.rb`. We may as well remove those.

One of the initializers will come in handy, though: `cors.rb`. We can uncomment what is already there and modify it to accept all origins:

``` ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch('ALLOWED_ORIGINS') { '*' }

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
```

This will make us happy campers in development, and allows us to set it properly for production - when we will know where our front-end lives. As a side note, simply allowing `*` would also be fine if we were going to call our API from e.g. a mobile application.

To use this, we need to uncomment `rack-cors` in the Gemfile.

# Setting up the database

As we've said in Part 0, we'll use [Docker](https://docs.docker.com/compose/install/) to isolate our services in development. The easiest way to do this is by far with Docker. Messing around with images by themselves can be a bit cumbersome though, so we'll use `docker-compose` for that. If you don't have Docker installed yet, now is a great time to click that link and get it.

When we have `docker-compose` ready, we can just drop a file called `docker-compose.yml` in the root of our application, set up like this:

``` yaml
postgresql:
  image: postgres:9.6
  ports:
    - 5432:5432
  environment:
    - PGDATA=/postgresql
    - PG_PASSWORD=our-awesome-bookstore-app
  volumes:
    - ./tmp/data/postgresql:/postgresql
```

This will set up a container with PostgreSQL 9.6, connect it's port 5432 to our localhost and set up a password on the database. We can run it using `docker-compose up` in the front, or `docker-compose start` as a daemon. Don't forget to stop it when you're done! I keep forgetting, so I prefer to run mine in the foreground.

Now we just need to point our Rails app to this instance of PostgreSQL in development and test environments. Our `database.yml` may look something like this:

``` yaml
default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>

development: &development
  <<: *default
  database: bookstore-backend_development
  username: postgres
  password: our-awesome-bookstore-app
  host: localhost

test:
  <<: *development
  database: bookstore-backend_test

production:
  url: <%= ENV['DATABASE_URL'] %>
```

You might notice some peculiarities. For example, we've created an alias `&development` and are running our `test` environment off of it. That makes sense, since the only thing we want to differ for the tests is the database they use - they should still hit Docker. Also, we've already set up a production environment and made it use `DATABASE_URL`. This is how we'll set it up on Heroku.

As a side note - almost everyone has probably at some (early) point in their career committed credentials to a repository. Most of us probably got chewed out for it. So why are we comfortable doing this for our development and test environments? Simple - the database only exists on our machine and doesn't talk to the outside world. Of course we would never put production creds in a repo.

All right, let's hit it:

```
bundle install
bundle exec rails db:create
bundle exec rails db:migrate
bundle exec bin/setup
```

Note that in Rails 5 we went to using the `rails` CLI tool rather than Rake. After several years of using `rake`, this will probably keep tripping me up for a little while longer :)

If everything went well, our database should be set up!

It might seem like we don't have all that much - but what we have is a very powerful environment to _model reality_ in. We will do exactly that in [part 2](/2017/07/rails-5.1-api-with-vue.js-frontend-part-2-modeling-reality/).

---

Top image credit: https://www.pexels.com/photo/industry-rails-train-path-481150/ (CC0 Public Domain)
