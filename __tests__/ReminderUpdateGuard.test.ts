import { ReminderUpdateGuard } from '../src/utils/ReminderUpdateGuard';

test('rejects reminder refreshes captured before or during an update', () => {
  const guard = new ReminderUpdateGuard();
  const beforeUpdate = guard.captureRefreshRevision();

  expect(guard.beginUpdate()).toBe(true);
  const duringUpdate = guard.captureRefreshRevision();

  expect(guard.canApplyRefresh(beforeUpdate)).toBe(false);
  expect(guard.canApplyRefresh(duringUpdate)).toBe(false);

  guard.finishUpdate();

  expect(guard.canApplyRefresh(beforeUpdate)).toBe(false);
  expect(guard.canApplyRefresh(duringUpdate)).toBe(false);
  expect(guard.canApplyRefresh(guard.captureRefreshRevision())).toBe(true);
});

test('prevents overlapping reminder updates', () => {
  const guard = new ReminderUpdateGuard();

  expect(guard.beginUpdate()).toBe(true);
  expect(guard.beginUpdate()).toBe(false);

  guard.finishUpdate();

  expect(guard.beginUpdate()).toBe(true);
});
