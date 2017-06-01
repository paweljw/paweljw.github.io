---
date: "2017-01-03T20:24:17+02:00"
draft: false
title: "A Cup of Coins, Revisited"
tags:
- science
coverImage: https://www.colourbox.com/preview/2966762-aluminum-cup-filled-with-coins.jpg
bigimg: [{src: "https://www.colourbox.com/preview/2966762-aluminum-cup-filled-with-coins.jpg"}]
---

It all started out simple, really: I’ve been watching some cartoon - I think it was something in The Penguins of Madagascar series - with my fiancee, Magda, and something to the effect of “I’d like to borrow a cup of coins” was uttered in the show. She looked to me and said jokingly, “I’ll buy a cup of coins off you for 1 [PLN](https://en.wikipedia.org/wiki/Polish_z%C5%82oty)”.

I’ve been looking long and hard to turn a profit on this hypothetical sale.

<!--more-->

## What Is A Cup?

This should be an easy question, but it’s not, at least in this context. A [cup](http://www.wolframalpha.com/input/?i=cup) is primarily a unit of volume, and that doesn’t work too well for what we’re trying to do. Still, it’s best to try and start a solution with a naive approach and refine, at least that’s what I’ve been taught. So, just for the heck of it, let’s go.

## The volume Approach

Suppose I take the lowest-value coin we have around here, 1 grosz. It’s made of manganese brass (MM59). The web is surprisingly useless when it comes to determining it’s density, but Wikipedia lists it’s composition as 70% copper, 29% zinc and 1.3% manganese. Therefore we can use this formula to calculate it’s density:

$$
70\% * 8.96 \frac{g}{cm^3} + 29\% * 7.14 \frac{g}{cm^3} + 1.3\% * 7.47 \frac{g}{cm^3}
$$

Thankfully, Wolfram|Alpha can do the appropriate substitutions for us, and it comes out to 8.401 grams per cubic centimeter. It’s also kind enough to work out that if we were to melt enough coins to fill a cup completely, it’d take 1.997kg of those. Since the weight of a 1 grosz coin is 1.64g, the coins in there come out to around 12.18 PLN. We’re not exactly turning a profit here.

And we didn’t exactly fulfill what Magda wanted on our end. She wanted a cup of coins, we’ve managed to provide her with something that could be called a cup of coin. And that’d still be a stretch.

Apparently just melting the coins doesn’t work. Who’d have thought.

## The area approach

Apparently, “how many circles fit in a larger circle” is an interesting and less than obvious problem that has been solved over and over again. The good thing about this is that we have, for example, this handy table of how many circles of radius X fit into a circle of radius 1.

Since we know what kind of a volume a cup has, but there are no specifics as to it’s measurements, we’ve got some leeway here. To stay true to the idea of a “cup”, I propose that a “cup” is a container in the shape of a perfect cylinder, of arbitrary height and with a diameter of or above 15.5mm, but a constant volume of 250 mL.

Which means we can test two extremes already: the tallest possible cup and the flattest possible cup.

## The tallest possible cup

The tallest possible container that will fullfill our working definition of “cup” is

$$
\frac{236.6 cm^3}{\pi \cdot \frac{15.5mm}{2}^2}
$$

which equals 12.54cm tall. A 1 grosz coin is reasonably close in thickness to 1mm, which would mean that this cup holds 12.54 PLN. This is even worse than our cup of melted “coin” before.

The flattest possible cup

Conversely, the flattest possible cup - clocking in at 1mm height - would have a diameter of

$$
\frac{\sqrt{\frac{236.6 cm^3}{1mm}}}{\pi}
$$

which comes out to 15.483cm, becoming more a very shallow dish than a cup. Assuming this is our circle of radius one, we can work out that $\frac{15.5mm}{154.83mm} = 0.1001$. Using the aforementioned table we see that this corresponds to the result for 80 circles.

This means that using the flattest possible cup we’ve managed to limit our investment to something around 0.80 PLN. Mission (mostly) accomplished.

# The currency approach

Of course, all of the above is possible because Magda - not expecting us to pull math tricks on her - did not specify how a cup should look. Luckily for us, she didn’t specify the currency she wants, either. BBC News has an article on [the most worthless coin ever](http://www.bbc.com/news/magazine-21572359). It happens to be Uzbekistan’s 1 tiyin (which is one-hundredth of a [Uzbekistani som](https://en.wikipedia.org/wiki/Uzbekistani_so%CA%BBm)).

At the time of this writing, the som has a slightly depressing value of $$1.39475532 \times 10^{-5}$$ PLN. To find out anything about it’s size, we will have to venture into the Russian-language version of the Wikipedia and read up on our little friend [тийин](https://translate.google.com/translate?hl=pl&sl=auto&tl=en&u=https%3A%2F%2Fru.wikipedia.org%2Fwiki%2F%D0%A2%D0%B8%D0%B9%D0%B8%D0%BD). Thus we find out that the tiyin has a diameter of 16mm and a thickness of 1.2mm.

Since it worked so well the last time, I figured I’d just factor those into the [“flattest possible cup”](http://www.wolframalpha.com/input/?i=16mm%2F(sqrt(236.6+cubic+centimeters+%2F+1.2mm)+%2F+pi)) equation and find out the relation between the diameter of the tiyin and our 1.2mm tall cup. This comes out to 0.1132, almost exactly equal to 62 circles value in that table I keep quoting.

This works out to precisely _0.000864748301_ PLN at the time of this writing, which means that in this scenario our profit is around _0.99913525169 PLN_ - and that, at least to me, is pretty darned close to 1 PLN profit on this exchange (the cost of custom-made “cup” and time spent tracking down exactly 62 tiyin nonwithstanding).

Magda will be _furious_.