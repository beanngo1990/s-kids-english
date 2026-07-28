import { getResponsiveLayout } from '../src/theme/responsive';

test('enables the tablet landscape side panel on iPad-sized screens', () => {
  const layout = getResponsiveLayout(1024, 768);

  expect(layout.isTablet).toBe(true);
  expect(layout.isLandscape).toBe(true);
  expect(layout.isTabletLandscape).toBe(true);
  expect(layout.sidePanelWidth).toBeGreaterThanOrEqual(312);
});

test('keeps phone portrait on the stacked layout', () => {
  const layout = getResponsiveLayout(390, 844);

  expect(layout.mode).toBe('phonePortrait');
  expect(layout.isTabletLandscape).toBe(false);
  expect(layout.sidePanelWidth).toBe(0);
});
