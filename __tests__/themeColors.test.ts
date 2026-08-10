import {
  darkColors,
  getColorsForScheme,
  lightColors,
  type AppColors,
} from '../src/theme/colors';

describe('theme color contracts', () => {
  test('light and dark schemes expose the same semantic tokens', () => {
    expect(Object.keys(darkColors).sort()).toEqual(
      Object.keys(lightColors).sort(),
    );
  });

  test.each(['light', 'dark'] as const)(
    '%s scheme keeps primary text readable on app surfaces',
    scheme => {
      const palette = getColorsForScheme(scheme);

      expect(contrastRatio(palette.text, palette.background)).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contrastRatio(palette.text, palette.surface)).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(
        contrastRatio(palette.text, palette.surfaceSoft),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(palette.primaryDark, palette.surface),
      ).toBeGreaterThanOrEqual(4.5);
    },
  );

  test('dark decorative outlines are visible without remaining pure white', () => {
    expect(darkColors.outlineStrong).not.toBe(darkColors.white);
    expect(
      contrastRatio(darkColors.outlineStrong, darkColors.background),
    ).toBeGreaterThanOrEqual(2);
    expect(lightColors.outlineStrong).toBe(lightColors.white);
  });

  test('image labels use a dark scrim in dark mode', () => {
    expect(lightColors.imageLabelSurface).toContain('255, 255, 255');
    expect(darkColors.imageLabelSurface).toContain('15, 23, 42');
  });
});

function contrastRatio(
  foreground: AppColors[keyof AppColors],
  background: AppColors[keyof AppColors],
) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(color: string) {
  const match = /^#([0-9a-f]{6})$/i.exec(color);

  if (!match) {
    throw new Error(`Expected an opaque hex color, received ${color}`);
  }

  const channels = [0, 2, 4].map(offset =>
    Number.parseInt(match[1].slice(offset, offset + 2), 16) / 255,
  );
  const [red, green, blue] = channels.map(channel =>
    channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4,
  );

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}
