export const ACCOUNTS_KEY = 'otur-accounts-v2';
export const SESSION_KEY = 'otur-session-v2';
export const RESERVATIONS_KEY = 'otur-reservations-v2';

export const PHONE_COUNTRIES = [
  { iso: 'AZ', flag: '🇦🇿', name: 'Azerbaijan', dialCode: '+994', example: '50 123 45 67' },
  { iso: 'TR', flag: '🇹🇷', name: 'Türkiye', dialCode: '+90', example: '532 123 45 67' },
  { iso: 'GE', flag: '🇬🇪', name: 'Georgia', dialCode: '+995', example: '555 12 34 56' },
  { iso: 'GB', flag: '🇬🇧', name: 'United Kingdom', dialCode: '+44', example: '7911 123456' },
  { iso: 'US', flag: '🇺🇸', name: 'United States / Canada', dialCode: '+1', example: '415 555 2671' },
  { iso: 'AE', flag: '🇦🇪', name: 'United Arab Emirates', dialCode: '+971', example: '50 123 4567' },
  { iso: 'RU', flag: '🇷🇺', name: 'Russia', dialCode: '+7', example: '912 345 67 89' },
  { iso: 'UA', flag: '🇺🇦', name: 'Ukraine', dialCode: '+380', example: '50 123 4567' },
  { iso: 'DE', flag: '🇩🇪', name: 'Germany', dialCode: '+49', example: '1512 3456789' },
  { iso: 'FR', flag: '🇫🇷', name: 'France', dialCode: '+33', example: '6 12 34 56 78' },
  { iso: 'IT', flag: '🇮🇹', name: 'Italy', dialCode: '+39', example: '312 345 6789' },
  { iso: 'ES', flag: '🇪🇸', name: 'Spain', dialCode: '+34', example: '612 34 56 78' },
] as const;

export type AccountProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type LocalAccount = AccountProfile & {
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

export function normalizeInternationalPhone(dialCode: string, phone: string) {
  const raw = phone.trim();
  if (!raw) return null;
  const countryDigits = dialCode.replace(/\D/g, '');
  const phoneDigits = raw.replace(/\D/g, '');
  const digits = raw.startsWith('+') ? phoneDigits : `${countryDigits}${phoneDigits.replace(/^0+/, '')}`;
  return /^\d{8,15}$/.test(digits) ? `+${digits}` : null;
}

export function validateAccountInput(input: AccountInput) {
  const value = {
    name: input.name.trim().replace(/\s+/g, ' '),
    email: input.email.trim().toLowerCase(),
    phone: normalizeInternationalPhone('', input.phone) ?? '',
    password: input.password,
  };
  const valid = value.name.length >= 2 && value.name.length <= 80
    && (!value.email || emailPattern.test(value.email)) && value.email.length <= 160
    && Boolean(value.phone) && value.password.length >= 8 && value.password.length <= 128;
  return valid ? { valid: true as const, value } : { valid: false as const };
}

function isAccount(value: unknown): value is LocalAccount {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<LocalAccount>;
  return ['id', 'name', 'email', 'phone', 'salt', 'verifier', 'createdAt'].every((key) => typeof item[key as keyof LocalAccount] === 'string');
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

export async function createAccount(input: AccountInput, now = new Date().toISOString()): Promise<LocalAccount | null> {
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

export async function verifyAccount(account: LocalAccount, password: string) {
  if (!password || password.length > 128) return false;
  return account.verifier === await passwordVerifier(password, base64ToBytes(account.salt));
}

export function toProfile(account: LocalAccount): AccountProfile {
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

export function canCancelReservation(reservation: Reservation) {
  return reservation.status === 'confirmed';
}
