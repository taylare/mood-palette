/**
 * SavedPalettes
 *
 * Lists palettes the user has saved. Each card shows a colour strip, the vibe
 * it was made with and when it was saved, plus buttons to load it back into
 * the generator or delete it.
 */
function SavedPalettes({ savedPalettes, getVibeLabel, onLoadPalette, onDeletePalette }) {
  return (
    <section className="saved card" aria-labelledby="saved-heading">
      <div className="saved__header">
        <h2 id="saved-heading" className="saved__title">
          Saved palettes
        </h2>
        {savedPalettes.length > 0 && <span className="saved__count">{savedPalettes.length}</span>}
      </div>

      {savedPalettes.length === 0 ? (
        <p className="saved__empty">
          Nothing saved yet. When a palette feels right, press <strong>Save palette</strong> to keep it here.
        </p>
      ) : (
        <ul className="saved__grid">
          {savedPalettes.map((savedPalette) => {
            const vibeLabel = getVibeLabel(savedPalette.vibeId);
            const savedDateText = formatSavedDate(savedPalette.savedAt);

            return (
              <li key={savedPalette.id} className="saved-card">
                <div className="saved-card__strip" aria-hidden="true">
                  {savedPalette.hexes.map((hex, index) => (
                    <span key={index} className="saved-card__colour" style={{ background: hex }} />
                  ))}
                </div>

                <div className="saved-card__body">
                  <div className="saved-card__meta">
                    <span className="saved-card__vibe">{vibeLabel}</span>
                    <span className="saved-card__date">{savedDateText}</span>
                  </div>
                  <p className="saved-card__hexes">{savedPalette.hexes.join(' ')}</p>

                  <div className="saved-card__actions">
                    <button
                      type="button"
                      className="button button--small"
                      onClick={() => onLoadPalette(savedPalette)}
                      aria-label={`Load ${vibeLabel} palette saved ${savedDateText}`}
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      className="button button--small button--ghost"
                      onClick={() => onDeletePalette(savedPalette.id)}
                      aria-label={`Delete ${vibeLabel} palette saved ${savedDateText}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** Formats a saved timestamp as a short readable date, for example "31 Oct 2026, 14:05". */
function formatSavedDate(timestamp) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  } catch {
    return '';
  }
}

export default SavedPalettes;
