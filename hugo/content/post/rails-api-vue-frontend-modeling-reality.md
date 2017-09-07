---
date: "2017-07-15T15:00:00+02:00"
title: "Rails 5.1 API app, part 2: Modeling reality"
coverImage: /media/lego.jpg
tags:
- saturdayproject
- follow me
- rails
- api
- rails-api-series
comments: true
draft: false
---

Oh yeah. Now we're going _hardcore_. Well, not really.

While Rails embraces a continuously changing data model, it's always good to stop and think for a minute about the domain we're trying to magically lockwithin an app. We're building a bookstore. So what's in one?

<!--more-->

<details>
  <summary>_This series is composed of six articles! Click here for a table of contents._</summary>

  * [Part 0: Stack choices](/2017/07/rails-5.1-api-with-vue.js-frontend-part-0-stack-choices/)
  * [Part 1: Setting up a Rails API app](/2017/07/rails-5.1-api-with-vue.js-frontend-part-1-setting-up-a-rails-api-app/)
  * [Part 2: Modeling reality](/2017/07/rails-5.1-api-with-vue.js-frontend-part-2-modeling-reality/)
  * [Part 3: API versioning](/2017/07/rails-5.1-api-with-vue.js-frontend-part-3-api-versioning/)
  * [Part 4: Authentication and authorization](/2017/07/rails-5.1-api-with-vue.js-frontend-part-4-authentication-and-authorization/)
  * [Part 5: Deploying with confidence](/2017/07/rails-5.1-api-app-part-5-deploying-with-confidence/)
</details>

# Books

There are books in a bookstore. Books have *titles* and *authors* at a minimum. We want to sell those books, so they probably have *prices*, also. This gives us one very important information: we're going to be dealing with money!

One might think that the most natural way to store prices is in a float column - it makes sense, money is floating point after all, right? Not necessarily. When we start thinking about currencies, exchange rates and similar things, it can quickly make one's head spin. The safest way to store price data is in a dedicated column, where it's stored as 1/100s of the base currency, and of course to set the base currency first.

Thankfully, we have the lovely `money-rails` gem to take care of that for us. Let's drop it in right now into our Gemfile and install with `bundle install`. Afterwards it will need to be initialized with

```
rails g money_rails:initializer
```

This will create a `money.rb` initializer. For now, we can drop in the simplest of configs there:

```ruby
MoneyRails.configure do |config|
  config.default_currency = :usd
end
```

# Authors

What about authors, what do they have? Definitely *names*. Also an author can have many books, and books belong to an author.

Well, that was easy. 😀

# Scaffolding

Armed with that, we can create ourselves some models. We'll use Rails' scaffolding feature for that.

```
rails g scaffold Author name:string
rails g scaffold Book author:belongs_to title:string price:monetize
```

Notice how we can use `monetize` now as a field type? That's all `money-rails`.

Of course, the generators aren't as smart as we are, so we need to go in and fix a couple of things.

# Routes

Our books cannot exist without authors. We can decide that we'll only browse them in this context.

```ruby
Rails.application.routes.draw do
  resources :authors do
    resources :books
  end

  root to: 'authors#index'
end
```

This will also make for some slightly more challenging routing on the frontend side of things - since we're here to learn, that's a good thing!

# Controllers

This also means that we'll want to modify the `BooksController`:

``` ruby
# frozen_string_literal: true

class BooksController < ApplicationController
  before_action :set_author
  before_action :set_book, only: [:show, :update, :destroy]

  def index
    @books = @author.books.all
    render json: @books
  end

  # ...

  def create
    @book = @author.books.new(book_params)

    # ...
  end

  # ...

  private

  def set_book
    @book = @author.books.find(params[:id])
  end

  def set_author
    @author = Author.find(params[:author_id])
  end

  # ...
end
```

I've obviously ommited some parts for brevity. The gist of the changes is that we want to generate our `@book` with regard to
the author whom we're browsing.

# Models

Some finishing touches to be done here.

Author should be aware that he has books and must have a name. We can also define a `to_s` method - it'll come in handy later.

``` ruby
class Author < ApplicationRecord
  has_many :books

  validates :name, presence: true

  def to_s
    name
  end
end
```

Similarly, we can define validations and `to_s` on Book:

``` ruby
class Book < ApplicationRecord
  belongs_to :author
  monetize :price_cents

  validates :title, presence: true

  def to_s
    title
  end
end
```

# Seeding

I've decided that instead of typing out a bunch of books, I can just import a Goodreads list. I chose one I thought funny - http://www.goodreads.com/list/show/643.Guilty_Pleasures_Crap_You_re_Embarrassed_to_Love - and wrote a simple Rake task to parse it using Nokogiri. It's placed in `lib/tasks/import.rake` and called with `rake import:goodreads`.

``` ruby
# frozen_string_literal: true

require 'nokogiri'
require 'open-uri'

GOODREADS_URL = 'http://www.goodreads.com/list/show/643.Guilty_Pleasures_Crap_You_re_Embarrassed_to_Love'.freeze

namespace :import do
  task goodreads: :environment do
    doc = Nokogiri::HTML(open(GOODREADS_URL))

    books = doc.xpath('//*[@itemtype="http://schema.org/Book"]')

    books.each { |book| book_from_xml(book) }
  end

  def book_from_xml(book)
    title, author_name = book.xpath('.//*[@itemprop="name"]').map(&:content)
    author = Author.find_or_create_by(name: author_name)

    book = create_book(author, title)

    puts "#{book.author} - #{book} for #{book.price}"
  end

  def create_book(author, title)
    book = author.books.find_or_create_by(title: title)
    book.price ||= rand * 15
    book.save
    book
  end
end
```

# Quick sanity check: is it even responding?

Let's see if our app is responding at all. We can use [Postman](https://www.getpostman.com/) for that - it's a very versatile
tool and I highly recommend it.

Anyway, let's boot up our app with `rails s`, point Postman at `http://localhost:3000`, and...

{{< figure src="/media/modeling_reality_postman.png" link="/media/modeling_reality_postman.png" caption="Testing our app with Postman" >}}

Woohoo!

# Room for improvement

You'll notice I often discuss this: where can we improve? What can be added or changed in the future? Which improvements we need for a minimum viable product, and which can be saved for later?

I think that the list of things we need for MVP looks something like this:

* Reorganize our controllers a bit more, so that we have our API versioned in the url (`/v1/books` instead of simply `/books`). his will allow us to iterate on the API and front end independently.
* Locking it down. We should have users and a permissions system (at a minimum, a method to say who is an admin and who is not). Actions such as creating Authors or deleting Books need to be authenticated-admin-only.

Nice to have:

* Images for the books! Our bookstore will look a bit bland, don't you think?
* A simulated "order" system so the "store" part actually has some sense.

We'll dig into versioning APIs - the how _and_ the why - in part 3 on Tuesday, July 18th, and into auth a bit later. In the meantime, you can check out the repo at this tag: https://github.com/paweljw/bookstore-backend/tree/part-2 to see the complete code.

See you next time!

---

Top image credit: https://pixabay.com/p-1862109/ (CC0 Public Domain)
