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

const lessonId = 'care-for-the-rabbit';
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

function makePrepareTheHayScene(): Scene {
  const sceneId = 'prepare-the-hay';
  const heroId = `${sceneId}-hero`;
  const hayId = `${sceneId}-hay-bundle`;
  const hayRackId = `${sceneId}-hay-rack`;
  const hutchId = `${sceneId}-hutch`;

  const beats: VocabularyBeat[] = [
    {
      key: 'rabbit',
      meaningVi: 'chú thỏ con',
      word: 'rabbit',
      cueObjectId: heroId,
      teachVi: 'Chạm bạn thỏ trắng nhé.',
      teachEn: 'Tap the white rabbit.',
      teachSuccessEn: 'This is a rabbit.',
      teachFailVi: 'Chạm bạn thỏ có đôi tai dài nhé.',
      teachFailEn: 'Tap the rabbit with long ears.',
      practice: {
        instructionVi: 'Chạm thỏ để bạn vẫy tai chào bé nhé.',
        instructionEn: 'Tap the rabbit so it wiggles its ears.',
        successVi: 'Thỏ vẫy nhẹ đôi tai dài chào bé.',
        successEn: 'The rabbit gently wiggles its ears.',
        failVi: 'Chạm bạn thỏ trắng nhé.',
        failEn: 'Tap the white rabbit.',
        targetObjectId: heroId,
      },
    },
    {
      key: 'hay',
      meaningVi: 'cỏ khô',
      word: 'hay',
      cueObjectId: hayId,
      teachVi: 'Chạm búi cỏ khô thơm nhé.',
      teachEn: 'Tap the bunch of fresh hay.',
      teachSuccessEn: 'This is hay.',
      teachFailVi: 'Chạm búi cỏ khô màu xanh ngà nhé.',
      teachFailEn: 'Tap the bunch of light green hay.',
      practice: {
        instructionVi: 'Chạm cỏ khô để chuẩn bị cho vào máng nhé.',
        instructionEn: 'Tap the hay to prepare it for the rack.',
        successVi: 'Búi cỏ khô đã sẵn sàng.',
        successEn: 'The hay is ready for the rack.',
        failVi: 'Chạm búi cỏ khô nhé.',
        failEn: 'Tap the bunch of hay.',
        targetObjectId: hayId,
        successStateChanges: [sceneStateChanges.show(hayRackId)],
      },
    },
    {
      key: 'hungry',
      meaningVi: 'đói',
      word: 'hungry',
      type: 'adjective',
      cueObjectId: heroId,
      teachVi: 'Chạm bạn thỏ đang đói bụng nhé.',
      teachEn: 'Tap the hungry rabbit.',
      teachSuccessEn: 'Hungry means wanting food.',
      teachFailVi: 'Chạm chú thỏ đang chờ ăn nhé.',
      teachFailEn: 'Tap the rabbit waiting for food.',
      practice: {
        instructionVi: 'Chạm thỏ để bạn nhìn về phía máng cỏ nhé.',
        instructionEn: 'Tap the rabbit so it looks at the rack.',
        successVi: 'Thỏ đang đói bụng và nhìn máng cỏ đợi thức ăn.',
        successEn: 'The hungry rabbit looks at the rack waiting for food.',
        failVi: 'Chạm bạn thỏ trắng nhé.',
        failEn: 'Tap the white rabbit.',
        targetObjectId: heroId,
        successStateChanges: [
          sceneStateChanges.setVariant(heroId, 'looking-at-rack'),
        ],
      },
    },
    {
      key: 'hutch',
      meaningVi: 'chuồng thỏ',
      word: 'hutch',
      tier: 'expanded',
      cueObjectId: hutchId,
      revealStateChanges: [sceneStateChanges.show(hutchId)],
      teachVi: 'Chạm chuồng thỏ sạch sẽ nhé.',
      teachEn: 'Tap the clean rabbit hutch.',
      teachSuccessEn: 'A hutch is a home for a rabbit.',
      teachFailVi: 'Chạm chuồng thỏ bằng gỗ nhé.',
      teachFailEn: 'Tap the wooden rabbit hutch.',
      practice: {
        instructionVi: 'Chạm chuồng thỏ để mở cửa nhé.',
        instructionEn: 'Tap the hutch to open the door.',
        successVi: 'Chuồng thỏ rất sạch sẽ và thoáng mát.',
        successEn: 'The hutch is clean and airy.',
        failVi: 'Chạm chuồng thỏ nhé.',
        failEn: 'Tap the rabbit hutch.',
        targetObjectId: hutchId,
        afterSuccessStateChanges: [sceneStateChanges.hide(hutchId)],
      },
    },
    {
      key: 'hay-rack',
      meaningVi: 'máng cỏ',
      word: 'hay rack',
      tier: 'expanded',
      speechPractice: 'optional',
      cueObjectId: hayRackId,
      teachVi: 'Chạm chiếc máng cỏ nhé.',
      teachEn: 'Tap the hay rack.',
      teachSuccessEn: 'A hay rack holds hay for the rabbit.',
      teachFailVi: 'Chạm chiếc máng gỗ trên vách nhé.',
      teachFailEn: 'Tap the wooden rack on the wall.',
      practice: {
        instructionVi: 'Chạm máng để gài chắc chắn nhé.',
        instructionEn: 'Tap the rack so it is fastened safely.',
        successVi: 'Máng cỏ đã được gắn ngay ngắn.',
        successEn: 'The hay rack is securely in place.',
        failVi: 'Chạm chiếc máng cỏ nhé.',
        failEn: 'Tap the hay rack.',
        targetObjectId: hayRackId,
      },
    },
    {
      key: 'chew',
      meaningVi: 'nhai gặm',
      word: 'chew',
      tier: 'expanded',
      type: 'verb',
      speechPractice: 'optional',
      cueAsset: 'rabbit-chewing-closeup',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      revealStateChanges: [sceneStateChanges.hide(heroId)],
      teachVi: 'Chạm miệng thỏ đang nhai cỏ nhé.',
      teachEn: 'Tap the rabbit mouth chewing hay.',
      teachSuccessEn: 'Chew means bite food again and again.',
      teachFailVi: 'Chạm miệng thỏ có cọng cỏ nhé.',
      teachFailEn: 'Tap the rabbit mouth with a piece of hay.',
      practice: {
        instructionVi: 'Chạm thỏ để bạn gặm cỏ giòn tan nhé.',
        instructionEn: 'Tap the rabbit to watch it chew crisp hay.',
        successVi: 'Thỏ nhai cỏ giòn tan ngon lành.',
        successEn: 'The rabbit chews the crisp hay happily.',
        failVi: 'Chạm bạn thỏ bên máng cỏ nhé.',
        failEn: 'Tap the rabbit beside the hay rack.',
        successStateChanges: [
          sceneStateChanges.show(heroId),
          sceneStateChanges.setVariant(heroId, 'chewing'),
        ],
      },
    },
    {
      key: 'fresh-hay',
      meaningVi: 'cỏ khô tươi ngon',
      word: 'fresh hay',
      tier: 'challenge',
      type: 'phrase',
      cueAsset: 'fresh-hay-pile',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm phần cỏ khô mới lấy nhé.',
      teachEn: 'Tap the pile of fresh hay.',
      teachSuccessEn: 'Fresh hay is clean and smells good.',
      teachFailVi: 'Chạm búi cỏ xanh thơm nhé.',
      teachFailEn: 'Tap the sweet-smelling green hay.',
      practice: {
        instructionVi: 'Chạm cỏ tươi để chuẩn bị cho thỏ nhé.',
        instructionEn: 'Tap the fresh hay to prepare it for the rabbit.',
        successVi: 'Cỏ khô tươi rất tốt cho răng của thỏ.',
        successEn: 'Fresh hay is great for the rabbit’s teeth.',
        failVi: 'Chạm phần cỏ khô tươi nhé.',
        failEn: 'Tap the fresh hay pile.',
      },
    },
    {
      key: 'fill-the-rack',
      meaningVi: 'bỏ đầy máng cỏ',
      word: 'fill the rack',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'fill-hay-rack-action',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm tay cho đầy cỏ vào máng nhé.',
      teachEn: 'Tap the hand filling the rack with hay.',
      teachSuccessEn: 'Fill the rack means put plenty of hay inside.',
      teachFailVi: 'Chạm tay đang gài cỏ vào máng nhé.',
      teachFailEn: 'Tap the hand putting hay into the rack.',
      practice: {
        instructionVi: 'Chạm máng để cho đầy cỏ khô nhé.',
        instructionEn: 'Tap the rack to fill it with hay.',
        successVi: 'Máng cỏ đã đầy ắp cỏ khô thơm ngon.',
        successEn: 'The rack is filled with sweet hay.',
        failVi: 'Chạm chiếc máng cỏ nhé.',
        failEn: 'Tap the hay rack.',
        targetObjectId: hayRackId,
        successStateChanges: [sceneStateChanges.setVariant(hayRackId, 'full')],
      },
    },
    {
      key: 'gentle-rabbit',
      meaningVi: 'chú thỏ hiền ngoan',
      word: 'gentle rabbit',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueObjectId: heroId,
      teachVi: 'Chạm chú thỏ hiền đang đứng ngoan nhé.',
      teachEn: 'Tap the gentle rabbit standing quietly.',
      teachSuccessEn: 'A gentle rabbit is calm and sweet.',
      teachFailVi: 'Chạm bạn thỏ đứng yên bên máng nhé.',
      teachFailEn: 'Tap the quiet rabbit beside the rack.',
      practice: {
        instructionVi: 'Chạm thỏ để khen bạn ngoan nhé.',
        instructionEn: 'Tap the rabbit to praise how calm it is.',
        successVi: 'Thỏ đứng ngoan ngoãn bên máng cỏ đầy.',
        successEn: 'The gentle rabbit stays calm by the full rack.',
        failVi: 'Chạm bạn thỏ hiền nhé.',
        failEn: 'Tap the gentle rabbit.',
        targetObjectId: heroId,
        successStateChanges: [
          sceneStateChanges.setVariant(heroId, 'standing-calm'),
        ],
        effects: [lessonEffects.sound('correct')],
      },
    },
  ];
  const vocabulary = makeBeatVocabulary(sceneId, beats);

  return {
    id: sceneId,
    titleVi: 'Chuẩn bị cỏ khô',
    titleEn: 'Prepare the Hay',
    thumbnailEmoji: '🌾',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: heroId,
        assetSource: sceneImageSource(sceneId, 'rabbit-sitting'),
        isInteractive: true,
        position: rect(54, 43, 40, 39),
        presentation: 'cutout',
        touchArea: rect(47, 36, 52, 50),
        variants: [
          objectVariant({
            id: 'looking-at-rack',
            assetSource: sceneImageSource(sceneId, 'rabbit-looking-rack'),
          }),
          objectVariant({
            id: 'chewing',
            assetSource: sceneImageSource(sceneId, 'rabbit-chewing-hay'),
          }),
          objectVariant({
            id: 'standing-calm',
            assetSource: sceneImageSource(sceneId, 'rabbit-standing-calm'),
          }),
        ],
      }),
      sceneObject({
        id: hayId,
        assetSource: sceneImageSource(sceneId, 'hay-bundle'),
        isInteractive: true,
        position: rect(8, 64, 30, 18),
        presentation: 'cutout',
        touchArea: rect(2, 57, 42, 32),
      }),
      sceneObject({
        id: hayRackId,
        assetSource: sceneImageSource(sceneId, 'hay-rack-empty'),
        initialVisibility: 'hidden',
        isInteractive: true,
        position: rect(35, 48, 25, 24),
        presentation: 'cutout',
        touchArea: rect(28, 41, 39, 38),
        variants: [
          objectVariant({
            id: 'full',
            assetSource: sceneImageSource(sceneId, 'hay-rack-full'),
          }),
        ],
      }),
      sceneObject({
        id: hutchId,
        assetSource: sceneImageSource(sceneId, 'rabbit-hutch'),
        initialVisibility: 'hidden',
        isInteractive: true,
        learningScope: expandedScope,
        position: rect(6, 42, 38, 38),
        presentation: 'cutout',
        touchArea: rect(0, 35, 50, 52),
      }),
      ...makeBeatObjects(sceneId, beats, vocabulary),
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        type: 'intro',
        instructionVi: 'Thỏ con đang đói bụng. Mình chuẩn bị cỏ khô thơm nhé.',
        instructionEn: 'The rabbit is hungry. Let’s prepare fresh sweet hay.',
        successFeedbackVi: 'Thỏ đang ngồi ngoan và đợi bé giúp.',
        successFeedbackEn: 'The rabbit is waiting calmly for help.',
        targetObjectIds: [heroId, hayId],
      }),
      ...makeBeatSteps(sceneId, beats, vocabulary),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Máng cỏ đã đầy ắp và bạn thỏ được ăn ngon lành.',
      messageEn: 'The hay rack is full and the rabbit enjoyed its meal.',
    },
  };
}

function makeFillTheWaterScene(): Scene {
  const sceneId = 'fill-the-water';
  const heroId = `${sceneId}-hero`;
  const pitcherId = `${sceneId}-pitcher`;
  const bowlId = `${sceneId}-bowl`;

  const beats: VocabularyBeat[] = [
    {
      key: 'water',
      meaningVi: 'nước',
      word: 'water',
      cueObjectId: pitcherId,
      teachVi: 'Chạm bình nước sạch nhé.',
      teachEn: 'Tap the clean water pitcher.',
      teachSuccessEn: 'This is water.',
      teachFailVi: 'Chạm bình nước trong bên trái nhé.',
      teachFailEn: 'Tap the pitcher of clear water on the left.',
      practice: {
        instructionVi: 'Chạm bát để rót nước sạch vào nhé.',
        instructionEn: 'Tap the bowl to pour clean water in.',
        successVi: 'Bát đã có nước trong veo cho thỏ.',
        successEn: 'The bowl has clean water for the rabbit.',
        failVi: 'Chạm chiếc bát nhỏ nhé.',
        failEn: 'Tap the small bowl.',
        targetObjectId: bowlId,
        successStateChanges: [sceneStateChanges.setVariant(bowlId, 'filled')],
      },
    },
    {
      key: 'bowl',
      meaningVi: 'chiếc bát',
      word: 'bowl',
      cueObjectId: bowlId,
      teachVi: 'Chạm chiếc bát nhỏ nhé.',
      teachEn: 'Tap the small bowl.',
      teachSuccessEn: 'This is a bowl.',
      teachFailVi: 'Chạm chiếc bát màu xanh nhé.',
      teachFailEn: 'Tap the small blue bowl.',
      practice: {
        instructionVi: 'Chạm bát để đặt ngay ngắn nhé.',
        instructionEn: 'Tap the bowl to place it neatly.',
        successVi: 'Bát nước đã đặt ngay ngắn trên thảm.',
        successEn: 'The water bowl is neatly on the mat.',
        failVi: 'Chạm chiếc bát nhỏ nhé.',
        failEn: 'Tap the small bowl.',
        targetObjectId: bowlId,
      },
    },
    {
      key: 'drink',
      meaningVi: 'uống nước',
      word: 'drink',
      type: 'verb',
      cueAsset: 'drink-water-action',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      revealStateChanges: [
        sceneStateChanges.hide(heroId),
        sceneStateChanges.hide(bowlId),
      ],
      teachVi: 'Chạm hình thỏ uống nước nhé.',
      teachEn: 'Tap the rabbit drinking water.',
      teachSuccessEn: 'Drink means take water into the mouth.',
      teachFailVi: 'Chạm bạn thỏ cúi đầu uống nước nhé.',
      teachFailEn: 'Tap the rabbit drinking from the bowl.',
      practice: {
        instructionVi: 'Chạm thỏ để bạn uống nước mát nhé.',
        instructionEn: 'Tap the rabbit so it drinks cool water.',
        successVi: 'Thỏ đang uống từng ngụm nước mát lành.',
        successEn: 'The rabbit is sipping cool water.',
        failVi: 'Chạm bạn thỏ cạnh bát nước nhé.',
        failEn: 'Tap the rabbit beside the water bowl.',
        successStateChanges: [
          sceneStateChanges.show(heroId),
          sceneStateChanges.setVariant(heroId, 'drinking'),
          sceneStateChanges.show(bowlId),
        ],
      },
    },
    {
      key: 'empty',
      meaningVi: 'cạn nước',
      word: 'empty',
      tier: 'expanded',
      type: 'adjective',
      cueObjectId: bowlId,
      revealStateChanges: [sceneStateChanges.setVariant(bowlId, 'empty')],
      teachVi: 'Chạm chiếc bát cạn nước nhé.',
      teachEn: 'Tap the empty bowl.',
      teachSuccessEn: 'Empty means there is nothing inside.',
      teachFailVi: 'Chạm chiếc bát trống chưa có nước nhé.',
      teachFailEn: 'Tap the bowl with no water inside.',
      practice: {
        instructionVi: 'Chạm bát trống để thêm nước mới nhé.',
        instructionEn: 'Tap the empty bowl to add fresh water.',
        successVi: 'Bát cạn cần được rửa và thêm nước mới.',
        successEn: 'The empty bowl needs fresh water.',
        failVi: 'Chạm chiếc bát trống nhé.',
        failEn: 'Tap the empty bowl.',
        targetObjectId: bowlId,
        successStateChanges: [sceneStateChanges.setVariant(bowlId, 'filled')],
      },
    },
    {
      key: 'clean-water',
      meaningVi: 'nước sạch',
      word: 'clean water',
      tier: 'expanded',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'clean-water-stream',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm dòng nước sạch trong veo nhé.',
      teachEn: 'Tap the stream of clean water.',
      teachSuccessEn: 'Clean water is fresh and clear.',
      teachFailVi: 'Chạm dòng nước sạch màu xanh nhé.',
      teachFailEn: 'Tap the clear blue water.',
      practice: {
        instructionVi: 'Chạm bát để rót đầy nước sạch nhé.',
        instructionEn: 'Tap the bowl to fill it with clean water.',
        successVi: 'Nước sạch mát lành đã đầy bát.',
        successEn: 'The bowl is full of fresh clean water.',
        failVi: 'Chạm chiếc bát nước nhé.',
        failEn: 'Tap the water bowl.',
        targetObjectId: bowlId,
      },
    },
    {
      key: 'thirsty',
      meaningVi: 'khát nước',
      word: 'thirsty',
      tier: 'expanded',
      type: 'adjective',
      speechPractice: 'optional',
      cueObjectId: heroId,
      teachVi: 'Chạm bạn thỏ đang khát nhé.',
      teachEn: 'Tap the thirsty rabbit.',
      teachSuccessEn: 'Thirsty means needing water to drink.',
      teachFailVi: 'Chạm bạn thỏ đang nhìn bát nước nhé.',
      teachFailEn: 'Tap the rabbit looking at the bowl.',
      practice: {
        instructionVi: 'Chạm thỏ để đưa bát nước lại gần nhé.',
        instructionEn: 'Tap the rabbit to bring the water closer.',
        successVi: 'Thỏ rất thích nước mát sạch.',
        successEn: 'The thirsty rabbit is glad to have water.',
        failVi: 'Chạm bạn thỏ trắng nhé.',
        failEn: 'Tap the white rabbit.',
        targetObjectId: heroId,
      },
    },
    {
      key: 'water-bowl',
      meaningVi: 'bát nước sạch',
      word: 'water bowl',
      tier: 'challenge',
      type: 'phrase',
      cueObjectId: bowlId,
      teachVi: 'Chạm chiếc bát nước sạch nhé.',
      teachEn: 'Tap the clean water bowl.',
      teachSuccessEn: 'A water bowl holds water for pets to drink.',
      teachFailVi: 'Chạm chiếc bát có đầy nước nhé.',
      teachFailEn: 'Tap the bowl full of water.',
      practice: {
        instructionVi: 'Chạm bát nước để kiểm tra thật sạch nhé.',
        instructionEn: 'Tap the water bowl to make sure it is clean.',
        successVi: 'Bát nước rất sạch và đầy ắp.',
        successEn: 'The water bowl is clean and full.',
        failVi: 'Chạm chiếc bát nước nhé.',
        failEn: 'Tap the water bowl.',
        targetObjectId: bowlId,
      },
    },
    {
      key: 'put-it-down',
      meaningVi: 'đặt bát xuống',
      word: 'put it down',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'put-bowl-down-action',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm tay đặt bát nước xuống nhé.',
      teachEn: 'Tap the hands putting the bowl down.',
      teachSuccessEn: 'Put it down means place something gently on the floor.',
      teachFailVi: 'Chạm hai tay đang đặt bát nhé.',
      teachFailEn: 'Tap the hands placing the bowl.',
      practice: {
        instructionVi: 'Chạm góc chuồng để đặt bát vững vàng nhé.',
        instructionEn: 'Tap the corner to place the bowl safely.',
        successVi: 'Bát nước đã đặt vững vàng, không bị đổ.',
        successEn: 'The bowl is placed safely without spilling.',
        failVi: 'Chạm vị trí đặt bát nhé.',
        failEn: 'Tap where the bowl goes.',
        targetObjectId: bowlId,
        successStateChanges: [sceneStateChanges.setVariant(bowlId, 'placed')],
      },
    },
    {
      key: 'rabbit-drinks',
      meaningVi: 'thỏ uống nước',
      word: 'rabbit drinks',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueObjectId: heroId,
      teachVi: 'Chạm bạn thỏ đang uống nước nhé.',
      teachEn: 'Tap the rabbit drinking water.',
      teachSuccessEn: 'The rabbit drinks when it is thirsty.',
      teachFailVi: 'Chạm chú thỏ cúi bên bát nhé.',
      teachFailEn: 'Tap the rabbit leaning over the bowl.',
      practice: {
        instructionVi: 'Chạm thỏ để bạn ngẩng đầu vui vẻ nhé.',
        instructionEn: 'Tap the rabbit as it finishes drinking.',
        successVi: 'Thỏ đã uống no nước và rất sảng khoái.',
        successEn: 'The rabbit finished drinking and feels refreshed.',
        failVi: 'Chạm bạn thỏ trắng nhé.',
        failEn: 'Tap the white rabbit.',
        targetObjectId: heroId,
        successStateChanges: [
          sceneStateChanges.setVariant(heroId, 'refreshed'),
        ],
        effects: [lessonEffects.sound('correct')],
      },
    },
  ];
  const vocabulary = makeBeatVocabulary(sceneId, beats);

  return {
    id: sceneId,
    titleVi: 'Thêm nước sạch',
    titleEn: 'Fill the Water',
    thumbnailEmoji: '💧',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: heroId,
        assetSource: sceneImageSource(sceneId, 'rabbit-thirsty'),
        isInteractive: true,
        position: rect(54, 43, 40, 39),
        presentation: 'cutout',
        touchArea: rect(47, 36, 52, 50),
        variants: [
          objectVariant({
            id: 'drinking',
            assetSource: sceneImageSource(sceneId, 'rabbit-drinking-water'),
          }),
          objectVariant({
            id: 'refreshed',
            assetSource: sceneImageSource(sceneId, 'rabbit-refreshed'),
          }),
        ],
      }),
      sceneObject({
        id: pitcherId,
        assetSource: sceneImageSource(sceneId, 'water-pitcher'),
        isInteractive: true,
        position: rect(8, 54, 24, 27),
        presentation: 'cutout',
        touchArea: rect(2, 47, 36, 40),
      }),
      sceneObject({
        id: bowlId,
        assetSource: sceneImageSource(sceneId, 'bowl-empty'),
        isInteractive: true,
        position: rect(35, 67, 28, 16),
        presentation: 'cutout',
        touchArea: rect(28, 60, 42, 30),
        variants: [
          objectVariant({
            id: 'filled',
            assetSource: sceneImageSource(sceneId, 'bowl-filled'),
          }),
          objectVariant({
            id: 'empty',
            assetSource: sceneImageSource(sceneId, 'bowl-empty'),
          }),
          objectVariant({
            id: 'placed',
            assetSource: sceneImageSource(sceneId, 'bowl-filled'),
          }),
        ],
      }),
      ...makeBeatObjects(sceneId, beats, vocabulary),
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        type: 'intro',
        instructionVi:
          'Thỏ đang khát nước. Mình rót nước sạch vào bát cho bạn nhé.',
        instructionEn:
          'The rabbit is thirsty. Let’s pour clean water into the bowl.',
        successFeedbackVi: 'Bát nước sạch mát đã sẵn sàng cho thỏ.',
        successFeedbackEn: 'The clean cool water is ready for the rabbit.',
        targetObjectIds: [heroId, pitcherId, bowlId],
      }),
      ...makeBeatSteps(sceneId, beats, vocabulary),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Thỏ đã được uống nước sạch mát lành.',
      messageEn: 'The rabbit enjoyed fresh and cool clean water.',
    },
  };
}

function makeRabbitSnackAndHopScene(): Scene {
  const sceneId = 'rabbit-snack-and-hop';
  const heroId = `${sceneId}-hero`;
  const carrotId = `${sceneId}-carrot`;

  const beats: VocabularyBeat[] = [
    {
      key: 'carrot',
      meaningVi: 'cà rốt',
      word: 'carrot',
      cueObjectId: carrotId,
      teachVi: 'Chạm miếng cà rốt cam nhé.',
      teachEn: 'Tap the orange carrot piece.',
      teachSuccessEn: 'This is a carrot.',
      teachFailVi: 'Chạm miếng cà rốt nhỏ bên trái nhé.',
      teachFailEn: 'Tap the small carrot piece on the left.',
      practice: {
        instructionVi: 'Chạm cà rốt để chuẩn bị đưa cho thỏ nhé.',
        instructionEn: 'Tap the carrot to offer it to the rabbit.',
        successVi: 'Miếng cà rốt nhỏ đã sẵn sàng.',
        successEn: 'The small carrot treat is ready.',
        failVi: 'Chạm miếng cà rốt cam nhé.',
        failEn: 'Tap the orange carrot.',
        targetObjectId: carrotId,
        successStateChanges: [
          sceneStateChanges.setVariant(carrotId, 'offered'),
          sceneStateChanges.setVariant(heroId, 'nibbling'),
        ],
      },
    },
    {
      key: 'treat',
      meaningVi: 'món thưởng nhỏ',
      word: 'treat',
      cueAsset: 'treat-plate',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm đĩa món thưởng nhỏ nhé.',
      teachEn: 'Tap the plate of small treats.',
      teachSuccessEn: 'A treat is a special snack for pets.',
      teachFailVi: 'Chạm chiếc đĩa có mẩu nhỏ nhé.',
      teachFailEn: 'Tap the small plate with a treat.',
      practice: {
        instructionVi: 'Chạm thỏ để bạn gặm món thưởng nhé.',
        instructionEn: 'Tap the rabbit to let it nibble the treat.',
        successVi: 'Thỏ gặm mẩu cà rốt nhỏ rất thích thú.',
        successEn: 'The rabbit enjoys nibbling the small treat.',
        failVi: 'Chạm bạn thỏ đang ăn nhé.',
        failEn: 'Tap the rabbit eating the treat.',
        targetObjectId: heroId,
        successStateChanges: [sceneStateChanges.setVariant(carrotId, 'eaten')],
      },
    },
    {
      key: 'hop',
      meaningVi: 'nhảy nhót',
      word: 'hop',
      type: 'verb',
      cueAsset: 'rabbit-hop-action',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      revealStateChanges: [sceneStateChanges.hide(heroId)],
      teachVi: 'Chạm bạn thỏ đang nhảy nhé.',
      teachEn: 'Tap the rabbit hopping.',
      teachSuccessEn: 'Hop means jump with light springy steps.',
      teachFailVi: 'Chạm bạn thỏ bật nhảy nhé.',
      teachFailEn: 'Tap the rabbit jumping in the air.',
      practice: {
        instructionVi: 'Chạm thỏ để xem bạn nhảy vui vẻ nhé.',
        instructionEn: 'Tap the rabbit to watch it hop happily.',
        successVi: 'Thỏ bật nhảy tung tăng vui sướng.',
        successEn: 'The rabbit hops around with joy.',
        failVi: 'Chạm bạn thỏ trắng nhé.',
        failEn: 'Tap the white rabbit.',
        successStateChanges: [
          sceneStateChanges.show(heroId),
          sceneStateChanges.setVariant(heroId, 'hopping'),
        ],
      },
    },
    {
      key: 'ears',
      meaningVi: 'đôi tai thỏ',
      word: 'ears',
      tier: 'expanded',
      cueAsset: 'rabbit-ears-closeup',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm đôi tai dài của thỏ nhé.',
      teachEn: 'Tap the long rabbit ears.',
      teachSuccessEn: 'These are long soft rabbit ears.',
      teachFailVi: 'Chạm hai chiếc tai vểnh cao nhé.',
      teachFailEn: 'Tap the two upright ears.',
      practice: {
        instructionVi: 'Chạm thỏ để nhìn tai ngọ nguậy nhé.',
        instructionEn: 'Tap the rabbit to see its ears wiggle.',
        successVi: 'Đôi tai thỏ ngọ nguậy rung rinh vui thích.',
        successEn: 'The rabbit ears wiggle with happiness.',
        failVi: 'Chạm bạn thỏ trắng nhé.',
        failEn: 'Tap the white rabbit.',
        targetObjectId: heroId,
      },
    },
    {
      key: 'soft',
      meaningVi: 'mềm mại',
      word: 'soft',
      tier: 'expanded',
      type: 'adjective',
      speechPractice: 'optional',
      cueAsset: 'soft-rabbit-fur',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm lớp lông trắng mềm nhé.',
      teachEn: 'Tap the soft white fur.',
      teachSuccessEn: 'Soft fur feels gentle and fluffy.',
      teachFailVi: 'Chạm mảng lông trắng mịn nhé.',
      teachFailEn: 'Tap the fluffy white fur.',
      practice: {
        instructionVi: 'Chạm lưng thỏ thật nhẹ nhàng nhé.',
        instructionEn: 'Tap the rabbit back very gently.',
        successVi: 'Lớp lông của bạn thỏ rất mềm và ấm.',
        successEn: 'The rabbit’s fur is warm and soft.',
        failVi: 'Chạm bạn thỏ trắng nhé.',
        failEn: 'Tap the white rabbit.',
        targetObjectId: heroId,
        successStateChanges: [sceneStateChanges.setVariant(heroId, 'pet-soft')],
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
      teachVi: 'Chạm bạn thỏ đang vui nhé.',
      teachEn: 'Tap the happy rabbit.',
      teachSuccessEn: 'Happy means full of joy.',
      teachFailVi: 'Chạm bạn thỏ đang mỉm cười nhé.',
      teachFailEn: 'Tap the smiling rabbit.',
      practice: {
        instructionVi: 'Chạm thỏ để bạn vui cùng bé nhé.',
        instructionEn: 'Tap the rabbit to share the joy.',
        successVi: 'Thỏ rất vui vì được chăm sóc chu đáo.',
        successEn: 'The rabbit is happy from your gentle care.',
        failVi: 'Chạm bạn thỏ trắng nhé.',
        failEn: 'Tap the white rabbit.',
        targetObjectId: heroId,
        successStateChanges: [sceneStateChanges.setVariant(heroId, 'happy')],
      },
    },
    {
      key: 'feed-the-rabbit',
      meaningVi: 'cho thỏ ăn',
      word: 'feed the rabbit',
      tier: 'challenge',
      type: 'phrase',
      cueAsset: 'feed-rabbit-action',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm tay cho thỏ ăn nhé.',
      teachEn: 'Tap the hand feeding the rabbit.',
      teachSuccessEn: 'Feed the rabbit means give food to the rabbit.',
      teachFailVi: 'Chạm bàn tay đang cho thỏ ăn nhé.',
      teachFailEn: 'Tap the hand holding the carrot treat.',
      practice: {
        instructionVi: 'Chạm thỏ để hoàn thành bữa ăn nhé.',
        instructionEn: 'Tap the rabbit to finish feeding.',
        successVi: 'Bé đã cho thỏ ăn rất ngoan và đúng cách.',
        successEn: 'You fed the rabbit gently and safely.',
        failVi: 'Chạm bạn thỏ trắng nhé.',
        failEn: 'Tap the white rabbit.',
        targetObjectId: heroId,
      },
    },
    {
      key: 'pet-gently',
      meaningVi: 'vuốt ve nhẹ nhàng',
      word: 'pet gently',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'pet-rabbit-gently',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm tay vuốt ve thỏ nhẹ nhàng nhé.',
      teachEn: 'Tap the hand petting the rabbit gently.',
      teachSuccessEn: 'Pet gently means stroke softly with care.',
      teachFailVi: 'Chạm bàn tay vuốt ve lưng thỏ nhé.',
      teachFailEn: 'Tap the hand stroking the rabbit softly.',
      practice: {
        instructionVi: 'Chạm thỏ để vuốt theo chiều lông nhé.',
        instructionEn: 'Tap the rabbit to pet along its fur.',
        successVi: 'Thỏ nằm yên thích thú khi được vuốt nhẹ.',
        successEn: 'The rabbit rests calmly when petted gently.',
        failVi: 'Chạm bạn thỏ trắng nhé.',
        failEn: 'Tap the white rabbit.',
        targetObjectId: heroId,
      },
    },
    {
      key: 'happy-rabbit',
      meaningVi: 'chú thỏ vui sướng',
      word: 'happy rabbit',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueObjectId: heroId,
      teachVi: 'Chạm chú thỏ vui sướng nhé.',
      teachEn: 'Tap the happy rabbit jumping in circles.',
      teachSuccessEn: 'A happy rabbit jumps and plays with joy.',
      teachFailVi: 'Chạm bạn thỏ vui sướng nhảy tung tăng nhé.',
      teachFailEn: 'Tap the rabbit hopping with joy.',
      practice: {
        instructionVi: 'Chạm thỏ và nhớ rửa tay nhé.',
        instructionEn: 'Tap the rabbit and remember to wash your hands.',
        successVi: 'Thỏ nhảy vui sướng và bé nhớ rửa tay sạch sẽ.',
        successEn:
          'The happy rabbit hops and you remember to wash your hands.',
        failVi: 'Chạm bạn thỏ vui vẻ nhé.',
        failEn: 'Tap the happy rabbit.',
        targetObjectId: heroId,
        successStateChanges: [sceneStateChanges.setVariant(heroId, 'hopping')],
        effects: [lessonEffects.sound('complete')],
      },
    },
  ];
  const vocabulary = makeBeatVocabulary(sceneId, beats);

  return {
    id: sceneId,
    titleVi: 'Món ăn nhỏ và thỏ nhảy vui',
    titleEn: 'Rabbit Snack and Hop',
    thumbnailEmoji: '🥕',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: heroId,
        assetSource: sceneImageSource(sceneId, 'rabbit-curious'),
        isInteractive: true,
        position: rect(54, 43, 40, 39),
        presentation: 'cutout',
        touchArea: rect(47, 36, 52, 50),
        variants: [
          objectVariant({
            id: 'nibbling',
            assetSource: sceneImageSource(sceneId, 'rabbit-nibbling-carrot'),
          }),
          objectVariant({
            id: 'pet-soft',
            assetSource: sceneImageSource(sceneId, 'rabbit-pet-soft'),
          }),
          objectVariant({
            id: 'happy',
            assetSource: sceneImageSource(sceneId, 'rabbit-happy'),
          }),
          objectVariant({
            id: 'hopping',
            assetSource: sceneImageSource(sceneId, 'rabbit-hopping-binky'),
          }),
        ],
      }),
      sceneObject({
        id: carrotId,
        assetSource: sceneImageSource(sceneId, 'carrot-slice'),
        isInteractive: true,
        position: rect(9, 61, 26, 20),
        presentation: 'cutout',
        touchArea: rect(3, 54, 38, 34),
        variants: [
          objectVariant({
            id: 'offered',
            assetSource: sceneImageSource(sceneId, 'carrot-offered'),
            position: rect(38, 56, 22, 18),
          }),
          objectVariant({
            id: 'eaten',
            assetSource: sceneImageSource(sceneId, 'carrot-crumb'),
            position: rect(42, 65, 12, 10),
          }),
        ],
      }),
      ...makeBeatObjects(sceneId, beats, vocabulary),
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        type: 'intro',
        instructionVi:
          'Người lớn đã chuẩn bị mẩu cà rốt nhỏ. Mình thưởng cho thỏ nhé.',
        instructionEn:
          'An adult prepared a small carrot piece. Let’s offer it to the rabbit.',
        successFeedbackVi: 'Thỏ đang háo hức chờ món thưởng nhỏ.',
        successFeedbackEn: 'The rabbit is eagerly waiting for the treat.',
        targetObjectIds: [heroId, carrotId],
      }),
      ...makeBeatSteps(sceneId, beats, vocabulary),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Thỏ đã ăn ngon và nhảy nhót thật vui vẻ.',
      messageEn: 'The rabbit enjoyed the treat and hopped around with joy.',
    },
  };
}

export const careForTheRabbitLesson: Lesson = {
  id: lessonId,
  themeId: 'nhung-nguoi-ban-dong-vat',
  titleVi: 'Chăm thỏ con',
  titleEn: 'Care for the Rabbit',
  descriptionVi:
    'Bé chuẩn bị cỏ khô, thêm nước sạch và thưởng món nhỏ cho chú thỏ vui vẻ.',
  descriptionEn:
    'Prepare fresh hay, fill the clean water, and offer a small treat to the happy rabbit.',
  thumbnailEmoji: '🐰',
  ageRange: { min: 3, max: 8, label: '3-8 tuổi · Làm quen' },
  scenes: [
    makePrepareTheHayScene(),
    makeFillTheWaterScene(),
    makeRabbitSnackAndHopScene(),
  ],
  reviewGame: {
    id: `${lessonId}-review`,
    type: 'random',
    titleVi: 'Chăm sóc thỏ con',
    config: {
      vocabularyIds: [
        'vocab-care-for-the-rabbit-prepare-the-hay-rabbit',
        'vocab-care-for-the-rabbit-prepare-the-hay-hay',
        'vocab-care-for-the-rabbit-fill-the-water-water',
        'vocab-care-for-the-rabbit-rabbit-snack-and-hop-hop',
        'vocab-care-for-the-rabbit-prepare-the-hay-hay-rack',
        'vocab-care-for-the-rabbit-rabbit-snack-and-hop-feed-the-rabbit',
      ],
    },
  },
  metadata: {
    parentTipVi:
      'Ba mẹ hoặc người lớn luôn đồng hành chuẩn bị cỏ khô và nước sạch mỗi ngày cho thỏ; cà rốt chỉ là món thưởng nhỏ. Hướng dẫn bé vuốt ve nhẹ nhàng, không bế xốc hay kéo tai thỏ; nhớ rửa tay bằng xà phòng sau khi chăm thú cưng.',
  },
};
