import { lessons } from '../src/data/lessons';
import { getViAudioAsset, getWordAudioAsset } from '../src/data/audioManifest';
import {
  getAvailableLearningModes,
  getSceneForLearningMode,
} from '../src/data/learningModes';
import { afterDinnerCleanupLesson } from '../src/data/lessons/afterDinnerCleanup';
import { afternoonBathLesson } from '../src/data/lessons/afternoonBath';
import { afternoonHomeLesson } from '../src/data/lessons/afternoonHome';
import { atSchoolLesson } from '../src/data/lessons/atSchool';
import { bedtimeLesson } from '../src/data/lessons/bedtime';
import { beachDayLesson } from '../src/data/lessons/beachDay';
import { familyDinnerLesson } from '../src/data/lessons/familyDinner';
import { homePlayLesson } from '../src/data/lessons/homePlay';
import { lunchTimeLesson } from '../src/data/lessons/lunchTime';
import { morningRoutineLesson } from '../src/data/lessons/morningRoutine';
import { playtimeLesson } from '../src/data/lessons/playtime';
import { snackTimeLesson } from '../src/data/lessons/snackTime';
import { supermarketTripLesson } from '../src/data/lessons/supermarketTrip';
import { validateLesson, validateLessons } from '../src/data/lessonValidation';
import { validateThemes } from '../src/data/themeValidation';
import { BODY_FEELINGS_SELF_CARE_THEME_ID, themes } from '../src/data/themes';
import {
  getTeacherFeedbackEn,
  getTeacherInstructionEn,
  resolveTeacherFeedback,
  resolveTeacherInstruction,
} from '../src/i18n/teacherPrompts';
import { ENGLISH_ACCENTS } from '../src/types/audio';
import type { Lesson } from '../src/types/lesson';

test('lesson catalog has valid data links', () => {
  const issues = validateLessons(lessons);

  expect(issues.filter(issue => issue.severity === 'error')).toEqual([]);
});

test('lesson teacher copy stays contextual and natural in bilingual mode', () => {
  const malformedEnglish =
    /\b(?:air-dried dry|arrived the home|draged|the everyone|the gently|the softly|the good night|the goodbye|the off shoes)\b/iu;

  for (const lesson of lessons) {
    for (const scene of lesson.scenes) {
      if (scene.completionReward?.messageVi) {
        expect(scene.completionReward.messageEn?.trim()).toBeTruthy();
      }

      for (const step of scene.steps) {
        const instructionEn = getTeacherInstructionEn(step, scene);
        const successEn = getTeacherFeedbackEn('success', step, scene);
        const failEn = getTeacherFeedbackEn('fail', step, scene);

        for (const englishText of [instructionEn, successEn, failEn]) {
          if (englishText) {
            expect(englishText).not.toMatch(malformedEnglish);
          }
        }

        if (step.type === 'intro') {
          expect(step.instructionEn?.trim()).toBeTruthy();
          expect(step.successFeedbackEn?.trim()).toBeTruthy();
          expect(instructionEn).not.toBe(successEn);
        }

        const promptVocabulary = scene.vocabulary?.find(
          item => item.id === step.vocabId,
        );
        if (
          step.interaction.type === 'tap' &&
          promptVocabulary?.type === 'noun' &&
          step.promptText?.trim().toLocaleLowerCase('en-US') ===
            promptVocabulary.word.toLocaleLowerCase('en-US')
        ) {
          expect(instructionEn).toMatch(/^Tap\b/u);
        }

        if (
          step.failFeedbackVi &&
          /(?:^|\s)(?:ở|nằm|đứng|treo|đang)(?:\s|$)/iu.test(step.failFeedbackVi)
        ) {
          expect(failEn).not.toMatch(/^(?:Move|Tap|Try)\b/u);
        }
      }
    }
  }
});

test('teacher-instructions intro uses equivalent Vietnamese and English copy', () => {
  const scene = atSchoolLesson.scenes.find(
    item => item.id === 'teacher-instructions',
  );
  const step = scene?.steps.find(item => item.id === 'instructions-intro');

  expect(scene).toBeDefined();
  expect(step).toBeDefined();
  expect(resolveTeacherInstruction(step!, 'bilingual', scene)).toEqual({
    displayText: "Cô giáo sẽ hướng dẫn bé nhé.\nI'll guide you.",
    segments: [
      { language: 'vi', text: 'Cô giáo sẽ hướng dẫn bé nhé.' },
      { language: 'en', text: "I'll guide you." },
    ],
  });
  expect(
    resolveTeacherFeedback({
      mode: 'bilingual',
      scene,
      step,
      type: 'success',
      viText: step!.successFeedbackVi,
    }),
  ).toEqual({
    displayText: "Mình cùng lắng nghe nào.\nLet's listen together.",
    segments: [
      { language: 'vi', text: 'Mình cùng lắng nghe nào.' },
      { language: 'en', text: "Let's listen together." },
    ],
  });
});

test('theme catalog references valid lesson routes', () => {
  const issues = validateThemes(themes, lessons);

  expect(issues.filter(issue => issue.severity === 'error')).toEqual([]);
});

test('lesson catalog keeps theme journeys in authored order', () => {
  expect(lessons.map(lesson => lesson.id)).toEqual([
    'morning-routine',
    'at-school',
    'playtime',
    'lunch-time',
    'afternoon-home',
    'snack-time',
    'home-play',
    'afternoon-bath',
    'family-dinner',
    'after-dinner-cleanup',
    'bedtime',
    'supermarket-trip',
    'park-visit',
    'beach-day',
    'animal-trip',
    'library-visit',
    'doctor-visit',
    'birthday-party',
    'grandparents-visit',
    'my-body',
    'five-senses',
    'my-feelings',
    'calm-myself',
    'personal-care',
    'dress-myself',
    'toilet-routine',
    'speaking-up',
    'plant-a-seed',
    'help-it-grow',
    'garden-friends',
    'harvest-day',
    'garden-to-table',
    'feed-the-puppy',
    'play-with-the-puppy',
    'find-the-kitten',
    'clean-muddy-paws',
  ]);
});

test('supermarket prompts stay concise after earlier drag steps move objects', () => {
  const freshFoods = supermarketTripLesson.scenes.find(
    scene => scene.id === 'fresh-foods',
  );
  const checkoutCounter = supermarketTripLesson.scenes.find(
    scene => scene.id === 'checkout-counter',
  );
  const grapes = freshFoods?.steps.find(
    step => step.id === 'fresh-foods-drag-grapes',
  );
  const scale = freshFoods?.steps.find(
    step => step.id === 'fresh-foods-tap-scale',
  );
  const receipt = checkoutCounter?.steps.find(
    step => step.id === 'checkout-counter-tap-receipt',
  );
  const scanner = checkoutCounter?.steps.find(
    step => step.id === 'checkout-counter-tap-scanner',
  );
  const paymentCard = checkoutCounter?.steps.find(
    step => step.id === 'checkout-counter-tap-card',
  );

  expect(grapes?.instructionVi).toBe(
    'Kéo chùm nho tím trên cân vào vòng sáng nhé.',
  );
  expect(scale?.instructionVi).toBe('Chạm vào cái cân xanh bên phải nhé.');
  expect(receipt?.instructionVi).toBe('Chạm vào hóa đơn dưới cô thu ngân nhé.');
  expect(scanner?.instructionVi).toBe(
    'Chạm vào máy quét bên trái thẻ thanh toán nhé.',
  );
  expect(paymentCard?.instructionVi).toBe(
    'Chạm vào thẻ thanh toán cạnh hóa đơn nhé.',
  );

  supermarketTripLesson.scenes.forEach(scene => {
    scene.steps
      .filter(step => step.type === 'practice')
      .forEach(step => {
        expect(
          step.instructionVi.trim().split(/\s+/u).length,
        ).toBeLessThanOrEqual(12);
      });
  });
});

test('beach prompts do not anchor later steps to moved objects', () => {
  const sandPlay = beachDayLesson.scenes.find(
    scene => scene.id === 'sand-play',
  );
  const shellStepIndex =
    sandPlay?.steps.findIndex(step => step.id === 'sand-play-drag-shell') ?? -1;
  const bucketStepIndex =
    sandPlay?.steps.findIndex(step => step.id === 'sand-play-tap-bucket') ?? -1;
  const bucket = sandPlay?.steps[bucketStepIndex];

  expect(shellStepIndex).toBeGreaterThanOrEqual(0);
  expect(bucketStepIndex).toBeGreaterThan(shellStepIndex);
  expect(bucket?.instructionVi).toBe(
    'Chạm vào cái xô ở phía trên bên phải nhé.',
  );
  expect(bucket?.failFeedbackVi).toBe('Cái xô nằm ở phía trên bên phải.');
  expect(bucket?.instructionVi).not.toContain('vỏ sò');
  expect(bucket?.failFeedbackVi).not.toContain('vỏ sò');
});

test('Theme 2 lesson content stays concise, progressive, and natural', () => {
  const themeLessons = lessons.filter(
    lesson => lesson.themeId === 'be-ra-ngoai-kham-pha',
  );
  const seenWords = new Set<string>();
  const nonDraggableWords = new Set([
    'book return',
    'chicken',
    'circle',
    'cow',
    'crab',
    'flower',
    'fountain',
    'giraffe',
    'grandpa',
    'habitat',
    'hug',
    'lifeguard',
    'music',
    'nurse',
    'path',
    'puzzle',
    'reading chair',
    'shelf',
    'weighing scale',
    'zookeeper',
  ]);

  expect(themeLessons.map(lesson => lesson.id)).toEqual([
    'supermarket-trip',
    'park-visit',
    'beach-day',
    'animal-trip',
    'library-visit',
    'doctor-visit',
    'birthday-party',
    'grandparents-visit',
  ]);

  for (const lesson of themeLessons) {
    for (const scene of lesson.scenes) {
      expect(getSceneForLearningMode(scene, 'core').vocabulary).toHaveLength(3);
      expect(
        getSceneForLearningMode(scene, 'expanded').vocabulary,
      ).toHaveLength(6);
      expect(
        getSceneForLearningMode(scene, 'challenge').vocabulary,
      ).toHaveLength(9);

      expect(scene.completionReward?.messageVi).not.toMatch(
        /(?:biết|học).*\btừ\b/iu,
      );
      expect(scene.completionReward?.messageEn).not.toMatch(
        /learn(?:ed|t).*\bwords?\b/iu,
      );

      for (const vocabulary of scene.vocabulary ?? []) {
        const normalizedWord = vocabulary.word
          .trim()
          .toLocaleLowerCase('en-US');
        expect(seenWords.has(normalizedWord)).toBe(false);
        seenWords.add(normalizedWord);

        if (nonDraggableWords.has(normalizedWord)) {
          const practiceStep = scene.steps.find(
            step => step.type === 'practice' && step.vocabId === vocabulary.id,
          );
          expect(practiceStep?.interaction.type).not.toBe('drag');
        }

        if (vocabulary.type === 'phrase' && lesson.id !== 'supermarket-trip') {
          const practiceStep = scene.steps.find(
            step => step.type === 'practice' && step.vocabId === vocabulary.id,
          );
          expect(getTeacherInstructionEn(practiceStep!, scene)).toMatch(
            /^(?:Drag|Tap) the matching action card\b/u,
          );
        }
      }

      for (const step of scene.steps.filter(item => item.type === 'practice')) {
        expect(
          step.instructionVi.trim().split(/\s+/u).length,
        ).toBeLessThanOrEqual(12);
        expect(getTeacherInstructionEn(step, scene)).not.toMatch(
          /\b(?:into|to) the action\b/iu,
        );
        expect(getTeacherFeedbackEn('fail', step, scene)).not.toMatch(
          /\b(?:into|to) the action\b/iu,
        );
      }
    }
  }

  expect(seenWords.has('life jacket')).toBe(true);
  expect(seenWords.has('take medicine with a grown-up')).toBe(true);
  expect(seenWords.has('ask for a hug')).toBe(true);
  expect(seenWords.has('swim ring')).toBe(false);
  expect(seenWords.has('blow up a balloon')).toBe(false);
  expect(seenWords.has('cut the cake')).toBe(false);
});

test('Theme 3 content progresses from body awareness to speaking up', () => {
  const themeLessons = lessons.filter(
    lesson => lesson.themeId === BODY_FEELINGS_SELF_CARE_THEME_ID,
  );
  const seenWords = new Set<string>();
  const draggableStepIds = new Set<string>();
  const expectedDraggableStepIds = new Set([
    'arms-and-hands-drag-hand',
    'care-items-drag-toothbrush',
    'choose-clothes-drag-shorts',
    'clean-and-private-drag-hand-soap',
    'comfort-corner-drag-cushion',
    'face-and-hair-care-drag-comb',
    'fasteners-and-shoes-drag-zipper',
    'head-and-face-drag-eyes',
    'legs-and-feet-drag-foot',
    'slow-breathing-drag-feather',
  ]);

  expect(themeLessons.map(lesson => lesson.id)).toEqual([
    'my-body',
    'five-senses',
    'my-feelings',
    'calm-myself',
    'personal-care',
    'dress-myself',
    'toilet-routine',
    'speaking-up',
  ]);

  for (const lesson of themeLessons) {
    expect(lesson.scenes).toHaveLength(3);

    for (const scene of lesson.scenes) {
      expect(getSceneForLearningMode(scene, 'core').vocabulary).toHaveLength(3);
      expect(
        getSceneForLearningMode(scene, 'expanded').vocabulary,
      ).toHaveLength(6);
      expect(
        getSceneForLearningMode(scene, 'challenge').vocabulary,
      ).toHaveLength(9);

      for (const vocabulary of scene.vocabulary ?? []) {
        const normalizedWord = vocabulary.word
          .trim()
          .toLocaleLowerCase('en-US');
        expect(seenWords.has(normalizedWord)).toBe(false);
        seenWords.add(normalizedWord);

        if (vocabulary.type === 'adjective') {
          const teachStep = scene.steps.find(
            step => step.type === 'teach' && step.vocabId === vocabulary.id,
          );
          expect(getTeacherInstructionEn(teachStep!, scene)).toMatch(
            /^Let's learn the word\b/u,
          );
        }

        if (vocabulary.type === 'phrase') {
          const practiceStep = scene.steps.find(
            step => step.type === 'practice' && step.vocabId === vocabulary.id,
          );
          expect(practiceStep?.interaction.type).toBe('tap');
          expect(getTeacherInstructionEn(practiceStep!, scene)).toMatch(
            /^Tap the matching card\b/u,
          );
        }
      }

      for (const step of scene.steps.filter(item => item.type === 'practice')) {
        if (step.interaction.type === 'drag') {
          draggableStepIds.add(step.id);
        }
        expect(
          step.instructionVi.trim().split(/\s+/u).length,
        ).toBeLessThanOrEqual(12);
        expect(step.instructionVi).not.toMatch(/(?:bên cạnh|ngay cạnh)/iu);
        expect(step.instructionVi).not.toMatch(
          /(?:góc (?:trên|dưới)|hàng dưới|phía (?:trên|dưới) bên|ở (?:bên trái|bên phải|chính giữa))/iu,
        );
        expect(step.failFeedbackVi).toMatch(
          /(?:hàng dưới|phía trên|phía dưới|bên trái|bên phải|chính giữa)/iu,
        );
      }

      expect(
        scene.objects.slice(6).every(object => object.position.y >= 80),
      ).toBe(true);
    }
  }

  const bodyLesson = themeLessons.find(lesson => lesson.id === 'my-body');
  for (const scene of bodyLesson?.scenes ?? []) {
    const character = scene.character!;
    const characterCenter = character.position.x + character.position.width / 2;
    const contextualObjects = scene.objects.slice(0, 6);

    expect(character.position.x).toBeGreaterThanOrEqual(30);
    expect(
      contextualObjects.filter(
        object =>
          object.position.x + object.position.width / 2 < characterCenter,
      ).length,
    ).toBeGreaterThanOrEqual(2);
    expect(
      contextualObjects.filter(
        object =>
          object.position.x + object.position.width / 2 > characterCenter,
      ).length,
    ).toBeGreaterThanOrEqual(2);
  }

  expect(draggableStepIds).toEqual(expectedDraggableStepIds);
  expect(seenWords.size).toBe(216);
  expect(seenWords.has('please give me privacy')).toBe(true);
  expect(seenWords.has("I don't like that".toLocaleLowerCase('en-US'))).toBe(
    true,
  );
  expect(seenWords.has('tell a trusted grown-up')).toBe(true);
});

test('validator catches missing object references', () => {
  const invalidLesson: Lesson = {
    ageRange: {
      max: 4,
      min: 3,
    },
    descriptionVi: 'Demo',
    id: 'invalid-lesson',
    themeId: 'mot-ngay-cua-be',
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

test('validator requires vocabulary for an authored speech-practice step', () => {
  const invalidLesson: Lesson = {
    ageRange: { max: 8, min: 3 },
    descriptionVi: 'Demo',
    id: 'invalid-speech-practice-lesson',
    scenes: [
      {
        background: {
          id: 'invalid-speech-background',
          source: 'lessons/invalid-speech/images/background.png',
          type: 'image',
        },
        id: 'invalid-speech-scene',
        objects: [],
        steps: [
          {
            id: 'invalid-speech-step',
            instructionVi: 'Nói cùng cô nhé.',
            interaction: { type: 'listen' },
            speechPractice: 'optional',
            successFeedbackVi: 'Giỏi lắm!',
            targetObjectIds: [],
            type: 'practice',
          },
        ],
        titleEn: 'Invalid speech practice',
        titleVi: 'Luyện nói sai',
      },
    ],
    themeId: 'mot-ngay-cua-be',
    titleEn: 'Invalid speech practice',
    titleVi: 'Luyện nói sai',
  };

  const issues = validateLesson(invalidLesson);

  expect(issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        message:
          'Speech-practice step must reference vocabulary through vocabId or a target object.',
        severity: 'error',
      }),
    ]),
  );
});

test('validator rejects a non-interactive drag target', () => {
  const invalidLesson: Lesson = {
    ...afternoonBathLesson,
    scenes: afternoonBathLesson.scenes.map(scene =>
      scene.id === 'bath-rinse'
        ? {
            ...scene,
            objects: scene.objects.map(object =>
              object.id === 'bath-rinse-sponge'
                ? { ...object, isInteractive: false }
                : object,
            ),
          }
        : scene,
    ),
  };

  const issues = validateLesson(invalidLesson);

  expect(issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        message: 'Drag target "bath-rinse-sponge" must be interactive.',
        severity: 'error',
      }),
    ]),
  );
});

test.each(['tap', 'find'] as const)(
  'validator rejects a non-interactive %s target',
  interactionType => {
    const invalidLesson: Lesson = {
      ageRange: {
        max: 5,
        min: 3,
      },
      descriptionVi: 'Demo',
      id: `invalid-${interactionType}-lesson`,
      themeId: 'mot-ngay-cua-be',
      scenes: [
        {
          background: {
            id: `invalid-${interactionType}-background`,
            source: `lessons/invalid-${interactionType}/images/background.png`,
            type: 'image',
          },
          id: `invalid-${interactionType}-scene`,
          objects: [
            {
              asset: {
                id: `invalid-${interactionType}-target-asset`,
                source: `lessons/invalid-${interactionType}/images/target.png`,
                type: 'image',
              },
              id: `invalid-${interactionType}-target`,
              isInteractive: false,
              position: { height: 20, width: 20, x: 20, y: 20 },
              role: 'learning',
            },
          ],
          steps: [
            {
              id: `invalid-${interactionType}-step`,
              instructionVi: 'Chạm vào đồ vật.',
              interaction: {
                correctObjectIds: [`invalid-${interactionType}-target`],
                targetObjectId: `invalid-${interactionType}-target`,
                type: interactionType,
              },
              successFeedbackVi: 'Đúng rồi!',
              targetObjectIds: [`invalid-${interactionType}-target`],
              type: 'practice',
            },
          ],
          titleEn: 'Invalid interaction',
          titleVi: 'Tương tác sai',
        },
      ],
      titleEn: 'Invalid Lesson',
      titleVi: 'Bài sai',
    };

    const issues = validateLesson(invalidLesson);
    const interactionLabel = interactionType === 'tap' ? 'Tap' : 'Find';

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: `${interactionLabel} target "invalid-${interactionType}-target" must be interactive.`,
          severity: 'error',
        }),
      ]),
    );
  },
);

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
    'brush your teeth',
    'wash your face',
    'dry your face',
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
    'raise your hand',
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
    'open the book',
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
    'eat a snack',
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
    'open your lunchbox',
    'use a spoon',
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
    'sit at the table',
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
    'wipe the table',
    'wash your hands',
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
    'pack your bag',
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
    'get on the bus',
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
    'take off your shoes',
    'wash your hands',
    'hug your family',
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
    'choose a snack',
    'open the snack box',
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
    'small sip',
    'napkin',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'bite',
    'small sip',
    'napkin',
    'cracker',
    'raisins',
    'small table',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'bite',
    'small sip',
    'napkin',
    'cracker',
    'raisins',
    'small table',
    'take a bite',
    'sip juice',
    'wipe your mouth',
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
    'throw away the wrapper',
    'wipe the table',
    'put away the tray',
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
    'choose a toy',
    'build a tower',
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
    'read a book',
    'draw a picture',
    'solve a puzzle',
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
    'clean up the toys',
    'put away the book',
    'tidy the room',
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

test('afternoon-bath prep scene uses new bath setup vocabulary', () => {
  const prepScene = afternoonBathLesson.scenes.find(
    scene => scene.id === 'bath-prep',
  );

  expect(prepScene).toBeDefined();

  const coreScene = getSceneForLearningMode(prepScene!, 'core');
  const expandedScene = getSceneForLearningMode(prepScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(prepScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'shower',
    'bathtub',
    'bath mat',
  ]);
  expect(coreScene.steps.map(step => step.id)).toEqual([
    'bath-prep-intro',
    'bath-prep-teach-shower',
    'bath-prep-tap-shower',
    'bath-prep-teach-bathtub',
    'bath-prep-tap-bathtub',
    'bath-prep-teach-bath-mat',
    'bath-prep-drag-mat-to-bathtub',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'shower',
    'bathtub',
    'bath mat',
    'shampoo',
    'bath sponge',
    'body wash',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'shower',
    'bathtub',
    'bath mat',
    'shampoo',
    'bath sponge',
    'body wash',
    'step onto the mat',
    'turn on the shower',
    'check the temperature',
  ]);

  expect(
    coreScene.steps.find(step => step.id === 'bath-prep-drag-mat-to-bathtub')
      ?.interaction.dropZoneId,
  ).toBe('bath-prep-mat-zone');
  expect(
    expandedScene.steps.find(
      step => step.id === 'bath-prep-drag-body-wash-to-sponge',
    )?.interaction.dropZoneId,
  ).toBe('bath-prep-sponge-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'bath-prep-tap-check-temperature',
    )?.vocabId,
  ).toBe('vocab-check-temperature');
});

test('afternoon-bath rinse scene combines body-part and rinsing actions', () => {
  const rinseScene = afternoonBathLesson.scenes.find(
    scene => scene.id === 'bath-rinse',
  );

  expect(rinseScene).toBeDefined();

  const coreScene = getSceneForLearningMode(rinseScene!, 'core');
  const expandedScene = getSceneForLearningMode(rinseScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(rinseScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'bubble',
    'foam',
    'shower head',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'bubble',
    'foam',
    'shower head',
    'elbow',
    'knee',
    'shoulder',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'bubble',
    'foam',
    'shower head',
    'elbow',
    'knee',
    'shoulder',
    'make bubbles',
    'scrub your knees',
    'rinse your hair',
  ]);

  expect(
    challengeScene.steps.find(
      step => step.id === 'bath-rinse-drag-foam-to-bubbles',
    )?.vocabId,
  ).toBe('vocab-make-bubbles');
  expect(
    challengeScene.steps.find(
      step => step.id === 'bath-rinse-drag-sponge-to-knee',
    )?.interaction.dropZoneId,
  ).toBe('bath-rinse-knee-zone');
  expect(
    challengeScene.objects.find(object => object.id === 'bath-rinse-sponge')
      ?.isInteractive,
  ).toBe(true);
  expect(
    challengeScene.steps.find(
      step => step.id === 'bath-rinse-drag-shower-head-to-hair',
    )?.vocabId,
  ).toBe('vocab-rinse-hair');
});

test('afternoon-bath finish scene moves from clothes to after-bath care', () => {
  const finishScene = afternoonBathLesson.scenes.find(
    scene => scene.id === 'bath-finish',
  );

  expect(finishScene).toBeDefined();

  const coreScene = getSceneForLearningMode(finishScene!, 'core');
  const expandedScene = getSceneForLearningMode(finishScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(finishScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'pajamas',
    'comb',
    'robe',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'pajamas',
    'comb',
    'robe',
    'laundry basket',
    'hook',
    'slippers',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'pajamas',
    'comb',
    'robe',
    'laundry basket',
    'hook',
    'slippers',
    'put on your pajamas',
    'comb your hair',
    'hang the robe',
  ]);

  expect(
    expandedScene.steps.find(
      step => step.id === 'bath-finish-drag-clothes-to-basket',
    )?.interaction.dropZoneId,
  ).toBe('bath-finish-laundry-basket-zone');
  expect(
    expandedScene.steps.find(
      step => step.id === 'bath-finish-drag-slippers-to-feet',
    )?.interaction.dropZoneId,
  ).toBe('bath-finish-feet-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'bath-finish-drag-pajamas-to-baby',
    )?.vocabId,
  ).toBe('vocab-put-on-pajamas');
  expect(
    challengeScene.steps.find(
      step => step.id === 'bath-finish-drag-comb-to-hair',
    )?.vocabId,
  ).toBe('vocab-comb-hair');
  expect(
    challengeScene.steps.find(
      step => step.id === 'bath-finish-drag-robe-to-hook',
    )?.interaction.dropZoneId,
  ).toBe('bath-finish-hook-zone');
});

test('afternoon-bath avoids reusing earlier bathroom hygiene vocabulary', () => {
  const words = afternoonBathLesson.scenes.flatMap(
    scene => scene.vocabulary?.map(item => item.word) ?? [],
  );
  const earlierHygieneWords = [
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
    'wash hands',
  ];

  expect(earlierHygieneWords.filter(word => words.includes(word))).toEqual([]);
});

test('family-dinner prep scene builds dinner setup without old meal words', () => {
  const prepScene = familyDinnerLesson.scenes.find(
    scene => scene.id === 'dinner-prep',
  );

  expect(prepScene).toBeDefined();

  const coreScene = getSceneForLearningMode(prepScene!, 'core');
  const expandedScene = getSceneForLearningMode(prepScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(prepScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'dinner',
    'placemat',
    'apron',
  ]);
  expect(coreScene.steps.map(step => step.id)).toEqual([
    'dinner-prep-intro',
    'dinner-prep-teach-dinner',
    'dinner-prep-tap-dinner',
    'dinner-prep-teach-placemat',
    'dinner-prep-drag-placemat-to-spot',
    'dinner-prep-teach-apron',
    'dinner-prep-tap-apron',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'dinner',
    'placemat',
    'apron',
    'serving tray',
    'ladle',
    'dinner bell',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'dinner',
    'placemat',
    'apron',
    'serving tray',
    'ladle',
    'dinner bell',
    'set the placemat',
    'carry the tray',
    'call everyone',
  ]);

  expect(
    coreScene.steps.find(
      step => step.id === 'dinner-prep-drag-placemat-to-spot',
    )?.interaction.dropZoneId,
  ).toBe('dinner-prep-placemat-zone');
  expect(
    expandedScene.steps.find(
      step => step.id === 'dinner-prep-drag-ladle-to-tray',
    )?.interaction.dropZoneId,
  ).toBe('dinner-prep-serving-tray-zone');
  expect(
    challengeScene.steps.find(step => step.id === 'dinner-prep-drag-carry-tray')
      ?.vocabId,
  ).toBe('vocab-carry-tray');
  expect(
    challengeScene.steps.find(
      step => step.id === 'dinner-prep-tap-call-everyone',
    )?.vocabId,
  ).toBe('vocab-call-everyone');
});

test('family-dinner table scene teaches new dinner foods and sharing actions', () => {
  const tableScene = familyDinnerLesson.scenes.find(
    scene => scene.id === 'dinner-table',
  );

  expect(tableScene).toBeDefined();

  const coreScene = getSceneForLearningMode(tableScene!, 'core');
  const expandedScene = getSceneForLearningMode(tableScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(tableScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'vegetables',
    'fish',
    'noodles',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'vegetables',
    'fish',
    'noodles',
    'chicken',
    'salad',
    'sauce',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'vegetables',
    'fish',
    'noodles',
    'chicken',
    'salad',
    'sauce',
    'pass the dish',
    'try vegetables',
    'serve noodles',
  ]);

  expect(
    coreScene.steps.find(
      step => step.id === 'dinner-table-drag-noodles-to-meal',
    )?.interaction.dropZoneId,
  ).toBe('dinner-table-meal-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'dinner-table-drag-dish-to-grownup',
    )?.vocabId,
  ).toBe('vocab-pass-dish');
  expect(
    challengeScene.steps.find(
      step => step.id === 'dinner-table-drag-vegetables-to-child',
    )?.interaction.dropZoneId,
  ).toBe('dinner-table-child-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'dinner-table-drag-serve-noodles',
    )?.vocabId,
  ).toBe('vocab-serve-noodles');
});

test('family-dinner cleanup scene covers leftovers and evening closeout', () => {
  const cleanupScene = familyDinnerLesson.scenes.find(
    scene => scene.id === 'dinner-cleanup',
  );

  expect(cleanupScene).toBeDefined();

  const coreScene = getSceneForLearningMode(cleanupScene!, 'core');
  const expandedScene = getSceneForLearningMode(cleanupScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(cleanupScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'dessert',
    'leftovers',
    'dishwasher',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'dessert',
    'leftovers',
    'dishwasher',
    'food cover',
    'kitchen counter',
    'dining light',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'dessert',
    'leftovers',
    'dishwasher',
    'food cover',
    'kitchen counter',
    'dining light',
    'save leftovers',
    'load the dishwasher',
    'say good night',
  ]);

  expect(
    expandedScene.steps.find(
      step => step.id === 'dinner-cleanup-drag-cover-to-leftovers',
    )?.interaction.dropZoneId,
  ).toBe('dinner-cleanup-leftovers-zone');
  expect(
    expandedScene.steps.find(
      step => step.id === 'dinner-cleanup-drag-leftovers-to-counter',
    )?.interaction.dropZoneId,
  ).toBe('dinner-cleanup-counter-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'dinner-cleanup-drag-save-leftovers',
    )?.vocabId,
  ).toBe('vocab-save-leftovers');
  expect(
    challengeScene.steps.find(
      step => step.id === 'dinner-cleanup-drag-dish-to-dishwasher',
    )?.interaction.dropZoneId,
  ).toBe('dinner-cleanup-dishwasher-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'dinner-cleanup-tap-good-night',
    )?.vocabId,
  ).toBe('vocab-say-good-night');
  expect(
    challengeScene.objects.find(
      object => object.id === 'dinner-cleanup-good-night-card',
    )?.isInteractive,
  ).toBe(true);
});

test('family-dinner avoids exact repeats from earlier meal lessons', () => {
  const words = familyDinnerLesson.scenes.flatMap(
    scene => scene.vocabulary?.map(item => item.word) ?? [],
  );
  const earlierMealWords = [
    'milk',
    'apple',
    'bread',
    'plate',
    'egg',
    'banana',
    'cup',
    'rice',
    'soup',
    'spoon',
    'lunchbox',
    'bowl',
    'fork',
    'table',
    'chair',
    'friend',
    'napkin',
    'fruit',
    'sit at table',
    'share food',
    'say thank you',
    'crumbs',
    'trash bin',
    'clean up',
    'wipe table',
    'snack',
    'yogurt',
    'cookie',
    'juice',
    'straw',
    'snack box',
    'bite',
    'small sip',
    'cracker',
    'raisins',
    'small table',
    'take a bite',
    'sip juice',
    'wipe mouth',
    'tray',
    'wrapper',
    'basket',
    'throw away wrapper',
    'put away tray',
  ];

  expect(earlierMealWords.filter(word => words.includes(word))).toEqual([]);
});

test('after-dinner-cleanup clear scene teaches new clearing tools', () => {
  const clearScene = afterDinnerCleanupLesson.scenes.find(
    scene => scene.id === 'clear-dinner',
  );

  expect(clearScene).toBeDefined();

  const coreScene = getSceneForLearningMode(clearScene!, 'core');
  const expandedScene = getSceneForLearningMode(clearScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(clearScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'coaster',
    'serving cart',
    'tongs',
  ]);
  expect(coreScene.steps.map(step => step.id)).toEqual([
    'clear-dinner-intro',
    'clear-dinner-teach-coaster',
    'clear-dinner-tap-coaster',
    'clear-dinner-teach-serving-cart',
    'clear-dinner-drag-coaster-to-cart',
    'clear-dinner-teach-tongs',
    'clear-dinner-tap-tongs',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'coaster',
    'serving cart',
    'tongs',
    'pot holder',
    'carafe',
    'label',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'coaster',
    'serving cart',
    'tongs',
    'pot holder',
    'carafe',
    'label',
    'stack coasters',
    'move the cart',
    'label the container',
  ]);

  expect(
    coreScene.steps.find(
      step => step.id === 'clear-dinner-drag-coaster-to-cart',
    )?.interaction.dropZoneId,
  ).toBe('clear-dinner-coaster-zone');
  expect(
    expandedScene.steps.find(
      step => step.id === 'clear-dinner-drag-carafe-to-cart',
    )?.interaction.dropZoneId,
  ).toBe('clear-dinner-cart-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'clear-dinner-drag-stack-coasters',
    )?.vocabId,
  ).toBe('vocab-stack-coasters');
  expect(
    challengeScene.steps.find(
      step => step.id === 'clear-dinner-drag-label-to-container',
    )?.vocabId,
  ).toBe('vocab-label-container');
});

test('after-dinner-cleanup spot scene handles spills with new cleaning words', () => {
  const spotScene = afterDinnerCleanupLesson.scenes.find(
    scene => scene.id === 'spot-clean',
  );

  expect(spotScene).toBeDefined();

  const coreScene = getSceneForLearningMode(spotScene!, 'core');
  const expandedScene = getSceneForLearningMode(spotScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(spotScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'spill',
    'stain',
    'spray bottle',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'spill',
    'stain',
    'spray bottle',
    'scraper',
    'cleaning brush',
    'rubber gloves',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'spill',
    'stain',
    'spray bottle',
    'scraper',
    'cleaning brush',
    'rubber gloves',
    'spray the stain',
    'scrub the spot',
    'dry the surface',
  ]);

  expect(
    expandedScene.steps.find(
      step => step.id === 'spot-clean-drag-brush-to-spill',
    )?.interaction.dropZoneId,
  ).toBe('spot-clean-spill-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'spot-clean-drag-spray-to-stain',
    )?.vocabId,
  ).toBe('vocab-spray-stain');
  expect(
    challengeScene.steps.find(
      step => step.id === 'spot-clean-drag-brush-scrub-spot',
    )?.vocabId,
  ).toBe('vocab-scrub-spot');
  expect(
    challengeScene.steps.find(step => step.id === 'spot-clean-tap-dry-surface')
      ?.vocabId,
  ).toBe('vocab-dry-surface');
  expect(
    challengeScene.objects.find(object => object.id === 'spot-clean-surface')
      ?.isInteractive,
  ).toBe(true);
});

test('after-dinner-cleanup sort scene finishes with recycling and drying actions', () => {
  const sortScene = afterDinnerCleanupLesson.scenes.find(
    scene => scene.id === 'sort-and-dry',
  );

  expect(sortScene).toBeDefined();

  const coreScene = getSceneForLearningMode(sortScene!, 'core');
  const expandedScene = getSceneForLearningMode(sortScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(sortScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'recycling bin',
    'compost bin',
    'dish rack',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'recycling bin',
    'compost bin',
    'dish rack',
    'drying mat',
    'timer',
    'cabinet',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'recycling bin',
    'compost bin',
    'dish rack',
    'drying mat',
    'timer',
    'cabinet',
    'sort the recycling',
    'start the timer',
    'air-dry the dishes',
  ]);

  expect(
    expandedScene.steps.find(step => step.id === 'sort-and-dry-drag-drying-mat')
      ?.interaction.dropZoneId,
  ).toBe('sort-and-dry-drying-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'sort-and-dry-drag-carton-to-recycling',
    )?.interaction.dropZoneId,
  ).toBe('sort-and-dry-recycling-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'sort-and-dry-tap-start-timer',
    )?.vocabId,
  ).toBe('vocab-start-timer');
  expect(
    challengeScene.steps.find(
      step => step.id === 'sort-and-dry-drag-dishes-to-rack',
    )?.vocabId,
  ).toBe('vocab-air-dry-dishes');
});

test('after-dinner-cleanup avoids exact repeats from dinner and cleanup lessons', () => {
  const words = afterDinnerCleanupLesson.scenes.flatMap(
    scene => scene.vocabulary?.map(item => item.word) ?? [],
  );
  const usedCleanupWords = [
    'clean up',
    'wipe table',
    'wash hands',
    'crumbs',
    'trash bin',
    'cloth',
    'basket',
    'throw away wrapper',
    'put away tray',
    'leftovers',
    'dishwasher',
    'food cover',
    'kitchen counter',
    'dining light',
    'save leftovers',
    'load dishwasher',
    'say good night',
    'dinner',
    'placemat',
    'apron',
    'serving tray',
    'ladle',
    'dinner bell',
    'vegetables',
    'fish',
    'noodles',
    'dessert',
    'tray',
    'plate',
    'cup',
    'spoon',
    'fork',
    'table',
    'napkin',
  ];

  expect(usedCleanupWords.filter(word => words.includes(word))).toEqual([]);
});

test('bedtime story scene builds a quiet story routine with new words', () => {
  const storyScene = bedtimeLesson.scenes.find(
    scene => scene.id === 'bedtime-story',
  );

  expect(storyScene).toBeDefined();

  const coreScene = getSceneForLearningMode(storyScene!, 'core');
  const expandedScene = getSceneForLearningMode(storyScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(storyScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'storybook',
    'bookmark',
    'reading nook',
  ]);
  expect(coreScene.steps.map(step => step.id)).toEqual([
    'bedtime-story-intro',
    'bedtime-story-teach-storybook',
    'bedtime-story-tap-storybook',
    'bedtime-story-teach-bookmark',
    'bedtime-story-tap-bookmark',
    'bedtime-story-teach-reading-nook',
    'bedtime-story-drag-storybook-to-nook',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'storybook',
    'bookmark',
    'reading nook',
    'page tab',
    'soft voice',
    'story shelf',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'storybook',
    'bookmark',
    'reading nook',
    'page tab',
    'soft voice',
    'story shelf',
    'choose a story',
    'place the bookmark',
    'read softly',
  ]);

  expect(
    coreScene.steps.find(
      step => step.id === 'bedtime-story-drag-storybook-to-nook',
    )?.interaction.dropZoneId,
  ).toBe('bedtime-story-nook-zone');
  expect(
    expandedScene.steps.find(step => step.id === 'bedtime-story-drag-page-tab')
      ?.interaction.dropZoneId,
  ).toBe('bedtime-story-page-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'bedtime-story-drag-choose-story',
    )?.vocabId,
  ).toBe('vocab-choose-story');
  expect(
    challengeScene.steps.find(
      step => step.id === 'bedtime-story-drag-place-bookmark',
    )?.vocabId,
  ).toBe('vocab-place-bookmark');
  expect(
    challengeScene.steps.find(
      step => step.id === 'bedtime-story-tap-read-softly',
    )?.vocabId,
  ).toBe('vocab-read-softly');
});

test('bedtime calm-room scene dims the room with new light and sound words', () => {
  const calmScene = bedtimeLesson.scenes.find(
    scene => scene.id === 'calm-room',
  );

  expect(calmScene).toBeDefined();

  const coreScene = getSceneForLearningMode(calmScene!, 'core');
  const expandedScene = getSceneForLearningMode(calmScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(calmScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'night light',
    'curtain',
    'sound machine',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'night light',
    'curtain',
    'sound machine',
    'star projector',
    'humidifier',
    'lullaby',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'night light',
    'curtain',
    'sound machine',
    'star projector',
    'humidifier',
    'lullaby',
    'dim the lights',
    'close the curtains',
    'play a lullaby',
  ]);

  expect(
    coreScene.steps.find(step => step.id === 'calm-room-drag-sound-machine')
      ?.interaction.dropZoneId,
  ).toBe('calm-room-corner-zone');
  expect(
    expandedScene.steps.find(step => step.id === 'calm-room-drag-humidifier')
      ?.interaction.dropZoneId,
  ).toBe('calm-room-air-zone');
  expect(
    challengeScene.steps.find(step => step.id === 'calm-room-tap-dim-lights')
      ?.vocabId,
  ).toBe('vocab-dim-lights');
  expect(
    challengeScene.steps.find(
      step => step.id === 'calm-room-drag-close-curtains',
    )?.interaction.dropZoneId,
  ).toBe('calm-room-window-zone');
  expect(
    challengeScene.steps.find(step => step.id === 'calm-room-tap-play-lullaby')
      ?.vocabId,
  ).toBe('vocab-play-lullaby');
});

test('bedtime sleep-ready scene settles the child with new sleep words', () => {
  const sleepScene = bedtimeLesson.scenes.find(
    scene => scene.id === 'sleep-ready',
  );

  expect(sleepScene).toBeDefined();

  const coreScene = getSceneForLearningMode(sleepScene!, 'core');
  const expandedScene = getSceneForLearningMode(sleepScene!, 'expanded');
  const challengeScene = getSceneForLearningMode(sleepScene!, 'challenge');

  expect(coreScene.vocabulary?.map(item => item.word)).toEqual([
    'sleep mask',
    'soft toy',
    'nightstand',
  ]);
  expect(expandedScene.vocabulary?.map(item => item.word)).toEqual([
    'sleep mask',
    'soft toy',
    'nightstand',
    'dream journal',
    'glow sticker',
    'moon mobile',
  ]);
  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'sleep mask',
    'soft toy',
    'nightstand',
    'dream journal',
    'glow sticker',
    'moon mobile',
    'wear a sleep mask',
    'hug your soft toy',
    'check your dream journal',
  ]);

  expect(
    coreScene.steps.find(
      step => step.id === 'sleep-ready-drag-mask-to-nightstand',
    )?.interaction.dropZoneId,
  ).toBe('sleep-ready-nightstand-zone');
  expect(
    expandedScene.steps.find(
      step => step.id === 'sleep-ready-drag-glow-sticker',
    )?.interaction.dropZoneId,
  ).toBe('sleep-ready-wall-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'sleep-ready-drag-wear-sleep-mask',
    )?.vocabId,
  ).toBe('vocab-wear-sleep-mask');
  expect(
    challengeScene.steps.find(
      step => step.id === 'sleep-ready-drag-hug-comfort-plush',
    )?.interaction.dropZoneId,
  ).toBe('sleep-ready-baby-zone');
  expect(
    challengeScene.steps.find(
      step => step.id === 'sleep-ready-tap-check-dream-journal',
    )?.vocabId,
  ).toBe('vocab-check-dream-journal');
});

test('bedtime avoids exact repeats from earlier bedroom bath and home lessons', () => {
  const words = bedtimeLesson.scenes.flatMap(
    scene => scene.vocabulary?.map(item => item.word) ?? [],
  );
  const earlierBedtimeAdjacentWords = [
    'bed',
    'blanket',
    'sun',
    'pillow',
    'lamp',
    'box',
    'clock',
    'socks',
    'doll',
    'good morning',
    'make the bed',
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
    'pajamas',
    'robe',
    'slippers',
    'put on pajamas',
    'hang robe',
    'book',
    'music',
    'read book',
    'put away book',
    'timer',
    'start timer',
    'dining light',
    'say good night',
  ];

  expect(
    earlierBedtimeAdjacentWords.filter(word => words.includes(word)),
  ).toEqual([]);
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
    'pack your bag',
    'put on your shoes',
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

test('bedroom extended steps have remote audio for both English accents', () => {
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
    ENGLISH_ACCENTS.forEach(accent => {
      expect(getWordAudioAsset(word, accent)?.key).toContain(
        `/audio/${accent}/neural2-c-r1/`,
      );
    });
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
