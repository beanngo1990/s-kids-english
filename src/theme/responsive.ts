import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { spacing } from './spacing';

export type ResponsiveLayoutMode =
  | 'phonePortrait'
  | 'phoneLandscape'
  | 'tabletPortrait'
  | 'tabletLandscape';

export type ResponsiveLayout = {
  contentMaxWidth: number;
  height: number;
  isLandscape: boolean;
  isTablet: boolean;
  isTabletLandscape: boolean;
  mode: ResponsiveLayoutMode;
  screenPadding: number;
  sidePanelWidth: number;
  width: number;
};

const tabletShortestSide = 600;
const wideLandscapeMinWidth = 900;
const wideLandscapeMinHeight = 560;

export function getResponsiveLayout(
  width: number,
  height: number,
): ResponsiveLayout {
  const safeWidth = Math.max(0, width);
  const safeHeight = Math.max(0, height);
  const shortestSide = Math.min(safeWidth, safeHeight);
  const isLandscape = safeWidth > safeHeight;
  const isTablet = shortestSide >= tabletShortestSide;
  const isTabletLandscape =
    isTablet &&
    isLandscape &&
    safeWidth >= wideLandscapeMinWidth &&
    safeHeight >= wideLandscapeMinHeight;
  const mode: ResponsiveLayoutMode = isTablet
    ? isLandscape
      ? 'tabletLandscape'
      : 'tabletPortrait'
    : isLandscape
      ? 'phoneLandscape'
      : 'phonePortrait';

  return {
    contentMaxWidth: isTablet ? 960 : 640,
    height: safeHeight,
    isLandscape,
    isTablet,
    isTabletLandscape,
    mode,
    screenPadding: isTablet ? spacing.xl : spacing.lg,
    sidePanelWidth: isTabletLandscape
      ? Math.min(420, Math.max(312, Math.round(safeWidth * 0.28)))
      : 0,
    width: safeWidth,
  };
}

export function useResponsiveLayout() {
  const { height, width } = useWindowDimensions();

  return useMemo(() => getResponsiveLayout(width, height), [height, width]);
}
