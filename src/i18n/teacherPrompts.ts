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
      return getNounIntroductionSentence(vocabularyItem.word);
    }

    const label = vocabularyItem.type === 'verb' ? 'word' : 'phrase';
    return `Let's learn the ${label} ${vocabularyItem.word}.`;
  }

  if (step.interaction.type === 'listen') {
    return getActionInstructionSentence(promptText) ?? promptSentence ?? 'Listen carefully.';
  }

  if (step.interaction.type === 'find') {
    return `Find ${formatNounPhrase(getInstructionTargetText(scene, step))}.`;
  }

  if (step.interaction.type === 'tap') {
    const isNounLabelPrompt =
      vocabularyItem?.type === 'noun' &&
      promptText?.toLocaleLowerCase('en-US') ===
        vocabularyItem.word.toLocaleLowerCase('en-US');
    const tapPrompt = isNounLabelPrompt
      ? undefined
      : getTapPromptSentence(promptText);
    if (tapPrompt) {
      return tapPrompt;
    }

    return `Tap ${formatNounPhrase(getInstructionTargetText(scene, step))}.`;
  }

  if (step.interaction.type === 'drag') {
    const dragPrompt = getDragPromptSentence(promptText);
    if (dragPrompt) {
      return dragPrompt;
    }

    const targetText = getFeedbackTargetText(scene, step);
    const destinationText = getFeedbackDestinationText(
      scene,
      step,
      targetText,
    );
    if (targetText && destinationText) {
      return `Drag ${formatNounPhrase(
        targetText,
      )} ${getFailPlacementPreposition(
        step.instructionVi,
        destinationText,
      )} ${formatNounPhrase(destinationText)}.`;
    }

    return `Drag ${formatNounPhrase(getInstructionTargetText(scene, step))}.`;
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
  if (!step || !scene) {
    return undefined;
  }

  const explicitText =
    type === 'success'
      ? step.successFeedbackEn?.trim()
      : step.failFeedbackEn?.trim();
  if (explicitText) {
    return explicitText;
  }

  const vocabularyItem = getStepVocabulary(scene, step);
  if (type === 'success' && vocabularyItem && step.type === 'teach') {
    return `It means ${vocabularyItem.word}.`;
  }

  return inferTeacherFeedbackEn(type, step, scene, vocabularyItem);
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

function getObjectVocabulary(scene: Scene, object: SceneObject) {
  if (!object.vocabId) {
    return undefined;
  }

  return scene.vocabulary?.find(item => item.id === object.vocabId);
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
  const renderableObjects = getRenderableObjects(scene);
  const targetIds = [
    step.interaction.targetObjectId,
    step.interaction.correctObjectIds?.[0],
    step.targetObjectIds[0],
  ].filter((id): id is string => Boolean(id));

  return renderableObjects.find(object => targetIds.includes(object.id));
}

function getRenderableObjects(scene: Scene) {
  return scene.character ? [scene.character, ...scene.objects] : scene.objects;
}

function getObjectFallbackName(object: SceneObject) {
  return object.asset.id.replace(/[-_]/g, ' ');
}

function inferTeacherFeedbackEn(
  type: TeacherFeedbackType,
  step: SceneStep,
  scene: Scene,
  vocabularyItem: ReturnType<typeof getStepVocabulary>,
) {
  const viText =
    type === 'success' ? step.successFeedbackVi : step.failFeedbackVi;
  if (!viText?.trim()) {
    return undefined;
  }

  if (isMeaningFeedback(viText)) {
    const meaningText = vocabularyItem?.word ?? step.promptText?.trim();
    return meaningText ? `It means ${meaningText}.` : undefined;
  }

  return type === 'success'
    ? inferSuccessFeedbackEn(step, scene, viText, vocabularyItem)
    : inferFailFeedbackEn(step, scene, viText, vocabularyItem);
}

function inferSuccessFeedbackEn(
  step: SceneStep,
  scene: Scene,
  viText: string,
  vocabularyItem: ReturnType<typeof getStepVocabulary>,
) {
  const completedAction =
    (step.type === 'practice' || step.type === 'review') &&
    shouldUseActionFeedback(step, scene, vocabularyItem)
      ? getCompletedActionPhrase(step.promptText)
      : undefined;
  if (completedAction) {
    return `That's right, you ${completedAction}!`;
  }

  if (step.interaction.type === 'drag') {
    const targetText = getFeedbackTargetText(scene, step);
    const destinationText = getFeedbackDestinationText(scene, step, targetText);
    if (targetText && destinationText) {
      const preposition = getSuccessPlacementPreposition(
        viText,
        destinationText,
      );
      if (preposition) {
        return `${capitalizeFirst(formatNounPhrase(targetText))} ${getBeVerb(
          targetText,
        )} ${preposition} ${formatNounPhrase(destinationText)}.`;
      }
    }

    if (targetText) {
      return `${capitalizeFirst(formatNounPhrase(targetText))} ${getBeVerb(
        targetText,
      )} in the right place.`;
    }
  }

  if (step.interaction.type === 'tap' || step.interaction.type === 'find') {
    const targetText = getFeedbackTargetText(scene, step);
    if (targetText) {
      if (/^Đúng rồi[!.]?$/iu.test(viText.trim())) {
        return "That's right!";
      }

      if (/đó là/iu.test(viText)) {
        const nounPhrase = formatNounPhrase(targetText);
        return isPluralNoun(targetText)
          ? `That's right, those are ${nounPhrase}!`
          : `That's right, that's ${nounPhrase}!`;
      }

      return `That's right, you found ${formatNounPhrase(targetText)}!`;
    }
  }

  return toSentence(step.promptText);
}

function inferFailFeedbackEn(
  step: SceneStep,
  scene: Scene,
  viText: string,
  vocabularyItem: ReturnType<typeof getStepVocabulary>,
) {
  const locationFeedback = inferLocationFeedbackEn(step, scene, viText);
  if (locationFeedback) {
    return locationFeedback;
  }

  const actionPhrase = shouldUseActionFeedback(step, scene, vocabularyItem)
    ? getPresentActionPhrase(step.promptText)
    : undefined;
  if (actionPhrase) {
    if (actionPhrase.startsWith('try ')) {
      return `${capitalizeFirst(actionPhrase)}.`;
    }

    return `Try to ${actionPhrase}.`;
  }

  if (step.interaction.type === 'drag') {
    const targetText = getFeedbackTargetText(scene, step);
    const destinationText = getFeedbackDestinationText(scene, step, targetText);
    if (targetText && destinationText) {
      return `Move ${formatNounPhrase(
        targetText,
      )} ${getFailPlacementPreposition(
        viText,
        destinationText,
      )} ${formatNounPhrase(destinationText)}.`;
    }

    if (targetText) {
      return `Move ${formatNounPhrase(targetText)}.`;
    }
  }

  const targetText = getFeedbackTargetText(scene, step);
  if (targetText) {
    if (step.interaction.type === 'find') {
      return `Find ${formatNounPhrase(targetText)}.`;
    }

    return `Tap ${formatNounPhrase(targetText)}.`;
  }

  if (step.interaction.type === 'listen') {
    return 'Listen again.';
  }

  return undefined;
}

function inferLocationFeedbackEn(
  step: SceneStep,
  scene: Scene,
  viText: string,
) {
  if (!/(?:^|\s)(?:ở|nằm|đứng|treo|đang)(?:\s|$)/iu.test(viText)) {
    return undefined;
  }

  const targetText = getFeedbackTargetText(scene, step);
  if (!targetText) {
    return undefined;
  }

  const referenceText = getVietnameseLocationReference(scene, step, viText);
  const locationPhrase = getEnglishLocationPhrase(viText, referenceText);
  if (!locationPhrase) {
    return undefined;
  }

  return `${capitalizeFirst(formatNounPhrase(targetText))} ${getBeVerb(
    targetText,
  )} ${locationPhrase}.`;
}

function getVietnameseLocationReference(
  scene: Scene,
  step: SceneStep,
  viText: string,
) {
  const targetObjectId = getTargetObject(scene, step)?.id;
  const normalizedViText = normalizeVietnameseText(viText);
  const candidates = getRenderableObjects(scene)
    .filter(object => object.id !== targetObjectId)
    .map(object => {
      const vocabularyItem = getObjectVocabulary(scene, object);
      const meaningVi = vocabularyItem?.meaningVi;
      const normalizedMeaning = meaningVi
        ? stripVietnameseClassifier(normalizeVietnameseText(meaningVi))
        : '';
      return {
        english:
          vocabularyItem?.word ?? getObjectFallbackName(object),
        vietnamese: normalizedMeaning,
      };
    })
    .filter(candidate => candidate.vietnamese.length >= 2)
    .sort((left, right) => right.vietnamese.length - left.vietnamese.length);

  return candidates.find(candidate =>
    normalizedViText.includes(candidate.vietnamese),
  )?.english;
}

function normalizeVietnameseText(text: string) {
  return text
    .toLocaleLowerCase('vi-VN')
    .replace(/[,.!?]/gu, '')
    .replace(/\s+/gu, ' ')
    .trim();
}

function stripVietnameseClassifier(text: string) {
  return text.replace(
    /^(?:bộ|cái|cây|chai|chiếc|con|đôi|hộp|hũ|ly|miếng|món|quyển|thẻ)\s+/iu,
    '',
  );
}

function getEnglishLocationPhrase(
  viText: string,
  referenceText: string | undefined,
) {
  const text = normalizeVietnameseText(viText);
  const reference = referenceText
    ? formatNounPhrase(referenceText)
    : undefined;
  const fixedLocation = vietnameseLocationPhrases.find(({ pattern }) =>
    pattern.test(text),
  );
  if (fixedLocation) {
    return fixedLocation.english;
  }

  if (/(?:bên|phía).*(?:trái)/iu.test(text)) {
    return reference ? `to the left of ${reference}` : 'on the left';
  }

  if (/(?:bên|phía).*(?:phải)/iu.test(text)) {
    return reference ? `to the right of ${reference}` : 'on the right';
  }

  if (/phía sau/iu.test(text)) {
    return reference ? `behind ${reference}` : 'at the back';
  }

  if (/trước mặt/iu.test(text)) {
    return reference ? `in front of ${reference}` : 'in front of you';
  }

  if (/trên cao/iu.test(text)) {
    return 'up high';
  }

  if (/dưới chân|gần chân/iu.test(text)) {
    return 'by your feet';
  }

  if (/(?:ở|gần|nằm) giữa/iu.test(text)) {
    return reference ? `in the middle of ${reference}` : 'in the middle';
  }

  if (/phía trên/iu.test(text)) {
    return reference ? `above ${reference}` : 'at the top';
  }

  if (/phía dưới/iu.test(text)) {
    return reference ? `below ${reference}` : 'at the bottom';
  }

  if (/\b(?:bên )?cạnh\b/iu.test(text)) {
    return reference ? `next to ${reference}` : 'nearby';
  }

  if (/\bgần\b/iu.test(text)) {
    return reference ? `near ${reference}` : 'nearby';
  }

  if (/\btrong\b/iu.test(text)) {
    return reference ? `in ${reference}` : undefined;
  }

  if (/\btrên\b/iu.test(text)) {
    return reference ? `on ${reference}` : undefined;
  }

  if (/\bdưới\b/iu.test(text)) {
    return reference ? `under ${reference}` : undefined;
  }

  if (/\btreo\b/iu.test(text)) {
    return reference ? `near ${reference}` : 'hanging up';
  }

  return undefined;
}

const vietnameseLocationPhrases: Array<{
  english: string;
  pattern: RegExp;
}> = [
  { english: 'between the two small bottles', pattern: /giữa hai chai nhỏ/iu },
  { english: 'near the middle of the playground', pattern: /gần giữa sân/iu },
  { english: 'in the middle of the bathroom', pattern: /giữa phòng tắm/iu },
  { english: 'in the middle of the classroom', pattern: /giữa lớp/iu },
  { english: 'in the middle of the clean-up area', pattern: /giữa khu dọn/iu },
  { english: 'in the middle of the dining table', pattern: /giữa bàn ăn/iu },
  { english: 'near the middle of the room', pattern: /gần giữa phòng/iu },
  { english: 'in the middle of the room', pattern: /giữa phòng/iu },
  { english: 'at the top of the classroom', pattern: /phía trên lớp/iu },
  { english: 'above the small container', pattern: /phía trên hộp nhỏ/iu },
  { english: 'next to the cleaning brush', pattern: /cạnh bàn chải/iu },
  { english: 'next to the storybook', pattern: /cạnh sách truyện/iu },
  { english: 'near the handwashing area', pattern: /gần chỗ rửa tay/iu },
  { english: 'near the edge of the table', pattern: /gần mép bàn/iu },
  { english: 'near the bathtub', pattern: /gần bồn tắm/iu },
  { english: 'near the sink', pattern: /gần bồn/iu },
  { english: 'near the school', pattern: /gần trường/iu },
  { english: 'near your neck', pattern: /gần cổ bé/iu },
  { english: 'next to you', pattern: /(?:cạnh|gần) bé/iu },
  { english: 'by your body', pattern: /cạnh người bé/iu },
  { english: 'under the play table', pattern: /dưới bàn chơi/iu },
  { english: 'on the play table', pattern: /trên bàn chơi/iu },
  { english: 'on the small table', pattern: /trên bàn nhỏ/iu },
  { english: 'on the small shelf', pattern: /trên kệ nhỏ/iu },
  { english: 'in the bathtub', pattern: /trong bồn tắm/iu },
  { english: 'on the wall', pattern: /trên tường/iu },
  { english: 'on the mat', pattern: /trên thảm/iu },
  { english: 'on the table', pattern: /trên bàn/iu },
];

function isMeaningFeedback(text: string) {
  return /^(Từ|Câu) này nghĩa là\b/iu.test(text.trim());
}

function shouldUseActionFeedback(
  step: SceneStep,
  scene: Scene,
  vocabularyItem: ReturnType<typeof getStepVocabulary>,
) {
  const promptText = step.promptText?.trim();
  if (!promptText || !looksLikeInstruction(promptText)) {
    return false;
  }

  const targetVocabularyItem = getTargetObjectVocabulary(scene, step);
  const comparedVocabularyItem = vocabularyItem ?? targetVocabularyItem;
  if (
    (step.interaction.type === 'tap' || step.interaction.type === 'find') &&
    comparedVocabularyItem?.type === 'noun' &&
    promptText.toLocaleLowerCase('en-US') ===
      comparedVocabularyItem.word.toLocaleLowerCase('en-US')
  ) {
    return false;
  }

  return true;
}

function getFeedbackTargetText(scene: Scene, step: SceneStep) {
  const targetVocabularyItem = getTargetObjectVocabulary(scene, step);
  if (targetVocabularyItem) {
    return targetVocabularyItem.word;
  }

  const targetObject = getTargetObject(scene, step);
  if (targetObject) {
    return getObjectFallbackName(targetObject);
  }

  return step.promptText?.trim();
}

function getFeedbackDestinationText(
  scene: Scene,
  step: SceneStep,
  targetText: string | undefined,
) {
  const targetObjectId = getTargetObject(scene, step)?.id;
  const secondaryObject = step.targetObjectIds
    .map(id => getRenderableObjects(scene).find(object => object.id === id))
    .find(
      (object): object is SceneObject =>
        object !== undefined &&
        object.id !== targetObjectId &&
        object.id !== scene.character?.id,
    );
  if (secondaryObject) {
    const vocabularyItem = getObjectVocabulary(scene, secondaryObject);
    return vocabularyItem?.word ?? getObjectFallbackName(secondaryObject);
  }

  const promptText = step.promptText?.trim();
  if (
    promptText &&
    !looksLikeInstruction(promptText) &&
    promptText.toLocaleLowerCase('en-US') !==
      targetText?.toLocaleLowerCase('en-US')
  ) {
    return promptText;
  }

  const dropZoneId = step.interaction.dropZoneId;
  return dropZoneId ? getDropZoneFallbackName(dropZoneId) : undefined;
}

function getDropZoneFallbackName(dropZoneId: string) {
  const explicitName = dropZoneFallbackNames[dropZoneId];
  if (explicitName) {
    return explicitName;
  }

  const words = dropZoneId
    .replace(/[-_]?zone$/iu, '')
    .split(/[-_]/u)
    .filter(Boolean);
  const lastWord = words[words.length - 1] ?? 'spot';

  if (lastWord === 'grownup') {
    return 'grown-up';
  }

  return lastWord;
}

const dropZoneFallbackNames: Record<string, string> = {
  'dinner-table-meal-zone': 'meal area',
};

function getSuccessPlacementPreposition(text: string, destinationText: string) {
  if (/\bcạnh\b/iu.test(text)) {
    return 'next to';
  }

  if (/\bgần\b/iu.test(text)) {
    return 'near';
  }

  if (isSkyText(destinationText)) {
    return 'in';
  }

  if (isFeetText(destinationText)) {
    return 'on';
  }

  if (/\b(trên|lên)\b/iu.test(text)) {
    return 'on';
  }

  if (/\b(trong|vào)\b/iu.test(text)) {
    return isSurfaceText(destinationText) ? 'on' : 'in';
  }

  if (/\b(tới|đến)\b/iu.test(text)) {
    return 'at';
  }

  return undefined;
}

function getFailPlacementPreposition(text: string, destinationText: string) {
  if (/\b(cạnh|gần)\b/iu.test(text)) {
    return 'next to';
  }

  if (isSkyText(destinationText)) {
    return 'into';
  }

  if (/\b(lên|trên)\b/iu.test(text)) {
    return 'onto';
  }

  if (/\bvào\b/iu.test(text)) {
    return isSurfaceText(destinationText) ? 'onto' : 'into';
  }

  return 'to';
}

function isSurfaceText(text: string) {
  return /^(dish rack|mat|plate|small table|table|tray)$/iu.test(text);
}

function isFeetText(text: string) {
  return /^(feet|foot)$/iu.test(text);
}

function isSkyText(text: string) {
  return /^sky$/iu.test(text);
}

function getCompletedActionPhrase(text: string | undefined) {
  const action = getActionParts(text);
  if (!action) {
    return undefined;
  }

  if (action.verb === 'air' && action.remainder.startsWith('dry ')) {
    return `air-dried ${action.remainder.slice('dry '.length)}`;
  }

  const pastVerb = pastVerbByBase[action.verb] ?? `${action.verb}ed`;
  return action.remainder ? `${pastVerb} ${action.remainder}` : pastVerb;
}

function getPresentActionPhrase(text: string | undefined) {
  const action = getActionParts(text);
  if (!action) {
    return undefined;
  }

  if (action.verb === 'air' && action.remainder.startsWith('dry ')) {
    return `air-dry ${action.remainder.slice('dry '.length)}`;
  }

  return action.remainder ? `${action.verb} ${action.remainder}` : action.verb;
}

function getActionParts(text: string | undefined) {
  const normalizedText = text?.trim().replace(/[.!?]+$/u, '');
  if (!normalizedText || !looksLikeInstruction(normalizedText)) {
    return undefined;
  }

  const [rawVerb, ...restWords] = normalizedText.split(/\s+/u);
  const verb = rawVerb?.toLocaleLowerCase('en-US');
  if (!verb) {
    return undefined;
  }

  return {
    remainder: formatActionRemainder(verb, restWords.join(' ')),
    verb,
  };
}

const pastVerbByBase: Record<string, string> = {
  air: 'aired',
  arrive: 'arrived',
  brush: 'brushed',
  buckle: 'buckled',
  build: 'built',
  call: 'called',
  carry: 'carried',
  check: 'checked',
  choose: 'chose',
  clean: 'cleaned',
  close: 'closed',
  comb: 'combed',
  draw: 'drew',
  drag: 'dragged',
  drink: 'drank',
  dry: 'dried',
  eat: 'ate',
  find: 'found',
  get: 'got',
  go: 'went',
  hang: 'hung',
  hug: 'hugged',
  jump: 'jumped',
  label: 'labeled',
  line: 'lined',
  listen: 'listened',
  load: 'loaded',
  make: 'made',
  move: 'moved',
  open: 'opened',
  pack: 'packed',
  pass: 'passed',
  play: 'played',
  pour: 'poured',
  put: 'put',
  raise: 'raised',
  read: 'read',
  rest: 'rested',
  ride: 'rode',
  rinse: 'rinsed',
  rub: 'rubbed',
  run: 'ran',
  save: 'saved',
  say: 'said',
  scrub: 'scrubbed',
  serve: 'served',
  set: 'set',
  share: 'shared',
  sip: 'sipped',
  sit: 'sat',
  sleep: 'slept',
  solve: 'solved',
  sort: 'sorted',
  spray: 'sprayed',
  stack: 'stacked',
  start: 'started',
  step: 'stepped',
  take: 'took',
  throw: 'threw',
  tidy: 'tidied',
  try: 'tried',
  turn: 'turned',
  use: 'used',
  wait: 'waited',
  wash: 'washed',
  wear: 'wore',
  wipe: 'wiped',
  write: 'wrote',
};

function formatActionRemainder(verb: string, text: string) {
  if (!text) {
    return '';
  }

  const override = actionRemainderOverrides[`${verb} ${text}`];
  if (override) {
    return override;
  }

  if (verb === 'air' && text.startsWith('dry ')) {
    return `dry ${formatNounPhrase(text.slice('dry '.length))}`;
  }

  if (
    (/^(eat|have)$/iu.test(verb) && /^(breakfast|dinner|lunch)$/iu.test(text)) ||
    (/^(arrive|go|ride)$/iu.test(verb) && text === 'home') ||
    (/^(go|walk)$/iu.test(verb) && /^(to bed|to school)$/iu.test(text))
  ) {
    return text;
  }

  if (/^(a|an|the|my|our|your)\b/iu.test(text)) {
    return text;
  }

  const leadingParticleMatch = text.match(
    /^(away|down|together|turns|up)\b(.*)$/iu,
  );
  if (leadingParticleMatch?.[1]) {
    const particle = leadingParticleMatch[1].toLocaleLowerCase('en-US');
    const rest = leadingParticleMatch[2]?.trim();
    return rest ? `${particle} ${formatNounPhrase(rest)}` : particle;
  }

  if (verb === 'take' && text === 'bite') {
    return 'a bite';
  }

  if (/^(at|in|into|next to|on|onto|to|with)\s+/iu.test(text)) {
    return text.replace(
      /^(at|in|into|next to|on|onto|to|with)\s+(.+)$/iu,
      (_match, preposition: string, objectText: string) =>
        `${preposition.toLocaleLowerCase('en-US')} ${formatNounPhrase(
          objectText,
        )}`,
    );
  }

  if (text === 'up') {
    return text;
  }

  if (text === 'thank you' || text === 'good morning') {
    return text;
  }

  if (/^(face|hair|hand|hands|mouth|teeth)$/iu.test(text)) {
    return `your ${text}`;
  }

  const trailingParticleMatch = text.match(/^(.+)\s+(away|up)$/iu);
  if (trailingParticleMatch?.[1] && trailingParticleMatch[2]) {
    return `${formatNounPhrase(
      trailingParticleMatch[1],
    )} ${trailingParticleMatch[2].toLocaleLowerCase('en-US')}`;
  }

  return formatNounPhrase(text);
}

const actionRemainderOverrides: Record<string, string> = {
  'brush teeth': 'your teeth',
  'build tower': 'a tower',
  'call everyone': 'everyone',
  'carry tray': 'the tray',
  'check dream journal': 'your dream journal',
  'check temperature': 'the temperature',
  'choose snack': 'a snack',
  'choose story': 'a story',
  'choose toy': 'a toy',
  'clean up toys': 'up the toys',
  'close curtains': 'the curtains',
  'comb hair': 'your hair',
  'dim lights': 'the lights',
  'draw picture': 'a picture',
  'dry face': 'your face',
  'dry surface': 'the surface',
  'eat snack': 'a snack',
  'get on bus': 'on the bus',
  'hang robe': 'the robe',
  'hug comfort plush': 'your soft toy',
  'hug family': 'your family',
  'label container': 'the container',
  'load dishwasher': 'the dishwasher',
  'move cart': 'the cart',
  'open book': 'the book',
  'open lunchbox': 'your lunchbox',
  'open snack box': 'the snack box',
  'pack bag': 'your bag',
  'pass dish': 'the dish',
  'place bookmark': 'the bookmark',
  'play gently': 'gently',
  'play lullaby': 'a lullaby',
  'put away book': 'away the book',
  'put away tray': 'away the tray',
  'put on pajamas': 'on your pajamas',
  'put on shoes': 'on your shoes',
  'raise hand': 'your hand',
  'read book': 'a book',
  'read softly': 'softly',
  'rinse hair': 'your hair',
  'say good night': 'good night',
  'say goodbye': 'goodbye',
  'scrub knees': 'your knees',
  'scrub spot': 'the spot',
  'set placemat': 'the placemat',
  'sit at table': 'at the table',
  'solve puzzle': 'a puzzle',
  'sort recycling': 'the recycling',
  'spray stain': 'the stain',
  'start timer': 'the timer',
  'step onto mat': 'onto the mat',
  'take off shoes': 'off your shoes',
  'throw away wrapper': 'away the wrapper',
  'tidy room': 'the room',
  'turn on shower': 'on the shower',
  'use spoon': 'a spoon',
  'wash face': 'your face',
  'wash hands': 'your hands',
  'wear sleep mask': 'a sleep mask',
  'wipe mouth': 'your mouth',
  'wipe table': 'the table',
};

function formatNounPhrase(text: string) {
  const normalizedText = text.toLocaleLowerCase('en-US');
  const pronounPhrase = pronounNounPhrases[normalizedText];
  if (pronounPhrase) {
    return pronounPhrase;
  }

  if (zeroArticleNounPhrases.has(normalizedText)) {
    return normalizedText;
  }

  if (/^(a|an|the|my|our|your)\b/iu.test(text)) {
    return text;
  }

  return `the ${text}`;
}

const pronounNounPhrases: Record<string, string> = {
  face: 'your face',
  family: 'your family',
  feet: 'your feet',
  foot: 'your foot',
  friend: 'your friend',
  hair: 'your hair',
  hand: 'your hand',
  hands: 'your hands',
  home: 'your home',
  mouth: 'your mouth',
  teeth: 'your teeth',
};

const zeroArticleNounPhrases = new Set([
  'breakfast',
  'dinner',
  'lunch',
  'music',
]);

function getBeVerb(text: string) {
  return isPluralNoun(text) ? 'are' : 'is';
}

function isPluralNoun(text: string) {
  const normalizedText = text.toLocaleLowerCase('en-US');
  if (pluralNounPhrases.has(normalizedText)) {
    return true;
  }

  return /s$/iu.test(normalizedText) && !/(ss|us)$/iu.test(normalizedText);
}

const pluralNounPhrases = new Set([
  'blocks',
  'clothes',
  'crayons',
  'crumbs',
  'dirty clothes',
  'dishes',
  'feet',
  'noodles',
  'pajamas',
  'raisins',
  'rubber gloves',
  'shoes',
  'shorts',
  'slippers',
  'socks',
  'tongs',
  'toys',
  'vegetables',
]);

function getTapPromptSentence(text: string | undefined) {
  const normalizedText = text?.trim();
  if (!normalizedText) {
    return undefined;
  }

  const tapMatch = normalizedText.match(/^tap\s+(.+)$/iu);
  if (tapMatch?.[1]) {
    return `Tap ${formatNounPhrase(lowercaseFirst(tapMatch[1]))}.`;
  }

  if (looksLikeInstruction(normalizedText)) {
    return getActionInstructionSentence(normalizedText);
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
    return `Drag ${formatNounPhrase(lowercaseFirst(dragMatch[1]))}.`;
  }

  if (looksLikeInstruction(normalizedText)) {
    return getActionInstructionSentence(normalizedText);
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

function getActionInstructionSentence(text: string | undefined) {
  const actionPhrase = getPresentActionPhrase(text);
  return actionPhrase ? `${capitalizeFirst(actionPhrase)}.` : undefined;
}

function getNounIntroductionSentence(text: string) {
  const nounPhrase = formatNounPhrase(text);
  return isPluralNoun(text)
    ? `These are ${nounPhrase}.`
    : `This is ${nounPhrase}.`;
}

function looksLikeInstruction(text: string) {
  return /^(air|arrive|brush|buckle|build|call|carry|check|choose|clean|close|comb|drag|draw|drink|dry|eat|find|get|go|hang|hug|jump|label|line|listen|load|make|move|open|pack|pass|play|pour|put|raise|read|rest|ride|rinse|rub|run|save|say|scrub|serve|set|share|sip|sit|sleep|solve|sort|spray|stack|start|step|take|throw|tidy|try|turn|use|wait|wash|wear|wipe|write)\b/iu.test(
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
