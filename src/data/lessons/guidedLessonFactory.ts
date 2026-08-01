import type {
  Lesson,
  PercentRect,
  VocabularyType,
} from '../../types/lesson';
import { rect } from '../lessonAuthoring';
import {
  makeOutsideExplorationLesson,
  type OutsideLessonSpec,
  type OutsideSceneSpec,
  type OutsideVocabularySpec,
} from './outsideExplorationFactory';
import { getGuidedSceneLayout } from './guidedSceneLayouts';

type GuidedVisualKind = 'card' | 'object' | 'picture';

type GuidedVocabularySpec = {
  assetName?: string;
  failHintEn?: string;
  failHintVi?: string;
  key: string;
  labelVi: string;
  meaningVi: string;
  practice?: 'drag' | 'tap';
  practiceInstructionEn?: string;
  practiceInstructionVi?: string;
  successFeedbackEn?: string;
  successFeedbackVi?: string;
  teachInstructionVi?: string;
  teachSuccessFeedbackVi?: string;
  tier?: 'core' | 'expanded' | 'challenge';
  type?: VocabularyType;
  visualKind?: GuidedVisualKind;
  word: string;
};

type GuidedSceneSpec = Omit<
  OutsideSceneSpec,
  | 'characterPosition'
  | 'dropZonePosition'
  | 'dropZoneTouchArea'
  | 'vocabulary'
> & {
  vocabulary: GuidedVocabularySpec[];
};

export type GuidedLessonSpec = Omit<OutsideLessonSpec, 'scenes'> & {
  scenes: GuidedSceneSpec[];
};

export function makeGuidedLesson(spec: GuidedLessonSpec): Lesson {
  const normalizedSpec: OutsideLessonSpec = {
    ...spec,
    scenes: spec.scenes.map(scene => {
      const layout = getGuidedSceneLayout(scene.id);

      return {
        ...scene,
        characterPosition: layout.characterPosition,
        dropZonePosition: layout.dropZonePosition,
        dropZoneTouchArea: layout.dropZoneTouchArea,
        vocabulary: scene.vocabulary.map((item, index) =>
          normalizeVocabularyItem(item, layout.objectPositions[index]),
        ),
      };
    }),
  };

  return makeOutsideExplorationLesson(normalizedSpec);
}

function normalizeVocabularyItem(
  item: GuidedVocabularySpec,
  position: PercentRect | undefined,
): OutsideVocabularySpec {
  if (!position) {
    throw new Error('Guided scenes support exactly nine vocabulary items.');
  }

  const {
    visualKind: requestedVisualKind,
    ...outsideItem
  } = item;
  const visualKind =
    requestedVisualKind ?? getDefaultVisualKind(item.type ?? 'noun');
  const targetEn = getTargetEn(item, visualKind);
  const targetVi = getTargetVi(item.labelVi, visualKind);
  const { locationEn, locationVi } = describePosition(position);
  const isDrag = item.practice === 'drag';

  return {
    ...outsideItem,
    failHintEn:
      item.failHintEn ?? `Look for ${targetEn} ${locationEn}.`,
    failHintVi:
      item.failHintVi ?? `Tìm ${targetVi} ở ${locationVi} nhé.`,
    position,
    practiceInstructionEn:
      item.practiceInstructionEn ??
      `${isDrag ? 'Drag' : 'Tap'} ${targetEn}${
        isDrag ? ' into the glowing area' : ''
      }.`,
    practiceInstructionVi:
      item.practiceInstructionVi ??
      `${isDrag ? 'Kéo' : 'Chạm vào'} ${targetVi}${
        isDrag ? ' vào vùng sáng' : ''
      } nhé.`,
    successFeedbackEn: item.successFeedbackEn ?? 'Great job!',
    successFeedbackVi:
      item.successFeedbackVi ?? getSuccessFeedbackVi(item.labelVi, visualKind),
    teachInstructionVi:
      item.teachInstructionVi ??
      getTeachInstructionVi(item.labelVi, item.meaningVi, visualKind),
    teachSuccessFeedbackVi:
      item.teachSuccessFeedbackVi ??
      getTeachSuccessFeedbackVi(item.meaningVi, visualKind),
    touchArea: expandTouchArea(position),
  };
}

function getDefaultVisualKind(type: VocabularyType): GuidedVisualKind {
  if (type === 'phrase') {
    return 'card';
  }
  if (type === 'adjective' || type === 'verb') {
    return 'picture';
  }
  return 'object';
}

function getTargetVi(labelVi: string, visualKind: GuidedVisualKind) {
  if (visualKind === 'card') {
    return `thẻ ${labelVi}`;
  }
  if (visualKind === 'picture') {
    return `hình ${labelVi}`;
  }
  return labelVi;
}

function getTargetEn(
  item: GuidedVocabularySpec,
  visualKind: GuidedVisualKind,
) {
  if (visualKind === 'card') {
    return 'the matching card';
  }
  if (visualKind === 'picture') {
    return `the picture for ${item.word}`;
  }
  return `the ${item.word}`;
}

function getTeachInstructionVi(
  labelVi: string,
  meaningVi: string,
  visualKind: GuidedVisualKind,
) {
  if (visualKind === 'card') {
    return `Mình học câu ${meaningVi} nhé.`;
  }
  if (visualKind === 'picture') {
    return `Mình cùng xem hình ${labelVi} nhé.`;
  }
  return `Đây là ${labelVi}.`;
}

function getTeachSuccessFeedbackVi(
  meaningVi: string,
  visualKind: GuidedVisualKind,
) {
  return visualKind === 'card'
    ? `Câu này nghĩa là ${meaningVi}.`
    : `Từ này nghĩa là ${meaningVi}.`;
}

function getSuccessFeedbackVi(
  labelVi: string,
  visualKind: GuidedVisualKind,
) {
  if (visualKind === 'picture') {
    return 'Đúng rồi, bé đã chọn đúng hình.';
  }
  if (visualKind === 'card') {
    return 'Đúng rồi, bé đã chọn đúng thẻ.';
  }
  return `Đúng rồi, đó là ${labelVi}.`;
}

function describePosition(position: PercentRect) {
  const centerX = position.x + position.width / 2;
  const centerY = position.y + position.height / 2;

  if (centerY >= 76) {
    if (centerX < 42) {
      return {
        locationEn: 'at the bottom left',
        locationVi: 'hàng dưới bên trái',
      };
    }
    if (centerX > 67) {
      return {
        locationEn: 'at the bottom right',
        locationVi: 'hàng dưới bên phải',
      };
    }
    return {
      locationEn: 'at the bottom center',
      locationVi: 'giữa hàng dưới',
    };
  }

  if (centerY < 39) {
    if (centerX < 42) {
      return {
        locationEn: 'at the upper left',
        locationVi: 'phía trên bên trái',
      };
    }
    if (centerX > 67) {
      return {
        locationEn: 'at the upper right',
        locationVi: 'phía trên bên phải',
      };
    }
    return {
      locationEn: 'near the top center',
      locationVi: 'giữa phía trên',
    };
  }

  if (centerY >= 60) {
    if (centerX < 42) {
      return {
        locationEn: 'at the lower left',
        locationVi: 'phía dưới bên trái',
      };
    }
    if (centerX > 67) {
      return {
        locationEn: 'at the lower right',
        locationVi: 'phía dưới bên phải',
      };
    }
    return {
      locationEn: 'near the lower center',
      locationVi: 'giữa phía dưới',
    };
  }

  if (centerX < 42) {
    return { locationEn: 'on the left', locationVi: 'bên trái' };
  }
  if (centerX > 67) {
    return { locationEn: 'on the right', locationVi: 'bên phải' };
  }
  return { locationEn: 'in the center', locationVi: 'chính giữa' };
}

function expandTouchArea(position: PercentRect): PercentRect {
  const x = Math.max(0, position.x - 4);
  const y = Math.max(0, position.y - 4);

  return rect(
    x,
    y,
    Math.min(100 - x, position.width + 8),
    Math.min(100 - y, position.height + 8),
  );
}
