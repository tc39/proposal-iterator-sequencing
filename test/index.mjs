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

test('closes later iterators', async t => {
  await t.test('stopped between iterators', () => {
    let returned = [];
    let concatted = Iterator.concat(
      [0, 1],
      [2, 3],
      {
        next() {
          return { done: false, value: 'a' };
        },
        return() {
          returned.push('a');
          return { done: true, value: undefined };
        },
      },
      {
        next() {
          return { done: false, value: 'b' };
        },
        return() {
          returned.push('b');
          return { done: true, value: undefined };
        },
      },
      {
        next() {
          return { done: false, value: 'c' };
        },
        return() {
          returned.push('c');
          return { done: true, value: undefined };
        },
      },
    );
    assert.equal(concatted.next().value, 0);
    assert.equal(concatted.next().value, 1);
    assert.equal(concatted.next().value, 2);
    assert.equal(concatted.next().value, 3);
    assert.deepEqual(returned, []);
    concatted.return();
    assert.deepEqual(returned, ['a', 'b', 'c']);
  });

  await t.test('stopped during iteration', () => {
    let returned = [];
    let concatted = Iterator.concat(
      [0, 1],
      [2, 3],
      {
        next() {
          return { done: false, value: 4 };
        },
        return() {
          returned.push('a');
          return { done: true, value: undefined };
        },
      },
      {
        next() {
          return { done: false, value: 'b' };
        },
        return() {
          returned.push('b');
          return { done: true, value: undefined };
        },
      },
      {
        next() {
          return { done: false, value: 'c' };
        },
        return() {
          returned.push('c');
          return { done: true, value: undefined };
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
    assert.deepEqual(returned, ['a', 'b', 'c']);
  });
});