import React from 'react';
import { Pressable, Text } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';

const mockPackages = [
  {
    currencyCode: 'USD',
    description: 'Monthly Premium',
    identifier: 'monthly',
    packageType: 'monthly' as const,
    price: 9.99,
    priceString: '$9.99',
    subscriptionPeriod: 'P1M',
    title: 'Monthly',
  },
  {
    currencyCode: 'USD',
    description: 'Annual Premium',
    identifier: 'annual',
    packageType: 'annual' as const,
    price: 79.98,
    priceString: '$79.98',
    subscriptionPeriod: 'P1Y',
    title: 'Annual',
  },
];

let mockMonetizationSnapshot = createMonetizationSnapshot(true);
const mockReplace = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('../src/components/Screen', () => {
  const ReactModule = jest.requireActual<typeof React>('react');
  const ReactNative =
    jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Screen: ({ children }: { children: React.ReactNode }) =>
      ReactModule.createElement(ReactNative.View, null, children),
  };
});

jest.mock('../src/engine/MonetizationManager', () => ({
  getMonetizationSnapshot: () => mockMonetizationSnapshot,
  purchaseMonetizationPackage: jest.fn(),
  refreshMonetization: jest.fn(() => Promise.resolve()),
  restoreMonetizationPurchases: jest.fn(),
  useMonetizationSnapshot: () => mockMonetizationSnapshot,
}));

jest.mock('../src/engine/ParentAuthManager', () => ({
  getParentAuthErrorCode: jest.fn(() => 'unknown'),
  isAppleSignInAvailable: jest.fn(() => false),
  isGoogleSignInConfigured: jest.fn(() => true),
  signInParentWithApple: jest.fn(() => Promise.resolve()),
  signInParentWithGoogle: jest.fn(() => Promise.resolve()),
}));

jest.mock('../src/engine/ParentAccessSession', () => ({
  setParentExternalFlowActive: jest.fn(),
  useParentAccessSnapshot: () => ({ isGranted: true }),
}));

jest.mock('../src/i18n', () => {
  const actual = jest.requireActual('../src/i18n');
  return {
    ...actual,
    useSavedAppLanguage: () => 'vi',
    useTranslations: () => actual.createTranslator('vi'),
  };
});

jest.mock('../src/services/RemoteMonetizationConfig', () => ({
  refreshRemoteMonetizationConfig: jest.fn(() => Promise.resolve()),
  subscribeRemoteMonetizationConfigUpdates: jest.fn(() => jest.fn()),
  useRemoteMonetizationConfig: () => ({ premiumPurchaseEnabled: true }),
}));

import { PremiumScreen } from '../src/screens/PremiumScreen';

beforeEach(() => {
  jest.clearAllMocks();
  mockMonetizationSnapshot = createMonetizationSnapshot(true);
});

test('prioritizes the free Founder year and keeps paid plans collapsed', async () => {
  const renderer = await renderScreen();
  const textValues = getRenderedText(renderer);

  expect(textValues).toEqual(
    expect.arrayContaining([
      'Nhận 1 năm Sungy Premium miễn phí',
      '0đ',
      '365 ngày Premium',
      'Không cần thẻ',
      'Không tự động gia hạn',
      'Không phát sinh phí',
      'Đăng nhập Google để nhận quà',
      'Xem các gói trả phí',
    ]),
  );
  expect(textValues).not.toContain('Chọn gói phù hợp');
  expect(textValues).not.toContain('$79.98');
  expect(textValues).not.toContain('Tài khoản phụ huynh tùy chọn');
  expect(
    textValues.filter(value => value === 'Đăng nhập Google để nhận quà'),
  ).toHaveLength(1);

  expect(textValues.indexOf('Nhận 1 năm Sungy Premium miễn phí')).toBeLessThan(
    textValues.indexOf('Toàn bộ lộ trình học'),
  );
  expect(textValues.indexOf('Toàn bộ lộ trình học')).toBeLessThan(
    textValues.indexOf('Xem các gói trả phí'),
  );

  await act(async () => renderer.unmount());
});

test('reveals paid plans only on request without duplicating optional sign-in', async () => {
  const renderer = await renderScreen();
  const paidPlansAction = renderer.root.findByProps({
    accessibilityLabel: 'Xem các gói trả phí',
  });

  act(() => paidPlansAction.props.onPress());

  const textValues = getRenderedText(renderer);
  expect(textValues).toEqual(
    expect.arrayContaining(['Chọn gói phù hợp', '$79.98', 'Gói đang chọn']),
  );
  expect(textValues).not.toContain('Tài khoản phụ huynh tùy chọn');
  expect(
    renderer.root.findByProps({
      accessibilityLabel: 'Ẩn các gói trả phí',
    }).props.accessibilityState,
  ).toEqual({ expanded: true });

  await act(async () => renderer.unmount());
});

test('keeps the regular purchase flow prominent when Founder is unavailable', async () => {
  mockMonetizationSnapshot = createMonetizationSnapshot(false);
  const renderer = await renderScreen();
  const textValues = getRenderedText(renderer);

  expect(textValues).toEqual(
    expect.arrayContaining([
      'Chọn gói phù hợp',
      '$79.98',
      'Tài khoản phụ huynh tùy chọn',
    ]),
  );
  expect(textValues).not.toContain('Nhận 1 năm Sungy Premium miễn phí');
  expect(
    renderer.root
      .findAllByType(Pressable)
      .some(node => node.props.accessibilityLabel === 'Xem các gói trả phí'),
  ).toBe(false);

  await act(async () => renderer.unmount());
});

async function renderScreen() {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <PremiumScreen
        navigation={
          {
            goBack: mockGoBack,
            replace: mockReplace,
          } as never
        }
        route={{ key: 'premium', name: 'Premium' }}
      />,
    );
    await Promise.resolve();
  });
  return renderer!;
}

function createMonetizationSnapshot(founderAccessActive: boolean) {
  return {
    founderAccessActive,
    isAuthReady: true,
    isConfigured: true,
    isSignedIn: false,
    packages: mockPackages,
    pendingAction: null,
    status: 'signedOut' as const,
    willRenew: false,
  };
}

function getRenderedText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAllByType(Text)
    .map(node => flattenText(node.props.children));
}

function flattenText(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(flattenText).join('');
  }
  if (typeof value === 'number' || typeof value === 'string') {
    return String(value);
  }
  return '';
}
