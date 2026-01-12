/**
 * Attempt to parse a date string into a Date object.
 * Backend might return MySQL date/datetime strings.
 */
function parseToDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

// PUBLIC_INTERFACE
export function formatDueDate(value) {
  /** Format a due date for display (e.g., Jan 12, 2026). */
  const d = parseToDate(value);
  if (!d) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// PUBLIC_INTERFACE
export function isOverdue(value) {
  /** Returns true if a due date is in the past (end of day not considered). */
  const d = parseToDate(value);
  if (!d) return false;
  const now = new Date();
  return d.getTime() < now.getTime();
}
