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
  const actionPhrase = shouldUseActionFeedback(step, scene, vocabularyItem)
    ? getPresentActionPhrase(step.promptText)
    : undefined;
  if (actionPhrase) {
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
        object !== undefined && object.id !== targetObjectId,
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

  const pastVerb =
    action.verb === 'air' && action.remainder.startsWith('dry ')
      ? 'air-dried'
      : pastVerbByBase[action.verb] ?? `${action.verb}ed`;
  return action.remainder ? `${pastVerb} ${action.remainder}` : pastVerb;
}

function getPresentActionPhrase(text: string | undefined) {
  const action = getActionParts(text);
  if (!action) {
    return undefined;
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

  if (verb === 'air' && text.startsWith('dry ')) {
    return `dry ${formatNounPhrase(text.slice('dry '.length))}`;
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

function formatNounPhrase(text: string) {
  const normalizedText = text.toLocaleLowerCase('en-US');
  const pronounPhrase = pronounNounPhrases[normalizedText];
  if (pronounPhrase) {
    return pronounPhrase;
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
  mouth: 'your mouth',
  teeth: 'your teeth',
};

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
  return /^(air|arrive|brush|buckle|build|call|carry|check|choose|clean|close|comb|draw|drink|dry|eat|find|get|go|hang|hug|jump|label|line|listen|load|make|move|open|pack|pass|play|pour|put|raise|read|rest|ride|rinse|rub|run|save|say|scrub|serve|set|share|sip|sit|sleep|solve|sort|spray|stack|start|step|take|throw|tidy|try|turn|use|wait|wash|wear|wipe|write)\b/iu.test(
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
