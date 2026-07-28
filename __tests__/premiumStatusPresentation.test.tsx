import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import { PremiumLessonLockIndicator } from '../src/components/PremiumLessonLockIndicator';
import { PremiumStatusCard } from '../src/components/PremiumStatusCard';
import { PremiumUpgradeCard } from '../src/components/PremiumUpgradeCard';
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

test.each<MonetizationStatus>(['initializing', 'premium'])(
  'does not render the Premium teaser for %s status',
  async status => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <PremiumUpgradeCard
          onPress={jest.fn()}
          snapshot={{ status }}
        />,
      );
    });

    expect(tree?.toJSON()).toBeNull();

    await ReactTestRenderer.act(async () => {
      tree?.unmount();
    });
  },
);

test.each<MonetizationStatus>(['signedOut', 'free', 'unavailable'])(
  'shows the Premium teaser for %s status and opens Premium details',
  async status => {
    const onPress = jest.fn();
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <PremiumUpgradeCard
          onPress={onPress}
          snapshot={{ status }}
        />,
      );
    });

    const textValues = getRenderedText(tree);
    expect(textValues).toContain('Mở khóa toàn bộ bài học Premium');
    expect(textValues).toContain('Toàn bộ bài học');
    expect(textValues).toContain('Ôn tập không giới hạn');
    expect(textValues).toContain('Xem gói Premium');

    tree?.root
      .find(node => node.props.accessibilityRole === 'button')
      .props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);

    await ReactTestRenderer.act(async () => {
      tree?.unmount();
    });
  },
);

test('shows a compact Premium unlock affordance for locked lesson rows', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<PremiumLessonLockIndicator />);
  });

  expect(getRenderedText(tree)).toEqual(
    expect.arrayContaining(['Mở khóa Premium', '→']),
  );

  await ReactTestRenderer.act(async () => {
    tree?.update(<PremiumLessonLockIndicator compact />);
  });

  const compactTextValues = getRenderedText(tree);
  expect(compactTextValues).toEqual(expect.arrayContaining(['Premium', '→']));
  expect(compactTextValues).not.toContain('Mở khóa Premium');

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
  expect(getPremiumProductTypeTitle(t, undefined)).toBe('Sungy Premium');
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
