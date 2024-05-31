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

test('concat iterates strings', async t => {
  assert.deepEqual(
    Array.from(Iterator.concat("ab", "cd")),
    ["a", "b", "c", "d"],
  );
});

test('concat bare iterators', async t => {
  let count = 0;
  const iter = {
    next() {
      if (count < 6) {
        return { done: false, value: count++ };
      } else {
        return { done: true };
      }
    },
  };
  assert.deepEqual(
    Array.from(Iterator.concat(
      iter,
      iter,
    )),
    [0, 1, 2, 3, 4, 5],
  );
});
