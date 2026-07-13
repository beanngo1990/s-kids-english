import { memoryGameIntroPromptVi } from '../data/reviewGamePrompts';
import { speakPracticePromptVi } from '../data/speechPrompts';
import type { ReviewGame, Scene, SceneStep } from '../types/lesson';
import type { TeacherPromptMode } from './types';

export type TeacherPromptSegment = {
  language: 'en' | 'vi';
  text: string;
};

export type TeacherPromptResolution = {
  displayText: string;
  segments: TeacherPromptSegment[];
};

type TeacherFeedbackType = 'fail' | 'success';

type ResolveTeacherFeedbackOptions = {
  enText?: string;
  mode: TeacherPromptMode;
  type: TeacherFeedbackType;
  viText?: string;
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

export function resolveTeacherFeedback({
  enText,
  mode,
  type,
  viText,
}: ResolveTeacherFeedbackOptions): TeacherPromptResolution {
  const fallbackVi = type === 'success' ? 'Giỏi lắm!' : 'Thử lại nhé.';
  const fallbackEn = type === 'success' ? 'Great job!' : 'Try again.';
  const resolvedViText = viText?.trim() || fallbackVi;
  const resolvedEnText = enText?.trim() || fallbackEn;

  if (mode === 'en') {
    return {
      displayText: resolvedEnText,
      segments: [{ language: 'en', text: resolvedEnText }],
    };
  }

  if (mode === 'bilingual') {
    return {
      displayText: `${resolvedViText}\n${resolvedEnText}`,
      segments: [
        { language: 'vi', text: resolvedViText },
        { language: 'en', text: resolvedEnText },
      ],
    };
  }

  return {
    displayText: resolvedViText,
    segments: [{ language: 'vi', text: resolvedViText }],
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

export function resolveRecordingEncouragementPrompt(
  mode: TeacherPromptMode,
): TeacherPromptResolution {
  return resolveTeacherFeedback({
    enText: 'I heard you! Great job!',
    mode,
    type: 'success',
    viText: 'Cô nghe rồi! Giỏi quá!',
  });
}

export function resolveReviewGameIntroPrompt(
  reviewGameType: ReviewGame['type'] | undefined,
  mode: TeacherPromptMode,
): TeacherPromptResolution {
  const enText =
    reviewGameType === 'memory'
      ? 'Find two matching pictures.'
      : 'Let’s review together.';

  if (mode === 'en') {
    return {
      displayText: enText,
      segments: [{ language: 'en', text: enText }],
    };
  }

  if (mode === 'bilingual') {
    return {
      displayText: `${memoryGameIntroPromptVi}\n${enText}`,
      segments: [
        { language: 'vi', text: memoryGameIntroPromptVi },
        { language: 'en', text: enText },
      ],
    };
  }

  return {
    displayText: memoryGameIntroPromptVi,
    segments: [{ language: 'vi', text: memoryGameIntroPromptVi }],
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
