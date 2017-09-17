---
date: "2015-02-28T21:17:45+02:00"
title: "Ultrasonic theremin"
tags:
- arduino
- music
- saturdayproject
- electronics
coverImage: /media/theremin_build.jpg
bigimg: [{src: "/media/theremin_build.jpg", desc: 'Ultrasonic theremin'}]
comments: true
---

I’ve been wanting to construct an instrument in the spirit of a theremin for quite a while. Of course, I have neither the skills to construct a proper theremin, nor the time to master them. What I do have is an Arduino board, some sensors and a couple of spare parts.

<!--more-->

# What are we building?

We’re building a very simple device which will emit different notes based on how far the user’s hand is from the head of the device.

# Materials

Only a couple things are needed. For the sound piece, I used a salvaged PC speaker.

{{< figure src="/media/theremin_speaker.jpg" >}}

Speakers. It’s one of those parts that somehow find their way into my room in numbers, and I never notice until I find a pile of, say, five. In a completely random place.

The second part I used is probably much less likely to find it’s way to you as a scrap part:

{{< figure src="/media/theremin_hc_sr04.jpg" >}}

It’s a HC-SR04 ultrasonic ranging module. Not only does “ultrasonic ranging module” sound very cool, it’s also pretty accurate.

# The build

The build is actually pretty simple:

{{< figure src="/media/theremin_build.jpg" >}}

The speaker is connected to pin 11 through a 10k ohm resistor (you could use a much smaller resistor, even 100 ohm will do; I wanted mine extra quiet) and to ground.

5V is connected to a rail, then through two jumpers (one over rail break) to Vcc pin on the HC-SR04. The appropriate ground is connected to GND pin, and trigger pin and echo pin are connected to pins 10 and 8, respectively. Since this is probably confusing, here’s a Fritzing diagram:

{{< figure src="/media/theremin_bb.png" >}}

# The code

The code is also pretty simple. I’m using two libraries - NewPing and TonePlayer. The built-in tone library was too limited, and to my knowledge - clashes drastically with NewPing.

```
#include <NewPing.h>
#include <TonePlayer.h>

#define TRIGGER_PIN    10
#define ECHO_PIN       8
#define TONE_PIN        2

#define PROBING_DELAY 500 // how often do the ping and play the note

#define RANGE_START   293 // note frequency closest to sensor

#define RANGE_LENGTH   60 // cm
#define FREQ_PER_SLOT  16 // frequency change per slot
#define SLOT_LEN        5 // per note, in cm

#define US_PER_CM 57

TonePlayer tone1 (TCCR1A, TCCR1B, OCR1AH, OCR1AL, TCNT1H, TCNT1L);
NewPing sonar(TRIGGER_PIN, ECHO_PIN, RANGE_LENGTH);

void setup()
{
  pinMode(11, OUTPUT);
}

void loop()
{
  unsigned long duration;
  int distance;

  duration = sonar.ping();
  distance = duration / US_PER_CM;

  if(distance > 0 && distance <= RANGE_LENGTH)
  {
    distance /= SLOT_LEN;
    distance += 1;
    int freq = RANGE_START + FREQ_PER_SLOT * distance;
    tone1.tone(freq);
  } else {
    tone1.noTone();
  }

  delay(PROBING_DELAY);
}
```

In every loop, duration of round-trip for the sensor is taken with sonar.ping(). Then, it’s converted to centimeters (using 57 microseconds of round trip per centimeter as base). Then, if the taken reading is not out of range, the frequency for the particular 5cm slot is calculated; the slots are placed with lower pitch closer to the head of the device, changing by 16Hz (approximately a halfnote) every 5cm. Then the note is played, or if reading out of range - playback is stopped.

# The demo

And it actually works! Although playing anything on it is a pain in the arse. Here’s an 18 second demo by yours truly (you might need to crank your speakers up):

<iframe width="560" height="315" src="https://www.youtube.com/embed/C0EGJaaNFj0" frameborder="0" allowfullscreen></iframe>

All in all, a pretty fun project you can throw together in a couple of hours.

