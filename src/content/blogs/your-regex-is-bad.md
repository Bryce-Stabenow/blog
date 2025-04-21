---
title: "Your regex is bad, and you should feel bad"
pubDate: 2024-06-26
description: "Why your regexes are terrible and how you can improve them"
author: "Bryce Stabenow"
image:
  url: "../../assets/regex-meme.jpg"
  alt: ""
tags: ["regex", "code smell", "refactoring", "best practices"]
---

# 5 Tips for Improving your Regexes

<br/>

There's an old saying that goes something like this:

<br/>

> "We had a problem, so we used a regex to solve it. Now we have two problems

<br/>

It just so happened that this week, we had not one but _two_ different issues related to regex. Bugs can crop up at any point in software, but I think regexes are a extra weak point for most developers and teams.

<br/>

Kevin Fang did a [recent Youtube video](https://www.youtube.com/watch?v=DDe-S3uef2w) about a problem that Cloudflare had with a regex of theirs. This caused a massive outage of internet services across the globe and cost billions of dollars in lost revenue. So, how come no one noticed? Let's have a little exercise and find out! Here's the regex in question:

```js
/(?:(?:\"|'|\]|\}|\\|\d|(?:nan|infinity|true|false|null|undefined|symbol|math)|\`|\-|\+)+[)]*;?((?:\s|-|~|!|{}|\|\||\+)*.*(?:.*=.*)))/;
```

(sidenote: I was going to break this into two lines but I think it helps make my point even more if I don't)

<br/>

If you found the bug, congratulations, there's probably a spot for you at Cloudflare. For those of us normies, the problem lies in the end section here `*(?:.*=.*)` This line would eventually lead to a backtracking regex that exploded the entire internet. But the regex isn't the real problem. Computers only do what we tell them to, so it's the programmer and the team that are responsible. With that in mind, we should discuss a few tips to solve your terrible regex problems and hopefully help your team as well:

<br/>

## 1. Use a Regex tool, every time

<br/>

Listen, you're a modern developer in an age of modern tooling. So why not step up your regex with some great tooling too? My preferred tool is a website called [Regex101](https://regex101.com/). Not only does it have helpful reminders about regex options, but it is delightful and easy to use. The best tip is to copy and past as many examples into the text section as you can so that you can make sure your regex will work in all scenarios

<br/>

## 2. Ask for detailed reviews

<br/>

The Cloudflare example probably went unnoticed because of a lack of review. When you see a 40+ character regex, eyes will naturally glaze over and suddenly your Twitter feed is calling your name. Fight that urge! When you see a regex from another developer, pop it into Regex101 or take a detailed look. It's a great place to catch bugs and help others grow.
<br />

On the flip side, make sure when you write a regex that you have the proper review as well. Make sure to leave a comment in merge/pull requests asking for feedback on improving your regexes or double-checking that it looks appropriate. This is a good time to consult tip #5 as well...

<br/>

## 3. Leave comments with your intentions

<br/>

Whenever you write a regex, I find it helpful in the future to have comments explaining as much as you can about the targeted text you are reaching. The regex can be explained fine with other tools, but describing the input or even giving an example can go a long way to helping others understand your code, and also helps to make sure that you have thought through every choice you made.

<br/>

## 4. Run your regex through static analysis

<br/>

Tools like Sonar are also a great option. Static analysis can detect issues like the one shown above by checking for certain patterns in a regex that could cause infinite backtracking. However, use this as last resort of sort. Static analysis won't catch terrible regex code that takes 10,000 steps to find a number, even though it may stop a completely broken regex.

<br/>

## 5. Don't write a Regex at all

<br/>

This is not the section where I tell you to use ChatGPT. In fact, never ask ChatGPT for a regex unless you would like to fork-bomb yourself by accident.

<br/>

Instead, you should reconsider what you are using the regex for to begin with. If you are parsing unknown information from input, then a regex may be your best bet, but otherwise it's usually wise to look for other solutions. Consider trying to use a parsing library, or something to transform your input into an abstract syntax tree. It might be overly complex for most purposes, but there's nothing worse than a slow regex bringing down your code.

<br/>

Good luck with your future regex issues.

<br/>

Until next time, peace.