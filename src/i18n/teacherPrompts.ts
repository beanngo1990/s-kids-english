import { memoryGameIntroPromptVi } from '../data/reviewGamePrompts';
import { speakPracticePromptVi } from '../data/speechPrompts';
import type { ReviewGame, Scene, SceneObject, SceneStep } from '../types/lesson';
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
  scene?: Scene;
  step?: SceneStep;
  type: TeacherFeedbackType;
  viText?: string;
};

export function resolveTeacherInstruction(
  step: SceneStep,
  mode: TeacherPromptMode,
  scene?: Scene,
): TeacherPromptResolution {
  const viText = step.instructionVi.trim();
  const enText = getTeacherInstructionEn(step, scene);

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

export function getTeacherInstructionEn(
  step: SceneStep,
  scene?: Scene,
) {
  const explicitText = step.instructionEn?.trim();
  if (explicitText) {
    return explicitText;
  }

  if (!scene) {
    return toSentence(step.promptText);
  }

  if (step.type === 'intro') {
    return toSentence(step.promptText) ?? `Let's start ${scene.titleEn}.`;
  }

  const vocabularyItem = getStepVocabulary(scene, step);
  const promptText = step.promptText?.trim();
  const promptSentence = toSentence(promptText);

  if (step.type === 'teach' && vocabularyItem) {
    if (vocabularyItem.type === 'noun') {
      return `This is the ${vocabularyItem.word}.`;
    }

    return `Let's learn ${vocabularyItem.word}.`;
  }

  if (step.interaction.type === 'listen') {
    return promptSentence ?? 'Listen carefully.';
  }

  if (step.interaction.type === 'find') {
    return `Find the ${getInstructionTargetText(scene, step)}.`;
  }

  if (step.interaction.type === 'tap') {
    const tapPrompt = getTapPromptSentence(promptText);
    if (tapPrompt) {
      return tapPrompt;
    }

    return `Tap the ${getInstructionTargetText(scene, step)}.`;
  }

  if (step.interaction.type === 'drag') {
    const dragPrompt = getDragPromptSentence(promptText);
    if (dragPrompt) {
      return dragPrompt;
    }

    return `Drag the ${getInstructionTargetText(scene, step)}.`;
  }

  return promptSentence;
}

export function resolveTeacherFeedback({
  enText,
  mode,
  scene,
  step,
  type,
  viText,
}: ResolveTeacherFeedbackOptions): TeacherPromptResolution {
  const fallbackVi = type === 'success' ? 'Giỏi lắm!' : 'Thử lại nhé.';
  const fallbackEn = type === 'success' ? 'Great job!' : 'Try again.';
  const resolvedViText = viText?.trim() || fallbackVi;
  const resolvedEnText =
    enText?.trim() ?? getTeacherFeedbackEn(type, step, scene) ?? fallbackEn;

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

export function getTeacherFeedbackEn(
  type: TeacherFeedbackType,
  step?: SceneStep,
  scene?: Scene,
) {
  if (type !== 'success' || !step || !scene) {
    return undefined;
  }

  const explicitText = step.successFeedbackEn?.trim();
  if (explicitText) {
    return explicitText;
  }

  const vocabularyItem = getStepVocabulary(scene, step);
  if (!vocabularyItem || step.type !== 'teach') {
    return undefined;
  }

  return `It means ${vocabularyItem.word}.`;
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
  const enText =
    scene.completionReward?.messageEn ?? `${scene.titleEn} is complete.`;

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

function getInstructionTargetText(scene: Scene, step: SceneStep) {
  const targetVocabularyItem = getTargetObjectVocabulary(scene, step);
  if (targetVocabularyItem) {
    return targetVocabularyItem.word;
  }

  const targetObject = getTargetObject(scene, step);
  if (targetObject) {
    return getObjectFallbackName(targetObject);
  }

  return step.promptText?.trim() || 'item';
}

function getTargetObjectVocabulary(scene: Scene, step: SceneStep) {
  const targetObject = getTargetObject(scene, step);
  if (!targetObject?.vocabId) {
    return undefined;
  }

  return scene.vocabulary?.find(item => item.id === targetObject.vocabId);
}

function getStepVocabulary(scene: Scene, step: SceneStep) {
  if (step.vocabId) {
    return scene.vocabulary?.find(item => item.id === step.vocabId);
  }

  const targetObject = getTargetObject(scene, step);
  if (!targetObject?.vocabId) {
    return undefined;
  }

  return scene.vocabulary?.find(item => item.id === targetObject.vocabId);
}

function getTargetObject(scene: Scene, step: SceneStep) {
  const renderableObjects = scene.character
    ? [scene.character, ...scene.objects]
    : scene.objects;
  const targetIds = [
    step.interaction.targetObjectId,
    step.interaction.correctObjectIds?.[0],
    step.targetObjectIds[0],
  ].filter((id): id is string => Boolean(id));

  return renderableObjects.find(object => targetIds.includes(object.id));
}

function getObjectFallbackName(object: SceneObject) {
  return object.asset.id.replace(/[-_]/g, ' ');
}

function getTapPromptSentence(text: string | undefined) {
  const normalizedText = text?.trim();
  if (!normalizedText) {
    return undefined;
  }

  const tapMatch = normalizedText.match(/^tap\s+(.+)$/iu);
  if (tapMatch?.[1]) {
    return `Tap the ${lowercaseFirst(tapMatch[1])}.`;
  }

  if (looksLikeInstruction(normalizedText)) {
    return toSentence(normalizedText);
  }

  return undefined;
}

function getDragPromptSentence(text: string | undefined) {
  const normalizedText = text?.trim();
  if (!normalizedText) {
    return undefined;
  }

  const dragMatch = normalizedText.match(/^drag\s+(.+)$/iu);
  if (dragMatch?.[1]) {
    return `Drag the ${lowercaseFirst(dragMatch[1])}.`;
  }

  if (looksLikeInstruction(normalizedText)) {
    return toSentence(normalizedText);
  }

  const inMatch = normalizedText.match(/^(.+)\s+in\s+(.+)$/iu);
  if (inMatch?.[1] && inMatch[2]) {
    return `Put the ${lowercaseFirst(inMatch[1])} in the ${lowercaseFirst(
      inMatch[2],
    )}.`;
  }

  const onMatch = normalizedText.match(/^(.+)\s+on\s+(.+)$/iu);
  if (onMatch?.[1] && onMatch[2]) {
    return `Put the ${lowercaseFirst(onMatch[1])} on the ${lowercaseFirst(
      onMatch[2],
    )}.`;
  }

  return undefined;
}

function looksLikeInstruction(text: string) {
  return /^(air|buckle|build|call|carry|check|choose|clean|comb|draw|dry|eat|find|get|go|hang|hug|label|line|listen|load|make|move|open|pack|pass|play|pour|put|raise|read|rinse|rub|save|say|scrub|serve|set|share|sip|sit|solve|sort|spray|stack|start|step|take|throw|tidy|try|turn|use|wash|wipe|write)\b/iu.test(
    text,
  );
}

function toSentence(text: string | undefined) {
  const normalizedText = text?.trim();
  if (!normalizedText) {
    return undefined;
  }

  if (/[.!?]$/u.test(normalizedText)) {
    return capitalizeFirst(normalizedText);
  }

  return `${capitalizeFirst(normalizedText)}.`;
}

function capitalizeFirst(text: string) {
  return text.charAt(0).toLocaleUpperCase('en-US') + text.slice(1);
}

function lowercaseFirst(text: string) {
  return text.charAt(0).toLocaleLowerCase('en-US') + text.slice(1);
}
