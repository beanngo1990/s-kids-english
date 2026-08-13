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

const lessonId = 'plant-a-seed';
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

function makePrepareThePotScene(): Scene {
  const sceneId = 'prepare-the-pot';
  const vocabulary = [
    vocabularyItem(sceneId, {
      key: 'plant-pot',
      meaningVi: 'chậu cây',
      word: 'plant pot',
    }),
    vocabularyItem(sceneId, {
      key: 'soil',
      meaningVi: 'đất trồng',
      word: 'soil',
    }),
    vocabularyItem(sceneId, {
      key: 'scoop',
      meaningVi: 'xẻng xúc đất nhỏ',
      word: 'scoop',
    }),
    vocabularyItem(sceneId, {
      key: 'drainage-hole',
      meaningVi: 'lỗ thoát nước',
      tier: 'expanded',
      word: 'drainage hole',
    }),
    vocabularyItem(sceneId, {
      key: 'potting-mix',
      meaningVi: 'đất trồng trong chậu',
      tier: 'expanded',
      word: 'potting mix',
    }),
    vocabularyItem(sceneId, {
      key: 'fill-pot-soil',
      meaningVi: 'cho đất vào chậu',
      tier: 'challenge',
      type: 'phrase',
      word: 'fill the pot with soil',
    }),
    vocabularyItem(sceneId, {
      key: 'leave-space',
      meaningVi: 'chừa lại một khoảng trống',
      tier: 'challenge',
      type: 'phrase',
      word: 'leave some space',
    }),
  ];
  const vocab = new Map(vocabulary.map(item => [item.word, item]));
  const potId = `${sceneId}-plant-pot`;
  const soilId = `${sceneId}-soil`;
  const scoopId = `${sceneId}-scoop`;
  const drainageHoleId = `${sceneId}-drainage-hole`;
  const pottingMixId = `${sceneId}-potting-mix`;
  const fillPhraseId = `${sceneId}-fill-pot-soil`;
  const leaveSpaceId = `${sceneId}-leave-space`;
  const potZoneId = `${sceneId}-pot-zone`;

  return {
    id: sceneId,
    titleVi: 'Chuẩn bị chậu',
    titleEn: 'Prepare the Pot',
    thumbnailEmoji: '🪴',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      learningObject({
        id: potId,
        assetSource: sceneImageSource(sceneId, 'plant-pot-empty'),
        position: rect(35, 48, 32, 29),
        touchArea: rect(29, 42, 44, 39),
        variants: [
          objectVariant({
            id: 'soil-low',
            assetSource: sceneImageSource(sceneId, 'plant-pot-soil-low'),
          }),
          objectVariant({
            id: 'soil-ready',
            assetSource: sceneImageSource(sceneId, 'plant-pot-soil-ready'),
          }),
        ],
        vocab: vocab.get('plant pot')!,
      }),
      learningObject({
        id: soilId,
        assetSource: sceneImageSource(sceneId, 'soil'),
        position: rect(7, 56, 23, 20),
        touchArea: rect(3, 51, 31, 29),
        vocab: vocab.get('soil')!,
      }),
      learningObject({
        id: scoopId,
        assetSource: sceneImageSource(sceneId, 'scoop-empty'),
        position: rect(70, 56, 24, 20),
        touchArea: rect(65, 51, 34, 30),
        variants: [
          objectVariant({
            id: 'filled',
            assetSource: sceneImageSource(sceneId, 'scoop-filled'),
          }),
        ],
        vocab: vocab.get('scoop')!,
      }),
      learningObject({
        id: drainageHoleId,
        assetSource: sceneImageSource(sceneId, 'drainage-hole'),
        learningScope: expandedScope,
        position: rect(12, 28, 18, 14),
        touchArea: rect(7, 23, 28, 24),
        vocab: vocab.get('drainage hole')!,
      }),
      learningObject({
        id: pottingMixId,
        assetSource: sceneImageSource(sceneId, 'potting-mix-v2'),
        learningScope: expandedScope,
        position: rect(70, 25, 23, 23),
        touchArea: rect(65, 20, 33, 33),
        vocab: vocab.get('potting mix')!,
      }),
      sceneObject({
        id: fillPhraseId,
        assetSource: sceneImageSource(sceneId, 'fill-pot-soil'),
        isInteractive: true,
        learningScope: challengeScope,
        position: rect(8, 82, 39, 14),
        presentation: 'cutout',
        touchArea: rect(4, 78, 47, 21),
        vocabId: vocab.get('fill the pot with soil')!.id,
      }),
      sceneObject({
        id: leaveSpaceId,
        assetSource: sceneImageSource(sceneId, 'leave-space'),
        isInteractive: true,
        learningScope: challengeScope,
        position: rect(53, 82, 39, 14),
        presentation: 'cutout',
        touchArea: rect(49, 78, 47, 21),
        vocabId: vocab.get('leave some space')!.id,
      }),
    ],
    dropZones: [
      {
        id: potZoneId,
        position: rect(38, 53, 26, 21),
        touchArea: rect(30, 45, 42, 36),
      },
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        instructionVi: 'Mình chuẩn bị chậu trước khi gieo hạt nhé.',
        instructionEn: "Let's prepare the pot before planting a seed.",
        successFeedbackVi: 'Chậu rỗng đang chờ đất trồng.',
        successFeedbackEn: 'The empty pot is ready for soil.',
        targetObjectIds: [potId],
        type: 'intro',
      }),
      findStep({
        id: `${sceneId}-find-plant-pot`,
        instructionVi: 'Tìm chậu cây nhé.',
        instructionEn: 'Find the plant pot.',
        promptText: 'plant pot',
        successFeedbackVi: 'Đúng rồi, đây là chậu cây.',
        successFeedbackEn: 'Yes, this is the plant pot.',
        failFeedbackVi: 'Chậu màu cam ở giữa bàn.',
        failFeedbackEn: 'The orange pot is in the middle of the table.',
        effects: [lessonEffects.bounce(potId)],
        speechPractice: 'auto',
        targetObjectId: potId,
        type: 'practice',
        vocabId: vocab.get('plant pot')!.id,
      }),
      tapStep({
        id: `${sceneId}-check-drainage-hole`,
        instructionVi:
          'Đây là lỗ thoát nước. Chạm vào lỗ đen dưới chậu nhé.',
        instructionEn: 'Tap the black drainage hole under the tilted pot.',
        learningScope: expandedScope,
        promptText: 'drainage hole',
        successFeedbackVi: 'Đúng rồi, nước thừa thoát ra qua lỗ này.',
        successFeedbackEn: 'This hole lets extra water drain away.',
        failFeedbackVi: 'Lỗ đen ở đáy chậu nghiêng bên trái.',
        failFeedbackEn: 'The black hole is under the tilted pot on the left.',
        speechPractice: 'auto',
        targetObjectId: drainageHoleId,
        type: 'teach',
        vocabId: vocab.get('drainage hole')!.id,
      }),
      tapStep({
        id: `${sceneId}-choose-potting-mix`,
        instructionVi: 'Chạm vào túi đất trồng có hình mầm cây nhé.',
        instructionEn: 'Tap the potting mix bag with the sprout picture.',
        learningScope: expandedScope,
        promptText: 'potting mix',
        successFeedbackVi: 'Đúng rồi, trong túi là đất trồng dành cho chậu.',
        successFeedbackEn: 'Yes, this bag contains potting mix for the pot.',
        failFeedbackVi: 'Túi có hình mầm cây ở phía trên bên phải.',
        failFeedbackEn: 'The bag with the sprout picture is at the upper right.',
        speechPractice: 'auto',
        targetObjectId: pottingMixId,
        type: 'practice',
        vocabId: vocab.get('potting mix')!.id,
      }),
      tapStep({
        id: `${sceneId}-scoop-soil`,
        instructionVi:
          'Đây là đất trồng. Chạm vào đống đất bên trái nhé.',
        instructionEn: 'Tap the loose soil pile on the left. This is soil.',
        promptText: 'soil',
        successFeedbackVi: 'Đúng rồi, đây là đất trồng.',
        successFeedbackEn: 'Yes, this is soil.',
        failFeedbackVi: 'Chạm vào đống đất rời bên trái chậu.',
        failFeedbackEn: 'Tap the loose soil pile to the left of the pot.',
        successStateChanges: [
          sceneStateChanges.setVariant(potId, 'soil-low'),
          sceneStateChanges.setVariant(scoopId, 'filled'),
        ],
        speechPractice: 'auto',
        targetObjectId: soilId,
        type: 'teach',
        vocabId: vocab.get('soil')!.id,
      }),
      tapStep({
        id: `${sceneId}-learn-fill-pot-soil`,
        instructionVi: 'Xúc đất vào chậu. Chạm vào hình xẻng đang đổ nhé.',
        instructionEn:
          'Scoop soil into the pot. Tap the picture of the pouring scoop.',
        learningScope: challengeScope,
        promptText: 'fill the pot with soil',
        successFeedbackVi: 'Đúng rồi, mình đang cho đất vào chậu.',
        successFeedbackEn: 'Yes, soil goes into the pot.',
        failFeedbackVi: 'Hình xẻng đổ đất ở hàng dưới bên trái.',
        failFeedbackEn: 'The pouring scoop is in the lower-left picture.',
        targetObjectId: fillPhraseId,
        type: 'teach',
        vocabId: vocab.get('fill the pot with soil')!.id,
      }),
      tapStep({
        id: `${sceneId}-choose-fill-pot-soil`,
        instructionVi: 'Đâu là hình xẻng cho đất vào chậu?',
        instructionEn: 'Which picture shows a scoop filling the pot with soil?',
        learningScope: challengeScope,
        promptText: 'fill the pot with soil',
        successFeedbackVi: 'Đúng rồi, cho đất vào chậu.',
        successFeedbackEn: 'Right, fill the pot with soil.',
        failFeedbackVi: 'Hình xẻng đổ đất ở hàng dưới bên trái.',
        failFeedbackEn: 'The pouring scoop is in the lower-left picture.',
        targetObjectId: fillPhraseId,
        correctObjectIds: [fillPhraseId],
        targetObjectIds: [fillPhraseId, leaveSpaceId],
        type: 'review',
        vocabId: vocab.get('fill the pot with soil')!.id,
      }),
      listenStep({
        id: `${sceneId}-learn-scoop`,
        instructionVi: 'Đây là xẻng xúc đất nhỏ.',
        instructionEn: 'This is a scoop.',
        promptText: 'scoop',
        successFeedbackVi: 'Xẻng nhỏ giúp mình xúc một ít đất.',
        successFeedbackEn: 'A scoop helps carry a small amount of soil.',
        targetObjectIds: [scoopId],
        type: 'teach',
        vocabId: vocab.get('scoop')!.id,
      }),
      dragStep({
        id: `${sceneId}-fill-pot`,
        instructionVi: 'Kéo xẻng đất vào chậu nhé.',
        instructionEn: 'Drag the scoop of soil into the pot.',
        promptText: 'scoop',
        successFeedbackVi: 'Tuyệt lắm, chậu đã có đủ đất.',
        successFeedbackEn: 'Great, the pot has enough soil.',
        failFeedbackVi: 'Đưa xẻng đất vào miệng chậu ở giữa.',
        failFeedbackEn: 'The middle of the pot is ready for the scoop.',
        successStateChanges: [
          sceneStateChanges.setVariant(potId, 'soil-ready'),
          sceneStateChanges.hide(scoopId),
        ],
        dropZoneId: potZoneId,
        effects: [lessonEffects.sparkle(potId)],
        targetObjectId: scoopId,
        type: 'practice',
        vocabId: vocab.get('scoop')!.id,
      }),
      tapStep({
        id: `${sceneId}-learn-leave-space`,
        instructionVi:
          'Đổ đất gần đầy, chừa một chút. Chạm vào chậu nhỏ nhé.',
        instructionEn:
          'Leave a little space at the top. Tap the small pot picture.',
        learningScope: challengeScope,
        promptText: 'leave some space',
        successFeedbackVi: 'Đúng rồi, chậu còn một khoảng trống.',
        successFeedbackEn: 'Yes, leave some space at the top.',
        failFeedbackVi: 'Hình chậu nhỏ ở hàng dưới bên phải.',
        failFeedbackEn: 'The small pot picture is at the lower right.',
        targetObjectId: leaveSpaceId,
        type: 'teach',
        vocabId: vocab.get('leave some space')!.id,
      }),
      tapStep({
        id: `${sceneId}-leave-space`,
        instructionVi: 'Đâu là hình chậu nhỏ còn một khoảng trống?',
        instructionEn: 'Which small pot picture leaves some space at the top?',
        learningScope: challengeScope,
        promptText: 'leave some space',
        successFeedbackVi: 'Đúng rồi, chừa một khoảng trống.',
        successFeedbackEn: 'Right, leave some space.',
        failFeedbackVi: 'Hình chậu nhỏ ở hàng dưới bên phải.',
        failFeedbackEn: 'The small pot picture is at the lower right.',
        targetObjectId: leaveSpaceId,
        correctObjectIds: [leaveSpaceId],
        targetObjectIds: [fillPhraseId, leaveSpaceId],
        type: 'review',
        vocabId: vocab.get('leave some space')!.id,
      }),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Chậu đất đã sẵn sàng để gieo hạt.',
      messageEn: 'The pot of soil is ready for a seed.',
    },
  };
}

function makePlantTheSeedScene(): Scene {
  const sceneId = 'plant-the-seed';
  const vocabulary = [
    vocabularyItem(sceneId, {
      key: 'seed',
      meaningVi: 'hạt giống',
      word: 'seed',
    }),
    vocabularyItem(sceneId, {
      key: 'hole',
      meaningVi: 'lỗ nhỏ',
      word: 'hole',
    }),
    vocabularyItem(sceneId, {
      key: 'seed-packet',
      meaningVi: 'gói hạt giống',
      word: 'seed packet',
    }),
    vocabularyItem(sceneId, {
      key: 'plant-label',
      meaningVi: 'thẻ tên cây',
      tier: 'expanded',
      word: 'plant label',
    }),
    vocabularyItem(sceneId, {
      key: 'finger',
      meaningVi: 'ngón tay',
      tier: 'expanded',
      word: 'finger',
    }),
    vocabularyItem(sceneId, {
      key: 'plant-seed',
      meaningVi: 'gieo hạt',
      tier: 'challenge',
      type: 'phrase',
      word: 'plant a seed',
    }),
    vocabularyItem(sceneId, {
      key: 'cover-seed',
      meaningVi: 'phủ đất lên hạt',
      tier: 'challenge',
      type: 'phrase',
      word: 'cover the seed',
    }),
  ];
  const vocab = new Map(vocabulary.map(item => [item.word, item]));
  const potId = `${sceneId}-pot-soil`;
  const packetId = `${sceneId}-seed-packet`;
  const seedId = `${sceneId}-seed`;
  const holeId = `${sceneId}-hole`;
  const fingerId = `${sceneId}-finger`;
  const coverSoilId = `${sceneId}-cover-soil`;
  const labelId = `${sceneId}-plant-label`;
  const plantedLabelId = `${sceneId}-planted-label`;
  const plantSeedPhraseId = `${sceneId}-plant-seed`;
  const coverSeedPhraseId = `${sceneId}-cover-seed`;
  const potZoneId = `${sceneId}-pot-zone`;

  return {
    id: sceneId,
    titleVi: 'Gieo hạt',
    titleEn: 'Plant the Seed',
    thumbnailEmoji: '🌰',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: potId,
        assetSource: sceneImageSource(sceneId, 'pot-soil-flat'),
        isInteractive: true,
        position: rect(35, 48, 32, 29),
        presentation: 'cutout',
        role: 'dropZone',
        touchArea: rect(29, 42, 44, 39),
        variants: [
          objectVariant({
            id: 'hole-open',
            assetSource: sceneImageSource(sceneId, 'pot-hole-open'),
          }),
          objectVariant({
            id: 'seed-visible',
            assetSource: sceneImageSource(sceneId, 'pot-seed-visible'),
          }),
          objectVariant({
            id: 'covered',
            assetSource: sceneImageSource(sceneId, 'pot-seed-covered'),
          }),
        ],
      }),
      learningObject({
        id: packetId,
        assetSource: sceneImageSource(sceneId, 'seed-packet'),
        position: rect(8, 54, 22, 22),
        touchArea: rect(4, 49, 31, 31),
        vocab: vocab.get('seed packet')!,
      }),
      learningObject({
        id: seedId,
        assetSource: sceneImageSource(sceneId, 'seed'),
        initialVisibility: 'hidden',
        position: rect(14, 39, 14, 12),
        touchArea: rect(8, 33, 26, 24),
        vocab: vocab.get('seed')!,
      }),
      learningObject({
        id: holeId,
        assetSource: sceneImageSource(sceneId, 'hole'),
        initialVisibility: 'hidden',
        position: rect(43, 53, 16, 12),
        touchArea: rect(37, 47, 28, 24),
        vocab: vocab.get('hole')!,
      }),
      learningObject({
        id: fingerId,
        assetSource: sceneImageSource(sceneId, 'finger'),
        learningScope: expandedScope,
        position: rect(72, 28, 20, 18),
        touchArea: rect(67, 23, 30, 28),
        vocab: vocab.get('finger')!,
      }),
      sceneObject({
        id: coverSoilId,
        assetSource: sceneImageSource(sceneId, 'cover-soil'),
        isInteractive: true,
        position: rect(71, 56, 22, 18),
        presentation: 'cutout',
        touchArea: rect(66, 51, 32, 28),
      }),
      learningObject({
        id: labelId,
        assetSource: sceneImageSource(sceneId, 'plant-label'),
        learningScope: expandedScope,
        position: rect(8, 27, 19, 19),
        touchArea: rect(3, 22, 29, 29),
        vocab: vocab.get('plant label')!,
      }),
      sceneObject({
        id: plantedLabelId,
        assetSource: sceneImageSource(sceneId, 'planted-label'),
        initialVisibility: 'hidden',
        learningScope: expandedScope,
        position: rect(62, 43, 16, 29),
        presentation: 'cutout',
        role: 'decoration',
      }),
      sceneObject({
        id: plantSeedPhraseId,
        assetSource: sceneImageSource(sceneId, 'plant-seed'),
        isInteractive: true,
        learningScope: challengeScope,
        position: rect(8, 82, 39, 14),
        presentation: 'cutout',
        touchArea: rect(4, 78, 47, 21),
        vocabId: vocab.get('plant a seed')!.id,
      }),
      sceneObject({
        id: coverSeedPhraseId,
        assetSource: sceneImageSource(sceneId, 'cover-seed-v2'),
        isInteractive: true,
        learningScope: challengeScope,
        position: rect(53, 82, 39, 14),
        presentation: 'cutout',
        touchArea: rect(49, 78, 47, 21),
        vocabId: vocab.get('cover the seed')!.id,
      }),
    ],
    dropZones: [
      {
        id: potZoneId,
        position: rect(39, 50, 24, 22),
        touchArea: rect(30, 43, 42, 36),
      },
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        instructionVi: 'Chậu đã có đất. Mình gieo hạt theo thứ tự nhé.',
        instructionEn: 'The pot has soil. Let’s plant a seed in order.',
        successFeedbackVi: 'Đầu tiên mình cần lấy hạt và tạo một lỗ nhỏ.',
        successFeedbackEn: 'First, get a seed and make a small hole.',
        targetObjectIds: [potId],
        type: 'intro',
      }),
      findStep({
        id: `${sceneId}-find-seed-packet`,
        instructionVi: 'Tìm gói hạt giống nhé.',
        instructionEn: 'Find the seed packet.',
        promptText: 'seed packet',
        successFeedbackVi: 'Đúng rồi, mình mở gói để lấy một hạt.',
        successFeedbackEn: 'Yes, open the packet and take one seed.',
        failFeedbackVi: 'Gói hạt giống ở bên trái chậu.',
        failFeedbackEn: 'The seed packet is to the left of the pot.',
        successStateChanges: [sceneStateChanges.show(seedId)],
        speechPractice: 'auto',
        targetObjectId: packetId,
        type: 'practice',
        vocabId: vocab.get('seed packet')!.id,
      }),
      tapStep({
        id: `${sceneId}-learn-seed`,
        instructionVi: 'Đây là hạt giống. Chạm vào hạt nhỏ nhé.',
        instructionEn: 'Tap the small seed. This is a seed.',
        promptText: 'seed',
        successFeedbackVi: 'Đúng rồi, đây là hạt giống.',
        successFeedbackEn: 'Yes, this is a seed.',
        failFeedbackVi: 'Hạt nhỏ ở phía trên bên trái chậu.',
        failFeedbackEn: 'The small seed is above and to the left of the pot.',
        speechPractice: 'auto',
        targetObjectId: seedId,
        type: 'teach',
        vocabId: vocab.get('seed')!.id,
      }),
      tapStep({
        id: `${sceneId}-learn-finger`,
        instructionVi: 'Chạm vào ngón tay đang chỉ xuống nhé.',
        instructionEn: 'Tap the finger pointing down.',
        learningScope: expandedScope,
        promptText: 'finger',
        successFeedbackVi: 'Mình dùng một ngón tay để tạo lỗ nhỏ.',
        successFeedbackEn: 'Use one finger to make a small hole.',
        failFeedbackVi: 'Ngón tay ở phía trên bên phải.',
        failFeedbackEn: 'The finger is at the upper right.',
        speechPractice: 'auto',
        targetObjectId: fingerId,
        type: 'teach',
        vocabId: vocab.get('finger')!.id,
      }),
      tapStep({
        id: `${sceneId}-make-hole`,
        instructionVi: 'Chạm vào đất trong chậu để tạo lỗ nhé.',
        instructionEn: 'Tap the soil inside the pot to make a hole.',
        successFeedbackVi: 'Một lỗ nhỏ đã sẵn sàng cho hạt.',
        successFeedbackEn: 'A small hole is ready for the seed.',
        failFeedbackVi: 'Chạm vào phần đất giữa chậu.',
        failFeedbackEn: 'The soil in the middle of the pot is the target.',
        successStateChanges: [
          sceneStateChanges.setVariant(potId, 'hole-open'),
          sceneStateChanges.show(holeId),
        ],
        targetObjectId: potId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-find-hole`,
        instructionVi: 'Chạm vào lỗ nhỏ nhé.',
        instructionEn: 'Tap the small hole.',
        promptText: 'hole',
        successFeedbackVi: 'Đúng rồi, hạt sẽ được đặt vào lỗ này.',
        successFeedbackEn: 'Yes, the seed goes into this hole.',
        failFeedbackVi: 'Lỗ nhỏ nằm giữa mặt đất trong chậu.',
        failFeedbackEn: 'The small hole is in the middle of the soil.',
        targetObjectId: holeId,
        type: 'teach',
        vocabId: vocab.get('hole')!.id,
      }),
      tapStep({
        id: `${sceneId}-learn-plant-seed`,
        instructionVi:
          'Đặt hạt vào lỗ. Chạm vào hình có mũi tên nhé.',
        instructionEn:
          'Put the seed into the hole. Tap the picture with the green arrow.',
        learningScope: challengeScope,
        promptText: 'plant a seed',
        successFeedbackVi: 'Đúng rồi, mình đang gieo hạt.',
        successFeedbackEn: 'Yes, plant a seed.',
        failFeedbackVi: 'Hình hạt có mũi tên ở hàng dưới bên trái.',
        failFeedbackEn: 'The seed with the arrow is in the lower-left picture.',
        targetObjectId: plantSeedPhraseId,
        type: 'teach',
        vocabId: vocab.get('plant a seed')!.id,
      }),
      tapStep({
        id: `${sceneId}-choose-plant-seed`,
        instructionVi: 'Đâu là hình gieo hạt có mũi tên xanh?',
        instructionEn: 'Which picture shows a green arrow planting the seed?',
        learningScope: challengeScope,
        promptText: 'plant a seed',
        successFeedbackVi: 'Đúng rồi, gieo hạt.',
        successFeedbackEn: 'Right, plant a seed.',
        failFeedbackVi: 'Hình hạt có mũi tên ở hàng dưới bên trái.',
        failFeedbackEn: 'The seed with the arrow is in the lower-left picture.',
        targetObjectId: plantSeedPhraseId,
        correctObjectIds: [plantSeedPhraseId],
        targetObjectIds: [plantSeedPhraseId, coverSeedPhraseId],
        type: 'review',
        vocabId: vocab.get('plant a seed')!.id,
      }),
      dragStep({
        id: `${sceneId}-plant-seed`,
        instructionVi: 'Kéo hạt giống vào lỗ nhỏ nhé.',
        instructionEn: 'Drag the seed into the small hole.',
        promptText: 'seed',
        successFeedbackVi: 'Hạt giống đã nằm trong đất.',
        successFeedbackEn: 'The seed is in the soil.',
        failFeedbackVi: 'Đưa hạt giống vào lỗ giữa chậu.',
        failFeedbackEn: 'The hole in the middle of the pot is the target.',
        successStateChanges: [
          sceneStateChanges.setVariant(potId, 'seed-visible'),
          sceneStateChanges.hide(seedId),
          sceneStateChanges.hide(holeId),
        ],
        dropZoneId: potZoneId,
        effects: [lessonEffects.sparkle(potId)],
        targetObjectId: seedId,
        type: 'practice',
        vocabId: vocab.get('seed')!.id,
      }),
      tapStep({
        id: `${sceneId}-learn-cover-seed`,
        instructionVi:
          'Lấp đất lên hạt. Chạm vào hình xẻng rắc đất nhé.',
        instructionEn:
          'Put a little soil over the seed. Tap the picture of the scoop.',
        learningScope: challengeScope,
        promptText: 'cover the seed',
        successFeedbackVi: 'Đúng rồi, mình đang phủ đất lên hạt.',
        successFeedbackEn: 'Yes, cover the seed.',
        failFeedbackVi: 'Hình xẻng phủ đất ở hàng dưới bên phải.',
        failFeedbackEn: 'The scoop covering the seed is in the lower-right picture.',
        targetObjectId: coverSeedPhraseId,
        type: 'teach',
        vocabId: vocab.get('cover the seed')!.id,
      }),
      tapStep({
        id: `${sceneId}-choose-cover-seed`,
        instructionVi: 'Đâu là hình phủ đất lên hạt bằng xẻng?',
        instructionEn: 'Which picture shows a scoop covering the seed?',
        learningScope: challengeScope,
        promptText: 'cover the seed',
        successFeedbackVi: 'Đúng rồi, phủ đất lên hạt.',
        successFeedbackEn: 'Right, cover the seed.',
        failFeedbackVi: 'Hình xẻng phủ đất ở hàng dưới bên phải.',
        failFeedbackEn: 'The scoop covering the seed is in the lower-right picture.',
        targetObjectId: coverSeedPhraseId,
        correctObjectIds: [coverSeedPhraseId],
        targetObjectIds: [plantSeedPhraseId, coverSeedPhraseId],
        type: 'review',
        vocabId: vocab.get('cover the seed')!.id,
      }),
      tapStep({
        id: `${sceneId}-cover-seed`,
        instructionVi: 'Chạm vào đống đất bên phải để phủ hạt nhé.',
        instructionEn: 'Tap the loose soil pile on the right to cover the seed.',
        successFeedbackVi: 'Hạt đã được phủ bằng một lớp đất mỏng.',
        successFeedbackEn: 'The seed is covered with a thin layer of soil.',
        failFeedbackVi: 'Đống đất để phủ hạt ở bên phải chậu.',
        failFeedbackEn:
          'The soil for covering the seed is to the right of the pot.',
        successStateChanges: [sceneStateChanges.setVariant(potId, 'covered')],
        targetObjectId: coverSoilId,
        type: 'practice',
      }),
      listenStep({
        id: `${sceneId}-learn-plant-label`,
        instructionVi: 'Đây là thẻ tên cây.',
        instructionEn: 'This is a plant label.',
        learningScope: expandedScope,
        promptText: 'plant label',
        successFeedbackVi: 'Thẻ giúp mình nhớ hạt nào đã được gieo.',
        successFeedbackEn: 'The label helps us remember what was planted.',
        speechPractice: 'auto',
        targetObjectIds: [labelId],
        type: 'teach',
        vocabId: vocab.get('plant label')!.id,
      }),
      dragStep({
        id: `${sceneId}-place-plant-label`,
        instructionVi: 'Kéo thẻ tên cây vào chậu nhé.',
        instructionEn: 'Drag the plant label into the pot.',
        promptText: 'plant label',
        learningScope: expandedScope,
        successFeedbackVi: 'Thẻ tên cây đã được cắm sau khi phủ đất.',
        successFeedbackEn:
          'The plant label is in place after covering the seed.',
        failFeedbackVi: 'Đưa thẻ tên cây tới mép chậu.',
        failFeedbackEn: 'The edge of the pot is the target for the label.',
        successStateChanges: [
          sceneStateChanges.hide(labelId),
          sceneStateChanges.show(plantedLabelId),
        ],
        dropZoneId: potZoneId,
        targetObjectId: labelId,
        type: 'practice',
        vocabId: vocab.get('plant label')!.id,
      }),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Hạt đã được gieo và phủ đất đúng thứ tự.',
      messageEn: 'The seed was planted and covered in the right order.',
    },
  };
}

function makeFirstWateringScene(): Scene {
  const sceneId = 'first-watering';
  const vocabulary = [
    vocabularyItem(sceneId, {
      key: 'water',
      meaningVi: 'nước',
      word: 'water',
    }),
    vocabularyItem(sceneId, {
      key: 'sprout',
      meaningVi: 'mầm cây',
      word: 'sprout',
    }),
    vocabularyItem(sceneId, {
      key: 'damp',
      meaningVi: 'ẩm',
      type: 'adjective',
      word: 'damp',
    }),
    vocabularyItem(sceneId, {
      key: 'spout',
      meaningVi: 'vòi bình tưới',
      tier: 'expanded',
      word: 'spout',
    }),
    vocabularyItem(sceneId, {
      key: 'puddle',
      meaningVi: 'vũng nước',
      tier: 'expanded',
      word: 'puddle',
    }),
    vocabularyItem(sceneId, {
      key: 'water-gently',
      meaningVi: 'tưới nhẹ nhàng',
      tier: 'challenge',
      type: 'phrase',
      word: 'water it gently',
    }),
    vocabularyItem(sceneId, {
      key: 'wait-sprout',
      meaningVi: 'chờ mầm cây nhú lên',
      tier: 'challenge',
      type: 'phrase',
      word: 'wait for the sprout',
    }),
  ];
  const vocab = new Map(vocabulary.map(item => [item.word, item]));
  const potId = `${sceneId}-pot-soil`;
  const waterId = `${sceneId}-water`;
  const wateringCanId = `${sceneId}-watering-can`;
  const dampId = `${sceneId}-damp`;
  const sproutId = `${sceneId}-sprout`;
  const timeCueId = `${sceneId}-time-cue`;
  const spoutId = `${sceneId}-spout`;
  const puddleCardId = `${sceneId}-puddle-card`;
  const puddleId = `${sceneId}-puddle`;
  const waterGentlyId = `${sceneId}-water-gently`;
  const waitSproutId = `${sceneId}-wait-sprout`;
  const potZoneId = `${sceneId}-pot-zone`;

  return {
    id: sceneId,
    titleVi: 'Tưới lần đầu',
    titleEn: 'First Watering',
    thumbnailEmoji: '💧',
    background: imageAsset(
      `${sceneId}-background`,
      sceneImageSource(sceneId, 'background'),
    ),
    vocabulary,
    objects: [
      sceneObject({
        id: potId,
        assetSource: sceneImageSource(sceneId, 'pot-dry'),
        position: rect(35, 48, 32, 29),
        presentation: 'cutout',
        role: 'dropZone',
        touchArea: rect(29, 42, 44, 39),
        variants: [
          objectVariant({
            id: 'damp',
            assetSource: sceneImageSource(sceneId, 'pot-damp'),
          }),
        ],
      }),
      learningObject({
        id: waterId,
        assetSource: sceneImageSource(sceneId, 'water'),
        position: rect(11, 28, 18, 17),
        touchArea: rect(6, 23, 28, 27),
        vocab: vocab.get('water')!,
      }),
      sceneObject({
        id: wateringCanId,
        assetSource: sceneImageSource(sceneId, 'watering-can'),
        isInteractive: true,
        position: rect(68, 51, 28, 24),
        presentation: 'cutout',
        touchArea: rect(63, 46, 37, 34),
      }),
      learningObject({
        id: dampId,
        assetSource: sceneImageSource(sceneId, 'damp'),
        initialVisibility: 'hidden',
        position: rect(40, 37, 22, 13),
        touchArea: rect(34, 32, 34, 23),
        vocab: vocab.get('damp')!,
      }),
      learningObject({
        id: sproutId,
        assetSource: sceneImageSource(sceneId, 'sprout'),
        initialVisibility: 'hidden',
        position: rect(43, 34, 16, 24),
        touchArea: rect(37, 28, 28, 35),
        vocab: vocab.get('sprout')!,
      }),
      sceneObject({
        id: timeCueId,
        assetSource: sceneImageSource(sceneId, 'time-cue'),
        isInteractive: true,
        position: rect(38, 12, 25, 17),
        presentation: 'cutout',
        touchArea: rect(33, 8, 35, 25),
      }),
      learningObject({
        id: spoutId,
        assetSource: sceneImageSource(sceneId, 'spout'),
        learningScope: expandedScope,
        position: rect(72, 27, 22, 17),
        touchArea: rect(67, 22, 32, 27),
        vocab: vocab.get('spout')!,
      }),
      learningObject({
        id: puddleCardId,
        assetSource: sceneImageSource(sceneId, 'puddle'),
        learningScope: expandedScope,
        position: rect(7, 54, 22, 20),
        touchArea: rect(3, 49, 31, 30),
        vocab: vocab.get('puddle')!,
      }),
      sceneObject({
        id: puddleId,
        assetSource: sceneImageSource(sceneId, 'puddle'),
        initialVisibility: 'hidden',
        learningScope: expandedScope,
        position: rect(31, 70, 39, 13),
        presentation: 'cutout',
      }),
      sceneObject({
        id: waterGentlyId,
        assetSource: sceneImageSource(sceneId, 'water-gently'),
        isInteractive: true,
        learningScope: challengeScope,
        position: rect(8, 82, 39, 14),
        presentation: 'cutout',
        touchArea: rect(4, 78, 47, 21),
        vocabId: vocab.get('water it gently')!.id,
      }),
      sceneObject({
        id: waitSproutId,
        assetSource: sceneImageSource(sceneId, 'wait-sprout'),
        isInteractive: true,
        learningScope: challengeScope,
        position: rect(53, 82, 39, 14),
        presentation: 'cutout',
        touchArea: rect(49, 78, 47, 21),
        vocabId: vocab.get('wait for the sprout')!.id,
      }),
    ],
    dropZones: [
      {
        id: potZoneId,
        position: rect(39, 50, 24, 22),
        touchArea: rect(30, 43, 42, 36),
      },
    ],
    steps: [
      listenStep({
        id: `${sceneId}-intro`,
        instructionVi: 'Hạt đã được phủ đất. Mình tưới vừa đủ rồi chờ nhé.',
        instructionEn:
          'The seed is covered. Let’s add enough water, then wait.',
        successFeedbackVi: 'Đất cần ẩm, nhưng không cần có vũng nước.',
        successFeedbackEn: 'The soil should be damp, without a puddle.',
        targetObjectIds: [wateringCanId],
        type: 'intro',
      }),
      findStep({
        id: `${sceneId}-find-water`,
        instructionVi: 'Tìm giọt nước màu xanh nhé.',
        instructionEn: 'Find the blue water drop.',
        promptText: 'water',
        successFeedbackVi: 'Đúng rồi, cây cần nước để lớn lên.',
        successFeedbackEn: 'Yes, a plant needs water to grow.',
        failFeedbackVi: 'Giọt nước ở phía trên bên trái.',
        failFeedbackEn: 'The water drop is at the upper left.',
        effects: [lessonEffects.bounce(waterId)],
        speechPractice: 'auto',
        targetObjectId: waterId,
        type: 'practice',
        vocabId: vocab.get('water')!.id,
      }),
      tapStep({
        id: `${sceneId}-find-spout`,
        instructionVi:
          'Đây là vòi bình tưới. Chạm vào đầu vòi xanh nhé.',
        instructionEn:
          'Tap the green spout. It is part of the watering can.',
        learningScope: expandedScope,
        promptText: 'spout',
        successFeedbackVi: 'Đúng rồi, vòi giúp bình tưới rót nước nhẹ.',
        successFeedbackEn: 'The spout helps pour water gently.',
        failFeedbackVi:
          'Nhìn bình tưới, rồi chạm đầu vòi xanh phía trên.',
        failFeedbackEn:
          'Look at the watering can, then tap the green spout above it.',
        speechPractice: 'auto',
        targetObjectId: spoutId,
        type: 'teach',
        vocabId: vocab.get('spout')!.id,
      }),
      tapStep({
        id: `${sceneId}-notice-puddle`,
        instructionVi: 'Chạm vào vũng nước màu xanh nhé.',
        instructionEn: 'Tap the blue puddle.',
        learningScope: expandedScope,
        promptText: 'puddle',
        successFeedbackVi: 'Vũng nước có thể là dấu hiệu mình tưới quá nhiều.',
        successFeedbackEn: 'A puddle can mean there is too much water.',
        failFeedbackVi: 'Vũng nước màu xanh ở bên trái chậu.',
        failFeedbackEn: 'The blue puddle is to the left of the pot.',
        speechPractice: 'auto',
        targetObjectId: puddleCardId,
        type: 'teach',
        vocabId: vocab.get('puddle')!.id,
      }),
      tapStep({
        id: `${sceneId}-learn-water-gently`,
        instructionVi:
          'Rót nước thật nhẹ. Chạm vào hình bình đang tưới nhé.',
        instructionEn:
          'Pour a little water gently. Tap the picture of the watering can.',
        learningScope: challengeScope,
        promptText: 'water it gently',
        successFeedbackVi: 'Đúng rồi, mình đang tưới nhẹ nhàng.',
        successFeedbackEn: 'Yes, water it gently.',
        failFeedbackVi: 'Hình bình tưới nhỏ ở hàng dưới bên trái.',
        failFeedbackEn: 'The small watering picture is at the lower left.',
        targetObjectId: waterGentlyId,
        type: 'teach',
        vocabId: vocab.get('water it gently')!.id,
      }),
      tapStep({
        id: `${sceneId}-choose-water-gently`,
        instructionVi: 'Đâu là hình bình tưới nhẹ nhàng vào đất?',
        instructionEn: 'Which picture shows a watering can gently watering soil?',
        learningScope: challengeScope,
        promptText: 'water it gently',
        successFeedbackVi: 'Đúng rồi, tưới nhẹ nhàng.',
        successFeedbackEn: 'Right, water it gently.',
        failFeedbackVi: 'Hình bình tưới nhỏ ở hàng dưới bên trái.',
        failFeedbackEn: 'The small watering picture is at the lower left.',
        targetObjectId: waterGentlyId,
        correctObjectIds: [waterGentlyId],
        targetObjectIds: [waterGentlyId, waitSproutId],
        type: 'review',
        vocabId: vocab.get('water it gently')!.id,
      }),
      dragStep({
        id: `${sceneId}-water-pot`,
        instructionVi: 'Kéo bình tưới xanh tới chậu nhé.',
        instructionEn: 'Drag the green watering can to the pot.',
        successFeedbackVi:
          'Đất khô đã sẫm màu và hơi ướt. Đất đã ẩm.',
        successFeedbackEn:
          'The dry soil is now darker and slightly wet. It is damp.',
        failFeedbackVi: 'Đưa vòi bình tưới tới phần đất trong chậu.',
        failFeedbackEn: 'The soil in the pot is the target for the spout.',
        successStateChanges: [
          sceneStateChanges.setVariant(potId, 'damp'),
          sceneStateChanges.show(dampId),
          sceneStateChanges.hide(puddleId),
          sceneStateChanges.hide(wateringCanId),
        ],
        dropZoneId: potZoneId,
        effects: [lessonEffects.sparkle(potId)],
        targetObjectId: wateringCanId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-check-damp`,
        instructionVi:
          'Đất ẩm sẫm màu và hơi ướt. Chạm vào mảng đất nhé.',
        instructionEn:
          'Damp soil is darker and slightly wet. Tap the soil patch.',
        promptText: 'damp',
        successFeedbackVi: 'Đúng rồi, đất đang hơi ướt và đủ ẩm.',
        successFeedbackEn: 'Yes, damp means slightly wet.',
        failFeedbackVi: 'Chạm vào mảng đất sẫm màu phía trên chậu.',
        failFeedbackEn: 'The damp soil patch is just above the pot.',
        targetObjectId: dampId,
        type: 'teach',
        vocabId: vocab.get('damp')!.id,
      }),
      tapStep({
        id: `${sceneId}-learn-wait-sprout`,
        instructionVi:
          'Đợi vài ngày, mầm nhú lên. Chạm vào hình có mầm nhé.',
        instructionEn:
          'Wait a few days for the sprout. Tap the picture with the sprout.',
        learningScope: challengeScope,
        promptText: 'wait for the sprout',
        successFeedbackVi: 'Đúng rồi, mình đang chờ mầm nhú lên.',
        successFeedbackEn: 'Yes, wait for the sprout.',
        failFeedbackVi: 'Hình có mũi tên và mầm cây ở hàng dưới bên phải.',
        failFeedbackEn: 'The picture with the arrow and sprout is at the lower right.',
        targetObjectId: waitSproutId,
        type: 'teach',
        vocabId: vocab.get('wait for the sprout')!.id,
      }),
      tapStep({
        id: `${sceneId}-choose-wait-sprout`,
        instructionVi: 'Đâu là hình chờ mầm cây nhú lên?',
        instructionEn: 'Which picture shows waiting for the sprout?',
        learningScope: challengeScope,
        promptText: 'wait for the sprout',
        successFeedbackVi: 'Đúng rồi, đợi mầm nhú lên.',
        successFeedbackEn: 'Right, wait for the sprout.',
        failFeedbackVi: 'Hình có mũi tên và mầm cây ở hàng dưới bên phải.',
        failFeedbackEn: 'The picture with the arrow and sprout is at the lower right.',
        targetObjectId: waitSproutId,
        correctObjectIds: [waitSproutId],
        targetObjectIds: [waterGentlyId, waitSproutId],
        type: 'review',
        vocabId: vocab.get('wait for the sprout')!.id,
      }),
      tapStep({
        id: `${sceneId}-wait-through-time`,
        instructionVi:
          'Chạm vào vòng mặt trời và mặt trăng phía trên chậu nhé.',
        instructionEn: 'Tap the sun-and-moon circle above the pot.',
        successFeedbackVi: 'Sau nhiều ngày chăm sóc, một mầm nhỏ xuất hiện.',
        successFeedbackEn: 'After days of care, a small sprout appears.',
        failFeedbackVi: 'Vòng ngày đêm ở phía trên chậu.',
        failFeedbackEn: 'The day-and-night circle is above the pot.',
        successStateChanges: [
          sceneStateChanges.hide(dampId),
          sceneStateChanges.show(sproutId),
        ],
        effects: [lessonEffects.sparkle(sproutId)],
        targetObjectId: timeCueId,
        type: 'practice',
      }),
      tapStep({
        id: `${sceneId}-find-sprout`,
        instructionVi: 'Chạm vào mầm cây mới nhé.',
        instructionEn: 'Tap the new sprout.',
        promptText: 'sprout',
        successFeedbackVi: 'Đúng rồi, đây là mầm cây.',
        successFeedbackEn: 'Yes, this is a sprout.',
        failFeedbackVi: 'Mầm xanh nhỏ mọc giữa chậu.',
        failFeedbackEn:
          'The small green sprout is growing in the middle of the pot.',
        speechPractice: 'auto',
        targetObjectId: sproutId,
        type: 'review',
        vocabId: vocab.get('sprout')!.id,
      }),
    ],
    completionReward: {
      stars: 3,
      messageVi: 'Bé đã tưới vừa đủ và kiên nhẫn chờ mầm cây.',
      messageEn: 'You watered just enough and waited patiently for the sprout.',
    },
  };
}

export const plantASeedLesson: Lesson = {
  id: lessonId,
  themeId: 'khu-vuon-cua-be',
  titleVi: 'Bé gieo hạt',
  titleEn: 'Plant a Seed',
  descriptionVi: 'Bé cho đất vào chậu, gieo hạt và tưới vừa đủ để chờ mầm cây.',
  descriptionEn:
    'Fill a pot, plant a seed, and add just enough water for a sprout.',
  thumbnailEmoji: '🌱',
  ageRange: { min: 3, max: 5, label: '3-5 tuổi' },
  scenes: [
    makePrepareThePotScene(),
    makePlantTheSeedScene(),
    makeFirstWateringScene(),
  ],
  reviewGame: {
    id: `${lessonId}-review`,
    type: 'random',
    titleVi: 'Từ hạt tới mầm',
    config: {
      vocabularyIds: [
        'vocab-plant-a-seed-prepare-the-pot-soil',
        'vocab-plant-a-seed-plant-the-seed-seed',
        'vocab-plant-a-seed-first-watering-sprout',
        'vocab-plant-a-seed-prepare-the-pot-plant-pot',
      ],
    },
  },
  metadata: {
    parentTipVi:
      'Ba mẹ có thể cho bé gieo một hạt lớn, nhưng luôn rửa tay sau khi chạm đất.',
  },
};
