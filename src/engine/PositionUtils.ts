import type { ViewStyle } from 'react-native';

import type { PercentRect } from '../types/lesson';

export type PixelSize = {
  width: number;
  height: number;
};

export type DragTranslation = {
  dx: number;
  dy: number;
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const toPercent = (value: number) => `${clampPercent(value)}%` as const;

export function getPercentRectStyle(rect: PercentRect): ViewStyle {
  return {
    height: toPercent(rect.height),
    left: toPercent(rect.x),
    position: 'absolute',
    top: toPercent(rect.y),
    width: toPercent(rect.width),
  };
}

export function isPointInsideRect(
  point: { x: number; y: number },
  rect: PercentRect,
) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function getDraggedRect(
  rect: PercentRect,
  translation: DragTranslation,
  containerSize: PixelSize,
): PercentRect {
  if (containerSize.width <= 0 || containerSize.height <= 0) {
    return rect;
  }

  return {
    ...rect,
    x: rect.x + (translation.dx / containerSize.width) * 100,
    y: rect.y + (translation.dy / containerSize.height) * 100,
  };
}

export function getRectCenter(rect: PercentRect) {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

export function getSnapRect(
  objectRect: PercentRect,
  dropZoneRect: PercentRect,
): PercentRect {
  return {
    ...objectRect,
    x: clampRectAxis(
      dropZoneRect.x + (dropZoneRect.width - objectRect.width) / 2,
      objectRect.width,
    ),
    y: clampRectAxis(
      dropZoneRect.y + (dropZoneRect.height - objectRect.height) / 2,
      objectRect.height,
    ),
  };
}

function clampRectAxis(value: number, size: number) {
  return Math.max(0, Math.min(100 - size, value));
}

export function expandRect(rect: PercentRect, tolerance: number): PercentRect {
  return {
    x: rect.x - tolerance,
    y: rect.y - tolerance,
    width: rect.width + tolerance * 2,
    height: rect.height + tolerance * 2,
  };
}

export function rectsIntersect(rect1: PercentRect, rect2: PercentRect): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

export function isNearDropZone(
  objectRect: PercentRect,
  dropZoneRect: PercentRect,
  distanceThreshold: number,
): boolean {
  const center1 = getRectCenter(objectRect);
  const center2 = getRectCenter(dropZoneRect);
  const distance = Math.sqrt(
    Math.pow(center1.x - center2.x, 2) + Math.pow(center1.y - center2.y, 2),
  );
  return distance <= distanceThreshold;
}

export function isDropAccepted(
  objectRect: PercentRect,
  dropZoneRect: PercentRect,
  tolerance: number = 10,
  distanceThreshold: number = 15,
): boolean {
  const expandedDropZone = expandRect(dropZoneRect, tolerance);

  // 1. Check if the object intersects the expanded drop zone
  if (rectsIntersect(objectRect, expandedDropZone)) {
    return true;
  }

  // 2. Proximity check
  if (isNearDropZone(objectRect, dropZoneRect, distanceThreshold)) {
    return true;
  }

  return false;
}
