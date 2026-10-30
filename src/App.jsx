import { useCallback, useEffect, useState } from 'react';
import VibePicker from './components/VibePicker.jsx';
import Palette from './components/Palette.jsx';
import CopyButton from './components/CopyButton.jsx';
import SavedPalettes from './components/SavedPalettes.jsx';
import { VIBES, DEFAULT_VIBE_ID, getVibeById } from './data/vibes.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { useClipboard } from './hooks/useClipboard.js';
import {
  generatePalette,
  getReadableTextColour,
  mixHexColours,
  pickAccentColour,
} from './utils/colour.js';
import { createId } from './utils/id.js';

const SAVED_PALETTES_STORAGE_KEY = 'mood-palette:saved-palettes';

/**
 * Returns true if a keyboard event came from a control that already uses the
 * spacebar itself (buttons, inputs and so on), so the global shortcut does
 * not hijack it.
 */
function isEventFromInteractiveElement(event) {
  return Boolean(
    event.target instanceof Element &&
      event.target.closest('button, a, input, textarea, select, [contenteditable="true"]'),
  );
}

/** Keeps only well formed saved palettes, in case localStorage holds old or edited data. */
function sanitiseSavedPalettes(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((entry) => entry && typeof entry.id === 'string' && Array.isArray(entry.hexes));
}

/**
 * App
 *
 * Holds the main state: the active vibe, the current colours (with lock
 * flags) and the saved palettes. It wires up the spacebar shortcut and feeds
 * the current palette into CSS variables so the page background and accent
 * colours adapt to whatever is on screen.
 */
function App() {
  const [activeVibeId, setActiveVibeId] = useState(DEFAULT_VIBE_ID);
  const [colours, setColours] = useState(() => generatePalette(getVibeById(DEFAULT_VIBE_ID)));
  const [storedSavedPalettes, setStoredSavedPalettes] = useLocalStorage(SAVED_PALETTES_STORAGE_KEY, []);
  const [statusMessage, setStatusMessage] = useState('');
  const { copy: copyFullPalette, isCopied: isFullPaletteCopied } = useClipboard();

  const savedPalettes = sanitiseSavedPalettes(storedSavedPalettes);
  const currentHexes = colours.map((colour) => colour.hex);
  const activeVibe = getVibeById(activeVibeId);
  const lockedCount = colours.filter((colour) => colour.isLocked).length;

  /** Creates a new palette for the current vibe, keeping locked colours. */
  const regeneratePalette = useCallback(() => {
    setColours((currentColours) => generatePalette(getVibeById(activeVibeId), currentColours));
  }, [activeVibeId]);

  /** Switches vibe and immediately generates a matching palette. Locked colours survive the switch. */
  const handleSelectVibe = useCallback((vibeId) => {
    setActiveVibeId(vibeId);
    setColours((currentColours) => generatePalette(getVibeById(vibeId), currentColours));
  }, []);

  const handleToggleLock = useCallback((indexToToggle) => {
    setColours((currentColours) =>
      currentColours.map((colour, index) =>
        index === indexToToggle ? { ...colour, isLocked: !colour.isLocked } : colour,
      ),
    );
  }, []);

  const handleCopyAll = async () => {
    const didCopy = await copyFullPalette(currentHexes.join(', '));
    setStatusMessage(didCopy ? 'Copied the full palette.' : 'Sorry, copying failed.');
  };

  const handleSavePalette = () => {
    const currentKey = currentHexes.join(',');
    const isAlreadySaved = savedPalettes.some((saved) => saved.hexes.join(',') === currentKey);

    if (isAlreadySaved) {
      setStatusMessage('This palette is already saved.');
      return;
    }

    const newSavedPalette = {
      id: createId(),
      vibeId: activeVibeId,
      hexes: currentHexes,
      savedAt: Date.now(),
    };

    setStoredSavedPalettes((previous) => [newSavedPalette, ...sanitiseSavedPalettes(previous)]);
    setStatusMessage(`Saved ${activeVibe.label} palette.`);
  };

  const handleLoadPalette = (savedPalette) => {
    setActiveVibeId(getVibeById(savedPalette.vibeId).id);
    setColours(savedPalette.hexes.map((hex) => ({ hex, isLocked: false })));
    setStatusMessage('Palette loaded into the generator.');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  const handleDeletePalette = (paletteId) => {
    setStoredSavedPalettes((previous) =>
      sanitiseSavedPalettes(previous).filter((saved) => saved.id !== paletteId),
    );
    setStatusMessage('Palette deleted.');
  };

  // Spacebar regenerates, unless focus is on a control that needs the spacebar itself.
  useEffect(() => {
    const handleKeyDown = (event) => {
      const isSpacebar = event.code === 'Space' || event.key === ' ';
      const hasModifier = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

      if (!isSpacebar || hasModifier || event.repeat || isEventFromInteractiveElement(event)) {
        return;
      }

      // Stop the page from scrolling down, which is the browser's default for space.
      event.preventDefault();
      regeneratePalette();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [regeneratePalette]);

  // Feed the current palette into CSS variables for the page gradient and accent colours.
  // Each gradient stop is mixed halfway with white so the background stays colourful
  // but light enough for dark text, even with a dark vibe like Moody.
  useEffect(() => {
    const accentHex = pickAccentColour(currentHexes);
    const rootStyle = document.documentElement.style;

    currentHexes.forEach((hex, index) => {
      rootStyle.setProperty(`--page-gradient-${index + 1}`, mixHexColours(hex, '#FFFFFF', 0.5));
    });
    rootStyle.setProperty('--accent', accentHex);
    rootStyle.setProperty('--accent-text', getReadableTextColour(accentHex));
    rootStyle.setProperty('--accent-soft', mixHexColours(accentHex, '#FFFFFF', 0.8));
    // currentHexes is derived from colours, so colours is the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colours]);

  // Clear status messages after a short while so the same message can be announced again later.
  useEffect(() => {
    if (!statusMessage) return undefined;
    const clearTimer = setTimeout(() => setStatusMessage(''), 2500);
    return () => clearTimeout(clearTimer);
  }, [statusMessage]);

  return (
    <div className="app">
      <a className="skip-link" href="#saved-heading">
        Skip to saved palettes
      </a>

      <header className="app__header">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            {currentHexes.map((hex, index) => (
              <span key={index} style={{ background: hex }} />
            ))}
          </span>
          <div>
            <h1 className="brand__title">Mood Palette</h1>
            <p className="brand__tagline">Pick a vibe. Get five colours that feel right.</p>
          </div>
        </div>
      </header>

      <main className="app__main">
        <section className="generator card" aria-labelledby="generator-heading">
          <h2 id="generator-heading" className="visually-hidden">
            Palette generator
          </h2>

          <VibePicker vibes={VIBES} activeVibeId={activeVibeId} onSelectVibe={handleSelectVibe} />

          <div className="toolbar">
            <p className="toolbar__description">
              <strong>{activeVibe.label}:</strong> {activeVibe.description}
              {lockedCount > 0 && <span className="toolbar__locks"> ({lockedCount} locked)</span>}
            </p>

            <div className="toolbar__actions">
              <button
                type="button"
                className="button button--primary"
                onClick={regeneratePalette}
                aria-label="Regenerate palette. Shortcut: spacebar"
                aria-keyshortcuts="Space"
              >
                <RefreshIcon />
                Regenerate
                <kbd className="kbd" aria-hidden="true">
                  Space
                </kbd>
              </button>

              <CopyButton
                variant="text"
                label="Copy all"
                className="button"
                onCopy={handleCopyAll}
                isCopied={isFullPaletteCopied}
                ariaLabel="Copy all hex codes as a comma separated list"
              />

              <button
                type="button"
                className="button"
                onClick={handleSavePalette}
                aria-label="Save this palette"
              >
                <HeartIcon />
                Save palette
              </button>
            </div>
          </div>

          <Palette colours={colours} onToggleLock={handleToggleLock} />

          <p className="hint">Click a colour to copy its hex code. Lock colours you love, then regenerate the rest.</p>
        </section>

        <SavedPalettes
          savedPalettes={savedPalettes}
          getVibeLabel={(vibeId) => getVibeById(vibeId).label}
          onLoadPalette={handleLoadPalette}
          onDeletePalette={handleDeletePalette}
        />
      </main>

      {/* Announces save, load, delete and copy all actions to screen readers. */}
      <div className="visually-hidden" role="status" aria-live="polite">
        {statusMessage}
      </div>
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M20 11a8 8 0 0 0-14.3-4.9L4 8" />
      <path d="M4 4v4h4" />
      <path d="M4 13a8 8 0 0 0 14.3 4.9L20 16" />
      <path d="M20 20v-4h-4" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </svg>
  );
}

export default App;
