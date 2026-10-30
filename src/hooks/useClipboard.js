import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Writes text to the clipboard. Prefers the async Clipboard API and falls back
 * to a hidden textarea with execCommand for browsers or contexts where the API
 * is unavailable (for example plain http on a local network).
 * Resolves to true on success and false on failure.
 */
async function writeTextToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy approach below.
  }

  try {
    const hiddenTextarea = document.createElement('textarea');
    hiddenTextarea.value = text;
    hiddenTextarea.setAttribute('readonly', '');
    hiddenTextarea.style.position = 'fixed';
    hiddenTextarea.style.opacity = '0';
    document.body.appendChild(hiddenTextarea);
    hiddenTextarea.select();
    const didCopy = document.execCommand('copy');
    document.body.removeChild(hiddenTextarea);
    return didCopy;
  } catch {
    return false;
  }
}

/**
 * useClipboard
 *
 * Returns a copy function and an isCopied flag. After a successful copy the
 * flag stays true for resetDelayMs, which is long enough to show a "Copied!"
 * confirmation before it fades out. Copying again restarts the timer.
 */
export function useClipboard(resetDelayMs = 1600) {
  const [isCopied, setIsCopied] = useState(false);
  const resetTimerRef = useRef(null);

  // Clear any pending timer if the component unmounts mid confirmation.
  useEffect(() => () => clearTimeout(resetTimerRef.current), []);

  const copy = useCallback(
    async (text) => {
      const didCopy = await writeTextToClipboard(text);

      if (didCopy) {
        setIsCopied(true);
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = setTimeout(() => setIsCopied(false), resetDelayMs);
      }

      return didCopy;
    },
    [resetDelayMs],
  );

  return { copy, isCopied };
}
