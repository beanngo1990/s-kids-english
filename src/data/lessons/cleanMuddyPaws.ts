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

const lessonId = 'clean-muddy-paws';
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
  effects?: SceneEffect[];
  failEn: string;
  failVi: string;
  instructionEn: string;
  instructionVi: string;
  kind?: 'find' | 'tap';
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
  return text.replace(/^(?:Find|Tap)\s+/u, 'Look for ');
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
      beat.practice.kind === 'find'
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

const leftCue = rect(7, 28, 29, 27);
const leftCueTouch = rect(1, 21, 41, 41);

function makeNoticeTheMuddyPawsScene(): Scene {
  const sceneId = 'notice-the-muddy-paws';
  const heroId = `${sceneId}-hero`;
  const mudId = `${sceneId}-mud`;
  const pawprintsId = `${sceneId}-pawprints`;
  const doormatId = `${sceneId}-doormat`;

  const beats: VocabularyBeat[] = [
    {
      key: 'paws',
      meaningVi: 'những bàn chân của cún',
      word: 'paws',
      cueAsset: 'paws-closeup',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm hai bàn chân của cún nhé.',
      teachEn: 'Tap the puppy paws.',
      teachSuccessEn: 'These are the puppy paws.',
      teachFailVi: 'Chạm hai bàn chân có đệm hồng nhé.',
      teachFailEn: 'Tap the two paws with pink pads.',
      practice: {
        instructionVi: 'Chạm cún để nhìn bàn chân nhé.',
        instructionEn: 'Tap the puppy and look at its paws.',
        successVi: 'Bàn chân cún đang dính bùn.',
        successEn: 'The puppy paws have mud on them.',
        failVi: 'Chạm chú cún trên thảm nhé.',
        failEn: 'Tap the puppy on the mat.',
        targetObjectId: heroId,
      },
    },
    {
      key: 'mud',
      meaningVi: 'bùn',
      word: 'mud',
      cueObjectId: mudId,
      teachVi: 'Chạm vũng bùn màu nâu nhé.',
      teachEn: 'Tap the brown mud puddle.',
      teachSuccessEn: 'This is mud.',
      teachFailVi: 'Chạm vũng màu nâu bên trái nhé.',
      teachFailEn: 'Tap the brown puddle on the left.',
      practice: {
        instructionVi: 'Chạm bùn để tìm dấu chân nhé.',
        instructionEn: 'Tap the mud to find the pawprints.',
        successVi: 'Bùn đã để lại các dấu chân nhỏ.',
        successEn: 'The mud left small pawprints.',
        failVi: 'Chạm vũng bùn màu nâu nhé.',
        failEn: 'Tap the brown mud puddle.',
        targetObjectId: mudId,
        successStateChanges: [sceneStateChanges.show(pawprintsId)],
      },
    },
    {
      key: 'dirty',
      meaningVi: 'bẩn',
      word: 'dirty',
      type: 'adjective',
      cueAsset: 'dirty-paw-closeup',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm bàn chân đang dính bùn nhé.',
      teachEn: 'Tap the dirty muddy paw.',
      teachSuccessEn: 'Dirty means not clean.',
      teachFailVi: 'Chạm bàn chân có nhiều bùn nhé.',
      teachFailEn: 'Tap the paw covered with mud.',
      practice: {
        instructionVi: 'Chạm cún để bạn đứng chờ nhé.',
        instructionEn: 'Tap the puppy so it waits.',
        successVi: 'Cún đứng yên trên thảm để chờ giúp đỡ.',
        successEn: 'The puppy waits on the mat for help.',
        failVi: 'Chạm chú cún có chân bẩn nhé.',
        failEn: 'Tap the puppy with dirty paws.',
        targetObjectId: heroId,
        successStateChanges: [sceneStateChanges.setVariant(heroId, 'waiting')],
      },
    },
    {
      key: 'pawprints',
      meaningVi: 'những dấu chân',
      word: 'pawprints',
      tier: 'expanded',
      cueObjectId: pawprintsId,
      revealStateChanges: [sceneStateChanges.show(pawprintsId)],
      teachVi: 'Chạm các dấu chân nhỏ trên sàn nhé.',
      teachEn: 'Tap the small pawprints on the floor.',
      teachSuccessEn: 'These are muddy pawprints.',
      teachFailVi: 'Chạm hàng dấu chân màu nâu nhé.',
      teachFailEn: 'Tap the row of brown pawprints.',
      practice: {
        instructionVi: 'Chạm dấu chân rồi nhìn về phía cún nhé.',
        instructionEn: 'Tap the pawprints and look toward the puppy.',
        successVi: 'Dấu chân dẫn tới chú cún đang chờ.',
        successEn: 'The pawprints lead to the waiting puppy.',
        failVi: 'Chạm các dấu chân bùn nhé.',
        failEn: 'Tap the muddy pawprints.',
        targetObjectId: pawprintsId,
        afterSuccessStateChanges: [sceneStateChanges.hide(pawprintsId)],
      },
    },
    {
      key: 'doormat',
      meaningVi: 'tấm thảm chùi chân',
      word: 'doormat',
      tier: 'expanded',
      speechPractice: 'optional',
      cueObjectId: doormatId,
      revealStateChanges: [sceneStateChanges.show(doormatId)],
      teachVi: 'Chạm tấm thảm xanh nhé.',
      teachEn: 'Tap the green doormat.',
      teachSuccessEn: 'This is a doormat.',
      teachFailVi: 'Chạm tấm thảm hình bầu dục nhé.',
      teachFailEn: 'Tap the oval green mat.',
      practice: {
        instructionVi: 'Chạm thảm để giữ bùn ở một chỗ nhé.',
        instructionEn: 'Tap the doormat to keep the mud in one place.',
        successVi: 'Cún sẽ chờ trên tấm thảm.',
        successEn: 'The puppy will wait on the doormat.',
        failVi: 'Chạm tấm thảm xanh nhé.',
        failEn: 'Tap the green doormat.',
        targetObjectId: doormatId,
        afterSuccessStateChanges: [sceneStateChanges.hide(doormatId)],
      },
    },
    {
      key: 'wait',
      meaningVi: 'chờ',
      word: 'wait',
      tier: 'expanded',
      type: 'verb',
      speechPractice: 'optional',
      cueAsset: 'wait-on-mat-action',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      revealStateChanges: [sceneStateChanges.hide(heroId)],
      teachVi: 'Chạm cún đang ngồi chờ nhé.',
      teachEn: 'Tap the puppy waiting on the mat.',
      teachSuccessEn: 'Wait means stay until it is time to move.',
      teachFailVi: 'Chạm cún ngồi yên trên thảm nhé.',
      teachFailEn: 'Tap the puppy sitting still on the mat.',
      practice: {
        instructionVi: 'Chạm cún để bạn chờ người lớn nhé.',
        instructionEn: 'Tap the puppy so it waits for an adult.',
        successVi: 'Cún đang chờ rất ngoan.',
        successEn: 'The puppy is waiting calmly.',
        failVi: 'Chạm chú cún đang ngồi nhé.',
        failEn: 'Tap the sitting puppy.',
        successStateChanges: [
          sceneStateChanges.show(heroId),
          sceneStateChanges.setVariant(heroId, 'waiting'),
        ],
      },
    },
    {
      key: 'muddy-paws',
      meaningVi: 'bàn chân dính bùn',
      word: 'muddy paws',
      tier: 'challenge',
      type: 'phrase',
      cueAsset: 'muddy-paws-action',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm đôi chân dính bùn nhé.',
      teachEn: 'Tap the muddy paws.',
      teachSuccessEn: 'Muddy paws are paws covered with mud.',
      teachFailVi: 'Chạm hai chân phủ bùn màu nâu nhé.',
      teachFailEn: 'Tap the two paws covered in brown mud.',
      practice: {
        instructionVi: 'Chạm cún có bàn chân dính bùn nhé.',
        instructionEn: 'Tap the puppy with muddy paws.',
        successVi: 'Đúng rồi, cún cần được rửa chân.',
        successEn: 'Right, the puppy needs its paws washed.',
        failVi: 'Chạm chú cún trên thảm nhé.',
        failEn: 'Tap the puppy on the mat.',
        targetObjectId: heroId,
      },
    },
    {
      key: 'stop-here',
      meaningVi: 'dừng ở đây',
      word: 'stop here',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'stop-hand',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm bàn tay báo dừng nhé.',
      teachEn: 'Tap the hand saying stop here.',
      teachSuccessEn: 'Stop here means do not move past this place.',
      teachFailVi: 'Chạm bàn tay đang mở nhé.',
      teachFailEn: 'Tap the open palm.',
      practice: {
        instructionVi: 'Chạm bàn tay để cún tiếp tục chờ nhé.',
        instructionEn: 'Tap the hand so the puppy keeps waiting.',
        successVi: 'Cún dừng trên thảm và không làm bẩn thêm.',
        successEn: 'The puppy stops on the mat.',
        failVi: 'Chạm bàn tay báo dừng nhé.',
        failEn: 'Tap the stop hand.',
      },
    },
    {
      key: 'ask-an-adult',
      meaningVi: 'nhờ người lớn',
      word: 'ask an adult',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'adult-help',
      cuePosition: rect(5, 27, 37, 29),
      cueTouchArea: rect(0, 20, 48, 42),
      teachVi: 'Chạm bàn tay người lớn đang giúp nhé.',
      teachEn: 'Tap the adult hand offering help.',
      teachSuccessEn: 'Ask an adult means get help from a grown-up.',
      teachFailVi: 'Chạm bàn tay cạnh chú cún nhé.',
      teachFailEn: 'Tap the hand beside the puppy.',
      practice: {
        instructionVi: 'Chạm bàn tay để bắt đầu giúp cún nhé.',
        instructionEn: 'Tap the adult hand to start helping the puppy.',
        successVi: 'Người lớn đã tới giúp rửa chân cho cún.',
        successEn: 'An adult is ready to help wash the puppy paws.',
        failVi: 'Chạm bàn tay người lớn nhé.',
        failEn: 'Tap the adult hand.',
        effects: [lessonEffects.sound('correct')],
      },
    },
  ];
  const vocabulary = makeBeatVocabulary(sceneId, beats);

  return {
    id: sceneId,
    titleVi: 'Nhìn chân dính bùn',
    titleEn: 'Notice the Muddy Paws',
    thumbnailEmoji: '🐾',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: heroId,
        assetSource: sceneImageSource(sceneId, 'puppy-muddy-on-mat'),
        isInteractive: true,
        position: rect(55, 43, 39, 38),
        presentation: 'cutout',
        touchArea: rect(48, 36, 51, 49),
        variants: [
          objectVariant({
            id: 'waiting',
            assetSource: sceneImageSource(sceneId, 'puppy-waiting-on-mat'),
          }),
        ],
      }),
      sceneObject({
        id: mudId,
        assetSource: sceneImageSource(sceneId, 'mud-puddle'),
        isInteractive: true,
        position: rect(8, 64, 31, 16),
        presentation: 'cutout',
        touchArea: rect(2, 57, 43, 30),
      }),
      sceneObject({
        id: pawprintsId,
        assetSource: sceneImageSource(sceneId, 'muddy-pawprints'),
        initialVisibility: 'hidden',
        isInteractive: true,
        position: rect(32, 66, 29, 15),
        presentation: 'cutout',
        touchArea: rect(26, 59, 41, 29),
      }),
      sceneObject({
        id: doormatId,
        assetSource: sceneImageSource(sceneId, 'doormat'),
        initialVisibility: 'hidden',
        isInteractive: true,
        learningScope: expandedScope,
        position: rect(8, 62, 32, 20),
        presentation: 'cutout',
        touchArea: rect(2, 55, 44, 34),
      }),
      ...makeBeatObjects(sceneId, beats, vocabulary),
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        type: 'intro',
        instructionVi: 'Cún vừa đi qua bùn. Mình nhìn bàn chân của bạn nhé.',
        instructionEn:
          'The puppy walked through mud. Look at your friend’s paws.',
        successFeedbackVi: 'Cún đang đứng trên thảm và chờ bé giúp.',
        successFeedbackEn: 'The puppy is waiting on the mat for help.',
        targetObjectIds: [heroId, mudId],
      }),
      ...makeBeatSteps(sceneId, beats, vocabulary),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Cún đã đứng chờ để người lớn giúp rửa chân.',
      messageEn: 'The puppy waited for an adult to help wash its paws.',
    },
  };
}

function makeWashThePawsScene(): Scene {
  const sceneId = 'wash-the-paws';
  const heroId = `${sceneId}-hero`;
  const waterId = `${sceneId}-water`;
  const basinId = `${sceneId}-basin`;

  const beats: VocabularyBeat[] = [
    {
      key: 'water',
      meaningVi: 'nước',
      word: 'water',
      cueObjectId: waterId,
      teachVi: 'Chạm bình nước trong nhé.',
      teachEn: 'Tap the pitcher of clean water.',
      teachSuccessEn: 'This is water.',
      teachFailVi: 'Chạm bình nước bên trái nhé.',
      teachFailEn: 'Tap the clear pitcher on the left.',
      practice: {
        instructionVi: 'Chạm chậu để người lớn cho nước vào nhé.',
        instructionEn: 'Tap the basin so an adult can add water.',
        successVi: 'Chậu đã có nước sạch để rửa chân.',
        successEn: 'The basin has clean water for washing.',
        failVi: 'Chạm chiếc chậu xanh nhé.',
        failEn: 'Tap the blue basin.',
        targetObjectId: basinId,
        successStateChanges: [sceneStateChanges.setVariant(basinId, 'filled')],
      },
    },
    {
      key: 'wash',
      meaningVi: 'rửa',
      word: 'wash',
      type: 'verb',
      cueAsset: 'wash-one-paw-action',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      revealStateChanges: [
        sceneStateChanges.hide(heroId),
        sceneStateChanges.hide(basinId),
      ],
      teachVi: 'Chạm bàn tay đang rửa chân cún nhé.',
      teachEn: 'Tap the hand washing one puppy paw.',
      teachSuccessEn: 'Wash means clean with water.',
      teachFailVi: 'Chạm bàn tay và bàn chân cạnh chậu nhé.',
      teachFailEn: 'Tap the hand and paw by the basin.',
      practice: {
        instructionVi: 'Chạm cún để người lớn rửa chân nhé.',
        instructionEn: 'Tap the puppy so an adult washes its paws.',
        successVi: 'Người lớn đang rửa nhẹ từng bàn chân.',
        successEn: 'An adult is gently washing each paw.',
        failVi: 'Chạm chú cún cạnh chậu nhé.',
        failEn: 'Tap the puppy beside the basin.',
        successStateChanges: [
          sceneStateChanges.show(heroId),
          sceneStateChanges.setVariant(heroId, 'washing'),
        ],
      },
    },
    {
      key: 'clean',
      meaningVi: 'sạch',
      word: 'clean',
      type: 'adjective',
      cueAsset: 'clean-wet-paw',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm bàn chân sạch có giọt nước nhé.',
      teachEn: 'Tap the clean wet paw.',
      teachSuccessEn: 'Clean means the dirt is gone.',
      teachFailVi: 'Chạm bàn chân trắng có giọt nước nhé.',
      teachFailEn: 'Tap the white paw with water drops.',
      practice: {
        instructionVi: 'Chạm cún để nhìn hai chân sạch nhé.',
        instructionEn: 'Tap the puppy to see both clean paws.',
        successVi: 'Bùn đã trôi hết. Hai bàn chân đã sạch.',
        successEn: 'The mud is gone. Both paws are clean.',
        failVi: 'Chạm chú cún cạnh chậu nhé.',
        failEn: 'Tap the puppy beside the basin.',
        targetObjectId: heroId,
        successStateChanges: [
          sceneStateChanges.setVariant(heroId, 'clean-wet'),
          sceneStateChanges.show(basinId),
          sceneStateChanges.setVariant(basinId, 'muddy'),
        ],
      },
    },
    {
      key: 'basin',
      meaningVi: 'chiếc chậu nhỏ',
      word: 'basin',
      tier: 'expanded',
      cueObjectId: basinId,
      teachVi: 'Chạm chiếc chậu nhỏ nhé.',
      teachEn: 'Tap the small basin.',
      teachSuccessEn: 'This is a basin.',
      teachFailVi: 'Chạm chiếc chậu xanh dưới sàn nhé.',
      teachFailEn: 'Tap the blue basin on the floor.',
      practice: {
        instructionVi: 'Chạm chậu để xem nước sau khi rửa nhé.',
        instructionEn: 'Tap the basin to check the water after washing.',
        successVi: 'Nước trong chậu đã đổi màu vì bùn.',
        successEn: 'The water changed color because of the mud.',
        failVi: 'Chạm chiếc chậu xanh nhé.',
        failEn: 'Tap the blue basin.',
        targetObjectId: basinId,
      },
    },
    {
      key: 'muddy-water',
      meaningVi: 'nước có bùn',
      word: 'muddy water',
      tier: 'expanded',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'muddy-water',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm chậu nước có bùn nhé.',
      teachEn: 'Tap the basin of muddy water.',
      teachSuccessEn: 'Muddy water is water mixed with mud.',
      teachFailVi: 'Chạm chậu có nước màu nâu nhé.',
      teachFailEn: 'Tap the basin with brown water.',
      practice: {
        instructionVi: 'Chạm chậu nước bẩn để chuẩn bị cất đi nhé.',
        instructionEn: 'Tap the muddy water before an adult takes it away.',
        successVi: 'Nước có bùn sẽ không dùng lại.',
        successEn: 'The muddy water will not be used again.',
        failVi: 'Chạm chậu nước màu nâu nhé.',
        failEn: 'Tap the basin of brown water.',
      },
    },
    {
      key: 'finished-washing',
      meaningVi: 'rửa xong rồi',
      word: 'finished washing',
      tier: 'expanded',
      type: 'phrase',
      speechPractice: 'optional',
      cueObjectId: heroId,
      teachVi: 'Chạm cún có hai chân sạch nhé.',
      teachEn: 'Tap the puppy that has finished washing.',
      teachSuccessEn: 'Finished washing means the washing is complete.',
      teachFailVi: 'Chạm chú cún sạch cạnh chậu nhé.',
      teachFailEn: 'Tap the clean puppy beside the basin.',
      practice: {
        instructionVi: 'Chạm cún để chuyển sang lau khô nhé.',
        instructionEn: 'Tap the puppy to move on to drying.',
        successVi: 'Rửa xong rồi. Bây giờ mình lau khô.',
        successEn: 'Washing is finished. Now it is time to dry.',
        failVi: 'Chạm chú cún có chân sạch nhé.',
        failEn: 'Tap the puppy with clean paws.',
        targetObjectId: heroId,
      },
    },
    {
      key: 'check-the-paws',
      meaningVi: 'kiểm tra bàn chân',
      word: 'check the paws',
      tier: 'challenge',
      type: 'phrase',
      cueAsset: 'clean-wet-paws',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm hai bàn chân sạch để kiểm tra nhé.',
      teachEn: 'Tap the clean paws to check them.',
      teachSuccessEn: 'Check the paws means look closely at the paws.',
      teachFailVi: 'Chạm hai bàn chân trắng có giọt nước nhé.',
      teachFailEn: 'Tap the two white paws with water drops.',
      practice: {
        instructionVi: 'Chạm cún để kiểm tra hết bùn chưa nhé.',
        instructionEn: 'Tap the puppy to check that the mud is gone.',
        successVi: 'Hai bàn chân không còn bùn nữa.',
        successEn: 'There is no mud left on the paws.',
        failVi: 'Chạm chú cún sạch nhé.',
        failEn: 'Tap the clean puppy.',
        targetObjectId: heroId,
      },
    },
    {
      key: 'clean-paws',
      meaningVi: 'những bàn chân sạch',
      word: 'clean paws',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'clean-wet-paws',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm hai bàn chân sạch nhé.',
      teachEn: 'Tap the clean paws.',
      teachSuccessEn: 'Clean paws have no dirt or mud on them.',
      teachFailVi: 'Chạm hai bàn chân trắng nhé.',
      teachFailEn: 'Tap the two white paws.',
      practice: {
        instructionVi: 'Chạm hai chân sạch rồi nhìn chậu nước nhé.',
        instructionEn: 'Tap the clean paws, then look at the basin.',
        successVi: 'Bùn ở chân đã chuyển vào nước trong chậu.',
        successEn: 'The mud from the paws is now in the basin.',
        failVi: 'Chạm hai bàn chân sạch nhé.',
        failEn: 'Tap the clean paws.',
      },
    },
    {
      key: 'empty-the-tub',
      meaningVi: 'đổ nước trong chậu đi',
      word: 'empty the tub',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'adult-carrying-basin',
      cuePosition: rect(5, 27, 37, 30),
      cueTouchArea: rect(0, 20, 49, 43),
      teachVi: 'Chạm tay người lớn đang cất chậu nhé.',
      teachEn: 'Tap the adult hands carrying the basin.',
      teachSuccessEn: 'Empty the tub means remove the used water.',
      teachFailVi: 'Chạm hai tay đang cầm chậu nhé.',
      teachFailEn: 'Tap the hands holding the basin.',
      practice: {
        instructionVi: 'Chạm hình để người lớn mang chậu đi nhé.',
        instructionEn: 'Tap the picture so an adult takes the basin away.',
        successVi: 'Người lớn đã mang nước bẩn đi đổ an toàn.',
        successEn: 'An adult safely took the used water away.',
        failVi: 'Chạm hai tay đang cầm chậu nhé.',
        failEn: 'Tap the hands carrying the basin.',
        successStateChanges: [sceneStateChanges.setVariant(basinId, 'empty')],
        effects: [lessonEffects.sound('correct')],
      },
    },
  ];
  const vocabulary = makeBeatVocabulary(sceneId, beats);

  return {
    id: sceneId,
    titleVi: 'Rửa chân nhẹ nhàng',
    titleEn: 'Wash the Paws Gently',
    thumbnailEmoji: '💧',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: heroId,
        assetSource: sceneImageSource(sceneId, 'puppy-muddy-basin'),
        isInteractive: true,
        position: rect(54, 43, 40, 39),
        presentation: 'cutout',
        touchArea: rect(47, 36, 52, 50),
        variants: [
          objectVariant({
            id: 'washing',
            assetSource: sceneImageSource(sceneId, 'puppy-paw-washing'),
            position: rect(51, 42, 44, 41),
          }),
          objectVariant({
            id: 'clean-wet',
            assetSource: sceneImageSource(sceneId, 'puppy-clean-wet'),
          }),
        ],
      }),
      sceneObject({
        id: waterId,
        assetSource: sceneImageSource(sceneId, 'clean-water'),
        isInteractive: true,
        position: rect(8, 54, 24, 27),
        presentation: 'cutout',
        touchArea: rect(2, 47, 36, 40),
      }),
      sceneObject({
        id: basinId,
        assetSource: sceneImageSource(sceneId, 'basin-empty'),
        isInteractive: true,
        position: rect(35, 67, 31, 16),
        presentation: 'cutout',
        touchArea: rect(28, 60, 45, 30),
        variants: [
          objectVariant({
            id: 'filled',
            assetSource: sceneImageSource(sceneId, 'basin-filled'),
          }),
          objectVariant({
            id: 'muddy',
            assetSource: sceneImageSource(sceneId, 'muddy-water'),
          }),
          objectVariant({
            id: 'empty',
            assetSource: sceneImageSource(sceneId, 'basin-empty'),
          }),
        ],
      }),
      ...makeBeatObjects(sceneId, beats, vocabulary),
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        type: 'intro',
        instructionVi: 'Người lớn đã chuẩn bị chậu. Mình rửa chân cún nhé.',
        instructionEn: 'An adult prepared a basin. Let’s wash the puppy paws.',
        successFeedbackVi: 'Cún đang đứng yên cạnh chậu nước.',
        successFeedbackEn: 'The puppy is waiting calmly beside the basin.',
        targetObjectIds: [heroId, waterId, basinId],
      }),
      ...makeBeatSteps(sceneId, beats, vocabulary),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Bùn đã trôi hết và hai bàn chân đã sạch.',
      messageEn: 'The mud is gone and both paws are clean.',
    },
  };
}

function makeDryThePawsScene(): Scene {
  const sceneId = 'dry-the-paws';
  const heroId = `${sceneId}-hero`;
  const towelId = `${sceneId}-towel`;

  const beats: VocabularyBeat[] = [
    {
      key: 'towel',
      meaningVi: 'chiếc khăn',
      word: 'towel',
      cueObjectId: towelId,
      teachVi: 'Chạm chiếc khăn vàng nhé.',
      teachEn: 'Tap the yellow towel.',
      teachSuccessEn: 'This is a towel.',
      teachFailVi: 'Chạm chiếc khăn gấp bên trái nhé.',
      teachFailEn: 'Tap the folded towel on the left.',
      practice: {
        instructionVi: 'Chạm cún để đặt khăn gần bàn chân nhé.',
        instructionEn: 'Tap the puppy to bring the towel near its paws.',
        successVi: 'Chiếc khăn đã sẵn sàng lau chân.',
        successEn: 'The towel is ready to dry the paws.',
        failVi: 'Chạm chú cún có chân ướt nhé.',
        failEn: 'Tap the puppy with wet paws.',
        targetObjectId: heroId,
        successStateChanges: [
          sceneStateChanges.setVariant(heroId, 'drying'),
          sceneStateChanges.hide(towelId),
        ],
      },
    },
    {
      key: 'wipe',
      meaningVi: 'lau',
      word: 'wipe',
      type: 'verb',
      cueAsset: 'wipe-wet-paw',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm khăn đang lau bàn chân nhé.',
      teachEn: 'Tap the towel wiping the wet paw.',
      teachSuccessEn:
        'Wipe means move a cloth over something to clean or dry it.',
      teachFailVi: 'Chạm bàn tay cầm khăn vàng nhé.',
      teachFailEn: 'Tap the hand holding the yellow towel.',
      practice: {
        instructionVi: 'Chạm cún để lau chân còn ướt nhé.',
        instructionEn: 'Tap the puppy to wipe its wet paws.',
        successVi: 'Người lớn đang lau nhẹ các giọt nước.',
        successEn: 'An adult is gently wiping away the water.',
        failVi: 'Chạm chú cún đang được lau chân nhé.',
        failEn: 'Tap the puppy having its paws wiped.',
        targetObjectId: heroId,
      },
    },
    {
      key: 'dry',
      meaningVi: 'khô',
      word: 'dry',
      type: 'adjective',
      cueAsset: 'dry-paw',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm bàn chân sạch và khô nhé.',
      teachEn: 'Tap the clean dry paw.',
      teachSuccessEn: 'Dry means not wet.',
      teachFailVi: 'Chạm bàn chân trắng có tia sáng nhé.',
      teachFailEn: 'Tap the white paw with sparkles.',
      practice: {
        instructionVi: 'Chạm cún để xem hai chân đã khô nhé.',
        instructionEn: 'Tap the puppy to see both dry paws.',
        successVi: 'Hai bàn chân đã sạch và khô.',
        successEn: 'Both paws are clean and dry.',
        failVi: 'Chạm chú cún trên thảm nhé.',
        failEn: 'Tap the puppy on the mat.',
        targetObjectId: heroId,
        successStateChanges: [sceneStateChanges.setVariant(heroId, 'dry')],
      },
    },
    {
      key: 'fluffy-towel',
      meaningVi: 'chiếc khăn bông xốp',
      word: 'fluffy towel',
      tier: 'expanded',
      type: 'phrase',
      cueObjectId: towelId,
      revealStateChanges: [
        sceneStateChanges.show(towelId),
        sceneStateChanges.setVariant(towelId, 'soft'),
      ],
      teachVi: 'Chạm chiếc khăn bông xốp nhé.',
      teachEn: 'Tap the fluffy towel.',
      teachSuccessEn: 'A fluffy towel is soft, thick, and gentle to touch.',
      teachFailVi: 'Chạm chiếc khăn vàng xốp nhé.',
      teachFailEn: 'Tap the fluffy yellow towel.',
      practice: {
        instructionVi: 'Chạm khăn bông xốp để lau chân thật nhẹ nhé.',
        instructionEn: 'Tap the fluffy towel to dry the paws gently.',
        successVi: 'Khăn bông xốp giúp lau chân thật nhẹ.',
        successEn: 'The fluffy towel dries the paws gently.',
        failVi: 'Chạm chiếc khăn vàng nhé.',
        failEn: 'Tap the yellow towel.',
        targetObjectId: towelId,
      },
    },
    {
      key: 'pat',
      meaningVi: 'thấm nhẹ',
      word: 'pat',
      tier: 'expanded',
      type: 'verb',
      speechPractice: 'optional',
      cueAsset: 'pat-paw',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm tay đang thấm nhẹ bàn chân nhé.',
      teachEn: 'Tap the hand patting the puppy paw.',
      teachSuccessEn: 'Pat means press gently again and again.',
      teachFailVi: 'Chạm bàn tay và khăn vàng nhé.',
      teachFailEn: 'Tap the hand and yellow towel.',
      practice: {
        instructionVi: 'Chạm cún để thấm nhẹ giọt nước cuối nhé.',
        instructionEn: 'Tap the puppy to pat away the last drops.',
        successVi: 'Giọt nước cuối đã được thấm khô.',
        successEn: 'The last drops are dry.',
        failVi: 'Chạm chú cún có chân sạch nhé.',
        failEn: 'Tap the puppy with clean paws.',
        targetObjectId: heroId,
      },
    },
    {
      key: 'stand',
      meaningVi: 'đứng',
      word: 'stand',
      tier: 'expanded',
      type: 'verb',
      speechPractice: 'optional',
      cueObjectId: heroId,
      teachVi: 'Chạm chú cún đang đứng bằng bốn chân sạch nhé.',
      teachEn: 'Tap the puppy standing on four clean paws.',
      teachSuccessEn: 'Stand means to be upright on your feet or paws.',
      teachFailVi: 'Chạm chú cún đang đứng trên tấm thảm nhé.',
      teachFailEn: 'Tap the puppy standing on the mat.',
      practice: {
        instructionVi: 'Chạm cún đang đứng để kiểm tra bốn chân khô nhé.',
        instructionEn: 'Tap the standing puppy to check all four dry paws.',
        successVi: 'Cún đứng vững bằng bốn bàn chân sạch và khô.',
        successEn: 'The puppy stands on four clean, dry paws.',
        failVi: 'Chạm chú cún đang đứng nhé.',
        failEn: 'Tap the standing puppy.',
        targetObjectId: heroId,
        effects: [lessonEffects.sound('correct')],
        successStateChanges: [sceneStateChanges.setVariant(heroId, 'standing')],
      },
    },
    {
      key: 'dry-the-paws',
      meaningVi: 'lau khô bàn chân',
      word: 'dry the paws',
      tier: 'challenge',
      type: 'phrase',
      cueAsset: 'dry-both-paws',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm hình khăn lau cả hai chân nhé.',
      teachEn: 'Tap the towel drying both paws.',
      teachSuccessEn: 'Dry the paws means remove water from the paws.',
      teachFailVi: 'Chạm hai chân đang được khăn lau nhé.',
      teachFailEn: 'Tap the two paws inside the towel.',
      practice: {
        instructionVi: 'Chạm cún để kiểm tra chân đã khô nhé.',
        instructionEn: 'Tap the puppy to check that its paws are dry.',
        successVi: 'Hai bàn chân đã khô hoàn toàn.',
        successEn: 'Both paws are completely dry.',
        failVi: 'Chạm chú cún có chân khô nhé.',
        failEn: 'Tap the puppy with dry paws.',
        targetObjectId: heroId,
      },
    },
    {
      key: 'all-done',
      meaningVi: 'xong rồi',
      word: 'all done',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'all-done',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm hai ngón cái báo xong rồi nhé.',
      teachEn: 'Tap the thumbs saying all done.',
      teachSuccessEn: 'All done means everything is finished.',
      teachFailVi: 'Chạm hai bàn tay giơ ngón cái nhé.',
      teachFailEn: 'Tap the two thumbs-up hands.',
      practice: {
        instructionVi: 'Chạm cún để bạn bước khỏi thảm nhé.',
        instructionEn: 'Tap the puppy so it steps off the mat.',
        successVi: 'Xong rồi. Cún đã sạch và sẵn sàng chơi.',
        successEn: 'All done. The puppy is clean and ready to play.',
        failVi: 'Chạm chú cún sạch nhé.',
        failEn: 'Tap the clean puppy.',
        targetObjectId: heroId,
        successStateChanges: [sceneStateChanges.setVariant(heroId, 'finished')],
      },
    },
    {
      key: 'wash-hands',
      meaningVi: 'rửa tay',
      word: 'wash hands',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'wash-hands',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm hai bàn tay dưới vòi nước nhé.',
      teachEn: 'Tap the hands under running water.',
      teachSuccessEn: 'Wash hands means clean your hands with soap and water.',
      teachFailVi: 'Chạm hai bàn tay có bọt xà phòng nhé.',
      teachFailEn: 'Tap the hands with soap bubbles.',
      practice: {
        instructionVi: 'Chạm hình rửa tay để kết thúc nhé.',
        instructionEn: 'Tap the handwashing picture to finish.',
        successVi: 'Bé đã nhớ rửa tay sau khi chăm cún.',
        successEn: 'You remembered to wash your hands after helping the puppy.',
        failVi: 'Chạm hai bàn tay dưới vòi nước nhé.',
        failEn: 'Tap the hands under running water.',
        effects: [lessonEffects.sound('complete')],
      },
    },
  ];
  const vocabulary = makeBeatVocabulary(sceneId, beats);
  const fluffyTowelVocabulary = vocabulary.find(
    item => item.word === 'fluffy towel',
  )!;
  const standVocabulary = vocabulary.find(item => item.word === 'stand')!;

  return {
    id: sceneId,
    titleVi: 'Lau chân khô',
    titleEn: 'Dry the Paws',
    thumbnailEmoji: '🧻',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: heroId,
        assetSource: sceneImageSource(sceneId, 'puppy-clean-wet'),
        isInteractive: true,
        position: rect(55, 43, 39, 38),
        presentation: 'cutout',
        touchArea: rect(48, 36, 51, 49),
        variants: [
          objectVariant({
            id: 'drying',
            assetSource: sceneImageSource(sceneId, 'puppy-drying'),
          }),
          objectVariant({
            id: 'dry',
            assetSource: sceneImageSource(sceneId, 'puppy-dry'),
          }),
          objectVariant({
            id: 'standing',
            assetSource: sceneImageSource(sceneId, 'puppy-all-done'),
            position: rect(57, 44, 37, 37),
          }),
          objectVariant({
            id: 'finished',
            assetSource: sceneImageSource(sceneId, 'puppy-all-done'),
            position: rect(57, 44, 37, 37),
          }),
        ],
      }),
      sceneObject({
        id: towelId,
        assetSource: sceneImageSource(sceneId, 'towel'),
        isInteractive: true,
        position: rect(9, 61, 28, 20),
        presentation: 'cutout',
        touchArea: rect(3, 54, 40, 34),
        variants: [
          objectVariant({
            id: 'soft',
            assetSource: sceneImageSource(sceneId, 'soft-towel'),
          }),
        ],
      }),
      learningObject({
        id: `${sceneId}-fluffy-towel-representative`,
        assetSource: sceneImageSource(sceneId, 'soft-towel'),
        initialVisibility: 'hidden',
        isInteractive: false,
        learningScope: expandedScope,
        position: rect(9, 61, 28, 20),
        vocab: fluffyTowelVocabulary,
      }),
      learningObject({
        id: `${sceneId}-stand-representative`,
        assetSource: sceneImageSource(sceneId, 'puppy-all-done'),
        initialVisibility: 'hidden',
        isInteractive: false,
        learningScope: expandedScope,
        position: rect(57, 44, 37, 37),
        vocab: standVocabulary,
      }),
      ...makeBeatObjects(sceneId, beats, vocabulary),
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        type: 'intro',
        instructionVi: 'Chân cún đã sạch nhưng còn ướt. Mình lau khô nhé.',
        instructionEn:
          'The puppy paws are clean but still wet. Let’s dry them.',
        successFeedbackVi: 'Cún đang ngồi yên cạnh chiếc khăn.',
        successFeedbackEn: 'The puppy is waiting calmly beside the towel.',
        targetObjectIds: [heroId, towelId],
      }),
      ...makeBeatSteps(sceneId, beats, vocabulary),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Chân cún đã sạch, khô và bé cũng nhớ rửa tay.',
      messageEn:
        'The puppy paws are clean and dry, and you remembered to wash your hands.',
    },
  };
}

export const cleanMuddyPawsLesson: Lesson = {
  id: lessonId,
  themeId: 'nhung-nguoi-ban-dong-vat',
  titleVi: 'Rửa chân bẩn',
  titleEn: 'Clean Muddy Paws',
  descriptionVi:
    'Bé nhìn chân cún dính bùn, nhờ người lớn rửa nhẹ rồi lau khô bàn chân.',
  descriptionEn:
    'Notice muddy puppy paws, ask an adult to wash them gently, then dry the paws.',
  thumbnailEmoji: '🐾',
  ageRange: { min: 3, max: 8, label: '3-8 tuổi · Làm quen' },
  scenes: [
    makeNoticeTheMuddyPawsScene(),
    makeWashThePawsScene(),
    makeDryThePawsScene(),
  ],
  reviewGame: {
    id: `${lessonId}-review`,
    type: 'random',
    titleVi: 'Chăm bàn chân cún',
    config: {
      vocabularyIds: [
        'vocab-clean-muddy-paws-notice-the-muddy-paws-paws',
        'vocab-clean-muddy-paws-notice-the-muddy-paws-mud',
        'vocab-clean-muddy-paws-wash-the-paws-water',
        'vocab-clean-muddy-paws-dry-the-paws-towel',
        'vocab-clean-muddy-paws-wash-the-paws-basin',
        'vocab-clean-muddy-paws-dry-the-paws-dry-the-paws',
      ],
    },
  },
  metadata: {
    parentTipVi:
      'Ba mẹ hoặc người lớn chuẩn bị nước sạch vừa ấm, giữ cún đứng yên và trực tiếp giúp rửa từng chân. Không để bé tự tắm cún, dùng nước nóng, hóa chất hoặc cố giữ cún khi bạn khó chịu; nhớ rửa tay sau khi chăm cún.',
  },
};
