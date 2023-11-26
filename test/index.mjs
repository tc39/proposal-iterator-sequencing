import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import '../lib/index.js';

test('concat', async t => {
  assert.deepEqual(
    Array.from(Iterator.concat([])),
    [],
  );
  assert.deepEqual(
    Array.from(Iterator.concat([
      [0, 1, 2],
    ])),
    [0, 1, 2],
  );
  assert.deepEqual(
    Array.from(Iterator.concat([
      [0, 1, 2],
      [3, 4, 5],
    ])),
    [0, 1, 2, 3, 4, 5],
  );
});

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