# gun-most

Extends gunDB with the ability to chain into most.js observables.

[![npm](https://img.shields.io/npm/v/gun-most.svg?style=flat-square)](http://npm.im/gun-most)
[![MIT License](https://img.shields.io/npm/l/gun-most.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Travis](https://img.shields.io/travis/ctrlplusb/gun-most.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/gun-most)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/gun-most.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/gun-most)

## TOCs

  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API](#api)
  - [Avoiding Memory Leaks](#avoiding-memory-leaks)

## Introduction

This library extends the `gun` chain so that you get an `on`-equivalent observable stream that is powered by [`most`](https://github.com/cujojs/most).

> Note: it depends on the 0.5 beta release of gun (`npm install amark/gun#0.5`)

## Installation

```
yarn add gun-most
```

Or, if you are using npm:

```
npm install gun-most -S
```

## Usage

```js
import 'gun-most';
import Gun from 'gun/gun';

const gun = Gun();

const favouriteFruit = gun.get('me').path('favouriteFruit');

// Create a most stream against the item.
const favouriteFruit$ = favouriteFruit.most();

// You now have access to all the most.js operators!
// https://github.com/cujojs/most/blob/master/docs/api.md

// Start listening to our stream.
favouriteFruit$.observe(x => console.log(x));

favouriteFruit.put('banana');
favouriteFruit.put('orange');
```

This will result in a console output of:

```
banana
orange
```

You can also work against sets:

```js
import 'gun-most';
import Gun from 'gun/gun';

const gun = Gun();

const fruitStock = gun.get('stock').path('fruit');

// Let's create a most stream over our stock that will warn
// us when our stock count for any fruit hits 0.
fruitStock
  // Use gun's map so we map over each fruit item in the set.
  .map()
  // Convert the result to a most stream
  .most()
  // Now we are in the land of most operators.
  // https://github.com/cujojs/most/blob/master/docs/api.md
  // Filter down to items with count being 0
  .filter(x => x.count === 0)
  // Print a warning!
  .observe(({ name }) => console.log(`"${name}" is out of stock!`));

const banana = favouriteFruit.set({ name: 'banana', count: 100 });
const orange = favouriteFruit.set({ name: 'orange', count: 1337 });

banana.path('count').put(0);
```

This will result in a console output of:

```
"banana" is out of stock!
```

## API

### `.most([config])`

The chain operator attached to `gun` which creates a `most` Observable stream against the current `gun` context.

#### Arguments

  - `config` _(Object)_: The configuration object with the following properties:
    - `[completeToken]` _(CompleteToken)_: The `CompleteToken` instance that can be used to explicitly complete the `most` stream and prevent memory leaks from occurring. See [here](#avoiding-memory-leaks) for more info.
    - `[options]` _(Object)_: The options that should be provided to the `gun` listener. i.e. the equivalent options that are provided to the [`.on`](https://github.com/amark/gun/wiki/API-(v0.3.x)#on) operator.

#### Example

```js
const stream = gun.get('foo').most({ completeToken });
stream.observe(data => console.log(data));
```

### `CompleteToken()`  

Constructor function used to produce "complete token" instances to be provided to the `.most()` operator.

Please read the ["Avoiding Memory Leaks"](#avoiding-memory-leaks) documentation below for more information.

## Avoiding Memory Leaks

After establishing a stream against `gun` there is no way for the stream to know when to end unless all the observers attached to the stream use a "completing" operator such as [`take`](https://github.com/cujojs/most/blob/master/docs/api.md#take) or [`until`](https://github.com/cujojs/most/blob/master/docs/api.md#until). If the observers don't complete then the stream will continuously run, which can cause a memory leak to occur.

If you pass streams outside of the scope of your function it can be very hard to ensure that observers are using completing operators. Therefore we have created a helper called `CompleteToken` to provide you with the ability to complete/dispose streams.  It is used like so:

```js
import { CompleteToken } from 'gun-most';

// Create a complete token.
const completeToken = CompleteToken();

// Ensure you pass it via the config object to the most operator
//                                       👇
const stream = gun.get('foo').most({ completeToken });

// An observer
stream.observe(() => console.log('nothing'))
  // Observers return promises that are resolved when the
  // stream completes.
  .then(() => console.log('completed'));

// Running the following will complete the stream and
// complete all observers.
completeToken.complete();
```

You have been warned and you have the tools available! 😀
