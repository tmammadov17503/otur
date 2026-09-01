import assert from 'node:assert/strict';
import test from 'node:test';

import { clampGuestCount, isTableSelectable } from './booking.js';

test('guest count stays between one and eight', () => {
  assert.equal(clampGuestCount(1, -1), 1);
  assert.equal(clampGuestCount(2, 1), 3);
  assert.equal(clampGuestCount(8, 1), 8);
});

test('only available tables can be selected', () => {
  assert.equal(isTableSelectable({ available: true }), true);
  assert.equal(isTableSelectable({ available: false }), false);
});
