import { clearLocalCloudProgressSyncData } from '../engine/CloudProgressSyncManager';
import { resetActivityLog } from '../engine/DailyActivityTracker';
import { resetParentSettings } from '../engine/ParentSettingsManager';
import { resetProgress } from '../engine/ProgressManager';
import { NotificationService } from './NotificationService';

export async function deleteLocalAccountData(): Promise<void> {
  const failures: unknown[] = [];
  await collectFailure(clearLocalCloudProgressSyncData(), failures);

  const deletionResults = await Promise.allSettled([
    resetParentSettings(),
    resetProgress(),
    resetActivityLog(),
    cancelDailyReminderBestEffort(),
  ]);

  for (const result of deletionResults) {
    if (result.status === 'rejected') {
      failures.push(result.reason);
    }
  }

  if (failures.length > 0) {
    throw normalizeLocalDeletionError(failures[0]);
  }
}

async function cancelDailyReminderBestEffort() {
  try {
    await NotificationService.cancelDailyReminder();
  } catch {
    // Persisted account data should still be cleared when notification
    // cancellation is temporarily unavailable.
  }
}

async function collectFailure(promise: Promise<unknown>, failures: unknown[]) {
  try {
    await promise;
  } catch (error) {
    failures.push(error);
  }
}

function normalizeLocalDeletionError(error: unknown) {
  return error instanceof Error
    ? error
    : new Error('Could not delete local account data.');
}
