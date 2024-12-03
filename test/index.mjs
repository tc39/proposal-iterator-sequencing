import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import '../lib/index.js';

test('concat', async t => {
  assert.deepEqual(
    Array.from(Iterator.concat()),
    [],
  );
  assert.deepEqual(
    Array.from(Iterator.concat(
      [0, 1, 2],
    )),
    [0, 1, 2],
  );
  assert.deepEqual(
    Array.from(Iterator.concat(
      [0, 1, 2],
      [3, 4, 5],
    )),
    [0, 1, 2, 3, 4, 5],
  );
  assert.deepEqual(
    Array.from(Iterator.concat(
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
    )),
    [0, 1, 2, 3, 4, 5, 6, 7, 8],
  );
});

test('concat does not iterate strings', async t => {
  assert.throws(
    () => Iterator.concat("ab", "cd"),
    TypeError,
  );
});

test('re-uses IteratorResult objects', async t => {
  const iterResult = { done: false, value: 0 };
  const iter = Iterator.concat({
    [Symbol.iterator]() {
      return {
        next() {
          return iterResult;
        },
      };
    },
  });
  assert.equal(
    iter.next(),
    iterResult,
  );
});

test('closes open iterators', async t => {
  await t.test('stopped between iterators', () => {
    let returned = [];
    let concatted = Iterator.concat(
      [0, 1],
      [2, 3],
      {
        [Symbol.iterator]() {
          return {
            next() {
              return { done: false, value: 4 };
            },
            return() {
              returned.push('a');
              return { done: true, value: undefined };
            },
          };
        },
      },
    );
    assert.equal(concatted.next().value, 0);
    assert.equal(concatted.next().value, 1);
    assert.equal(concatted.next().value, 2);
    assert.equal(concatted.next().value, 3);
    assert.deepEqual(returned, []);
    concatted.return();
    assert.deepEqual(returned, []);
  });

  await t.test('stopped during iteration', () => {
    let returned = [];
    let concatted = Iterator.concat(
      [0, 1],
      [2, 3],
      {
        [Symbol.iterator]() {
          return {
            next() {
              return { done: false, value: 4 };
            },
            return() {
              returned.push('a');
              return { done: true, value: undefined };
            },
          };
        },
      },
      {
        [Symbol.iterator]() {
          return {
            next() {
              return { done: false, value: 'b' };
            },
            return() {
              returned.push('b');
              return { done: true, value: undefined };
            },
          };
        },
      },
    );
    assert.equal(concatted.next().value, 0);
    assert.equal(concatted.next().value, 1);
    assert.equal(concatted.next().value, 2);
    assert.equal(concatted.next().value, 3);
    assert.equal(concatted.next().value, 4);
    assert.deepEqual(returned, []);
    concatted.return();
    assert.deepEqual(returned, ['a']);
    concatted.return();
    assert.deepEqual(returned, ['a']);
  });
});
