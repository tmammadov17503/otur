import assert from 'node:assert/strict';
import test from 'node:test';

import {
  clampGuestCount,
  isTableAvailableForSlot,
  isTableSelectable,
} from './booking.js';

test('guest count stays between one and eight', () => {
  assert.equal(clampGuestCount(1, -1), 1);
  assert.equal(clampGuestCount(2, 1), 3);
  assert.equal(clampGuestCount(8, 1), 8);
});

test('only available tables can be selected', () => {
  assert.equal(isTableSelectable({ available: true }), true);
  assert.equal(isTableSelectable({ available: false }), false);
});

test('availability respects table capacity and base status', () => {
  const slot = { date: '2026-09-04', time: '19:30', guests: 4 };

  assert.equal(
    isTableAvailableForSlot({ id: 'T14', capacity: 2, baseAvailable: true }, slot),
    false,
  );
  assert.equal(
    isTableAvailableForSlot({ id: 'T14', capacity: 4, baseAvailable: false }, slot),
    false,
  );
});

test('availability changes deterministically with date and time', () => {
  const table = { id: 'T11', capacity: 4, baseAvailable: true };

  assert.equal(
    isTableAvailableForSlot(table, { date: '2026-09-04', time: '19:30', guests: 2 }),
    false,
  );
  assert.equal(
    isTableAvailableForSlot(table, { date: '2026-09-05', time: '19:30', guests: 2 }),
    true,
  );
});

test('availability remains stable when optional slot labels are incomplete', () => {
  assert.equal(
    isTableAvailableForSlot(
      { id: 'terrace', capacity: 4, baseAvailable: true },
      { date: '', time: '', guests: 2 },
    ),
    false,
  );
});
