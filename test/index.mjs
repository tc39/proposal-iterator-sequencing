import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import '../lib/index.js';

test('basic', async t => {
  assert.deepEqual(
    Array.from(Iterator.concat(
      [0, 1, 2],
      [3, 4, 5],
    )),
    [0, 1, 2, 3, 4, 5],
  );
});