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
