---
title: 'Creating Custom PHP Stan Rules For Static Analysis'
pubDate: 2024-05-03
description: 'A quick tutorial on how to create your own PHP Stan rules to help enforce custom rules in your codebase'
author: 'Bryce Stabenow'
image:
    url: '../../assets/static-analysis.jpg'
    alt: 'A sunset, which is silhouetting two elephants'
tags: ["testing", "unit testing tips", "static analysis", "php", "phpstan", "tooling"]
---
# Creating Custom PHP Stan Rules For Your Codebase

<br/>

## Static Analysis with PHP Stan

One of the most helpful things you can do for codebase is introduce _static analysis tools_. These are tools that look at your code not to determine runtime errors, but to check if it follows certain syntactical rules. Psalm and [PHP Stan](https://phpstan.org/) are the main choices for most Laravel/PHP applications, but you may also recognize Eslint, Rust-Analyzer, and even Typescript itself. First, let's see why this could be useful.

<br />

<br />

### An Example in Code

We recently ran into this bug in our software when we reset a user's subscription information after their automatic renewal:
```php
$subscriptionStart = Carbon::now();
$subscriptionExpiration = $subscriptionStart->addYear();

/* other code */

$userSubscription->update([
    'purchased_at'  => $subscriptionStart,
    'expires_at'    => $subscriptionExpiration
]);
```
It looks fine at first glance, and unfortunately wasn't caught in the tests that were written since it runs successfully. However, there's a nasty bug here. 

<br/>

**Carbon** is a common datetime package for PHP/Laravel projects, but has some quirks--one of which is that it is mutable by default. This means that our first call to `Carbon::now()` has accidentally been changed by the second line instead of returning a new copy of the date.

<br />

Carbon does have a way we can avoid this, which is just making sure that we use a `CarbonImmutable` class instead.
```php
// No more bugs!
$subscriptionStart = CarbonImmutable::now();
$subscriptionExpiration = $subscriptionStart->addYear();
```
Okay, great! We've fixed the problem. But how can prevent this in the future 🤔?

<br />

<br />

## Creating Custom PHP Stan Rules

The strategy we decided to take, is to always use the `CarbonImmutable` class instead of the base `Carbon` class. PHP Stan is extendable in that it lets us create custom rules, provided that we know how to write them. Let's make a custom rule that will allow us to check that we only use the right class.

<br />

### Writing a Test File

First things first, let's decide what we need to test. We'll create a new file with a class that's violating this rule. Here, we import Carbon to use as the return value:
```php
// tests/phpstan/no-carbon-imports.php

use Carbon\Carbon;

class Foo {
    public function getTime(): Carbon{
        return Carbon::now();
    }
}

```
We need to set up a couple more files as well. We need the actual test itself, and we need to update the PHP Stan config file. Let's create our new rule first:
```php
// App\Support\phpstan\NoCarbonImports.php
namespace App\Support\phpstan;

use PhpParser\Node;
use PHPStan\Analyser\Scope;
use PHPStan\Rules\Rule;

class NoCarbonImports implements Rule {
    public function getNodeType(): string{
        return \PhpParser\Node::class;
    }
    
    public function processNode(Node\Expr|Node $node, Scope $scope): array{
        var_dump($node);
        return [];
    }
}

```

and update our Stan config:
```
// phpstan.dist.neon
rules:
    - App\Support\phpstan\NoCarbonImports

```

<br />

### Analyzing the Syntax

Great, now let's start checking the file. We can run the following command to analyze only our Foo class, which will dump all of the node information from our syntax parser. 

<br />

`vendor/bin/phpstan analyse -l 8 --debug /tests/phpstan/no-carbon-imports.php`

<br />

This will output the names of the file's nodes and their types. Essentially, these static analysis tools focus on the structure of your code, using what's called an [Abstract Syntax Tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree). If you've written a compiler or transplier before, you'll recognize this concept. Ours should be the first line or two of our test file output, and we'll quickly see the node of our AST we want to use, a `PhpParser\Node\Stmt\UseUse::class`. Let's add that to our rule:
```php
public function getNodeType(): string{
    return \PhpParser\Node\Stmt\UseUse::class;
}
```
Depending on what we need to check, we might have to dig deeper into the node structure to find what we are looking for. For something like checking the return types of functions, it would be more complicated. In our case, we just want to get the name of this node and then look at each section of the name. Let's dump that and take a look:
```php
public function processNode(Node\Expr|Node $node, Scope $scope): array{
    var_dump($node->name->parts); // ['Carbon', 'Carbon']
    return [];
}
```

<br />

### Creating Our Rule

Now we need to write our rule. We want to check if we have an import from `Carbon` that is not using `CarbonImmutable`. If we have no errors, we return an empty array. If we do have errors, we need to return a `RuleErrorBuilder` which is part of PHP Stan.

<br />

Here's what our finished rule looks like:
```php
// App\Support\phpstan\NoCarbonImports.php
namespace App\Support\phpstan;

use PhpParser\Node;
use PHPStan\Analyser\Scope;
use PHPStan\Rules\Rule;
use PHPStan\Rules\RuleErrorBuilder;

class OnlyCarbonImmutableImports implements Rule {
    public function getNodeType(): string{
        return \PhpParser\Node\Stmt\UseUse::class;
    }
    
    public function processNode(Node\Expr|Node $node, Scope $scope): array{
        $importSections = $node->name?->parts ?? [];
        
        if(array_search('Carbon', $importSections, true) !== false &&
           array_search('CarbonImmutable', $importSections, true) === false
        ){
            return [
                RuleErrorBuilder::message(
                    'Cannot use Carbon\Carbon, only CarbonImmutable and CarbonInterface imports are allowed'
                )->build(),
            ];
        }
        
        return [];
    }
}

```

<br />

### Updating Our Baseline
All that's left to do is update our baseline file. We'll run the following:

<br />

`vendor/bin/phpstan analyse clear-result-cache && vendor/bin/phpstan analyse --generate-baseline`

<br />

This will create a new `phpstan-baseline.neon` file in our repo so that we can prevent the issue now and have a backlog of places to solve this in the future!

<br />

<br />

## Conclusion

Using static analysis tools to create these custom rules can be a fantastic way to clean up your codebase and make sure things aren't missed in code review. If you're interested in learning more about Abstract Syntax Trees or PHP Stan rules, check out [their documentation](https://phpstan.org/developing-extensions/abstract-syntax-tree) to see a bit more behind the scenes. 

<br />

I also recommend spending some time writing a compiler. [I recently completed one in Rust](https://github.com/Bryce-Stabenow/rust-compiler-for-tiny-basic) if you'd like to check it out! It taught me a great deal about AST parsing and understanding how code syntax takes its shape. 

<br/>

Until next time, peace.