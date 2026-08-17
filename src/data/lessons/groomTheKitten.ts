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

const lessonId = 'groom-the-kitten';
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

function makeGetTheBrushScene(): Scene {
  const sceneId = 'get-the-brush';
  const heroId = `${sceneId}-hero`;
  const brushId = `${sceneId}-brush`;
  const matId = `${sceneId}-mat`;

  const beats: VocabularyBeat[] = [
    {
      key: 'kitten',
      meaningVi: 'chú mèo con',
      word: 'kitten',
      cueObjectId: heroId,
      teachVi: 'Chạm chú mèo con nhé.',
      teachEn: 'Tap the little kitten.',
      teachSuccessEn: 'This is a kitten.',
      teachFailVi: 'Chạm bạn mèo con lông xù nhé.',
      teachFailEn: 'Tap the fluffy little kitten.',
      practice: {
        instructionVi: 'Chạm mèo con để bạn vẫy đuôi chào bé nhé.',
        instructionEn: 'Tap the kitten so it wiggles its tail.',
        successVi: 'Mèo con vẫy nhẹ chiếc đuôi chào bé.',
        successEn: 'The kitten gently wiggles its tail.',
        failVi: 'Chạm chú mèo con nhé.',
        failEn: 'Tap the little kitten.',
        targetObjectId: heroId,
      },
    },
    {
      key: 'fur',
      meaningVi: 'bộ lông mềm',
      word: 'fur',
      cueAsset: 'kitten-fur-closeup',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm bộ lông mềm của mèo nhé.',
      teachEn: 'Tap the soft kitten fur.',
      teachSuccessEn: 'Fur is the soft hair on pets.',
      teachFailVi: 'Chạm mảng lông mềm màu cam nhé.',
      teachFailEn: 'Tap the soft orange fur.',
      practice: {
        instructionVi: 'Chạm lông mèo để xem bộ lông xù nhẹ nhé.',
        instructionEn: 'Tap the fur to see it looks a little messy.',
        successVi: 'Bộ lông hơi xù nhẹ sau khi chơi đùa.',
        successEn: 'The fur is fluffy and needs gentle brushing.',
        failVi: 'Chạm phần lông mềm nhé.',
        failEn: 'Tap the soft fur.',
        successStateChanges: [sceneStateChanges.show(brushId)],
      },
    },
    {
      key: 'brush',
      meaningVi: 'bàn chải lông',
      word: 'brush',
      cueObjectId: brushId,
      teachVi: 'Chạm chiếc bàn chải lông nhé.',
      teachEn: 'Tap the grooming brush.',
      teachSuccessEn: 'A brush makes fur smooth and neat.',
      teachFailVi: 'Chạm chiếc bàn chải màu xanh bên trái nhé.',
      teachFailEn: 'Tap the blue brush on the left.',
      practice: {
        instructionVi: 'Chạm chiếc bàn chải lông để chuẩn bị chải nhé.',
        instructionEn: 'Tap the brush to get ready for grooming.',
        successVi: 'Chiếc bàn chải lông êm ái đã sẵn sàng.',
        successEn: 'The gentle brush is ready to use.',
        failVi: 'Chạm chiếc bàn chải lông nhé.',
        failEn: 'Tap the brush.',
        targetObjectId: brushId,
      },
    },
    {
      key: 'mat',
      meaningVi: 'tấm thảm êm',
      word: 'mat',
      tier: 'expanded',
      cueObjectId: matId,
      revealStateChanges: [sceneStateChanges.show(matId)],
      teachVi: 'Chạm tấm thảm êm cho mèo ngồi nhé.',
      teachEn: 'Tap the soft mat for the kitten.',
      teachSuccessEn: 'A mat is a cozy pad to sit on.',
      teachFailVi: 'Chạm tấm thảm nhỏ màu vàng nhé.',
      teachFailEn: 'Tap the small yellow mat.',
      practice: {
        instructionVi: 'Chạm tấm thảm để đặt ngay ngắn nhé.',
        instructionEn: 'Tap the mat to place it neatly.',
        successVi: 'Tấm thảm mềm mại đã trải ngay ngắn.',
        successEn: 'The soft mat is placed neatly on the floor.',
        failVi: 'Chạm tấm thảm êm nhé.',
        failEn: 'Tap the cozy mat.',
        targetObjectId: matId,
      },
    },
    {
      key: 'tangle',
      meaningVi: 'lông xù rối',
      word: 'tangle',
      tier: 'expanded',
      type: 'noun',
      speechPractice: 'optional',
      cueAsset: 'fur-tangle-closeup',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm phần lông hơi xù nhé.',
      teachEn: 'Tap the messy tangle of fur.',
      teachSuccessEn: 'A tangle means fur twisted together gently.',
      teachFailVi: 'Chạm chỗ lông cần gỡ rối nhé.',
      teachFailEn: 'Tap the fur that needs gentle brushing.',
      practice: {
        instructionVi: 'Chạm chỗ lông xù để chuẩn bị gỡ rối nhé.',
        instructionEn: 'Tap the tangle to prepare for gentle brushing.',
        successVi: 'Bé sẽ giúp mèo gỡ rối thật nhẹ nhàng.',
        successEn: 'You will help untangle the fur gently.',
        failVi: 'Chạm phần lông xù nhé.',
        failEn: 'Tap the fluffy tangle.',
      },
    },
    {
      key: 'pet-brush',
      meaningVi: 'bàn chải thú cưng',
      word: 'pet brush',
      tier: 'expanded',
      type: 'phrase',
      speechPractice: 'optional',
      cueObjectId: brushId,
      teachVi: 'Chạm chiếc bàn chải thú cưng nhé.',
      teachEn: 'Tap the pet brush.',
      teachSuccessEn: 'A pet brush has soft bristles for pets.',
      teachFailVi: 'Chạm chiếc bàn chải có răng mềm nhé.',
      teachFailEn: 'Tap the brush with soft bristles.',
      practice: {
        instructionVi: 'Chạm chiếc bàn chải để kiểm tra răng bàn chải êm nhé.',
        instructionEn: 'Tap the brush to check its soft bristles.',
        successVi: 'Bàn chải thú cưng có đầu tròn rất êm cho da mèo.',
        successEn: 'The pet brush is soft and safe for the kitten.',
        failVi: 'Chạm chiếc bàn chải thú cưng nhé.',
        failEn: 'Tap the pet brush.',
        targetObjectId: brushId,
      },
    },
    {
      key: 'soft-fur',
      meaningVi: 'bộ lông mềm mại',
      word: 'soft fur',
      tier: 'challenge',
      type: 'phrase',
      cueAsset: 'soft-kitten-fur',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm bộ lông mềm mại nhé.',
      teachEn: 'Tap the fluffy soft fur.',
      teachSuccessEn: 'Soft fur feels warm and pleasant to touch.',
      teachFailVi: 'Chạm mảng lông mềm mịn nhé.',
      teachFailEn: 'Tap the soft and fluffy fur.',
      practice: {
        instructionVi: 'Chạm lông mềm để khen bạn mèo nhé.',
        instructionEn: 'Tap the soft fur to praise the kitten.',
        successVi: 'Mèo con có bộ lông rất mịn màng.',
        successEn: 'The kitten has delightfully soft fur.',
        failVi: 'Chạm bộ lông mềm nhé.',
        failEn: 'Tap the soft fur.',
      },
    },
    {
      key: 'clean-brush',
      meaningVi: 'bàn chải sạch',
      word: 'clean brush',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueObjectId: brushId,
      teachVi: 'Chạm chiếc bàn chải sạch sẽ nhé.',
      teachEn: 'Tap the clean grooming brush.',
      teachSuccessEn: 'A clean brush is ready for healthy grooming.',
      teachFailVi: 'Chạm chiếc bàn chải sạch không dính bụi nhé.',
      teachFailEn: 'Tap the clean brush on the mat.',
      practice: {
        instructionVi: 'Chạm bàn chải sạch để sẵn sàng chải lông nhé.',
        instructionEn: 'Tap the clean brush to begin grooming.',
        successVi: 'Bàn chải sạch sẽ giúp lông mèo luôn thơm tho.',
        successEn: 'The clean brush keeps the kitten fresh.',
        failVi: 'Chạm chiếc bàn chải sạch nhé.',
        failEn: 'Tap the clean brush.',
        targetObjectId: brushId,
      },
    },
    {
      key: 'sit-nicely',
      meaningVi: 'ngồi ngoan',
      word: 'sit nicely',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueObjectId: heroId,
      teachVi: 'Chạm chú mèo ngồi ngoan nhé.',
      teachEn: 'Tap the kitten sitting nicely.',
      teachSuccessEn: 'Sit nicely means stay calm and still.',
      teachFailVi: 'Chạm bạn mèo ngồi yên trên thảm nhé.',
      teachFailEn: 'Tap the kitten sitting calmly on the mat.',
      practice: {
        instructionVi: 'Chạm mèo con để bạn ngồi ngay ngắn nhé.',
        instructionEn: 'Tap the kitten so it sits neatly.',
        successVi: 'Mèo con ngồi ngoan ngoãn trên thảm để được chải lông.',
        successEn: 'The kitten sits nicely on the mat for grooming.',
        failVi: 'Chạm chú mèo con nhé.',
        failEn: 'Tap the little kitten.',
        targetObjectId: heroId,
        successStateChanges: [
          sceneStateChanges.setVariant(heroId, 'sitting-nicely'),
        ],
        effects: [lessonEffects.sound('correct')],
      },
    },
  ];
  const vocabulary = makeBeatVocabulary(sceneId, beats);

  return {
    id: sceneId,
    titleVi: 'Lấy bàn chải lông',
    titleEn: 'Get the Brush',
    thumbnailEmoji: '🪮',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: heroId,
        assetSource: sceneImageSource(sceneId, 'kitten-sitting-messy'),
        isInteractive: true,
        position: rect(54, 43, 40, 39),
        presentation: 'cutout',
        touchArea: rect(47, 36, 52, 50),
        variants: [
          objectVariant({
            id: 'sitting-nicely',
            assetSource: sceneImageSource(sceneId, 'kitten-sitting-calm'),
          }),
        ],
      }),
      sceneObject({
        id: brushId,
        assetSource: sceneImageSource(sceneId, 'grooming-brush'),
        initialVisibility: 'hidden',
        isInteractive: true,
        position: rect(8, 62, 28, 20),
        presentation: 'cutout',
        touchArea: rect(2, 55, 40, 34),
      }),
      sceneObject({
        id: matId,
        assetSource: sceneImageSource(sceneId, 'sitting-mat'),
        initialVisibility: 'hidden',
        isInteractive: true,
        learningScope: expandedScope,
        position: rect(46, 68, 50, 22),
        presentation: 'cutout',
        touchArea: rect(40, 60, 58, 36),
      }),
      ...makeBeatObjects(sceneId, beats, vocabulary),
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        type: 'intro',
        instructionVi:
          'Mèo con có bộ lông hơi xù. Mình lấy chiếc bàn chải lông êm để chải nhé.',
        instructionEn:
          'The kitten’s fur is a little messy. Let’s get a soft brush.',
        successFeedbackVi: 'Mèo con đang ngồi ngoan chờ bé chải lông.',
        successFeedbackEn: 'The kitten is sitting calmly waiting for brushing.',
        targetObjectIds: [heroId],
      }),
      ...makeBeatSteps(sceneId, beats, vocabulary),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Chiếc bàn chải lông đã sẵn sàng và mèo con ngồi rất ngoan.',
      messageEn: 'The brush is ready and the kitten sits calmly.',
    },
  };
}

function makeBrushTheFurScene(): Scene {
  const sceneId = 'brush-the-fur';
  const heroId = `${sceneId}-hero`;
  const brushId = `${sceneId}-brush`;

  const beats: VocabularyBeat[] = [
    {
      key: 'groom',
      meaningVi: 'chăm sóc lông',
      word: 'groom',
      type: 'verb',
      cueObjectId: brushId,
      teachVi: 'Chạm bàn chải để chăm sóc lông nhé.',
      teachEn: 'Tap the brush to groom the kitten.',
      teachSuccessEn: 'Groom means brush and care for a pet’s fur.',
      teachFailVi: 'Chạm chiếc bàn chải màu xanh nhé.',
      teachFailEn: 'Tap the blue grooming brush.',
      practice: {
        instructionVi: 'Chạm bàn chải để chải chuốt lông mèo nhé.',
        instructionEn: 'Tap the brush to groom the fluffy fur.',
        successVi: 'Bé chải chuốt lông cho mèo con thật khéo léo.',
        successEn: 'You groom the kitten gently and neatly.',
        failVi: 'Chạm chiếc bàn chải nhé.',
        failEn: 'Tap the brush.',
        targetObjectId: brushId,
        successStateChanges: [
          sceneStateChanges.setVariant(heroId, 'being-brushed'),
        ],
      },
    },
    {
      key: 'smooth',
      meaningVi: 'mượt mà',
      word: 'smooth',
      type: 'adjective',
      cueObjectId: heroId,
      teachVi: 'Chạm bộ lông mượt mà nhé.',
      teachEn: 'Tap the smooth kitten fur.',
      teachSuccessEn: 'Smooth fur feels neat and silky.',
      teachFailVi: 'Chạm bộ lông đã được chải thẳng nhé.',
      teachFailEn: 'Tap the neat and silky fur.',
      practice: {
        instructionVi: 'Chạm lông mèo để cảm nhận sự suôn mượt nhé.',
        instructionEn: 'Tap the fur to feel how smooth it is.',
        successVi: 'Bộ lông mèo đã trở nên suôn mượt.',
        successEn: 'The kitten’s fur is now smooth and neat.',
        failVi: 'Chạm chú mèo con nhé.',
        failEn: 'Tap the little kitten.',
        targetObjectId: heroId,
        successStateChanges: [
          sceneStateChanges.setVariant(heroId, 'smooth-fur'),
        ],
      },
    },
    {
      key: 'clean',
      meaningVi: 'sạch sẽ',
      word: 'clean',
      type: 'adjective',
      cueObjectId: heroId,
      teachVi: 'Chạm chú mèo đã sạch sẽ nhé.',
      teachEn: 'Tap the clean and neat kitten.',
      teachSuccessEn: 'Clean means free from dust and neat.',
      teachFailVi: 'Chạm bạn mèo thơm tho sạch sẽ nhé.',
      teachFailEn: 'Tap the clean and fresh kitten.',
      practice: {
        instructionVi: 'Chạm mèo con để ngắm bạn thật sạch đẹp nhé.',
        instructionEn: 'Tap the kitten to admire its clean look.',
        successVi: 'Mèo con sạch sẽ và xinh xắn hẳn lên.',
        successEn: 'The kitten looks clean and adorable.',
        failVi: 'Chạm chú mèo sạch sẽ nhé.',
        failEn: 'Tap the clean kitten.',
        targetObjectId: heroId,
      },
    },
    {
      key: 'stroke',
      meaningVi: 'vuốt nhẹ',
      word: 'stroke',
      tier: 'expanded',
      type: 'verb',
      cueAsset: 'stroke-fur-action',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm tay vuốt nhẹ lưng mèo nhé.',
      teachEn: 'Tap the hand stroking the kitten.',
      teachSuccessEn: 'Stroke means move the hand gently over fur.',
      teachFailVi: 'Chạm bàn tay vuốt ve êm ái nhé.',
      teachFailEn: 'Tap the hand moving softly on the fur.',
      practice: {
        instructionVi: 'Chạm tay để vuốt dọc sống lưng nhé.',
        instructionEn: 'Tap the hand to stroke down the back.',
        successVi: 'Bàn tay vuốt nhẹ giúp mèo con thư giãn.',
        successEn: 'Gentle strokes help the kitten relax.',
        failVi: 'Chạm bàn tay vuốt nhẹ nhé.',
        failEn: 'Tap the gentle hand.',
      },
    },
    {
      key: 'gentle',
      meaningVi: 'nhẹ nhàng',
      word: 'gentle',
      tier: 'expanded',
      type: 'adjective',
      speechPractice: 'optional',
      cueAsset: 'gentle-brushing-cue',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm bàn tay nhẹ nhàng nhé.',
      teachEn: 'Tap the gentle hands.',
      teachSuccessEn: 'Gentle means kind and soft.',
      teachFailVi: 'Chạm đôi tay chải khéo léo nhé.',
      teachFailEn: 'Tap the careful and soft hands.',
      practice: {
        instructionVi: 'Chạm tay để chải thật khéo léo nhé.',
        instructionEn: 'Tap the hands to brush very softly.',
        successVi: 'Bé chải lông cho mèo thật êm và dịu dàng.',
        successEn: 'You groom the kitten softly and gently.',
        failVi: 'Chạm đôi tay nhé.',
        failEn: 'Tap the gentle hands.',
      },
    },
    {
      key: 'shiny-coat',
      meaningVi: 'bộ lông óng mượt',
      word: 'shiny coat',
      tier: 'expanded',
      type: 'phrase',
      speechPractice: 'optional',
      cueObjectId: heroId,
      teachVi: 'Chạm bộ lông óng mượt nhé.',
      teachEn: 'Tap the shiny coat of fur.',
      teachSuccessEn: 'A shiny coat looks bright and healthy.',
      teachFailVi: 'Chạm bộ lông sáng bóng của mèo nhé.',
      teachFailEn: 'Tap the bright and healthy fur.',
      practice: {
        instructionVi: 'Chạm lông mèo để thấy ánh sáng óng ả nhé.',
        instructionEn: 'Tap the fur to see it shine brightly.',
        successVi: 'Bộ lông của mèo con sáng óng ả tuyệt đẹp.',
        successEn: 'The kitten’s coat shines bright and healthy.',
        failVi: 'Chạm chú mèo con nhé.',
        failEn: 'Tap the little kitten.',
        targetObjectId: heroId,
      },
    },
    {
      key: 'brush-the-fur',
      meaningVi: 'chải lông cho mèo',
      word: 'brush the fur',
      tier: 'challenge',
      type: 'phrase',
      cueAsset: 'brush-fur-action',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm hình chải lông cho mèo nhé.',
      teachEn: 'Tap the picture of brushing the fur.',
      teachSuccessEn: 'Brush the fur keeps pets clean and happy.',
      teachFailVi: 'Chạm hình ảnh chải lông bên trái nhé.',
      teachFailEn: 'Tap the picture on the left.',
      practice: {
        instructionVi: 'Chạm hình chải lông để hoàn tất việc chải nhé.',
        instructionEn: 'Tap the picture to finish grooming.',
        successVi: 'Bé đã chải lông cho mèo con rất chu đáo.',
        successEn: 'You brushed the kitten’s fur with great care.',
        failVi: 'Chạm hình chải lông nhé.',
        failEn: 'Tap the picture of brushing the fur.',
      },
    },
    {
      key: 'brush-softly',
      meaningVi: 'chải thật êm',
      word: 'brush softly',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'brush-softly-cue',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm tay chải thật êm nhé.',
      teachEn: 'Tap the hand brushing softly.',
      teachSuccessEn: 'Brush softly means groom without pulling.',
      teachFailVi: 'Chạm tay chải êm ái nhé.',
      teachFailEn: 'Tap the soft brushing stroke.',
      practice: {
        instructionVi: 'Chạm nhẹ tay để mèo không bị giật mình nhé.',
        instructionEn: 'Tap softly so the kitten stays comfortable.',
        successVi: 'Chải êm giúp mèo con cảm thấy rất dễ chịu.',
        successEn: 'Soft brushing keeps the kitten cozy and safe.',
        failVi: 'Chạm bàn tay nhé.',
        failEn: 'Tap the hand.',
      },
    },
    {
      key: 'fluffy-kitten',
      meaningVi: 'chú mèo bông mượt',
      word: 'fluffy kitten',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueObjectId: heroId,
      teachVi: 'Chạm chú mèo bông mượt nhé.',
      teachEn: 'Tap the fluffy cute kitten.',
      teachSuccessEn: 'A fluffy kitten has soft puffy clean fur.',
      teachFailVi: 'Chạm bạn mèo bông đáng yêu nhé.',
      teachFailEn: 'Tap the adorable fluffy kitten.',
      practice: {
        instructionVi: 'Chạm mèo con xinh xắn và đáng yêu nhé.',
        instructionEn: 'Tap the kitten to see how pretty it looks.',
        successVi: 'Chú mèo con xinh xắn như một cục bông mềm.',
        successEn: 'The fluffy kitten looks like a soft little puff.',
        failVi: 'Chạm chú mèo con nhé.',
        failEn: 'Tap the little kitten.',
        targetObjectId: heroId,
        successStateChanges: [
          sceneStateChanges.setVariant(heroId, 'fluffy-neat'),
        ],
        effects: [lessonEffects.sound('correct')],
      },
    },
  ];
  const vocabulary = makeBeatVocabulary(sceneId, beats);

  return {
    id: sceneId,
    titleVi: 'Chải lông nhẹ nhàng',
    titleEn: 'Brush the Fur',
    thumbnailEmoji: '✨',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: heroId,
        assetSource: sceneImageSource(sceneId, 'kitten-sitting-calm'),
        isInteractive: true,
        position: rect(54, 43, 40, 39),
        presentation: 'cutout',
        touchArea: rect(47, 36, 52, 50),
        variants: [
          objectVariant({
            id: 'being-brushed',
            assetSource: sceneImageSource(sceneId, 'kitten-being-brushed'),
          }),
          objectVariant({
            id: 'smooth-fur',
            assetSource: sceneImageSource(sceneId, 'kitten-smooth-fur'),
          }),
          objectVariant({
            id: 'fluffy-neat',
            assetSource: sceneImageSource(sceneId, 'kitten-fluffy-neat'),
          }),
        ],
      }),
      sceneObject({
        id: brushId,
        assetSource: sceneImageSource(sceneId, 'grooming-brush-active'),
        isInteractive: true,
        position: rect(8, 62, 28, 20),
        presentation: 'cutout',
        touchArea: rect(2, 55, 40, 34),
      }),
      ...makeBeatObjects(sceneId, beats, vocabulary),
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        type: 'intro',
        instructionVi:
          'Bé cầm bàn chải nhẹ nhàng chải xuôi theo chiều lông của mèo con nhé.',
        instructionEn: 'Groom gently in the direction the fur grows.',
        successFeedbackVi: 'Mèo con rất thích được bé chải lông êm ái.',
        successFeedbackEn: 'The kitten enjoys the soft gentle brushing.',
        targetObjectIds: [heroId, brushId],
      }),
      ...makeBeatSteps(sceneId, beats, vocabulary),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Bộ lông của mèo con đã suôn mượt và sáng bóng.',
      messageEn: 'The kitten’s coat is smooth and shiny.',
    },
  };
}

function makeKittenPurrsScene(): Scene {
  const sceneId = 'kitten-purrs';
  const heroId = `${sceneId}-hero`;

  const beats: VocabularyBeat[] = [
    {
      key: 'purr',
      meaningVi: 'tiếng gừ gừ',
      word: 'purr',
      cueObjectId: heroId,
      teachVi: 'Chạm mèo con đang gừ gừ nhé.',
      teachEn: 'Tap the kitten purring happily.',
      teachSuccessEn: 'Purr is the happy vibrating sound a cat makes.',
      teachFailVi: 'Chạm bạn mèo đang kêu gừ gừ êm ái nhé.',
      teachFailEn: 'Tap the kitten making a gentle purring sound.',
      practice: {
        instructionVi: 'Chạm mèo để nghe tiếng gừ gừ thích thú nhé.',
        instructionEn: 'Tap the kitten to hear its joyful purr.',
        successVi: 'Mèo con phát ra tiếng gừ gừ rung rinh hạnh phúc.',
        successEn: 'The kitten purrs with warm happy vibrations.',
        failVi: 'Chạm chú mèo con nhé.',
        failEn: 'Tap the little kitten.',
        targetObjectId: heroId,
        successStateChanges: [sceneStateChanges.setVariant(heroId, 'purring')],
      },
    },
    {
      key: 'happy',
      meaningVi: 'vui vẻ',
      word: 'happy',
      type: 'adjective',
      cueObjectId: heroId,
      teachVi: 'Chạm chú mèo vui vẻ nhé.',
      teachEn: 'Tap the happy kitten.',
      teachSuccessEn: 'Happy means feeling cheerful and content.',
      teachFailVi: 'Chạm bạn mèo đang mỉm cười nhé.',
      teachFailEn: 'Tap the smiling kitten.',
      practice: {
        instructionVi: 'Chạm mèo con để bạn mỉm cười cùng bé nhé.',
        instructionEn: 'Tap the kitten to see its happy smile.',
        successVi: 'Mèo con mỉm cười vui sướng bên bé.',
        successEn: 'The kitten smiles with sweet joy.',
        failVi: 'Chạm chú mèo vui vẻ nhé.',
        failEn: 'Tap the happy kitten.',
        targetObjectId: heroId,
        successStateChanges: [sceneStateChanges.setVariant(heroId, 'happy')],
      },
    },
    {
      key: 'tail',
      meaningVi: 'cái đuôi',
      word: 'tail',
      cueAsset: 'kitten-tail-closeup',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm chiếc đuôi cong nhẹ nhé.',
      teachEn: 'Tap the curled kitten tail.',
      teachSuccessEn: 'A tail sways gently when a cat is calm.',
      teachFailVi: 'Chạm chiếc đuôi mềm màu cam nhé.',
      teachFailEn: 'Tap the soft orange tail.',
      practice: {
        instructionVi: 'Chạm đuôi mèo để xem đuôi vẫy khẽ nhé.',
        instructionEn: 'Tap the tail to see it sway gently.',
        successVi: 'Chiếc đuôi mèo đung đưa nhẹ nhàng thư thái.',
        successEn: 'The kitten’s tail sways gently with happiness.',
        failVi: 'Chạm chiếc đuôi mèo nhé.',
        failEn: 'Tap the kitten tail.',
      },
    },
    {
      key: 'cozy',
      meaningVi: 'ấm cúng dễ chịu',
      word: 'cozy',
      tier: 'expanded',
      type: 'adjective',
      cueObjectId: heroId,
      teachVi: 'Chạm chú mèo nằm dễ chịu nhé.',
      teachEn: 'Tap the cozy kitten resting.',
      teachSuccessEn: 'Cozy means warm, snug, and comfortable.',
      teachFailVi: 'Chạm bạn mèo nằm êm ái trên thảm nhé.',
      teachFailEn: 'Tap the kitten resting comfortably.',
      practice: {
        instructionVi: 'Chạm mèo con để bạn nằm êm ái nhé.',
        instructionEn: 'Tap the kitten to help it rest comfortably.',
        successVi: 'Mèo con cuộn tròn ấm cúng và rất dễ chịu.',
        successEn: 'The kitten curls up warm and cozy.',
        failVi: 'Chạm chú mèo con nhé.',
        failEn: 'Tap the little kitten.',
        targetObjectId: heroId,
        successStateChanges: [sceneStateChanges.setVariant(heroId, 'cozy')],
      },
    },
    {
      key: 'snuggle',
      meaningVi: 'dụi đầu âu yếm',
      word: 'snuggle',
      tier: 'expanded',
      type: 'verb',
      speechPractice: 'optional',
      cueAsset: 'snuggle-action-cue',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm mèo con đang dụi đầu nhé.',
      teachEn: 'Tap the kitten snuggling close.',
      teachSuccessEn: 'Snuggle means cuddle up lovingly.',
      teachFailVi: 'Chạm bạn mèo đang cọ má âu yếm nhé.',
      teachFailEn: 'Tap the kitten nuzzling gently.',
      practice: {
        instructionVi: 'Chạm mèo để đón bạn dụi đầu vào tay nhé.',
        instructionEn: 'Tap the kitten as it snuggles against your hand.',
        successVi: 'Mèo con dụi đầu vào tay bé thật tình cảm.',
        successEn: 'The kitten snuggles against your hand with love.',
        failVi: 'Chạm chú mèo con nhé.',
        failEn: 'Tap the little kitten.',
        targetObjectId: heroId,
      },
    },
    {
      key: 'happy-cat',
      meaningVi: 'chú mèo vui sướng',
      word: 'happy cat',
      tier: 'expanded',
      type: 'phrase',
      speechPractice: 'optional',
      cueObjectId: heroId,
      teachVi: 'Chạm chú mèo vui sướng nhé.',
      teachEn: 'Tap the happy contented cat.',
      teachSuccessEn: 'A happy cat is relaxed and loved.',
      teachFailVi: 'Chạm bạn mèo đang thỏa mãn nhé.',
      teachFailEn: 'Tap the relaxed and contented cat.',
      practice: {
        instructionVi: 'Chạm mèo con để chia sẻ niềm vui nhé.',
        instructionEn: 'Tap the kitten to share its happiness.',
        successVi: 'Mèo con vô cùng sung sướng vì được chăm sóc.',
        successEn: 'The happy cat feels loved and peaceful.',
        failVi: 'Chạm chú mèo nhé.',
        failEn: 'Tap the happy cat.',
        targetObjectId: heroId,
      },
    },
    {
      key: 'listen-to-purr',
      meaningVi: 'nghe tiếng gừ gừ',
      word: 'listen to purr',
      tier: 'challenge',
      type: 'phrase',
      cueAsset: 'listen-purr-cue',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm tai để nghe tiếng gừ gừ nhé.',
      teachEn: 'Tap the ear to listen to the purr.',
      teachSuccessEn: 'Listen to purr brings calmness and joy.',
      teachFailVi: 'Chạm biểu tượng nghe tiếng mèo kêu nhé.',
      teachFailEn: 'Tap the icon listening to the purr.',
      practice: {
        instructionVi: 'Chạm mèo để lắng nghe tiếng gừ êm ái nhé.',
        instructionEn: 'Tap the kitten to hear the gentle purr.',
        successVi: 'Tiếng gừ gừ nhỏ nhẹ như tiếng hát ru êm dịu.',
        successEn: 'The gentle purring sounds like a sweet lullaby.',
        failVi: 'Chạm chú mèo con nhé.',
        failEn: 'Tap the little kitten.',
        targetObjectId: heroId,
      },
    },
    {
      key: 'sweet-purr',
      meaningVi: 'tiếng gừ ngọt ngào',
      word: 'sweet purr',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueAsset: 'sweet-purr-soundwave',
      cuePosition: leftCue,
      cueTouchArea: leftCueTouch,
      teachVi: 'Chạm tiếng gừ ngọt ngào nhé.',
      teachEn: 'Tap the sweet purr sound.',
      teachSuccessEn: 'A sweet purr means the kitten feels completely safe.',
      teachFailVi: 'Chạm nốt nhạc tiếng gừ êm nhé.',
      teachFailEn: 'Tap the gentle purr notes.',
      practice: {
        instructionVi: 'Chạm mèo để thưởng thức âm thanh đáng yêu nhé.',
        instructionEn: 'Tap the kitten to enjoy its sweet purr.',
        successVi: 'Mèo con gừ gừ ngọt ngào và nhắm mắt lim dim.',
        successEn: 'The kitten makes a sweet purr and dozes peacefully.',
        failVi: 'Chạm chú mèo con nhé.',
        failEn: 'Tap the little kitten.',
        targetObjectId: heroId,
      },
    },
    {
      key: 'love-the-kitten',
      meaningVi: 'yêu thương mèo con',
      word: 'love the kitten',
      tier: 'challenge',
      type: 'phrase',
      speechPractice: 'optional',
      cueObjectId: heroId,
      teachVi: 'Chạm bàn tay yêu thương mèo con nhé.',
      teachEn: 'Tap the hand showing love to the kitten.',
      teachSuccessEn: 'Love the kitten means caring gently and kindly.',
      teachFailVi: 'Chạm bàn tay ôm ấp mèo con nhé.',
      teachFailEn: 'Tap the hand loving the kitten.',
      practice: {
        instructionVi: 'Chạm mèo con và nhớ rửa tay sạch sẽ nhé.',
        instructionEn: 'Tap the kitten and remember to wash your hands.',
        successVi: 'Bé đã chăm sóc mèo con thật chu đáo và nhớ rửa tay.',
        successEn:
          'You showed love to the kitten and remembered to wash your hands.',
        failVi: 'Chạm chú mèo con nhé.',
        failEn: 'Tap the little kitten.',
        targetObjectId: heroId,
        successStateChanges: [sceneStateChanges.setVariant(heroId, 'loved')],
        effects: [lessonEffects.sound('complete')],
      },
    },
  ];
  const vocabulary = makeBeatVocabulary(sceneId, beats);

  return {
    id: sceneId,
    titleVi: 'Mèo gừ gừ hạnh phúc',
    titleEn: 'Kitten Purrs',
    thumbnailEmoji: '💖',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: heroId,
        assetSource: sceneImageSource(sceneId, 'kitten-content'),
        isInteractive: true,
        position: rect(54, 43, 40, 39),
        presentation: 'cutout',
        touchArea: rect(47, 36, 52, 50),
        variants: [
          objectVariant({
            id: 'purring',
            assetSource: sceneImageSource(sceneId, 'kitten-purring-hearts'),
          }),
          objectVariant({
            id: 'happy',
            assetSource: sceneImageSource(sceneId, 'kitten-happy-smile'),
          }),
          objectVariant({
            id: 'cozy',
            assetSource: sceneImageSource(sceneId, 'kitten-cozy-curled'),
          }),
          objectVariant({
            id: 'loved',
            assetSource: sceneImageSource(sceneId, 'kitten-loved-peaceful'),
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
          'Mèo con cảm thấy thật dễ chịu. Bạn nhắm mắt và kêu gừ gừ hạnh phúc.',
        instructionEn:
          'The kitten feels so relaxed. It purrs happily with joy.',
        successFeedbackVi: 'Mèo con đang lim dim tận hưởng sự yêu thương.',
        successFeedbackEn: 'The kitten is relaxing in your gentle care.',
        targetObjectIds: [heroId],
      }),
      ...makeBeatSteps(sceneId, beats, vocabulary),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Mèo con đã được chải lông mượt mà và gừ gừ hạnh phúc.',
      messageEn: 'The kitten is neatly groomed and purring happily.',
    },
  };
}

export const groomTheKittenLesson: Lesson = {
  id: lessonId,
  themeId: 'nhung-nguoi-ban-dong-vat',
  titleVi: 'Chải lông cho mèo',
  titleEn: 'Groom the Kitten',
  descriptionVi:
    'Bé lấy chiếc bàn chải lông êm, chải nhẹ nhàng và nghe tiếng mèo con gừ gừ hạnh phúc.',
  descriptionEn:
    'Get a gentle brush, groom the soft fur, and listen to the happy kitten purr.',
  thumbnailEmoji: '🪮',
  ageRange: { min: 3, max: 8, label: '3-8 tuổi · Làm quen' },
  scenes: [
    makeGetTheBrushScene(),
    makeBrushTheFurScene(),
    makeKittenPurrsScene(),
  ],
  reviewGame: {
    id: `${lessonId}-review`,
    type: 'random',
    titleVi: 'Chải lông cho mèo',
    config: {
      vocabularyIds: [
        'vocab-groom-the-kitten-get-the-brush-kitten',
        'vocab-groom-the-kitten-get-the-brush-brush',
        'vocab-groom-the-kitten-brush-the-fur-smooth',
        'vocab-groom-the-kitten-kitten-purrs-purr',
        'vocab-groom-the-kitten-get-the-brush-mat',
        'vocab-groom-the-kitten-brush-the-fur-brush-the-fur',
      ],
    },
  },
  metadata: {
    parentTipVi:
      'Dùng bàn chải lông thú cưng chuyên dụng đầu tròn êm ái; luôn chải xuôi theo chiều lông mọc, không giật mạnh; lắng nghe tiếng gừ gừ (purr) của mèo con và nhớ nhắc bé rửa tay bằng xà phòng sau khi chăm sóc thú cưng.',
  },
};
