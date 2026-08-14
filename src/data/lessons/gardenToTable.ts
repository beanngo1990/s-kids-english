import type {
  LearningMode,
  LearningScope,
  Lesson,
  Scene,
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

const lessonId = 'garden-to-table';
const expandedScope = { minMode: 'expanded' } satisfies LearningScope;
const challengeScope = { minMode: 'challenge' } satisfies LearningScope;

type VocabularySpec = {
  key: string;
  meaningVi: string;
  tier?: LearningMode;
  type?: VocabularyType;
  word: string;
};

function vocabularyItem(
  sceneId: string,
  { key, meaningVi, tier = 'core', type = 'noun', word }: VocabularySpec,
): VocabularyItem {
  return {
    id: `vocab-${lessonId}-${sceneId}-${key}`,
    learningScope:
      tier === 'expanded'
        ? expandedScope
        : tier === 'challenge'
        ? challengeScope
        : undefined,
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

function makeRinseAndDrainScene(): Scene {
  const sceneId = 'rinse-and-drain';
  const vocabulary = [
    vocabularyItem(sceneId, {
      key: 'cucumber',
      meaningVi: 'quả dưa leo',
      word: 'cucumber',
    }),
    vocabularyItem(sceneId, {
      key: 'rinse',
      meaningVi: 'rửa nhanh dưới nước sạch',
      type: 'verb',
      word: 'rinse',
    }),
    vocabularyItem(sceneId, {
      key: 'lettuce',
      meaningVi: 'rau xà lách',
      word: 'lettuce',
    }),
    vocabularyItem(sceneId, {
      key: 'colander',
      meaningVi: 'rổ để ráo nước',
      tier: 'expanded',
      word: 'colander',
    }),
    vocabularyItem(sceneId, {
      key: 'rinse-it-well',
      meaningVi: 'rửa thật sạch',
      tier: 'challenge',
      type: 'phrase',
      word: 'rinse it well',
    }),
  ];
  const vocab = new Map(vocabulary.map(item => [item.word, item]));
  const cucumberId = `${sceneId}-cucumber`;
  const lettuceId = `${sceneId}-lettuce`;
  const waterControlId = `${sceneId}-water-control`;
  const waterStreamId = `${sceneId}-water-stream`;
  const rinseActionId = `${sceneId}-rinse-action`;
  const colanderId = `${sceneId}-colander`;
  const rinseWellActionId = `${sceneId}-rinse-well-action`;
  const splashOnlyActionId = `${sceneId}-splash-only-action`;
  const washZoneId = `${sceneId}-wash-zone`;
  const colanderZoneId = `${sceneId}-colander-zone`;

  return {
    id: sceneId,
    titleVi: 'Rửa và để ráo',
    titleEn: 'Rinse and Drain',
    thumbnailEmoji: '🥒',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      learningObject({
        id: cucumberId,
        assetSource: sceneImageSource(sceneId, 'cucumber-dirty'),
        position: rect(6, 24, 29, 24),
        touchArea: rect(2, 19, 37, 34),
        variants: [
          objectVariant({
            id: 'clean',
            assetSource: sceneImageSource(sceneId, 'cucumber-clean'),
          }),
        ],
        vocab: vocab.get('cucumber')!,
      }),
      learningObject({
        id: lettuceId,
        assetSource: sceneImageSource(sceneId, 'lettuce-dirty'),
        position: rect(5, 51, 32, 28),
        touchArea: rect(1, 46, 40, 38),
        variants: [
          objectVariant({
            id: 'clean',
            assetSource: sceneImageSource(sceneId, 'lettuce-clean'),
          }),
        ],
        vocab: vocab.get('lettuce')!,
      }),
      sceneObject({
        id: waterControlId,
        assetSource: sceneImageSource(sceneId, 'water-control'),
        isInteractive: true,
        position: rect(75, 17, 20, 18),
        presentation: 'cutout',
        touchArea: rect(70, 12, 29, 28),
      }),
      sceneObject({
        id: waterStreamId,
        assetSource: sceneImageSource(sceneId, 'water-stream'),
        initialVisibility: 'hidden',
        position: rect(62, 28, 31, 42),
        presentation: 'cutout',
      }),
      learningObject({
        id: rinseActionId,
        assetSource: sceneImageSource(sceneId, 'rinse-action'),
        initialVisibility: 'hidden',
        position: rect(36, 17, 31, 27),
        touchArea: rect(31, 12, 41, 37),
        vocab: vocab.get('rinse')!,
      }),
      learningObject({
        id: colanderId,
        assetSource: sceneImageSource(sceneId, 'colander-empty'),
        learningScope: expandedScope,
        position: rect(63, 66, 32, 27),
        touchArea: rect(58, 61, 41, 36),
        variants: [
          objectVariant({
            id: 'filled',
            assetSource: sceneImageSource(sceneId, 'colander-filled'),
          }),
        ],
        vocab: vocab.get('colander')!,
      }),
      learningObject({
        id: rinseWellActionId,
        assetSource: sceneImageSource(sceneId, 'rinse-well-action'),
        initialVisibility: 'hidden',
        learningScope: challengeScope,
        position: rect(3, 72, 44, 22),
        touchArea: rect(1, 68, 48, 29),
        vocab: vocab.get('rinse it well')!,
      }),
      sceneObject({
        id: splashOnlyActionId,
        assetSource: sceneImageSource(sceneId, 'splash-only-action'),
        initialVisibility: 'hidden',
        isInteractive: true,
        learningScope: challengeScope,
        position: rect(53, 72, 44, 22),
        presentation: 'cutout',
        touchArea: rect(51, 68, 48, 29),
      }),
    ],
    dropZones: [
      {
        id: washZoneId,
        position: rect(62, 29, 30, 40),
        touchArea: rect(57, 24, 40, 50),
      },
      {
        id: colanderZoneId,
        learningScope: expandedScope,
        position: rect(63, 65, 32, 28),
        touchArea: rect(58, 60, 42, 38),
      },
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        instructionVi: 'Rau quả đã tới chỗ rửa. Mình dùng nước sạch nhé.',
        instructionEn: 'The produce is ready. Let us wash it with clean water.',
        successFeedbackVi: 'Mình rửa từng loại rồi để nước chảy xuống.',
        successFeedbackEn: 'We will rinse each one and let the water drain away.',
        targetObjectIds: [cucumberId, lettuceId],
        type: 'intro',
      }),
      tapStep({
        id: `${sceneId}-learn-cucumber`,
        instructionVi: 'Chạm quả dưa leo còn ít đất nhé.',
        instructionEn: 'Tap the cucumber with a little soil on it.',
        promptText: 'cucumber',
        successFeedbackVi: 'Đúng rồi, đây là quả dưa leo.',
        successFeedbackEn: 'Yes, this is a cucumber.',
        failFeedbackVi: 'Chạm quả dài màu xanh bên trái nhé.',
        failFeedbackEn: 'Tap the long green vegetable on the left.',
        speechPractice: 'auto',
        targetObjectId: cucumberId,
        type: 'teach',
        vocabId: vocab.get('cucumber')!.id,
      }),
      tapStep({
        id: `${sceneId}-turn-on-water`,
        instructionVi: 'Chạm giọt nước xanh để bật nước sạch nhé.',
        instructionEn: 'Tap the blue water drop to turn on clean water.',
        successFeedbackVi: 'Dòng nước sạch đã chảy rồi.',
        successFeedbackEn: 'The clean water is flowing now.',
        failFeedbackVi: 'Chạm giọt nước xanh ở góc trên nhé.',
        failFeedbackEn: 'The blue water drop is in the upper corner.',
        successStateChanges: [
          sceneStateChanges.show(waterStreamId),
          sceneStateChanges.show(rinseActionId),
        ],
        targetObjectId: waterControlId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-learn-rinse`,
        instructionVi: 'Chạm hình hai tay đang rửa dưa leo nhé.',
        instructionEn: 'Tap the hands rinsing the cucumber under water.',
        promptText: 'rinse',
        successFeedbackVi: 'Đúng rồi, đó là rửa dưới nước sạch.',
        successFeedbackEn: 'Yes, rinse means to wash it under clean water.',
        failFeedbackVi: 'Chạm hình có tay, dưa leo và nước nhé.',
        failFeedbackEn: 'Tap the picture with hands, cucumber, and water.',
        speechPractice: 'auto',
        afterSuccessStateChanges: [sceneStateChanges.hide(rinseActionId)],
        targetObjectId: rinseActionId,
        type: 'teach',
        vocabId: vocab.get('rinse')!.id,
      }),
      dragStep({
        id: `${sceneId}-rinse-cucumber`,
        instructionVi: 'Kéo dưa leo tới dòng nước bên phải nhé.',
        instructionEn: 'Drag the cucumber to the water on the right.',
        successFeedbackVi: 'Dưa leo đã sạch đất rồi.',
        successFeedbackEn: 'The soil is rinsed off the cucumber.',
        failFeedbackVi: 'Kéo quả dài màu xanh vào dòng nước nhé.',
        failFeedbackEn: 'Drag the long green cucumber into the water.',
        effects: [lessonEffects.sparkle(cucumberId)],
        successStateChanges: [
          sceneStateChanges.setVariant(cucumberId, 'clean'),
        ],
        dropZoneId: washZoneId,
        targetObjectId: cucumberId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-learn-lettuce`,
        instructionVi: 'Chạm cụm lá xà lách ở bên trái nhé.',
        instructionEn: 'Tap the bunch of lettuce leaves on the left.',
        promptText: 'lettuce',
        successFeedbackVi: 'Đúng rồi, đây là rau xà lách.',
        successFeedbackEn: 'Yes, this is lettuce.',
        failFeedbackVi: 'Chạm cụm lá xanh lớn phía dưới nhé.',
        failFeedbackEn: 'Tap the large green leaves below.',
        speechPractice: 'auto',
        targetObjectId: lettuceId,
        type: 'teach',
        vocabId: vocab.get('lettuce')!.id,
      }),
      dragStep({
        id: `${sceneId}-rinse-lettuce`,
        instructionVi: 'Kéo xà lách tới dòng nước bên phải nhé.',
        instructionEn: 'Drag the lettuce to the water on the right.',
        successFeedbackVi: 'Các lá xà lách đã sạch rồi.',
        successFeedbackEn: 'The lettuce leaves are clean now.',
        failFeedbackVi: 'Kéo cụm lá xanh vào dòng nước nhé.',
        failFeedbackEn: 'Drag the green leaves into the water.',
        effects: [lessonEffects.sparkle(lettuceId)],
        successStateChanges: [
          sceneStateChanges.setVariant(lettuceId, 'clean'),
        ],
        dropZoneId: washZoneId,
        targetObjectId: lettuceId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-learn-colander`,
        instructionVi: 'Chạm chiếc rổ có nhiều lỗ bên phải nhé.',
        instructionEn: 'Tap the colander with many holes on the right.',
        learningScope: expandedScope,
        promptText: 'colander',
        successFeedbackVi: 'Đây là chiếc rổ giúp nước chảy xuống.',
        successFeedbackEn: 'This colander lets the water drain away.',
        failFeedbackVi: 'Chạm chiếc rổ tròn phía dưới nhé.',
        failFeedbackEn: 'Tap the round colander below.',
        speechPractice: 'optional',
        targetObjectId: colanderId,
        type: 'teach',
        vocabId: vocab.get('colander')!.id,
      }),
      dragStep({
        id: `${sceneId}-place-produce-in-colander`,
        instructionVi: 'Kéo dưa leo sạch vào chiếc rổ nhé.',
        instructionEn: 'Drag the clean cucumber into the colander.',
        learningScope: expandedScope,
        successFeedbackVi: 'Rau quả sạch đang để ráo nước.',
        successFeedbackEn: 'The clean produce is draining in the colander.',
        failFeedbackVi: 'Kéo dưa leo vào rổ có nhiều lỗ nhé.',
        failFeedbackEn: 'Drag the cucumber into the colander with holes.',
        effects: [lessonEffects.sparkle(colanderId)],
        successStateChanges: [
          sceneStateChanges.setVariant(colanderId, 'filled'),
          sceneStateChanges.hide(cucumberId),
          sceneStateChanges.hide(lettuceId),
          sceneStateChanges.hide(waterStreamId),
          sceneStateChanges.show(rinseWellActionId),
          sceneStateChanges.show(splashOnlyActionId),
        ],
        dropZoneId: colanderZoneId,
        targetObjectId: cucumberId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-learn-rinse-it-well`,
        instructionVi: 'Chạm hình rửa sạch cả hai mặt nhé.',
        instructionEn: 'Tap the picture rinsing both sides well.',
        learningScope: challengeScope,
        promptText: 'rinse it well',
        successFeedbackVi: 'Đúng rồi, mình rửa thật sạch.',
        successFeedbackEn: 'Yes, rinse it well means wash every side.',
        failFeedbackVi: 'Chạm hình có nhiều dòng nước bên trái nhé.',
        failFeedbackEn: 'Tap the picture with water over every side.',
        speechPractice: 'auto',
        targetObjectId: rinseWellActionId,
        type: 'teach',
        vocabId: vocab.get('rinse it well')!.id,
      }),
      findStep({
        id: `${sceneId}-choose-rinse-it-well`,
        instructionVi: 'Tìm hình rửa sạch toàn bộ rau quả nhé.',
        instructionEn: 'Find the picture that rinses all of the produce.',
        learningScope: challengeScope,
        promptText: 'rinse it well',
        successFeedbackVi: 'Đúng rồi, mọi mặt đều được rửa sạch.',
        successFeedbackEn: 'Right, every side is rinsed well.',
        failFeedbackVi: 'Tìm hình nước chảy trên cả rau quả nhé.',
        failFeedbackEn: 'Find the picture with water over all the produce.',
        correctObjectIds: [rinseWellActionId],
        targetObjectId: rinseWellActionId,
        targetObjectIds: [rinseWellActionId, splashOnlyActionId],
        afterSuccessStateChanges: [
          sceneStateChanges.hide(rinseWellActionId),
          sceneStateChanges.hide(splashOnlyActionId),
        ],
        type: 'review',
        vocabId: vocab.get('rinse it well')!.id,
      }),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Bé đã rửa sạch rau quả và để nước chảy xuống.',
      messageEn: 'You rinsed the produce and let the water drain away.',
    },
  };
}

function makeAndShareScene(): Scene {
  const sceneId = 'make-and-share';
  const vocabulary = [
    vocabularyItem(sceneId, {
      key: 'bowl',
      meaningVi: 'cái tô',
      word: 'bowl',
    }),
    vocabularyItem(sceneId, {
      key: 'salad',
      meaningVi: 'món rau trộn nguội',
      word: 'salad',
    }),
    vocabularyItem(sceneId, {
      key: 'share',
      meaningVi: 'chia sẻ',
      type: 'verb',
      word: 'share',
    }),
    vocabularyItem(sceneId, {
      key: 'kitchen-towel',
      meaningVi: 'khăn bếp',
      tier: 'expanded',
      word: 'kitchen towel',
    }),
  ];
  const vocab = new Map(vocabulary.map(item => [item.word, item]));
  const towelId = `${sceneId}-kitchen-towel`;
  const bowlId = `${sceneId}-bowl`;
  const lettucePiecesId = `${sceneId}-lettuce-pieces`;
  const cucumberSlicesId = `${sceneId}-cucumber-slices`;
  const spoonId = `${sceneId}-spoon`;
  const saladCloseupId = `${sceneId}-salad-closeup`;
  const shareActionId = `${sceneId}-share-action`;
  const towelZoneId = `${sceneId}-towel-zone`;
  const bowlZoneId = `${sceneId}-bowl-zone`;
  const shareZoneId = `${sceneId}-share-zone`;

  return {
    id: sceneId,
    titleVi: 'Làm và chia sẻ',
    titleEn: 'Make and Share',
    thumbnailEmoji: '🥗',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      learningObject({
        id: towelId,
        assetSource: sceneImageSource(sceneId, 'towel-folded'),
        learningScope: expandedScope,
        position: rect(5, 66, 29, 23),
        touchArea: rect(1, 61, 38, 33),
        variants: [
          objectVariant({
            id: 'under-bowl',
            assetSource: sceneImageSource(sceneId, 'towel-under-bowl'),
            position: rect(33, 61, 34, 26),
            touchArea: rect(28, 56, 44, 36),
          }),
        ],
        vocab: vocab.get('kitchen towel')!,
      }),
      learningObject({
        id: bowlId,
        assetSource: sceneImageSource(sceneId, 'bowl-empty'),
        position: rect(35, 43, 31, 28),
        touchArea: rect(30, 38, 41, 38),
        variants: [
          objectVariant({
            id: 'with-lettuce',
            assetSource: sceneImageSource(sceneId, 'bowl-lettuce'),
          }),
          objectVariant({
            id: 'prepared',
            assetSource: sceneImageSource(sceneId, 'bowl-prepared'),
          }),
          objectVariant({
            id: 'mixed',
            assetSource: sceneImageSource(sceneId, 'bowl-mixed'),
          }),
          objectVariant({
            id: 'shared',
            assetSource: sceneImageSource(sceneId, 'bowl-shared'),
            position: rect(28, 42, 45, 31),
            touchArea: rect(23, 37, 55, 41),
          }),
        ],
        vocab: vocab.get('bowl')!,
      }),
      sceneObject({
        id: lettucePiecesId,
        assetSource: sceneImageSource(sceneId, 'lettuce-pieces'),
        isInteractive: true,
        position: rect(5, 22, 29, 24),
        presentation: 'cutout',
        touchArea: rect(1, 17, 38, 34),
      }),
      sceneObject({
        id: cucumberSlicesId,
        assetSource: sceneImageSource(sceneId, 'cucumber-slices'),
        isInteractive: true,
        position: rect(68, 22, 27, 24),
        presentation: 'cutout',
        touchArea: rect(63, 17, 36, 34),
      }),
      sceneObject({
        id: spoonId,
        assetSource: sceneImageSource(sceneId, 'spoon'),
        isInteractive: true,
        position: rect(72, 54, 22, 28),
        presentation: 'cutout',
        touchArea: rect(67, 49, 31, 38),
      }),
      learningObject({
        id: saladCloseupId,
        assetSource: sceneImageSource(sceneId, 'salad-closeup'),
        initialVisibility: 'hidden',
        position: rect(34, 16, 34, 27),
        touchArea: rect(29, 11, 44, 37),
        vocab: vocab.get('salad')!,
      }),
      learningObject({
        id: shareActionId,
        assetSource: sceneImageSource(sceneId, 'share-action'),
        initialVisibility: 'hidden',
        position: rect(28, 72, 44, 23),
        touchArea: rect(23, 68, 54, 30),
        vocab: vocab.get('share')!,
      }),
    ],
    dropZones: [
      {
        id: towelZoneId,
        learningScope: expandedScope,
        position: rect(34, 61, 33, 26),
        touchArea: rect(29, 56, 43, 36),
      },
      {
        id: bowlZoneId,
        position: rect(34, 42, 33, 30),
        touchArea: rect(29, 37, 43, 40),
      },
      {
        id: shareZoneId,
        position: rect(28, 71, 44, 25),
        touchArea: rect(23, 66, 54, 34),
      },
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        instructionVi: 'Người lớn đã cắt rau an toàn. Mình làm món nguội nhé.',
        instructionEn: 'An adult prepared the ingredients safely. Let us make a cold salad.',
        successFeedbackVi: 'Mình chỉ cho rau vào tô rồi trộn nhẹ.',
        successFeedbackEn: 'We only need to add the produce and mix gently.',
        targetObjectIds: [lettucePiecesId, cucumberSlicesId, bowlId],
        type: 'intro',
      }),
      tapStep({
        id: `${sceneId}-learn-kitchen-towel`,
        instructionVi: 'Chạm chiếc khăn bếp gấp bên trái nhé.',
        instructionEn: 'Tap the folded kitchen towel on the left.',
        learningScope: expandedScope,
        promptText: 'kitchen towel',
        successFeedbackVi: 'Khăn bếp giúp giữ mặt bàn khô.',
        successFeedbackEn: 'The kitchen towel helps keep the counter dry.',
        failFeedbackVi: 'Chạm miếng vải gấp ở phía dưới nhé.',
        failFeedbackEn: 'The folded kitchen cloth is below.',
        speechPractice: 'optional',
        targetObjectId: towelId,
        type: 'teach',
        vocabId: vocab.get('kitchen towel')!.id,
      }),
      dragStep({
        id: `${sceneId}-place-towel`,
        instructionVi: 'Kéo khăn bếp xuống dưới chiếc tô nhé.',
        instructionEn: 'Drag the kitchen towel under the bowl.',
        learningScope: expandedScope,
        successFeedbackVi: 'Khăn đã nằm dưới tô rồi.',
        successFeedbackEn: 'The towel is under the bowl now.',
        failFeedbackVi: 'Kéo khăn gấp vào vùng dưới tô nhé.',
        failFeedbackEn: 'Drag the folded towel below the bowl.',
        successStateChanges: [
          sceneStateChanges.setVariant(towelId, 'under-bowl'),
        ],
        dropZoneId: towelZoneId,
        targetObjectId: towelId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-learn-bowl`,
        instructionVi: 'Chạm chiếc tô trống ở giữa nhé.',
        instructionEn: 'Tap the empty bowl in the middle.',
        promptText: 'bowl',
        successFeedbackVi: 'Đúng rồi, đây là một chiếc tô.',
        successFeedbackEn: 'Yes, this is a bowl.',
        failFeedbackVi: 'Chạm vật tròn có thành kín ở giữa nhé.',
        failFeedbackEn: 'The solid round bowl is in the middle.',
        speechPractice: 'auto',
        targetObjectId: bowlId,
        type: 'teach',
        vocabId: vocab.get('bowl')!.id,
      }),
      dragStep({
        id: `${sceneId}-add-lettuce`,
        instructionVi: 'Kéo xà lách đã chuẩn bị vào tô nhé.',
        instructionEn: 'Drag the prepared lettuce into the bowl.',
        successFeedbackVi: 'Xà lách đã vào tô rồi.',
        successFeedbackEn: 'The lettuce is in the bowl now.',
        failFeedbackVi: 'Kéo các lá xanh bên trái vào tô nhé.',
        failFeedbackEn: 'Drag the green leaves on the left into the bowl.',
        successStateChanges: [
          sceneStateChanges.hide(lettucePiecesId),
          sceneStateChanges.setVariant(bowlId, 'with-lettuce'),
        ],
        dropZoneId: bowlZoneId,
        targetObjectId: lettucePiecesId,
        type: 'practice',
      }),
      dragStep({
        id: `${sceneId}-add-cucumber`,
        instructionVi: 'Kéo các lát dưa leo vào tô nhé.',
        instructionEn: 'Drag the cucumber slices into the bowl.',
        successFeedbackVi: 'Rau và dưa leo đã ở cùng nhau.',
        successFeedbackEn: 'The lettuce and cucumber are together.',
        failFeedbackVi: 'Kéo các lát tròn màu xanh vào tô nhé.',
        failFeedbackEn: 'Drag the round green slices into the bowl.',
        effects: [lessonEffects.sparkle(bowlId)],
        successStateChanges: [
          sceneStateChanges.hide(cucumberSlicesId),
          sceneStateChanges.setVariant(bowlId, 'prepared'),
          sceneStateChanges.show(saladCloseupId),
        ],
        dropZoneId: bowlZoneId,
        targetObjectId: cucumberSlicesId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-learn-salad`,
        instructionVi: 'Chạm tô rau nguội đã chuẩn bị nhé.',
        instructionEn: 'Tap the bowl of prepared cold salad.',
        promptText: 'salad',
        successFeedbackVi: 'Đúng rồi, đây là món rau trộn nguội.',
        successFeedbackEn: 'Yes, this is a cold salad.',
        failFeedbackVi: 'Chạm tô có xà lách và dưa leo nhé.',
        failFeedbackEn: 'Tap the bowl with lettuce and cucumber.',
        speechPractice: 'auto',
        targetObjectId: saladCloseupId,
        type: 'teach',
        vocabId: vocab.get('salad')!.id,
      }),
      tapStep({
        id: `${sceneId}-mix-salad`,
        instructionVi: 'Chạm chiếc thìa bên phải để trộn nhẹ nhé.',
        instructionEn: 'Tap the spoon on the right to mix gently.',
        successFeedbackVi: 'Món rau đã được trộn đều.',
        successFeedbackEn: 'The cold salad is mixed now.',
        failFeedbackVi: 'Chạm chiếc thìa dài cạnh tô nhé.',
        failFeedbackEn: 'Tap the long spoon beside the bowl.',
        effects: [lessonEffects.sparkle(bowlId)],
        successStateChanges: [
          sceneStateChanges.setVariant(bowlId, 'mixed'),
          sceneStateChanges.hide(saladCloseupId),
          sceneStateChanges.show(shareActionId),
        ],
        targetObjectId: spoonId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-learn-share`,
        instructionVi: 'Chạm hình chia món thành hai phần nhé.',
        instructionEn: 'Tap the picture sharing the salad in two portions.',
        promptText: 'share',
        successFeedbackVi: 'Đúng rồi, đó là cùng chia sẻ.',
        successFeedbackEn: 'Yes, share means to enjoy it together.',
        failFeedbackVi: 'Chạm hình có hai phần ăn phía dưới nhé.',
        failFeedbackEn: 'Tap the picture with two portions below.',
        speechPractice: 'auto',
        targetObjectId: shareActionId,
        type: 'teach',
        vocabId: vocab.get('share')!.id,
      }),
      dragStep({
        id: `${sceneId}-share-salad`,
        instructionVi: 'Kéo tô rau tới hình hai phần ăn nhé.',
        instructionEn: 'Drag the salad bowl to the two portions.',
        successFeedbackVi: 'Món rau đã được chia sẻ rồi.',
        successFeedbackEn: 'The salad is ready to share.',
        failFeedbackVi: 'Kéo chiếc tô tới hình hai phần phía dưới nhé.',
        failFeedbackEn: 'Drag the bowl to the two portions below.',
        effects: [lessonEffects.sparkle(bowlId)],
        successStateChanges: [
          sceneStateChanges.setVariant(bowlId, 'shared'),
          sceneStateChanges.hide(shareActionId),
          sceneStateChanges.hide(spoonId),
        ],
        dropZoneId: shareZoneId,
        targetObjectId: bowlId,
        type: 'practice',
      }),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Bé đã làm món nguội từ nguyên liệu an toàn và chia sẻ cùng nhau.',
      messageEn: 'You made a cold salad from safely prepared ingredients and shared it.',
    },
  };
}

function makeSaveForNextSeasonScene(): Scene {
  const sceneId = 'save-for-next-season';
  const vocabulary = [
    vocabularyItem(sceneId, {
      key: 'save-the-seeds',
      meaningVi: 'giữ hạt cho mùa sau',
      tier: 'challenge',
      type: 'phrase',
      word: 'save the seeds',
    }),
  ];
  const vocab = new Map(vocabulary.map(item => [item.word, item]));
  const adultHandSeedId = `${sceneId}-adult-hand-seed`;
  const seedCloseupId = `${sceneId}-seed-closeup`;
  const envelopeId = `${sceneId}-envelope`;
  const placeSeedControlId = `${sceneId}-place-seed-control`;
  const adultStoreControlId = `${sceneId}-adult-store-control`;
  const timeCueId = `${sceneId}-time-cue`;
  const newSeasonPotId = `${sceneId}-new-season-pot`;
  const saveSeedsActionId = `${sceneId}-save-seeds-action`;
  const plantNowActionId = `${sceneId}-plant-now-action`;

  return {
    id: sceneId,
    titleVi: 'Giữ hạt cho mùa sau',
    titleEn: 'Save for Next Season',
    thumbnailEmoji: '✉️',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: adultHandSeedId,
        assetSource: sceneImageSource(sceneId, 'adult-hand-seed'),
        isInteractive: true,
        position: rect(6, 27, 33, 28),
        presentation: 'cutout',
        touchArea: rect(2, 22, 42, 38),
      }),
      sceneObject({
        id: seedCloseupId,
        assetSource: sceneImageSource(sceneId, 'seed-closeup'),
        initialVisibility: 'hidden',
        position: rect(37, 13, 26, 23),
        presentation: 'cutout',
      }),
      sceneObject({
        id: envelopeId,
        assetSource: sceneImageSource(sceneId, 'envelope-empty'),
        isInteractive: true,
        position: rect(62, 31, 32, 27),
        presentation: 'cutout',
        touchArea: rect(57, 26, 42, 37),
        variants: [
          objectVariant({
            id: 'filled',
            assetSource: sceneImageSource(sceneId, 'envelope-filled'),
          }),
          objectVariant({
            id: 'closed',
            assetSource: sceneImageSource(sceneId, 'envelope-closed'),
          }),
          objectVariant({
            id: 'stored',
            assetSource: sceneImageSource(sceneId, 'envelope-stored'),
            position: rect(62, 21, 32, 28),
            touchArea: rect(57, 16, 42, 38),
          }),
        ],
      }),
      sceneObject({
        id: placeSeedControlId,
        assetSource: sceneImageSource(sceneId, 'place-seed-control'),
        initialVisibility: 'hidden',
        isInteractive: true,
        position: rect(30, 46, 38, 24),
        presentation: 'cutout',
        touchArea: rect(25, 41, 48, 34),
      }),
      sceneObject({
        id: adultStoreControlId,
        assetSource: sceneImageSource(sceneId, 'adult-store-control'),
        initialVisibility: 'hidden',
        isInteractive: true,
        position: rect(34, 64, 32, 24),
        presentation: 'cutout',
        touchArea: rect(29, 59, 42, 34),
      }),
      sceneObject({
        id: timeCueId,
        assetSource: sceneImageSource(sceneId, 'time-cue'),
        initialVisibility: 'hidden',
        isInteractive: true,
        position: rect(37, 65, 27, 24),
        presentation: 'cutout',
        touchArea: rect(32, 60, 37, 34),
      }),
      sceneObject({
        id: newSeasonPotId,
        assetSource: sceneImageSource(sceneId, 'new-season-pot'),
        initialVisibility: 'hidden',
        isInteractive: true,
        position: rect(32, 55, 38, 36),
        presentation: 'cutout',
        touchArea: rect(27, 50, 48, 46),
      }),
      learningObject({
        id: saveSeedsActionId,
        assetSource: sceneImageSource(sceneId, 'save-seeds-action'),
        initialVisibility: 'hidden',
        learningScope: challengeScope,
        position: rect(3, 70, 44, 23),
        touchArea: rect(1, 66, 48, 30),
        vocab: vocab.get('save the seeds')!,
      }),
      sceneObject({
        id: plantNowActionId,
        assetSource: sceneImageSource(sceneId, 'plant-now-action'),
        initialVisibility: 'hidden',
        isInteractive: true,
        learningScope: challengeScope,
        position: rect(53, 70, 44, 23),
        presentation: 'cutout',
        touchArea: rect(51, 66, 48, 30),
      }),
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        instructionVi: 'Người lớn đã chuẩn bị một hạt khô cho mùa sau.',
        instructionEn: 'An adult prepared one dry tomato seed for next season.',
        successFeedbackVi: 'Mình chỉ chạm hình và nhờ người lớn cất hạt nhé.',
        successFeedbackEn: 'We will tap the pictures and ask an adult to store it.',
        targetObjectIds: [adultHandSeedId, envelopeId],
        type: 'intro',
      }),
      tapStep({
        id: `${sceneId}-notice-dry-seed`,
        instructionVi: 'Chạm hạt khô trên tay người lớn nhé.',
        instructionEn: 'Tap the dry seed on the adult hand.',
        successFeedbackVi: 'Đây là hạt cà chua đã được làm khô.',
        successFeedbackEn: 'This tomato seed has already been dried.',
        failFeedbackVi: 'Chạm hạt nhỏ trên lòng bàn tay nhé.',
        failFeedbackEn: 'Tap the small seed on the open hand.',
        successStateChanges: [
          sceneStateChanges.show(seedCloseupId),
          sceneStateChanges.show(placeSeedControlId),
        ],
        targetObjectId: adultHandSeedId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-place-seed-in-envelope`,
        instructionVi: 'Chạm bàn tay để người lớn cất hạt nhé.',
        instructionEn: 'Tap the hand so the adult can store the seed.',
        successFeedbackVi: 'Hạt khô đã ở trong phong bì.',
        successFeedbackEn: 'The dry seed is inside the envelope.',
        failFeedbackVi: 'Chạm bàn tay đang đưa hạt tới phong bì nhé.',
        failFeedbackEn: 'The hand moving the seed is beside the envelope.',
        effects: [lessonEffects.sparkle(envelopeId)],
        successStateChanges: [
          sceneStateChanges.setVariant(envelopeId, 'filled'),
          sceneStateChanges.hide(adultHandSeedId),
          sceneStateChanges.hide(seedCloseupId),
          sceneStateChanges.hide(placeSeedControlId),
        ],
        targetObjectId: placeSeedControlId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-close-envelope`,
        instructionVi: 'Chạm nắp phong bì để đóng lại nhé.',
        instructionEn: 'Tap the envelope flap to close it.',
        successFeedbackVi: 'Phong bì đã đóng kín rồi.',
        successFeedbackEn: 'The seed envelope is closed now.',
        failFeedbackVi: 'Chạm phần nắp tam giác của phong bì nhé.',
        failFeedbackEn: 'Tap the triangular flap on the envelope.',
        successStateChanges: [
          sceneStateChanges.setVariant(envelopeId, 'closed'),
          sceneStateChanges.show(adultStoreControlId),
          sceneStateChanges.show(saveSeedsActionId),
          sceneStateChanges.show(plantNowActionId),
        ],
        targetObjectId: envelopeId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-learn-save-the-seeds`,
        instructionVi: 'Chạm hình tay người lớn cất hạt khô nhé.',
        instructionEn: 'Tap the adult hand saving the dry seeds.',
        learningScope: challengeScope,
        promptText: 'save the seeds',
        successFeedbackVi: 'Đúng rồi, mình giữ hạt cho mùa sau.',
        successFeedbackEn: 'Yes, save the seeds means keep them for next season.',
        failFeedbackVi: 'Chạm hình bàn tay và phong bì bên trái nhé.',
        failFeedbackEn: 'Tap the picture with a hand and envelope on the left.',
        speechPractice: 'auto',
        targetObjectId: saveSeedsActionId,
        type: 'teach',
        vocabId: vocab.get('save the seeds')!.id,
      }),
      findStep({
        id: `${sceneId}-choose-save-the-seeds`,
        instructionVi: 'Tìm hình cất hạt khô cho mùa sau nhé.',
        instructionEn: 'Find the picture saving dry seeds for next season.',
        learningScope: challengeScope,
        promptText: 'save the seeds',
        successFeedbackVi: 'Đúng rồi, người lớn sẽ cất hạt khô.',
        successFeedbackEn: 'Right, an adult will store the dry seeds.',
        failFeedbackVi: 'Tìm hình hạt được cho vào phong bì nhé.',
        failFeedbackEn: 'Find the picture placing seeds into an envelope.',
        correctObjectIds: [saveSeedsActionId],
        targetObjectId: saveSeedsActionId,
        targetObjectIds: [saveSeedsActionId, plantNowActionId],
        afterSuccessStateChanges: [
          sceneStateChanges.hide(saveSeedsActionId),
          sceneStateChanges.hide(plantNowActionId),
        ],
        type: 'review',
        vocabId: vocab.get('save the seeds')!.id,
      }),
      tapStep({
        id: `${sceneId}-ask-adult-to-store`,
        instructionVi: 'Chạm bàn tay để nhờ người lớn cất phong bì nhé.',
        instructionEn: 'Tap the hand to ask an adult to store the envelope.',
        successFeedbackVi: 'Phong bì đã được cất an toàn.',
        successFeedbackEn: 'The envelope is stored safely.',
        failFeedbackVi: 'Chạm bàn tay ở phía dưới nhé.',
        failFeedbackEn: 'The adult hand is below the envelope.',
        effects: [lessonEffects.sparkle(envelopeId)],
        successStateChanges: [
          sceneStateChanges.setVariant(envelopeId, 'stored'),
          sceneStateChanges.hide(adultStoreControlId),
          sceneStateChanges.show(timeCueId),
        ],
        targetObjectId: adultStoreControlId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-wait-for-next-season`,
        instructionVi: 'Chạm vòng thời gian để sang mùa mới nhé.',
        instructionEn: 'Tap the time circle to move to the next season.',
        successFeedbackVi: 'Thời gian trôi và một mùa mới bắt đầu.',
        successFeedbackEn: 'Time passes, and a new growing season begins.',
        failFeedbackVi: 'Chạm vòng có mặt trời và chiếc lá nhé.',
        failFeedbackEn: 'Tap the circle with the sun and leaf.',
        successStateChanges: [
          sceneStateChanges.hide(timeCueId),
          sceneStateChanges.show(newSeasonPotId),
        ],
        targetObjectId: timeCueId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-celebrate-new-season`,
        instructionVi: 'Chạm chiếc chậu có hạt cho mùa mới nhé.',
        instructionEn: 'Tap the pot with a seed for the new season.',
        successFeedbackVi: 'Từ một hạt nhỏ, khu vườn lại bắt đầu.',
        successFeedbackEn: 'A new garden journey can begin from one small seed.',
        failFeedbackVi: 'Chạm chiếc chậu ở giữa phía dưới nhé.',
        failFeedbackEn: 'The flowerpot is in the lower middle.',
        effects: [lessonEffects.sparkle(newSeasonPotId)],
        targetObjectId: newSeasonPotId,
        type: 'practice',
      }),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Bé đã nhờ người lớn cất hạt khô và bắt đầu một mùa mới.',
      messageEn: 'You asked an adult to store the dry seed and begin a new season.',
    },
  };
}

export const gardenToTableLesson: Lesson = {
  id: lessonId,
  themeId: 'khu-vuon-cua-be',
  titleVi: 'Từ vườn tới bàn ăn',
  titleEn: 'Garden to Table',
  descriptionVi:
    'Bé rửa rau quả, làm món nguội an toàn, chia sẻ và giữ hạt cho mùa sau.',
  descriptionEn:
    'Rinse the harvest, make a safe cold salad, share it, and save a seed.',
  thumbnailEmoji: '🥗',
  ageRange: { min: 6, max: 8, label: '6-8 tuổi · Nâng cao' },
  scenes: [
    makeRinseAndDrainScene(),
    makeAndShareScene(),
    makeSaveForNextSeasonScene(),
  ],
  reviewGame: {
    id: `${lessonId}-review`,
    type: 'random',
    titleVi: 'Từ vườn tới bàn ăn',
    config: {
      vocabularyIds: [
        'vocab-garden-to-table-rinse-and-drain-cucumber',
        'vocab-garden-to-table-rinse-and-drain-rinse',
        'vocab-garden-to-table-make-and-share-bowl',
        'vocab-garden-to-table-make-and-share-share',
        'vocab-garden-to-table-rinse-and-drain-colander',
        'vocab-garden-to-table-save-for-next-season-save-the-seeds',
      ],
    },
  },
  metadata: {
    parentTipVi:
      'Ba mẹ rửa/cắt nguyên liệu, kiểm tra dị ứng và cất hạt nhỏ ngoài tầm với của em bé trước khi cùng bé thực hành.',
  },
};
