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

const lessonId = 'help-it-grow';
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

function makeNewLeafAndSunlightScene(): Scene {
  const sceneId = 'new-leaf-and-sunlight';
  const vocabulary = [
    vocabularyItem(sceneId, {
      key: 'watering-can',
      meaningVi: 'bình tưới cây',
      word: 'watering can',
    }),
    vocabularyItem(sceneId, {
      key: 'leaf',
      meaningVi: 'chiếc lá',
      word: 'leaf',
    }),
    vocabularyItem(sceneId, {
      key: 'sunlight',
      meaningVi: 'ánh nắng',
      word: 'sunlight',
    }),
    vocabularyItem(sceneId, {
      key: 'shade',
      meaningVi: 'bóng râm',
      tier: 'expanded',
      word: 'shade',
    }),
    vocabularyItem(sceneId, {
      key: 'move-into-sunlight',
      meaningVi: 'đưa vào vùng nắng',
      tier: 'challenge',
      type: 'phrase',
      word: 'move into sunlight',
    }),
  ];
  const vocab = new Map(vocabulary.map(item => [item.word, item]));
  const plantId = `${sceneId}-plant`;
  const wateringCanId = `${sceneId}-watering-can`;
  const potZoneId = `${sceneId}-pot-zone`;
  const timeCueId = `${sceneId}-first-time-cue`;
  const leafId = `${sceneId}-leaf`;
  const sunlightId = `${sceneId}-sunlight`;
  const shadeControlId = `${sceneId}-shade-control`;
  const shadeId = `${sceneId}-shade`;
  const moveSunlightActionId = `${sceneId}-move-sunlight-action`;
  const stayShadeActionId = `${sceneId}-stay-shade-action`;
  const sunlightZoneId = `${sceneId}-sunlight-zone`;

  return {
    id: sceneId,
    titleVi: 'Lá mới và ánh nắng',
    titleEn: 'New Leaf and Sunlight',
    thumbnailEmoji: '🍃',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: plantId,
        assetSource: sceneImageSource(sceneId, 'plant-drooping'),
        isInteractive: true,
        position: rect(34, 42, 32, 35),
        presentation: 'cutout',
        touchArea: rect(28, 36, 44, 45),
        variants: [
          objectVariant({
            id: 'perked',
            assetSource: sceneImageSource(sceneId, 'plant-perked'),
          }),
          objectVariant({
            id: 'new-leaf',
            assetSource: sceneImageSource(sceneId, 'plant-new-leaf'),
          }),
          objectVariant({
            id: 'sunlit',
            assetSource: sceneImageSource(sceneId, 'plant-sunlit'),
          }),
        ],
      }),
      learningObject({
        id: wateringCanId,
        assetSource: sceneImageSource(sceneId, 'watering-can'),
        position: rect(70, 50, 23, 22),
        touchArea: rect(65, 45, 33, 32),
        vocab: vocab.get('watering can')!,
      }),
      sceneObject({
        id: timeCueId,
        assetSource: sceneImageSource(sceneId, 'time-cue'),
        isInteractive: true,
        position: rect(38, 10, 24, 20),
        presentation: 'cutout',
        touchArea: rect(33, 6, 34, 28),
      }),
      learningObject({
        id: leafId,
        assetSource: sceneImageSource(sceneId, 'leaf'),
        initialVisibility: 'hidden',
        position: rect(8, 39, 18, 17),
        touchArea: rect(4, 34, 27, 27),
        vocab: vocab.get('leaf')!,
      }),
      learningObject({
        id: sunlightId,
        assetSource: sceneImageSource(sceneId, 'sunlight'),
        position: rect(70, 12, 21, 20),
        touchArea: rect(65, 7, 31, 30),
        vocab: vocab.get('sunlight')!,
      }),
      sceneObject({
        id: shadeControlId,
        assetSource: sceneImageSource(sceneId, 'shade-control'),
        isInteractive: true,
        learningScope: expandedScope,
        position: rect(8, 12, 18, 18),
        presentation: 'cutout',
        touchArea: rect(4, 8, 27, 27),
      }),
      learningObject({
        id: shadeId,
        assetSource: sceneImageSource(sceneId, 'shade'),
        initialVisibility: 'hidden',
        learningScope: expandedScope,
        position: rect(5, 61, 25, 18),
        touchArea: rect(2, 57, 32, 26),
        vocab: vocab.get('shade')!,
      }),
      learningObject({
        id: moveSunlightActionId,
        assetSource: sceneImageSource(sceneId, 'move-sunlight-action'),
        initialVisibility: 'hidden',
        learningScope: challengeScope,
        position: rect(8, 80, 38, 16),
        touchArea: rect(4, 76, 46, 22),
        vocab: vocab.get('move into sunlight')!,
      }),
      sceneObject({
        id: stayShadeActionId,
        assetSource: sceneImageSource(sceneId, 'stay-shade-action'),
        initialVisibility: 'hidden',
        isInteractive: true,
        learningScope: challengeScope,
        position: rect(54, 80, 38, 16),
        presentation: 'cutout',
        touchArea: rect(50, 76, 46, 22),
      }),
    ],
    dropZones: [
      {
        id: potZoneId,
        position: rect(34, 43, 32, 34),
        touchArea: rect(28, 37, 44, 44),
      },
      {
        id: sunlightZoneId,
        position: rect(61, 36, 34, 42),
        touchArea: rect(56, 31, 43, 51),
      },
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        instructionVi: 'Vài ngày trôi qua. Mầm đã thành cây nhỏ.',
        instructionEn: 'A few days pass. The sprout is now a little plant.',
        successFeedbackVi: 'Mình cùng giúp cây lớn khỏe nhé.',
        successFeedbackEn: "Let's help the little plant grow strong.",
        targetObjectIds: [plantId],
        type: 'intro',
      }),
      dragStep({
        id: `${sceneId}-water-plant`,
        instructionVi: 'Kéo bình tưới cây tới chậu cây đang hơi rũ nhé.',
        instructionEn:
          'Drag the watering can to the pot with the drooping plant.',
        promptText: 'watering can',
        successFeedbackVi: 'Cây tươi hơn rồi. Đây là bình tưới cây.',
        successFeedbackEn:
          'The plant looks fresher. This is a watering can.',
        failFeedbackVi: 'Kéo bình tưới cây tới chậu nhé.',
        failFeedbackEn: 'Drag the green watering can to the plant pot.',
        successStateChanges: [
          sceneStateChanges.setVariant(plantId, 'perked'),
          sceneStateChanges.hide(wateringCanId),
        ],
        effects: [lessonEffects.sparkle(plantId)],
        dropZoneId: potZoneId,
        speechPractice: 'auto',
        targetObjectId: wateringCanId,
        type: 'teach',
        vocabId: vocab.get('watering can')!.id,
      }),
      tapStep({
        id: `${sceneId}-wait-new-leaf`,
        instructionVi: 'Chạm vòng ngày đêm để thời gian trôi qua nhé.',
        instructionEn: 'Tap the day-and-night circle to let time pass.',
        successFeedbackVi: 'Vài ngày sau, một chiếc lá mới mở ra.',
        successFeedbackEn: 'A few days later, a new leaf opens.',
        failFeedbackVi: 'Chạm vòng có mặt trời và mặt trăng nhé.',
        failFeedbackEn: 'Tap the circle with the sun and moon.',
        successStateChanges: [
          sceneStateChanges.setVariant(plantId, 'new-leaf'),
          sceneStateChanges.show(leafId),
        ],
        effects: [lessonEffects.sparkle(leafId)],
        targetObjectId: timeCueId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-learn-leaf`,
        instructionVi: 'Lá mới màu xanh. Chạm vào chiếc lá nhé.',
        instructionEn: 'Tap the leaf. The new leaf is green.',
        promptText: 'leaf',
        successFeedbackVi: 'Đúng rồi, đây là chiếc lá.',
        successFeedbackEn: 'Yes, this is a leaf.',
        failFeedbackVi: 'Chạm chiếc lá xanh cạnh cây nhé.',
        failFeedbackEn: 'Tap the green leaf beside the plant.',
        speechPractice: 'auto',
        targetObjectId: leafId,
        type: 'teach',
        vocabId: vocab.get('leaf')!.id,
      }),
      tapStep({
        id: `${sceneId}-reveal-shade`,
        instructionVi: 'Chạm mặt trời để xem chỗ nắng và chỗ râm nhé.',
        instructionEn:
          'Tap the sun to compare the sunny place and the shady place.',
        learningScope: expandedScope,
        successFeedbackVi: 'Mình đã thấy một vùng có bóng râm.',
        successFeedbackEn: 'Now we can see a shady area.',
        failFeedbackVi: 'Chạm hình mặt trời màu vàng nhé.',
        failFeedbackEn: 'Tap the yellow sun.',
        successStateChanges: [sceneStateChanges.show(shadeId)],
        targetObjectId: shadeControlId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-learn-shade`,
        instructionVi: 'Vùng tối mát là bóng râm. Chạm vào đó nhé.',
        instructionEn: 'Tap the cool dark area. It is shade.',
        learningScope: expandedScope,
        promptText: 'shade',
        successFeedbackVi: 'Đúng rồi, đây là bóng râm.',
        successFeedbackEn: 'Yes, this is shade.',
        failFeedbackVi: 'Chạm vùng mát có bóng lá nhé.',
        failFeedbackEn: 'Tap the cool area with the leaf shadow.',
        speechPractice: 'optional',
        targetObjectId: shadeId,
        type: 'teach',
        vocabId: vocab.get('shade')!.id,
      }),
      dragStep({
        id: `${sceneId}-move-plant`,
        instructionVi: 'Kéo chậu cây vào vùng nắng sáng nhé.',
        instructionEn: 'Drag the plant pot into the sunlight.',
        successFeedbackVi: 'Chậu cây đã ở chỗ có nắng.',
        successFeedbackEn: 'The plant pot is now in the sunlight.',
        failFeedbackVi: 'Đưa chậu tới vùng có tia nắng vàng nhé.',
        failFeedbackEn: 'Move the pot to the area with yellow sunbeams.',
        dropZoneId: sunlightZoneId,
        targetObjectId: plantId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-learn-sunlight`,
        instructionVi: 'Vùng sáng ấm là ánh nắng. Chạm vào đó nhé.',
        instructionEn: 'Tap the warm bright area. It is sunlight.',
        promptText: 'sunlight',
        successFeedbackVi: 'Đúng rồi, cây đang đón ánh nắng.',
        successFeedbackEn: 'Yes, the plant is enjoying the sunlight.',
        failFeedbackVi: 'Chạm vùng có các tia nắng vàng nhé.',
        failFeedbackEn: 'Tap the area with the yellow sunbeams.',
        successStateChanges: [
          sceneStateChanges.setVariant(plantId, 'sunlit'),
        ],
        effects: [lessonEffects.sparkle(plantId)],
        speechPractice: 'auto',
        targetObjectId: sunlightId,
        type: 'teach',
        vocabId: vocab.get('sunlight')!.id,
      }),
      tapStep({
        id: `${sceneId}-follow-the-light`,
        instructionVi: 'Lá đang hướng về phía sáng. Chạm chiếc lá nhé.',
        instructionEn: 'The leaf is turning toward the light. Tap the leaf.',
        successFeedbackVi: 'Chiếc lá đang đón ánh nắng.',
        successFeedbackEn: 'The leaf is reaching toward the sunlight.',
        failFeedbackVi: 'Chạm chiếc lá xanh cạnh chậu nhé.',
        failFeedbackEn: 'Tap the green leaf beside the pot.',
        effects: [lessonEffects.sparkle(leafId)],
        targetObjectId: leafId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-see-healthy-plant`,
        instructionVi: 'Chạm cây nhỏ đang tươi hơn trong nắng nhé.',
        instructionEn:
          'Tap the little plant that looks healthier in the sunlight.',
        successFeedbackVi: 'Cây tươi hơn và có thêm một chiếc lá.',
        successFeedbackEn: 'The plant looks healthier and has a new leaf.',
        failFeedbackVi: 'Chạm chậu cây ở giữa nhé.',
        failFeedbackEn: 'The plant pot is in the middle.',
        successStateChanges: [
          sceneStateChanges.show(moveSunlightActionId),
          sceneStateChanges.show(stayShadeActionId),
        ],
        effects: [lessonEffects.sparkle(plantId)],
        targetObjectId: plantId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-learn-move-into-sunlight`,
        instructionVi: 'Chạm hình chậu cây đi vào vùng nắng nhé.',
        instructionEn:
          'Tap the picture of the plant moving into sunlight.',
        learningScope: challengeScope,
        promptText: 'move into sunlight',
        successFeedbackVi: 'Đúng rồi, mình đưa cây vào vùng nắng.',
        successFeedbackEn: 'Yes, move the plant into sunlight.',
        failFeedbackVi: 'Chạm hình chậu cây có mũi tên hướng về tia nắng nhé.',
        failFeedbackEn:
          'Tap the picture with the arrow pointing toward the sunbeams.',
        speechPractice: 'auto',
        targetObjectId: moveSunlightActionId,
        type: 'teach',
        vocabId: vocab.get('move into sunlight')!.id,
      }),
      tapStep({
        id: `${sceneId}-choose-sunlight-action`,
        instructionVi: 'Đâu là hình chuyển chậu vào vùng nắng?',
        instructionEn: 'Which picture moves the pot into the sunlight?',
        learningScope: challengeScope,
        promptText: 'move into sunlight',
        successFeedbackVi: 'Đúng rồi, mình đưa cây vào chỗ có nắng.',
        successFeedbackEn: 'Right, we move the plant into the sunlight.',
        failFeedbackVi: 'Tìm hình chậu đi về phía tia nắng nhé.',
        failFeedbackEn:
          'Find the picture of the pot moving toward the sunbeams.',
        correctObjectIds: [moveSunlightActionId],
        targetObjectId: moveSunlightActionId,
        targetObjectIds: [moveSunlightActionId, stayShadeActionId],
        afterSuccessStateChanges: [
          sceneStateChanges.hide(moveSunlightActionId),
          sceneStateChanges.hide(stayShadeActionId),
        ],
        type: 'review',
        vocabId: vocab.get('move into sunlight')!.id,
      }),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Bé đã giúp cây có lá mới và đón ánh nắng.',
      messageEn: 'You helped the plant grow a new leaf and find sunlight.',
    },
  };
}

function makeRainyDayCareScene(): Scene {
  const sceneId = 'rainy-day-care';
  const vocabulary = [
    vocabularyItem(sceneId, {
      key: 'rain',
      meaningVi: 'mưa',
      word: 'rain',
    }),
    vocabularyItem(sceneId, {
      key: 'soil',
      meaningVi: 'đất trồng cây',
      word: 'soil',
    }),
    vocabularyItem(sceneId, {
      key: 'roots',
      meaningVi: 'rễ cây',
      tier: 'expanded',
      word: 'roots',
    }),
    vocabularyItem(sceneId, {
      key: 'check-soil',
      meaningVi: 'kiểm tra đất',
      tier: 'challenge',
      type: 'phrase',
      word: 'check the soil',
    }),
    vocabularyItem(sceneId, {
      key: 'wait-for-rain-to-stop',
      meaningVi: 'chờ mưa tạnh',
      tier: 'challenge',
      type: 'phrase',
      word: 'wait for the rain to stop',
    }),
  ];
  const vocab = new Map(vocabulary.map(item => [item.word, item]));
  const plantId = `${sceneId}-plant`;
  const cloudId = `${sceneId}-cloud`;
  const rainId = `${sceneId}-rain`;
  const shelterZoneId = `${sceneId}-shelter-zone`;
  const soilId = `${sceneId}-soil`;
  const rootWindowControlId = `${sceneId}-root-window-control`;
  const rootsId = `${sceneId}-roots`;
  const checkSoilActionId = `${sceneId}-check-soil-action`;
  const pourWaterActionId = `${sceneId}-pour-water-action`;
  const waitForRainActionId = `${sceneId}-wait-for-rain-action`;

  return {
    id: sceneId,
    titleVi: 'Chăm cây ngày mưa',
    titleEn: 'Rainy Day Care',
    thumbnailEmoji: '🌧️',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: plantId,
        assetSource: sceneImageSource(sceneId, 'plant-rain-wet'),
        isInteractive: true,
        position: rect(34, 43, 32, 35),
        presentation: 'cutout',
        touchArea: rect(28, 37, 44, 45),
        variants: [
          objectVariant({
            id: 'sheltered',
            assetSource: sceneImageSource(sceneId, 'plant-sheltered'),
          }),
        ],
      }),
      sceneObject({
        id: cloudId,
        assetSource: sceneImageSource(sceneId, 'cloud-gray'),
        isInteractive: true,
        position: rect(51, 7, 30, 18),
        presentation: 'cutout',
        touchArea: rect(46, 3, 40, 26),
      }),
      learningObject({
        id: rainId,
        assetSource: sceneImageSource(sceneId, 'rain'),
        position: rect(54, 22, 24, 24),
        touchArea: rect(49, 17, 34, 34),
        vocab: vocab.get('rain')!,
      }),
      learningObject({
        id: soilId,
        assetSource: sceneImageSource(sceneId, 'soil-wet'),
        position: rect(42, 62, 16, 8),
        touchArea: rect(37, 56, 26, 20),
        variants: [
          objectVariant({
            id: 'under-shelter',
            assetSource: sceneImageSource(sceneId, 'soil-wet'),
            position: rect(14, 62, 16, 8),
            touchArea: rect(9, 56, 26, 20),
          }),
          objectVariant({
            id: 'checked-wet',
            assetSource: sceneImageSource(sceneId, 'soil-checked-wet'),
            position: rect(14, 62, 16, 8),
            touchArea: rect(9, 56, 26, 20),
          }),
        ],
        vocab: vocab.get('soil')!,
      }),
      sceneObject({
        id: rootWindowControlId,
        assetSource: sceneImageSource(sceneId, 'root-window-control'),
        isInteractive: true,
        learningScope: expandedScope,
        position: rect(72, 50, 18, 18),
        presentation: 'cutout',
        touchArea: rect(68, 46, 26, 26),
      }),
      learningObject({
        id: rootsId,
        assetSource: sceneImageSource(sceneId, 'roots'),
        initialVisibility: 'hidden',
        learningScope: expandedScope,
        position: rect(66, 68, 27, 20),
        touchArea: rect(62, 64, 35, 28),
        vocab: vocab.get('roots')!,
      }),
      learningObject({
        id: checkSoilActionId,
        assetSource: sceneImageSource(sceneId, 'check-soil-action'),
        initialVisibility: 'hidden',
        learningScope: challengeScope,
        position: rect(8, 80, 38, 16),
        touchArea: rect(4, 76, 46, 22),
        vocab: vocab.get('check the soil')!,
      }),
      sceneObject({
        id: pourWaterActionId,
        assetSource: sceneImageSource(sceneId, 'pour-water-action'),
        initialVisibility: 'hidden',
        isInteractive: true,
        learningScope: challengeScope,
        position: rect(54, 80, 38, 16),
        presentation: 'cutout',
        touchArea: rect(50, 76, 46, 22),
      }),
      learningObject({
        id: waitForRainActionId,
        assetSource: sceneImageSource(sceneId, 'rain'),
        initialVisibility: 'hidden',
        learningScope: challengeScope,
        position: rect(8, 80, 38, 16),
        touchArea: rect(4, 76, 46, 22),
        vocab: vocab.get('wait for the rain to stop')!,
      }),
    ],
    dropZones: [
      {
        id: shelterZoneId,
        position: rect(5, 42, 31, 37),
        touchArea: rect(1, 36, 39, 47),
      },
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        instructionVi: 'Mây xám kéo tới. Mưa bắt đầu rơi.',
        instructionEn: 'Gray clouds arrive. Rain begins to fall.',
        successFeedbackVi: 'Mình cùng chăm chậu cây nhỏ nhé.',
        successFeedbackEn: "Let's care for the little plant pot.",
        targetObjectIds: [rainId],
        type: 'intro',
      }),
      tapStep({
        id: `${sceneId}-learn-rain`,
        instructionVi: 'Nước rơi từ mây gọi là mưa. Chạm giọt mưa nhé.',
        instructionEn: 'Tap the raindrops. Water falling from clouds is rain.',
        promptText: 'rain',
        successFeedbackVi: 'Đúng rồi, đây là mưa.',
        successFeedbackEn: 'Yes, this is rain.',
        failFeedbackVi: 'Chạm các giọt nước dưới đám mây nhé.',
        failFeedbackEn: 'Tap the water drops below the cloud.',
        speechPractice: 'auto',
        targetObjectId: rainId,
        type: 'teach',
        vocabId: vocab.get('rain')!.id,
      }),
      dragStep({
        id: `${sceneId}-move-under-shelter`,
        instructionVi: 'Mưa nhiều rồi. Kéo chậu nhỏ vào mái che nhé.',
        instructionEn:
          'There is plenty of rain. Drag the small pot under the shelter.',
        successFeedbackVi: 'Chậu nhỏ đã ở dưới mái che.',
        successFeedbackEn: 'The small pot is under the shelter.',
        failFeedbackVi: 'Kéo chậu nhỏ tới chỗ có mái che nhé.',
        failFeedbackEn: 'Drag the small pot to the covered area.',
        successStateChanges: [
          sceneStateChanges.setVariant(plantId, 'sheltered'),
          sceneStateChanges.setVariant(soilId, 'under-shelter'),
        ],
        dropZoneId: shelterZoneId,
        targetObjectId: plantId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-check-sheltered-plant`,
        instructionVi: 'Cây đã dưới mái che. Chạm chậu cây nhé.',
        instructionEn: 'The plant is under the shelter. Tap the plant pot.',
        successFeedbackVi: 'Mưa không còn tạt vào cây nhỏ.',
        successFeedbackEn: 'The rain is no longer hitting the little plant.',
        failFeedbackVi: 'Chạm chậu cây dưới mái che nhé.',
        failFeedbackEn: 'The plant pot is under the shelter.',
        effects: [lessonEffects.sparkle(plantId)],
        targetObjectId: plantId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-reveal-roots`,
        instructionVi: 'Chạm kính tròn để nhìn dưới lớp đất nhé.',
        instructionEn: 'Tap the round window to look under the soil.',
        learningScope: expandedScope,
        successFeedbackVi: 'Mình đã nhìn thấy phần cây dưới đất.',
        successFeedbackEn:
          'Now we can see the part of the plant under the soil.',
        failFeedbackVi: 'Chạm chiếc kính tròn cạnh chậu nhé.',
        failFeedbackEn: 'Tap the round window beside the pot.',
        successStateChanges: [sceneStateChanges.show(rootsId)],
        targetObjectId: rootWindowControlId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-learn-roots`,
        instructionVi: 'Các nhánh dưới đất là rễ cây. Chạm vào rễ nhé.',
        instructionEn:
          'Tap the branching parts under the soil. They are roots.',
        learningScope: expandedScope,
        promptText: 'roots',
        successFeedbackVi: 'Đúng rồi, rễ nằm dưới đất.',
        successFeedbackEn: 'Yes, roots grow under the soil.',
        failFeedbackVi: 'Chạm các nhánh nhỏ dưới lớp đất nhé.',
        failFeedbackEn: 'Tap the small branches under the soil.',
        speechPractice: 'optional',
        targetObjectId: rootsId,
        type: 'teach',
        vocabId: vocab.get('roots')!.id,
      }),
      tapStep({
        id: `${sceneId}-check-wet-soil`,
        instructionVi: 'Chạm vào đất để xem còn ướt không nhé.',
        instructionEn: 'Tap the soil to see whether it is still wet.',
        successFeedbackVi: 'Đất còn ướt. Mình chưa tưới thêm.',
        successFeedbackEn: 'The soil is still wet. We do not add more water.',
        failFeedbackVi: 'Chạm phần đất sẫm màu trong chậu nhé.',
        failFeedbackEn: 'Tap the dark soil in the pot.',
        successStateChanges: [
          sceneStateChanges.setVariant(soilId, 'checked-wet'),
          sceneStateChanges.show(checkSoilActionId),
          sceneStateChanges.show(pourWaterActionId),
        ],
        effects: [lessonEffects.sparkle(plantId)],
        targetObjectId: soilId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-learn-check-soil`,
        instructionVi: 'Kiểm tra đất trước khi tưới. Chạm hình ngón tay nhé.',
        instructionEn:
          'Check the soil before watering. Tap the picture with the finger.',
        learningScope: challengeScope,
        promptText: 'check the soil',
        successFeedbackVi: 'Đúng rồi, mình kiểm tra đất trước.',
        successFeedbackEn: 'Yes, check the soil first.',
        failFeedbackVi: 'Chạm hình ngón tay chạm vào đất nhé.',
        failFeedbackEn: 'Tap the picture of the finger touching the soil.',
        speechPractice: 'auto',
        targetObjectId: checkSoilActionId,
        type: 'teach',
        vocabId: vocab.get('check the soil')!.id,
      }),
      tapStep({
        id: `${sceneId}-choose-check-soil`,
        instructionVi: 'Đâu là hình kiểm tra đất trước khi tưới?',
        instructionEn: 'Which picture shows checking the soil before watering?',
        learningScope: challengeScope,
        promptText: 'check the soil',
        successFeedbackVi: 'Đúng rồi, hãy kiểm tra đất trước.',
        successFeedbackEn: 'Right, check the soil first.',
        failFeedbackVi: 'Tìm hình ngón tay chạm vào đất nhé.',
        failFeedbackEn: 'Find the picture of the finger touching the soil.',
        correctObjectIds: [checkSoilActionId],
        targetObjectId: checkSoilActionId,
        targetObjectIds: [checkSoilActionId, pourWaterActionId],
        successStateChanges: [
          sceneStateChanges.show(waitForRainActionId),
        ],
        afterSuccessStateChanges: [
          sceneStateChanges.hide(checkSoilActionId),
          sceneStateChanges.hide(pourWaterActionId),
        ],
        type: 'review',
        vocabId: vocab.get('check the soil')!.id,
      }),
      tapStep({
        id: `${sceneId}-learn-wait-for-rain-to-stop`,
        instructionVi: 'Chạm hình những giọt mưa để chờ mưa tạnh nhé.',
        instructionEn:
          'Tap the raindrops while we wait for the rain to stop.',
        learningScope: challengeScope,
        promptText: 'wait for the rain to stop',
        successFeedbackVi: 'Đúng rồi, mình chờ mưa tạnh.',
        successFeedbackEn: 'Yes, wait for the rain to stop.',
        failFeedbackVi: 'Chạm hình những giọt nước màu xanh phía dưới nhé.',
        failFeedbackEn: 'Tap the blue raindrops below.',
        speechPractice: 'auto',
        afterSuccessStateChanges: [
          sceneStateChanges.hide(waitForRainActionId),
        ],
        targetObjectId: waitForRainActionId,
        type: 'teach',
        vocabId: vocab.get('wait for the rain to stop')!.id,
      }),
      tapStep({
        id: `${sceneId}-let-rain-pass`,
        instructionVi: 'Chạm đám mây để cơn mưa đi qua nhé.',
        instructionEn: 'Tap the cloud to let the rain pass.',
        successFeedbackVi: 'Mưa đã ngớt. Cây vẫn an toàn dưới mái che.',
        successFeedbackEn:
          'The rain has stopped. The plant is safe under the shelter.',
        failFeedbackVi: 'Chạm đám mây xám phía trên nhé.',
        failFeedbackEn: 'The gray cloud is above the plant.',
        successStateChanges: [
          sceneStateChanges.hide(cloudId),
          sceneStateChanges.hide(rainId),
        ],
        targetObjectId: cloudId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-see-safe-plant`,
        instructionVi: 'Trời sáng lại rồi. Chạm cây nhỏ nhé.',
        instructionEn: 'The sky is bright again. Tap the little plant.',
        successFeedbackVi: 'Cây an toàn, đất vẫn còn ướt.',
        successFeedbackEn: 'The plant is safe, and the soil is still wet.',
        failFeedbackVi: 'Chạm chậu cây dưới mái che nhé.',
        failFeedbackEn: 'The plant pot is under the shelter.',
        effects: [lessonEffects.sparkle(plantId)],
        targetObjectId: plantId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-learn-soil`,
        instructionVi: 'Chạm phần đất sẫm màu còn ướt trong chậu nhé.',
        instructionEn: 'Tap the dark soil that is still wet in the pot.',
        promptText: 'soil',
        successFeedbackVi: 'Đúng rồi, đây là đất trồng cây.',
        successFeedbackEn: 'Yes, this is soil.',
        failFeedbackVi: 'Chạm phần đất màu nâu trong chậu dưới mái che nhé.',
        failFeedbackEn: 'Tap the brown soil in the sheltered plant pot.',
        speechPractice: 'auto',
        targetObjectId: soilId,
        type: 'teach',
        vocabId: vocab.get('soil')!.id,
      }),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Bé đã giúp cây trú mưa và kiểm tra đất trước khi tưới.',
      messageEn:
        'You sheltered the plant and checked the soil before watering.',
    },
  };
}

function makeWindAndSupportScene(): Scene {
  const sceneId = 'wind-and-support';
  const vocabulary = [
    vocabularyItem(sceneId, {
      key: 'flower',
      meaningVi: 'bông hoa',
      word: 'flower',
    }),
    vocabularyItem(sceneId, {
      key: 'wind',
      meaningVi: 'gió',
      word: 'wind',
    }),
    vocabularyItem(sceneId, {
      key: 'stem',
      meaningVi: 'thân cây',
      word: 'stem',
    }),
    vocabularyItem(sceneId, {
      key: 'stake',
      meaningVi: 'cọc đỡ cây',
      tier: 'expanded',
      word: 'stake',
    }),
    vocabularyItem(sceneId, {
      key: 'soft-tie',
      meaningVi: 'dây buộc mềm',
      tier: 'expanded',
      word: 'soft tie',
    }),
    vocabularyItem(sceneId, {
      key: 'support-stem',
      meaningVi: 'đỡ thân cây',
      tier: 'challenge',
      type: 'phrase',
      word: 'support the stem',
    }),
  ];
  const vocab = new Map(vocabulary.map(item => [item.word, item]));
  const plantId = `${sceneId}-plant`;
  const windId = `${sceneId}-wind`;
  const stemId = `${sceneId}-stem`;
  const stickId = `${sceneId}-stick`;
  const installedStakeId = `${sceneId}-installed-stake`;
  const stakeId = `${sceneId}-stake`;
  const softTieId = `${sceneId}-soft-tie`;
  const softTieVocabularyId = `${sceneId}-soft-tie-vocabulary`;
  const installedTieId = `${sceneId}-installed-tie`;
  const supportStemActionId = `${sceneId}-support-stem-action`;
  const leaveLeaningActionId = `${sceneId}-leave-leaning-action`;
  const timeCueId = `${sceneId}-time-cue`;
  const stickZoneId = `${sceneId}-stick-zone`;
  const tieZoneId = `${sceneId}-tie-zone`;

  return {
    id: sceneId,
    titleVi: 'Gió và cây đứng vững',
    titleEn: 'Wind and Support',
    thumbnailEmoji: '🌬️',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: plantId,
        // Reward/review surfaces read the base asset, while the scene starts in
        // the authored pre-support state through this explicit variant.
        assetSource: sceneImageSource(sceneId, 'plant-flower-bud'),
        initialVariantId: 'swaying',
        isInteractive: true,
        position: rect(34, 42, 32, 36),
        presentation: 'cutout',
        role: 'learning',
        touchArea: rect(28, 36, 44, 46),
        variants: [
          objectVariant({
            id: 'swaying',
            assetSource: sceneImageSource(sceneId, 'plant-swaying'),
          }),
          objectVariant({
            id: 'leaning',
            assetSource: sceneImageSource(sceneId, 'plant-leaning'),
          }),
          objectVariant({
            id: 'staked',
            assetSource: sceneImageSource(sceneId, 'plant-staked'),
          }),
          objectVariant({
            id: 'supported',
            assetSource: sceneImageSource(sceneId, 'plant-supported'),
          }),
          objectVariant({
            id: 'flower-bud',
            assetSource: sceneImageSource(sceneId, 'plant-flower-bud'),
          }),
        ],
        vocabId: vocab.get('flower')!.id,
      }),
      learningObject({
        id: windId,
        assetSource: sceneImageSource(sceneId, 'wind'),
        position: rect(5, 16, 27, 23),
        touchArea: rect(2, 12, 34, 31),
        vocab: vocab.get('wind')!,
      }),
      learningObject({
        id: stemId,
        assetSource: sceneImageSource(sceneId, 'stem'),
        position: rect(65, 18, 21, 29),
        touchArea: rect(60, 13, 31, 39),
        vocab: vocab.get('stem')!,
      }),
      sceneObject({
        id: stickId,
        assetSource: sceneImageSource(sceneId, 'support-stick'),
        isInteractive: true,
        position: rect(6, 46, 15, 37),
        presentation: 'cutout',
        touchArea: rect(2, 41, 25, 47),
      }),
      sceneObject({
        id: installedStakeId,
        assetSource: sceneImageSource(sceneId, 'installed-stake'),
        initialVisibility: 'hidden',
        isInteractive: true,
        position: rect(51, 44, 7, 30),
        presentation: 'cutout',
        touchArea: rect(45, 39, 19, 40),
      }),
      sceneObject({
        id: stakeId,
        assetSource: sceneImageSource(sceneId, 'installed-stake'),
        initialVisibility: 'hidden',
        learningScope: expandedScope,
        position: rect(51, 44, 7, 30),
        presentation: 'cutout',
        vocabId: vocab.get('stake')!.id,
      }),
      sceneObject({
        id: softTieId,
        assetSource: sceneImageSource(sceneId, 'soft-tie'),
        isInteractive: true,
        position: rect(69, 63, 25, 18),
        presentation: 'cutout',
        touchArea: rect(64, 58, 35, 28),
      }),
      sceneObject({
        id: installedTieId,
        assetSource: sceneImageSource(sceneId, 'installed-tie'),
        initialVisibility: 'hidden',
        isInteractive: true,
        position: rect(46, 52, 15, 8),
        presentation: 'cutout',
        touchArea: rect(40, 46, 27, 20),
      }),
      sceneObject({
        id: softTieVocabularyId,
        assetSource: sceneImageSource(sceneId, 'installed-tie'),
        initialVisibility: 'hidden',
        learningScope: expandedScope,
        position: rect(46, 52, 15, 8),
        presentation: 'cutout',
        vocabId: vocab.get('soft tie')!.id,
      }),
      learningObject({
        id: supportStemActionId,
        assetSource: sceneImageSource(sceneId, 'support-stem-action'),
        initialVisibility: 'hidden',
        learningScope: challengeScope,
        position: rect(8, 80, 38, 16),
        touchArea: rect(4, 76, 46, 22),
        vocab: vocab.get('support the stem')!,
      }),
      sceneObject({
        id: leaveLeaningActionId,
        assetSource: sceneImageSource(sceneId, 'leave-leaning-action'),
        initialVisibility: 'hidden',
        isInteractive: true,
        learningScope: challengeScope,
        position: rect(54, 80, 38, 16),
        presentation: 'cutout',
        touchArea: rect(50, 76, 46, 22),
      }),
      sceneObject({
        id: timeCueId,
        assetSource: sceneImageSource(sceneId, 'time-cue'),
        isInteractive: true,
        position: rect(41, 10, 18, 16),
        presentation: 'cutout',
        touchArea: rect(36, 6, 28, 24),
      }),
    ],
    dropZones: [
      {
        id: stickZoneId,
        position: rect(32, 40, 36, 40),
        touchArea: rect(27, 35, 46, 50),
      },
      {
        id: tieZoneId,
        position: rect(36, 45, 28, 31),
        touchArea: rect(31, 40, 38, 41),
      },
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        instructionVi: 'Gió mạnh lên. Cây nhỏ đang lay động.',
        instructionEn: 'The wind is stronger. The little plant is moving.',
        successFeedbackVi: 'Mình cùng giúp cây đứng vững nhé.',
        successFeedbackEn: "Let's help the plant stand tall.",
        targetObjectIds: [plantId],
        type: 'intro',
      }),
      tapStep({
        id: `${sceneId}-learn-wind`,
        instructionVi: 'Không khí thổi làm lá rung. Chạm luồng gió nhé.',
        instructionEn: 'Tap the wind. Moving air makes the leaves shake.',
        promptText: 'wind',
        successFeedbackVi: 'Đúng rồi, đây là gió.',
        successFeedbackEn: 'Yes, this is wind.',
        failFeedbackVi: 'Chạm luồng xoáy có những chiếc lá bay nhé.',
        failFeedbackEn: 'Tap the swirl with the flying leaves.',
        successStateChanges: [sceneStateChanges.setVariant(plantId, 'leaning')],
        speechPractice: 'auto',
        targetObjectId: windId,
        type: 'teach',
        vocabId: vocab.get('wind')!.id,
      }),
      dragStep({
        id: `${sceneId}-place-stick`,
        instructionVi: 'Kéo que đỡ vào chỗ cạnh cây nhé.',
        instructionEn: 'Drag the support stick to the spot beside the plant.',
        successFeedbackVi: 'Que đỡ đã đứng cạnh cây.',
        successFeedbackEn: 'The support stick is standing beside the plant.',
        failFeedbackVi: 'Kéo que dài tới vòng đất cạnh cây nhé.',
        failFeedbackEn:
          'Drag the long stick to the soil circle beside the plant.',
        successStateChanges: [
          sceneStateChanges.hide(stickId),
          sceneStateChanges.show(installedStakeId),
          sceneStateChanges.setVariant(plantId, 'staked'),
        ],
        dropZoneId: stickZoneId,
        targetObjectId: stickId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-learn-stake`,
        instructionVi: 'Que dài đỡ cây là cọc đỡ. Chạm vào cọc nhé.',
        instructionEn: 'Tap the long plant support. It is a stake.',
        learningScope: expandedScope,
        promptText: 'stake',
        successFeedbackVi: 'Đúng rồi, cọc giúp đỡ cây.',
        successFeedbackEn: 'Yes, the stake helps support the plant.',
        failFeedbackVi: 'Chạm chiếc cọc dài đầu tròn cạnh cây nhé.',
        failFeedbackEn: 'Tap the long rounded stake beside the plant.',
        effects: [lessonEffects.sparkle(installedStakeId)],
        speechPractice: 'optional',
        targetObjectId: installedStakeId,
        type: 'teach',
        vocabId: vocab.get('stake')!.id,
      }),
      dragStep({
        id: `${sceneId}-place-soft-tie`,
        instructionVi: 'Kéo dây mềm tới cọc để giữ cây nhé.',
        instructionEn: 'Drag the soft tie to the stake to hold the plant.',
        successFeedbackVi: 'Dây buộc lỏng giúp cây đứng thẳng.',
        successFeedbackEn: 'The loose tie helps the plant stand tall.',
        failFeedbackVi: 'Kéo dây mềm tới chỗ cọc cạnh thân nhé.',
        failFeedbackEn: 'Drag the soft tie to the stake beside the stem.',
        successStateChanges: [
          sceneStateChanges.hide(softTieId),
          sceneStateChanges.show(installedTieId),
          sceneStateChanges.setVariant(plantId, 'supported'),
        ],
        dropZoneId: tieZoneId,
        targetObjectId: softTieId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-learn-stem`,
        instructionVi: 'Phần xanh nâng lá là thân cây. Chạm vào thân nhé.',
        instructionEn: 'Tap the green part holding the leaves. It is the stem.',
        promptText: 'stem',
        successFeedbackVi: 'Đúng rồi, cọc đang đỡ thân cây.',
        successFeedbackEn: 'Yes, the stake is supporting the stem.',
        failFeedbackVi: 'Chạm phần xanh dài dưới các lá nhé.',
        failFeedbackEn: 'Tap the long green part below the leaves.',
        speechPractice: 'auto',
        targetObjectId: stemId,
        type: 'teach',
        vocabId: vocab.get('stem')!.id,
      }),
      tapStep({
        id: `${sceneId}-wait-for-flower-bud`,
        instructionVi: 'Chạm vòng ngày đêm để xem cây lớn thêm nhé.',
        instructionEn: 'Tap the day-and-night circle and watch the plant grow.',
        successFeedbackVi: 'Vài ngày sau, cây đứng thẳng và có một bông hoa.',
        successFeedbackEn:
          'A few days later, the plant stands tall with a flower.',
        failFeedbackVi: 'Chạm vòng có mặt trời và mặt trăng nhé.',
        failFeedbackEn: 'Tap the circle with the sun and moon.',
        successStateChanges: [
          sceneStateChanges.setVariant(plantId, 'flower-bud'),
        ],
        effects: [lessonEffects.sparkle(plantId)],
        targetObjectId: timeCueId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-learn-soft-tie`,
        instructionVi: 'Chạm dây buộc mềm đang giữ thân cây cạnh cọc nhé.',
        instructionEn: 'Tap the soft tie holding the stem beside the stake.',
        learningScope: expandedScope,
        promptText: 'soft tie',
        successFeedbackVi: 'Đúng rồi, đây là dây buộc mềm.',
        successFeedbackEn: 'Yes, this is a soft tie.',
        failFeedbackVi: 'Chạm vòng dây xanh quanh thân cây và cọc nhé.',
        failFeedbackEn: 'Tap the green tie around the stem and stake.',
        effects: [lessonEffects.sparkle(installedTieId)],
        speechPractice: 'optional',
        targetObjectId: installedTieId,
        type: 'teach',
        vocabId: vocab.get('soft tie')!.id,
      }),
      tapStep({
        id: `${sceneId}-test-support`,
        instructionVi: 'Gió lại thổi. Chạm luồng gió để thử cọc đỡ nhé.',
        instructionEn:
          'The wind blows again. Tap the wind to test the support.',
        successFeedbackVi: 'Cọc và dây giữ cây đứng vững.',
        successFeedbackEn: 'The stake and tie keep the plant standing tall.',
        failFeedbackVi: 'Chạm luồng gió có lá bay nhé.',
        failFeedbackEn: 'Tap the wind swirl with the flying leaves.',
        successStateChanges: [
          sceneStateChanges.hide(windId),
          sceneStateChanges.show(supportStemActionId),
          sceneStateChanges.show(leaveLeaningActionId),
        ],
        effects: [
          lessonEffects.bounce(installedStakeId),
          lessonEffects.bounce(installedTieId),
          lessonEffects.sparkle(plantId),
        ],
        targetObjectId: windId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-learn-support-stem`,
        instructionVi: 'Đỡ thân cây cho cây đứng vững. Chạm hình có cọc nhé.',
        instructionEn:
          'Support the stem so the plant stands tall. Tap the picture with the stake.',
        learningScope: challengeScope,
        promptText: 'support the stem',
        successFeedbackVi: 'Đúng rồi, cọc đang đỡ thân cây.',
        successFeedbackEn: 'Yes, the stake supports the stem.',
        failFeedbackVi: 'Chạm hình cây được cọc đỡ thẳng nhé.',
        failFeedbackEn: 'Tap the picture of the plant standing with the stake.',
        speechPractice: 'auto',
        targetObjectId: supportStemActionId,
        type: 'teach',
        vocabId: vocab.get('support the stem')!.id,
      }),
      tapStep({
        id: `${sceneId}-choose-support-stem`,
        instructionVi: 'Đâu là hình đỡ thân cây đứng vững?',
        instructionEn: 'Which picture shows supporting the stem?',
        learningScope: challengeScope,
        promptText: 'support the stem',
        successFeedbackVi: 'Đúng rồi, mình đỡ thân cây.',
        successFeedbackEn: 'Right, support the stem.',
        failFeedbackVi: 'Tìm hình cây đứng thẳng cạnh cọc nhé.',
        failFeedbackEn: 'Find the plant standing tall beside the stake.',
        correctObjectIds: [supportStemActionId],
        targetObjectId: supportStemActionId,
        targetObjectIds: [supportStemActionId, leaveLeaningActionId],
        afterSuccessStateChanges: [
          sceneStateChanges.hide(supportStemActionId),
          sceneStateChanges.hide(leaveLeaningActionId),
        ],
        type: 'review',
        vocabId: vocab.get('support the stem')!.id,
      }),
      tapStep({
        id: `${sceneId}-find-flower-bud`,
        instructionVi: 'Chạm cây đứng vững để tìm bông hoa màu vàng nhé.',
        instructionEn:
          'Tap the standing plant to find the yellow flower.',
        promptText: 'flower',
        successFeedbackVi: 'Đúng rồi, cây đã có một bông hoa.',
        successFeedbackEn: 'Yes, the plant now has a flower.',
        failFeedbackVi: 'Chạm chậu cây có bông hoa vàng ở giữa nhé.',
        failFeedbackEn: 'The plant with the yellow flower is in the middle.',
        effects: [lessonEffects.sparkle(plantId)],
        speechPractice: 'auto',
        targetObjectId: plantId,
        type: 'teach',
        vocabId: vocab.get('flower')!.id,
      }),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Bé đã giúp cây có lá mới và đứng vững.',
      messageEn: 'You helped the plant grow new leaves and stand tall.',
    },
  };
}

export const helpItGrowLesson: Lesson = {
  id: lessonId,
  themeId: 'khu-vuon-cua-be',
  titleVi: 'Giúp cây lớn lên',
  titleEn: 'Help It Grow',
  descriptionVi: 'Bé giúp cây đón nắng, trú mưa và đứng vững khi có gió.',
  descriptionEn:
    'Help the plant find sunlight, stay safe in rain, and stand tall in the wind.',
  thumbnailEmoji: '🌿',
  ageRange: { min: 6, max: 8, label: '6-8 tuổi · Nâng cao' },
  scenes: [
    makeNewLeafAndSunlightScene(),
    makeRainyDayCareScene(),
    makeWindAndSupportScene(),
  ],
  reviewGame: {
    id: `${lessonId}-review`,
    type: 'random',
    titleVi: 'Cây lớn khỏe',
    config: {
      vocabularyIds: [
        'vocab-help-it-grow-new-leaf-and-sunlight-leaf',
        'vocab-help-it-grow-new-leaf-and-sunlight-sunlight',
        'vocab-help-it-grow-rainy-day-care-rain',
        'vocab-help-it-grow-wind-and-support-wind',
        'vocab-help-it-grow-new-leaf-and-sunlight-shade',
        'vocab-help-it-grow-rainy-day-care-check-soil',
      ],
    },
  },
  metadata: {
    parentTipVi:
      'Ba mẹ cùng bé nhìn đất và lá trước khi tưới; chỉ di chuyển chậu nhỏ và chuẩn bị cọc đầu tròn cùng dây mềm.',
  },
};
