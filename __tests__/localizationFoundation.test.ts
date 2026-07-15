import AsyncStorage from '@react-native-async-storage/async-storage';

import { createTranslator, translate } from '../src/i18n';
import {
  getLocalizedLessonSubtitle,
  getLocalizedLessonTitle,
  getLocalizedReviewGameTitle,
  getLocalizedSceneSubtitle,
  getLocalizedSceneTitle,
  getLocalizedThemeTitle,
} from '../src/i18n/domainCopy';
import {
  resolveRecordingEncouragementPrompt,
  resolveReviewGameIntroPrompt,
  resolveSceneCompletionPrompt,
  resolveSpeechPracticePrompt,
  resolveTeacherFeedback,
  resolveTeacherInstruction,
} from '../src/i18n/teacherPrompts';
import {
  getParentSettings,
  saveParentSettings,
  subscribeParentSettings,
} from '../src/engine/ParentSettingsManager';
import type { Scene, SceneStep } from '../src/types/lesson';

const step: SceneStep = {
  id: 'tap-bed',
  instructionVi: 'Chạm vào cái giường nhé.',
  interaction: { targetObjectId: 'bed', type: 'tap' },
  promptText: 'Tap bed',
  successFeedbackVi: 'Đúng rồi!',
  targetObjectIds: ['bed'],
  type: 'practice',
};

const scene: Scene = {
  background: {
    id: 'background',
    source: 'background',
    type: 'image',
  },
  id: 'bedroom',
  objects: [],
  steps: [step],
  titleEn: 'Bedroom',
  titleVi: 'Phòng ngủ',
};

const lesson = {
  ageRange: { max: 6, min: 3 },
  descriptionVi: 'Bé học các từ trong phòng ngủ.',
  id: 'bedroom-lesson',
  scenes: [scene],
  themeId: 'day',
  titleEn: 'Bedroom Lesson',
  titleVi: 'Bài phòng ngủ',
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('translates typed keys and interpolates params', () => {
  expect(translate('en', 'parent.settings.heroTitle', { name: 'Sunny' })).toBe(
    'Settings for Sunny',
  );
  expect(createTranslator('vi')('scene.completion.eyebrow', {
    current: 1,
    total: 3,
  })).toBe('Cảnh 1/3');
});

test('localizes domain titles without changing English learning content', () => {
  expect(getLocalizedLessonTitle(lesson, 'en')).toBe('Bedroom Lesson');
  expect(getLocalizedLessonSubtitle(lesson, 'en')).toBe('Bài phòng ngủ');
  expect(getLocalizedSceneTitle(scene, 'en')).toBe('Bedroom');
  expect(getLocalizedSceneSubtitle(scene, 'en')).toBe('Phòng ngủ');
  expect(
    getLocalizedThemeTitle(
      {
        id: 'day',
        lessonIds: [lesson.id],
        thumbnailEmoji: '★',
        titleVi: 'Một ngày của bé',
      },
      'en',
    ),
  ).toBe('Một ngày của bé');
  expect(
    getLocalizedReviewGameTitle(
      { id: 'memory', titleVi: 'Tìm cặp hình', type: 'memory' },
      'en',
    ),
  ).toBe('Memory Game');
});

test('defaults new localization settings for legacy parent settings', async () => {
  await expect(getParentSettings()).resolves.toMatchObject({
    appLanguage: 'vi',
    cloudProgressSync: { enabled: false },
    teacherPromptMode: 'vi',
  });
});

test('only enables cloud sync with complete current parent consent', async () => {
  await saveParentSettings({
    cloudProgressSync: {
      consentedAt: '2026-07-15T08:00:00.000Z',
      consentVersion: 1,
      enabled: true,
      ownerUid: 'parent-a',
    },
  });

  await expect(getParentSettings()).resolves.toMatchObject({
    cloudProgressSync: {
      consentedAt: '2026-07-15T08:00:00.000Z',
      consentVersion: 1,
      enabled: true,
      ownerUid: 'parent-a',
    },
  });

  await saveParentSettings({
    cloudProgressSync: {
      enabled: true,
      ownerUid: 'parent-b',
    },
  });

  await expect(getParentSettings()).resolves.toMatchObject({
    cloudProgressSync: {
      enabled: false,
      ownerUid: 'parent-b',
    },
  });
});

test('persists teacher prompt mode separately from app language', async () => {
  await saveParentSettings({
    appLanguage: 'en',
    teacherPromptMode: 'bilingual',
  });

  await expect(getParentSettings()).resolves.toMatchObject({
    appLanguage: 'en',
    teacherPromptMode: 'bilingual',
  });
});

test('notifies parent settings subscribers when localization settings change', async () => {
  const listener = jest.fn();
  const unsubscribe = subscribeParentSettings(listener);

  await saveParentSettings({ appLanguage: 'en' });

  expect(listener).toHaveBeenCalledWith(
    expect.objectContaining({ appLanguage: 'en' }),
  );

  unsubscribe();
  listener.mockClear();

  await saveParentSettings({ appLanguage: 'vi' });

  expect(listener).not.toHaveBeenCalled();
});

test('resolves teacher instructions for vi, en and bilingual modes', () => {
  expect(resolveTeacherInstruction(step, 'vi')).toEqual({
    displayText: 'Chạm vào cái giường nhé.',
    segments: [{ language: 'vi', text: 'Chạm vào cái giường nhé.' }],
  });

  expect(resolveTeacherInstruction(step, 'en', scene)).toEqual({
    displayText: 'Tap the bed.',
    segments: [{ language: 'en', text: 'Tap the bed.' }],
  });

  expect(resolveTeacherInstruction(step, 'bilingual', scene)).toEqual({
    displayText: 'Chạm vào cái giường nhé.\nTap the bed.',
    segments: [
      { language: 'vi', text: 'Chạm vào cái giường nhé.' },
      { language: 'en', text: 'Tap the bed.' },
    ],
  });
});

test('provides speech practice and completion prompt fallbacks', () => {
  expect(resolveSpeechPracticePrompt('en').segments).toEqual([
    { language: 'en', text: 'Say it with me.' },
  ]);
  expect(resolveSceneCompletionPrompt(scene, 'en').displayText).toBe(
    'Bedroom is complete.',
  );
});

test('resolves feedback, recording encouragement and review intro by teacher prompt mode', () => {
  expect(
    resolveTeacherFeedback({
      mode: 'en',
      type: 'success',
      viText: 'Đúng rồi!',
    }),
  ).toEqual({
    displayText: 'Great job!',
    segments: [{ language: 'en', text: 'Great job!' }],
  });

  const goodMorningStep: SceneStep = {
    id: 'teach-good-morning',
    instructionVi: 'Mình cùng chào buổi sáng nhé.',
    interaction: { targetObjectId: 'baby', type: 'listen' },
    promptText: 'good morning',
    successFeedbackVi: 'Câu này nghĩa là chào buổi sáng.',
    targetObjectIds: ['baby'],
    type: 'teach',
    vocabId: 'good-morning',
  };
  const goodMorningScene: Scene = {
    ...scene,
    steps: [goodMorningStep],
    vocabulary: [
      {
        id: 'good-morning',
        level: 'medium',
        meaningVi: 'chào buổi sáng',
        type: 'phrase',
        word: 'good morning',
      },
    ],
  };

  expect(
    resolveTeacherFeedback({
      mode: 'en',
      scene: goodMorningScene,
      step: goodMorningStep,
      type: 'success',
      viText: goodMorningStep.successFeedbackVi,
    }),
  ).toEqual({
    displayText: 'It means good morning.',
    segments: [{ language: 'en', text: 'It means good morning.' }],
  });

  expect(
    resolveTeacherFeedback({
      mode: 'bilingual',
      type: 'fail',
      viText: 'Thử lại nhé.',
    }),
  ).toEqual({
    displayText: 'Thử lại nhé.\nTry again.',
    segments: [
      { language: 'vi', text: 'Thử lại nhé.' },
      { language: 'en', text: 'Try again.' },
    ],
  });

  expect(resolveRecordingEncouragementPrompt('en').displayText).toBe(
    'I heard you! Great job!',
  );
  expect(resolveReviewGameIntroPrompt('memory', 'en').segments).toEqual([
    { language: 'en', text: 'Find two matching pictures.' },
  ]);
});
