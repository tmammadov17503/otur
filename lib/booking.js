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
 * @param {{ date: string, time: string, guests: number }} slot
 */
export function isTableAvailableForSlot(table, slot) {
  if (!table.baseAvailable || table.capacity < slot.guests) {
    return false;
  }

  const tableNumber = Number(table.id.replace(/\D/g, '')) || 0;
  const day = Number(slot.date.slice(-2)) || 0;
  const timeNumber = Number(slot.time.replace(':', '')) || 0;

  return (tableNumber + day + timeNumber) % 5 !== 0;
}
