import ColourSwatch from './ColourSwatch.jsx';

/**
 * Palette
 *
 * Lays out the current colours as a row of swatches on wide screens and a
 * vertical stack on narrow ones. Swatches are keyed by position because the
 * palette never reorders, which also lets each swatch animate smoothly from
 * its old colour to its new one on regenerate.
 */
function Palette({ colours, onToggleLock }) {
  return (
    <ul className="palette" aria-label="Generated palette">
      {colours.map((colour, index) => (
        <ColourSwatch
          key={index}
          hex={colour.hex}
          isLocked={colour.isLocked}
          position={index + 1}
          onToggleLock={() => onToggleLock(index)}
        />
      ))}
    </ul>
  );
}

export default Palette;
