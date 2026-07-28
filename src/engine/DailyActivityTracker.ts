import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVITY_STORAGE_KEY = '@skidsenglish/daily-activity/v1';
const MAX_ENTRIES = 30;

export type DailyActivity = {
  date: string; // "2026-07-07"
  wordsLearned: number;
  scenesCompleted: number;
  minutesSpent: number;
};

export type ActivityLog = {
  entries: DailyActivity[];
  currentStreak: number;
  longestStreak: number;
};

const emptyActivityLog: ActivityLog = {
  entries: [],
  currentStreak: 0,
  longestStreak: 0,
};

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateNDaysAgo(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() - n);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateStreak(entries: DailyActivity[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (entries.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort entries by date descending
  const sortedDates = entries
    .filter(e => e.wordsLearned > 0 || e.scenesCompleted > 0)
    .map(e => e.date)
    .sort()
    .reverse();

  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const today = getTodayDateString();
  const yesterday = getDateNDaysAgo(1);

  // Current streak: count consecutive days ending at today or yesterday
  let currentStreak = 0;
  if (sortedDates[0] === today || sortedDates[0] === yesterday) {
    currentStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const expectedDate = getDateNDaysAgo(
        sortedDates[0] === today ? i : i + 1,
      );
      if (sortedDates[i] === expectedDate) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Longest streak: scan all entries
  let longestStreak = 0;
  let streak = 1;
  const allSortedAsc = [...sortedDates].reverse();
  for (let i = 1; i < allSortedAsc.length; i++) {
    const prevDate = new Date(allSortedAsc[i - 1]);
    const currDate = new Date(allSortedAsc[i]);
    const diffMs = currDate.getTime() - prevDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak++;
    } else {
      longestStreak = Math.max(longestStreak, streak);
      streak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, streak, currentStreak);

  return { currentStreak, longestStreak };
}

export async function getActivityLog(): Promise<ActivityLog> {
  try {
    const raw = await AsyncStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (!raw) {
      return emptyActivityLog;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.entries)) {
      return emptyActivityLog;
    }
    return {
      entries: parsed.entries,
      ...calculateStreak(parsed.entries),
    };
  } catch {
    return emptyActivityLog;
  }
}

export async function recordActivity(
  type: 'word' | 'scene',
  count: number = 1,
): Promise<void> {
  try {
    const log = await getActivityLog();
    const today = getTodayDateString();
    const existingIndex = log.entries.findIndex(e => e.date === today);

    let todayEntry: DailyActivity;
    if (existingIndex >= 0) {
      todayEntry = { ...log.entries[existingIndex] };
    } else {
      todayEntry = {
        date: today,
        wordsLearned: 0,
        scenesCompleted: 0,
        minutesSpent: 0,
      };
    }

    if (type === 'word') {
      todayEntry.wordsLearned += count;
    } else if (type === 'scene') {
      todayEntry.scenesCompleted += count;
      todayEntry.minutesSpent += 3 * count; // ~3 min per scene estimate
    }

    let nextEntries: DailyActivity[];
    if (existingIndex >= 0) {
      nextEntries = [...log.entries];
      nextEntries[existingIndex] = todayEntry;
    } else {
      nextEntries = [...log.entries, todayEntry];
    }

    // Keep only the most recent MAX_ENTRIES days
    nextEntries.sort((a, b) => a.date.localeCompare(b.date));
    if (nextEntries.length > MAX_ENTRIES) {
      nextEntries = nextEntries.slice(nextEntries.length - MAX_ENTRIES);
    }

    const nextLog: ActivityLog = {
      entries: nextEntries,
      ...calculateStreak(nextEntries),
    };

    await AsyncStorage.setItem(
      ACTIVITY_STORAGE_KEY,
      JSON.stringify(nextLog),
    );
  } catch {
    // best effort
  }
}

export async function resetActivityLog(): Promise<void> {
  await AsyncStorage.removeItem(ACTIVITY_STORAGE_KEY);
}

export function getWeeklyData(
  entries: DailyActivity[],
): Array<{ label: string; date: string; wordsLearned: number; scenesCompleted: number }> {
  const dayLabels = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const result: Array<{
    label: string;
    date: string;
    wordsLearned: number;
    scenesCompleted: number;
  }> = [];

  for (let i = 6; i >= 0; i--) {
    const dateStr = getDateNDaysAgo(i);
    const dayOfWeek = new Date(dateStr + 'T00:00:00').getDay();
    const entry = entries.find(e => e.date === dateStr);
    result.push({
      label: dayLabels[dayOfWeek],
      date: dateStr,
      wordsLearned: entry?.wordsLearned ?? 0,
      scenesCompleted: entry?.scenesCompleted ?? 0,
    });
  }

  return result;
}
