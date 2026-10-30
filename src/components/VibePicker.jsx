/**
 * VibePicker
 *
 * A row of chip buttons, one per vibe. The active chip is highlighted and
 * marked with aria-pressed so assistive technology knows which vibe is chosen.
 * Each chip shows a small dot previewing the middle of that vibe's colour ranges.
 */
function VibePicker({ vibes, activeVibeId, onSelectVibe }) {
  return (
    <div className="vibe-picker" role="group" aria-label="Choose a vibe">
      {vibes.map((vibe) => {
        const isActive = vibe.id === activeVibeId;

        return (
          <button
            key={vibe.id}
            type="button"
            className={`vibe-chip ${isActive ? 'is-active' : ''}`}
            onClick={() => onSelectVibe(vibe.id)}
            aria-pressed={isActive}
            aria-label={`${vibe.label} vibe: ${vibe.description}`}
            title={vibe.description}
          >
            <span className="vibe-chip__dot" style={{ background: getVibePreviewGradient(vibe) }} aria-hidden="true" />
            {vibe.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Builds a small gradient that hints at a vibe's colours, using the low and
 * high ends of its first hue range at the midpoint saturation and lightness.
 */
function getVibePreviewGradient(vibe) {
  const [hueStart, hueEnd] = vibe.hueRanges[0];
  const saturation = (vibe.saturation[0] + vibe.saturation[1]) / 2;
  const lightness = (vibe.lightness[0] + vibe.lightness[1]) / 2;
  const lastHueRange = vibe.hueRanges[vibe.hueRanges.length - 1];
  const finishHue = vibe.hueRanges.length > 1 ? lastHueRange[0] : hueEnd;

  return `linear-gradient(135deg, hsl(${hueStart % 360} ${saturation}% ${lightness}%), hsl(${finishHue % 360} ${saturation}% ${lightness}%))`;
}

export default VibePicker;
