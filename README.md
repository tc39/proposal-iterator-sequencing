Iterator Sequencing
===================

A TC39 proposal to create iterators by sequencing existing iterators.

**Stage:** 2

## motivation

Often you have 2 or more iterators, the values of which you would like to
consume in sequence, as if they were a single iterator. Iterator libraries (and
standard libraries of other languages) often have a function called `concat` or
`chain` to do this. In JavaScript today, one can accomplish this with generators:

```js
let lows = Iterator.from([0, 1, 2, 3]);
let highs = Iterator.from([6, 7, 8, 9]);

let lowsAndHighs = function* () {
  yield* lows;
  yield* highs;
}();

Array.from(lowsAndHighs); // [0, 1, 2, 3, 6, 7, 8, 9]
```

It is also useful to be able to sequence immediate values among the iterators,
as one would do with `yield` using the generator approach.

```js
let digits = function* () {
  yield* lows;
  yield 4;
  yield 5;
  yield* highs;
}();

Array.from(digits); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```

We should explore how to make this more ergonomic and functional.

## chosen solution

See the [June 2024 presentation to committee](https://docs.google.com/presentation/d/1gOs4UDAcaIF6Dc9z1qXus-ljizrRTSty5O-GbcM9NTs).

```js
let digits = Iterator.concat(lows, [4, 5], highs);
```

```js
function* p() {
  for (let n = 1;; ++n) {
    yield Array(n).fill(n);
  }
}
let repeatedNats = p().flatMap(x => x);
```

## considered design space

- make `Iterator.from` variadic
  - `Iterator.from(as, bs, cs)`
- add `Iterator.prototype.concat`/`append`/`chain`
  - `as.concat(bs).concat(cs)`
  - have to already have an iterator for this
  - `concat` may make some people think that it accepts non-iterators, as analogue to `Array.prototype`
- add `Iterator.of` for lifting immediate values to an iterator
  - `Iterator.of(as, bs, cs).flatMap(x => x)`
  - add `Iterator.prototype.flat` to eliminate the identity function
  - is it actually that much better than `[as, bs, cs].values()`?
- add `Iterator.concat(xs)`
  - short for `Iterator.from(x).flat()`
- do we close iterators that haven't been consumed when the result iterator is closed?

## prior art

### other languages

| language | data type    | exactly 2     | arbitrary |
|----------|--------------|---------------|-----------|
| Clojure  | lazy seq     |               | `concat`  |
| Elm      | List         | `append`/`++` | `concat`  |
| Haskell  | Semigroup    | `<>`          | `mconcat` |
| OCaml    | Seq          | `append`      | `concat`  |
| Python   | iterator     |               | `chain`   |
| Ruby     | Enumerable   |               | `chain`   |
| Rust     | Iterator     | `chain`       | `flatten` |
| Scala    | Iterator     | `concat`/`++` |           |
| Swift    | LazySequence |               | `joined`  |

### JS libraries

| library                    | exactly 2                  | arbitrary     |
|----------------------------|----------------------------|---------------|
| @softwareventures/iterator | `prependOnce`/`appendOnce` | `concatOnce`  |
| extra-iterable             |                            | `concat`      |
| immutable.js               |                            | `Seq::concat` |
| iterablefu                 |                            | `concatenate` |
| itertools-ts               |                            | `chain`       |
| lodash                     |                            | `flatten`     |
| ramda                      | `concat`                   | `unnest`      |
| sequency                   | `plus`                     |               |
| wu                         |                            | `chain`       |
