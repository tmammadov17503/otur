import { isAzerbaijanPhone } from './booking.js';

export const ACCOUNTS_KEY = 'otur-demo-accounts-v1';
export const SESSION_KEY = 'otur-demo-session-v1';
export const RESERVATIONS_KEY = 'otur-demo-reservations-v1';

export type AccountProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type DemoAccount = AccountProfile & {
  salt: string;
  verifier: string;
  createdAt: string;
};

export type Reservation = {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  address: string;
  tableId: string;
  date: string;
  time: string;
  guests: number;
  request: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
  cancelledAt?: string;
};

type AccountInput = { name: string; email: string; phone: string; password: string };
type ReservationInput = Omit<Reservation, 'id' | 'status' | 'createdAt' | 'cancelledAt'>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateAccountInput(input: AccountInput) {
  const value = {
    name: input.name.trim().replace(/\s+/g, ' '),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim().replace(/\s+/g, ' '),
    password: input.password,
  };
  const valid = value.name.length >= 2 && value.name.length <= 80
    && emailPattern.test(value.email) && value.email.length <= 160
    && isAzerbaijanPhone(value.phone) && value.password.length >= 8 && value.password.length <= 128;
  return valid ? { valid: true as const, value } : { valid: false as const };
}

function isAccount(value: unknown): value is DemoAccount {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<DemoAccount>;
  return ['id', 'name', 'email', 'phone', 'salt', 'verifier', 'createdAt'].every((key) => typeof item[key as keyof DemoAccount] === 'string');
}

function isReservation(value: unknown): value is Reservation {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Reservation>;
  return typeof item.id === 'string' && typeof item.userId === 'string'
    && typeof item.restaurantId === 'string' && typeof item.restaurantName === 'string'
    && typeof item.address === 'string' && typeof item.tableId === 'string'
    && typeof item.date === 'string' && typeof item.time === 'string'
    && typeof item.guests === 'number' && Number.isInteger(item.guests)
    && typeof item.request === 'string' && (item.status === 'confirmed' || item.status === 'cancelled')
    && typeof item.createdAt === 'string';
}

function parseArray<T>(raw: string | null, guard: (value: unknown) => value is T): T[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(guard) : [];
  } catch {
    return [];
  }
}

export const parseAccounts = (raw: string | null) => parseArray(raw, isAccount);
export const parseReservations = (raw: string | null) => parseArray(raw, isReservation);

export function parseSession(raw: string | null): AccountProfile | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<AccountProfile>;
    return ['id', 'name', 'email', 'phone'].every((key) => typeof value[key as keyof AccountProfile] === 'string')
      ? { id: value.id!, name: value.name!, email: value.email!, phone: value.phone! }
      : null;
  } catch {
    return null;
  }
}

function bytesToBase64(bytes: Uint8Array) {
  return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''));
}

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function passwordVerifier(password: string, salt: Uint8Array) {
  const passwordKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: salt.buffer as ArrayBuffer, iterations: 120_000 }, passwordKey, 256);
  return bytesToBase64(new Uint8Array(bits));
}

export async function createAccount(input: AccountInput, now = new Date().toISOString()): Promise<DemoAccount | null> {
  const checked = validateAccountInput(input);
  if (!checked.valid) return null;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return {
    id: crypto.randomUUID(),
    name: checked.value.name,
    email: checked.value.email,
    phone: checked.value.phone,
    salt: bytesToBase64(salt),
    verifier: await passwordVerifier(checked.value.password, salt),
    createdAt: now,
  };
}

export async function verifyAccount(account: DemoAccount, password: string) {
  if (!password || password.length > 128) return false;
  return account.verifier === await passwordVerifier(password, base64ToBytes(account.salt));
}

export function toProfile(account: DemoAccount): AccountProfile {
  return { id: account.id, name: account.name, email: account.email, phone: account.phone };
}

export function createReservation(input: ReservationInput, now = new Date().toISOString(), id = crypto.randomUUID()): Reservation {
  return { ...input, id, status: 'confirmed', createdAt: now };
}

export function addReservation(reservations: Reservation[], reservation: Reservation) {
  return [reservation, ...reservations];
}

export function cancelReservation(reservations: Reservation[], reservationId: string, userId: string, now = new Date().toISOString()) {
  return reservations.map((item) => item.id === reservationId && item.userId === userId && item.status === 'confirmed'
    ? { ...item, status: 'cancelled' as const, cancelledAt: now }
    : item);
}

export function canCancelReservation(reservation: Reservation, now = new Date()) {
  const visit = new Date(`${reservation.date}T${reservation.time}:00+04:00`);
  return reservation.status === 'confirmed' && visit.getTime() - now.getTime() >= 2 * 60 * 60 * 1000;
}
