---
title: "Out with Vibe Coding, in with Rage Coding"
pubDate: 2026-10-28
description: "Why you should replace your vibe coding with rage coding"
author: "Bryce Stabenow"
image:
  url: "../../assets/too-angry-to-die.jpeg"
  alt: ""
tags: ["ai", "software development", "vibe coding", "rant"]
---
# Out with Vibe Coding, in with <span style="color: #F52;">Rage Coding</span>

<br>

It feels like recently the following is happening more and more. Imagine yourself on a work call. Maybe it's triaging an issue on Sentry, or reviewing code before a deployment (doesn't matter). Inevitably, a question comes up:

<br>

> So, how does this work?

<br>

Silence fills the air. Cameras turn off. People furiously pass that question to Claude in hopes he saves them--but he shan't.

<br>

What becomes obvious in these moments is that _no one knows how any of it works any more_.

<br>
<br>

## The Disconnect

<br>

Until now, the writer of code _had_ to understand at least part of what their code was doing. You had to think with your brain and write it. The idea you would be able to do that without understanding it is impossible. What __was__ possible was missing side effects or writing code that works differently than how you expected. But still, you at least knew the files and the code.

<br>

That concept no longer holds true; it's no longer required for a developer to understand:
1. What they wrote
2. Where it was written
3. How to fix it

<br>

AI has made the gap between skill and understanding wider than ever. It can triage, analyze, write, and test at superhuman speeds and doesn't need to sleep or grab lunch or scroll Twitter. The kicker is that _it doesn't actually understand what it's writing either._ LLMs do not understand what they write, even though what they do is amazing. That means that no one, neither man nor machine, understands what is happening anymore.

<br>

> It's too much to go into here, but I encourage you to check out [Loren Kohnfelder's report on role confusion](https://designingsecuresoftware.com/writings/role-confusion/), or the wonderful Steve Gibson on [Security Now](https://youtu.be/X6722esC4GM?t=5560) to learn more about how this ^ all works.

<br>

<br>

## So, This is AI's Fault?

<br>

![Bugs bunny saying "no"](../../assets//bugs-bunny-no.jpg)

<br>

This is not an anti-AI post. It's a tool, and saying that AI is the reason for all of the slop being shipped is like blaming cars for motor accidents. Without cars, car accidents would not exist--without AI, AI-slop would not exist.

<br>

The connection in both cases is the what really bears the responsibility. __The driver.__

<br>
<br>

## Jesus Take the Wheel

<br>

A lot of developers I know and see online treat AI tools like autopilot mode. And let's be real: it's _can_ produce high quality code on it's own that fits exactly what is needed. That's not what I plan to argue here.

<br>

The problem is that the planning and the critical thinking is still absent in many places. Claude and ChatGPT will give working code, but the extensibility and maintainability of that code is usually shoddy. 

<br>

The ability to know ahead of time and plan for what might be needed in the future is what separated experienced developers in the past from the lot, and it's the value that we still provide today.

<br>

One of the most important things I learned in my first few years as a developer is how to ask the right questions about the code you wrote. "Does this work?" is not one of those questions. The important questions are about how to structure and plan code, and once you have it written, how to tear it down and start over. Just like when writing a blog like this or an email to a coworker, there needs to be a process of revision, editing, and pruning.

<br>
<br>

## How to Rage

<br>

![Arthur's first shaking with rage](../../assets//arthur-first.gif)

<br>

So, where does this leave us? How do we fight against this overwhelming and attractive force of laziness?

<br>

### 1. Write it Yourself

<br>

It doesn't need to be all the time, but I encourage you to hand-code some of your own work. Don't pass off things like editing or small tweaks to AI, handle it on your own. Perhaps it feels a bit slow or silly, but there is something about ownership that comes from physically typing things out.

<br>

Not everyone has the ability to do this. There are deadlines and sprint points and AI-crazed executives pushing hard to get things done. I get it. I've lived it.

<br>

And maybe work is not the place to express this practice whole-heartily, but there are still other places to use your discretion. Use your own real brain to architect and plan things. You'll end up doing a better job than AI and you'll actually sharpen your own skills in the process.

<br>

### 2. Create Good Plans

<br>

Speaking of planning, this is critical to preventing slop. At the moment, this is where the largest gap exists that skilled brains are still required to fill. Even if you tell Claude to do certain things, it may still go sideways on you or change it's "mind". 

<br>

If you can create a plan before starting, the end result is always much better. I recently re-read _Clean Architecture_ by Uncle Bob, which has this fantastic quote:

<br>

> "A good architecture allows you to defer critical decisions for as long as possible [...] Good architecture maximizes the number of decisions not made."

<br>

The importance of this can't be understated. Claude wants clear requirements, with decisions you make before it starts on anything. Fight that. Imagine how to design the system without needing to answer those questions, and suddenly you'll land closer to the right answer anyway.

<br>

### 3. Throw it All Away

<br>

> Talk is cheap, so is code

<br>

Code used to be very expensive, and took a lot of resources and time to generate. That's no longer true. 

<br>

AI code is cheap, and spinning up an entire project just to explore an idea that can be thrown away afterwards is totally valid and viable. Treating the code like this actually changes a lot, and it lets us be more free.

<br>

Let's say you are reviewing someone's code on your team and have a lot of comments about how it was built. Giving that feedback to a human is tricky, and the changes that it requires would take a lot of time and energy. But yelling at an AI to fix it decisions is nearly free, and no one's feeling are hurt in the process.

<br>

You have to put yourself in the mindset that code is no longer a sacred cow, and blowing things up or rewriting them when you don't like the approach can help to vastly improve what you end up with. But perhaps the biggest benefit is that it still helps to hone your taste. 

<br>

Stephen King said that the best writers are just the best readers, and I think that can apply to us as well. We don't need to be the speediest coders to get the job done well, as long as we keep our standards high and review and read as much as we can.

<br>
<br>

## In Closing

<br>

Don't be afraid to rage: throw it all out, and re-write it yourself with a solid plan. You'll end up far ahead of where you started with less slop and more pride.

<br>

Until next time.