/**
 * Keep a reservation party within the supported prototype range.
 * @param {number} current
 * @param {number} delta
 */
export function clampGuestCount(current, delta) {
  return Math.min(8, Math.max(1, current + delta));
}

/** @param {{ available: boolean }} table */
export function isTableSelectable(table) {
  return table.available === true;
}

/**
 * Produce stable simulated availability for the prototype while respecting
 * real product constraints such as table capacity and an operator override.
 * @param {{ id: string, capacity: number, baseAvailable: boolean }} table
 * @param {{ restaurantId?: string, date: string, time: string, guests: number }} slot
 */
export function isTableAvailableForSlot(table, slot) {
  if (!table.baseAvailable || table.capacity < slot.guests) {
    return false;
  }

  const tableNumber = Number(table.id.replace(/\D/g, '')) || 0;
  const day = Number(slot.date.slice(-2)) || 0;
  const timeNumber = Number(slot.time.replace(':', '')) || 0;

  if (slot.restaurantId) {
    const restaurantSeeds = { seki: 2, hayat: 1, xazri: 0 };
    const [hour = 0, minute = 0] = slot.time.split(':').map(Number);
    const halfHourSlot = Math.floor((hour * 60 + minute) / 30);
    const restaurantSeed = restaurantSeeds[slot.restaurantId] ?? slot.restaurantId.length % 4;

    return (tableNumber + day + halfHourSlot + restaurantSeed) % 4 !== 0;
  }

  return (tableNumber + day + timeNumber) % 5 !== 0;
}

function normalizeSearchValue(value) {
  return String(value ?? '')
    .toLocaleLowerCase('az-Latn')
    .replaceAll('ə', 'e')
    .replaceAll('ş', 's')
    .replaceAll('ç', 'c')
    .replaceAll('ğ', 'g')
    .replaceAll('ı', 'i')
    .replaceAll('ö', 'o')
    .replaceAll('ü', 'u')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

/**
 * Filter the prototype restaurant set by a free-text query and one curated tag.
 * Accent folding keeps Latin-script Azerbaijani searches forgiving.
 */
export function filterRestaurants(restaurants, query, activeFilter) {
  const normalizedQuery = normalizeSearchValue(query);
  const normalizedFilter = normalizeSearchValue(activeFilter);

  return restaurants.filter((restaurant) => {
    const searchable = normalizeSearchValue([
      restaurant.name,
      restaurant.cuisine,
      restaurant.area,
      restaurant.description,
      ...(restaurant.tags ?? []),
    ].join(' '));
    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
    const matchesFilter = !normalizedFilter
      || normalizedFilter === 'tonight'
      || searchable.includes(normalizedFilter);

    return matchesQuery && matchesFilter;
  });
}

/** Return the first stable table option that fits the active booking slot. */
export function getFirstAvailableTableId(tables, slot) {
  return tables.find((table) => isTableAvailableForSlot(table, slot))?.id ?? null;
}

/** Validate a complete +994 Azerbaijan phone number while allowing formatting. */
export function isAzerbaijanPhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  return String(value ?? '').trim().startsWith('+994') && digits.length === 12;
}
