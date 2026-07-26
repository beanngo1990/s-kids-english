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
