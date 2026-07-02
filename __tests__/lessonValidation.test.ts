import { lessons } from '../src/data/lessons';
import { getViAudioAsset, getWordAudioAsset } from '../src/data/audioManifest';
import {
  getAvailableLearningModes,
  getSceneForLearningMode,
} from '../src/data/learningModes';
import { afternoonHomeLesson } from '../src/data/lessons/afternoonHome';
import { atSchoolLesson } from '../src/data/lessons/atSchool';
import { homePlayLesson } from '../src/data/lessons/homePlay';
import { lunchTimeLesson } from '../src/data/lessons/lunchTime';
import { morningRoutineLesson } from '../src/data/lessons/morningRoutine';
import { playtimeLesson } from '../src/data/lessons/playtime';
import { snackTimeLesson } from '../src/data/lessons/snackTime';
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
    'afternoon-home',
    'snack-time',
    'home-play',
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

test('afternoon-home going-home scene builds from packing objects to dismissal actions', () => {
  const goingHomeScene = afternoonHomeLesson.scenes.find(
    scene => scene.id === 'going-home',
  );

  expect(goingHomeScene).toBeDefined();

  const coreScene = getSceneForLearningMode(goingHomeScene!, 'core');
  const expandedScene = getSceneForLearningMode(goingHomeScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(goingHomeScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'bag',
    'jacket',
    'door',
  ]);
  expect(coreScene.steps.map(step => step.id)).toEqual([
    'going-home-intro',
    'going-home-teach-bag',
    'going-home-tap-bag',
    'going-home-teach-jacket',
    'going-home-tap-jacket',
    'going-home-teach-door',
    'going-home-drag-bag-to-door',
  ]);

  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'bag',
    'jacket',
    'door',
    'bottle',
    'folder',
    'teacher',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'bag',
    'jacket',
    'door',
    'bottle',
    'folder',
    'teacher',
    'pack bag',
    'say goodbye',
    'line up',
  ]);

  expect(
    expandedScene.steps.find(
      step => step.id === 'going-home-drag-bottle-to-bag',
    )?.interaction.dropZoneId,
  ).toBe('going-home-bag-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'going-home-drag-folder-to-bag',
    )?.vocabId,
  ).toBe('vocab-afternoon-pack-bag');
  expect(
    challengeScene.steps.find(step => step.id === 'going-home-tap-goodbye-card')
      ?.vocabId,
  ).toBe('vocab-say-goodbye');
  expect(
    challengeScene.steps.find(step => step.id === 'going-home-drag-bag-to-line')
      ?.interaction.dropZoneId,
  ).toBe('going-home-line-zone');
});

test('afternoon-home ride-home scene teaches safe travel steps', () => {
  const rideHomeScene = afternoonHomeLesson.scenes.find(
    scene => scene.id === 'ride-home',
  );

  expect(rideHomeScene).toBeDefined();

  const coreScene = getSceneForLearningMode(rideHomeScene!, 'core');
  const expandedScene = getSceneForLearningMode(rideHomeScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(rideHomeScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'bus',
    'road',
    'home',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'bus',
    'road',
    'home',
    'window',
    'seat belt',
    'traffic light',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'bus',
    'road',
    'home',
    'window',
    'seat belt',
    'traffic light',
    'get on bus',
    'buckle up',
    'arrive home',
  ]);

  expect(
    coreScene.steps.find(step => step.id === 'ride-home-drag-bus-to-road')
      ?.interaction.dropZoneId,
  ).toBe('ride-home-road-zone');
  expect(
    expandedScene.steps.find(
      step => step.id === 'ride-home-drag-seat-belt-to-seat',
    )?.interaction.dropZoneId,
  ).toBe('ride-home-seat-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'ride-home-drag-seat-belt-buckle',
    )?.vocabId,
  ).toBe('vocab-buckle-up');
  expect(
    challengeScene.steps.find(step => step.id === 'ride-home-drag-bus-to-house')
      ?.vocabId,
  ).toBe('vocab-arrive-home');
});

test('afternoon-home arrival scene follows the home arrival routine', () => {
  const arrivalScene = afternoonHomeLesson.scenes.find(
    scene => scene.id === 'home-arrival',
  );

  expect(arrivalScene).toBeDefined();

  const coreScene = getSceneForLearningMode(arrivalScene!, 'core');
  const expandedScene = getSceneForLearningMode(arrivalScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(arrivalScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'home',
    'family',
    'shoes',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'home',
    'family',
    'shoes',
    'shelf',
    'soap',
    'towel',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'home',
    'family',
    'shoes',
    'shelf',
    'soap',
    'towel',
    'take off shoes',
    'wash hands',
    'hug family',
  ]);

  expect(
    coreScene.steps.find(step => step.id === 'home-arrival-drag-shoes-to-door')
      ?.interaction.dropZoneId,
  ).toBe('home-arrival-door-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'home-arrival-drag-shoes-to-shelf',
    )?.vocabId,
  ).toBe('vocab-take-off-shoes');
  expect(
    challengeScene.steps.find(
      step => step.id === 'home-arrival-drag-soap-to-hands',
    )?.interaction.dropZoneId,
  ).toBe('home-arrival-hands-zone');
  expect(
    challengeScene.steps.find(step => step.id === 'home-arrival-tap-family-hug')
      ?.vocabId,
  ).toBe('vocab-hug-family');
});

test('snack-time prep scene focuses on snack-specific foods and snack box actions', () => {
  const prepScene = snackTimeLesson.scenes.find(
    scene => scene.id === 'snack-prep',
  );

  expect(prepScene).toBeDefined();

  const coreScene = getSceneForLearningMode(prepScene!, 'core');
  const expandedScene = getSceneForLearningMode(prepScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(prepScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'snack',
    'yogurt',
    'cookie',
  ]);
  expect(coreScene.steps.map(step => step.id)).toEqual([
    'snack-prep-intro',
    'snack-prep-teach-snack',
    'snack-prep-tap-snack',
    'snack-prep-teach-yogurt',
    'snack-prep-tap-yogurt',
    'snack-prep-teach-cookie',
    'snack-prep-drag-cookie-to-snack',
  ]);

  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'snack',
    'yogurt',
    'cookie',
    'juice',
    'straw',
    'snack box',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'snack',
    'yogurt',
    'cookie',
    'juice',
    'straw',
    'snack box',
    'choose snack',
    'open snack box',
    'pour juice',
  ]);

  expect(
    expandedScene.steps.find(
      step => step.id === 'snack-prep-drag-straw-to-juice',
    )?.interaction.dropZoneId,
  ).toBe('snack-prep-juice-zone');
  expect(
    challengeScene.steps.find(step => step.id === 'snack-prep-tap-box-open')
      ?.vocabId,
  ).toBe('vocab-open-snack-box');
  expect(
    challengeScene.steps.find(
      step => step.id === 'snack-prep-drag-juice-to-container',
    )?.vocabId,
  ).toBe('vocab-pour-juice');
  expect(
    challengeScene.steps.find(step => step.id === 'snack-prep-tap-choice')
      ?.interaction.correctObjectIds,
  ).toEqual(['snack-prep-snack', 'snack-prep-yogurt', 'snack-prep-cookie']);
});

test('snack-time eating scene teaches small bites and sips', () => {
  const tableScene = snackTimeLesson.scenes.find(
    scene => scene.id === 'snack-table',
  );

  expect(tableScene).toBeDefined();

  const coreScene = getSceneForLearningMode(tableScene!, 'core');
  const expandedScene = getSceneForLearningMode(tableScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(tableScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'bite',
    'sip',
    'napkin',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'bite',
    'sip',
    'napkin',
    'cracker',
    'raisins',
    'small table',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'bite',
    'sip',
    'napkin',
    'cracker',
    'raisins',
    'small table',
    'take a bite',
    'sip juice',
    'wipe mouth',
  ]);

  expect(
    challengeScene.steps.find(
      step => step.id === 'snack-table-drag-cracker-to-mouth',
    )?.interaction.dropZoneId,
  ).toBe('snack-table-mouth-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'snack-table-drag-sip-to-mouth',
    )?.vocabId,
  ).toBe('vocab-sip-juice');
  expect(
    challengeScene.steps.find(
      step => step.id === 'snack-table-drag-napkin-to-mouth',
    )?.vocabId,
  ).toBe('vocab-wipe-mouth');
});

test('snack-time cleanup scene follows a realistic after-snack routine', () => {
  const cleanupScene = snackTimeLesson.scenes.find(
    scene => scene.id === 'snack-cleanup',
  );

  expect(cleanupScene).toBeDefined();

  const coreScene = getSceneForLearningMode(cleanupScene!, 'core');
  const expandedScene = getSceneForLearningMode(cleanupScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(cleanupScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'tray',
    'crumbs',
    'wrapper',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'tray',
    'crumbs',
    'wrapper',
    'trash bin',
    'cloth',
    'basket',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'tray',
    'crumbs',
    'wrapper',
    'trash bin',
    'cloth',
    'basket',
    'throw away wrapper',
    'wipe table',
    'put away tray',
  ]);

  expect(
    coreScene.steps.find(
      step => step.id === 'snack-cleanup-drag-wrapper-to-tray',
    )?.interaction.dropZoneId,
  ).toBe('snack-cleanup-tray-zone');
  expect(
    expandedScene.steps.find(
      step => step.id === 'snack-cleanup-drag-wrapper-to-trash',
    )?.interaction.dropZoneId,
  ).toBe('snack-cleanup-trash-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'snack-cleanup-drag-wrapper-away',
    )?.vocabId,
  ).toBe('vocab-throw-away-wrapper');
  expect(
    challengeScene.steps.find(
      step => step.id === 'snack-cleanup-drag-cloth-to-table',
    )?.vocabId,
  ).toBe('vocab-wipe-table');
  expect(
    challengeScene.steps.find(
      step => step.id === 'snack-cleanup-drag-tray-away',
    )?.vocabId,
  ).toBe('vocab-put-away-tray');
});

test('home-play toy corner scene moves from toy names to careful play actions', () => {
  const toyCornerScene = homePlayLesson.scenes.find(
    scene => scene.id === 'home-toy-corner',
  );

  expect(toyCornerScene).toBeDefined();

  const coreScene = getSceneForLearningMode(toyCornerScene!, 'core');
  const expandedScene = getSceneForLearningMode(toyCornerScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(toyCornerScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'toy',
    'blocks',
    'box',
  ]);
  expect(coreScene.steps.map(step => step.id)).toEqual([
    'home-toy-corner-intro',
    'home-toy-corner-teach-toy',
    'home-toy-corner-tap-toy',
    'home-toy-corner-teach-blocks',
    'home-toy-corner-tap-blocks',
    'home-toy-corner-teach-box',
    'home-toy-corner-drag-blocks-to-box',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'toy',
    'blocks',
    'box',
    'doll',
    'car',
    'shelf',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'toy',
    'blocks',
    'box',
    'doll',
    'car',
    'shelf',
    'choose toy',
    'build tower',
    'play gently',
  ]);

  expect(
    expandedScene.steps.find(
      step => step.id === 'home-toy-corner-drag-car-to-floor',
    )?.interaction.dropZoneId,
  ).toBe('home-toy-corner-car-zone');
  expect(
    challengeScene.steps.find(step => step.id === 'home-toy-corner-tap-choice')
      ?.interaction.correctObjectIds,
  ).toEqual([
    'home-toy-corner-toy',
    'home-toy-corner-doll',
    'home-toy-corner-car',
  ]);
  expect(
    challengeScene.steps.find(
      step => step.id === 'home-toy-corner-drag-blocks-to-tower',
    )?.interaction.dropZoneId,
  ).toBe('home-toy-corner-tower-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'home-toy-corner-tap-doll-gently',
    )?.vocabId,
  ).toBe('vocab-play-gently');
});

test('home-play creative scene teaches reading drawing and puzzle actions', () => {
  const creativeScene = homePlayLesson.scenes.find(
    scene => scene.id === 'creative-play',
  );

  expect(creativeScene).toBeDefined();

  const coreScene = getSceneForLearningMode(creativeScene!, 'core');
  const expandedScene = getSceneForLearningMode(creativeScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(creativeScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'book',
    'crayon',
    'paper',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'book',
    'crayon',
    'paper',
    'puzzle',
    'drum',
    'music',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'book',
    'crayon',
    'paper',
    'puzzle',
    'drum',
    'music',
    'read book',
    'draw picture',
    'solve puzzle',
  ]);

  expect(
    coreScene.steps.find(
      step => step.id === 'creative-play-drag-crayon-to-paper',
    )?.interaction.dropZoneId,
  ).toBe('creative-play-paper-zone');
  expect(
    challengeScene.steps.find(step => step.id === 'creative-play-tap-book-read')
      ?.vocabId,
  ).toBe('vocab-read-book');
  expect(
    challengeScene.steps.find(
      step => step.id === 'creative-play-drag-crayon-draw',
    )?.interaction.dropZoneId,
  ).toBe('creative-play-paper-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'creative-play-drag-puzzle-piece',
    )?.interaction.dropZoneId,
  ).toBe('creative-play-puzzle-zone');
});

test('home-play cleanup scene keeps the after-play routine realistic', () => {
  const cleanupScene = homePlayLesson.scenes.find(
    scene => scene.id === 'toy-cleanup',
  );

  expect(cleanupScene).toBeDefined();

  const coreScene = getSceneForLearningMode(cleanupScene!, 'core');
  const expandedScene = getSceneForLearningMode(cleanupScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(cleanupScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'basket',
    'floor',
    'shelf',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'basket',
    'floor',
    'shelf',
    'book',
    'blocks',
    'car',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'basket',
    'floor',
    'shelf',
    'book',
    'blocks',
    'car',
    'clean up toys',
    'put away book',
    'tidy room',
  ]);

  expect(
    coreScene.steps.find(step => step.id === 'toy-cleanup-drag-toy-to-basket')
      ?.interaction.dropZoneId,
  ).toBe('toy-cleanup-basket-zone');
  expect(
    expandedScene.steps.find(
      step => step.id === 'toy-cleanup-drag-book-to-shelf',
    )?.interaction.dropZoneId,
  ).toBe('toy-cleanup-shelf-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'toy-cleanup-drag-toy-clean-up',
    )?.vocabId,
  ).toBe('vocab-clean-up-toys');
  expect(
    challengeScene.steps.find(
      step => step.id === 'toy-cleanup-drag-basket-to-shelf',
    )?.vocabId,
  ).toBe('vocab-tidy-room');
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
