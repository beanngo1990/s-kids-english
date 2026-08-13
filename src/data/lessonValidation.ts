import type {
  EntityId,
  Lesson,
  PercentRect,
  Scene,
  SceneStep,
} from '../types/lesson';

export type LessonValidationSeverity = 'error' | 'warning';

export type LessonValidationIssue = {
  message: string;
  path: string;
  severity: LessonValidationSeverity;
};

export function validateLessons(lessons: readonly Lesson[]) {
  const issues: LessonValidationIssue[] = [];
  const lessonIds = new Set<EntityId>();

  lessons.forEach((lesson, lessonIndex) => {
    const lessonPath = `lessons[${lessonIndex}:${lesson.id}]`;

    if (lessonIds.has(lesson.id)) {
      issues.push(error(lessonPath, `Duplicate lesson id "${lesson.id}".`));
    }
    lessonIds.add(lesson.id);

    issues.push(...validateLesson(lesson, lessonPath));
  });

  return issues;
}

export function assertValidLessons(lessons: readonly Lesson[]) {
  const issues = validateLessons(lessons);

  if (issues.length === 0) {
    return;
  }

  const summary = issues
    .map(issue => `[${issue.severity}] ${issue.path}: ${issue.message}`)
    .join('\n');

  if (__DEV__) {
    const errors = issues.filter(issue => issue.severity === 'error');

    if (errors.length > 0) {
      throw new Error(`Lesson data validation failed:\n${summary}`);
    }

    console.warn(`Lesson data validation warnings:\n${summary}`);
  }
}

export function validateLesson(lesson: Lesson, lessonPath = lesson.id) {
  const issues: LessonValidationIssue[] = [];

  if (typeof lesson.themeId !== 'string' || lesson.themeId.length === 0) {
    issues.push(error(lessonPath, 'Lesson must include a themeId.'));
  }

  if (lesson.scenes.length === 0) {
    issues.push(error(lessonPath, 'Lesson must include at least one scene.'));
  }

  issues.push(...validateUniqueIds(lesson.scenes, `${lessonPath}.scenes`));

  const lessonVocabularyIds = new Set<EntityId>();

  lesson.scenes.forEach((scene, sceneIndex) => {
    scene.vocabulary?.forEach(vocab => lessonVocabularyIds.add(vocab.id));
    issues.push(
      ...validateScene(scene, `${lessonPath}.scenes[${sceneIndex}:${scene.id}]`),
    );
  });

  const reviewVocabularyIds = lesson.reviewGame?.config?.vocabularyIds;
  if (Array.isArray(reviewVocabularyIds)) {
    reviewVocabularyIds.forEach((vocabId, vocabIndex) => {
      if (typeof vocabId !== 'string' || !lessonVocabularyIds.has(vocabId)) {
        issues.push(
          warning(
            `${lessonPath}.reviewGame.config.vocabularyIds[${vocabIndex}]`,
            `Vocabulary id "${String(vocabId)}" is not in this lesson.`,
          ),
        );
      }
    });
  }

  return issues;
}

function validateScene(scene: Scene, scenePath: string) {
  const issues: LessonValidationIssue[] = [];
  const renderableObjects = scene.character
    ? [scene.character, ...scene.objects]
    : scene.objects;
  const objectIds = new Set(renderableObjects.map(object => object.id));
  const dropZoneIds = new Set(scene.dropZones?.map(dropZone => dropZone.id));
  const stepIds = new Set(scene.steps.map(step => step.id));
  const vocabularyIds = new Set(scene.vocabulary?.map(vocab => vocab.id));

  if (scene.steps.length === 0) {
    issues.push(error(`${scenePath}.steps`, 'Scene must include at least one step.'));
  }

  issues.push(...validateUniqueIds(renderableObjects, `${scenePath}.objects`));
  issues.push(...validateUniqueIds(scene.dropZones ?? [], `${scenePath}.dropZones`));
  issues.push(...validateUniqueIds(scene.steps, `${scenePath}.steps`));

  renderableObjects.forEach((object, objectIndex) => {
    const objectPath = `${scenePath}.objects[${objectIndex}:${object.id}]`;
    issues.push(...validateRect(object.position, `${objectPath}.position`));

    if (object.touchArea) {
      issues.push(...validateRect(object.touchArea, `${objectPath}.touchArea`));
    }

    issues.push(
      ...validateUniqueIds(object.variants ?? [], `${objectPath}.variants`),
    );

    object.variants?.forEach((variant, variantIndex) => {
      const variantPath = `${objectPath}.variants[${variantIndex}:${variant.id}]`;

      if (variant.position) {
        issues.push(...validateRect(variant.position, `${variantPath}.position`));
      }

      if (variant.touchArea) {
        issues.push(...validateRect(variant.touchArea, `${variantPath}.touchArea`));
      }
    });

    if (
      object.initialVariantId &&
      !object.variants?.some(variant => variant.id === object.initialVariantId)
    ) {
      issues.push(
        error(
          `${objectPath}.initialVariantId`,
          `Variant id "${object.initialVariantId}" does not exist on this object.`,
        ),
      );
    }

    if (object.vocabId && !vocabularyIds.has(object.vocabId)) {
      issues.push(
        error(objectPath, `vocabId "${object.vocabId}" is missing from scene vocabulary.`),
      );
    }
  });

  scene.dropZones?.forEach((dropZone, dropZoneIndex) => {
    const dropZonePath = `${scenePath}.dropZones[${dropZoneIndex}:${dropZone.id}]`;
    issues.push(...validateRect(dropZone.position, `${dropZonePath}.position`));

    if (dropZone.touchArea) {
      issues.push(...validateRect(dropZone.touchArea, `${dropZonePath}.touchArea`));
    }
  });

  scene.steps.forEach((step, stepIndex) => {
    issues.push(
      ...validateStep({
        dropZoneIds,
        objectIds,
        scenePath,
        step,
        stepIds,
        stepIndex,
        vocabularyIds,
        renderableObjects,
      }),
    );
  });

  issues.push(...validateReachableSteps(scene, scenePath, stepIds));

  return issues;
}

type ValidateStepInput = {
  dropZoneIds: Set<EntityId>;
  objectIds: Set<EntityId>;
  renderableObjects: Scene['objects'];
  scenePath: string;
  step: SceneStep;
  stepIds: Set<EntityId>;
  stepIndex: number;
  vocabularyIds: Set<EntityId>;
};

function validateStep({
  dropZoneIds,
  objectIds,
  renderableObjects,
  scenePath,
  step,
  stepIds,
  stepIndex,
  vocabularyIds,
}: ValidateStepInput) {
  const issues: LessonValidationIssue[] = [];
  const stepPath = `${scenePath}.steps[${stepIndex}:${step.id}]`;

  if (step.nextStepId && !stepIds.has(step.nextStepId)) {
    issues.push(error(stepPath, `nextStepId "${step.nextStepId}" does not exist.`));
  }

  if (step.nextStepId === step.id) {
    issues.push(error(stepPath, 'nextStepId cannot point to itself.'));
  }

  step.targetObjectIds.forEach(targetObjectId => {
    if (!objectIds.has(targetObjectId)) {
      issues.push(error(stepPath, `targetObjectId "${targetObjectId}" does not exist.`));
    }
  });

  if (step.vocabId && !vocabularyIds.has(step.vocabId)) {
    issues.push(error(stepPath, `vocabId "${step.vocabId}" is missing from scene vocabulary.`));
  }

  if (
    step.interaction.targetObjectId &&
    !objectIds.has(step.interaction.targetObjectId)
  ) {
    issues.push(
      error(
        `${stepPath}.interaction`,
        `targetObjectId "${step.interaction.targetObjectId}" does not exist.`,
      ),
    );
  }

  step.interaction.correctObjectIds?.forEach(correctObjectId => {
    if (!objectIds.has(correctObjectId)) {
      issues.push(
        error(
          `${stepPath}.interaction`,
          `correctObjectId "${correctObjectId}" does not exist.`,
        ),
      );
    }
  });

  if (
    step.interaction.type === 'tap' ||
    step.interaction.type === 'find'
  ) {
    const interactionTargetIds =
      step.interaction.correctObjectIds?.length
        ? step.interaction.correctObjectIds
        : step.interaction.targetObjectId
          ? [step.interaction.targetObjectId]
          : [];
    const interactionLabel =
      step.interaction.type === 'tap' ? 'Tap' : 'Find';

    Array.from(new Set(interactionTargetIds)).forEach(targetObjectId => {
      const interactionTarget = renderableObjects.find(
        object => object.id === targetObjectId,
      );

      if (interactionTarget && !interactionTarget.isInteractive) {
        issues.push(
          error(
            `${stepPath}.interaction`,
            `${interactionLabel} target "${interactionTarget.id}" must be interactive.`,
          ),
        );
      }
    });
  }

  if (step.interaction.type === 'drag') {
    const dragTarget = renderableObjects.find(
      object => object.id === step.interaction.targetObjectId,
    );

    if (dragTarget && !dragTarget.isInteractive) {
      issues.push(
        error(
          `${stepPath}.interaction`,
          `Drag target "${dragTarget.id}" must be interactive.`,
        ),
      );
    }

    if (!step.interaction.dropZoneId) {
      issues.push(error(`${stepPath}.interaction`, 'Drag step must include dropZoneId.'));
    } else if (!dropZoneIds.has(step.interaction.dropZoneId)) {
      issues.push(
        error(
          `${stepPath}.interaction`,
          `dropZoneId "${step.interaction.dropZoneId}" does not exist.`,
        ),
      );
    }
  }

  const targetVocabularyObject = renderableObjects.find(
    object =>
      step.targetObjectIds.includes(object.id) && Boolean(object.vocabId),
  );

  if (
    step.speechPractice &&
    !step.vocabId &&
    !targetVocabularyObject?.vocabId
  ) {
    issues.push(
      error(
        stepPath,
        'Speech-practice step must reference vocabulary through vocabId or a target object.',
      ),
    );
  }

  if (step.type === 'teach') {
    if (!targetVocabularyObject?.vocabId && !step.vocabId) {
      issues.push(
        warning(
          stepPath,
          'Teach step should target a learning object with vocabId.',
        ),
      );
    }
  }

  step.effects?.forEach((effect, effectIndex) => {
    if (effect.targetObjectId && !objectIds.has(effect.targetObjectId)) {
      issues.push(
        error(
          `${stepPath}.effects[${effectIndex}]`,
          `targetObjectId "${effect.targetObjectId}" does not exist.`,
        ),
      );
    }
  });

  step.successStateChanges?.forEach((change, changeIndex) => {
    const changePath = `${stepPath}.successStateChanges[${changeIndex}]`;
    const targetObject = renderableObjects.find(
      object => object.id === change.targetObjectId,
    );

    if (!targetObject) {
      issues.push(
        error(
          changePath,
          `targetObjectId "${change.targetObjectId}" does not exist.`,
        ),
      );
      return;
    }

    if (
      change.type === 'setObjectVariant' &&
      !targetObject.variants?.some(variant => variant.id === change.variantId)
    ) {
      issues.push(
        error(
          changePath,
          `Variant id "${change.variantId}" does not exist on object "${targetObject.id}".`,
        ),
      );
    }
  });

  return issues;
}

function validateReachableSteps(
  scene: Scene,
  scenePath: string,
  stepIds: Set<EntityId>,
) {
  const issues: LessonValidationIssue[] = [];
  const reachableStepIds = new Set<EntityId>();
  let currentStep: SceneStep | undefined = scene.steps[0];

  while (currentStep) {
    const activeStep: SceneStep = currentStep;

    if (reachableStepIds.has(activeStep.id)) {
      break;
    }

    reachableStepIds.add(activeStep.id);

    const currentIndex = scene.steps.findIndex(step => step.id === activeStep.id);
    const nextStepId: EntityId | undefined = activeStep.nextStepId;

    if (nextStepId && stepIds.has(nextStepId)) {
      currentStep = scene.steps.find(step => step.id === nextStepId);
      continue;
    }

    currentStep = scene.steps[currentIndex + 1];
  }

  scene.steps.forEach(step => {
    if (!reachableStepIds.has(step.id)) {
      issues.push(warning(`${scenePath}.steps[${step.id}]`, 'Step is not reachable.'));
    }
  });

  return issues;
}

function validateRect(rect: PercentRect, path: string) {
  const issues: LessonValidationIssue[] = [];
  const entries = Object.entries(rect);

  entries.forEach(([key, value]) => {
    if (key === 'flipX') {
      if (typeof value !== 'boolean') {
        issues.push(error(path, `${key} must be a boolean.`));
      }
      return;
    }
    if (!Number.isFinite(value)) {
      issues.push(error(path, `${key} must be a finite number.`));
    }
  });

  if (rect.width <= 0 || rect.height <= 0) {
    issues.push(error(path, 'width and height must be greater than 0.'));
  }

  if (
    rect.x < -20 ||
    rect.y < -20 ||
    rect.x + rect.width > 120 ||
    rect.y + rect.height > 120
  ) {
    issues.push(warning(path, 'Rect is far outside the visible stage.'));
  }

  return issues;
}

function validateUniqueIds(
  items: readonly { id: EntityId }[],
  path: string,
) {
  const issues: LessonValidationIssue[] = [];
  const ids = new Set<EntityId>();

  items.forEach((item, index) => {
    if (ids.has(item.id)) {
      issues.push(error(`${path}[${index}]`, `Duplicate id "${item.id}".`));
    }

    ids.add(item.id);
  });

  return issues;
}

function error(path: string, message: string): LessonValidationIssue {
  return {
    message,
    path,
    severity: 'error',
  };
}

function warning(path: string, message: string): LessonValidationIssue {
  return {
    message,
    path,
    severity: 'warning',
  };
}
