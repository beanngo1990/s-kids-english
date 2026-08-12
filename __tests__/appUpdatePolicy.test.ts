import {
  compareAppVersions,
  evaluateAppUpdatePolicy,
  parseAppUpdatePolicy,
  parseAppVersion,
  parseOptionalUpdateDismissal,
  type AppUpdatePolicy,
} from '../src/engine/AppUpdatePolicy';

const enabledPolicy: AppUpdatePolicy = {
  enabled: true,
  latestVersion: '2.11',
  minimumSupportedVersion: '1.0.1',
  schemaVersion: 1,
  storeUrl: 'https://apps.apple.com/app/id123456789',
};

test('accepts two- or three-part release versions and pads the patch part', () => {
  expect(parseAppVersion('1.0')).toEqual([1, 0, 0]);
  expect(parseAppVersion('1.0.1')).toEqual([1, 0, 1]);
  expect(parseAppVersion('2.11')).toEqual([2, 11, 0]);
  expect(compareAppVersions('1.0', '1.0.0')).toBe(0);
  expect(compareAppVersions('1.10', '1.9.9')).toBe(1);
  expect(compareAppVersions('2.11', '2.11.1')).toBe(-1);
});

test('rejects versions outside the supported numeric contract', () => {
  expect(parseAppVersion('1')).toBeNull();
  expect(parseAppVersion('1.0.0.1')).toBeNull();
  expect(parseAppVersion('1.0-beta')).toBeNull();
  expect(parseAppVersion('01.0')).toBeNull();
  expect(compareAppVersions('invalid', '1.0')).toBeNull();
});

test('parses a disabled policy without requiring store metadata', () => {
  expect(
    parseAppUpdatePolicy(
      JSON.stringify({ enabled: false, schemaVersion: 1 }),
      'ios',
    ),
  ).toEqual({ enabled: false, schemaVersion: 1 });
});

test('selects the current platform store URL from one shared policy', () => {
  const rawPolicy = JSON.stringify({
    enabled: true,
    latestVersion: '2.11',
    minimumSupportedVersion: '1.0.1',
    schemaVersion: 1,
    storeUrls: {
      android:
        'https://play.google.com/store/apps/details?id=com.seduforge.skidsenglish',
      ios: 'https://apps.apple.com/app/id123456789',
    },
  });

  expect(parseAppUpdatePolicy(rawPolicy, 'android')).toEqual({
    enabled: true,
    latestVersion: '2.11',
    minimumSupportedVersion: '1.0.1',
    schemaVersion: 1,
    storeUrl:
      'https://play.google.com/store/apps/details?id=com.seduforge.skidsenglish',
  });
  expect(parseAppUpdatePolicy(rawPolicy, 'ios')).toEqual(enabledPolicy);
});

test('fails closed policy parsing for unsafe or inconsistent config', () => {
  expect(
    parseAppUpdatePolicy(
      JSON.stringify({
        enabled: true,
        latestVersion: '1.0',
        minimumSupportedVersion: '2.0',
        schemaVersion: 1,
        storeUrls: {
          ios: 'https://apps.apple.com/app/id123456789',
        },
      }),
      'ios',
    ),
  ).toBeNull();

  expect(
    parseAppUpdatePolicy(
      JSON.stringify({
        enabled: true,
        latestVersion: '2.0',
        minimumSupportedVersion: '1.0',
        schemaVersion: 1,
        storeUrls: { ios: 'https://example.com/fake-store' },
      }),
      'ios',
    ),
  ).toBeNull();
});

test('requires, recommends, or skips the update at the correct boundaries', () => {
  const baseInput = {
    dismissal: null,
    now: Date.parse('2026-08-11T00:00:00.000Z'),
    optionalReminderDelayMs: 3 * 24 * 60 * 60 * 1000,
    policy: enabledPolicy,
  };

  expect(
    evaluateAppUpdatePolicy({ ...baseInput, currentVersion: '1.0' }),
  ).toMatchObject({ status: 'required' });
  expect(
    evaluateAppUpdatePolicy({ ...baseInput, currentVersion: '1.0.1' }),
  ).toMatchObject({ status: 'optional' });
  expect(
    evaluateAppUpdatePolicy({ ...baseInput, currentVersion: '2.11.0' }),
  ).toMatchObject({ status: 'none' });
  expect(
    evaluateAppUpdatePolicy({ ...baseInput, currentVersion: '3.0' }),
  ).toMatchObject({ status: 'none' });
});

test('snoozes only the matching optional release for three days', () => {
  const now = Date.parse('2026-08-11T00:00:00.000Z');
  const baseInput = {
    currentVersion: '2.10',
    now,
    optionalReminderDelayMs: 3 * 24 * 60 * 60 * 1000,
    policy: enabledPolicy,
  };

  expect(
    evaluateAppUpdatePolicy({
      ...baseInput,
      dismissal: {
        dismissedAt: '2026-08-10T00:00:00.000Z',
        latestVersion: '2.11',
      },
    }),
  ).toMatchObject({ status: 'none' });
  expect(
    evaluateAppUpdatePolicy({
      ...baseInput,
      dismissal: {
        dismissedAt: '2026-08-07T23:59:59.000Z',
        latestVersion: '2.11',
      },
    }),
  ).toMatchObject({ status: 'optional' });
  expect(
    evaluateAppUpdatePolicy({
      ...baseInput,
      dismissal: {
        dismissedAt: '2026-08-10T00:00:00.000Z',
        latestVersion: '2.12',
      },
    }),
  ).toMatchObject({ status: 'optional' });
});

test('normalizes persisted dismissal state and rejects malformed values', () => {
  expect(
    parseOptionalUpdateDismissal(
      JSON.stringify({
        dismissedAt: '2026-08-11T00:00:00.000Z',
        latestVersion: '2.11',
      }),
    ),
  ).toEqual({
    dismissedAt: '2026-08-11T00:00:00.000Z',
    latestVersion: '2.11',
  });
  expect(parseOptionalUpdateDismissal('{bad-json')).toBeNull();
  expect(
    parseOptionalUpdateDismissal(
      JSON.stringify({ dismissedAt: 'not-a-date', latestVersion: '2.11' }),
    ),
  ).toBeNull();
});

