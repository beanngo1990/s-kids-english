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

const lessonId = 'find-the-kitten';
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

function makeHearTheKittenScene(): Scene {
  const sceneId = 'hear-the-kitten';
  const heroId = `${sceneId}-hero`;
  const curtainId = `${sceneId}-curtain`;
  const meowId = `${sceneId}-meow-marks`;
  const pawprintsId = `${sceneId}-pawprints`;

  const beats: VocabularyBeat[] = [
    {
      key: 'kitten',
      meaningVi: 'mèo con',
      word: 'kitten',
      cueObjectId: heroId,
      teachVi: 'Chạm chú mèo con đang ngồi nhé.',
      teachEn: 'Tap the kitten sitting in the room.',
      teachSuccessEn: 'This is a kitten, a young cat.',
      teachFailVi: 'Chạm chú mèo nhỏ có vòng cổ xanh nhé.',
      teachFailEn: 'Tap the small cat with the blue collar.',
      practice: {
        instructionVi: 'Chạm tấm rèm để mèo bắt đầu trốn nhé.',
        instructionEn: 'Tap the curtain so the kitten can hide.',
        successVi: 'Mèo con đã nép sau rèm rồi.',
        successEn: 'The kitten is hiding behind the curtain.',
        failVi: 'Chạm tấm rèm bên phải nhé.',
        failEn: 'Tap the curtain on the right.',
        targetObjectId: curtainId,
        successStateChanges: [
          sceneStateChanges.setVariant(heroId, 'hiding'),
          sceneStateChanges.show(meowId),
        ],
      },
    },
    {
      key: 'meow',
      meaningVi: 'tiếng mèo kêu meo',
      word: 'meow',
      type: 'noun',
      cueObjectId: meowId,
      revealStateChanges: [sceneStateChanges.show(meowId)],
      teachVi: 'Chạm làn tiếng kêu cạnh tấm rèm nhé.',
      teachEn: 'Tap the meow sound beside the curtain.',
      teachSuccessEn: 'Meow is the sound a cat makes.',
      teachFailVi: 'Chạm các đường cong màu xanh cạnh rèm nhé.',
      teachFailEn: 'Tap the blue sound lines by the curtain.',
      practice: {
        instructionVi: 'Chạm tiếng mèo kêu để biết bạn đang ở gần nhé.',
        instructionEn: 'Tap the meow to hear where the kitten is.',
        successVi: 'Tiếng mèo kêu phát ra từ gần tấm rèm.',
        successEn: 'The meow is coming from near the curtain.',
        failVi: 'Chạm làn tiếng kêu màu xanh nhé.',
        failEn: 'Tap the blue meow lines.',
        targetObjectId: meowId,
        successStateChanges: [sceneStateChanges.show(pawprintsId)],
      },
    },
    {
      key: 'listen',
      meaningVi: 'lắng nghe',
      word: 'listen',
      type: 'verb',
      cueAsset: 'listen-ear',
      cuePosition: rect(7, 25, 28, 26),
      cueTouchArea: rect(2, 19, 40, 38),
      teachVi: 'Chạm chiếc tai đang lắng nghe nhé.',
      teachEn: 'Tap the ear that is listening.',
      teachSuccessEn: 'Listen means pay attention to a sound.',
      teachFailVi: 'Chạm chiếc tai lớn bên trái nhé.',
      teachFailEn: 'Tap the large ear on the left.',
      practice: {
        instructionVi: 'Chạm tiếng mèo kêu để lắng nghe thêm nhé.',
        instructionEn: 'Tap the meow and listen again.',
        successVi: 'Bé đã nghe thấy mèo con rồi.',
        successEn: 'You heard the kitten.',
        failVi: 'Chạm làn tiếng kêu cạnh rèm nhé.',
        failEn: 'Tap the sound lines by the curtain.',
        targetObjectId: meowId,
        effects: [lessonEffects.sound('correct')],
      },
    },
    {
      key: 'ears',
      meaningVi: 'đôi tai',
      word: 'ears',
      tier: 'expanded',
      cueAsset: 'kitten-ears-closeup',
      cuePosition: rect(8, 28, 29, 27),
      cueTouchArea: rect(2, 22, 41, 39),
      teachVi: 'Chạm đôi tai nhọn của mèo nhé.',
      teachEn: 'Tap the kitten ears.',
      teachSuccessEn: 'These are the kitten ears.',
      teachFailVi: 'Chạm hai tai màu vàng kem nhé.',
      teachFailEn: 'Tap the two pointed ears.',
      practice: {
        instructionVi: 'Chạm đôi tai để mèo nghe bé nhé.',
        instructionEn: 'Tap the ears so the kitten can hear you.',
        successVi: 'Đôi tai giúp mèo nghe âm thanh.',
        successEn: 'The ears help the kitten hear sounds.',
        failVi: 'Chạm hai tai nhọn nhé.',
        failEn: 'Tap the pointed ears.',
      },
    },
    {
      key: 'sound',
      meaningVi: 'âm thanh',
      word: 'sound',
      tier: 'expanded',
      speechPractice: 'optional',
      cueAsset: 'sound-waves',
      cuePosition: rect(42, 27, 25, 23),
      cueTouchArea: rect(36, 21, 37, 35),
      teachVi: 'Chạm các làn âm thanh đang lan ra nhé.',
      teachEn: 'Tap the sound waves spreading out.',
      teachSuccessEn: 'A sound is something we can hear.',
      teachFailVi: 'Chạm các vòng cong màu xanh nhé.',
      teachFailEn: 'Tap the blue curved waves.',
      practice: {
        instructionVi: 'Chạm tiếng kêu là âm thanh của mèo nhé.',
        instructionEn: 'Tap the meow sound made by the kitten.',
        successVi: 'Đúng rồi, tiếng mèo kêu là một âm thanh.',
        successEn: 'Right, a meow is a sound.',
        failVi: 'Chạm làn tiếng kêu cạnh rèm nhé.',
        failEn: 'Tap the meow lines by the curtain.',
        targetObjectId: meowId,
      },
    },
    {
      key: 'quiet',
      meaningVi: 'yên lặng',
      word: 'quiet',
      tier: 'expanded',
      type: 'adjective',
      speechPractice: 'optional',
      cueAsset: 'quiet-finger',
      cuePosition: rect(9, 30, 27, 25),
      cueTouchArea: rect(3, 24, 39, 37),
      teachVi: 'Chạm ngón tay nhắc mình yên lặng nhé.',
      teachEn: 'Tap the finger asking us to be quiet.',
      teachSuccessEn: 'Quiet means making very little sound.',
      teachFailVi: 'Chạm ngón tay đặt trước môi nhé.',
      teachFailEn: 'Tap the finger in front of the lips.',
      practice: {
        instructionVi: 'Chạm dấu chân rồi mình tìm thật khẽ nhé.',
        instructionEn: 'Tap the pawprints and search quietly.',
        successVi: 'Mình sẽ đi thật khẽ theo dấu chân.',
        successEn: 'We will follow the pawprints quietly.',
        failVi: 'Chạm các dấu chân nhỏ trên sàn nhé.',
        failEn: 'Tap the small pawprints on the floor.',
        targetObjectId: pawprintsId,
      },
    },
    {
      key: 'listen-carefully',
      meaningVi: 'lắng nghe thật kỹ',
      word: 'listen carefully',
      tier: 'challenge',
      type: 'phrase',
      cueAsset: 'listen-carefully',
      cuePosition: rect(7, 25, 29, 27),
      cueTouchArea: rect(1, 19, 41, 39),
      teachVi: 'Chạm chiếc tai có tia sáng nhé.',
      teachEn: 'Tap the ear listening carefully.',
      teachSuccessEn: 'Listen carefully means pay close attention to sound.',
      teachFailVi: 'Chạm chiếc tai lấp lánh bên trái nhé.',
      teachFailEn: 'Tap the sparkling ear on the left.',
      practice: {
        instructionVi: 'Chạm tiếng mèo kêu để nghe thật kỹ nhé.',
        instructionEn: 'Tap the meow and listen carefully.',
        successVi: 'Bé nghe rõ tiếng mèo ở gần rèm.',
        successEn: 'You hear the kitten clearly near the curtain.',
        failVi: 'Chạm làn tiếng kêu cạnh rèm nhé.',
        failEn: 'Tap the meow lines near the curtain.',
        targetObjectId: meowId,
      },
    },
    {
      key: 'where-are-you',
      meaningVi: 'bạn ở đâu',
      word: 'where are you?',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'calling-where-are-you',
      cuePosition: rect(10, 28, 31, 26),
      cueTouchArea: rect(4, 22, 43, 38),
      teachVi: 'Chạm đôi tay đang gọi tìm mèo nhé.',
      teachEn: 'Tap the hands calling, where are you?',
      teachSuccessEn: 'Where are you asks someone to show their place.',
      teachFailVi: 'Chạm đôi tay đặt quanh miệng nhé.',
      teachFailEn: 'Tap the hands around the mouth.',
      practice: {
        instructionVi: 'Chạm đôi tay để gọi mèo trả lời nhé.',
        instructionEn: 'Tap the calling hands so the kitten answers.',
        successVi: 'Mèo con trả lời bằng một tiếng kêu.',
        successEn: 'The kitten answers with a meow.',
        failVi: 'Chạm đôi tay đang gọi nhé.',
        failEn: 'Tap the calling hands.',
        effects: [lessonEffects.sparkle(meowId)],
      },
    },
    {
      key: 'i-hear-you',
      meaningVi: 'mình nghe thấy bạn rồi',
      word: 'I hear you',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'i-hear-you',
      cuePosition: rect(39, 28, 30, 26),
      cueTouchArea: rect(33, 22, 42, 38),
      teachVi: 'Chạm tai và mũi tên chỉ dấu chân nhé.',
      teachEn: 'Tap the ear pointing toward the pawprints.',
      teachSuccessEn: 'I hear you means the sound reached me.',
      teachFailVi: 'Chạm hình chiếc tai cạnh dấu chân nhé.',
      teachFailEn: 'Tap the ear beside the pawprints.',
      practice: {
        instructionVi: 'Chạm dấu chân để đi tìm mèo nhé.',
        instructionEn: 'Tap the pawprints to follow the kitten.',
        successVi: 'Bé đã nghe và tìm được đường đi.',
        successEn: 'You heard the kitten and found the trail.',
        failVi: 'Chạm các dấu chân nhỏ trên sàn nhé.',
        failEn: 'Tap the small pawprints on the floor.',
        targetObjectId: pawprintsId,
        effects: [lessonEffects.sound('yay')],
      },
    },
  ];
  const vocabulary = makeBeatVocabulary(sceneId, beats);

  return {
    id: sceneId,
    titleVi: 'Nghe tiếng mèo con',
    titleEn: 'Hear the Kitten',
    thumbnailEmoji: '👂',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: heroId,
        assetSource: sceneImageSource(sceneId, 'kitten-sitting'),
        isInteractive: true,
        position: rect(62, 46, 30, 32),
        presentation: 'cutout',
        touchArea: rect(56, 39, 42, 45),
        variants: [
          objectVariant({
            id: 'hiding',
            assetSource: sceneImageSource(sceneId, 'kitten-hiding-curtain'),
            position: rect(69, 45, 27, 33),
            touchArea: rect(61, 37, 38, 47),
          }),
        ],
      }),
      sceneObject({
        id: curtainId,
        assetSource: sceneImageSource(sceneId, 'curtain'),
        isInteractive: true,
        position: rect(72, 28, 25, 49),
        presentation: 'cutout',
        touchArea: rect(66, 22, 34, 60),
      }),
      sceneObject({
        id: meowId,
        assetSource: sceneImageSource(sceneId, 'meow-marks'),
        initialVisibility: 'hidden',
        isInteractive: true,
        position: rect(58, 35, 18, 17),
        presentation: 'cutout',
        touchArea: rect(51, 28, 32, 31),
      }),
      sceneObject({
        id: pawprintsId,
        assetSource: sceneImageSource(sceneId, 'pawprints'),
        initialVisibility: 'hidden',
        isInteractive: true,
        position: rect(39, 65, 30, 13),
        presentation: 'cutout',
        touchArea: rect(33, 58, 42, 27),
      }),
      ...makeBeatObjects(sceneId, beats, vocabulary),
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        type: 'intro',
        instructionVi: 'Mèo con muốn chơi trốn tìm. Mình chào bạn nhé.',
        instructionEn:
          'The kitten wants to play hide-and-seek. Say hello to your friend.',
        successFeedbackVi: 'Mèo con đang ngồi cạnh tấm rèm.',
        successFeedbackEn: 'The kitten is sitting beside the curtain.',
        targetObjectIds: [heroId, curtainId],
      }),
      ...makeBeatSteps(sceneId, beats, vocabulary),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Bé đã nghe thấy tiếng mèo và tìm được dấu chân.',
      messageEn: 'You heard the kitten and found its pawprint trail.',
    },
  };
}

function makeCheckTheHidingSpotsScene(): Scene {
  const sceneId = 'check-the-hiding-spots';
  const heroId = `${sceneId}-hero`;
  const boxId = `${sceneId}-box`;
  const basketId = `${sceneId}-basket`;

  const beats: VocabularyBeat[] = [
    {
      key: 'box',
      meaningVi: 'chiếc hộp',
      word: 'box',
      cueObjectId: boxId,
      teachVi: 'Chạm chiếc hộp vuông bên trái nhé.',
      teachEn: 'Tap the square box on the left.',
      teachSuccessEn: 'This is a box.',
      teachFailVi: 'Chạm hộp màu vàng có nắp nhé.',
      teachFailEn: 'Tap the yellow box with a lid.',
      practice: {
        kind: 'find',
        instructionVi: 'Tìm chiếc hộp, đừng chọn chiếc giỏ nhé.',
        instructionEn: 'Find the box, not the basket.',
        successVi: 'Hộp đã mở nhưng mèo không ở đây.',
        successEn: 'The box is open, but the kitten is not here.',
        failVi: 'Tìm chiếc hộp vuông bên trái nhé.',
        failEn: 'Find the square box on the left.',
        targetObjectId: boxId,
        targetObjectIds: [boxId, basketId],
        correctObjectIds: [boxId],
        successStateChanges: [sceneStateChanges.setVariant(boxId, 'open')],
      },
    },
    {
      key: 'basket',
      meaningVi: 'chiếc giỏ',
      word: 'basket',
      cueObjectId: basketId,
      teachVi: 'Chạm chiếc giỏ tròn bên phải nhé.',
      teachEn: 'Tap the round basket on the right.',
      teachSuccessEn: 'This is a basket.',
      teachFailVi: 'Chạm chiếc giỏ đan màu nâu nhé.',
      teachFailEn: 'Tap the brown woven basket.',
      practice: {
        kind: 'find',
        instructionVi: 'Tìm chiếc giỏ, đừng chọn chiếc hộp nhé.',
        instructionEn: 'Find the basket, not the box.',
        successVi: 'Giỏ đã mở nhưng mèo không ở đây.',
        successEn: 'The basket is open, but the kitten is not here.',
        failVi: 'Tìm chiếc giỏ tròn bên phải nhé.',
        failEn: 'Find the round basket on the right.',
        targetObjectId: basketId,
        targetObjectIds: [boxId, basketId],
        correctObjectIds: [basketId],
        successStateChanges: [sceneStateChanges.setVariant(basketId, 'open')],
      },
    },
    {
      key: 'hide',
      meaningVi: 'trốn',
      word: 'hide',
      type: 'verb',
      cueObjectId: heroId,
      teachVi: 'Chạm mèo con đang nép sau chăn nhé.',
      teachEn: 'Tap the kitten hiding behind the blanket.',
      teachSuccessEn: 'Hide means stay where others cannot easily see you.',
      teachFailVi: 'Chạm đôi mắt và chiếc đuôi nhỏ nhé.',
      teachFailEn: 'Tap the small eyes and tail behind the blanket.',
      practice: {
        instructionVi: 'Chạm mèo đang trốn để bạn ló đầu ra nhé.',
        instructionEn: 'Tap the hiding kitten so it peeks out.',
        successVi: 'Tìm thấy rồi, mèo con đang ló đầu ra.',
        successEn: 'You found it. The kitten is peeking out.',
        failVi: 'Chạm mèo nhỏ sau tấm chăn nhé.',
        failEn: 'Tap the kitten behind the blanket.',
        targetObjectId: heroId,
        successStateChanges: [sceneStateChanges.setVariant(heroId, 'peeking')],
        effects: [lessonEffects.sound('correct')],
      },
    },
    {
      key: 'under',
      meaningVi: 'ở dưới',
      word: 'under',
      tier: 'expanded',
      type: 'phrase',
      cueAsset: 'mouse-under-stool',
      cuePosition: rect(8, 31, 30, 26),
      cueTouchArea: rect(2, 25, 42, 38),
      teachVi: 'Chạm chuột đồ chơi ở dưới ghế nhé.',
      teachEn: 'Tap the toy mouse under the stool.',
      teachSuccessEn: 'Under means below something.',
      teachFailVi: 'Chạm chú chuột nhỏ dưới chiếc ghế nhé.',
      teachFailEn: 'Tap the little mouse below the stool.',
      practice: {
        instructionVi: 'Chạm đồ chơi nằm dưới ghế nhé.',
        instructionEn: 'Tap the toy under the stool.',
        successVi: 'Chuột đồ chơi nằm ở dưới chiếc ghế.',
        successEn: 'The toy mouse is under the stool.',
        failVi: 'Chạm chú chuột nhỏ phía dưới nhé.',
        failEn: 'Tap the little mouse underneath.',
      },
    },
    {
      key: 'behind',
      meaningVi: 'ở phía sau',
      word: 'behind',
      tier: 'expanded',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'ball-behind-cushion',
      cuePosition: rect(40, 29, 28, 25),
      cueTouchArea: rect(34, 23, 40, 37),
      teachVi: 'Chạm quả bóng ở sau chiếc gối nhé.',
      teachEn: 'Tap the ball behind the cushion.',
      teachSuccessEn: 'Behind means at the back of something.',
      teachFailVi: 'Chạm phần bóng đỏ ló sau chiếc gối nhé.',
      teachFailEn: 'Tap the red ball peeking behind the cushion.',
      practice: {
        instructionVi: 'Chạm quả bóng đang nấp sau gối nhé.',
        instructionEn: 'Tap the ball hiding behind the cushion.',
        successVi: 'Quả bóng ở phía sau chiếc gối.',
        successEn: 'The ball is behind the cushion.',
        failVi: 'Chạm phần bóng đỏ ló ra nhé.',
        failEn: 'Tap the red part peeking out.',
      },
    },
    {
      key: 'inside',
      meaningVi: 'ở bên trong',
      word: 'inside',
      tier: 'expanded',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'toy-inside-cube',
      cuePosition: rect(9, 31, 29, 25),
      cueTouchArea: rect(3, 25, 41, 37),
      teachVi: 'Chạm món đồ chơi ở trong khối nhé.',
      teachEn: 'Tap the toy inside the cube.',
      teachSuccessEn: 'Inside means within something.',
      teachFailVi: 'Chạm món đồ nhỏ nằm trong khối rỗng nhé.',
      teachFailEn: 'Tap the small toy within the open cube.',
      practice: {
        instructionVi: 'Chạm món đồ nằm bên trong nhé.',
        instructionEn: 'Tap the toy that is inside.',
        successVi: 'Món đồ chơi nằm ở bên trong khối.',
        successEn: 'The toy is inside the cube.',
        failVi: 'Chạm món đồ nhỏ trong khối nhé.',
        failEn: 'Tap the small toy in the cube.',
      },
    },
    {
      key: 'look-under-the-box',
      meaningVi: 'nhìn dưới chiếc hộp',
      word: 'look under the box',
      tier: 'challenge',
      type: 'phrase',
      cueAsset: 'look-under-box-action',
      cuePosition: rect(7, 45, 33, 28),
      cueTouchArea: rect(1, 38, 45, 41),
      revealStateChanges: [sceneStateChanges.hide(boxId)],
      teachVi: 'Chạm bàn tay đang nhìn dưới hộp nhé.',
      teachEn: 'Tap the hand looking under the box.',
      teachSuccessEn: 'Look under the box means check below it.',
      teachFailVi: 'Chạm bàn tay nâng chiếc hộp lên nhé.',
      teachFailEn: 'Tap the hand lifting the box.',
      practice: {
        instructionVi: 'Chạm hình nâng hộp để kiểm tra phía dưới nhé.',
        instructionEn: 'Tap the lifting picture to check under the box.',
        successVi: 'Phía dưới hộp không có mèo con.',
        successEn: 'The kitten is not under the box.',
        failVi: 'Chạm bàn tay đang nâng hộp nhé.',
        failEn: 'Tap the hand lifting the box.',
        successStateChanges: [sceneStateChanges.show(boxId)],
      },
    },
    {
      key: 'look-behind-the-basket',
      meaningVi: 'nhìn sau chiếc giỏ',
      word: 'look behind the basket',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'look-behind-basket-action',
      cuePosition: rect(57, 44, 35, 30),
      cueTouchArea: rect(51, 37, 47, 43),
      revealStateChanges: [sceneStateChanges.hide(basketId)],
      teachVi: 'Chạm bàn tay đang nhìn sau giỏ nhé.',
      teachEn: 'Tap the hand looking behind the basket.',
      teachSuccessEn: 'Look behind the basket means check at its back.',
      teachFailVi: 'Chạm bàn tay dịch chiếc giỏ sang bên nhé.',
      teachFailEn: 'Tap the hand moving the basket aside.',
      practice: {
        instructionVi: 'Chạm hình dịch giỏ để kiểm tra phía sau nhé.',
        instructionEn: 'Tap the moving picture to check behind the basket.',
        successVi: 'Phía sau giỏ cũng không có mèo con.',
        successEn: 'The kitten is not behind the basket either.',
        failVi: 'Chạm bàn tay đang dịch chiếc giỏ nhé.',
        failEn: 'Tap the hand moving the basket.',
        successStateChanges: [sceneStateChanges.show(basketId)],
      },
    },
    {
      key: 'find-the-kitten',
      meaningVi: 'tìm mèo con',
      word: 'find the kitten',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'find-kitten-action',
      cuePosition: rect(34, 38, 34, 34),
      cueTouchArea: rect(28, 31, 46, 47),
      revealStateChanges: [sceneStateChanges.hide(heroId)],
      teachVi: 'Chạm kính lúp đang tìm mèo con nhé.',
      teachEn: 'Tap the magnifying glass finding the kitten.',
      teachSuccessEn: 'Find the kitten means discover where the kitten is.',
      teachFailVi: 'Chạm kính lúp có khuôn mặt mèo nhé.',
      teachFailEn: 'Tap the magnifying glass around the kitten.',
      practice: {
        instructionVi: 'Chạm kính lúp để mèo bước ra nhé.',
        instructionEn: 'Tap the magnifying glass so the kitten comes out.',
        successVi: 'Bé đã tìm thấy mèo con rồi.',
        successEn: 'You found the kitten.',
        failVi: 'Chạm kính lúp quanh mèo nhé.',
        failEn: 'Tap the magnifying glass around the kitten.',
        successStateChanges: [
          sceneStateChanges.show(heroId),
          sceneStateChanges.setVariant(heroId, 'found'),
        ],
        effects: [lessonEffects.sound('yay')],
      },
    },
  ];
  const vocabulary = makeBeatVocabulary(sceneId, beats);

  return {
    id: sceneId,
    titleVi: 'Kiểm tra chỗ trốn',
    titleEn: 'Check the Hiding Spots',
    thumbnailEmoji: '📦',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: boxId,
        assetSource: sceneImageSource(sceneId, 'box-closed'),
        isInteractive: true,
        position: rect(7, 54, 29, 25),
        presentation: 'cutout',
        touchArea: rect(1, 47, 41, 38),
        variants: [
          objectVariant({
            id: 'open',
            assetSource: sceneImageSource(sceneId, 'box-open-empty'),
          }),
        ],
      }),
      sceneObject({
        id: basketId,
        assetSource: sceneImageSource(sceneId, 'basket-covered'),
        isInteractive: true,
        position: rect(66, 53, 29, 26),
        presentation: 'cutout',
        touchArea: rect(59, 46, 41, 39),
        variants: [
          objectVariant({
            id: 'open',
            assetSource: sceneImageSource(sceneId, 'basket-open-empty'),
          }),
        ],
      }),
      sceneObject({
        id: heroId,
        assetSource: sceneImageSource(sceneId, 'kitten-hiding'),
        isInteractive: true,
        position: rect(39, 51, 25, 28),
        presentation: 'cutout',
        touchArea: rect(32, 44, 39, 41),
        variants: [
          objectVariant({
            id: 'peeking',
            assetSource: sceneImageSource(sceneId, 'kitten-peeking'),
            position: rect(39, 48, 27, 31),
          }),
          objectVariant({
            id: 'found',
            assetSource: sceneImageSource(sceneId, 'kitten-found'),
            position: rect(37, 43, 31, 36),
            touchArea: rect(30, 36, 45, 49),
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
          'Dấu chân dẫn tới hộp và giỏ. Mình kiểm tra từng chỗ nhé.',
        instructionEn:
          'The pawprints lead to a box and a basket. Check each hiding spot.',
        successFeedbackVi: 'Mèo con đang nép rất khéo ở gần đó.',
        successFeedbackEn: 'The kitten is hiding carefully nearby.',
        targetObjectIds: [boxId, basketId, heroId],
      }),
      ...makeBeatSteps(sceneId, beats, vocabulary),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Bé đã kiểm tra từng chỗ và tìm thấy mèo con.',
      messageEn: 'You checked each spot and found the kitten.',
    },
  };
}

function makeWelcomeTheKittenScene(): Scene {
  const sceneId = 'welcome-the-kitten';
  const heroId = `${sceneId}-hero`;
  const handId = `${sceneId}-hand`;

  const beats: VocabularyBeat[] = [
    {
      key: 'call',
      meaningVi: 'gọi',
      word: 'call',
      type: 'verb',
      cueAsset: 'call-action',
      cuePosition: rect(8, 29, 31, 27),
      cueTouchArea: rect(2, 23, 43, 39),
      teachVi: 'Chạm đôi tay đang gọi mèo nhé.',
      teachEn: 'Tap the hands calling the kitten.',
      teachSuccessEn: 'Call means use your voice to get attention.',
      teachFailVi: 'Chạm đôi tay đặt quanh miệng nhé.',
      teachFailEn: 'Tap the hands around the mouth.',
      practice: {
        instructionVi: 'Chạm đôi tay để gọi mèo bước ra nhé.',
        instructionEn: 'Tap the calling hands so the kitten comes out.',
        successVi: 'Mèo con nghe tiếng gọi và bước ra.',
        successEn: 'The kitten hears the call and comes out.',
        failVi: 'Chạm đôi tay đang gọi nhé.',
        failEn: 'Tap the calling hands.',
        successStateChanges: [sceneStateChanges.setVariant(heroId, 'out')],
      },
    },
    {
      key: 'come-out',
      meaningVi: 'bước ra',
      word: 'come out',
      type: 'phrase',
      cueObjectId: heroId,
      teachVi: 'Chạm mèo con đang bước ra nhé.',
      teachEn: 'Tap the kitten coming out.',
      teachSuccessEn: 'Come out means move from a hiding place into view.',
      teachFailVi: 'Chạm chú mèo đang bước về phía trước nhé.',
      teachFailEn: 'Tap the kitten stepping forward.',
      practice: {
        instructionVi: 'Chạm mèo để bạn bước hẳn ra nhé.',
        instructionEn: 'Tap the kitten so it comes all the way out.',
        successVi: 'Mèo con đã bước ra và nhìn bé.',
        successEn: 'The kitten came out and looked at you.',
        failVi: 'Chạm chú mèo con nhé.',
        failEn: 'Tap the kitten.',
        targetObjectId: heroId,
        successStateChanges: [sceneStateChanges.setVariant(heroId, 'happy')],
      },
    },
    {
      key: 'happy',
      meaningVi: 'vui vẻ',
      word: 'happy',
      type: 'adjective',
      cueObjectId: heroId,
      teachVi: 'Chạm mèo con đang vui vẻ nhé.',
      teachEn: 'Tap the happy kitten.',
      teachSuccessEn: 'Happy means feeling joyful.',
      teachFailVi: 'Chạm chú mèo đang cười và dựng đuôi nhé.',
      teachFailEn: 'Tap the smiling kitten with its tail up.',
      practice: {
        instructionVi: 'Chạm mèo để chào bạn thật nhẹ nhàng nhé.',
        instructionEn: 'Tap the kitten to greet it gently.',
        successVi: 'Mèo con vui vì bé đã tìm thấy bạn.',
        successEn: 'The kitten is happy that you found it.',
        failVi: 'Chạm chú mèo vui vẻ nhé.',
        failEn: 'Tap the happy kitten.',
        targetObjectId: heroId,
        effects: [lessonEffects.sound('correct')],
      },
    },
    {
      key: 'paw',
      meaningVi: 'bàn chân của mèo',
      word: 'paw',
      tier: 'expanded',
      cueAsset: 'paw-closeup',
      cuePosition: rect(8, 29, 27, 25),
      cueTouchArea: rect(2, 23, 39, 37),
      teachVi: 'Chạm bàn chân nhỏ của mèo nhé.',
      teachEn: 'Tap the kitten paw.',
      teachSuccessEn: 'This is a paw.',
      teachFailVi: 'Chạm bàn chân có đệm thịt màu hồng nhé.',
      teachFailEn: 'Tap the small paw with pink pads.',
      practice: {
        instructionVi: 'Chạm bàn chân để quan sát nhẹ nhàng nhé.',
        instructionEn: 'Tap the paw to look at it gently.',
        successVi: 'Bàn chân mèo nhỏ và mềm.',
        successEn: 'The kitten paw is small and soft.',
        failVi: 'Chạm bàn chân nhỏ bên trái nhé.',
        failEn: 'Tap the small paw on the left.',
      },
    },
    {
      key: 'tail',
      meaningVi: 'cái đuôi',
      word: 'tail',
      tier: 'expanded',
      speechPractice: 'optional',
      cueAsset: 'tail-closeup',
      cuePosition: rect(9, 29, 29, 26),
      cueTouchArea: rect(3, 23, 41, 38),
      teachVi: 'Chạm chiếc đuôi cong của mèo nhé.',
      teachEn: 'Tap the kitten tail.',
      teachSuccessEn: 'This is the kitten tail.',
      teachFailVi: 'Chạm chiếc đuôi vàng kem đang cong nhé.',
      teachFailEn: 'Tap the curved golden tail.',
      practice: {
        instructionVi: 'Chạm chiếc đuôi đang vẫy vui nhé.',
        instructionEn: 'Tap the tail wagging happily.',
        successVi: 'Chiếc đuôi đang dựng lên vui vẻ.',
        successEn: 'The tail is up happily.',
        failVi: 'Chạm chiếc đuôi cong nhé.',
        failEn: 'Tap the curved tail.',
      },
    },
    {
      key: 'soft',
      meaningVi: 'mềm mại',
      word: 'soft',
      tier: 'expanded',
      type: 'adjective',
      speechPractice: 'optional',
      cueAsset: 'soft-fur-closeup',
      cuePosition: rect(8, 29, 29, 26),
      cueTouchArea: rect(2, 23, 41, 38),
      teachVi: 'Chạm vùng lông mềm của mèo nhé.',
      teachEn: 'Tap the kitten soft fur.',
      teachSuccessEn: 'Soft means gentle to touch, not hard.',
      teachFailVi: 'Chạm vùng lông vàng có bàn tay nhỏ nhé.',
      teachFailEn: 'Tap the golden fur beside the small hand.',
      practice: {
        instructionVi: 'Chạm vùng lông để thấy hình mềm mại nhé.',
        instructionEn: 'Tap the fur to see that it is soft.',
        successVi: 'Lông mèo trông thật mềm mại.',
        successEn: 'The kitten fur looks soft.',
        failVi: 'Chạm vùng lông vàng bên trái nhé.',
        failEn: 'Tap the golden fur on the left.',
      },
    },
    {
      key: 'hold-out-your-hand',
      meaningVi: 'đưa bàn tay ra',
      word: 'hold out your hand',
      tier: 'challenge',
      type: 'phrase',
      cueObjectId: handId,
      revealStateChanges: [sceneStateChanges.show(handId)],
      teachVi: 'Chạm bàn tay đang đưa thấp ra nhé.',
      teachEn: 'Tap the hand held out low for the kitten.',
      teachSuccessEn: 'Hold out your hand means offer it calmly.',
      teachFailVi: 'Chạm bàn tay mở bên trái nhé.',
      teachFailEn: 'Tap the open hand on the left.',
      practice: {
        instructionVi: 'Chạm bàn tay rồi giữ yên cho mèo ngửi nhé.',
        instructionEn: 'Tap the hand and keep it still for the kitten.',
        successVi: 'Bàn tay đang ở thấp và thật yên.',
        successEn: 'The hand is low and still.',
        failVi: 'Chạm bàn tay mở bên trái nhé.',
        failEn: 'Tap the open hand on the left.',
        targetObjectId: handId,
      },
    },
    {
      key: 'let-the-kitten-come',
      meaningVi: 'để mèo tự đến gần',
      word: 'let the kitten come',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'kitten-approaching-hand',
      cuePosition: rect(31, 43, 39, 34),
      cueTouchArea: rect(25, 36, 51, 47),
      revealStateChanges: [
        sceneStateChanges.hide(heroId),
        sceneStateChanges.hide(handId),
      ],
      teachVi: 'Chạm mèo đang tự bước tới bàn tay nhé.',
      teachEn: 'Tap the kitten coming to the hand by itself.',
      teachSuccessEn: 'Let the kitten come means wait for it to approach.',
      teachFailVi: 'Chạm mèo đang ngửi bàn tay mở nhé.',
      teachFailEn: 'Tap the kitten sniffing the open hand.',
      practice: {
        instructionVi: 'Chạm hình rồi chờ mèo tự đến gần nhé.',
        instructionEn: 'Tap the picture and let the kitten come closer.',
        successVi: 'Mèo con đã tự bước tới bàn tay.',
        successEn: 'The kitten came to the hand by itself.',
        failVi: 'Chạm mèo đang bước tới bàn tay nhé.',
        failEn: 'Tap the kitten approaching the hand.',
        successStateChanges: [
          sceneStateChanges.show(heroId),
          sceneStateChanges.setVariant(heroId, 'near'),
          sceneStateChanges.show(handId),
        ],
      },
    },
    {
      key: 'pet-gently',
      meaningVi: 'vuốt nhẹ nhàng',
      word: 'pet gently',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'pet-gently-action',
      cuePosition: rect(35, 42, 36, 34),
      cueTouchArea: rect(29, 35, 48, 47),
      revealStateChanges: [
        sceneStateChanges.hide(heroId),
        sceneStateChanges.hide(handId),
      ],
      teachVi: 'Chạm bàn tay đang vuốt lưng mèo nhẹ nhé.',
      teachEn: 'Tap the hand petting the kitten gently.',
      teachSuccessEn: 'Pet gently means touch an animal softly and calmly.',
      teachFailVi: 'Chạm bàn tay đặt nhẹ trên lưng mèo nhé.',
      teachFailEn: 'Tap the hand resting softly on the kitten back.',
      practice: {
        instructionVi: 'Chạm hình vuốt nhẹ để mèo dụi đầu nhé.',
        instructionEn: 'Tap the gentle pet so the kitten rubs its head.',
        successVi: 'Mèo con vui vẻ dụi đầu vào tay bé.',
        successEn: 'The kitten happily rubs its head against your hand.',
        failVi: 'Chạm bàn tay đang vuốt mèo nhé.',
        failEn: 'Tap the hand petting the kitten.',
        successStateChanges: [
          sceneStateChanges.show(heroId),
          sceneStateChanges.setVariant(heroId, 'rubbing'),
          sceneStateChanges.hide(handId),
        ],
        effects: [lessonEffects.sound('complete')],
      },
    },
  ];
  const vocabulary = makeBeatVocabulary(sceneId, beats);

  return {
    id: sceneId,
    titleVi: 'Chào đón mèo con',
    titleEn: 'Welcome the Kitten',
    thumbnailEmoji: '🐱',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: heroId,
        assetSource: sceneImageSource(sceneId, 'kitten-peeking'),
        isInteractive: true,
        position: rect(63, 49, 27, 30),
        presentation: 'cutout',
        touchArea: rect(56, 42, 40, 43),
        variants: [
          objectVariant({
            id: 'out',
            assetSource: sceneImageSource(sceneId, 'kitten-coming-out'),
            position: rect(57, 46, 31, 33),
          }),
          objectVariant({
            id: 'happy',
            assetSource: sceneImageSource(sceneId, 'kitten-happy'),
            position: rect(57, 44, 32, 35),
          }),
          objectVariant({
            id: 'near',
            assetSource: sceneImageSource(sceneId, 'kitten-near-hand'),
            position: rect(43, 47, 36, 32),
            touchArea: rect(36, 39, 48, 45),
          }),
          objectVariant({
            id: 'rubbing',
            assetSource: sceneImageSource(sceneId, 'kitten-rubbing-hand'),
            position: rect(40, 45, 39, 34),
            touchArea: rect(33, 37, 51, 47),
          }),
        ],
      }),
      sceneObject({
        id: handId,
        assetSource: sceneImageSource(sceneId, 'open-hand'),
        initialVisibility: 'hidden',
        isInteractive: true,
        learningScope: challengeScope,
        position: rect(9, 55, 33, 22),
        presentation: 'cutout',
        touchArea: rect(3, 48, 45, 35),
      }),
      ...makeBeatObjects(sceneId, beats, vocabulary),
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        type: 'intro',
        instructionVi: 'Mèo con đã ló đầu ra. Mình gọi bạn bước ra nhé.',
        instructionEn:
          'The kitten is peeking out. Call your friend to come out.',
        successFeedbackVi: 'Mèo con đang nhìn bé và chờ lời gọi.',
        successFeedbackEn: 'The kitten is looking at you and waiting.',
        targetObjectIds: [heroId],
      }),
      ...makeBeatSteps(sceneId, beats, vocabulary),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Mèo con đã tự đến gần và dụi đầu vui vẻ.',
      messageEn: 'The kitten came close and rubbed its head happily.',
    },
  };
}

export const findTheKittenLesson: Lesson = {
  id: lessonId,
  themeId: 'nhung-nguoi-ban-dong-vat',
  titleVi: 'Tìm mèo con',
  titleEn: 'Find the Kitten',
  descriptionVi:
    'Bé nghe tiếng mèo, kiểm tra các chỗ trốn và chào bạn bằng bàn tay nhẹ nhàng.',
  descriptionEn:
    'Hear the kitten, check each hiding spot, and greet your friend with gentle hands.',
  thumbnailEmoji: '🐱',
  ageRange: { min: 3, max: 8, label: '3-8 tuổi · Làm quen' },
  scenes: [
    makeHearTheKittenScene(),
    makeCheckTheHidingSpotsScene(),
    makeWelcomeTheKittenScene(),
  ],
  reviewGame: {
    id: `${lessonId}-review`,
    type: 'random',
    titleVi: 'Tìm mèo con',
    config: {
      vocabularyIds: [
        'vocab-find-the-kitten-hear-the-kitten-kitten',
        'vocab-find-the-kitten-hear-the-kitten-meow',
        'vocab-find-the-kitten-check-the-hiding-spots-box',
        'vocab-find-the-kitten-check-the-hiding-spots-basket',
        'vocab-find-the-kitten-check-the-hiding-spots-under',
        'vocab-find-the-kitten-check-the-hiding-spots-find-the-kitten',
      ],
    },
  },
  metadata: {
    parentTipVi:
      'Ba mẹ nhắc bé không kéo mèo ra khỏi chỗ trốn, không đuổi theo hoặc bế ép. Hãy để mèo tự đến gần, vuốt nhẹ khi có người lớn đồng ý và rửa tay sau khi chơi.',
  },
};
