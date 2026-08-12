import AsyncStorage from '@react-native-async-storage/async-storage';

import { themes } from '../src/data/themes';
import { mergeProgressSnapshots } from '../src/engine/CloudProgressMerge';
import {
  addXP,
  getProgress,
  normalizeProgress,
  resetProgress,
  saveActiveThemeId,
  saveCurrentStepProgress,
  saveLearnedWord,
  saveVocabularyInteraction,
  updateProgressFromCloud,
} from '../src/engine/ProgressManager';

beforeEach(async () => {
  jest.clearAllMocks();
  await resetProgress();
});

test('serializes concurrent progress mutations without dropping fields', async () => {
  const nextThemeId = themes[1].id;

  await Promise.all([
    saveLearnedWord('word-a'),
    saveLearnedWord('word-b'),
    addXP(5),
    saveActiveThemeId(nextThemeId),
    saveCurrentStepProgress('lesson-a', 'scene-a', 'step-a'),
  ]);

  await expect(getProgress()).resolves.toMatchObject({
    activeThemeId: nextThemeId,
    currentLessonProgress: {
      lessonId: 'lesson-a',
      sceneId: 'scene-a',
      stepId: 'step-a',
    },
    learnedWordIds: ['word-a', 'word-b'],
    totalXP: 5,
  });
});

test('accumulates concurrent vocabulary interactions for the same word', async () => {
  await Promise.all([
    saveVocabularyInteraction('word-a', true),
    saveVocabularyInteraction('word-a', false),
  ]);

  await expect(getProgress()).resolves.toMatchObject({
    vocabularyProgress: {
      'word-a': {
        correctCount: 1,
        wrongCount: 1,
      },
    },
  });
});

test('merges cloud progress against the latest queued local snapshot', async () => {
  const remoteProgress = normalizeProgress({
    completedLessonIds: ['remote-lesson'],
  });

  await Promise.all([
    saveLearnedWord('local-word'),
    updateProgressFromCloud(currentProgress =>
      mergeProgressSnapshots(currentProgress, remoteProgress),
    ),
  ]);

  await expect(getProgress()).resolves.toMatchObject({
    completedLessonIds: ['remote-lesson'],
    learnedWordIds: ['local-word'],
  });
});

test('continues processing queued progress operations after a write fails', async () => {
  const setItem = AsyncStorage.setItem as jest.MockedFunction<
    typeof AsyncStorage.setItem
  >;
  setItem.mockRejectedValueOnce(new Error('storage unavailable'));

  await expect(saveActiveThemeId(themes[1].id)).rejects.toThrow(
    'storage unavailable',
  );
  await addXP(4);

  await expect(getProgress()).resolves.toMatchObject({ totalXP: 4 });
});
