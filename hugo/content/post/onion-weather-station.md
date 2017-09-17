---
date: "2017-09-17"
title: "Saturday project: temperature and humidity meter with Onion Omega2+"
coverImage: /media/weather_station/setup.jpg
tags:
- saturdayproject
- electronics
comments: true
draft: false
---

Quick thing I threw together in about an hour: an IoT temperature and humidity meter!

<!--more-->

I've very recently sourced an Omega2+ WiFi board from [Onion](https://onion.io). I've previously only played with Arduino (skipped Raspberry Pi completely), so grabbing something that runs actual Linux on a hefty .5GHz was a whole new world for me.

{{< figure src="/media/weather_station/omega.jpg" >}}

While rummaging through my electronics supplies (which are in much more disarray that I remember leaving them - that's interesting) I've found this DHT11 brick-form module from, well - the board was made by Xinda probably, and the sensor pack itself by Aosong. Suffice it to say it's extremely chinese in it's quality.

After a couple of soldering misadventures, I managed to get this going (thumbs up for botched soldering jobs!)

{{< figure src="/media/weather_station/dht.jpg" >}}

It's interesting to note that this board has only three pins instead of the four traditional for DHT bricks. Also the order feels weird to me (left-to-right it's data, Vcc and GND; Vcc, data, GND would make more sense IMHO).

I'm running the Omega2 through their [Power Dock](https://onion.io/store/power-dock/), which - aside from breaking out a bunch of the pins into a header - can both power the board through microUSB (it has a regulator), and it serves as a charge/discharge circuit for a 3.7V LiPo battery.

I've realized, somewhat belatedly, that I did have a battery, and the right connector for the board, but that the battery itself has the wrong connector! It's a JST-BEC connector, where the dock just has a regular 2mm raster connection.

Some last-minute jury rigging (thumbs up for not having the right size thermal shrink!) and here we go:

{{< figure src="/media/weather_station/battery.jpg" >}}

And here's everything connected together:

{{< figure src="/media/weather_station/setup.jpg" >}}

I'm using the `dht-sensor` program (I'll probably create my own version for study purposes, but I was pressed for time). Once everything is attached how it should be, it's just a matter of `dht-sensor PIN-NUMBER PROTOCOL-VERSION`:

``` bash
root@Omega-ABCD:~# dht-sensor 3 DHT11
humidity: 58.000000
temperature: 20.000000
```

What's interesting is it can output JSON, though I'm not using this currently. Maybe at a later stage.

``` bash
root@Omega-ABCD:~# dht-sensor 3 DHT11 json
{"humidity": 58.000000, "temperature": 20.000000}
```

Since this is an IoT device, it would not be complete without spilling sensitive information onto the internet. I've decided to use [ThingSpeak](https://thingspeak.com) for the purpose of collecting and graphing that information until I have something useful to do with it.

{{< figure src="/media/weather_station/thingspeak.png" >}}

Another place you can tell from that this is a hurried weekend plaything is this script I'm using for reporting:

``` sh
#!/bin/sh -e

res=`dht-sensor 3 DHT11`
hum=`echo $res | awk '{print $2}'`
temp=`echo $res | awk '{print $4}'`

curl --insecure https://api.thingspeak.com/update \
    --data "api_key=GETYOUROWN" \
    --data "field1=$temp" \
    --data "field2=$hum"

echo oneshot > /sys/class/leds/omega2p\:amber\:system/trigger
echo 1 > /sys/class/leds/omega2p\:amber\:system/shot
```

Interesting sidenote - the last two lines allow me to blink the on-board led when the data has been collected and sent.

And that's it for now! We're returning to our regularly-scheduled Vue.js programming soon, probably towards the end of next week. 😉