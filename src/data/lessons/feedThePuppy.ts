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

const lessonId = 'feed-the-puppy';
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
  teachSuccessVi: string;
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
    if (beat.cueObjectId) {
      return [];
    }

    if (!beat.cueAsset || !beat.cuePosition) {
      throw new Error(
        `Vocabulary beat "${sceneId}/${beat.key}" needs a cue asset and position.`,
      );
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

function makeMeetThePuppyScene(): Scene {
  const sceneId = 'meet-the-puppy';
  const heroId = `${sceneId}-hero`;
  const emptyBowlId = `${sceneId}-empty-bowl`;

  const beats: VocabularyBeat[] = [
    {
      key: 'puppy',
      meaningVi: 'chú cún; chó con',
      word: 'puppy',
      cueObjectId: heroId,
      teachVi: 'Chạm chú cún màu nâu nhé.',
      teachEn: 'Tap the little brown puppy.',
      teachSuccessVi: 'Đây là puppy, chú cún.',
      teachSuccessEn: 'This is a puppy.',
      teachFailVi: 'Chạm chú cún có vòng cổ xanh nhé.',
      teachFailEn: 'Tap the puppy with the blue collar.',
      practice: {
        instructionVi: 'Chạm chú cún ở giữa để bạn ngồi xuống nhé.',
        instructionEn: 'Tap the puppy in the middle so it sits down.',
        successVi: 'Chú cún đã ngồi chờ bé.',
        successEn: 'The puppy is sitting and waiting for you.',
        failVi: 'Chạm chú cún ở giữa nhé.',
        failEn: 'Tap the puppy in the middle.',
        targetObjectId: heroId,
        successStateChanges: [sceneStateChanges.setVariant(heroId, 'sitting')],
      },
    },
    {
      key: 'hello',
      meaningVi: 'xin chào',
      word: 'hello',
      type: 'phrase',
      cueAsset: 'hello-hand',
      cuePosition: rect(20, 40, 19, 19),
      cueTouchArea: rect(14, 34, 31, 31),
      teachVi: 'Chạm bàn tay đang vẫy nhé.',
      teachEn: 'Tap the waving hand.',
      teachSuccessVi: 'Hello nghĩa là xin chào.',
      teachSuccessEn: 'Hello means we are greeting someone.',
      teachFailVi: 'Chạm bàn tay vẫy bên trái nhé.',
      teachFailEn: 'Tap the waving hand on the left.',
      practice: {
        instructionVi: 'Chạm chú cún để chào bạn nhé.',
        instructionEn: 'Tap the puppy to say hello.',
        successVi: 'Cún vui khi được bé chào.',
        successEn: 'The puppy likes hearing your hello.',
        failVi: 'Chạm chú cún ở giữa nhé.',
        failEn: 'Tap the puppy in the middle.',
        effects: [lessonEffects.bounce(heroId)],
        targetObjectId: heroId,
      },
    },
    {
      key: 'hungry',
      meaningVi: 'đói bụng',
      word: 'hungry',
      type: 'adjective',
      cueObjectId: heroId,
      revealStateChanges: [
        sceneStateChanges.setVariant(heroId, 'holding-tummy'),
      ],
      teachVi: 'Chạm cún đang ôm bụng nhé.',
      teachEn: 'Tap the puppy holding its tummy.',
      teachSuccessVi: 'Hungry nghĩa là đói bụng.',
      teachSuccessEn: 'Hungry means its tummy needs food.',
      teachFailVi: 'Chạm cún đang ôm bụng ở bên phải nhé.',
      teachFailEn: 'Tap the puppy holding its tummy on the right.',
      practice: {
        instructionVi: 'Tìm chiếc bát trống vì cún đang đói nhé.',
        instructionEn: 'Find the empty bowl because the puppy is hungry.',
        successVi: 'Đúng rồi, mình cần chuẩn bị thức ăn.',
        successEn: 'Right, we need to prepare some food.',
        failVi: 'Tìm chiếc bát chưa có thức ăn nhé.',
        failEn: 'Find the bowl with no food inside.',
        kind: 'find',
        targetObjectId: emptyBowlId,
        successStateChanges: [
          sceneStateChanges.setVariant(heroId, 'holding-tummy'),
        ],
      },
    },
    {
      key: 'sit',
      meaningVi: 'ngồi',
      word: 'sit',
      tier: 'expanded',
      type: 'verb',
      speechPractice: 'optional',
      cueObjectId: heroId,
      revealStateChanges: [sceneStateChanges.setVariant(heroId, 'sitting')],
      teachVi: 'Chạm cún đang ngồi nhé.',
      teachEn: 'Tap the puppy sitting down.',
      teachSuccessVi: 'Sit nghĩa là ngồi.',
      teachSuccessEn: 'Sit means to rest on your bottom.',
      teachFailVi: 'Chạm chú cún ngồi thẳng ở giữa nhé.',
      teachFailEn: 'Tap the puppy sitting in the middle.',
      practice: {
        instructionVi: 'Chạm chú cún để bạn ngồi yên chờ nhé.',
        instructionEn: 'Tap the puppy so it sits and waits.',
        successVi: 'Cún đã ngồi yên rồi.',
        successEn: 'The puppy is sitting calmly.',
        failVi: 'Chạm chú cún ở giữa nhé.',
        failEn: 'Tap the puppy in the middle.',
        targetObjectId: heroId,
        successStateChanges: [sceneStateChanges.setVariant(heroId, 'sitting')],
      },
    },
    {
      key: 'tummy',
      meaningVi: 'bụng',
      word: 'tummy',
      tier: 'expanded',
      speechPractice: 'optional',
      cueObjectId: heroId,
      revealStateChanges: [
        sceneStateChanges.setVariant(heroId, 'holding-tummy'),
      ],
      teachVi: 'Chạm hai chân trước đang ôm bụng nhé.',
      teachEn: 'Tap the paws holding the puppy’s tummy.',
      teachSuccessVi: 'Tummy nghĩa là bụng.',
      teachSuccessEn: 'Tummy means belly.',
      teachFailVi: 'Chạm phần bụng của cún nhé.',
      teachFailEn: 'Tap the puppy’s belly.',
      practice: {
        instructionVi: 'Chạm cún để nghe bụng bạn réo nhé.',
        instructionEn: 'Tap the puppy to hear its tummy rumble.',
        successVi: 'Bụng cún đang nhắc bạn cần ăn.',
        successEn: 'The puppy’s tummy says it needs food.',
        failVi: 'Chạm chú cún ở giữa nhé.',
        failEn: 'Tap the puppy in the middle.',
        effects: [lessonEffects.sound('tap')],
        targetObjectId: heroId,
        successStateChanges: [
          sceneStateChanges.setVariant(heroId, 'holding-tummy'),
        ],
      },
    },
    {
      key: 'look',
      meaningVi: 'nhìn',
      word: 'look',
      tier: 'expanded',
      type: 'verb',
      cueObjectId: heroId,
      revealStateChanges: [
        sceneStateChanges.setVariant(heroId, 'looking-at-bowl'),
      ],
      teachVi: 'Chạm cún đang nhìn chiếc bát nhé.',
      teachEn: 'Tap the puppy looking at the bowl.',
      teachSuccessVi: 'Look nghĩa là nhìn.',
      teachSuccessEn: 'Look means to point your eyes at something.',
      teachFailVi: 'Chạm cún đang hướng mắt vào bát nhé.',
      teachFailEn: 'Tap the puppy facing the bowl.',
      practice: {
        instructionVi: 'Tìm chiếc bát mà cún đang nhìn nhé.',
        instructionEn: 'Find the bowl the puppy is looking at.',
        successVi: 'Đúng rồi, cún đang nhìn bát trống.',
        successEn: 'Right, the puppy is looking at the empty bowl.',
        failVi: 'Tìm chiếc bát trống bên phải nhé.',
        failEn: 'Find the empty bowl on the right.',
        kind: 'find',
        targetObjectId: emptyBowlId,
        successStateChanges: [
          sceneStateChanges.setVariant(heroId, 'looking-at-bowl'),
        ],
      },
    },
    {
      key: 'tail',
      meaningVi: 'đuôi',
      word: 'tail',
      tier: 'challenge',
      speechPractice: 'optional',
      cueAsset: 'tail-closeup',
      cuePosition: rect(23, 52, 19, 17),
      cueTouchArea: rect(17, 46, 31, 29),
      teachVi: 'Chạm chiếc đuôi của cún nhé.',
      teachEn: 'Tap the puppy’s tail.',
      teachSuccessVi: 'Tail nghĩa là đuôi.',
      teachSuccessEn: 'Tail means the part at the back of the puppy.',
      teachFailVi: 'Chạm chiếc đuôi cong bên trái nhé.',
      teachFailEn: 'Tap the curved tail on the left.',
      practice: {
        instructionVi: 'Chạm chiếc đuôi để cún vẫy nhé.',
        instructionEn: 'Tap the tail to make it wag.',
        successVi: 'Chiếc đuôi đang vẫy qua lại.',
        successEn: 'The tail is moving from side to side.',
        failVi: 'Chạm chiếc đuôi cong nhé.',
        failEn: 'Tap the curved tail.',
        effects: [lessonEffects.bounce(cueId(sceneId, 'tail'))],
      },
    },
    {
      key: 'collar',
      meaningVi: 'vòng cổ',
      word: 'collar',
      tier: 'challenge',
      speechPractice: 'optional',
      cueAsset: 'collar-closeup',
      cuePosition: rect(55, 45, 18, 16),
      cueTouchArea: rect(49, 39, 30, 28),
      teachVi: 'Chạm chiếc vòng màu xanh nhé.',
      teachEn: 'Tap the blue collar.',
      teachSuccessVi: 'Collar nghĩa là vòng cổ.',
      teachSuccessEn: 'Collar is the band around the puppy’s neck.',
      teachFailVi: 'Chạm vòng cổ xanh bên phải nhé.',
      teachFailEn: 'Tap the blue collar on the right.',
      practice: {
        instructionVi: 'Tìm vòng cổ xanh của chú cún nhé.',
        instructionEn: 'Find the puppy’s blue collar.',
        successVi: 'Đúng rồi, chiếc vòng nằm quanh cổ cún.',
        successEn: 'Right, the collar goes around the puppy’s neck.',
        failVi: 'Tìm chiếc vòng màu xanh nhé.',
        failEn: 'Find the blue collar.',
        kind: 'find',
        effects: [lessonEffects.sparkle(cueId(sceneId, 'collar'))],
      },
    },
    {
      key: 'wag',
      meaningVi: 'vẫy đuôi',
      word: 'wag',
      tier: 'challenge',
      type: 'verb',
      cueObjectId: heroId,
      revealStateChanges: [sceneStateChanges.setVariant(heroId, 'wagging')],
      teachVi: 'Chạm cún đang vẫy đuôi nhé.',
      teachEn: 'Tap the puppy wagging its tail.',
      teachSuccessVi: 'Wag nghĩa là vẫy đuôi.',
      teachSuccessEn: 'Wag means to move the tail from side to side.',
      teachFailVi: 'Chạm cún có chiếc đuôi đang lắc nhé.',
      teachFailEn: 'Tap the puppy with the moving tail.',
      practice: {
        instructionVi: 'Chạm chú cún để bạn vẫy đuôi chào bé nhé.',
        instructionEn: 'Tap the puppy so it wags hello.',
        successVi: 'Cún đã vẫy đuôi. Mình chuẩn bị bữa ăn nhé.',
        successEn: 'The puppy wagged its tail. Let us prepare its meal.',
        failVi: 'Chạm chú cún ở giữa nhé.',
        failEn: 'Tap the puppy in the middle.',
        effects: [lessonEffects.sound('yay')],
        targetObjectId: heroId,
        successStateChanges: [sceneStateChanges.setVariant(heroId, 'wagging')],
      },
    },
  ];
  const vocabulary = makeBeatVocabulary(sceneId, beats);
  const wagVocabulary = vocabulary.find(item => item.word === 'wag')!;

  return {
    id: sceneId,
    titleVi: 'Gặp chú cún',
    titleEn: 'Meet the Puppy',
    thumbnailEmoji: '🐶',
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
        position: rect(34, 44, 32, 31),
        presentation: 'cutout',
        touchArea: rect(27, 37, 46, 44),
        variants: [
          objectVariant({
            id: 'sitting',
            assetSource: sceneImageSource(sceneId, 'puppy-sitting'),
          }),
          objectVariant({
            id: 'holding-tummy',
            assetSource: sceneImageSource(sceneId, 'puppy-holding-tummy'),
          }),
          objectVariant({
            id: 'looking-at-bowl',
            assetSource: sceneImageSource(sceneId, 'puppy-looking-at-bowl'),
            position: rect(30, 43, 40, 33),
          }),
          objectVariant({
            id: 'wagging',
            assetSource: sceneImageSource(sceneId, 'puppy-wagging'),
          }),
        ],
      }),
      sceneObject({
        id: emptyBowlId,
        assetSource: sceneImageSource(sceneId, 'empty-bowl-cue'),
        isInteractive: true,
        position: rect(69, 58, 24, 18),
        presentation: 'cutout',
        touchArea: rect(63, 51, 36, 31),
      }),
      learningObject({
        id: `${sceneId}-wag-representative`,
        assetSource: sceneImageSource(sceneId, 'wag-action'),
        initialVisibility: 'hidden',
        isInteractive: false,
        learningScope: challengeScope,
        position: rect(34, 44, 32, 31),
        vocab: wagVocabulary,
      }),
      ...makeBeatObjects(sceneId, beats, vocabulary),
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        instructionVi: 'Có một chú cún đang chờ mình. Mình làm quen nhé.',
        instructionEn: 'A little puppy is waiting. Let us meet it.',
        successFeedbackVi: 'Chú cún đang nhìn bé.',
        successFeedbackEn: 'The puppy is looking at you.',
        targetObjectIds: [heroId],
        type: 'intro',
      }),
      ...makeBeatSteps(sceneId, beats, vocabulary),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Bé đã làm quen và hiểu chú cún đang đói.',
      messageEn: 'You met the puppy and learned that it is hungry.',
    },
  };
}

function makeFillTheBowlScene(): Scene {
  const sceneId = 'fill-the-bowl';
  const storyBowlId = `${sceneId}-story-bowl`;
  const storyMatId = `${sceneId}-story-mat`;
  const targetGlowId = `${sceneId}-target-glow`;
  const tooMuchId = `${sceneId}-too-much`;
  const matZoneId = `${sceneId}-mat-zone`;
  const bowlZoneId = `${sceneId}-bowl-zone`;

  const beats: VocabularyBeat[] = [
    {
      key: 'bowl',
      meaningVi: 'chiếc bát',
      word: 'bowl',
      cueObjectId: storyBowlId,
      teachVi: 'Chạm chiếc bát màu xanh nhé.',
      teachEn: 'Tap the blue bowl.',
      teachSuccessVi: 'Bowl nghĩa là chiếc bát.',
      teachSuccessEn: 'Bowl means a round dish for food.',
      teachFailVi: 'Chạm chiếc bát xanh bên trái nhé.',
      teachFailEn: 'Tap the blue bowl on the left.',
      practice: {
        instructionVi: 'Kéo chiếc bát xuống tấm thảm nhé.',
        instructionEn: 'Drag the bowl onto the mat.',
        successVi: 'Chiếc bát đã ở đúng chỗ.',
        successEn: 'The bowl is in the right place.',
        failVi: 'Kéo chiếc bát vào giữa tấm thảm nhé.',
        failEn: 'Drag the bowl to the middle of the mat.',
        kind: 'drag',
        dropZoneId: matZoneId,
        successStateChanges: [
          sceneStateChanges.setVariant(storyBowlId, 'on-mat-empty'),
        ],
      },
    },
    {
      key: 'food',
      meaningVi: 'thức ăn',
      word: 'food',
      cueAsset: 'food-scoop',
      cuePosition: rect(68, 51, 27, 23),
      cueTouchArea: rect(62, 45, 37, 35),
      teachVi: 'Chạm phần thức ăn trong chiếc xẻng nhé.',
      teachEn: 'Tap the food in the scoop.',
      teachSuccessVi: 'Food nghĩa là thức ăn.',
      teachSuccessEn: 'Food is what the puppy eats.',
      teachFailVi: 'Chạm những viên thức ăn bên phải nhé.',
      teachFailEn: 'Tap the pieces of food on the right.',
      practice: {
        instructionVi: 'Chạm thức ăn để đưa lại gần chiếc bát nhé.',
        instructionEn: 'Tap the food to bring it near the bowl.',
        successVi: 'Thức ăn đã ở cạnh chiếc bát.',
        successEn: 'The food is beside the bowl now.',
        failVi: 'Chạm phần thức ăn trong chiếc xẻng nhé.',
        failEn: 'Tap the food in the scoop.',
        effects: [lessonEffects.bounce(cueId(sceneId, 'food'))],
        afterSuccessStateChanges: [sceneStateChanges.show(targetGlowId)],
      },
    },
    {
      key: 'scoop',
      meaningVi: 'xẻng xúc thức ăn',
      word: 'scoop',
      cueAsset: 'food-scoop',
      cuePosition: rect(68, 51, 27, 23),
      cueTouchArea: rect(62, 45, 37, 35),
      teachVi: 'Chạm chiếc xẻng đang xúc thức ăn nhé.',
      teachEn: 'Tap the scoop holding the food.',
      teachSuccessVi: 'Scoop là chiếc xẻng nhỏ để xúc thức ăn.',
      teachSuccessEn: 'A scoop is a small tool for lifting food.',
      teachFailVi: 'Chạm chiếc xẻng bạc bên phải nhé.',
      teachFailEn: 'Tap the silver scoop on the right.',
      practice: {
        instructionVi: 'Kéo xẻng thức ăn vào chiếc bát nhé.',
        instructionEn: 'Drag the scoop of food into the bowl.',
        successVi: 'Thức ăn đã vào trong bát.',
        successEn: 'The food is in the bowl.',
        failVi: 'Kéo chiếc xẻng vào lòng bát nhé.',
        failEn: 'Drag the scoop into the middle of the bowl.',
        kind: 'drag',
        dropZoneId: bowlZoneId,
        successStateChanges: [
          sceneStateChanges.setVariant(storyBowlId, 'on-mat-filled'),
          sceneStateChanges.hide(targetGlowId),
        ],
      },
    },
    {
      key: 'mat',
      meaningVi: 'tấm thảm',
      word: 'mat',
      tier: 'expanded',
      speechPractice: 'optional',
      cueObjectId: storyMatId,
      teachVi: 'Chạm tấm thảm màu xanh nhé.',
      teachEn: 'Tap the green mat.',
      teachSuccessVi: 'Mat nghĩa là tấm thảm.',
      teachSuccessEn: 'A mat is the flat pad under the bowl.',
      teachFailVi: 'Chạm tấm thảm xanh ở giữa nhé.',
      teachFailEn: 'Tap the green mat in the middle.',
      practice: {
        instructionVi: 'Chạm tấm thảm dưới chiếc bát để kiểm tra nhé.',
        instructionEn: 'Tap the mat under the bowl to check it.',
        successVi: 'Tấm thảm giúp chiếc bát đứng ngay ngắn.',
        successEn: 'The mat keeps the bowl in its place.',
        failVi: 'Chạm tấm thảm dưới bát nhé.',
        failEn: 'Tap the mat under the bowl.',
        targetObjectId: storyMatId,
        effects: [lessonEffects.sparkle(storyMatId)],
      },
    },
    {
      key: 'empty',
      meaningVi: 'trống; không có gì bên trong',
      word: 'empty',
      tier: 'expanded',
      type: 'adjective',
      speechPractice: 'optional',
      cueAsset: 'bowl-on-mat-empty',
      cuePosition: rect(7, 51, 31, 24),
      cueTouchArea: rect(1, 45, 43, 36),
      teachVi: 'Chạm chiếc bát chưa có thức ăn nhé.',
      teachEn: 'Tap the bowl with no food inside.',
      teachSuccessVi: 'Empty nghĩa là trống.',
      teachSuccessEn: 'Empty means there is nothing inside.',
      teachFailVi: 'Chạm chiếc bát trống bên trái nhé.',
      teachFailEn: 'Tap the empty bowl on the left.',
      practice: {
        instructionVi: 'Tìm chiếc bát trống để so sánh nhé.',
        instructionEn: 'Find the empty bowl for comparison.',
        successVi: 'Đúng rồi, chiếc bát này chưa có thức ăn.',
        successEn: 'Right, this bowl has no food inside.',
        failVi: 'Tìm chiếc bát chưa có viên thức ăn nào nhé.',
        failEn: 'Find the bowl with no pieces of food.',
        kind: 'find',
      },
    },
    {
      key: 'full',
      meaningVi: 'đầy',
      word: 'full',
      tier: 'expanded',
      type: 'adjective',
      cueAsset: 'bowl-on-mat-filled',
      cuePosition: rect(62, 51, 31, 24),
      cueTouchArea: rect(56, 45, 43, 36),
      teachVi: 'Chạm chiếc bát có thức ăn nhé.',
      teachEn: 'Tap the bowl with food inside.',
      teachSuccessVi: 'Full nghĩa là đầy.',
      teachSuccessEn: 'Full means the bowl has food in it.',
      teachFailVi: 'Chạm chiếc bát đầy bên phải nhé.',
      teachFailEn: 'Tap the full bowl on the right.',
      practice: {
        instructionVi: 'Tìm chiếc bát đầy để cún dùng bữa nhé.',
        instructionEn: 'Find the full bowl for the puppy’s meal.',
        successVi: 'Đúng rồi, bát đã có thức ăn.',
        successEn: 'Right, the bowl has food in it.',
        failVi: 'Tìm chiếc bát có những viên thức ăn nhé.',
        failEn: 'Find the bowl with pieces of food.',
        kind: 'find',
        successStateChanges: [
          sceneStateChanges.setVariant(storyBowlId, 'on-mat-filled'),
        ],
        afterSuccessStateChanges: [sceneStateChanges.show(tooMuchId)],
      },
    },
    {
      key: 'one-scoop',
      meaningVi: 'một xẻng thức ăn',
      word: 'one scoop',
      tier: 'challenge',
      type: 'phrase',
      cueAsset: 'one-scoop',
      cuePosition: rect(6, 49, 34, 27),
      cueTouchArea: rect(1, 43, 45, 39),
      teachVi: 'Chạm hình một xẻng thức ăn nhé.',
      teachEn: 'Tap the picture with one scoop of food.',
      teachSuccessVi: 'One scoop nghĩa là một xẻng.',
      teachSuccessEn: 'One scoop means one measured scoopful.',
      teachFailVi: 'Chạm chiếc xẻng chỉ có một phần thức ăn nhé.',
      teachFailEn: 'Tap the scoop with one portion of food.',
      practice: {
        instructionVi: 'Tìm đúng một xẻng, không chọn phần quá nhiều nhé.',
        instructionEn: 'Find one scoop, not the extra-large portion.',
        successVi: 'Đúng rồi, người lớn sẽ chọn khẩu phần phù hợp.',
        successEn: 'Right, an adult chooses the proper portion.',
        failVi: 'Tìm hình chỉ có một xẻng thức ăn nhé.',
        failEn: 'Find the picture with just one scoop of food.',
        kind: 'find',
        targetObjectIds: [cueId(sceneId, 'one-scoop'), tooMuchId],
        correctObjectIds: [cueId(sceneId, 'one-scoop')],
        afterSuccessStateChanges: [sceneStateChanges.hide(tooMuchId)],
      },
    },
    {
      key: 'meal',
      meaningVi: 'bữa ăn',
      word: 'meal',
      tier: 'challenge',
      speechPractice: 'optional',
      cueObjectId: storyBowlId,
      teachVi: 'Chạm bát thức ăn đã chuẩn bị xong nhé.',
      teachEn: 'Tap the prepared bowl of food.',
      teachSuccessVi: 'Meal nghĩa là bữa ăn.',
      teachSuccessEn: 'A meal is food prepared for eating.',
      teachFailVi: 'Chạm chiếc bát trên tấm thảm nhé.',
      teachFailEn: 'Tap the bowl on the mat.',
      practice: {
        instructionVi: 'Chạm bữa ăn để đưa tới gần cún nhé.',
        instructionEn: 'Tap the meal to bring it near the puppy.',
        successVi: 'Bữa ăn của cún đã sẵn sàng.',
        successEn: 'The puppy’s meal is prepared.',
        failVi: 'Chạm chiếc bát thức ăn ở giữa nhé.',
        failEn: 'Tap the bowl of food in the middle.',
        successStateChanges: [
          sceneStateChanges.setVariant(storyBowlId, 'ready'),
        ],
      },
    },
    {
      key: 'ready',
      meaningVi: 'sẵn sàng',
      word: 'ready',
      tier: 'challenge',
      type: 'adjective',
      speechPractice: 'optional',
      cueObjectId: storyBowlId,
      teachVi: 'Chạm chiếc bát đã sẵn sàng nhé.',
      teachEn: 'Tap the bowl that is ready.',
      teachSuccessVi: 'Ready nghĩa là sẵn sàng.',
      teachSuccessEn: 'Ready means prepared for what comes next.',
      teachFailVi: 'Chạm chiếc bát đầy ở giữa nhé.',
      teachFailEn: 'Tap the full bowl in the middle.',
      practice: {
        instructionVi: 'Chạm bát ở giữa để mang bữa ăn sang cho cún nhé.',
        instructionEn:
          'Tap the bowl in the middle to take the meal to the puppy.',
        successVi: 'Bát đã sẵn sàng. Mình mang sang cho cún nhé.',
        successEn: 'The bowl is ready. Let us take it to the puppy.',
        failVi: 'Chạm chiếc bát đầy ở giữa tấm thảm nhé.',
        failEn: 'Tap the full bowl in the middle of the mat.',
        targetObjectId: storyBowlId,
        effects: [
          lessonEffects.sound('ding'),
          lessonEffects.sparkle(storyBowlId),
        ],
      },
    },
  ];
  const vocabulary = makeBeatVocabulary(sceneId, beats);

  return {
    id: sceneId,
    titleVi: 'Chuẩn bị bát',
    titleEn: 'Prepare the Bowl',
    thumbnailEmoji: '🥣',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: storyMatId,
        assetSource: sceneImageSource(sceneId, 'feeding-mat'),
        isInteractive: true,
        position: rect(29, 62, 42, 18),
        presentation: 'cutout',
        touchArea: rect(23, 56, 54, 30),
      }),
      sceneObject({
        id: storyBowlId,
        assetSource: sceneImageSource(sceneId, 'bowl-shelf-empty'),
        isInteractive: true,
        position: rect(8, 51, 28, 21),
        presentation: 'cutout',
        touchArea: rect(2, 44, 39, 34),
        variants: [
          objectVariant({
            id: 'on-mat-empty',
            assetSource: sceneImageSource(sceneId, 'bowl-on-mat-empty'),
            position: rect(34, 58, 32, 25),
            touchArea: rect(27, 51, 46, 38),
          }),
          objectVariant({
            id: 'on-mat-filled',
            assetSource: sceneImageSource(sceneId, 'bowl-on-mat-filled'),
            position: rect(34, 58, 32, 25),
            touchArea: rect(27, 51, 46, 38),
          }),
          objectVariant({
            id: 'ready',
            assetSource: sceneImageSource(sceneId, 'bowl-ready'),
            position: rect(32, 54, 36, 30),
            touchArea: rect(25, 47, 50, 43),
          }),
        ],
      }),
      sceneObject({
        id: targetGlowId,
        assetSource: sceneImageSource(sceneId, 'target-glow'),
        initialVisibility: 'hidden',
        position: rect(35, 54, 30, 30),
        presentation: 'cutout',
      }),
      sceneObject({
        id: tooMuchId,
        assetSource: sceneImageSource(sceneId, 'too-much-scoop'),
        initialVisibility: 'hidden',
        isInteractive: true,
        learningScope: challengeScope,
        position: rect(60, 49, 34, 27),
        presentation: 'cutout',
        touchArea: rect(54, 43, 44, 39),
      }),
      ...makeBeatObjects(sceneId, beats, vocabulary),
    ],
    dropZones: [
      {
        id: matZoneId,
        position: rect(34, 58, 32, 24),
        touchArea: rect(27, 51, 46, 38),
      },
      {
        id: bowlZoneId,
        position: rect(39, 61, 22, 18),
        touchArea: rect(31, 53, 38, 33),
      },
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        instructionVi:
          'Người lớn đã chuẩn bị thức ăn. Mình xếp bát cho cún nhé.',
        instructionEn:
          'An adult prepared the food. Let us set up the puppy’s bowl.',
        successFeedbackVi: 'Chiếc bát và tấm thảm đang chờ bé.',
        successFeedbackEn: 'The bowl and mat are waiting for you.',
        targetObjectIds: [storyBowlId, storyMatId],
        type: 'intro',
      }),
      ...makeBeatSteps(sceneId, beats, vocabulary),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Bé đã chuẩn bị xong bữa ăn phù hợp cho cún.',
      messageEn: 'You prepared the puppy’s meal.',
    },
  };
}

function makePuppyEatsScene(): Scene {
  const sceneId = 'puppy-eats';
  const heroId = `${sceneId}-hero`;
  const storyBowlId = `${sceneId}-story-bowl`;
  const feedingMatId = `${sceneId}-feeding-mat`;
  const heartId = `${sceneId}-heart`;
  const stepForwardId = `${sceneId}-step-forward`;
  const feedingZoneId = `${sceneId}-feeding-zone`;

  const beats: VocabularyBeat[] = [
    {
      key: 'wait',
      meaningVi: 'chờ',
      word: 'wait',
      type: 'verb',
      cueAsset: 'puppy-waiting',
      cuePosition: rect(67, 42, 29, 31),
      cueTouchArea: rect(61, 35, 38, 44),
      teachVi: 'Chạm chú cún đang ngồi chờ nhé.',
      teachEn: 'Tap the puppy waiting calmly.',
      teachSuccessVi: 'Wait nghĩa là chờ.',
      teachSuccessEn: 'Wait means to stay until it is time.',
      teachFailVi: 'Chạm chú cún đang ngồi yên nhé.',
      teachFailEn: 'Tap the puppy sitting still.',
      practice: {
        instructionVi: 'Chạm tấm thảm và để cún tiếp tục chờ nhé.',
        instructionEn: 'Tap the mat and let the puppy keep waiting.',
        successVi: 'Cún đang chờ rất ngoan.',
        successEn: 'The puppy is waiting calmly.',
        failVi: 'Chạm tấm thảm ở giữa nhé.',
        failEn: 'Tap the mat in the middle.',
        targetObjectId: feedingMatId,
        effects: [lessonEffects.sparkle(feedingMatId)],
      },
    },
    {
      key: 'feed',
      meaningVi: 'cho ăn',
      word: 'feed',
      type: 'verb',
      cueAsset: 'feed-action',
      cuePosition: rect(31, 41, 37, 28),
      cueTouchArea: rect(25, 35, 49, 40),
      teachVi: 'Chạm hình đặt bát thức ăn cho cún nhé.',
      teachEn: 'Tap the picture placing food for the puppy.',
      teachSuccessVi: 'Feed nghĩa là cho ăn.',
      teachSuccessEn: 'Feed means to give food to someone or an animal.',
      teachFailVi: 'Chạm hình đặt bát cạnh cún nhé.',
      teachFailEn: 'Tap the picture putting the bowl beside the puppy.',
      practice: {
        instructionVi: 'Kéo bát tới tấm thảm để cho cún ăn nhé.',
        instructionEn: 'Drag the bowl to the mat to feed the puppy.',
        successVi: 'Bé đã đặt bữa ăn đúng chỗ cho cún.',
        successEn: 'You put the puppy’s meal in the right place.',
        failVi: 'Kéo chiếc bát vào giữa tấm thảm nhé.',
        failEn: 'Drag the bowl to the middle of the mat.',
        kind: 'drag',
        dropZoneId: feedingZoneId,
        targetObjectId: storyBowlId,
        successStateChanges: [
          sceneStateChanges.setVariant(storyBowlId, 'on-mat-full'),
        ],
      },
    },
    {
      key: 'eat',
      meaningVi: 'ăn',
      word: 'eat',
      type: 'verb',
      cueAsset: 'eat-action-preview',
      cuePosition: rect(55, 48, 40, 30),
      cueTouchArea: rect(49, 41, 50, 43),
      hideCueAfterPractice: false,
      teachVi: 'Chạm hình cún đang ăn nhé.',
      teachEn: 'Tap the picture of the puppy eating.',
      teachSuccessVi: 'Eat nghĩa là ăn.',
      teachSuccessEn: 'Eat means to take in food.',
      teachFailVi: 'Chạm hình cún cúi xuống chiếc bát nhé.',
      teachFailEn: 'Tap the puppy bending down to the bowl.',
      practice: {
        instructionVi: 'Chạm bát thức ăn trên thảm để cún bắt đầu ăn nhé.',
        instructionEn: 'Tap the food bowl on the mat so the puppy can eat.',
        successVi: 'Cún bắt đầu ăn rồi.',
        successEn: 'The puppy is starting to eat.',
        failVi: 'Chạm chiếc bát thức ăn ở giữa tấm thảm nhé.',
        failEn: 'Tap the food bowl in the middle of the mat.',
        targetObjectId: storyBowlId,
        successStateChanges: [
          sceneStateChanges.setVariant(heroId, 'eating'),
          sceneStateChanges.setVariant(storyBowlId, 'empty'),
          sceneStateChanges.show(heartId),
        ],
      },
    },
    {
      key: 'finished',
      meaningVi: 'đã xong',
      word: 'finished',
      tier: 'expanded',
      type: 'adjective',
      speechPractice: 'optional',
      cueAsset: 'eat-action-finishing',
      cuePosition: rect(5, 43, 32, 29),
      cueTouchArea: rect(1, 37, 43, 41),
      revealStateChanges: [sceneStateChanges.hide(heroId)],
      teachVi: 'Chạm hình cún đã ăn xong nhé.',
      teachEn: 'Tap the puppy that has finished eating.',
      teachSuccessVi: 'Finished nghĩa là đã xong.',
      teachSuccessEn: 'Finished means the action is done.',
      teachFailVi: 'Chạm hình chiếc bát đã trống nhé.',
      teachFailEn: 'Tap the picture with the empty bowl.',
      practice: {
        instructionVi: 'Chạm chiếc bát trống để kiểm tra cún đã ăn xong nhé.',
        instructionEn: 'Tap the empty bowl to check that the puppy finished.',
        successVi: 'Cún đã ăn xong bữa rồi.',
        successEn: 'The puppy has finished its meal.',
        failVi: 'Chạm chiếc bát trống ở giữa nhé.',
        failEn: 'Tap the empty bowl in the middle.',
        targetObjectId: storyBowlId,
        effects: [lessonEffects.sparkle(storyBowlId)],
        afterSuccessStateChanges: [
          sceneStateChanges.hide(cueId(sceneId, 'eat')),
        ],
      },
    },
    {
      key: 'celebrate',
      meaningVi: 'chúc mừng',
      word: 'celebrate',
      tier: 'expanded',
      type: 'verb',
      cueAsset: 'puppy-happy',
      cuePosition: rect(67, 42, 29, 31),
      cueTouchArea: rect(61, 35, 38, 44),
      teachVi: 'Chạm chú cún đang reo vui để chúc mừng nhé.',
      teachEn: 'Tap the joyful puppy celebrating its finished meal.',
      teachSuccessVi: 'Celebrate nghĩa là cùng chúc mừng.',
      teachSuccessEn: 'Celebrate means to show joy for something good.',
      teachFailVi: 'Chạm chú cún đang cười và vẫy đuôi nhé.',
      teachFailEn: 'Tap the smiling puppy wagging its tail.',
      practice: {
        instructionVi: 'Chạm trái tim để chúc mừng cún ăn xong nhé.',
        instructionEn: 'Tap the heart to celebrate the finished meal.',
        successVi: 'Cún đã ăn xong, mình cùng chúc mừng bạn.',
        successEn: 'The puppy finished eating, so you celebrate together.',
        failVi: 'Chạm trái tim cạnh chú cún nhé.',
        failEn: 'Tap the heart beside the puppy.',
        targetObjectId: heartId,
        effects: [lessonEffects.sound('yay')],
        successStateChanges: [sceneStateChanges.setVariant(heroId, 'happy')],
        afterSuccessStateChanges: [sceneStateChanges.show(heroId)],
      },
    },
    {
      key: 'carry',
      meaningVi: 'mang; bưng',
      word: 'carry',
      tier: 'expanded',
      type: 'verb',
      speechPractice: 'optional',
      cueAsset: 'carry-bowl-action',
      cuePosition: rect(5, 39, 34, 27),
      cueTouchArea: rect(1, 33, 44, 39),
      teachVi: 'Chạm hình hai tay đang mang chiếc bát nhé.',
      teachEn: 'Tap the hands carrying the bowl.',
      teachSuccessVi: 'Carry nghĩa là mang hoặc bưng.',
      teachSuccessEn: 'Carry means to hold something while moving it.',
      teachFailVi: 'Chạm hình hai tay bưng bát bên trái nhé.',
      teachFailEn: 'Tap the hands holding the bowl on the left.',
      practice: {
        instructionVi: 'Chạm hình hai tay để bưng bát trống thật chắc nhé.',
        instructionEn: 'Tap the two hands to carry the empty bowl steadily.',
        successVi: 'Bé đã dùng hai tay bưng bát trống.',
        successEn: 'You carried the empty bowl with two hands.',
        failVi: 'Chạm hình hai tay đang bưng bát nhé.',
        failEn: 'Tap the two hands carrying the bowl.',
        successStateChanges: [sceneStateChanges.hide(heartId)],
      },
    },
    {
      key: 'ask-an-adult',
      meaningVi: 'hỏi người lớn',
      word: 'ask an adult',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'adult-hand-helping',
      cuePosition: rect(5, 36, 34, 27),
      cueTouchArea: rect(1, 30, 44, 39),
      teachVi: 'Chạm bàn tay người lớn đang giúp nhé.',
      teachEn: 'Tap the adult hand that is helping.',
      teachSuccessVi: 'Ask an adult nghĩa là hỏi người lớn.',
      teachSuccessEn: 'Ask an adult means to get help from a grown-up.',
      teachFailVi: 'Chạm bàn tay có áo màu xanh nhé.',
      teachFailEn: 'Tap the hand with the green sleeve.',
      practice: {
        instructionVi: 'Chạm bàn tay để nhờ người lớn giúp cất bát trống nhé.',
        instructionEn: 'Tap the hand to ask an adult to put the bowl away.',
        successVi: 'Đúng rồi, người lớn sẽ giúp cất và rửa bát.',
        successEn: 'Right, an adult can help clean and put away the bowl.',
        failVi: 'Chạm bàn tay người lớn bên trái nhé.',
        failEn: 'Tap the adult hand on the left.',
      },
    },
    {
      key: 'put-it-down',
      meaningVi: 'đặt nó xuống',
      word: 'put it down',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'put-empty-bowl-action',
      cuePosition: rect(31, 41, 37, 28),
      cueTouchArea: rect(25, 35, 49, 40),
      teachVi: 'Chạm hình đặt chiếc bát xuống nhé.',
      teachEn: 'Tap the picture putting the bowl down.',
      teachSuccessVi: 'Put it down nghĩa là đặt nó xuống.',
      teachSuccessEn: 'Put it down means to place it on a surface.',
      teachFailVi: 'Chạm hình bàn tay đang đặt bát xuống nhé.',
      teachFailEn: 'Tap the hand putting the bowl down.',
      practice: {
        instructionVi: 'Chạm chiếc bát trống để đặt xuống góc bàn nhé.',
        instructionEn: 'Tap the empty bowl to put it down on the side.',
        successVi: 'Bát trống đã được đặt xuống cho người lớn cất.',
        successEn: 'The empty bowl is down for an adult to put away.',
        failVi: 'Chạm chiếc bát trống ở giữa nhé.',
        failEn: 'Tap the empty bowl in the middle.',
        targetObjectId: storyBowlId,
        successStateChanges: [
          sceneStateChanges.setVariant(storyBowlId, 'put-away'),
        ],
        afterSuccessStateChanges: [sceneStateChanges.show(stepForwardId)],
      },
    },
    {
      key: 'step-back',
      meaningVi: 'lùi lại',
      word: 'step back',
      tier: 'challenge',
      type: 'phrase',
      cueAsset: 'step-back-action',
      cuePosition: rect(5, 35, 38, 29),
      cueTouchArea: rect(1, 29, 49, 41),
      teachVi: 'Chạm hình đôi chân đang lùi khỏi chiếc bát nhé.',
      teachEn: 'Tap the feet stepping away from the bowl.',
      teachSuccessVi: 'Step back nghĩa là lùi lại.',
      teachSuccessEn: 'Step back means to move away.',
      teachFailVi: 'Chạm hình đôi chân có mũi tên lùi nhé.',
      teachFailEn: 'Tap the feet with the arrow moving away.',
      practice: {
        instructionVi: 'Tìm hình lùi lại để người lớn cất bát nhé.',
        instructionEn:
          'Find the picture stepping back so an adult can put the bowl away.',
        successVi: 'Đúng rồi, mình lùi lại để người lớn cất bát.',
        successEn: 'Right, we step back and let an adult put the bowl away.',
        failVi: 'Tìm hình đôi chân đang rời xa chiếc bát nhé.',
        failEn: 'Find the feet moving away from the bowl.',
        kind: 'find',
        targetObjectIds: [cueId(sceneId, 'step-back'), stepForwardId],
        correctObjectIds: [cueId(sceneId, 'step-back')],
        afterSuccessStateChanges: [sceneStateChanges.hide(stepForwardId)],
        effects: [lessonEffects.sound('complete')],
      },
    },
  ];
  const vocabulary = makeBeatVocabulary(sceneId, beats);

  return {
    id: sceneId,
    titleVi: 'Cún dùng bữa',
    titleEn: 'The Puppy Eats',
    thumbnailEmoji: '🐾',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: heroId,
        assetSource: sceneImageSource(sceneId, 'puppy-waiting'),
        initialVisibility: 'hidden',
        isInteractive: false,
        position: rect(67, 42, 29, 31),
        presentation: 'cutout',
        variants: [
          objectVariant({
            id: 'waiting',
            assetSource: sceneImageSource(sceneId, 'puppy-waiting'),
          }),
          objectVariant({
            id: 'eating',
            assetSource: sceneImageSource(sceneId, 'puppy-eating'),
            position: rect(55, 48, 40, 30),
          }),
          objectVariant({
            id: 'happy',
            assetSource: sceneImageSource(sceneId, 'puppy-happy'),
          }),
        ],
      }),
      sceneObject({
        id: feedingMatId,
        assetSource: sceneImageSource(sceneId, 'feeding-mat'),
        isInteractive: true,
        position: rect(31, 63, 38, 18),
        presentation: 'cutout',
        touchArea: rect(25, 56, 50, 31),
      }),
      sceneObject({
        id: storyBowlId,
        assetSource: sceneImageSource(sceneId, 'bowl-full'),
        isInteractive: true,
        position: rect(7, 58, 25, 18),
        presentation: 'cutout',
        touchArea: rect(2, 51, 36, 31),
        variants: [
          objectVariant({
            id: 'on-mat-full',
            assetSource: sceneImageSource(sceneId, 'bowl-full'),
            position: rect(38, 62, 24, 18),
            touchArea: rect(30, 54, 40, 34),
          }),
          objectVariant({
            id: 'empty',
            assetSource: sceneImageSource(sceneId, 'bowl-empty'),
            position: rect(38, 63, 24, 17),
            touchArea: rect(32, 56, 36, 30),
          }),
          objectVariant({
            id: 'put-away',
            assetSource: sceneImageSource(sceneId, 'bowl-empty'),
            position: rect(9, 61, 24, 17),
            touchArea: rect(3, 54, 36, 30),
          }),
        ],
      }),
      sceneObject({
        id: heartId,
        assetSource: sceneImageSource(sceneId, 'heart'),
        initialVisibility: 'hidden',
        isInteractive: true,
        position: rect(70, 27, 18, 17),
        presentation: 'cutout',
        touchArea: rect(64, 21, 30, 29),
      }),
      sceneObject({
        id: stepForwardId,
        assetSource: sceneImageSource(sceneId, 'step-forward-action'),
        initialVisibility: 'hidden',
        isInteractive: true,
        learningScope: challengeScope,
        position: rect(56, 35, 38, 29),
        presentation: 'cutout',
        touchArea: rect(50, 29, 48, 41),
      }),
      ...makeBeatObjects(sceneId, beats, vocabulary),
    ],
    dropZones: [
      {
        id: feedingZoneId,
        position: rect(38, 62, 24, 18),
        touchArea: rect(30, 54, 40, 34),
      },
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        instructionVi:
          'Bát đã sẵn sàng. Mình giúp cún dùng bữa thật an toàn nhé.',
        instructionEn: 'The bowl is ready. Let us help the puppy eat safely.',
        successFeedbackVi: 'Cún đang ngồi chờ bên tấm thảm.',
        successFeedbackEn: 'The puppy is waiting beside the mat.',
        targetObjectIds: [cueId(sceneId, 'wait'), storyBowlId],
        type: 'intro',
      }),
      ...makeBeatSteps(sceneId, beats, vocabulary),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Bé đã giúp cún dùng bữa vui vẻ và an toàn.',
      messageEn: 'You helped the puppy enjoy its meal safely.',
    },
  };
}

export const feedThePuppyLesson: Lesson = {
  id: lessonId,
  themeId: 'nhung-nguoi-ban-dong-vat',
  titleVi: 'Cho cún ăn',
  titleEn: 'Feed the Puppy',
  descriptionVi:
    'Bé làm quen với chú cún, chuẩn bị bữa ăn và học cách cho cún ăn an toàn.',
  descriptionEn:
    'Meet a puppy, prepare its meal, and learn how to feed it safely.',
  thumbnailEmoji: '🐶',
  ageRange: { min: 3, max: 8, label: '3-8 tuổi · Làm quen' },
  scenes: [
    makeMeetThePuppyScene(),
    makeFillTheBowlScene(),
    makePuppyEatsScene(),
  ],
  reviewGame: {
    id: `${lessonId}-review`,
    type: 'random',
    titleVi: 'Bữa ăn của cún',
    config: {
      vocabularyIds: [
        'vocab-feed-the-puppy-meet-the-puppy-puppy',
        'vocab-feed-the-puppy-fill-the-bowl-bowl',
        'vocab-feed-the-puppy-fill-the-bowl-food',
        'vocab-feed-the-puppy-puppy-eats-eat',
        'vocab-feed-the-puppy-fill-the-bowl-full',
        'vocab-feed-the-puppy-puppy-eats-step-back',
      ],
    },
  },
  metadata: {
    parentTipVi:
      'Ba mẹ chọn thức ăn và khẩu phần phù hợp, nhắc bé luôn hỏi người lớn, đặt bát xuống rồi lùi lại, và không chạm vào thú cưng khi thú cưng đang ăn.',
  },
};
