export function getLessonCompletionPercent(
  completedCount: number,
  totalCount: number,
) {
  if (totalCount <= 0) {
    return 0;
  }

  const boundedCompletedCount = Math.min(
    Math.max(completedCount, 0),
    totalCount,
  );
  return Math.round((boundedCompletedCount / totalCount) * 100);
}

export function haveSameLessonIds(first: string[], second: string[]) {
  const firstSet = new Set(first);
  const secondSet = new Set(second);

  return (
    firstSet.size === secondSet.size &&
    Array.from(firstSet).every(id => secondSet.has(id))
  );
}

export function getRecommendedLessonIds(
  themeGroups: ReadonlyArray<{ lessonIds: readonly string[] }>,
) {
  const recommendedLessonIds: string[] = [];
  const seenLessonIds = new Set<string>();

  themeGroups.forEach(theme => {
    const firstLessonId = theme.lessonIds.find(id => !seenLessonIds.has(id));
    if (!firstLessonId) {
      return;
    }

    seenLessonIds.add(firstLessonId);
    recommendedLessonIds.push(firstLessonId);
  });

  return recommendedLessonIds;
}

export function getLessonPlanSelection(
  visibleLessonIds: string[] | undefined,
  recommendedLessonIds: string[],
  disabledThemeIds: string[] | undefined = undefined,
): 'all' | 'recommended' | 'custom' {
  if (!visibleLessonIds && !disabledThemeIds?.length) {
    return 'all';
  }

  if (
    visibleLessonIds &&
    !disabledThemeIds?.length &&
    haveSameLessonIds(visibleLessonIds, recommendedLessonIds)
  ) {
    return 'recommended';
  }

  return 'custom';
}

export function getEnabledLessonIds(
  allLessonIds: string[],
  visibleLessonIds: string[] | undefined,
  themeGroups: ReadonlyArray<{
    id: string;
    lessonIds: readonly string[];
  }>,
  disabledThemeIds: string[] | undefined,
) {
  const selectedLessonIds = visibleLessonIds ?? allLessonIds;
  if (!disabledThemeIds?.length) {
    return selectedLessonIds;
  }

  const disabledThemeIdSet = new Set(disabledThemeIds);
  const disabledLessonIds = new Set(
    themeGroups
      .filter(theme => disabledThemeIdSet.has(theme.id))
      .flatMap(theme => theme.lessonIds),
  );

  return selectedLessonIds.filter(id => !disabledLessonIds.has(id));
}

export function isOnlyVisibleLessonInTheme(
  lessonId: string,
  themeLessonIds: string[],
  enabledLessonIds: string[],
) {
  if (!enabledLessonIds.includes(lessonId)) {
    return false;
  }

  return (
    themeLessonIds.filter(themeLessonId =>
      enabledLessonIds.includes(themeLessonId),
    ).length <= 1
  );
}
