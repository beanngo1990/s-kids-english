import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import { PremiumStatusCard } from '../src/components/PremiumStatusCard';
import type { MonetizationStatus } from '../src/engine/MonetizationManager';
import { createTranslator } from '../src/i18n';
import {
  formatPremiumExpirationDate,
  getPremiumProductTypeTitle,
  getPremiumStatusDetailLines,
} from '../src/utils/premiumStatus';

test.each<MonetizationStatus>([
  'initializing',
  'signedOut',
  'free',
  'unavailable',
])('does not render a parent status card for %s status', async status => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <PremiumStatusCard
        onPress={jest.fn()}
        snapshot={{ status }}
      />,
    );
  });

  expect(tree?.toJSON()).toBeNull();

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('shows a compact Founder Premium status and opens the Premium screen action', async () => {
  const onPress = jest.fn();
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <PremiumStatusCard
        onPress={onPress}
        snapshot={{
          activeProductType: 'founder',
          status: 'premium',
        }}
      />,
    );
  });

  const textValues = getRenderedText(tree);
  expect(textValues).toContain('Premium đang hoạt động');
  expect(textValues).toContain('Premium quà tặng 1 năm');
  expect(textValues).not.toContain('Gói sẽ không tự động gia hạn.');
  expect(textValues).not.toContain('Xem chi tiết Premium');
  expect(textValues.some(value => value.startsWith('Có hiệu lực đến '))).toBe(
    false,
  );

  tree?.root
    .find(node => node.props.accessibilityRole === 'button')
    .props.onPress();
  expect(onPress).toHaveBeenCalledTimes(1);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('shows compact lifetime access without expiry or renewal copy', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <PremiumStatusCard
        onPress={jest.fn()}
        snapshot={{
          activeProductType: 'lifetime',
          status: 'premium',
        }}
      />,
    );
  });

  const textValues = getRenderedText(tree);
  expect(textValues).toContain('Premium trọn đời');
  expect(textValues).not.toContain('Quyền Premium này không hết hạn.');
  expect(textValues).not.toContain('Gói sẽ không tự động gia hạn.');
  expect(textValues.some(value => value.startsWith('Có hiệu lực đến '))).toBe(
    false,
  );

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('shares product labels and safely formats localized expiration details', () => {
  const t = createTranslator('vi');

  expect(getPremiumProductTypeTitle(t, 'monthly')).toBe(
    'Gói Premium theo tháng',
  );
  expect(getPremiumProductTypeTitle(t, 'annual')).toBe('Gói Premium theo năm');
  expect(getPremiumProductTypeTitle(t, 'founder')).toBe(
    'Premium quà tặng 1 năm',
  );
  expect(getPremiumProductTypeTitle(t, 'promotional')).toBe(
    'Premium được tặng',
  );
  expect(getPremiumProductTypeTitle(t, undefined)).toBe('S-Kids Premium');
  expect(formatPremiumExpirationDate('not-a-date', 'vi')).toBe('');
  expect(formatPremiumExpirationDate('2027-07-18T12:00:00.000Z', 'vi')).toBe(
    '18/7/2027',
  );
  expect(formatPremiumExpirationDate('2027-07-18T12:00:00.000Z', 'en')).toBe(
    '7/18/2027',
  );
  expect(
    getPremiumStatusDetailLines(
      t,
      {
        expirationDate: '2027-07-18T12:00:00.000Z',
        productType: 'annual',
        willRenew: true,
      },
      'vi',
    ),
  ).toEqual([
    'Có hiệu lực đến 18/7/2027',
    'Gói sẽ tự động gia hạn theo điều khoản của cửa hàng.',
  ]);
});

function getRenderedText(
  tree: ReactTestRenderer.ReactTestRenderer | undefined,
) {
  return (
    tree?.root
      .findAllByType(Text)
      .map(node => flattenText(node.props.children)) ?? []
  );
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
