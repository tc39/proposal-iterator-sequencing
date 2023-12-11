import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import '../lib/index.js';

// test('concat', async t => {
//   assert.deepEqual(
//     Array.from(Iterator.concat([])),
//     [],
//   );
//   assert.deepEqual(
//     Array.from(Iterator.concat([
//       [0, 1, 2],
//     ])),
//     [0, 1, 2],
//   );
//   assert.deepEqual(
//     Array.from(Iterator.concat([
//       [0, 1, 2],
//       [3, 4, 5],
//     ])),
//     [0, 1, 2, 3, 4, 5],
//   );
// });

test('from', async t => {
  assert.deepEqual(
    Array.from(Iterator.from()),
    [],
  );
  assert.deepEqual(
    Array.from(Iterator.from(
      [0, 1, 2],
    )),
    [0, 1, 2],
  );
  assert.deepEqual(
    Array.from(Iterator.from(
      [0, 1, 2],
      [3, 4, 5],
    )),
    [0, 1, 2, 3, 4, 5],
  );
});

function* p(n) {
  for (let count = n; count > 0; --count) {
    yield n;
  }
}

function* nats() {
  let n = 0;
  while (true) {
    yield n;
    ++n;
  }
}

function* take(n, iter) {
  for (let count = 0; count < n; ++count) {
    let result = iter.next();
    if (result.done) break;
    yield result.value;
  }
}

test('flat', async t => {
  assert.deepEqual(
    Array.from(take(10, [
      p(3), p(0), p(1), nats()
    ].values().flat())),
    [3, 3, 3, 1, 0, 1, 2, 3, 4, 5],
  );
});