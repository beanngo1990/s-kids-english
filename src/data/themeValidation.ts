import type { EntityId, Lesson, LessonTheme } from '../types/lesson';
import type {
  LessonValidationIssue,
  LessonValidationSeverity,
} from './lessonValidation';

export function validateThemes(
  themes: readonly LessonTheme[],
  lessons: readonly Lesson[],
) {
  const issues: LessonValidationIssue[] = [];
  const themeIds = new Set<EntityId>();
  const lessonIds = new Set(lessons.map(lesson => lesson.id));
  const referencedLessonIds = new Set<EntityId>();

  themes.forEach((theme, themeIndex) => {
    const themePath = `themes[${themeIndex}:${theme.id}]`;

    if (themeIds.has(theme.id)) {
      issues.push(error(themePath, `Duplicate theme id "${theme.id}".`));
    }
    themeIds.add(theme.id);

    if (theme.lessonIds.length === 0) {
      issues.push(error(themePath, 'Theme must include at least one lesson.'));
    }

    const themeLessonIds = new Set<EntityId>();

    theme.lessonIds.forEach((lessonId, lessonIndex) => {
      const lessonPath = `${themePath}.lessonIds[${lessonIndex}]`;
      const lesson = lessons.find(item => item.id === lessonId);

      if (themeLessonIds.has(lessonId)) {
        issues.push(error(lessonPath, `Duplicate lesson id "${lessonId}".`));
      }
      themeLessonIds.add(lessonId);
      referencedLessonIds.add(lessonId);

      if (!lessonIds.has(lessonId) || !lesson) {
        issues.push(error(lessonPath, `Lesson id "${lessonId}" does not exist.`));
        return;
      }

      if (lesson.themeId !== theme.id) {
        issues.push(
          error(
            lessonPath,
            `Lesson "${lessonId}" has themeId "${lesson.themeId}" instead of "${theme.id}".`,
          ),
        );
      }
    });
  });

  lessons.forEach((lesson, lessonIndex) => {
    const lessonPath = `lessons[${lessonIndex}:${lesson.id}]`;

    if (!themeIds.has(lesson.themeId)) {
      issues.push(
        error(lessonPath, `themeId "${lesson.themeId}" does not exist.`),
      );
    }

    if (!referencedLessonIds.has(lesson.id)) {
      issues.push(
        error(lessonPath, `Lesson is not referenced by its theme catalog.`),
      );
    }
  });

  return issues;
}

export function assertValidThemes(
  themes: readonly LessonTheme[],
  lessons: readonly Lesson[],
) {
  const issues = validateThemes(themes, lessons);

  if (issues.length === 0) {
    return;
  }

  const summary = issues
    .map(item => `[${item.severity}] ${item.path}: ${item.message}`)
    .join('\n');

  if (__DEV__) {
    const errors = issues.filter(item => item.severity === 'error');

    if (errors.length > 0) {
      throw new Error(`Theme data validation failed:\n${summary}`);
    }

    console.warn(`Theme data validation warnings:\n${summary}`);
  }
}

function error(path: string, message: string): LessonValidationIssue {
  return issue('error', path, message);
}

function issue(
  severity: LessonValidationSeverity,
  path: string,
  message: string,
): LessonValidationIssue {
  return {
    message,
    path,
    severity,
  };
}
