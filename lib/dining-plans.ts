export type DiningPlan = {
  restaurantId: string;
  tableId: string;
  date: string;
  time: string;
  guests: number;
};

const restaurantIds = new Set(['seki', 'hayat', 'xazri']);
export const FAVORITES_KEY = 'otur:favorites:v1';

export function getBakuDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Baku', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  return ['year', 'month', 'day'].map((part) => parts.find((item) => item.type === part)?.value).join('-');
}

function validDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === date;
}

function validPlan(plan: DiningPlan): boolean {
  return restaurantIds.has(plan.restaurantId) && /^[A-Z]\d{2}$/.test(plan.tableId)
    && validDate(plan.date) && /^([01]\d|2[0-3]):[0-5]\d$/.test(plan.time)
    && Number.isInteger(plan.guests) && plan.guests >= 1 && plan.guests <= 8;
}

export function parseFavorites(raw: string | null): string[] {
  try {
    const value: unknown = JSON.parse(raw ?? '[]');
    return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && restaurantIds.has(id)))] : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(saved: readonly string[], id: string): string[] {
  if (!restaurantIds.has(id)) return [...saved];
  return saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id];
}

export function recommendTable<T extends { id: string; capacity: number; available: boolean; tags: readonly string[] }>(
  tables: readonly T[], guests: number, preference: string,
): T | null {
  return [...tables].filter((table) => table.available && table.capacity >= guests
    && (preference === 'any' || table.tags.includes(preference)))
    .sort((a, b) => a.capacity - b.capacity || a.id.localeCompare(b.id))[0] ?? null;
}

export function createPlanUrl<T extends DiningPlan>(base: string, plan: T): string {
  const url = new URL(base);
  if (!['https:', 'http:'].includes(url.protocol) || !validPlan(plan)) throw new Error('Invalid dining plan');
  url.search = new URLSearchParams({
    restaurant: plan.restaurantId, table: plan.tableId, date: plan.date,
    time: plan.time, guests: String(plan.guests),
  }).toString();
  url.hash = 'restaurant';
  return url.toString();
}

export function parseSharedPlan(
  search: string, venues: readonly { id: string; tables: readonly { id: string }[] }[],
  slots: readonly string[], today: string,
): DiningPlan | null {
  const params = new URLSearchParams(search);
  const plan = {
    restaurantId: params.get('restaurant') ?? '', tableId: params.get('table') ?? '',
    date: params.get('date') ?? '', time: params.get('time') ?? '', guests: Number(params.get('guests')),
  };
  const venue = venues.find((item) => item.id === plan.restaurantId);
  return validPlan(plan) && plan.date >= today && slots.includes(plan.time)
    && venue?.tables.some((table) => table.id === plan.tableId) ? plan : null;
}

function escapeCalendar(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

function calendarTime(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

// Fold on UTF-8 byte boundaries, never inside an Azerbaijani or Cyrillic character.
function foldCalendarLine(line: string): string {
  const encoder = new TextEncoder();
  let folded = '';
  let bytes = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (bytes + size > 75) { folded += '\r\n '; bytes = 1; }
    folded += character;
    bytes += size;
  }
  return folded;
}

export function createCalendar(plan: DiningPlan, restaurantName: string, now = new Date()): string {
  if (!validPlan(plan)) throw new Error('Invalid dining plan');
  const start = new Date(`${plan.date}T${plan.time}:00+04:00`);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//OTUR//Dining Plan//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', `UID:${plan.restaurantId}-${plan.tableId}-${calendarTime(start)}@otur.local`,
    `DTSTAMP:${calendarTime(now)}`, `DTSTART:${calendarTime(start)}`, `DTEND:${calendarTime(end)}`,
    `SUMMARY:${escapeCalendar(`OTUR plan · ${restaurantName}`)}`,
    `LOCATION:${escapeCalendar(`${restaurantName}, Baku, Azerbaijan`)}`,
    `DESCRIPTION:${escapeCalendar(`Prototype dining plan — not a confirmed restaurant reservation. Table ${plan.tableId}, ${plan.guests} guests. Duration is a suggested two hours.`)}`,
    'STATUS:TENTATIVE', 'TRANSP:TRANSPARENT', 'END:VEVENT', 'END:VCALENDAR', '',
  ].map(foldCalendarLine).join('\r\n');
}
