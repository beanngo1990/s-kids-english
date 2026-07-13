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
    teacherPromptMode: 'vi',
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

test('resolves teacher instructions for vi, en and bilingual modes', () => {
  expect(resolveTeacherInstruction(step, 'vi')).toEqual({
    displayText: 'Chạm vào cái giường nhé.',
    segments: [{ language: 'vi', text: 'Chạm vào cái giường nhé.' }],
  });

  expect(resolveTeacherInstruction(step, 'en')).toEqual({
    displayText: 'Tap bed',
    segments: [{ language: 'en', text: 'Tap bed' }],
  });

  expect(resolveTeacherInstruction(step, 'bilingual')).toEqual({
    displayText: 'Chạm vào cái giường nhé.\nTap bed',
    segments: [
      { language: 'vi', text: 'Chạm vào cái giường nhé.' },
      { language: 'en', text: 'Tap bed' },
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
