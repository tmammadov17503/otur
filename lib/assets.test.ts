import assert from 'node:assert/strict';
import test from 'node:test';

// @ts-expect-error Node's type-stripping test runner requires the explicit TS extension.
import { assetUrl } from './assets.ts';

void test('assetUrl keeps root-hosted assets absolute', () => {
  assert.equal(assetUrl('/og.png', '/'), '/og.png');
  assert.equal(assetUrl('restaurants/seki-grid.png', '/'), '/restaurants/seki-grid.png');
});

void test('assetUrl prefixes assets for a GitHub Pages project path', () => {
  assert.equal(assetUrl('/og.png', '/otur/'), '/otur/og.png');
  assert.equal(assetUrl('restaurants/seki-grid.png', '/otur'), '/otur/restaurants/seki-grid.png');
});

void test('assetUrl normalizes repeated separators', () => {
  assert.equal(assetUrl('///favicon.svg', '//otur///'), '/otur/favicon.svg');
});
