---
title: "Upgrading to Vue 3.5"
pubDate: 2024-10-21
description: "An article condensing the important changes from the newest version of Vue"
author: "Bryce Stabenow"
image:
  url: "../../assets/threePointFive.jpg"
  alt: "Vue logo against a background of a city street at midnight"
tags: ["vue", "upgrading", "js frameworks", "web development"]
---

# What Can You Do with Vue 3.5?

<br>

Vue recently released long-awaited [version 3.5](https://blog.vuejs.org/posts/vue-3-5), and it's got some big and exciting changes. It's been over 4 years since the original release of Vue 3.0 which introduced the "new" Composition API, full Typescript support, and more.

<br>

But, as is often the case, new releases have hold outs. So today, let's cover what Vue 3.5 brings to the table that make it a worthwhile upgrade.

<br>

<br>

## My Personal Favorite New Feature: useTemplateRef()

<br>
There are a few features in Vue that drive me nuts, and referring to an DOM object in your script was one of them:

```vue
<template>
  <input ref="my-input" />
</template>
<script setup>
import { ref } from "Vue";

const myInput = ref(null); // What's this? Who knows!
</script>
```

<br>

Vue is wonderful and will tie our ref to it's matching HTML element in our template. But, it didn't allow us to do that explicitly until now. The new syntax allows us to use the following syntax and achieve the same end. Plus if that wasn't cool enough, the [language tools](https://github.com/vuejs/language-tools/pull/4644) also got an upgrade to support types coming from the DOM.

```vue
<template>
  <input ref="my-input" />
</template>
<script setup lang="ts">
import { useTemplateRef } from "Vue";

const myInput = useTemplateRef("my-input");
const val = myInput.value; // TS knows this is an InputHTMLAttribute!
</script>
```

<br>

## Destructure Your Props

<br>

Another annoyance (<span class="italic">I do actually like you, Vue, I promise</span>) is the repetition. This was a grip I still have to some degree with things like **ComputedRef** where we need to call `.value` 50 times in every component.

<br>

The real winner is that we are now able to destructure our props instead of needing to write them out many times over.

```vue
<script setup lang="ts">
interface Props {
  foo: string;
  bar: string;
  baz: string;
}

const props = defineProps<Props>();
console.log(props.foo, props.bar, props.baz);

// Now becomes...

const { foo, bar, baz } = defineProps<Props>();
console.log(foo, bar, baz);
</script>
```

![A chef's kiss GIF](../../assets/chefs_kiss.gif)

<br>

## Lazy Hydration

<br>
A bit less common because of Vue's progressive usage in most places, but for meta frameworks like Nuxt, this is a huge win. Server Side Rendering (SSR) with Nuxt is already wonderful, and any improvements here for the hydration is welcome. The example below allows for Vue to automatically fetch and hydrate components, only when they are visible on the screen.

```vue
<script setup>
import { defineAsyncComponent, hydrateOnVisible } from 'vue'

const AsyncComp = defineAsyncComponent({
  loader: () => import('./AsyncGuy.vue'),
  hydrate: hydrateOnVisible()
})
<script>
```

<br>

## Vue's Rewrite of the Reactivity System

And last but not least, Vue 3.5 also has (another) upgrade to the reactivity system. Which is fantastic, considering Vue was already one of the fastest frameworks for reactivity to begin with.

<div class="flex w-full justify-center"><blockquote class="twitter-tweet"><p lang="en" dir="ltr">React / Svelte / Vue Benchmark 📊<br><br>Your eyes are not deceiving you 👀 <br>Vue 3 is currently performing better than Svelte and React. <a href="https://t.co/E6H4OfqGp2">pic.twitter.com/E6H4OfqGp2</a></p>&mdash; :icarus.gk ⇏ ▿ (@icarusgkx) <a href="https://twitter.com/icarusgkx/status/1693620200543862852?ref_src=twsrc%5Etfw">August 21, 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script></div>

<br>

Evan You claims a 56% reduction in memory usage, and up to 10x performance in deeply nested arrays. Will it matter in most cases? No. Will it still make me dig on React for being slower? You betcha

<br>

<br>

<br>

So, there you have it. Vue has some great new features available now for you to try out. I'll be posting again when we finish our adoption of Vue 3.5 at work and update everyone on the lessons learned there.

<br/>

Until next time, peace
