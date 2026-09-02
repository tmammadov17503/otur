import assert from 'node:assert/strict';
import test from 'node:test';

import {
  clampGuestCount,
  filterRestaurants,
  getFirstAvailableTableId,
  isAzerbaijanPhone,
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

test('restaurant search understands names, cuisine and atmosphere without accents', () => {
  const restaurants = [
    { id: 'seki', name: 'Şəki', cuisine: 'Modern Azerbaijani', area: 'İçərişəhər', description: 'Warm and intimate', tags: ['Traditional', 'Quiet'] },
    { id: 'hayat', name: 'Həyat', cuisine: 'Seasonal grill', area: 'White City', description: 'A planted garden room', tags: ['Garden', 'Terrace'] },
    { id: 'xazri', name: 'Xəzri', cuisine: 'Coastal kitchen', area: 'Bayıl', description: 'Open Caspian atmosphere', tags: ['Sea view', 'Date night'] },
  ];

  assert.deepEqual(filterRestaurants(restaurants, 'sea view', ''), [restaurants[2]]);
  assert.deepEqual(filterRestaurants(restaurants, 'seki', ''), [restaurants[0]]);
  assert.deepEqual(filterRestaurants(restaurants, '', 'Garden'), [restaurants[1]]);
  assert.deepEqual(filterRestaurants(restaurants, '', 'Tonight'), restaurants);
});

test('availability differs consistently between restaurants and time slots', () => {
  const table = { id: 'T08', capacity: 4, baseAvailable: true };
  const base = { date: '2026-09-04', guests: 2 };

  const sekiAtSeven = isTableAvailableForSlot(table, { ...base, restaurantId: 'seki', time: '19:00' });
  const xazriAtSeven = isTableAvailableForSlot(table, { ...base, restaurantId: 'xazri', time: '19:00' });
  const sekiAtNineThirty = isTableAvailableForSlot(table, { ...base, restaurantId: 'seki', time: '21:30' });

  assert.notEqual(sekiAtSeven, xazriAtSeven);
  assert.notEqual(sekiAtSeven, sekiAtNineThirty);
});

test('first available table respects capacity and returns null when none fit', () => {
  const tables = [
    { id: 'T01', capacity: 2, baseAvailable: false },
    { id: 'T03', capacity: 4, baseAvailable: true },
  ];
  const slot = { restaurantId: 'seki', date: '2026-09-04', time: '20:00', guests: 3 };

  assert.equal(getFirstAvailableTableId(tables, slot), 'T03');
  assert.equal(getFirstAvailableTableId(tables, { ...slot, guests: 6 }), null);
});

test('Azerbaijan phone validation accepts formatted local numbers only', () => {
  assert.equal(isAzerbaijanPhone('+994 50 555 12 34'), true);
  assert.equal(isAzerbaijanPhone('050 555 12 34'), false);
  assert.equal(isAzerbaijanPhone('+994 12'), false);
});
