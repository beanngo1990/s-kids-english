import {
  normalizeRevenueCatApiKey,
  selectRevenueCatApiKey,
} from '../src/config/monetization';

describe('RevenueCat build key guard', () => {
  test.each([
    ['ios', 'appl_public-key'],
    ['android', 'goog_public-key'],
  ] as const)('accepts the %s public key for every build', (platform, key) => {
    expect(normalizeRevenueCatApiKey(key, platform, false)).toBe(key);
    expect(normalizeRevenueCatApiKey(`  ${key}  `, platform, true)).toBe(key);
  });

  test.each(['ios', 'android'] as const)(
    'accepts Test Store keys only for debug %s builds',
    platform => {
      expect(normalizeRevenueCatApiKey('test_local-key', platform, true)).toBe(
        'test_local-key',
      );
      expect(
        normalizeRevenueCatApiKey('test_local-key', platform, false),
      ).toBeNull();
    },
  );

  test('rejects blank, cross-store and secret-shaped values', () => {
    expect(normalizeRevenueCatApiKey('  ', 'ios', true)).toBeNull();
    expect(
      normalizeRevenueCatApiKey('goog_wrong-platform', 'ios', false),
    ).toBeNull();
    expect(
      normalizeRevenueCatApiKey('appl_wrong-platform', 'android', false),
    ).toBeNull();
    expect(normalizeRevenueCatApiKey('sk_secret', 'android', true)).toBeNull();
  });

  test('prefers the local Test Store key only when debug allows it', () => {
    expect(
      selectRevenueCatApiKey(
        'ios',
        'appl_production-public-key',
        'test_local-public-key',
        true,
      ),
    ).toBe('test_local-public-key');
    expect(
      selectRevenueCatApiKey(
        'ios',
        'appl_production-public-key',
        'test_local-public-key',
        false,
      ),
    ).toBe('appl_production-public-key');
  });

  test('falls back to the platform key when the local value is not a Test Store key', () => {
    expect(
      selectRevenueCatApiKey(
        'android',
        'goog_production-public-key',
        'goog_not-a-test-store-key',
        true,
      ),
    ).toBe('goog_production-public-key');
  });
});
