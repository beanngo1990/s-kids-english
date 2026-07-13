import { speakPracticePromptVi } from '../data/speechPrompts';
import type { Scene, SceneStep } from '../types/lesson';
import type { TeacherPromptMode } from './types';

export type TeacherPromptSegment = {
  language: 'en' | 'vi';
  text: string;
};

export type TeacherPromptResolution = {
  displayText: string;
  segments: TeacherPromptSegment[];
};

export function resolveTeacherInstruction(
  step: SceneStep,
  mode: TeacherPromptMode,
): TeacherPromptResolution {
  const viText = step.instructionVi.trim();
  const enText = step.promptText?.trim();

  if (mode === 'en' && enText) {
    return {
      displayText: enText,
      segments: [{ language: 'en', text: enText }],
    };
  }

  if (mode === 'bilingual' && enText) {
    return {
      displayText: `${viText}\n${enText}`,
      segments: [
        { language: 'vi', text: viText },
        { language: 'en', text: enText },
      ],
    };
  }

  return {
    displayText: viText,
    segments: [{ language: 'vi', text: viText }],
  };
}

export function resolveSpeechPracticePrompt(
  mode: TeacherPromptMode,
): TeacherPromptResolution {
  const enText = 'Say it with me.';

  if (mode === 'en') {
    return {
      displayText: enText,
      segments: [{ language: 'en', text: enText }],
    };
  }

  if (mode === 'bilingual') {
    return {
      displayText: `${speakPracticePromptVi}\n${enText}`,
      segments: [
        { language: 'vi', text: speakPracticePromptVi },
        { language: 'en', text: enText },
      ],
    };
  }

  return {
    displayText: speakPracticePromptVi,
    segments: [{ language: 'vi', text: speakPracticePromptVi }],
  };
}

export function resolveSceneCompletionPrompt(
  scene: Scene,
  mode: TeacherPromptMode,
): TeacherPromptResolution {
  const viText =
    scene.completionReward?.messageVi ??
    `Bé đã hoàn thành ${scene.titleVi}.`;
  const enText = `${scene.titleEn} is complete.`;

  if (mode === 'en') {
    return {
      displayText: enText,
      segments: [{ language: 'en', text: enText }],
    };
  }

  if (mode === 'bilingual') {
    return {
      displayText: `${viText}\n${enText}`,
      segments: [
        { language: 'vi', text: viText },
        { language: 'en', text: enText },
      ],
    };
  }

  return {
    displayText: viText,
    segments: [{ language: 'vi', text: viText }],
  };
}
