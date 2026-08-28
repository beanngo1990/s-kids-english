import React from 'react';
import { Switch } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';

const mockSyncSnapshot = {
  hasStoredConsent: false,
  isEnabledForCurrentAccount: false,
  isReady: true,
  status: 'disabled' as const,
};

jest.mock('../src/engine/CloudProgressSyncManager', () => ({
  disableAndDeleteCloudProgress: jest.fn(),
  disableCloudProgressSync: jest.fn(),
  enableCloudProgressSync: jest.fn(),
  getCloudProgressSyncErrorCode: jest.fn(() => 'unknown'),
  initialCloudProgressSyncSnapshot: {
    hasStoredConsent: false,
    isEnabledForCurrentAccount: false,
    isReady: false,
    status: 'loading',
  },
  retryCloudProgressSync: jest.fn(),
  subscribeCloudProgressSync: jest.fn(listener => {
    listener(mockSyncSnapshot);
    return jest.fn();
  }),
}));

jest.mock('../src/i18n', () => {
  const actual = jest.requireActual('../src/i18n');
  return {
    ...actual,
    useI18n: () => actual.createTranslator('vi'),
  };
});

import { ParentCloudSyncSection } from '../src/components/ParentCloudSyncSection';

test('compact cloud sync shows status instead of repeating the long description', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <ParentCloudSyncSection
        compact
        firebaseConfigMissing={false}
        isAccountBusy={false}
        isSignedIn
      />,
    );
  });

  const renderedText = getChildText(tree!.toJSON());
  expect(renderedText).toContain(
    'Đang tắt. Dữ liệu học chỉ lưu trên thiết bị.',
  );
  expect(renderedText).not.toContain(
    'Lưu bản sao tiến độ và cài đặt vào tài khoản ba mẹ',
  );
  expect(tree!.root.findByType(Switch).props.value).toBe(false);

  await act(async () => tree!.unmount());
});

function getChildText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(getChildText).join('');
  }
  if (value && typeof value === 'object' && 'children' in value) {
    return getChildText((value as { children?: unknown }).children);
  }
  return '';
}
