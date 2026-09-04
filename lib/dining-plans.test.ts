import assert from 'node:assert/strict';
import test from 'node:test';
// @ts-expect-error Node's type-stripping test runner requires the explicit TS extension.
import { createCalendar, createPlanUrl, getBakuDate, parseFavorites, parseSharedPlan, recommendTable, toggleFavorite } from './dining-plans.ts';

const plan = { restaurantId: 'seki', tableId: 'S02', date: '2026-09-12', time: '20:00', guests: 2 };
const venues = [{ id: 'seki', tables: [{ id: 'S02' }] }];
const slots = ['19:00', '20:00'];
const tables = [
  { id: 'S03', capacity: 4, available: true, tags: ['window'] },
  { id: 'S02', capacity: 2, available: true, tags: ['window', 'quiet'] },
  { id: 'S08', capacity: 2, available: false, tags: ['terrace'] },
];

void test('table suggestions respect preference, availability and party size without mutating data', () => {
  const before = JSON.stringify(tables);
  assert.equal(recommendTable(tables, 2, 'window')?.id, 'S02');
  assert.equal(recommendTable(tables, 4, 'any')?.id, 'S03');
  assert.equal(recommendTable(tables, 2, 'terrace'), null);
  assert.equal(recommendTable(tables, 8, 'any'), null);
  assert.equal(recommendTable([], 2, 'any'), null);
  assert.equal(JSON.stringify(tables), before);
});

void test('favorites recover safely from malformed browser storage and ignore unknown IDs', () => {
  assert.deepEqual(parseFavorites(null), []);
  assert.deepEqual(parseFavorites('{broken'), []);
  assert.deepEqual(parseFavorites('{}'), []);
  assert.deepEqual(parseFavorites('["seki","seki","hayat","unknown",4]'), ['seki', 'hayat']);
  const saved = ['seki'];
  assert.deepEqual(toggleFavorite(saved, 'hayat'), ['seki', 'hayat']);
  assert.deepEqual(toggleFavorite(saved, 'seki'), []);
  assert.deepEqual(toggleFavorite(saved, 'unknown'), saved);
  assert.deepEqual(saved, ['seki']);
});

void test('Baku dates use the destination time zone across a UTC day boundary', () => {
  assert.equal(getBakuDate(new Date('2026-09-03T21:00:00Z')), '2026-09-04');
});

void test('shared plans preserve the project path but never include guest contact information', () => {
  const url = createPlanUrl('https://example.test/otur/?email=private#top', { ...plan, name: 'Private' });
  assert.equal(new URL(url).pathname, '/otur/');
  assert.equal(new URL(url).hash, '#restaurant');
  assert.equal(url.includes('private'), false);
  assert.equal(url.includes('name'), false);
  assert.deepEqual(parseSharedPlan(new URL(url).search, venues, slots, '2026-09-03'), plan);
  assert.throws(() => createPlanUrl('javascript:alert(1)', plan));
});

void test('shared plans reject impossible, stale or unknown values', () => {
  const valid = new URL(createPlanUrl('https://example.test/', plan));
  for (const [key, value] of [['date', '2026-02-30'], ['date', '2026-09-01'], ['date', 'invalid'], ['time', '99:99'], ['guests', '9'], ['guests', '1.5'], ['table', 'H01'], ['restaurant', '<script>']]) {
    const search = new URLSearchParams(valid.search);
    search.set(key, value);
    assert.equal(parseSharedPlan(search.toString(), venues, slots, '2026-09-03'), null);
  }
  assert.equal(parseSharedPlan('', venues, slots, '2026-09-03'), null);
});

void test('calendar downloads use UTC for Baku time and clearly identify a prototype plan', () => {
  const calendar = createCalendar(plan, 'Şəki', new Date('2026-09-03T12:00:00Z'));
  assert.match(calendar, /DTSTART:20260912T160000Z/);
  assert.match(calendar, /DTEND:20260912T180000Z/);
  assert.match(calendar, /DTSTAMP:20260903T120000Z/);
  assert.match(calendar.replace(/\r\n /g, ''), /not a confirmed restaurant reservation/);
  assert.ok(calendar.split('\r\n').every((line) => new TextEncoder().encode(line).length <= 75));
  assert.match(calendar, /END:VCALENDAR\r\n$/);
  assert.equal(calendar.includes('Phone'), false);
});

void test('calendar fields escape line injection and reject malformed dates', () => {
  const calendar = createCalendar(plan, 'Name,with;punctuation\\and\nBEGIN:VEVENT');
  assert.equal(calendar.split('\r\nBEGIN:VEVENT').length, 2);
  assert.match(calendar, /Name\\,with\\;punctuation\\\\and\\nBEGIN:VEVENT/);
  assert.throws(() => createCalendar({ ...plan, date: '2026-02-30' }, 'Şəki'));
  assert.throws(() => createCalendar({ ...plan, time: 'invalid' }, 'Şəki'));
});
