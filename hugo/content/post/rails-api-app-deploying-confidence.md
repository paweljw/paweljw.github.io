---
date: "2017-07-29T15:00:00+02:00"
title: "Rails 5.1 API app, part 5: Deploying with confidence"
coverImage: /media/launch.jpg
tags:
- saturdayproject
- follow me
- rails
- api
- rails-api-series
comments: true
draft: false
twitterTitle: "Confidently deploying Rails 5 API apps"
---

In this final part of our Rails API app series we'll talk about specs, code coverage, continuous integration and deployment - and how to be certain your application is working.

<!--more-->

<details>
  <summary>_This series is composed of six articles! Click here for a table of contents._</summary>

  * [Part 0: Stack choices](/2017/07/rails-5.1-api-with-vue.js-frontend-part-0-stack-choices/)
  * [Part 1: Setting up a Rails API app](/2017/07/rails-5.1-api-with-vue.js-frontend-part-1-setting-up-a-rails-api-app/)
  * [Part 2: Modeling reality](/2017/07/rails-5.1-api-with-vue.js-frontend-part-2-modeling-reality/)
  * [Part 3: API versioning](/2017/07/rails-5.1-api-with-vue.js-frontend-part-3-api-versioning/)
  * [Part 4: Authentication and authorization](/2017/07/rails-5.1-api-with-vue.js-frontend-part-4-authentication-and-authorization/)
  * [Part 5: Deploying with confidence](/2017/07/rails-5.1-api-app-part-4-deploying-with-confidence/)
</details>

## Testing your app

A lot of people will say: _"You must do <abbr title="Test-driven development">TDD</abbr>! It's the most important thing in the world!"_ It's not the most important thing in the world. It's a useful tool when you're at least decently versed in the problem domain and the technology you're using - when you can reason about what needs to be written _without_ writing it. However when learning, exploring a new domain, or simply hacking, I feel the tests can come after the code. What is imperative is that they do indeed come.

There's a ton of good testing tools for Ruby and Rails. Here's my personal toolbox, which gets installed in almost every project I'm doing nowadays:

* [rspec](https://rubygems.org/gems/rspec) + [rspec-rails](https://rubygems.org/gems/rspec-rails) where applicable
* [Factory Girl](https://rubygems.org/gems/factory_girl)
* [Faker](https://rubygems.org/gems/faker)
* [shoulda-matchers](https://rubygems.org/gems/shoulda-matchers)
* [Database Cleaner](https://rubygems.org/gems/database_cleaner)
* [Timecop](https://rubygems.org/gems/timecop)
* [Simplecov](https://rubygems.org/gems/simplecov)

We'll now go over those one by one, with a concrete example of what it does in the bookstore backend app. The whole setup is a bit too involved for a simple blog post, but you're welcome to take a peek on GitHub at [paweljw/bookstore-backend](https://github.com/paweljw/bookstore-backend)!

### Rspec

Rspec doesn't really need an introduction for most people who have been doing Ruby and Rails for a while. I'd just like to point out what I love the most about Rspec: the [composable examples](https://relishapp.com/rspec/rspec-core/docs/example-groups/shared-examples) and [contexts](https://relishapp.com/rspec/rspec-core/docs/example-groups/shared-context).

We're using both of these features in bookstore tests! Shared examples are great when a lot of behavior is identical between e.g. different contexts in one spec, or even between different specs. In the bookstore, the GET parts of the REST API behave the same whether you're an admin or not, so I extracted these to a shared example:

``` ruby
shared_examples 'authors listing' do
  describe 'GET /api/v1/authors' do
    # ...
  end

  describe 'GET /api/v1/authors/:id' do
    # ...
  end
end
```

Then in the specs, I can simply do:

``` ruby
context 'with non-admin user' do
  include_context 'logged in user'
  it_behaves_like 'authors listing'
  # ...
end

context 'with admin user' do
  include_context 'logged in admin'
  it_behaves_like 'authors listing'

  #...
end
```

Which brings us to shared contexts - we're including them above with `include_context`. These are defined like this:

``` ruby
shared_context 'logged in user' do
  let(:user) { create(:user) }
  before { allow_any_instance_of(DecodeAuthenticationCommand).to receive(:result).and_return(user) }
end

shared_context 'logged in admin' do
  let(:user) { create(:user, :admin) }
  before { allow_any_instance_of(DecodeAuthenticationCommand).to receive(:result).and_return(user) }
end
```

Using these contexts, we stub out authentication from our controllers and always return a user. (And we can do this, because the correctness of DecodeAuthenticationCommand is proved with a separate test. When all parts are sound, the app will work).

### Factory Girl

Factory Girls provides an easy way to fabricate "fake" objects in tests, which are much more dynamic than fixtures. The DSL is trivial to use:

``` ruby
FactoryGirl.define do
  factory :author do
    name { Faker::Name.name }
  end
end
```

And now I can call many helpers in my specs: `build(:author)`, `create(:author)`, and some more creative: `create_list(:author, 10)`.

Factories support relations:

``` ruby
FactoryGirl.define do
  factory :book do
    title { Faker::Book.title }
    author
    price { rand * 15 }
  end
end
```

Book factory was given `author` without a block, so it checks whether it's an association, and since we've defined an author factory - each fabricated book will trigger fabricating an author. Of course if I had a particular author I wanted, I could force that with `create(:book, author: author)`.

One last great thing about Factory Girl factories are traits, which are optional sets of changes to the fabricated object:

``` ruby
FactoryGirl.define do
  factory :user do
    email { Faker::Internet.email }
    password 'password123'

    trait :admin do
      admin true
    end
  end
end
```

With this factory, when I do `create(:user)`, the database default (false) is used for `admin` column. But when I do `create(:user, :admin)` the trait is applied and `admin` column is true.

### Faker

You've seen me use Faker in factories above. Faker has <s>some</s> _a metric hojillion_ of methods to create statistically probable e-mails, book titles, names, and much, much more. I recommend taking a look [at what it can do](https://github.com/stympy/faker#usage).

### shoulda-matchers

This gem expedites creating database tests, allowing to write a spec like this:

``` ruby
describe Book do
  it { is_expected.to belong_to(:author) }

  it { is_expected.to validate_uniqueness_of(:title) }
  it { is_expected.to validate_presence_of(:title) }

  it { is_expected.to have_db_column(:title).of_type(:string) }
  # ...
end
```

### Database Cleaner

Makes sure data from different test runs does not interfere. That should never be the case when we're using transactions to write data during tests and roll them back before they actually hit the DB. That is sometimes the case. 🤷‍

### Timecop

Timecop allows for testing of time-sensitive things - here it's about expirations for tokens. Since the expiration is a part of token content, I wouldn't be able to test the output of `AuthenticateUserCommand`. With Timecop:

``` ruby
before { Timecop.freeze(2017, 1, 1, 0, 0, 1, 1) }
after { Timecop.return }

let(:expected_token) do
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE0ODMzMTUyMDF9.' \
  '4Ix2FfiY0_Jsjk13mHntg62aVX9BmMgFEembjN2E-Zw'
end

subject { described_class.call(user.email, 'password123') }

# The token is exact since the expiration is precisely 24 hours after what Ruby
# _thinks_ is the date and time.
it { expect(subject.result).to eq expected_token }
```

### Simplecov

A tool to check how much of our code is covered with tests. We'll talk more about this further down the line.

## Continuous Integration with Travis CI

As long as your app is open source (and on GitHub, pretty much), the fine folks behind [Travis CI](https://travis-ci.org) graciously offer free continuous integration for it. It's as easy as going to the site, singing up (with GitHub account), and clicking to add particular repositories. You control how Travis builds your code with a `.travis.yml` file. For reference, here's one that bookstore uses:

``` yaml
language: ruby
services:
  - postgresql
env:
  - "RAILS_ENV=test"
before_script:
  - RAILS_ENV=test rake db:create db:migrate
addons:
  postgresql: "9.6"
  code_climate:
    repo_token:
after_success:
  - bundle exec codeclimate-test-reporter
```

We'll talk about Code Climate more in a while. For now the important parts here are the environment under `env`, attaching postgresql with `services` and `addons`, and setting up the environment in the `before_script`. For `language: ruby` Travis just runs `bundle exec rake` to test. Rspec hooks straight into that.

{{< figure src="/media/travis.png" link="/media/travis.png" caption="bookstore-backend on Travis CI" >}}

Be aware that since Travis is free, it's not fast by any measure. Bookstore is a tiny app, and the tests can routinely take upwards of five minutes.

Continuous integration works great when you observe proper git hygiene:

* Always do your work on a feature branch, never straight on master.
* When working on several features at once (or with more people), `git rebase master` your branch frequently - merge commits are evil.
* Use pull requests for your features, even when working alone - tools like Travis and Code Climate hook into these.

{{< figure src="/media/pull_request.png" link="/media/pull_request.png" caption="Pull request view, note that Code Climate has finished and Travis CI is still running its check" >}}

When you have specs and they are being run _automatically_ every time you even _think_ about merging something (= when you issue a pull request) - that's when you can merge with confidence.

### Code Climate

Code quality is important. Great code is easier to maintain, and at least Ruby's style guide is purposefully written in such a way that when you try to write a huge monolith of code which will be impenetrable to anyone (includnig You Of Two Weeks From Now) it cleverly disallows it.

I use two linters locally: [Rubocop](https://rubygems.org/gems/rubocop) and [Reek](https://rubygems.org/gems/reek). Rubocop cares for my style, while Reek makes sure my code doesn't smell. These are ran as I type, but I found that there are several other nice tools which I wouldn't want to run as I type. These (currently) are:

* [Brakeman](http://brakemanscanner.org) - a Rails security scanner
* [bundler-audit](https://rubygems.org/gems/bundler-audit), which analyses versions of gems for ones with known vulnerabilities

The perfect time to run these is on pull request creation as well!

Enter [Code Climate](https://codeclimate.com). Similarly to Travis, it's free for open-source projects on GitHub and hooks into pull requests. It'll take your code, run some scanners on it and show the warnings and errors in a unified way. Which scanners are ran is defined by a `.codeclimate.yml` file. For reference, here's the one used by bookstore-backend:

``` yaml
---
engines:
  brakeman:
    enabled: true
  bundler-audit:
    enabled: true
  duplication:
    enabled: true
    config:
      languages:
      - ruby
    exclude_paths:
      - spec/
  fixme:
    enabled: true
  rubocop:
    enabled: true
    checks:
      Rubocop/Style/FrozenStringLiteralComment:
        enabled: false
  reek:
    enabled: true
ratings:
  paths:
  - Gemfile.lock
  - "**.erb"
  - "**.rb"
  - "**.rake"
exclude_paths:
- bin/
- config/
- public/
- tmp/
- db/
```

As you can see, besides the tools I talked about earlier, I've also added `fixme` and `duplication`. These are custom reviewers, or "engines", designed by Code Climate (and both extremely useful).

It's worth noting that both Travis and Code Climate are not Rails and Ruby-specific, they work just as well on other languages.

Code Climate also has a coverage reporter. It works by capturing coverage on Travis, using this part of `.travis.yml`:

``` yaml
addons:
  code_climate:
    repo_token: XXXYYYZZZ...
after_success:
  - bundle exec codeclimate-test-reporter
```

And then sends it to Code Climate.

## Deploying

Our code is now tested regularly and automatically, and we have several spiffy badges on our GitHub page to prove this.

{{< figure src="/media/bookstore_badges.png" link="/media/bookstore_badges.png" caption="Badges on the bookstore-backend GitHub page" >}}

So how do we deploy? Like I promised you in part 0, we'll see how to deploy the app to [Heroku](https://heroku.com), completely free.

After registering, you'll be greeted with a dashboard:

{{< figure src="/media/1_heroku_dashboard.png" link="/media/1_heroku_dashboard.png" >}}

Click on new in top right to create an app. It'll need to be named. That name will be in your URL later.

{{< figure src="/media/2_heroku_app_creation.png" link="/media/2_heroku_app_creation.png" >}}

On the next screen, you will have an option to authenticate with GitHub and attach a repository.

{{< figure src="/media/3_heroku_attach_github.png" link="/media/3_heroku_attach_github.png" >}}

We also want to enable automatic deploys from master branch:

{{< figure src="/media/4_automatic_deploys.png" link="/media/4_automatic_deploys.png" >}}

Completing this process drops us down into the app's dashboard.

{{< figure src="/media/5_dashboard.png" link="/media/5_dashboard.png" >}}

From top left we can attach a PostgreSQL database. The free version is limited to 10,000 rows, but for us this is more than enough.

{{< figure src="/media/6_postgres_addon.png" link="/media/6_postgres_addon.png" >}}

Provisioning PostgreSQL sets a DATABASE_URL environment variable for our app:

{{< figure src="/media/7_database_url.png" link="/media/7_database_url.png" >}}

You'll see a username and password in there, I redacted mine. Remember how we set up our production database settings in Rails?

``` yaml
production:
  url: <%= ENV['DATABASE_URL'] %>
```

Boom! It attached automagically. Nothing to it.

On the topic of addons, I highly recommend attaching Papertrail as well - it's sometimes helpful to look at the logs. It should capture the logs automatically right after it's provisioned.

Since we didn't push to master since setting up the app, no deploys have been done yet. We'll need to go into the "Deploy" menu and run one by hand. It's at the far bottom of the page.

{{< figure src="/media/8_manual_deploy.png" link="/media/8_manual_deploy.png" >}}

We go back to the dashboard and see that the deploy completed.

{{< figure src="/media/9_heroku_complete.png" link="/media/9_heroku_complete.png" >}}

Time to whip out Postman again and see if it responds.

{{< figure src="/media/10_postman.png" link="/media/10_postman.png" >}}

`Not authorized`! Well, that's right, we don't have any users yet. Hmm... so how would we go about adding them?

We'll need console access. For that, the [Heroku Toolbelt](https://devcenter.heroku.com/articles/heroku-cli) is required - you'll have install and authorize it yourself, as setup varies per operating system.

After that, we can run in our shell:

``` bash
% heroku run --app bookstore-backend rails c
```

This will connect to Heroku and give us control of a shell in which `rails c` is running. Similarly, we could substitute `bash` for `rails c` and that'll give us an interactive shell in which we can run e.g. Rake.

In the spawned console, we can just set up a user like usual:

``` ruby
User.create(email: 'p@steamshard.net', password: 'redacted', admin: true)
```

With this user I can authenticate through Postman normally.

## That's it!

We've made a complete Rails 5 API app, from `rails new` to deploying to production. We've learned about Docker, JSON Web Tokens, modeling reality with code, testing and Heroku deployments.

This series has grown as I wrote; I never imagined it'll be six parts just to finish the back end! I've decided to split off the frontend in Vue.js to it's own series, starting (hopefully) next Saturday. It'll be another fun Saturday project, and I hope you join me for that as well.

Thank you for going on this journey with me, dear Reader - I hope you've learned something! I certainly have.

---

Top image credit: https://commons.wikimedia.org/wiki/File:Soyuz_TMA-05M_rocket_launches_from_Baikonur_4.jpg (Public Domain)
