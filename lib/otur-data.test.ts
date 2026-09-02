import assert from 'node:assert/strict';
import test from 'node:test';

// @ts-expect-error Node's type-stripping test runner requires the explicit TS extension.
import { copy, localize, localizeTag, restaurants, type Language } from './otur-data.ts';

void test('AZ, EN and RU expose the same complete interface copy', () => {
  const englishKeys = Object.keys(copy.EN).sort();

  assert.deepEqual(Object.keys(copy.AZ).sort(), englishKeys);
  assert.deepEqual(Object.keys(copy.RU).sort(), englishKeys);
  for (const language of ['AZ', 'EN', 'RU'] as Language[]) {
    assert.equal(Object.values(copy[language]).every((value) => value.trim().length > 0), true);
  }
});

void test('the three restaurants have distinct spatial products and complete localized content', () => {
  assert.deepEqual(restaurants.map((restaurant) => restaurant.name), ['Şəki', 'Həyat', 'Xəzri']);
  assert.equal(new Set(restaurants.map((restaurant) => restaurant.planVariant)).size, 3);
  assert.equal(new Set(restaurants.map((restaurant) => restaurant.image)).size, 3);
  assert.equal(restaurants.every((restaurant) => restaurant.image.endsWith('.webp')), true);

  for (const restaurant of restaurants) {
    assert.equal(restaurant.tables.length >= 8, true);
    assert.equal(Math.max(...restaurant.tables.map((table) => table.capacity)) >= 8, true);
    assert.deepEqual(new Set(restaurant.tables.map((table) => table.scene)), new Set([0, 1, 2, 3]));
    assert.equal(restaurant.tables.every((table) => table.tags.length >= 2 && table.tags.length <= 3), true);
    for (const language of ['AZ', 'EN', 'RU'] as Language[]) {
      assert.equal(localize(restaurant.description, language).length > 0, true);
      assert.equal(restaurant.tags.every((tag) => localizeTag(tag, language).length > 0), true);
    }
  }
});
