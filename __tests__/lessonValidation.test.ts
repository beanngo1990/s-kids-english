import { lessons } from '../src/data/lessons';
import { getViAudioAsset, getWordAudioAsset } from '../src/data/audioManifest';
import {
  getAvailableLearningModes,
  getSceneForLearningMode,
} from '../src/data/learningModes';
import { morningRoutineLesson } from '../src/data/lessons/morningRoutine';
import { validateLesson, validateLessons } from '../src/data/lessonValidation';
import type { Lesson } from '../src/types/lesson';

test('lesson catalog has valid data links', () => {
  const issues = validateLessons(lessons);

  expect(issues.filter(issue => issue.severity === 'error')).toEqual([]);
});

test('validator catches missing object references', () => {
  const invalidLesson: Lesson = {
    ageRange: {
      max: 4,
      min: 3,
    },
    descriptionVi: 'Demo',
    id: 'invalid-lesson',
    scenes: [
      {
        background: {
          id: 'invalid-background',
          source: 'lessons/invalid-lesson/invalid-scene/images/background.png',
          type: 'image',
        },
        id: 'invalid-scene',
        objects: [],
        steps: [
          {
            id: 'invalid-step',
            instructionVi: 'Chạm vào đồ vật.',
            interaction: {
              targetObjectId: 'missing-object',
              type: 'tap',
            },
            successFeedbackVi: 'Đúng rồi!',
            targetObjectIds: ['missing-object'],
            type: 'practice',
          },
        ],
        titleEn: 'Invalid',
        titleVi: 'Sai dữ liệu',
      },
    ],
    titleEn: 'Invalid Lesson',
    titleVi: 'Bài sai',
  };

  const issues = validateLesson(invalidLesson);

  expect(issues.some(issue => issue.message.includes('missing-object'))).toBe(
    true,
  );
});

test('bedroom scene keeps core short and unlocks older-child content by mode', () => {
  const bedroomScene = morningRoutineLesson.scenes.find(
    scene => scene.id === 'bedroom',
  );

  expect(bedroomScene).toBeDefined();

  const coreScene = getSceneForLearningMode(bedroomScene!, 'core');
  const expandedScene = getSceneForLearningMode(bedroomScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(bedroomScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'bed',
    'blanket',
    'sun',
  ]);
  expect(coreScene.steps.map(step => step.id)).not.toContain(
    'bedroom-teach-good-morning',
  );

  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'bed',
    'blanket',
    'sun',
    'pillow',
    'lamp',
    'clock',
  ]);
  expect(expandedScene.objects.map(object => object.id)).toEqual(
    expect.arrayContaining(['bedroom-pillow', 'bedroom-lamp', 'bedroom-clock']),
  );
  expect(expandedScene.steps.map(step => step.id)).toContain(
    'bedroom-teach-clock',
  );
  expect(expandedScene.steps.map(step => step.id)).not.toContain(
    'bedroom-teach-box',
  );

  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'bed',
    'blanket',
    'sun',
    'pillow',
    'lamp',
    'clock',
    'box',
    'socks',
    'doll',
    'good morning',
    'make the bed',
  ]);
  expect(challengeScene.objects.map(object => object.id)).toContain(
    'bedroom-doll',
  );
  expect(challengeScene.steps.map(step => step.id)).toContain(
    'bedroom-teach-doll',
  );
});

test('bedroom scene can gate older-child challenge content by age', () => {
  const bedroomScene = morningRoutineLesson.scenes.find(
    scene => scene.id === 'bedroom',
  );

  expect(bedroomScene).toBeDefined();

  const fourYearOldChallenge = getSceneForLearningMode(
    bedroomScene!,
    'challenge',
    4,
  );
  const fiveYearOldChallenge = getSceneForLearningMode(
    bedroomScene!,
    'challenge',
    5,
  );

  expect(getAvailableLearningModes(bedroomScene!, 4)).toEqual([
    'core',
    'expanded',
  ]);
  expect(getAvailableLearningModes(bedroomScene!, 5)).toEqual([
    'core',
    'expanded',
    'challenge',
  ]);
  expect(fourYearOldChallenge.vocabulary?.map(item => item.word)).toEqual([
    'bed',
    'blanket',
    'sun',
    'pillow',
    'lamp',
    'clock',
  ]);
  expect(fiveYearOldChallenge.vocabulary?.map(item => item.word)).toContain(
    'doll',
  );
  expect(fiveYearOldChallenge.vocabulary?.map(item => item.word)).toContain(
    'make the bed',
  );
});

test('bathroom scene unlocks basic, expanded, and challenge content by mode', () => {
  const bathroomScene = morningRoutineLesson.scenes.find(
    scene => scene.id === 'bathroom',
  );

  expect(bathroomScene).toBeDefined();

  const coreScene = getSceneForLearningMode(bathroomScene!, 'core');
  const expandedScene = getSceneForLearningMode(bathroomScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(bathroomScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'toothbrush',
    'water',
    'towel',
  ]);
  expect(coreScene.steps.map(step => step.id)).toEqual([
    'bathroom-intro',
    'bathroom-teach-toothbrush',
    'bathroom-tap-toothbrush',
    'bathroom-drag-toothbrush',
    'bathroom-teach-water',
    'bathroom-tap-water',
    'bathroom-teach-towel',
    'bathroom-review-towel',
  ]);

  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'toothbrush',
    'water',
    'towel',
    'sink',
    'soap',
    'mirror',
  ]);
  expect(expandedScene.steps.map(step => step.id)).toEqual(
    expect.arrayContaining([
      'bathroom-teach-sink',
      'bathroom-drag-soap-to-hand',
      'bathroom-review-mirror',
    ]),
  );
  expect(expandedScene.steps.map(step => step.id)).not.toContain(
    'bathroom-teach-toothpaste',
  );

  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'toothbrush',
    'water',
    'towel',
    'sink',
    'soap',
    'mirror',
    'toothpaste',
    'brush teeth',
    'wash face',
    'dry face',
  ]);
  expect(challengeScene.steps.map(step => step.id)).toEqual(
    expect.arrayContaining([
      'bathroom-drag-toothpaste-to-brush',
      'bathroom-teach-brush-teeth',
      'bathroom-drag-water-to-face',
      'bathroom-teach-dry-face',
    ]),
  );
});

test('bathroom challenge actions stay in a logical hygiene sequence', () => {
  const bathroomScene = morningRoutineLesson.scenes.find(
    scene => scene.id === 'bathroom',
  );

  expect(bathroomScene).toBeDefined();

  const challengeScene = getSceneForLearningMode(bathroomScene!, 'challenge');
  const toothpasteDrag = challengeScene.steps.find(
    step => step.id === 'bathroom-drag-toothpaste-to-brush',
  );
  const brushTeeth = challengeScene.steps.find(
    step => step.id === 'bathroom-drag-toothbrush',
  );
  const soapDrag = challengeScene.steps.find(
    step => step.id === 'bathroom-drag-soap-to-hand',
  );
  const washFace = challengeScene.steps.find(
    step => step.id === 'bathroom-drag-water-to-face',
  );
  const dryFaceTeach = challengeScene.steps.find(
    step => step.id === 'bathroom-teach-dry-face',
  );
  const towelReview = challengeScene.steps.find(
    step => step.id === 'bathroom-review-towel',
  );

  expect(toothpasteDrag?.interaction.targetObjectId).toBe(
    'bathroom-toothpaste',
  );
  expect(toothpasteDrag?.interaction.dropZoneId).toBe(
    'bathroom-toothbrush-zone',
  );
  expect(toothpasteDrag?.nextStepId).toBe('bathroom-teach-brush-teeth');
  expect(brushTeeth?.interaction.dropZoneId).toBe('bathroom-mouth-zone');
  expect(brushTeeth?.promptText).toBe('brush teeth');
  expect(soapDrag?.interaction.dropZoneId).toBe('bathroom-hand-zone');
  expect(washFace?.interaction.dropZoneId).toBe('bathroom-face-zone');
  expect(washFace?.vocabId).toBe('vocab-wash-face');
  expect(dryFaceTeach?.vocabId).toBe('vocab-dry-face');
  expect(towelReview?.interaction.dropZoneId).toBe('bathroom-face-zone');
  expect(towelReview?.nextStepId).toBe('bathroom-teach-mirror');
});

test('breakfast scene unlocks basic, expanded, and challenge content by mode', () => {
  const breakfastScene = morningRoutineLesson.scenes.find(
    scene => scene.id === 'breakfast',
  );

  expect(breakfastScene).toBeDefined();

  const coreScene = getSceneForLearningMode(breakfastScene!, 'core');
  const expandedScene = getSceneForLearningMode(breakfastScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(breakfastScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'milk',
    'apple',
    'bread',
  ]);
  expect(coreScene.steps.map(step => step.id)).toEqual([
    'breakfast-intro',
    'breakfast-teach-milk',
    'breakfast-tap-milk',
    'breakfast-teach-apple',
    'breakfast-drag-apple',
    'breakfast-review-bread',
  ]);

  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'milk',
    'apple',
    'bread',
    'plate',
    'egg',
    'banana',
  ]);
  expect(expandedScene.steps.map(step => step.id)).toEqual(
    expect.arrayContaining([
      'breakfast-teach-plate',
      'breakfast-drag-apple-to-plate',
      'breakfast-tap-egg',
      'breakfast-drag-banana-to-plate',
    ]),
  );
  expect(expandedScene.steps.map(step => step.id)).not.toContain(
    'breakfast-teach-cup',
  );

  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'milk',
    'apple',
    'bread',
    'plate',
    'egg',
    'banana',
    'cup',
    'pour milk',
    'eat breakfast',
  ]);
  expect(challengeScene.steps.map(step => step.id)).toEqual(
    expect.arrayContaining([
      'breakfast-teach-pour-milk',
      'breakfast-drag-milk-to-cup',
      'breakfast-teach-eat-breakfast',
      'breakfast-drag-bread-to-mouth',
    ]),
  );
});

test('breakfast challenge actions stay in a logical breakfast sequence', () => {
  const breakfastScene = morningRoutineLesson.scenes.find(
    scene => scene.id === 'breakfast',
  );

  expect(breakfastScene).toBeDefined();

  const challengeScene = getSceneForLearningMode(breakfastScene!, 'challenge');
  const milkDrag = challengeScene.steps.find(
    step => step.id === 'breakfast-drag-milk-to-cup',
  );
  const appleToPlate = challengeScene.steps.find(
    step => step.id === 'breakfast-drag-apple-to-plate',
  );
  const bananaToPlate = challengeScene.steps.find(
    step => step.id === 'breakfast-drag-banana-to-plate',
  );
  const eatBreakfastTeach = challengeScene.steps.find(
    step => step.id === 'breakfast-teach-eat-breakfast',
  );
  const breadToMouth = challengeScene.steps.find(
    step => step.id === 'breakfast-drag-bread-to-mouth',
  );

  expect(milkDrag?.interaction.targetObjectId).toBe('breakfast-milk');
  expect(milkDrag?.interaction.dropZoneId).toBe('breakfast-cup-zone');
  expect(milkDrag?.vocabId).toBe('vocab-pour-milk');
  expect(appleToPlate?.interaction.dropZoneId).toBe('breakfast-plate-zone');
  expect(appleToPlate?.interaction.targetObjectId).toBe('breakfast-apple');
  expect(bananaToPlate?.interaction.dropZoneId).toBe('breakfast-plate-zone');
  expect(bananaToPlate?.interaction.targetObjectId).toBe('breakfast-banana');
  expect(eatBreakfastTeach?.vocabId).toBe('vocab-eat-breakfast');
  expect(breadToMouth?.interaction.dropZoneId).toBe('breakfast-mouth-zone');
  expect(breadToMouth?.promptText).toBe('eat breakfast');
});

test('Vietnamese spoken prompts do not mix raw English vocabulary words', () => {
  const spokenViTexts = morningRoutineLesson.scenes.flatMap(scene => {
    const vocabularyWords = scene.vocabulary?.map(item => item.word) ?? [];
    const stepTexts = scene.steps.flatMap(step => [
      step.instructionVi,
      step.successFeedbackVi,
      step.failFeedbackVi,
    ]);

    return [...stepTexts, scene.completionReward?.messageVi].flatMap(text =>
      text
        ? vocabularyWords
            .filter(word => containsRawEnglishTerm(text, word))
            .map(word => ({ sceneId: scene.id, text, word }))
        : [],
    );
  });

  expect(spokenViTexts).toEqual([]);
});

test('school scene unlocks basic, expanded, and challenge content by mode', () => {
  const schoolScene = morningRoutineLesson.scenes.find(
    scene => scene.id === 'go-to-school',
  );

  expect(schoolScene).toBeDefined();

  const coreScene = getSceneForLearningMode(schoolScene!, 'core');
  const expandedScene = getSceneForLearningMode(schoolScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(schoolScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'bag',
    'shoes',
    'school',
  ]);
  expect(coreScene.steps.map(step => step.id)).toEqual([
    'school-intro',
    'school-teach-bag',
    'school-drag-bag',
    'school-teach-shoes',
    'school-tap-shoes',
    'school-review-school',
  ]);

  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'bag',
    'shoes',
    'school',
    'book',
    'lunchbox',
    'uniform',
  ]);
  expect(expandedScene.steps.map(step => step.id)).toEqual(
    expect.arrayContaining([
      'school-teach-book',
      'school-drag-book-to-bag',
      'school-drag-lunchbox-to-bag',
      'school-tap-uniform',
    ]),
  );
  expect(expandedScene.steps.map(step => step.id)).not.toContain(
    'school-teach-bus',
  );

  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'bag',
    'shoes',
    'school',
    'book',
    'lunchbox',
    'uniform',
    'bus',
    'pack bag',
    'put on shoes',
    'go to school',
  ]);
  expect(challengeScene.steps.map(step => step.id)).toEqual(
    expect.arrayContaining([
      'school-teach-pack-bag',
      'school-drag-shoes-to-feet',
      'school-tap-bus',
      'school-teach-go-to-school',
    ]),
  );
});

test('school challenge actions stay in a logical school-prep sequence', () => {
  const schoolScene = morningRoutineLesson.scenes.find(
    scene => scene.id === 'go-to-school',
  );

  expect(schoolScene).toBeDefined();

  const challengeScene = getSceneForLearningMode(schoolScene!, 'challenge');
  const bookToBag = challengeScene.steps.find(
    step => step.id === 'school-drag-book-to-bag',
  );
  const lunchboxToBag = challengeScene.steps.find(
    step => step.id === 'school-drag-lunchbox-to-bag',
  );
  const putOnShoesTeach = challengeScene.steps.find(
    step => step.id === 'school-teach-put-on-shoes',
  );
  const shoesToFeet = challengeScene.steps.find(
    step => step.id === 'school-drag-shoes-to-feet',
  );
  const busTap = challengeScene.steps.find(
    step => step.id === 'school-tap-bus',
  );
  const goToSchoolTeach = challengeScene.steps.find(
    step => step.id === 'school-teach-go-to-school',
  );
  const schoolReview = challengeScene.steps.find(
    step => step.id === 'school-review-school',
  );

  expect(bookToBag?.interaction.targetObjectId).toBe('school-book');
  expect(bookToBag?.interaction.dropZoneId).toBe('school-bag-zone');
  expect(bookToBag?.nextStepId).toBe('school-teach-lunchbox');
  expect(lunchboxToBag?.interaction.targetObjectId).toBe('school-lunchbox');
  expect(lunchboxToBag?.interaction.dropZoneId).toBe('school-bag-zone');
  expect(putOnShoesTeach?.vocabId).toBe('vocab-put-on-shoes');
  expect(shoesToFeet?.interaction.dropZoneId).toBe('school-feet-zone');
  expect(shoesToFeet?.promptText).toBe('put on shoes');
  expect(busTap?.interaction.targetObjectId).toBe('school-bus');
  expect(goToSchoolTeach?.vocabId).toBe('vocab-go-to-school');
  expect(schoolReview?.interaction.targetObjectId).toBe('school-building');
});

test('bedroom extended steps keep prompts aligned with the required action', () => {
  const bedroomScene = morningRoutineLesson.scenes.find(
    scene => scene.id === 'bedroom',
  );

  expect(bedroomScene).toBeDefined();

  const challengeScene = getSceneForLearningMode(bedroomScene!, 'challenge');
  const pillowPractice = challengeScene.steps.find(
    step => step.id === 'bedroom-practice-pillow',
  );
  const lampPractice = challengeScene.steps.find(
    step => step.id === 'bedroom-practice-lamp',
  );
  const clockPractice = challengeScene.steps.find(
    step => step.id === 'bedroom-practice-clock',
  );
  const boxPractice = challengeScene.steps.find(
    step => step.id === 'bedroom-practice-box',
  );
  const socksPractice = challengeScene.steps.find(
    step => step.id === 'bedroom-practice-socks',
  );
  const dollPractice = challengeScene.steps.find(
    step => step.id === 'bedroom-practice-doll',
  );
  const goodMorningTeach = challengeScene.steps.find(
    step => step.id === 'bedroom-teach-good-morning',
  );
  const makeTheBedTeach = challengeScene.steps.find(
    step => step.id === 'bedroom-teach-make-the-bed',
  );
  const pillowDrag = challengeScene.steps.find(
    step => step.id === 'bedroom-drag-pillow-to-box',
  );
  const blanketDrag = challengeScene.steps.find(
    step => step.id === 'bedroom-drag-blanket-to-box',
  );
  const socksDrag = challengeScene.steps.find(
    step => step.id === 'bedroom-drag-socks-to-box',
  );

  expect(pillowPractice?.instructionVi).toBe('Chạm vào cái gối nhé.');
  expect(pillowPractice?.interaction.targetObjectId).toBe('bedroom-pillow');
  expect(lampPractice?.instructionVi).toBe('Chạm vào đèn ngủ nhé.');
  expect(lampPractice?.interaction.targetObjectId).toBe('bedroom-lamp');
  expect(clockPractice?.instructionVi).toBe('Chạm vào đồng hồ nhé.');
  expect(clockPractice?.interaction.targetObjectId).toBe('bedroom-clock');
  expect(boxPractice?.instructionVi).toBe('Chạm vào cái hộp nhé.');
  expect(boxPractice?.interaction.targetObjectId).toBe('bedroom-box');
  expect(boxPractice?.failFeedbackVi).toBe('Cái hộp ở bên phải đó.');
  expect(socksPractice?.instructionVi).toBe('Chạm vào đôi tất nhé.');
  expect(socksPractice?.interaction.targetObjectId).toBe('bedroom-socks');
  expect(dollPractice?.instructionVi).toBe('Chạm vào búp bê nhé.');
  expect(dollPractice?.interaction.targetObjectId).toBe('bedroom-doll');
  expect(goodMorningTeach?.promptText).toBe('good morning');
  expect(goodMorningTeach?.vocabId).toBe('vocab-good-morning');
  expect(makeTheBedTeach?.promptText).toBe('make the bed');
  expect(makeTheBedTeach?.vocabId).toBe('vocab-make-the-bed');
  expect(pillowDrag?.instructionVi).toBe('Cất gối vào hộp nhé.');
  expect(pillowDrag?.interaction.targetObjectId).toBe('bedroom-pillow');
  expect(pillowDrag?.interaction.dropZoneId).toBe('bedroom-box-zone');
  expect(pillowDrag?.vocabId).toBe('vocab-pillow');
  expect(blanketDrag?.instructionVi).toBe(
    'Cất chăn vào hộp để dọn giường nhé.',
  );
  expect(blanketDrag?.interaction.targetObjectId).toBe('bedroom-blanket');
  expect(blanketDrag?.interaction.dropZoneId).toBe('bedroom-box-zone');
  expect(blanketDrag?.vocabId).toBe('vocab-make-the-bed');
  expect(socksDrag?.instructionVi).toBe('Cất tất vào hộp nhé.');
  expect(socksDrag?.interaction.targetObjectId).toBe('bedroom-socks');
  expect(socksDrag?.interaction.dropZoneId).toBe('bedroom-box-zone');
  expect(socksDrag?.vocabId).toBe('vocab-socks');
});

test('bedroom extended steps have bundled audio for their spoken prompts', () => {
  const bedroomScene = morningRoutineLesson.scenes.find(
    scene => scene.id === 'bedroom',
  );

  expect(bedroomScene).toBeDefined();

  const challengeScene = getSceneForLearningMode(bedroomScene!, 'challenge');

  challengeScene.steps
    .filter(step => step.learningScope)
    .forEach(step => {
      expect(getViAudioAsset(step.instructionVi)?.key).toBeTruthy();
      expect(getViAudioAsset(step.successFeedbackVi)?.key).toBeTruthy();

      if (step.failFeedbackVi) {
        expect(getViAudioAsset(step.failFeedbackVi)?.key).toBeTruthy();
      }
    });

  [
    'pillow',
    'lamp',
    'clock',
    'box',
    'socks',
    'doll',
    'good morning',
    'make the bed',
  ].forEach(word => {
    expect(getWordAudioAsset(word)?.key).toBeTruthy();
  });
});

function containsRawEnglishTerm(text: string, term: string) {
  if (!/[a-z]/iu.test(term)) {
    return false;
  }

  return new RegExp(
    `(^|[^\\p{L}])${escapeRegExp(term)}(?=$|[^\\p{L}])`,
    'iu',
  ).test(text);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}
