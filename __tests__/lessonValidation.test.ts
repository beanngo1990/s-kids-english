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
    'bedroom-teach-window',
  );

  expect(challengeScene.vocabulary?.map(item => item.word)).toEqual([
    'bed',
    'blanket',
    'sun',
    'pillow',
    'lamp',
    'clock',
    'window',
    'socks',
    'doll',
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
  const windowPractice = challengeScene.steps.find(
    step => step.id === 'bedroom-practice-window',
  );
  const socksPractice = challengeScene.steps.find(
    step => step.id === 'bedroom-practice-socks',
  );
  const dollPractice = challengeScene.steps.find(
    step => step.id === 'bedroom-practice-doll',
  );

  expect(pillowPractice?.instructionVi).toBe('Chạm vào cái gối nhé.');
  expect(pillowPractice?.interaction.targetObjectId).toBe('bedroom-pillow');
  expect(lampPractice?.instructionVi).toBe('Chạm vào đèn ngủ nhé.');
  expect(lampPractice?.interaction.targetObjectId).toBe('bedroom-lamp');
  expect(clockPractice?.instructionVi).toBe('Chạm vào đồng hồ nhé.');
  expect(clockPractice?.interaction.targetObjectId).toBe('bedroom-clock');
  expect(windowPractice?.instructionVi).toBe('Chạm vào cửa sổ nhé.');
  expect(windowPractice?.interaction.targetObjectId).toBe('bedroom-window');
  expect(socksPractice?.instructionVi).toBe('Chạm vào đôi tất nhé.');
  expect(socksPractice?.interaction.targetObjectId).toBe('bedroom-socks');
  expect(dollPractice?.instructionVi).toBe('Chạm vào búp bê nhé.');
  expect(dollPractice?.interaction.targetObjectId).toBe('bedroom-doll');
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
    'window',
    'socks',
    'doll',
  ].forEach(word => {
    expect(getWordAudioAsset(word)?.key).toBeTruthy();
  });
});
