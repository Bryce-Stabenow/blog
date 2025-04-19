---
title: "CSS in the Age of Tailwind"
pubDate: 2025-04-16
description: ""
author: "Bryce Stabenow"
image:
  url: "../../assets/css-gradient.jpg"
  alt: "A colorful CSS gradient showing swirling colors"
tags: ["css", "front end", "web design", "web development"]
---

# CSS in the Age of Tailwind

<br />

Consider for a moment the following code, which was recently featured on the CodePen newsletter:

<br />

<p class="codepen" data-height="300" data-theme-id="dark" data-default-tab="css,result" data-slug-hash="XJWLdjZ" data-pen-title="Sticker filter" data-editable="true" data-user="kevin-carlos-grajeda-a" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/kevin-carlos-grajeda-a/pen/XJWLdjZ">
  Sticker filter</a> by Kevin Grajeda (<a href="https://codepen.io/kevin-carlos-grajeda-a">@kevin-carlos-grajeda-a</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://public.codepenassets.com/embed/index.js"></script>


<br/>

It's cool. *Very* cool. In fact, to step back and consider how mind-bogglingly cool is rather hard. It requires us to break down the entire structure of this HTML and understand at how it's even possible--and also the fact that most of this functionality has been present for **over a decade** in browsers.

<br/>

It's easy to forget that CSS is one of the greatest achievements of the web. So many times it is reduced to "centering div hard" in memes and posts on the website formerly known as Twitter. But really... it's incredible. Breathtaking. And every one in a while, when you see an example of how layers upon layers of rendering and under-utilized features combine together into a beautiful conglomeration of artistic expression, it can be inspiring--and also make you consider just how shit you are at CSS.

<br/>
<br/>
<br/>

## "How he do 'dat?"

<br/>

Those were the exact words I spoke to myself when looking at this example. *"Ah, fancy JavaScript"*, your mind might say. But go ahead and comment it all out and you'll see it wasn't the only factor.

<br/>

The trick lies in an HTML feature that has been supported since **version 5 of Chrome, in 2010** ([not kidding, look it up](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/filter#see_also)), the humble svg `<filter>`. So, the question is, "How is that possible, when most of the web developers can't center a `<div>` but this man can render essentially a 3D model of text?"

<br/>

Now, there may be a myrid of complicated causes to that answer. However, I don't think long articles are any fun, so the answer is simple:

<br/>

*Most feature of CSS are entirely useless*. But that doesn't mean they aren't incredible.

<br/>
<br/>
<br/>

## The Magic of Filters

SVG filters implement a range of HTML elements that are used as a sort of "effects chain" on an original image, called the source. Starting with this source, we are able to set up a a group of filers, using their `in` and `result`. But some are also used to generate their own filter, like Turbulence:

```html
<feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="1" seed="14" stitchTiles="noStitch" result="feTurbulence-5a5b7d7d"></feTurbulence>
```
We name this result `feTurbulence-5a5b7d7d` which we can then use as the input to our next filter:
```html
<feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="1" seed="14" stitchTiles="noStitch" result="feTurbulence-5a5b7d7d"></feTurbulence>
<feColorMatrix in="feTurbulence-5a5b7d7d" type="saturate" values="30" result="feColorMatrix-d8c90d8d"></feColorMatrix>
```
Combining these two together would give us a colorful noise map that we can then apply to whatever we wish.

<br>
<br>

<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">
  <defs>
    <filter id="sticker">
    <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="1" seed="14" stitchTiles="noStitch" result="feTurbulence-5a5b7d7d"></feTurbulence>
<feColorMatrix in="feTurbulence-5a5b7d7d" type="saturate" values="30" result="feColorMatrix-d8c90d8d"></feColorMatrix>
    </filter>
  </defs>
</svg>


<div style="filter: url(#sticker); height: 100px; max-width:75%; margin: 0px auto;">
</div>

<br/>

Now, *is this useful?* No, not by itself. But the possibilities from here are endless.

<br/>

These SVG filters allow us to essentially have a miniature Blender model right in our browser. We can create a varied filter, composite it onto our text, and now we have a beautiful, colorful set of text with its own custom rendering. If you're interested in learning more about SVG filters, check out the MDN tutorial on them, and then start experimenting!

<br/>

Until next time!