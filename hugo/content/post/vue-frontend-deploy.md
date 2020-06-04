---
date: "2018-04-03T13:00:00+02:00"
title: "Vue.js front end app, part 6: Deploying to S3"
coverImage: /media/launch.jpg
tags:
- follow me
- javascript
- es6
- vue.js
- vue-frontend-series
- aws
- s3
comments: true
draft: false
twitterTitle: "Vue.js front end app: Deploying to S3"
---

In this final episode of the series, we'll take a look at deploying our Single Page Application to Amazon Web Services Simple Storage Service (or S3).

<!--more-->

<details>
  <summary>_This series is composed of multiple articles! Click here for a table of contents._</summary>

  * [Part 1: Setting up the app](/2017/09/vue.js-front-end-app-part-1-setting-up-the-app/)
  * [Part 2: Design is (not) hard](/2017/09/vue.js-front-end-app-part-2-design-is-not-hard/)
  * [Part 3: Authentication](/2017/09/vue.js-front-end-app-part-3-authentication/)
  * [Part 4: Keeping state with Vuex](/2017/10/vue.js-front-end-app-part-4-keeping-state-with-vuex/)
  * [Part 5: Data presentation](/2018/01/vue.js-front-end-app-part-5-data-presentation/)
  * Part 6: Deploying to S3
</details>

# Wait, what do you mean "final"?!

_"We were supposed to edit data as well"_, you'll probably tell me. But with what we know by now, it's easy. You just make a form, give it a button, and POST an API call to the backend. We've gone over all the basic building blocks for that. Heck, we _already have a form_ that gets posted: it's our login form!

I started an article about it, and the more I went along, the more I found myself writing sentences along the lines of "we can do this exactly the same way as here, &lt;insert link&gt;." That's boring, repetitive, and - I feel - disrespectful of you, the reader. If I wanted to start a clickbait blog, I'd publish articles like "10 Ruby functions that help you lose weight overnight".

I want to do things that feel fresh and fun with you, so we'll skip that one. But I did say that we'll do those forms eventually, and I'm sorry if I let you down. I hope we can still be friends.

Okay, whine-rant section over. Let's get crackin'.

# So what's this S3 thing?

I imagine a lot of you already know, but let's go over this bery briefly. The S3 is a part of Amazon Web Services that lets you store a whole bunch of data and serve them up for download reasonably cheaply - you can check out their pricing [here](https://aws.amazon.com/s3/pricing/). For what it's worth, I've got an app in production that stores a very small amount (< 1GB) of data on S3 and fields a moderate amount of requests for those (~ 10<sup>9</sup> per month); the cost of S3 alone hovers around $90 for that. Your mileage can and will vary, of course, depending on use case, region and so forth.

## Can't we just store static pages on our webserver?

If we're assuming that our app will get very little traffic, it can be cost-effective to just do that, sure. What we're going to do here applies more to apps with moderate and higher traffic, because it helps us scale.

Quite a long time ago, when I talked about [the "why" of namespacing APIs](/2017/07/rails-5.1-api-with-vue.js-frontend-part-3-api-versioning/), I dreamt up a scenario where our app gains traction rapidly. When that happens, you'll need to scale with demand for your services. If your app is one big clump of backend and frontend code that lives on a single machine, you suddenly have a whole lot of work to do separating the code so it can be scaled separately. But if your app was separated, then all the scaling work needs to be done just on the backend - no frontend fussing around required.

It also makes it cheaper to scale. Application servers - like the premade ones you get from Heroku, or ones you manage yourself on AWS EC2 or Microsoft Azure - cost much more than static file storage. We should have this pricier asset working full clip to serve _application_ requests. While it's serving requests for static files, the server is not fielding requests to the actual application backend, given that a server's CPU, RAM, network connection etc. are a finite resource.

# How do I get an S3?

First we need an AWS account. You'll want to go to https://portal.aws.amazon.com/billing/signup and set one up if you don't have one. 

{{< figure src="/media/vue-deploy/amazon-signup.png" link="/media/vue-deploy/amazon-signup.png" >}}

While creating your account, you should be prompted with information about your access key and secret key. It's imperative that you take note of those and store them safely, since once they're shown to you once, there's no way to recover the secret key aside from creating a new pair of those credentials.

By the way, if it's your first ride on the AWS rollercoaster, they'll allow you to use some parts of their service for free (to help lock you in as a customer, of course) - I encourage you to play around if you're eligible for that, it's quite fun.

_Since I've been asked about this a couple of times - I'm not affiliated with Heroku, Travis CI or Amazon. The links I include in my articles are not referral links. I don't get anything for mentioning them. I consider them good tools so I show how to use them - and that's it._

After logging in, you'll see something like this.

{{< figure src="/media/vue-deploy/amazon-logged.png" link="/media/vue-deploy/amazon-logged.png" >}}

Click on, or search for "S3". You'll find a button that says "Create bucket".

## "Bucket"?

A bucket is a top-level data organization structure in S3. The bucket name is unique across a whole Amazon region, and it's how we can refer to it.

A bucket can be set to private or public. A private bucket can hold, for example, your backups or your logs - data you won't be showing off to the public. A public bucket can hold something like user uploads in a typical web application, or a whole static website. Something like this blog could be hosted on S3 - and so can an SPA.

Let's dig into the bucket creation process and we'll explain more as we go along.

## Creating a bucket

{{< figure src="/media/vue-deploy/create-bucket.png" link="/media/vue-deploy/create-bucket.png" >}}

We'll need to supply a name. I'll go for something like `bookstore-frontend-paweljw`. Like we said before, it needs to be unique across a whole region and DNS-compatible, so think about yours for a while.

We also need to set a region for this bucket. The Ireland region is closest to me, so it's what I usually rely on. Pick whatever you want, but remember that this affects where your files are physically located, and therefore your latency.

_When you're creating a real application, you should consider replicating your data to multiple regions, or even using a caching solution like Cloudflare or AWS CloudFront. This will ensure that your page loads faster for your users._

{{< figure src="/media/vue-deploy/create-bucket2.png" link="/media/vue-deploy/create-bucket2.png" >}}

The next screen has a whole bunch of big-sounding options, none of which we really need right now. We can just "Next" over it.

{{< figure src="/media/vue-deploy/create-bucket3.png" link="/media/vue-deploy/create-bucket3.png" >}}

On this page, we want to grant public read acces to our bucket. Amazon will try to scare us away saying that it's not recommended. That's due to a series of high-profile data leaks where people put private data (such as backups) in public buckets and someone figured out they did. _If you're creating a bucket for such purposes, NEVER make it public._

However, we want our data - our SPA - to be served publicly, so we'll ignore the warning. We can do it because we know what we're doing and understand the consequences (which is the only set of circumstances under which you should ignore a warning).

{{< figure src="/media/vue-deploy/bucket-created.png" link="/media/vue-deploy/bucket-created.png" >}}

After reviewing our settings, we'll find our new bucket on the buckets list. We're half way there already!

# Configuring S3 for static website hosting

{{< figure src="/media/vue-deploy/static-website-hosting.png" link="/media/vue-deploy/static-website-hosting.png" >}}

After clicking through to our bucket, we'll go to the permissions tab and find a new option waiting for us: static website hosting.

{{< figure src="/media/vue-deploy/static-website-hosting2.png" link="/media/vue-deploy/static-website-hosting2.png" >}}

We'll want to set it to "Use this bucket to host a website". The default index document of "index.html" is fine for us, since this is what gets generated in our setup - we just have to type it in. We don't have an error document, so we'll type in "index.html" as well. In a real app we'd probably want to set it up so it points to an actual error page. Otherwise S3 will throw up an ugly default error message.

Take note of the "endpoint". This is where our files will show up when we deploy them. Currently it'll just throw a 404 error.

{{< figure src="/media/vue-deploy/error.png" link="/media/vue-deploy/error.png" >}}

# Deploying the Vue app to S3

The bucket is ready, time to fill it up. There's a little NPM package that will help us: [s3-deploy](https://www.npmjs.com/package/s3-deploy). Let's install it:

``` bash
$ npm install --save-dev s3-deploy
```

We'll need to give s3-deploy access to our AWS account. The quick and easy method of doing this will be through a special file, located in `~/.aws/credentials`. It should look a little bit like this:

``` ini
[bookstore-frontend]
aws_access_key_id = AKEXAMPLEEXAMPLE
aws_secret_access_key = someexample123secretkey
```

The phrase in the square brackets is called a "profile". I like to set up my projects so that I have a profile per project (you can put multiple profiles in the `~/.aws/credentials` file). If you want a set of credentials to be chosen every time you don't specify a profile, name it `default`.

The access key and secret are the credential pair you took note of during account creation (or if you already had an account, you should have your pair stashed somewhere).

Now that we have our credentials set up, we can deploy our SPA like so:

``` bash
$ npm run build
$ node node_modules/s3-deploy/.bin/s3-deploy './dist/**' --cwd './dist/' --region eu-west-1 --bucket your-bucket-name --profile your-profile-name
```

There are a couple of issues with this: it's not a single command, it's a mouthful, and our app won't work yet. Let's fix those issues one by one.

## It's a mouthful

We'll update our [`package.json`](https://github.com/paweljw/bookstore-frontend/blob/master/package.json) file to include a `deploy` command.

``` json
{
  // ...
  "scripts": {
    // ...
    "deploy": "node node_modules/s3-deploy/.bin/s3-deploy './dist/**' --cwd './dist/' --region eu-west-1 --bucket bookstore-frontend-paweljw --profile bookstore-frontend"
  },
  // ...
}
```

It's worth noting that I can just throw up my whole command up here and in the repository, since it's not a secret: the secrets are stored outside the repo in my `~/.aws/credentials` file.

## Can't do a release in a single command

In the same file, we'll roll up our two commands into one called `release`:

``` json
{
  // ...
  "scripts": {
    // ...
    "release": "npm run build && npm run deploy"
  },
  // ...
}
```

Note the usage of `&&` here. If the first command fails the second will not run, so if something borks itself during build, we won't deploy half-built artifacts to S3.

## It won't work yet

Let's have a little throwback to our [axios setup](https://github.com/paweljw/bookstore-frontend/blob/master/src/backend/vue-axios/axios.js) file:

``` js
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

We're set up so that our API calls hit localhost, or whatever is in the `API_URL` environment variable _at build time_. As it is right now, our app builds with the default localhost address because we didn't tell it otherwise.

The funny thing is, if you have our backend app running on your computer, it will work - you can try it if you don't believe me! But we neither expect nor _want_ our users to have a copy of our backend running on their machines, so we have to tell Vue.js where the production endpoint lies.

Thankfully, there's a very easy way to set production environment variables for Vue.js builds, in [`config/prod.env.js`](https://github.com/paweljw/bookstore-frontend/blob/master/config/prod.env.js). We'll modify the app to look something like this:

``` js
module.exports = {
  API_URL: '"http://someplace-that-runs-your-backend"',
  NODE_ENV: '"production"'
}
```

If you followed the backend series, your app should be on Heroku, so you can place it's URL here.

# Ship it!

Now that we've made all those changes, we can simply run:

``` bash
$ npm run release
```

And when we head over to our S3 "endpoint" URL...

{{< figure src="/media/vue-deploy/running.png" link="/media/vue-deploy/running.png" >}}

Ta-daaa! 🤩

<img src="https://media.giphy.com/media/J3hSvKHJC7d28/giphy.gif" style="display: block; margin: 0 auto"></img>

# We're done!

We went over a huge amount of topics relating to [Rails API apps](/2017/07/rails-5.1-api-with-vue.js-frontend-part-0-stack-choices/) and [Vue.js single page applications](/2017/09/vue.js-front-end-app-part-1-setting-up-the-app/). There are 12 articles in both series, spanning a whopping 10 months, which is probably the longest I've blogged about a single thing in my entire life - if you'd like a refresher, just hit the links in the previous sentences. As always, the changes done to the code in this article are available on [GitHub](https://github.com/paweljw/bookstore-frontend/commit/4fa6c42266c2bf6d10b7b6af68cfbd205f81295b).

I'd like to thank you all for reading, commenting, and helping me learn. Be sure to check back in the future! I probably won't be starting another huge multi-article, multi-month journey anytime soon, but there'll be some interesting bits to tide you over until we embark on another one of those.

See you soon!

---

Top image credit: https://commons.wikimedia.org/wiki/File:Soyuz_TMA-05M_rocket_launches_from_Baikonur_4.jpg (Public Domain)
