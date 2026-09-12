import assert from 'node:assert/strict';
import test from 'node:test';

// @ts-expect-error Node's type-stripping test runner requires the explicit TS extension.
import { getSeatPositions, wrapViewAngle } from './seat-journey.ts';

void test('seat positions match the table capacity and stay inside the focus stage', () => {
  for (const capacity of [2, 4, 6, 8]) {
    const seats = getSeatPositions({ capacity, shape: capacity > 4 ? 'long' : 'round' });
    assert.equal(seats.length, capacity);
    assert.deepEqual(seats.map((seat) => seat.id), Array.from({ length: capacity }, (_, index) => index + 1));
    assert.ok(seats.every((seat) => seat.left >= 6 && seat.left <= 94 && seat.top >= 6 && seat.top <= 94));
  }
});

void test('long tables distribute seats across a wider horizontal orbit', () => {
  const round = getSeatPositions({ capacity: 4, shape: 'round' });
  const long = getSeatPositions({ capacity: 4, shape: 'long' });
  const roundWidth = Math.max(...round.map((seat) => seat.left)) - Math.min(...round.map((seat) => seat.left));
  const longWidth = Math.max(...long.map((seat) => seat.left)) - Math.min(...long.map((seat) => seat.left));
  assert.ok(longWidth > roundWidth);
});

void test('seat geometry does not mutate its input', () => {
  const table = Object.freeze({ capacity: 4, shape: 'square' as const });
  getSeatPositions(table);
  assert.deepEqual(table, { capacity: 4, shape: 'square' });
});

void test('view rotation wraps cleanly across both panorama edges', () => {
  assert.equal(wrapViewAngle(170, 30), -160);
  assert.equal(wrapViewAngle(-170, -30), 160);
  assert.equal(wrapViewAngle(15, 45), 60);
});
