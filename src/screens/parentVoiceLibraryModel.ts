import { lessons } from '../data/lessons';
import { themes } from '../data/themes';
import type { VoiceRecordingWordEntry } from '../engine/VoiceRecordingStore';

export type VoiceRecordingLessonGroup = {
  entries: VoiceRecordingWordEntry[];
  lessonId: string;
};

export type VoiceRecordingThemeGroup = {
  lessons: VoiceRecordingLessonGroup[];
  themeId: string;
};

export function groupVoiceRecordingWords(
  entries: VoiceRecordingWordEntry[],
): VoiceRecordingThemeGroup[] {
  const grouped = new Map<string, Map<string, VoiceRecordingWordEntry[]>>();

  entries.forEach(entry => {
    const themeLessons = grouped.get(entry.themeId) ?? new Map();
    const lessonEntries = themeLessons.get(entry.lessonId) ?? [];
    lessonEntries.push(entry);
    themeLessons.set(entry.lessonId, lessonEntries);
    grouped.set(entry.themeId, themeLessons);
  });

  const themeOrder = new Map(themes.map((theme, index) => [theme.id, index]));
  const lessonOrder = new Map(
    lessons.map((lesson, index) => [lesson.id, index]),
  );

  return [...grouped.entries()]
    .sort(([leftId], [rightId]) =>
      compareCatalogIds(leftId, rightId, themeOrder),
    )
    .map(([themeId, themeLessons]) => ({
      themeId,
      lessons: [...themeLessons.entries()]
        .sort(([leftId], [rightId]) =>
          compareCatalogIds(leftId, rightId, lessonOrder),
        )
        .map(([lessonId, lessonEntries]) => ({
          entries: lessonEntries,
          lessonId,
        })),
    }));
}

export function formatVoiceRecordingDate(
  createdAt: string,
  language: 'en' | 'vi',
) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return language === 'vi'
    ? `${day}/${month}/${year}`
    : `${month}/${day}/${year}`;
}

function compareCatalogIds(
  leftId: string,
  rightId: string,
  order: Map<string, number>,
) {
  const leftOrder = order.get(leftId);
  const rightOrder = order.get(rightId);

  if (leftOrder !== undefined && rightOrder !== undefined) {
    return leftOrder - rightOrder;
  }
  if (leftOrder !== undefined) {
    return -1;
  }
  if (rightOrder !== undefined) {
    return 1;
  }
  return leftId.localeCompare(rightId);
}
