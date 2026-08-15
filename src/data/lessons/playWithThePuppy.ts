import type {
  LearningMode,
  LearningScope,
  Lesson,
  PercentRect,
  Scene,
  SceneEffect,
  SceneObject,
  SceneStateChange,
  SceneStep,
  VocabularyItem,
  VocabularyType,
} from '../../types/lesson';
import {
  dragStep,
  findStep,
  imageAsset,
  learningObject,
  lessonEffects,
  listenStep,
  objectVariant,
  rect,
  sceneObject,
  sceneStateChanges,
  tapStep,
} from '../lessonAuthoring';

const lessonId = 'play-with-the-puppy';
const expandedScope = { minMode: 'expanded' } satisfies LearningScope;
const challengeScope = { minMode: 'challenge' } satisfies LearningScope;

type VocabularySpec = {
  key: string;
  meaningVi: string;
  tier?: LearningMode;
  type?: VocabularyType;
  word: string;
};

type PracticeSpec = {
  afterSuccessStateChanges?: SceneStateChange[];
  correctObjectIds?: string[];
  dropZoneId?: string;
  effects?: SceneEffect[];
  failEn: string;
  failVi: string;
  instructionEn: string;
  instructionVi: string;
  kind?: 'drag' | 'find' | 'tap';
  successEn: string;
  successStateChanges?: SceneStateChange[];
  successVi: string;
  targetObjectId?: string;
  targetObjectIds?: string[];
};

type VocabularyBeat = VocabularySpec & {
  cueAsset?: string;
  cueObjectId?: string;
  cuePosition?: PercentRect;
  cueTouchArea?: PercentRect;
  hideCueAfterPractice?: boolean;
  practice: PracticeSpec;
  revealStateChanges?: SceneStateChange[];
  speechPractice?: SceneStep['speechPractice'];
  teachEn: string;
  teachFailEn: string;
  teachFailVi: string;
  teachSuccessEn: string;
  teachVi: string;
};

function scopeForTier(tier: LearningMode = 'core') {
  return tier === 'expanded'
    ? expandedScope
    : tier === 'challenge'
    ? challengeScope
    : undefined;
}

function vocabularyItem(
  sceneId: string,
  { key, meaningVi, tier = 'core', type = 'noun', word }: VocabularySpec,
): VocabularyItem {
  return {
    id: `vocab-${lessonId}-${sceneId}-${key}`,
    learningScope: scopeForTier(tier),
    level:
      tier === 'expanded' ? 'medium' : tier === 'challenge' ? 'hard' : 'easy',
    meaningVi,
    type,
    word,
  };
}

function sceneImageSource(sceneId: string, assetName: string) {
  return `lessons/${lessonId}/${sceneId}/images/${assetName}.webp`;
}

function cueId(sceneId: string, key: string) {
  return `${sceneId}-${key}-cue`;
}

function contextualHintEn(text: string) {
  return text.startsWith('Drag ')
    ? text.replace(/^Drag\s+/u, 'Try dragging ')
    : text.replace(/^(?:Find|Tap)\s+/u, 'Look for ');
}

function makeBeatVocabulary(sceneId: string, beats: VocabularyBeat[]) {
  return beats.map(beat => vocabularyItem(sceneId, beat));
}

function makeBeatObjects(
  sceneId: string,
  beats: VocabularyBeat[],
  vocabulary: VocabularyItem[],
): SceneObject[] {
  return beats.flatMap((beat, index) => {
    if (beat.cueObjectId) return [];
    if (!beat.cueAsset || !beat.cuePosition) {
      throw new Error(`Missing cue for ${sceneId}/${beat.key}`);
    }
    return [
      learningObject({
        id: cueId(sceneId, beat.key),
        assetSource: sceneImageSource(sceneId, beat.cueAsset),
        initialVisibility: index === 0 ? 'visible' : 'hidden',
        learningScope: scopeForTier(beat.tier),
        position: beat.cuePosition,
        touchArea: beat.cueTouchArea,
        vocab: vocabulary[index],
      }),
    ];
  });
}

function makeBeatSteps(
  sceneId: string,
  beats: VocabularyBeat[],
  vocabulary: VocabularyItem[],
): SceneStep[] {
  return beats.flatMap((beat, index) => {
    const currentCueId = beat.cueObjectId ?? cueId(sceneId, beat.key);
    const nextBeat = beats[index + 1];
    const nextCueId =
      nextBeat?.cueObjectId ??
      (nextBeat ? cueId(sceneId, nextBeat.key) : undefined);
    const learningScope = scopeForTier(beat.tier);
    const targetObjectId = beat.practice.targetObjectId ?? currentCueId;
    const afterSuccessStateChanges = [
      ...(beat.practice.afterSuccessStateChanges ?? []),
      ...(beat.cueObjectId || beat.hideCueAfterPractice === false
        ? []
        : [sceneStateChanges.hide(currentCueId)]),
      ...(nextBeat?.revealStateChanges ?? []),
      ...(nextCueId && !nextBeat?.cueObjectId
        ? [sceneStateChanges.show(nextCueId)]
        : []),
    ];
    const commonPracticeInput = {
      id: `${sceneId}-${beat.key}-practice`,
      instructionVi: beat.practice.instructionVi,
      instructionEn: beat.practice.instructionEn,
      successFeedbackVi: beat.practice.successVi,
      successFeedbackEn: beat.practice.successEn,
      failFeedbackVi: beat.practice.failVi,
      failFeedbackEn: contextualHintEn(beat.practice.failEn),
      effects: beat.practice.effects,
      successStateChanges: beat.practice.successStateChanges,
      afterSuccessStateChanges,
      learningScope,
      targetObjectId,
      targetObjectIds: beat.practice.targetObjectIds,
      correctObjectIds: beat.practice.correctObjectIds,
      type: 'practice' as const,
    };
    const practiceStep =
      beat.practice.kind === 'drag'
        ? dragStep({
            ...commonPracticeInput,
            dropZoneId: beat.practice.dropZoneId!,
          })
        : beat.practice.kind === 'find'
        ? findStep(commonPracticeInput)
        : tapStep(commonPracticeInput);

    return [
      tapStep({
        id: `${sceneId}-${beat.key}-teach`,
        instructionVi: beat.teachVi,
        instructionEn: beat.teachEn,
        promptText: beat.word,
        successFeedbackVi: `Đúng rồi. Từ vừa nghe có nghĩa là ${beat.meaningVi}.`,
        successFeedbackEn: beat.teachSuccessEn,
        failFeedbackVi: beat.teachFailVi,
        failFeedbackEn: contextualHintEn(beat.teachFailEn),
        effects: [lessonEffects.sparkle(currentCueId)],
        learningScope,
        speechPractice: beat.speechPractice ?? 'auto',
        targetObjectId: currentCueId,
        type: 'teach',
        vocabId: vocabulary[index].id,
      }),
      practiceStep,
    ];
  });
}

function makeChooseTheBallScene(): Scene {
  const sceneId = 'choose-the-ball';
  const heroId = `${sceneId}-hero`;
  const basketId = `${sceneId}-basket`;
  const redBallId = `${sceneId}-red-ball`;
  const ropeId = `${sceneId}-rope`;
  const blueBallId = `${sceneId}-blue-ball`;
  const hardBlockId = `${sceneId}-hard-block`;

  const beats: VocabularyBeat[] = [
    {
      key: 'play',
      meaningVi: 'chơi',
      word: 'play',
      type: 'verb',
      cueObjectId: heroId,
      teachVi: 'Chạm chú cún đang rủ bé chơi nhé.',
      teachEn: 'Tap the puppy asking you to play.',
      teachSuccessEn: 'Play means to have fun together.',
      teachFailVi: 'Chạm chú cún cúi thấp ở bên phải nhé.',
      teachFailEn: 'Tap the puppy bowing on the right.',
      practice: {
        instructionVi: 'Chạm chiếc giỏ để bắt đầu chơi nhé.',
        instructionEn: 'Tap the basket to start playing.',
        successVi: 'Giỏ đồ chơi đã mở rồi.',
        successEn: 'The toy basket is open.',
        failVi: 'Chạm chiếc giỏ ở bên trái nhé.',
        failEn: 'Tap the basket on the left.',
        targetObjectId: basketId,
        successStateChanges: [sceneStateChanges.setVariant(basketId, 'open')],
        afterSuccessStateChanges: [
          sceneStateChanges.show(redBallId),
          sceneStateChanges.show(ropeId),
        ],
      },
    },
    {
      key: 'ball',
      meaningVi: 'quả bóng',
      word: 'ball',
      cueObjectId: redBallId,
      revealStateChanges: [sceneStateChanges.show(redBallId)],
      teachVi: 'Chạm quả bóng đỏ trong giỏ nhé.',
      teachEn: 'Tap the red ball in the basket.',
      teachSuccessEn: 'This is a ball.',
      teachFailVi: 'Chạm đồ chơi tròn màu đỏ nhé.',
      teachFailEn: 'Tap the round red toy.',
      practice: {
        kind: 'find',
        instructionVi: 'Tìm quả bóng, đừng chọn dây nhé.',
        instructionEn: 'Find the ball, not the rope.',
        successVi: 'Đúng rồi, bé đã tìm thấy quả bóng.',
        successEn: 'Right, you found the ball.',
        failVi: 'Tìm đồ chơi tròn màu đỏ nhé.',
        failEn: 'Find the round red toy.',
        targetObjectId: redBallId,
        targetObjectIds: [redBallId, ropeId],
        correctObjectIds: [redBallId],
      },
    },
    {
      key: 'choose',
      meaningVi: 'chọn',
      word: 'choose',
      type: 'verb',
      cueAsset: 'choosing-hand',
      cuePosition: rect(31, 24, 27, 22),
      cueTouchArea: rect(25, 18, 39, 34),
      teachVi: 'Chạm bàn tay đang chỉ để chọn nhé.',
      teachEn: 'Tap the pointing hand that is choosing.',
      teachSuccessEn: 'Choose means to pick one thing.',
      teachFailVi: 'Chạm bàn tay áo xanh ở gần quả bóng nhé.',
      teachFailEn: 'Tap the hand near the ball.',
      practice: {
        instructionVi: 'Chạm quả bóng đỏ để chọn cho cún nhé.',
        instructionEn: 'Tap the red ball to choose it for the puppy.',
        successVi: 'Bé đã chọn bóng cho cún.',
        successEn: 'You chose the ball.',
        failVi: 'Chạm quả bóng đỏ nhé.',
        failEn: 'Tap the red ball.',
        targetObjectId: redBallId,
        successStateChanges: [sceneStateChanges.setVariant(heroId, 'ready')],
        effects: [lessonEffects.sound('correct')],
      },
    },
    {
      key: 'toy',
      meaningVi: 'đồ chơi',
      word: 'toy',
      tier: 'expanded',
      cueObjectId: basketId,
      revealStateChanges: [sceneStateChanges.show(ropeId)],
      teachVi: 'Chạm giỏ có nhiều đồ để chơi nhé.',
      teachEn: 'Tap the basket full of toys.',
      teachSuccessEn: 'A toy is something we play with.',
      teachFailVi: 'Chạm chiếc giỏ đang mở nhé.',
      teachFailEn: 'Tap the open basket.',
      practice: {
        instructionVi: 'Chạm sợi dây đồ chơi trong giỏ nhé.',
        instructionEn: 'Tap the rope toy in the basket.',
        successVi: 'Sợi dây cũng là một đồ chơi.',
        successEn: 'The rope is a toy too.',
        failVi: 'Chạm sợi dây xanh vàng nhé.',
        failEn: 'Tap the green and yellow rope.',
        targetObjectId: ropeId,
      },
    },
    {
      key: 'red',
      meaningVi: 'màu đỏ',
      word: 'red',
      tier: 'expanded',
      type: 'adjective',
      speechPractice: 'optional',
      cueObjectId: redBallId,
      revealStateChanges: [sceneStateChanges.show(blueBallId)],
      teachVi: 'Chạm quả bóng màu đỏ nhé.',
      teachEn: 'Tap the red ball.',
      teachSuccessEn: 'Red is this bright color.',
      teachFailVi: 'Chạm quả bóng cùng màu quả cà chua nhé.',
      teachFailEn: 'Tap the red ball.',
      practice: {
        kind: 'find',
        instructionVi: 'Tìm bóng đỏ, không chọn bóng xanh nhé.',
        instructionEn: 'Find the red ball, not the blue ball.',
        successVi: 'Đúng rồi, đây là bóng đỏ.',
        successEn: 'Right, this ball is red.',
        failVi: 'Tìm quả bóng màu đỏ nhé.',
        failEn: 'Find the red ball.',
        targetObjectId: redBallId,
        targetObjectIds: [redBallId, blueBallId],
        correctObjectIds: [redBallId],
      },
    },
    {
      key: 'round',
      meaningVi: 'tròn',
      word: 'round',
      tier: 'expanded',
      type: 'adjective',
      speechPractice: 'optional',
      cueAsset: 'round-ball-cue',
      cuePosition: rect(46, 54, 22, 20),
      cueTouchArea: rect(40, 48, 34, 32),
      teachVi: 'Chạm quả bóng tròn đang rung nhẹ nhé.',
      teachEn: 'Tap the round ball that is wiggling.',
      teachSuccessEn: 'Round means shaped like a circle or ball.',
      teachFailVi: 'Chạm hình tròn màu đỏ nhé.',
      teachFailEn: 'Tap the round red shape.',
      practice: {
        kind: 'find',
        instructionVi: 'Tìm đồ chơi tròn trong giỏ nhé.',
        instructionEn: 'Find the round toy in the basket.',
        successVi: 'Quả bóng có dạng tròn.',
        successEn: 'The ball is round.',
        failVi: 'Tìm quả bóng, không chọn dây nhé.',
        failEn: 'Find the ball, not the rope.',
        targetObjectId: redBallId,
        targetObjectIds: [redBallId, ropeId],
        correctObjectIds: [redBallId],
      },
    },
    {
      key: 'soft',
      meaningVi: 'mềm',
      word: 'soft',
      tier: 'challenge',
      type: 'adjective',
      speechPractice: 'optional',
      cueAsset: 'soft-ball-squeeze',
      cuePosition: rect(12, 28, 29, 24),
      cueTouchArea: rect(6, 22, 41, 36),
      revealStateChanges: [sceneStateChanges.show(hardBlockId)],
      teachVi: 'Chạm bàn tay đang bóp nhẹ quả bóng nhé.',
      teachEn: 'Tap the hand gently squeezing the soft ball.',
      teachSuccessEn: 'Soft means easy to press.',
      teachFailVi: 'Chạm bàn tay áo xanh đang cầm bóng nhé.',
      teachFailEn: 'Tap the hand holding the ball.',
      practice: {
        kind: 'find',
        instructionVi: 'Tìm món mềm, không chọn khối cứng nhé.',
        instructionEn: 'Find the soft toy, not the hard block.',
        successVi: 'Quả bóng này mềm và an toàn để lăn.',
        successEn: 'This ball is soft and safe to roll.',
        failVi: 'Tìm quả bóng mềm màu đỏ nhé.',
        failEn: 'Find the soft red ball.',
        targetObjectId: redBallId,
        targetObjectIds: [redBallId, hardBlockId],
        correctObjectIds: [redBallId],
      },
    },
    {
      key: 'pick-it-up',
      meaningVi: 'nhặt nó lên',
      word: 'pick it up',
      tier: 'challenge',
      type: 'phrase',
      cueAsset: 'pick-up-ball',
      cuePosition: rect(30, 45, 30, 25),
      cueTouchArea: rect(24, 39, 42, 37),
      teachVi: 'Chạm bàn tay đang nhặt bóng lên nhé.',
      teachEn: 'Tap the hand picking up the ball.',
      teachSuccessEn: 'Pick it up means lift it from the floor.',
      teachFailVi: 'Chạm bàn tay nâng quả bóng đỏ nhé.',
      teachFailEn: 'Tap the hand lifting the red ball.',
      practice: {
        instructionVi: 'Chạm quả bóng để nhặt lên chuẩn bị chơi nhé.',
        instructionEn: 'Tap the ball to pick it up for play.',
        successVi: 'Bóng đã được nhặt lên rồi.',
        successEn: 'The ball is picked up.',
        failVi: 'Chạm quả bóng đỏ nhé.',
        failEn: 'Tap the red ball.',
        targetObjectId: redBallId,
        successStateChanges: [sceneStateChanges.hide(redBallId)],
      },
    },
    {
      key: 'ready',
      meaningVi: 'sẵn sàng',
      word: 'ready',
      tier: 'challenge',
      type: 'adjective',
      speechPractice: 'optional',
      cueObjectId: heroId,
      teachVi: 'Chạm chú cún đang đứng chờ chơi nhé.',
      teachEn: 'Tap the puppy that is ready to play.',
      teachSuccessEn: 'Ready means prepared to begin.',
      teachFailVi: 'Chạm chú cún có vòng cổ xanh nhé.',
      teachFailEn: 'Tap the puppy with the blue collar.',
      practice: {
        instructionVi: 'Chạm chú cún để báo mình đã sẵn sàng nhé.',
        instructionEn: 'Tap the puppy to show you are ready.',
        successVi: 'Cả bé và cún đã sẵn sàng.',
        successEn: 'You and the puppy are ready.',
        failVi: 'Chạm chú cún bên phải nhé.',
        failEn: 'Tap the puppy on the right.',
        targetObjectId: heroId,
        effects: [lessonEffects.sound('yay')],
      },
    },
  ];
  const vocabulary = makeBeatVocabulary(sceneId, beats);

  return {
    id: sceneId,
    titleVi: 'Chọn quả bóng',
    titleEn: 'Choose the Ball',
    thumbnailEmoji: '🎾',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: heroId,
        assetSource: sceneImageSource(sceneId, 'puppy-play-bow'),
        isInteractive: true,
        position: rect(64, 42, 31, 34),
        presentation: 'cutout',
        touchArea: rect(58, 34, 41, 47),
        variants: [
          objectVariant({
            id: 'ready',
            assetSource: sceneImageSource(sceneId, 'puppy-ready'),
          }),
        ],
      }),
      sceneObject({
        id: basketId,
        assetSource: sceneImageSource(sceneId, 'toy-basket-closed'),
        isInteractive: true,
        position: rect(7, 50, 34, 28),
        presentation: 'cutout',
        touchArea: rect(2, 43, 44, 39),
        variants: [
          objectVariant({
            id: 'open',
            assetSource: sceneImageSource(sceneId, 'toy-basket-open'),
          }),
        ],
      }),
      sceneObject({
        id: redBallId,
        assetSource: sceneImageSource(sceneId, 'red-ball'),
        initialVisibility: 'hidden',
        isInteractive: true,
        position: rect(22, 56, 18, 16),
        presentation: 'cutout',
        touchArea: rect(16, 49, 30, 29),
      }),
      sceneObject({
        id: ropeId,
        assetSource: sceneImageSource(sceneId, 'rope-toy'),
        initialVisibility: 'hidden',
        isInteractive: true,
        position: rect(5, 60, 23, 14),
        presentation: 'cutout',
        touchArea: rect(1, 53, 33, 27),
      }),
      sceneObject({
        id: blueBallId,
        assetSource: sceneImageSource(sceneId, 'blue-ball'),
        initialVisibility: 'hidden',
        isInteractive: true,
        learningScope: expandedScope,
        position: rect(46, 58, 17, 15),
        presentation: 'cutout',
        touchArea: rect(40, 51, 29, 28),
      }),
      sceneObject({
        id: hardBlockId,
        assetSource: sceneImageSource(sceneId, 'hard-block'),
        initialVisibility: 'hidden',
        isInteractive: true,
        learningScope: challengeScope,
        position: rect(44, 58, 18, 17),
        presentation: 'cutout',
        touchArea: rect(38, 51, 30, 30),
      }),
      ...makeBeatObjects(sceneId, beats, vocabulary),
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        type: 'intro',
        instructionVi: 'Cún muốn chơi. Mình mở giỏ và chọn một quả bóng nhé.',
        instructionEn:
          'The puppy wants to play. Open the basket and choose a ball.',
        successFeedbackVi: 'Cún đang chờ bé chọn đồ chơi.',
        successFeedbackEn: 'The puppy is waiting for you to choose a toy.',
        targetObjectIds: [heroId, basketId],
      }),
      ...makeBeatSteps(sceneId, beats, vocabulary),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Bé đã chọn được quả bóng mềm cho cún.',
      messageEn: 'You chose a soft ball for the puppy.',
    },
  };
}

function makeRollAndCatchScene(): Scene {
  const sceneId = 'roll-and-catch';
  const heroId = `${sceneId}-hero`;
  const ballId = `${sceneId}-ball`;
  const rollZoneId = `${sceneId}-roll-zone`;

  const beats: VocabularyBeat[] = [
    {
      key: 'roll',
      meaningVi: 'lăn',
      word: 'roll',
      type: 'verb',
      cueAsset: 'hand-roll-action',
      cuePosition: rect(7, 27, 31, 25),
      cueTouchArea: rect(1, 20, 43, 38),
      teachVi: 'Chạm bàn tay đang lăn bóng nhé.',
      teachEn: 'Tap the hand rolling the ball.',
      teachSuccessEn: 'Roll means to make something move by turning over.',
      teachFailVi: 'Chạm bàn tay áo xanh cạnh bóng đỏ nhé.',
      teachFailEn: 'Tap the hand beside the red ball.',
      practice: {
        kind: 'drag',
        instructionVi: 'Kéo bóng nhẹ tới vòng tròn trước mặt cún nhé.',
        instructionEn:
          'Drag the ball gently to the circle in front of the puppy.',
        successVi: 'Quả bóng đang lăn tới cún.',
        successEn: 'The ball is rolling to the puppy.',
        failVi: 'Kéo bóng đỏ vào vòng tròn gần cún nhé.',
        failEn: 'Drag the red ball to the circle near the puppy.',
        targetObjectId: ballId,
        dropZoneId: rollZoneId,
        successStateChanges: [
          sceneStateChanges.setVariant(ballId, 'rolled'),
          sceneStateChanges.setVariant(heroId, 'running'),
        ],
      },
    },
    {
      key: 'run',
      meaningVi: 'chạy',
      word: 'run',
      type: 'verb',
      cueObjectId: heroId,
      teachVi: 'Chạm chú cún đang chạy theo bóng nhé.',
      teachEn: 'Tap the puppy running after the ball.',
      teachSuccessEn: 'Run means to move quickly on your feet.',
      teachFailVi: 'Chạm chú cún đang lao về phía trước nhé.',
      teachFailEn: 'Tap the puppy moving quickly.',
      practice: {
        instructionVi: 'Chạm chú cún để bạn chạy tới quả bóng nhé.',
        instructionEn: 'Tap the puppy so it runs to the ball.',
        successVi: 'Cún đã chạy tới bóng.',
        successEn: 'The puppy ran to the ball.',
        failVi: 'Chạm chú cún đang chạy nhé.',
        failEn: 'Tap the running puppy.',
        targetObjectId: heroId,
        successStateChanges: [sceneStateChanges.setVariant(heroId, 'catching')],
      },
    },
    {
      key: 'catch',
      meaningVi: 'bắt lấy',
      word: 'catch',
      type: 'verb',
      cueObjectId: heroId,
      teachVi: 'Chạm chú cún đang giữ quả bóng lại nhé.',
      teachEn: 'Tap the puppy catching the ball.',
      teachSuccessEn: 'Catch means to stop and hold something moving.',
      teachFailVi: 'Chạm chú cún có hai chân cạnh quả bóng nhé.',
      teachFailEn: 'Tap the puppy stopping the ball.',
      practice: {
        instructionVi: 'Chạm quả bóng trước chân cún để bạn bắt lấy nhé.',
        instructionEn: 'Tap the ball by the puppy so it can catch it.',
        successVi: 'Cún đã bắt được bóng.',
        successEn: 'The puppy caught the ball.',
        failVi: 'Chạm quả bóng đỏ cạnh cún nhé.',
        failEn: 'Tap the red ball beside the puppy.',
        targetObjectId: ballId,
        successStateChanges: [
          sceneStateChanges.setVariant(heroId, 'holding'),
          sceneStateChanges.hide(ballId),
        ],
        effects: [lessonEffects.sound('correct')],
      },
    },
    {
      key: 'mouth',
      meaningVi: 'miệng',
      word: 'mouth',
      tier: 'expanded',
      cueAsset: 'mouth-with-ball-closeup',
      cuePosition: rect(8, 24, 31, 31),
      cueTouchArea: rect(2, 18, 43, 43),
      teachVi: 'Chạm miệng cún đang giữ bóng nhé.',
      teachEn: 'Tap the puppy mouth holding the ball.',
      teachSuccessEn: 'The mouth is where an animal eats and holds things.',
      teachFailVi: 'Chạm phần mặt cún có quả bóng đỏ nhé.',
      teachFailEn: 'Tap the puppy face with the red ball.',
      practice: {
        instructionVi: 'Chạm quả bóng trong miệng cún nhé.',
        instructionEn: 'Tap the ball in the puppy mouth.',
        successVi: 'Cún đang giữ bóng bằng miệng.',
        successEn: 'The puppy is holding the ball in its mouth.',
        failVi: 'Chạm quả bóng đỏ trước mặt cún nhé.',
        failEn: 'Tap the red ball by the puppy mouth.',
      },
    },
    {
      key: 'hold',
      meaningVi: 'giữ',
      word: 'hold',
      tier: 'expanded',
      type: 'verb',
      speechPractice: 'optional',
      cueAsset: 'puppy-holding-ball',
      cuePosition: rect(55, 44, 35, 34),
      cueTouchArea: rect(49, 37, 47, 47),
      revealStateChanges: [sceneStateChanges.hide(heroId)],
      teachVi: 'Chạm chú cún đang giữ bóng chắc nhé.',
      teachEn: 'Tap the puppy holding the ball.',
      teachSuccessEn: 'Hold means to keep something in place.',
      teachFailVi: 'Chạm chú cún đứng cùng quả bóng đỏ nhé.',
      teachFailEn: 'Tap the puppy with the red ball.',
      practice: {
        instructionVi: 'Chạm chú cún và để bạn giữ bóng nhé.',
        instructionEn: 'Tap the puppy and let it hold the ball.',
        successVi: 'Cún đang giữ bóng rất chắc.',
        successEn: 'The puppy is holding the ball securely.',
        failVi: 'Chạm chú cún đang cầm bóng nhé.',
        failEn: 'Tap the puppy holding the ball.',
        successStateChanges: [sceneStateChanges.show(heroId)],
      },
    },
    {
      key: 'turn',
      meaningVi: 'quay lại',
      word: 'turn',
      tier: 'expanded',
      type: 'verb',
      speechPractice: 'optional',
      cueAsset: 'turn-around-action',
      cuePosition: rect(58, 43, 34, 32),
      cueTouchArea: rect(52, 36, 46, 45),
      revealStateChanges: [sceneStateChanges.hide(heroId)],
      teachVi: 'Chạm mũi tên quanh cún để quay lại nhé.',
      teachEn: 'Tap the arrow showing the puppy turning.',
      teachSuccessEn: 'Turn means to change direction.',
      teachFailVi: 'Chạm mũi tên xanh phía sau cún nhé.',
      teachFailEn: 'Tap the blue arrow behind the puppy.',
      practice: {
        instructionVi: 'Chạm chú cún để bạn quay về phía bé nhé.',
        instructionEn: 'Tap the puppy so it turns toward you.',
        successVi: 'Cún đã quay lại cùng quả bóng.',
        successEn: 'The puppy turned around with the ball.',
        failVi: 'Chạm chú cún đang giữ bóng nhé.',
        failEn: 'Tap the puppy holding the ball.',
        successStateChanges: [
          sceneStateChanges.show(heroId),
          sceneStateChanges.setVariant(heroId, 'turned'),
        ],
      },
    },
    {
      key: 'catch-the-ball',
      meaningVi: 'bắt quả bóng',
      word: 'catch the ball',
      tier: 'challenge',
      type: 'phrase',
      cueAsset: 'puppy-catching-ball',
      cuePosition: rect(51, 43, 38, 34),
      cueTouchArea: rect(45, 36, 50, 47),
      revealStateChanges: [sceneStateChanges.hide(heroId)],
      teachVi: 'Chạm cảnh cún chặn quả bóng lại nhé.',
      teachEn: 'Tap the puppy catching the ball.',
      teachSuccessEn: 'Catch the ball means stop and take the moving ball.',
      teachFailVi: 'Chạm chú cún có hai chân cạnh bóng nhé.',
      teachFailEn: 'Tap the puppy stopping the ball.',
      practice: {
        instructionVi: 'Chạm cảnh cún bắt bóng để xem lại nhé.',
        instructionEn: 'Tap the puppy catching the ball to replay it.',
        successVi: 'Cún bắt quả bóng thật khéo.',
        successEn: 'The puppy catches the ball well.',
        failVi: 'Chạm cảnh cún đang bắt bóng nhé.',
        failEn: 'Tap the puppy catching the ball.',
      },
    },
    {
      key: 'hold-it',
      meaningVi: 'giữ nó',
      word: 'hold it',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'puppy-holding-ball',
      cuePosition: rect(55, 44, 35, 34),
      cueTouchArea: rect(49, 37, 47, 47),
      teachVi: 'Chạm cún đang giữ quả bóng nhé.',
      teachEn: 'Tap the puppy holding the ball.',
      teachSuccessEn: 'Hold it means keep that thing securely.',
      teachFailVi: 'Chạm cún đang đứng với bóng đỏ nhé.',
      teachFailEn: 'Tap the puppy with the red ball.',
      practice: {
        instructionVi: 'Chạm quả bóng để cún tiếp tục giữ nó nhé.',
        instructionEn: 'Tap the ball so the puppy keeps holding it.',
        successVi: 'Cún vẫn đang giữ bóng.',
        successEn: 'The puppy is still holding it.',
        failVi: 'Chạm quả bóng đỏ trong miệng cún nhé.',
        failEn: 'Tap the red ball in the puppy mouth.',
      },
    },
    {
      key: 'turn-around',
      meaningVi: 'quay vòng lại',
      word: 'turn around',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'puppy-turning-with-ball',
      cuePosition: rect(54, 43, 38, 35),
      cueTouchArea: rect(48, 36, 50, 48),
      teachVi: 'Chạm cún đang xoay người mang bóng về nhé.',
      teachEn: 'Tap the puppy turning around with the ball.',
      teachSuccessEn: 'Turn around means face the other way.',
      teachFailVi: 'Chạm chú cún đang đổi hướng nhé.',
      teachFailEn: 'Tap the puppy changing direction.',
      practice: {
        instructionVi: 'Chạm cún để bạn quay hẳn về phía bé nhé.',
        instructionEn: 'Tap the puppy so it turns all the way toward you.',
        successVi: 'Cún đã quay về phía bé.',
        successEn: 'The puppy turned around toward you.',
        failVi: 'Chạm chú cún có quả bóng đỏ nhé.',
        failEn: 'Tap the puppy with the red ball.',
        successStateChanges: [
          sceneStateChanges.show(heroId),
          sceneStateChanges.setVariant(heroId, 'turned'),
        ],
        effects: [lessonEffects.sound('yay')],
      },
    },
  ];
  const vocabulary = makeBeatVocabulary(sceneId, beats);

  return {
    id: sceneId,
    titleVi: 'Lăn và bắt bóng',
    titleEn: 'Roll and Catch',
    thumbnailEmoji: '🐕',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: heroId,
        assetSource: sceneImageSource(sceneId, 'puppy-waiting'),
        isInteractive: true,
        position: rect(64, 44, 30, 32),
        presentation: 'cutout',
        touchArea: rect(58, 36, 41, 46),
        variants: [
          objectVariant({
            id: 'running',
            assetSource: sceneImageSource(sceneId, 'puppy-running'),
            position: rect(49, 44, 39, 34),
          }),
          objectVariant({
            id: 'catching',
            assetSource: sceneImageSource(sceneId, 'puppy-catching-ball'),
            position: rect(51, 43, 38, 34),
          }),
          objectVariant({
            id: 'holding',
            assetSource: sceneImageSource(sceneId, 'puppy-holding-ball'),
            position: rect(55, 44, 35, 34),
          }),
          objectVariant({
            id: 'turned',
            assetSource: sceneImageSource(sceneId, 'puppy-turning-with-ball'),
            position: rect(54, 43, 38, 35),
          }),
        ],
      }),
      sceneObject({
        id: ballId,
        assetSource: sceneImageSource(sceneId, 'red-ball'),
        isInteractive: true,
        position: rect(10, 61, 18, 16),
        presentation: 'cutout',
        touchArea: rect(4, 54, 30, 29),
        variants: [
          objectVariant({
            id: 'rolled',
            assetSource: sceneImageSource(sceneId, 'red-ball'),
            position: rect(52, 62, 18, 16),
            touchArea: rect(46, 55, 30, 29),
          }),
        ],
      }),
      ...makeBeatObjects(sceneId, beats, vocabulary),
    ],
    dropZones: [
      {
        id: rollZoneId,
        position: rect(52, 62, 18, 16),
        touchArea: rect(43, 52, 36, 36),
      },
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        type: 'intro',
        instructionVi: 'Đặt bóng xuống sàn. Mình lăn nhẹ để cún chạy theo nhé.',
        instructionEn:
          'Put the ball on the floor. Roll it gently for the puppy.',
        successFeedbackVi: 'Cún đã sẵn sàng đuổi theo bóng.',
        successFeedbackEn: 'The puppy is ready to chase the ball.',
        targetObjectIds: [ballId, heroId],
      }),
      ...makeBeatSteps(sceneId, beats, vocabulary),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Cún đã bắt bóng và quay lại.',
      messageEn: 'The puppy caught the ball and turned back.',
    },
  };
}

function makeBringItBackScene(): Scene {
  const sceneId = 'bring-it-back';
  const heroId = `${sceneId}-hero`;
  const handId = `${sceneId}-hand`;
  const ballInHandId = `${sceneId}-ball-in-hand`;
  const looseBallId = `${sceneId}-loose-ball`;

  const beats: VocabularyBeat[] = [
    {
      key: 'fetch',
      meaningVi: 'chạy đi lấy và mang về',
      word: 'fetch',
      type: 'verb',
      cueObjectId: heroId,
      teachVi: 'Chạm chú cún đang cầm bóng ở xa nhé.',
      teachEn: 'Tap the puppy fetching the ball.',
      teachSuccessEn: 'Fetch means go get something and bring it back.',
      teachFailVi: 'Chạm chú cún có quả bóng đỏ nhé.',
      teachFailEn: 'Tap the puppy with the red ball.',
      practice: {
        instructionVi: 'Chạm cún để bạn bắt đầu mang bóng về nhé.',
        instructionEn: 'Tap the puppy so it starts bringing the ball back.',
        successVi: 'Cún đang chạy mang bóng về.',
        successEn: 'The puppy is bringing the ball back.',
        failVi: 'Chạm chú cún ở bên trái nhé.',
        failEn: 'Tap the puppy on the left.',
        targetObjectId: heroId,
        successStateChanges: [
          sceneStateChanges.setVariant(heroId, 'returning'),
        ],
      },
    },
    {
      key: 'bring',
      meaningVi: 'mang lại',
      word: 'bring',
      type: 'verb',
      cueObjectId: heroId,
      teachVi: 'Chạm chú cún đang mang bóng về nhé.',
      teachEn: 'Tap the puppy bringing the ball back.',
      teachSuccessEn: 'Bring means carry something toward someone.',
      teachFailVi: 'Chạm cún đang chạy cùng bóng đỏ nhé.',
      teachFailEn: 'Tap the puppy running with the red ball.',
      practice: {
        instructionVi: 'Chạm cún để bạn mang bóng tới gần bé nhé.',
        instructionEn: 'Tap the puppy so it brings the ball close to you.',
        successVi: 'Cún đã mang bóng tới gần.',
        successEn: 'The puppy brought the ball close.',
        failVi: 'Chạm chú cún đang mang bóng nhé.',
        failEn: 'Tap the puppy bringing the ball.',
        targetObjectId: heroId,
        successStateChanges: [sceneStateChanges.setVariant(heroId, 'near')],
        afterSuccessStateChanges: [sceneStateChanges.show(handId)],
      },
    },
    {
      key: 'give',
      meaningVi: 'đưa cho',
      word: 'give',
      type: 'verb',
      cueObjectId: handId,
      teachVi: 'Chạm bàn tay đang nhận quả bóng nhé.',
      teachEn: 'Tap the hand receiving the ball.',
      teachSuccessEn: 'Give means pass something to another person.',
      teachFailVi: 'Chạm bàn tay áo xanh có quả bóng nhé.',
      teachFailEn: 'Tap the green-sleeved hand with the ball.',
      practice: {
        instructionVi: 'Chạm bàn tay mở để cún đưa bóng cho bé nhé.',
        instructionEn: 'Tap the open hand so the puppy can give you the ball.',
        successVi: 'Cún đã đưa bóng cho bé.',
        successEn: 'The puppy gave you the ball.',
        failVi: 'Chạm bàn tay mở bên trái nhé.',
        failEn: 'Tap the open hand on the left.',
        targetObjectId: handId,
        successStateChanges: [
          sceneStateChanges.hide(handId),
          sceneStateChanges.show(ballInHandId),
          sceneStateChanges.setVariant(heroId, 'happy'),
        ],
        effects: [lessonEffects.sound('correct')],
      },
    },
    {
      key: 'hand',
      meaningVi: 'bàn tay',
      word: 'hand',
      tier: 'expanded',
      cueObjectId: ballInHandId,
      teachVi: 'Chạm bàn tay đang đỡ quả bóng nhé.',
      teachEn: 'Tap the hand holding the ball.',
      teachSuccessEn: 'This is a hand.',
      teachFailVi: 'Chạm bàn tay có tay áo xanh nhé.',
      teachFailEn: 'Tap the hand with the green sleeve.',
      practice: {
        instructionVi: 'Chạm lòng bàn tay để giữ bóng chắc nhé.',
        instructionEn: 'Tap the palm to hold the ball securely.',
        successVi: 'Bé đang giữ bóng bằng bàn tay.',
        successEn: 'You are holding the ball in your hand.',
        failVi: 'Chạm bàn tay đang có bóng nhé.',
        failEn: 'Tap the hand with the ball.',
        targetObjectId: ballInHandId,
      },
    },
    {
      key: 'again',
      meaningVi: 'lại một lần nữa',
      word: 'again',
      tier: 'expanded',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'red-ball',
      cuePosition: rect(43, 58, 19, 17),
      cueTouchArea: rect(37, 51, 31, 30),
      revealStateChanges: [sceneStateChanges.hide(ballInHandId)],
      teachVi: 'Chạm quả bóng để chơi thêm một lượt nhé.',
      teachEn: 'Tap the ball to play again.',
      teachSuccessEn: 'Again means one more time.',
      teachFailVi: 'Chạm quả bóng đỏ ở giữa nhé.',
      teachFailEn: 'Tap the red ball in the middle.',
      practice: {
        instructionVi: 'Chạm bóng để bắt đầu thêm một lượt nhé.',
        instructionEn: 'Tap the ball to begin one more turn.',
        successVi: 'Mình sẽ chơi lại một lượt.',
        successEn: 'We will play one more time.',
        failVi: 'Chạm quả bóng đỏ nhé.',
        failEn: 'Tap the red ball.',
        successStateChanges: [
          sceneStateChanges.show(looseBallId),
          sceneStateChanges.setVariant(heroId, 'happy'),
        ],
      },
    },
    {
      key: 'happy',
      meaningVi: 'vui vẻ',
      word: 'happy',
      tier: 'expanded',
      type: 'adjective',
      speechPractice: 'optional',
      cueObjectId: heroId,
      teachVi: 'Chạm chú cún đang cười vui nhé.',
      teachEn: 'Tap the happy puppy.',
      teachSuccessEn: 'Happy means feeling joyful.',
      teachFailVi: 'Chạm chú cún đang nhắm mắt cười nhé.',
      teachFailEn: 'Tap the smiling puppy.',
      practice: {
        instructionVi: 'Chạm cún để cùng vui vì đã chơi ngoan nhé.',
        instructionEn: 'Tap the puppy to celebrate your kind play.',
        successVi: 'Cún rất vui khi chơi nhẹ nhàng với bé.',
        successEn: 'The puppy is happy to play gently with you.',
        failVi: 'Chạm chú cún vui vẻ nhé.',
        failEn: 'Tap the happy puppy.',
        targetObjectId: heroId,
        effects: [lessonEffects.sound('yay')],
        successStateChanges: [sceneStateChanges.setVariant(heroId, 'happy')],
      },
    },
    {
      key: 'your-turn',
      meaningVi: 'đến lượt bạn',
      word: 'your turn',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'your-turn-action',
      cuePosition: rect(9, 49, 34, 27),
      cueTouchArea: rect(3, 42, 46, 40),
      revealStateChanges: [sceneStateChanges.hide(looseBallId)],
      teachVi: 'Chạm bàn tay đang đưa bóng mời lượt mới nhé.',
      teachEn: 'Tap the hand offering the ball for your turn.',
      teachSuccessEn: 'Your turn means it is time for you to act.',
      teachFailVi: 'Chạm bàn tay áo xanh đang đưa bóng nhé.',
      teachFailEn: 'Tap the hand offering the ball.',
      practice: {
        instructionVi: 'Chạm quả bóng trong tay để nhận lượt của bé nhé.',
        instructionEn: 'Tap the ball in the hand to take your turn.',
        successVi: 'Bây giờ đến lượt bé.',
        successEn: 'Now it is your turn.',
        failVi: 'Chạm quả bóng trong bàn tay nhé.',
        failEn: 'Tap the ball in the hand.',
      },
    },
    {
      key: 'roll-the-ball',
      meaningVi: 'lăn quả bóng',
      word: 'roll the ball',
      tier: 'challenge',
      type: 'phrase',
      cueAsset: 'roll-the-ball-action',
      cuePosition: rect(37, 52, 35, 28),
      cueTouchArea: rect(31, 45, 47, 41),
      teachVi: 'Chạm bàn tay đang lăn quả bóng nhé.',
      teachEn: 'Tap the hand rolling the ball.',
      teachSuccessEn:
        'Roll the ball means move the ball gently along the floor.',
      teachFailVi: 'Chạm bàn tay áo xanh phía trên bóng đỏ nhé.',
      teachFailEn: 'Tap the hand above the red ball.',
      practice: {
        instructionVi: 'Chạm hình lăn bóng để bắt đầu lượt mới nhé.',
        instructionEn: 'Tap the rolling picture to start the next turn.',
        successVi: 'Bé lăn bóng nhẹ cho cún.',
        successEn: 'You gently roll the ball for the puppy.',
        failVi: 'Chạm bàn tay đang lăn bóng nhé.',
        failEn: 'Tap the hand rolling the ball.',
      },
    },
    {
      key: 'lets-play',
      meaningVi: 'mình cùng chơi nhé',
      word: "let's play",
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueObjectId: heroId,
      teachVi: 'Chạm chú cún vui vẻ đang chờ lượt mới nhé.',
      teachEn: 'Tap the happy puppy ready for another turn.',
      teachSuccessEn:
        "Let's play means we are inviting someone to play together.",
      teachFailVi: 'Chạm chú cún đang cười nhé.',
      teachFailEn: 'Tap the smiling puppy.',
      practice: {
        instructionVi: 'Chạm cún để mời bạn cùng chơi tiếp nhé.',
        instructionEn: 'Tap the puppy to invite it to keep playing.',
        successVi: 'Bé và cún đã sẵn sàng chơi tiếp.',
        successEn: 'You and the puppy are ready to play again.',
        failVi: 'Chạm chú cún bên phải nhé.',
        failEn: 'Tap the puppy on the right.',
        targetObjectId: heroId,
        effects: [lessonEffects.sound('complete')],
      },
    },
  ];
  const vocabulary = makeBeatVocabulary(sceneId, beats);

  return {
    id: sceneId,
    titleVi: 'Cún mang bóng về',
    titleEn: 'Bring It Back',
    thumbnailEmoji: '🐾',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: heroId,
        assetSource: sceneImageSource(sceneId, 'puppy-far-with-ball'),
        isInteractive: true,
        position: rect(8, 45, 32, 31),
        presentation: 'cutout',
        touchArea: rect(2, 38, 44, 44),
        variants: [
          objectVariant({
            id: 'far',
            assetSource: sceneImageSource(sceneId, 'puppy-far-with-ball'),
            position: rect(8, 45, 32, 31),
          }),
          objectVariant({
            id: 'returning',
            assetSource: sceneImageSource(sceneId, 'puppy-returning-ball'),
            position: rect(33, 43, 38, 35),
          }),
          objectVariant({
            id: 'near',
            assetSource: sceneImageSource(sceneId, 'puppy-near-with-ball'),
            position: rect(62, 43, 32, 34),
          }),
          objectVariant({
            id: 'happy',
            assetSource: sceneImageSource(sceneId, 'puppy-happy'),
            position: rect(65, 44, 30, 33),
          }),
        ],
      }),
      sceneObject({
        id: handId,
        assetSource: sceneImageSource(sceneId, 'open-hand'),
        initialVisibility: 'hidden',
        isInteractive: true,
        position: rect(8, 56, 31, 22),
        presentation: 'cutout',
        touchArea: rect(2, 49, 43, 35),
      }),
      sceneObject({
        id: ballInHandId,
        assetSource: sceneImageSource(sceneId, 'ball-in-hand'),
        initialVisibility: 'hidden',
        isInteractive: true,
        position: rect(8, 53, 34, 25),
        presentation: 'cutout',
        touchArea: rect(2, 46, 46, 38),
      }),
      sceneObject({
        id: looseBallId,
        assetSource: sceneImageSource(sceneId, 'red-ball'),
        initialVisibility: 'hidden',
        isInteractive: true,
        learningScope: expandedScope,
        position: rect(44, 62, 18, 16),
        presentation: 'cutout',
        touchArea: rect(38, 55, 30, 29),
      }),
      ...makeBeatObjects(sceneId, beats, vocabulary),
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        type: 'intro',
        instructionVi: 'Cún đã bắt được bóng. Gọi bạn mang bóng về cho bé nhé.',
        instructionEn:
          'The puppy caught the ball. Help it bring the ball back to you.',
        successFeedbackVi: 'Cún đang đứng ở xa cùng quả bóng.',
        successFeedbackEn: 'The puppy is far away with the ball.',
        targetObjectIds: [heroId],
      }),
      ...makeBeatSteps(sceneId, beats, vocabulary),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Bé đã chơi bắt bóng thật nhẹ nhàng cùng cún.',
      messageEn: 'You played a gentle game of fetch with the puppy.',
    },
  };
}

export const playWithThePuppyLesson: Lesson = {
  id: lessonId,
  themeId: 'nhung-nguoi-ban-dong-vat',
  titleVi: 'Chơi cùng cún',
  titleEn: 'Play with the Puppy',
  descriptionVi:
    'Bé chọn bóng mềm, lăn nhẹ cho cún và cùng bạn chơi trò mang bóng về.',
  descriptionEn:
    'Choose a soft ball, roll it gently, and play a safe game of fetch.',
  thumbnailEmoji: '🎾',
  ageRange: { min: 3, max: 8, label: '3-8 tuổi · Làm quen' },
  scenes: [
    makeChooseTheBallScene(),
    makeRollAndCatchScene(),
    makeBringItBackScene(),
  ],
  reviewGame: {
    id: `${lessonId}-review`,
    type: 'random',
    titleVi: 'Chơi bóng cùng cún',
    config: {
      vocabularyIds: [
        'vocab-play-with-the-puppy-choose-the-ball-play',
        'vocab-play-with-the-puppy-choose-the-ball-ball',
        'vocab-play-with-the-puppy-roll-and-catch-roll',
        'vocab-play-with-the-puppy-roll-and-catch-catch',
        'vocab-play-with-the-puppy-roll-and-catch-hold',
        'vocab-play-with-the-puppy-bring-it-back-your-turn',
      ],
    },
  },
  metadata: {
    parentTipVi:
      'Ba mẹ cho bé dùng bóng mềm, lăn bóng nhẹ trên sàn và luôn có người lớn quan sát. Không kéo, ôm chặt, ném bóng vào hoặc giành đồ chơi khỏi miệng thú cưng; rửa tay sau khi chơi.',
  },
};
