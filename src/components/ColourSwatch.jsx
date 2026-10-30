import { useClipboard } from '../hooks/useClipboard.js';
import { getReadableTextColour, prefersDarkText } from '../utils/colour.js';
import CopyButton from './CopyButton.jsx';

/**
 * ColourSwatch
 *
 * Displays one colour in the palette. Clicking anywhere on the large colour
 * area, or on the copy button, copies the hex code. The lock button keeps the
 * colour fixed when the palette is regenerated.
 *
 * The hex text colour is picked from the swatch's luminance so it is always
 * legible, and a data attribute tells the stylesheet whether the swatch is light
 * or dark so hover and pressed states can use matching overlays.
 */
function ColourSwatch({ hex, isLocked, position, onToggleLock }) {
  const { copy, isCopied } = useClipboard();
  const textColour = getReadableTextColour(hex);
  const textTone = prefersDarkText(hex) ? 'dark' : 'light';

  const handleCopy = () => copy(hex);

  return (
    <li
      className={`swatch ${isLocked ? 'is-locked' : ''}`}
      style={{ '--swatch-colour': hex, '--swatch-text': textColour }}
      data-text-tone={textTone}
    >
      <button
        type="button"
        className="swatch__surface"
        onClick={handleCopy}
        aria-label={`Copy colour ${position}, ${hex}`}
      >
        {/* Visual confirmation. Hidden from screen readers; the live region below announces instead. */}
        <span className={`swatch__copied ${isCopied ? 'is-visible' : ''}`} aria-hidden="true">
          Copied!
        </span>
      </button>

      <div className="swatch__footer">
        <span className="swatch__hex">{hex}</span>

        <div className="swatch__actions">
          <CopyButton
            onCopy={handleCopy}
            isCopied={isCopied}
            ariaLabel={`Copy ${hex}`}
            className="icon-button"
          />

          <button
            type="button"
            className={`icon-button lock-button ${isLocked ? 'is-active' : ''}`}
            onClick={onToggleLock}
            aria-pressed={isLocked}
            aria-label={isLocked ? `Unlock colour ${position}, ${hex}` : `Lock colour ${position}, ${hex}`}
          >
            {isLocked ? <LockedIcon /> : <UnlockedIcon />}
          </button>
        </div>
      </div>

      {/* Polite live region so screen readers hear the copy confirmation. */}
      <span className="visually-hidden" aria-live="polite">
        {isCopied ? `Copied ${hex}` : ''}
      </span>
    </li>
  );
}

function LockedIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="5" y="11" width="14" height="9" rx="2.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function UnlockedIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="5" y="11" width="14" height="9" rx="2.5" />
      <path d="M8 11V8a4 4 0 0 1 7.6-1.7" />
    </svg>
  );
}

export default ColourSwatch;
