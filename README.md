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

## Introduction

This library extends the `gun` chain so that you get an `on`-equivalent observable stream that is powered by [`most`](https://github.com/cujojs/most).

> Note: it depends on the 0.5 beta release of gun (`npm install amark/gun#0.5`)

## Installation

```
yarn add gun-most
```

Or, if you are using npm:

```
npm install gum-most -S
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
