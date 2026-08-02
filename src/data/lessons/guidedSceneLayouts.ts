import type { PercentRect } from '../../types/lesson';
import { rect } from '../lessonAuthoring';

export type GuidedSceneLayout = {
  characterPosition: PercentRect;
  dropZonePosition: PercentRect;
  dropZoneTouchArea: PercentRect;
  objectPositions: readonly PercentRect[];
};

const actionCardPositions = [
  rect(22, 81, 17, 14),
  rect(47, 81, 17, 14),
  rect(72, 81, 17, 14),
] as const;

const centeredChild = rect(37, 21, 27, 53);
const leftChild = rect(4, 39, 25, 41);

const bodyCalloutPositions = [
  rect(8, 36, 19, 18),
  rect(69, 12, 20, 17),
  rect(72, 59, 19, 17),
  rect(7, 13, 19, 18),
  rect(10, 61, 18, 16),
  rect(75, 35, 18, 17),
] as const;

const worldPositions = [
  rect(32, 17, 22, 20),
  rect(59, 12, 19, 18),
  rect(79, 25, 16, 18),
  rect(33, 48, 18, 17),
  rect(56, 45, 20, 18),
  rect(79, 54, 16, 16),
] as const;

const feelingPositions = [
  rect(32, 16, 22, 21),
  rect(59, 12, 22, 21),
  rect(79, 36, 17, 18),
  rect(33, 49, 18, 18),
  rect(56, 46, 19, 19),
  rect(78, 59, 17, 16),
] as const;

const layouts = {
  'head-and-face': makeLayout(
    centeredChild,
    bodyCalloutPositions,
    rect(42, 23, 17, 15),
  ),
  'arms-and-hands': makeLayout(
    centeredChild,
    [
      rect(7, 20, 20, 19),
      rect(70, 18, 20, 19),
      rect(77, 42, 17, 17),
      rect(6, 46, 19, 18),
      rect(10, 66, 18, 14),
      rect(72, 64, 18, 15),
    ],
    rect(54, 45, 18, 17),
  ),
  'legs-and-feet': makeLayout(
    centeredChild,
    [
      rect(7, 21, 20, 19),
      rect(71, 20, 20, 19),
      rect(77, 43, 17, 17),
      rect(6, 48, 18, 18),
      rect(10, 67, 18, 13),
      rect(72, 65, 18, 15),
    ],
    rect(47, 63, 18, 16),
  ),
  'seeing-world': makeLayout(leftChild, worldPositions),
  'hearing-world': makeLayout(leftChild, [
    rect(32, 18, 22, 20),
    rect(60, 13, 19, 18),
    rect(79, 27, 17, 18),
    rect(34, 49, 18, 17),
    rect(57, 46, 19, 18),
    rect(80, 57, 14, 14),
  ]),
  'smell-taste-touch': makeLayout(leftChild, [
    rect(32, 15, 20, 20),
    rect(57, 18, 19, 19),
    rect(79, 27, 16, 18),
    rect(33, 49, 18, 17),
    rect(56, 51, 18, 17),
    rect(79, 56, 16, 16),
  ]),
  'happy-and-sad': makeLayout(leftChild, feelingPositions),
  'angry-and-scared': makeLayout(leftChild, [
    rect(32, 15, 22, 21),
    rect(60, 13, 21, 21),
    rect(79, 37, 17, 18),
    rect(33, 50, 18, 18),
    rect(56, 47, 19, 19),
    rect(78, 59, 17, 16),
  ]),
  'excited-and-proud': makeLayout(leftChild, [
    rect(33, 17, 22, 21),
    rect(60, 12, 21, 21),
    rect(79, 35, 17, 18),
    rect(32, 50, 18, 18),
    rect(56, 47, 19, 19),
    rect(78, 59, 17, 16),
  ]),
  'body-signals': makeLayout(centeredChild, [
    rect(8, 16, 19, 18),
    rect(70, 17, 20, 18),
    rect(76, 40, 17, 17),
    rect(8, 41, 18, 18),
    rect(10, 63, 18, 15),
    rect(72, 61, 19, 16),
  ]),
  'slow-breathing': makeLayout(
    leftChild,
    [
      rect(31, 34, 20, 18),
      rect(32, 58, 19, 17),
      rect(54, 23, 17, 18),
      rect(78, 18, 17, 19),
      rect(57, 51, 19, 18),
      rect(80, 55, 15, 17),
    ],
    rect(22, 35, 18, 16),
  ),
  'comfort-corner': makeLayout(
    leftChild,
    [
      rect(32, 25, 25, 22),
      rect(36, 54, 20, 17),
      rect(59, 50, 19, 19),
      rect(79, 20, 16, 18),
      rect(59, 20, 17, 17),
      rect(81, 55, 14, 16),
    ],
    rect(32, 25, 25, 22),
  ),
  'face-and-hair-care': makeLayout(
    leftChild,
    [
      rect(34, 47, 18, 17),
      rect(55, 49, 17, 16),
      rect(79, 55, 16, 17),
      rect(70, 14, 23, 28),
      rect(35, 19, 14, 15),
      rect(55, 20, 15, 16),
    ],
    rect(13, 38, 17, 17),
  ),
  'cough-and-sneeze-care': makeLayout(leftChild, [
    rect(33, 25, 21, 20),
    rect(59, 18, 20, 20),
    rect(34, 55, 17, 16),
    rect(56, 51, 18, 17),
    rect(79, 27, 16, 17),
    rect(80, 57, 15, 17),
  ]),
  'care-items': makeLayout(
    leftChild,
    [
      rect(35, 49, 17, 17),
      rect(55, 53, 18, 16),
      rect(73, 48, 18, 18),
      rect(34, 20, 17, 17),
      rect(57, 17, 18, 19),
      rect(80, 22, 16, 18),
    ],
    rect(72, 48, 19, 19),
  ),
  'choose-clothes': makeLayout(
    leftChild,
    [
      rect(34, 17, 18, 21),
      rect(56, 53, 18, 17),
      rect(79, 16, 16, 23),
      rect(35, 49, 18, 19),
      rect(57, 17, 18, 22),
      rect(80, 55, 15, 15),
    ],
    rect(11, 48, 20, 24),
  ),
  'put-on-clothes': makeLayout(centeredChild, [
    rect(8, 17, 19, 19),
    rect(70, 15, 20, 18),
    rect(76, 39, 18, 18),
    rect(7, 43, 19, 18),
    rect(10, 64, 18, 15),
    rect(72, 61, 19, 16),
  ]),
  'fasteners-and-shoes': makeLayout(
    leftChild,
    [
      rect(34, 23, 17, 17),
      rect(58, 19, 18, 19),
      rect(80, 29, 15, 18),
      rect(35, 53, 17, 17),
      rect(58, 49, 18, 18),
      rect(80, 58, 15, 15),
    ],
    rect(14, 46, 17, 20),
  ),
  'toilet-signals': makeLayout(leftChild, [
    rect(35, 49, 22, 22),
    rect(73, 15, 20, 22),
    rect(78, 54, 17, 17),
    rect(56, 18, 14, 15),
    rect(34, 15, 18, 27),
    rect(59, 61, 16, 14),
  ]),
  'toilet-steps': makeLayout(leftChild, [
    rect(32, 55, 17, 16),
    rect(50, 38, 23, 23),
    rect(76, 29, 16, 16),
    rect(34, 18, 17, 17),
    rect(56, 15, 18, 21),
    rect(80, 57, 15, 17),
  ]),
  'clean-and-private': makeLayout(
    leftChild,
    [
      rect(35, 43, 27, 22),
      rect(62, 50, 15, 16),
      rect(80, 32, 15, 18),
      rect(35, 17, 18, 18),
      rect(59, 18, 18, 17),
      rect(80, 58, 15, 17),
    ],
    rect(40, 46, 23, 19),
  ),
  'body-needs': makeLayout(centeredChild, [
    rect(8, 15, 19, 18),
    rect(69, 13, 20, 18),
    rect(76, 37, 18, 18),
    rect(7, 40, 19, 18),
    rect(10, 62, 18, 16),
    rect(72, 60, 19, 17),
  ]),
  'pain-and-help': makeLayout(centeredChild, [
    rect(8, 17, 19, 18),
    rect(70, 39, 20, 18),
    rect(70, 13, 20, 18),
    rect(8, 39, 19, 18),
    rect(11, 62, 18, 16),
    rect(73, 61, 18, 16),
  ]),
  'body-boundaries': makeLayout(leftChild, [
    rect(32, 16, 22, 20),
    rect(59, 13, 22, 20),
    rect(79, 36, 17, 18),
    rect(33, 49, 19, 18),
    rect(57, 47, 18, 18),
    rect(78, 59, 17, 16),
  ]),
} satisfies Record<string, GuidedSceneLayout>;

export function getGuidedSceneLayout(sceneId: string): GuidedSceneLayout {
  const sceneLayout = layouts[sceneId as keyof typeof layouts];
  if (!sceneLayout) {
    throw new Error(`Missing guided scene layout for ${sceneId}.`);
  }

  return sceneLayout;
}

function makeLayout(
  characterPosition: PercentRect,
  sceneObjectPositions: readonly PercentRect[],
  dropZonePosition: PercentRect = rect(7, 13, 20, 19),
): GuidedSceneLayout {
  if (sceneObjectPositions.length !== 6) {
    throw new Error('Guided scene layouts require six contextual objects.');
  }

  return {
    characterPosition,
    dropZonePosition,
    dropZoneTouchArea: expand(dropZonePosition, 4),
    objectPositions: [...sceneObjectPositions, ...actionCardPositions],
  };
}

function expand(position: PercentRect, amount: number): PercentRect {
  return rect(
    Math.max(0, position.x - amount),
    Math.max(0, position.y - amount),
    Math.min(100, position.width + amount * 2),
    Math.min(100, position.height + amount * 2),
  );
}
