import { useEffect, useState } from 'react';

/**
 * useLocalStorage
 *
 * Works like useState, but the value is also saved to localStorage under the
 * given key and restored on the next visit. Reads and writes are wrapped in
 * try/catch because localStorage can throw (private browsing, storage full,
 * blocked site data) or hold corrupted JSON. In those cases the hook quietly
 * falls back to the initial value and keeps working in memory.
 */
export function useLocalStorage(storageKey, initialValue) {
  // Lazy initialiser so localStorage is only read once, on first render.
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const rawValue = window.localStorage.getItem(storageKey);
      return rawValue !== null ? JSON.parse(rawValue) : initialValue;
    } catch (error) {
      console.warn(`Could not read "${storageKey}" from localStorage.`, error);
      return initialValue;
    }
  });

  // Persist every change. Runs after render so it never blocks the UI update.
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Could not save "${storageKey}" to localStorage.`, error);
    }
  }, [storageKey, storedValue]);

  return [storedValue, setStoredValue];
}
