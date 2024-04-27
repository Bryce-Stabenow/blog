---
title: 'Testing for Graceful Program Exits in Rust'
pubDate: 2024-04-27
description: 'This post describes the best ways to approach testing code paths in Rust where you would normally fail gracefully'
author: 'Bryce Stabenow'
image:
    url: '../../assets/favicon-max.jpg'
    alt: 'The full Astro logo.'
tags: ["testing in rust", "unit testing tips", "rust testing", "panic during testing rust"]
---
# Testing for Graceful Program Exits in Rust

<br/>

## The Problem

I was recently working on a compiler written in Rust, and ran into an annoying problem. I wanted nice error messaging for my users, but found it tricky to test. Take for instance the following section, where I check if we would possibly have a redeclared label:

```rust
TokenType::LABEL => {
    self.next_token();

    let text = &self.current_token_text();

    if self.declared_labels.contains(text) {
        println!("Redeclaration of label: {}", text);
        abort();
    }

    self.declared_labels.insert(text.clone());
    self.emit.emit(text);
    self.emit.emit_line(":");
    self.match_token(TokenType::IDENT);
}
```

This checks our declared labels, and gracefully exits the parser after printing a message to stdout. This works well, but it's impossible to test.

<br/>

Because Rust runs it's test threads in the same as the code execution, this `abort()` function will end the test entirely without returning a failure. That's fine for users, but not for our needs

<br/>

<br/>

## The Solution

Without rewriting our return values, we can use Rust's annotations to trigger a branching code path based on the configuration. It's a bit uglier to look at, but it allows us to make sure we are testing correctly:

```rust
    if self.declared_labels.contains(text) {
        println!("Redeclaration of label: {}", text);
        #[cfg(not(test))] // Running as command
        abort();

        #[cfg(test)] // Running in test
        panic!("Redeclared Label");
    }
```

Now we can properly check in our test that it's failing where it should:

```rust
    #[test]
    #[should_panic(expected = "Redeclared Label")]
    fn it_breaks_on_redeclared_labels() {
        parse("test_files/redeclare.txt");
    }
```

Nice! Now we can test for a panic while making sure that we are keeping that code out of sight for users.