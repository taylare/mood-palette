/**
 * Creates a unique id for a saved palette.
 * Uses crypto.randomUUID where available and falls back to a timestamp plus
 * random suffix in older browsers or non-secure contexts.
 */
export function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
