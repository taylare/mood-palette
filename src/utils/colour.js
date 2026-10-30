/**
 * Colour utilities.
 *
 * Pure functions for generating colours from vibe ranges, converting between
 * colour formats and checking legibility. Nothing here touches the DOM or
 * React state, so every function is easy to test on its own.
 */

/** Number of colours in every generated palette. */
export const PALETTE_SIZE = 5;

/** Text colours used on top of swatches. The dark one is a soft near-black. */
export const DARK_TEXT_COLOUR = '#1C1B22';
export const LIGHT_TEXT_COLOUR = '#FFFFFF';

/** Returns a random number between min and max. */
export function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

/** Wraps any hue into the 0 to 360 range, so ranges like [330, 420] can pass through red. */
export function normaliseHue(hue) {
  return ((hue % 360) + 360) % 360;
}

/**
 * Picks a random HSL colour inside a vibe's ranges.
 * If the vibe has several hue ranges, one is chosen at random first.
 */
export function generateHslFromVibe(vibe) {
  const hueRange = vibe.hueRanges[Math.floor(Math.random() * vibe.hueRanges.length)];

  return {
    hue: normaliseHue(randomBetween(hueRange[0], hueRange[1])),
    saturation: randomBetween(vibe.saturation[0], vibe.saturation[1]),
    lightness: randomBetween(vibe.lightness[0], vibe.lightness[1]),
  };
}

/**
 * Converts an HSL colour (hue in degrees, saturation and lightness as percentages)
 * to an uppercase hex string like "#A1B2C3".
 *
 * Uses the compact formula from the CSS Color specification: each RGB channel is
 * the lightness, pushed up or down by an amount that depends on how far that
 * channel sits from the hue on the colour wheel. The offsets 0, 8 and 4 select
 * the red, green and blue channels respectively.
 */
export function hslToHex({ hue, saturation, lightness }) {
  const saturationFraction = saturation / 100;
  const lightnessFraction = lightness / 100;
  const chromaAmount = saturationFraction * Math.min(lightnessFraction, 1 - lightnessFraction);

  const channelToHex = (channelOffset) => {
    const position = (channelOffset + hue / 30) % 12;
    const channelValue =
      lightnessFraction - chromaAmount * Math.max(-1, Math.min(position - 3, 9 - position, 1));
    return Math.round(channelValue * 255)
      .toString(16)
      .padStart(2, '0');
  };

  return `#${channelToHex(0)}${channelToHex(8)}${channelToHex(4)}`.toUpperCase();
}

/** Parses a hex string ("#RRGGBB" or "#RGB") into red, green and blue values from 0 to 255. */
export function hexToRgb(hex) {
  let cleanHex = hex.replace('#', '');

  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((character) => character + character)
      .join('');
  }

  const numericValue = parseInt(cleanHex, 16);

  return {
    red: (numericValue >> 16) & 255,
    green: (numericValue >> 8) & 255,
    blue: numericValue & 255,
  };
}

/** Converts red, green and blue values (0 to 255) into an uppercase hex string. */
export function rgbToHex({ red, green, blue }) {
  const toHexPair = (value) =>
    Math.round(Math.min(255, Math.max(0, value)))
      .toString(16)
      .padStart(2, '0');

  return `#${toHexPair(red)}${toHexPair(green)}${toHexPair(blue)}`.toUpperCase();
}

/** Converts a hex string into HSL, with hue in degrees and saturation and lightness as percentages. */
export function hexToHsl(hex) {
  const { red, green, blue } = hexToRgb(hex);
  const redFraction = red / 255;
  const greenFraction = green / 255;
  const blueFraction = blue / 255;

  const maxChannel = Math.max(redFraction, greenFraction, blueFraction);
  const minChannel = Math.min(redFraction, greenFraction, blueFraction);
  const channelRange = maxChannel - minChannel;
  const lightness = (maxChannel + minChannel) / 2;

  let hue = 0;
  let saturation = 0;

  if (channelRange !== 0) {
    saturation = channelRange / (1 - Math.abs(2 * lightness - 1));

    if (maxChannel === redFraction) {
      hue = ((greenFraction - blueFraction) / channelRange) % 6;
    } else if (maxChannel === greenFraction) {
      hue = (blueFraction - redFraction) / channelRange + 2;
    } else {
      hue = (redFraction - greenFraction) / channelRange + 4;
    }
  }

  return {
    hue: normaliseHue(hue * 60),
    saturation: saturation * 100,
    lightness: lightness * 100,
  };
}

/**
 * Calculates the relative luminance of a colour as defined by WCAG 2.
 *
 * Screens store colours in the sRGB "gamma encoded" space, which is not linear
 * with how much light is actually emitted. Each channel is first converted back
 * to linear light, then the channels are weighted by how sensitive the human eye
 * is to them (green the most, blue the least). The result runs from 0 for black
 * to 1 for white.
 */
export function getRelativeLuminance(hex) {
  const { red, green, blue } = hexToRgb(hex);

  const toLinearLight = (channel) => {
    const channelFraction = channel / 255;
    return channelFraction <= 0.03928
      ? channelFraction / 12.92
      : ((channelFraction + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * toLinearLight(red) + 0.7152 * toLinearLight(green) + 0.0722 * toLinearLight(blue);
}

/**
 * Returns the WCAG contrast ratio between two colours, from 1 (no contrast) to 21.
 * The 0.05 offset accounts for ambient light reflecting off the screen.
 */
export function getContrastRatio(firstHex, secondHex) {
  const firstLuminance = getRelativeLuminance(firstHex);
  const secondLuminance = getRelativeLuminance(secondHex);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Chooses dark or light text for a given background, whichever has the higher
 * contrast ratio. Comparing contrast directly is more reliable than a fixed
 * luminance cut-off, especially for mid-tone colours.
 */
export function getReadableTextColour(backgroundHex) {
  const contrastWithDark = getContrastRatio(backgroundHex, DARK_TEXT_COLOUR);
  const contrastWithLight = getContrastRatio(backgroundHex, LIGHT_TEXT_COLOUR);
  return contrastWithDark >= contrastWithLight ? DARK_TEXT_COLOUR : LIGHT_TEXT_COLOUR;
}

/** Returns true when dark text is the more legible choice on this background. */
export function prefersDarkText(backgroundHex) {
  return getReadableTextColour(backgroundHex) === DARK_TEXT_COLOUR;
}

/**
 * Blends two hex colours together.
 * A weightOfSecond of 0 returns the first colour, 1 returns the second.
 */
export function mixHexColours(firstHex, secondHex, weightOfSecond) {
  const first = hexToRgb(firstHex);
  const second = hexToRgb(secondHex);
  const blend = (firstValue, secondValue) => firstValue + (secondValue - firstValue) * weightOfSecond;

  return rgbToHex({
    red: blend(first.red, second.red),
    green: blend(first.green, second.green),
    blue: blend(first.blue, second.blue),
  });
}

/**
 * Builds a palette for a vibe. Any colour in previousColours that is locked
 * is kept exactly as it is in the same position; every other slot gets a fresh
 * random colour from the vibe's ranges.
 *
 * Each colour is returned as { hex, isLocked }.
 */
export function generatePalette(vibe, previousColours = []) {
  return Array.from({ length: PALETTE_SIZE }, (_, index) => {
    const previousColour = previousColours[index];

    if (previousColour?.isLocked) {
      return previousColour;
    }

    return { hex: hslToHex(generateHslFromVibe(vibe)), isLocked: false };
  });
}

/**
 * Picks the colour that works best as a UI accent: the one that is most
 * saturated while sitting closest to a mid lightness. Very pale or very dark
 * colours score low because they make poor button backgrounds.
 */
export function pickAccentColour(hexes) {
  let bestHex = hexes[0];
  let bestScore = -Infinity;

  hexes.forEach((hex) => {
    const { saturation, lightness } = hexToHsl(hex);
    const closenessToMidLightness = 1 - Math.abs(lightness - 50) / 50;
    const score = (saturation / 100) * 0.6 + closenessToMidLightness * 0.4;

    if (score > bestScore) {
      bestScore = score;
      bestHex = hex;
    }
  });

  return bestHex;
}
