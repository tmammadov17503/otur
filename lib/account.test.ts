import assert from 'node:assert/strict';
import test from 'node:test';

// @ts-expect-error Node's type-stripping test runner requires the explicit TS extension.
import { addReservation, canCancelReservation, cancelReservation, createAccount, createReservation, normalizeInternationalPhone, parseAccounts, parseReservations, toProfile, validateAccountInput, verifyAccount, type LocalAccount, type Reservation } from './account.ts';

void test('international phone input is normalised to E.164', () => {
  assert.equal(normalizeInternationalPhone('+994', '050 123 45 67'), '+994501234567');
  assert.equal(normalizeInternationalPhone('+44', '07911 123456'), '+447911123456');
  assert.equal(normalizeInternationalPhone('+1', '(415) 555-2671'), '+14155552671');
  assert.equal(normalizeInternationalPhone('+994', '+971 50 123 4567'), '+971501234567');
  assert.equal(normalizeInternationalPhone('+44', '12'), null);
});

void test('account validation accepts optional email and rejects invalid contact details', () => {
  assert.deepEqual(validateAccountInput({ name: '  Aylin Aliyeva ', email: ' AYLIN@Example.COM ', phone: '+994 50 123 45 67', password: 'calm-table-26' }), {
    valid: true,
    value: { name: 'Aylin Aliyeva', email: 'aylin@example.com', phone: '+994501234567', password: 'calm-table-26' },
  });
  assert.deepEqual(validateAccountInput({ name: 'Aylin Aliyeva', email: '', phone: '+44 7911 123456', password: 'calm-table-26' }), {
    valid: true,
    value: { name: 'Aylin Aliyeva', email: '', phone: '+447911123456', password: 'calm-table-26' },
  });
  assert.equal(validateAccountInput({ name: 'Aylin', email: 'bad', phone: '+994 50 123 45 67', password: 'calm-table-26' }).valid, false);
  assert.equal(validateAccountInput({ name: 'A', email: 'bad', phone: '050', password: 'short' }).valid, false);
});

void test('stored account and reservation parsing is defensive', () => {
  assert.deepEqual(parseAccounts('not-json'), []);
  assert.deepEqual(parseReservations('{"no":"array"}'), []);
  assert.deepEqual(parseAccounts('[{"id":1}]'), []);
});

void test('passwords produce a salted verifier and can be checked without storing plaintext', async () => {
  const account = await createAccount({ name: 'Aylin', email: 'aylin@example.com', phone: '+994 50 123 45 67', password: 'calm-table-26' }, '2026-09-23T12:00:00.000Z');
  assert.ok(account);
  assert.equal(account.verifier.includes('calm-table-26'), false);
  assert.equal(await verifyAccount(account, 'calm-table-26'), true);
  assert.equal(await verifyAccount(account, 'wrong-password'), false);
  assert.deepEqual(toProfile(account), { id: account.id, name: 'Aylin', email: 'aylin@example.com', phone: '+994501234567' });
  assert.deepEqual(parseAccounts(JSON.stringify([account])), [account]);
});

void test('reservations are added and cancelled immutably for their owner', () => {
  const account: LocalAccount = { id: 'u-1', name: 'Aylin', email: 'aylin@example.com', phone: '+994501234567', salt: 'salt', verifier: 'hash', createdAt: '2026-09-23T12:00:00.000Z' };
  const reservation = createReservation({
    userId: account.id,
    restaurantId: 'seki',
    restaurantName: 'Şəki',
    address: '12 Kiçik Qala, Bakı AZ1001',
    tableId: 'S03',
    date: '2026-10-02',
    time: '20:00',
    guests: 2,
    request: 'Window if possible',
  }, '2026-09-23T12:00:00.000Z', 'r-1');
  const original: Reservation[] = [];
  const added = addReservation(original, reservation);
  assert.equal(original.length, 0);
  assert.equal(added[0].status, 'confirmed');

  const cancelled = cancelReservation(added, 'r-1', 'u-1', '2026-09-24T10:00:00.000Z');
  assert.equal(added[0].status, 'confirmed');
  assert.equal(cancelled[0].status, 'cancelled');
  assert.equal(cancelled[0].cancelledAt, '2026-09-24T10:00:00.000Z');
  assert.deepEqual(cancelReservation(added, 'r-1', 'another-user', '2026-09-24T10:00:00.000Z'), added);
  assert.equal(canCancelReservation(reservation), true);
  assert.equal(canCancelReservation({ ...reservation, date: '2026-09-24', time: '10:00' }), true);
  assert.equal(canCancelReservation(cancelled[0]), false);
});
