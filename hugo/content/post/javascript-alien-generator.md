---
date: "2017-05-28T15:47:59+02:00"
title: "Saturday Project: Alien Generator in JavaScript"
bigimg: [{src: '/media/alien.png', desc: 'Alien'}]
coverImage: /media/alien.png
tags:
- javascript
- aliens
- saturdayproject
comments: true
---

I've been studying ES6 a lot lately. Here's a fun little project that we can do with it over an hour or so on a Saturday: an alien generator!

<!--more-->

# What are we building?

Back in 2013, GitHub introduced [Identicons](https://github.com/blog/1586-identicons). They're simple 5x5 icons, used as avatars for people who have neither set one up on GitHub nor do they have a Gravatar. Here's what mine would look like:

<img src="https://github.com/identicons/paweljw.png" />

They do look a bit like aliens. We're going to build a little script that will generate some randomly - as big and complex as we like.

# Materials

Or more appropriately: libraries! Well, one library, really. We don't want to mess around with drawing on an HTML canvas by hand, so we'll use [Two.js](https://two.js.org). It's a very simple library, and we can pull it from cdnjs at <https://cdnjs.com/libraries/two.js/>.

I usually use [CodePen](https://codepen.io) for my simple Saturday JS hacking needs. One simple reason: CodePen allows me to write ES6 and then easily run it through [Babel](https://babeljs.io/). I really don't want to set up webpack for every one-off thing. (Actually, I'm working on a little tool that will do it for me, but that's a story for another day).

# The build

Both Identicons and our aliens are symmetrical along the vertical axis. They also have random, pastel colors. We need to be able to do three things here:

* generate the left part of our alien,
* mirror it as the right part,
* draw it with a pleasing color.

Let's start with the color first.

## The `Color`

Little bit of theory first: there are a _lot_ of ways to get nice, pleasing pastel colors at random. Here's [one of my favourite articles](http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/) on the topic. It's all pretty involved though, with some statistical analysis and messing around with the HSV color model using the golden ratio.

Since this is a Saturday Project, we're not going to get as deep into it, and instead base our generation on a simple observation. Pastels tend to hover around the middle of the `1..255` range in every color component. Thus, if we mix a random color with white in equal proportions, for a good amount of input colors we'll get a pastel that actually makes sense.

Edge cases be damned, let's rock. I want a simple `Color` class that can store R, G and B values for a color, and I also want to be able to call `Color.random()` and get an instance of `Color` with random values for those. Simple:

```javascript
class Color {
  constructor (r, g, b) {
    this.r = r
    this.g = g
    this.b = b
  }

  static random () {
    let red = Math.floor(Math.random() * 255)
    let green = Math.floor(Math.random() * 255)
    let blue = Math.floor(Math.random() * 255)

    return new Color(red, green, blue)
  }
}
```

Now I also want to mix my color with any other color in "equal parts". The method to do it is add every pair of base color values together and halve the sum. To make sure we still get integer values for base colors, we'll use `Math.floor`.

```javascript
class Color {
  // ...
  mix (otherColor) {
    let red = Math.floor((this.r + otherColor.r) / 2)
    let green = Math.floor((this.g + otherColor.g) / 2)
    let blue = Math.floor((this.b + otherColor.b) / 2)
    return new Color(red, green, blue)
  }
  // ...
}
```

You may notice that this method is in `operator-style`, that is - it takes a right-hand-side operator, treating self as left hand side, and returns a new instance of it's class with the result. The benefit here is that we can add ("mix") two colors together and not mess up the instances we've been adding.

Now, all I'll be using this `Color` class for will be pastel colors, and I don't want to type `Color.random().mix(new Color(255, 255, 255))` all the time. I'm just lazy like that. So let's add a `toPastel()` method which will shorthand that for me:

```javascript
class Color {
  // ...
  toPastel () {
    return this.mix(new Color(255, 255, 255))
  }
  // ...
}
```

One last thing: we'll want to get the values of the color in a string formatted like `rgb(10, 20, 30)` for use with Two.js. So let's add in a method to cast our color to string.

```javascript
class Color {
  // ...
  toString () {
    return `rgb(${this.r}, ${this.g}, ${this.b})`
  }
  // ...
}
```

Great, that's our `Color` class done! If you haven't been following along, here's the complete product [as a Gist](https://gist.github.com/paweljw/c2c850dc5e9b74f071610fdfbc13fa83).

## The `Alien`

Our `Alien` class will be a fair bit more involved, so let's try to think about what does an alien make, first:

* A size, in pixels: Aliens are square.
* Number of "cells" - think of them as really large "pixels". GitHub's are 5x5, but we want whatever number of parts we choose.
* "Fill rate" - we might want our Alien to be dense or sparse.

From a technical perspective we also need:

* An HTML element, for our Two.js instance to attach to something.
* A new color every time we randomize our Alien.

Right, we can see easily how our Alien constructor needs to be made, so let's jump straight in!

### Construction (warning, men at work!)

```javascript
class Alien {
  constructor (attachTo, size = 600, parts = 16, frequency = 0.5) {
    this.two = new Two({ width: size, height: size }).appendTo(attachTo)
    this.size = size
    this.parts = parts
    this.partSize = this.size / this.parts
    this.frequency = frequency
  }
}
```

I decided to give my constructor some default values (I'm lazy, remember?). So I'll have an alien at 600 pixels in size, 16x16 cells, and I want a (statistical) half of them to be filled with a color. I'll pass in an element later.

We won't be saving the element at all, instead making an instance of Two.js right away and store that. Two takes a simple params hash into it's constructor, and then we run `appendTo` and hey presto - it's on there forever.

We store our `size` and `parts` in instance variables. Boring! And so is the `partSize`: if I want, say, an alien 400 pixels wide, with 8 cells, then

$$
\frac{400\ pixels}{8\ cells} = 50\frac{pixels}{cell}
$$

Lastly, we store `frequency` for later.

### The alien's all left

Let's make a first, rough draft of our `Alien.draw()` method and we'll refine it as we go along. Remember: first we need to generate the left half of our alien and then mirror it. We also need to only make it as filled as `frequency` says.

```
class Alien {
  // ...
  draw () {
    // clear the canvas
    // decide on the color
    
    for (var i = 0; i < this.parts / 2; i++) {
      for (var j = 0; j < this.parts; j++) {
        if (Math.random() < this.frequency) {
          // we should draw a filled square for this cell
        }
      }
    }

    // draw what we've prepared
  }
}
```

For clearing the canvas, Two has a `clear()` method, and for drawing we have an `update()` method.

Drawing a rectangle is a three step process, which can be summarised as follows:

```javascript
var rectangle = two.makeRectangle(center_x, center_y, width, height) // make rectangle width by height in size, with it's center at center_x and center_y
rectangle.fill = 'rgb(r, g, b)' // fill it with some color
rectangle.noStroke() // make it have no border
```

Spot the catch yet? Some graphics libraries define their rectangles by their top left corner; Two defines them with the center. So when we want to calculate the x and y position for an alien's cell, we need to solve this equation:

$$
center(x) = x \times alienPartSize + \frac{alienPartSize}{2}
$$

It's the same for `y`, of course. We can wrap this in two handy functions. I've used `_` prefix to denote "private" functions, since JavaScript doesn't really have that notion - even in ES6 - which is a bloody shame.

```javascript
class Alien {
  // ...
  _x (i) {
    return i * this.partSize + this.partSize / 2
  }

  _y (j) {
    return this._x(j)
  }
}
```

So putting all of this together, we'll get something like this:

```javascript
class Alien {
  // ...
  draw () {
    const fill = Color.random().toPastel().toString()
    this.two.clear()
    
    for (var i = 0; i < this.parts / 2; i++) {
      for (var j = 0; j < this.parts; j++) {
        if (Math.random() < this.frequency) {
          var rect = this.two.makeRectangle(this._x(i), this._y(j), this.partSize, this.partSize)
          rect.fill = rect2.fill = fill
          rect.noStroke()
        }
      }
    }

    this.two.update()
  }
  // ...
}
```

Let's test it right now! We can attach our Alien to a DOM node and call `draw()` on it.

```javascript
const elem = document.getElementById('two-container')
var alien = (new Alien(elem))
alien.draw()
```

Drum roll, please...

<img src="/media/alien_half.png" width="100" />

Ta-daah!

Wait, am I the only one who's excited? I am? Okay, okay, we'll give him the other half. Sheesh, you people.

For the mirrored part we need to calculate the x position differently - we can reuse the y, since we're only mirroring vertically. It'll go something like this:

$$
mirrorCenter(x) = size - x \times alienPartSize - \frac{alienPartSize}{2}
$$

We need to go from the far-right size (which begins at `size`), move left by our "top-right corner" offset, and then move further left by half a square to get the middle.

Hold on, though. Do you remember what our previous equation looked like?

$$
center(x) = x \times alienPartSize + \frac{alienPartSize}{2}
$$

This looks awfully similar, doesn't it. Only the sign doesn't match. Not too worry, though, we can offset that:

$$
mirrorCenter(x) = size - center(x) - alienPartSize
$$

Don't believe me? Do the math yourself. Believe me? Let's add this to our class:

```javascript
class Alien {
  // ...
  _mirroredX (i) {
    return this.size - this._x(i) - this.partSize
  }
}
```

Now we can make our _ULTIMATE DRAW FUNCTION_:

```
draw () {
  const fill = Color.random().toPastel().toString()
  
  this.two.clear()
  
  for (var i = 0; i < this.parts / 2; i++) {
    for (var j = 0; j < this.parts; j++) {
      if (Math.random() < this.frequency) {
        var rect = this.two.makeRectangle(this._x(i), this._y(j), this.partSize, this.partSize)
        var rect2 = this.two.makeRectangle(this._mirroredX(i), this._y(j), this.partSize, this.partSize)
        rect.fill = rect2.fill = fill
        rect.noStroke()
        rect2.noStroke()
      }
    }
  }

  this.two.update()
}
```

Here's all of it [as a Gist](https://gist.github.com/paweljw/4bdd4c003b0aef21498b2d13cdb42b0d).

## Finishing touches a.k.a. The Button

We can make ourselves some super-simple HTML with a redraw button:

```html
<button id="redraw">new alien</button>
<hr />
<div id="two-container"></div>
```

And update our testing code so it draws on click:

```javascript
const elem = document.getElementById('two-container');
var alien = (new Alien(elem))
alien.draw()

document.getElementById('redraw').addEventListener('click', function() { alien.draw() })
```

# All done!

And here's a live view straight from CodePen:

<p data-height="708" data-theme-id="0" data-slug-hash="GmaJOe" data-default-tab="result" data-user="paweljw" data-embed-version="2" data-pen-title="Aliens" class="codepen">See the Pen <a href="https://codepen.io/paweljw/pen/GmaJOe/">Aliens</a> by Paweł J. Wal (<a href="https://codepen.io/paweljw">@paweljw</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

It's been a fun little project, and I hope you've had a little bit of fun as well. See you next Saturday!