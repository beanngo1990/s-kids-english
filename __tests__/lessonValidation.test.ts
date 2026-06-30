import { lessons } from '../src/data/lessons';
import { getViAudioAsset, getWordAudioAsset } from '../src/data/audioManifest';
import {
  getAvailableLearningModes,
  getSceneForLearningMode,
} from '../src/data/learningModes';
import { atSchoolLesson } from '../src/data/lessons/atSchool';
import { lunchTimeLesson } from '../src/data/lessons/lunchTime';
import { morningRoutineLesson } from '../src/data/lessons/morningRoutine';
import { playtimeLesson } from '../src/data/lessons/playtime';
import { validateLesson, validateLessons } from '../src/data/lessonValidation';
import type { Lesson } from '../src/types/lesson';

test('lesson catalog has valid data links', () => {
  const issues = validateLessons(lessons);

  expect(issues.filter(issue => issue.severity === 'error')).toEqual([]);
});

test('lesson catalog orders the school day after the morning routine', () => {
  expect(lessons.map(lesson => lesson.id)).toEqual([
    'morning-routine',
    'at-school',
    'playtime',
    'lunch-time',
  ]);
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
  const spokenViTexts = lessons.flatMap(lesson =>
    lesson.scenes.flatMap(scene => {
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
              .map(word => ({
                lessonId: lesson.id,
                sceneId: scene.id,
                text,
                word,
              }))
          : [],
      );
    }),
  );

  expect(spokenViTexts).toEqual([]);
});

test('at-school lesson unlocks classroom content by mode', () => {
  const classroomScene = atSchoolLesson.scenes.find(
    scene => scene.id === 'classroom',
  );

  expect(classroomScene).toBeDefined();

  const coreScene = getSceneForLearningMode(classroomScene!, 'core');
  const expandedScene = getSceneForLearningMode(classroomScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(classroomScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'teacher',
    'desk',
    'chair',
  ]);
  expect(coreScene.steps.map(step => step.id)).toEqual([
    'classroom-intro',
    'classroom-teach-teacher',
    'classroom-tap-teacher',
    'classroom-teach-desk',
    'classroom-tap-desk',
    'classroom-teach-chair',
    'classroom-drag-chair-to-desk',
    'classroom-review-teacher',
  ]);

  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'teacher',
    'desk',
    'chair',
    'board',
    'classroom',
  ]);
  expect(expandedScene.steps.map(step => step.id)).toEqual(
    expect.arrayContaining([
      'classroom-teach-board',
      'classroom-tap-board',
      'classroom-teach-classroom',
    ]),
  );
  expect(expandedScene.steps.map(step => step.id)).not.toContain(
    'classroom-teach-raise-hand',
  );

  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'teacher',
    'desk',
    'chair',
    'board',
    'classroom',
    'sit down',
    'raise hand',
  ]);
  expect(challengeScene.steps.map(step => step.id)).toEqual(
    expect.arrayContaining([
      'classroom-teach-sit-down',
      'classroom-tap-chair-sit-down',
      'classroom-teach-raise-hand',
      'classroom-tap-hand',
    ]),
  );
});

test('at-school supplies scene builds from objects to school actions', () => {
  const suppliesScene = atSchoolLesson.scenes.find(
    scene => scene.id === 'school-supplies',
  );

  expect(suppliesScene).toBeDefined();

  const coreScene = getSceneForLearningMode(suppliesScene!, 'core');
  const expandedScene = getSceneForLearningMode(suppliesScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(suppliesScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'book',
    'pencil',
    'crayon',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'book',
    'pencil',
    'crayon',
    'eraser',
    'ruler',
    'notebook',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'book',
    'pencil',
    'crayon',
    'eraser',
    'ruler',
    'notebook',
    'open book',
    'draw a circle',
    'write your name',
  ]);

  expect(challengeScene.steps.map(step => step.id)).toEqual(
    expect.arrayContaining([
      'supplies-tap-book-open',
      'supplies-drag-crayon-to-paper',
      'supplies-drag-pencil-to-paper',
    ]),
  );
  expect(
    challengeScene.steps.find(
      step => step.id === 'supplies-drag-crayon-to-paper',
    )?.interaction.dropZoneId,
  ).toBe('supplies-paper-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'supplies-drag-pencil-to-paper',
    )?.vocabId,
  ).toBe('vocab-write-name');
});

test('teacher-instructions challenge follows a real classroom sequence', () => {
  const instructionsScene = atSchoolLesson.scenes.find(
    scene => scene.id === 'teacher-instructions',
  );

  expect(instructionsScene).toBeDefined();

  const challengeScene = getSceneForLearningMode(
    instructionsScene!,
    'challenge',
  );

  expect(challengeScene.steps.map(step => step.id)).toEqual(
    expect.arrayContaining([
      'instructions-teach-open-book',
      'instructions-tap-book-open',
      'instructions-drag-crayon-to-paper',
      'instructions-drag-pencil-to-paper',
      'instructions-tap-hand',
      'instructions-drag-book-to-box',
      'instructions-drag-pencil-to-box',
    ]),
  );
  expect(
    challengeScene.steps.find(step => step.id === 'instructions-tap-book-open')
      ?.vocabId,
  ).toBe('vocab-open-book');
  expect(
    challengeScene.steps.find(
      step => step.id === 'instructions-drag-crayon-to-paper',
    )?.interaction.dropZoneId,
  ).toBe('instructions-paper-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'instructions-drag-pencil-to-paper',
    )?.vocabId,
  ).toBe('vocab-write-name');
  expect(
    challengeScene.steps.find(step => step.id === 'instructions-tap-hand')
      ?.vocabId,
  ).toBe('vocab-raise-hand');
  expect(
    challengeScene.steps.find(
      step => step.id === 'instructions-drag-book-to-box',
    )?.interaction.dropZoneId,
  ).toBe('instructions-box-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'instructions-drag-pencil-to-box',
    )?.vocabId,
  ).toBe('vocab-clean-up');
});

test('playtime playground scene unlocks movement content by mode', () => {
  const playgroundScene = playtimeLesson.scenes.find(
    scene => scene.id === 'playground',
  );

  expect(playgroundScene).toBeDefined();

  const coreScene = getSceneForLearningMode(playgroundScene!, 'core');
  const expandedScene = getSceneForLearningMode(playgroundScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(playgroundScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'swing',
    'slide',
    'ball',
  ]);
  expect(coreScene.steps.map(step => step.id)).toEqual([
    'playground-intro',
    'playground-teach-swing',
    'playground-tap-swing',
    'playground-teach-slide',
    'playground-tap-slide',
    'playground-teach-ball',
    'playground-drag-ball-to-yard',
  ]);

  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'swing',
    'slide',
    'ball',
    'seesaw',
    'sandbox',
    'playground',
  ]);
  expect(expandedScene.steps.map(step => step.id)).toEqual(
    expect.arrayContaining([
      'playground-teach-seesaw',
      'playground-tap-sandbox',
      'playground-teach-playground',
    ]),
  );
  expect(expandedScene.steps.map(step => step.id)).not.toContain(
    'playground-teach-run',
  );

  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'swing',
    'slide',
    'ball',
    'seesaw',
    'sandbox',
    'playground',
    'run',
    'jump',
    'take turns',
  ]);
  expect(challengeScene.steps.map(step => step.id)).toEqual(
    expect.arrayContaining([
      'playground-tap-run-path',
      'playground-tap-jump-hoop',
      'playground-drag-ball-to-turn',
    ]),
  );

  expect(
    challengeScene.steps.find(
      step => step.id === 'playground-drag-ball-to-yard',
    )?.interaction.dropZoneId,
  ).toBe('playground-yard-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'playground-drag-ball-to-turn',
    )?.vocabId,
  ).toBe('vocab-take-turns');
});

test('playtime friend-games scene teaches sharing before group play', () => {
  const gamesScene = playtimeLesson.scenes.find(
    scene => scene.id === 'friend-games',
  );

  expect(gamesScene).toBeDefined();

  const coreScene = getSceneForLearningMode(gamesScene!, 'core');
  const expandedScene = getSceneForLearningMode(gamesScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(gamesScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'friend',
    'toy',
    'blocks',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'friend',
    'toy',
    'blocks',
    'kite',
    'rope',
    'bucket',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'friend',
    'toy',
    'blocks',
    'kite',
    'rope',
    'bucket',
    'share toys',
    'wait',
    'play together',
  ]);

  expect(
    expandedScene.steps.find(step => step.id === 'games-drag-kite-to-sky')
      ?.interaction.dropZoneId,
  ).toBe('games-sky-zone');
  expect(
    challengeScene.steps.find(step => step.id === 'games-drag-toy-to-friend')
      ?.interaction.dropZoneId,
  ).toBe('games-friend-zone');
  expect(
    challengeScene.steps.find(step => step.id === 'games-tap-wait-clock')
      ?.vocabId,
  ).toBe('vocab-wait');
  expect(
    challengeScene.steps.find(
      step => step.id === 'games-drag-blocks-play-together',
    )?.vocabId,
  ).toBe('vocab-play-together');
});

test('playtime rest scene follows a recovery sequence after active play', () => {
  const restScene = playtimeLesson.scenes.find(
    scene => scene.id === 'playtime-rest',
  );

  expect(restScene).toBeDefined();

  const coreScene = getSceneForLearningMode(restScene!, 'core');
  const expandedScene = getSceneForLearningMode(restScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(restScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'water',
    'snack',
    'bench',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'water',
    'snack',
    'bench',
    'bottle',
    'towel',
    'shade',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'water',
    'snack',
    'bench',
    'bottle',
    'towel',
    'shade',
    'drink water',
    'eat snack',
    'rest',
  ]);

  expect(
    expandedScene.steps.find(step => step.id === 'rest-drag-towel-to-face')
      ?.interaction.dropZoneId,
  ).toBe('rest-face-zone');
  expect(
    challengeScene.steps.find(step => step.id === 'rest-drag-bottle-to-mouth')
      ?.vocabId,
  ).toBe('vocab-drink-water');
  expect(
    challengeScene.steps.find(step => step.id === 'rest-drag-snack-to-mouth')
      ?.interaction.dropZoneId,
  ).toBe('rest-mouth-zone');
  expect(
    challengeScene.steps.find(step => step.id === 'rest-tap-bench-rest')
      ?.vocabId,
  ).toBe('vocab-rest');
});

test('lunch-time lunch-box scene builds from food words to eating actions', () => {
  const lunchBoxScene = lunchTimeLesson.scenes.find(
    scene => scene.id === 'lunch-box',
  );

  expect(lunchBoxScene).toBeDefined();

  const coreScene = getSceneForLearningMode(lunchBoxScene!, 'core');
  const expandedScene = getSceneForLearningMode(lunchBoxScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(lunchBoxScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'rice',
    'soup',
    'spoon',
  ]);
  expect(coreScene.steps.map(step => step.id)).toEqual([
    'lunchbox-intro',
    'lunchbox-teach-rice',
    'lunchbox-tap-rice',
    'lunchbox-teach-soup',
    'lunchbox-tap-soup',
    'lunchbox-teach-spoon',
    'lunchbox-drag-spoon-to-soup',
  ]);

  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'rice',
    'soup',
    'spoon',
    'lunchbox',
    'bowl',
    'fork',
  ]);
  expect(expandedScene.steps.map(step => step.id)).toEqual(
    expect.arrayContaining([
      'lunchbox-teach-lunchbox',
      'lunchbox-drag-soup-to-bowl',
      'lunchbox-tap-fork',
    ]),
  );
  expect(expandedScene.steps.map(step => step.id)).not.toContain(
    'lunchbox-teach-eat-lunch',
  );

  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'rice',
    'soup',
    'spoon',
    'lunchbox',
    'bowl',
    'fork',
    'open lunchbox',
    'use spoon',
    'eat lunch',
  ]);
  expect(
    challengeScene.steps.find(
      step => step.id === 'lunchbox-drag-spoon-to-mouth',
    )?.vocabId,
  ).toBe('vocab-use-spoon');
  expect(
    challengeScene.steps.find(step => step.id === 'lunchbox-drag-rice-to-mouth')
      ?.interaction.dropZoneId,
  ).toBe('lunchbox-mouth-zone');
});

test('lunch-time table scene teaches sitting, sharing, and thanking in order', () => {
  const tableScene = lunchTimeLesson.scenes.find(
    scene => scene.id === 'lunch-table',
  );

  expect(tableScene).toBeDefined();

  const coreScene = getSceneForLearningMode(tableScene!, 'core');
  const expandedScene = getSceneForLearningMode(tableScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(tableScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'table',
    'chair',
    'friend',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'table',
    'chair',
    'friend',
    'cup',
    'napkin',
    'fruit',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'table',
    'chair',
    'friend',
    'cup',
    'napkin',
    'fruit',
    'sit at table',
    'share food',
    'say thank you',
  ]);

  expect(
    coreScene.steps.find(step => step.id === 'lunchtable-drag-chair-to-table')
      ?.interaction.dropZoneId,
  ).toBe('lunchtable-table-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'lunchtable-drag-chair-to-seat',
    )?.vocabId,
  ).toBe('vocab-sit-at-table');
  expect(
    challengeScene.steps.find(
      step => step.id === 'lunchtable-drag-fruit-to-friend',
    )?.interaction.dropZoneId,
  ).toBe('lunchtable-friend-zone');
  expect(
    challengeScene.steps.find(step => step.id === 'lunchtable-tap-thanks-card')
      ?.vocabId,
  ).toBe('vocab-say-thank-you');
});

test('lunch-time cleanup scene follows a realistic after-lunch routine', () => {
  const cleanupScene = lunchTimeLesson.scenes.find(
    scene => scene.id === 'after-lunch',
  );

  expect(cleanupScene).toBeDefined();

  const coreScene = getSceneForLearningMode(cleanupScene!, 'core');
  const expandedScene = getSceneForLearningMode(cleanupScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(cleanupScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'plate',
    'crumbs',
    'trash bin',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'plate',
    'crumbs',
    'trash bin',
    'sink',
    'towel',
    'soap',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'plate',
    'crumbs',
    'trash bin',
    'sink',
    'towel',
    'soap',
    'clean up',
    'wipe table',
    'wash hands',
  ]);

  expect(
    coreScene.steps.find(step => step.id === 'cleanup-drag-crumbs-to-trash')
      ?.interaction.dropZoneId,
  ).toBe('cleanup-trash-zone');
  expect(
    challengeScene.steps.find(step => step.id === 'cleanup-drag-plate-to-sink')
      ?.vocabId,
  ).toBe('vocab-lunch-clean-up');
  expect(
    challengeScene.steps.find(step => step.id === 'cleanup-drag-towel-to-table')
      ?.interaction.dropZoneId,
  ).toBe('cleanup-table-zone');
  expect(
    challengeScene.steps.find(step => step.id === 'cleanup-drag-soap-to-hands')
      ?.vocabId,
  ).toBe('vocab-wash-hands');
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
