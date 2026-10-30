/**
 * Vibe definitions.
 *
 * Each vibe describes a mood as a set of HSL ranges rather than fixed colours,
 * so every generated palette is new but still feels like the same mood.
 *
 * - hueRanges: one or more [min, max] hue ranges in degrees. When a vibe has
 *   several ranges, each colour picks one at random (useful for vibes that mix
 *   distinct colour families, like Retro's oranges with teals). Values above
 *   360 are allowed and wrap around, so [330, 420] spans pinks, reds and oranges.
 * - saturation: [min, max] as a percentage.
 * - lightness: [min, max] as a percentage.
 */
export const VIBES = [
  {
    id: 'calm',
    label: 'Calm',
    description: 'Soft blues and sea greens with gentle contrast',
    hueRanges: [[170, 230]],
    saturation: [20, 45],
    lightness: [55, 85],
  },
  {
    id: 'energetic',
    label: 'Energetic',
    description: 'Bold reds, oranges and hot pinks at full saturation',
    hueRanges: [[330, 420]],
    saturation: [80, 100],
    lightness: [45, 62],
  },
  {
    id: 'cosy',
    label: 'Cosy',
    description: 'Warm browns, terracotta and candlelight tones',
    hueRanges: [[10, 45]],
    saturation: [35, 65],
    lightness: [25, 70],
  },
  {
    id: 'dreamy',
    label: 'Dreamy',
    description: 'Hazy lavenders and pastel pinks',
    hueRanges: [[250, 335]],
    saturation: [40, 75],
    lightness: [72, 90],
  },
  {
    id: 'moody',
    label: 'Moody',
    description: 'Deep navies, plums and shadowy slate',
    hueRanges: [[200, 290]],
    saturation: [20, 50],
    lightness: [12, 38],
  },
  {
    id: 'fresh',
    label: 'Fresh',
    description: 'Crisp limes, mint and leafy greens',
    hueRanges: [[80, 170]],
    saturation: [45, 80],
    lightness: [50, 80],
  },
  {
    id: 'retro',
    label: 'Retro',
    description: 'Mustard, burnt orange and faded teal',
    hueRanges: [
      [12, 48],
      [168, 192],
    ],
    saturation: [45, 75],
    lightness: [42, 68],
  },
  {
    id: 'playful',
    label: 'Playful',
    description: 'Bright candy colours from across the whole spectrum',
    hueRanges: [[0, 360]],
    saturation: [70, 95],
    lightness: [55, 72],
  },
];

export const DEFAULT_VIBE_ID = 'calm';

/** Looks up a vibe by id, falling back to the default vibe if the id is unknown. */
export function getVibeById(vibeId) {
  return VIBES.find((vibe) => vibe.id === vibeId) ?? VIBES.find((vibe) => vibe.id === DEFAULT_VIBE_ID);
}
