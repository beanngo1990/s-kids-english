import React from 'react';
import { Alert } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';

jest.mock('../src/components/ParentCloudSyncSection', () => ({
  ParentCloudSyncSection: () => null,
  getCloudSyncErrorMessage: jest.fn(() => 'Cloud sync error'),
}));

jest.mock('../src/engine/CloudProgressSyncManager', () => ({
  CloudProgressSyncError: class CloudProgressSyncError extends Error {
    readonly code = 'unknown';
  },
}));

jest.mock('../src/engine/MonetizationManager', () => ({
  useMonetizationSnapshot: () => ({ status: 'free' }),
}));

jest.mock('../src/engine/ParentAccessSession', () => ({
  setParentExternalFlowActive: jest.fn(),
}));

jest.mock('../src/engine/ParentAuthManager', () => ({
  getParentAuthErrorCode: jest.fn(() => 'unknown'),
  getParentAuthProviders: jest.fn(() => ['google']),
  initialParentAuthSnapshot: { isReady: false, user: null },
  isAppleSignInAvailable: jest.fn(() => false),
  isGoogleSignInConfigured: jest.fn(() => true),
  signInParentWithApple: jest.fn(),
  signInParentWithGoogle: jest.fn(),
  signOutParent: jest.fn(() => Promise.resolve()),
  subscribeParentAuth: jest.fn(listener => {
    listener({
      isReady: true,
      user: {
        email: 'parent@example.com',
        providerIds: ['google.com'],
        uid: 'parent-a',
      },
    });
    return jest.fn();
  }),
}));

jest.mock('../src/services/LocalAccountDataDeletion', () => ({
  deleteLocalAccountData: jest.fn(() => Promise.resolve()),
}));

jest.mock('../src/services/RevenueCatDataDeletion', () => ({
  deleteCurrentParentAccountData: jest.fn(),
}));

import { signOutParent } from '../src/engine/ParentAuthManager';
import { ParentAccountCard } from '../src/components/ParentAccountCard';
import { deleteLocalAccountData } from '../src/services/LocalAccountDataDeletion';

type AlertButton = {
  onPress?: () => Promise<void> | void;
  text?: string;
};

const mockSignOutParent = signOutParent as jest.MockedFunction<
  typeof signOutParent
>;
const mockDeleteLocalAccountData =
  deleteLocalAccountData as jest.MockedFunction<typeof deleteLocalAccountData>;

describe('ParentAccountCard sign-out choices', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSignOutParent.mockResolvedValue(undefined);
    mockDeleteLocalAccountData.mockResolvedValue(undefined);
    alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  test('shows a compact signed-in summary without the sign-in heading', async () => {
    const tree = await renderCard(true);

    expect(getChildText(tree.toJSON())).toContain('parent@example.com');
    expect(getChildText(tree.toJSON())).toContain('Đăng nhập bằng Google');
    expect(getChildText(tree.toJSON())).not.toContain(
      'Đăng nhập tài khoản ba mẹ',
    );
    expect(findButtonByText(tree, 'Đăng xuất')).toBeDefined();

    await act(async () => {
      tree.unmount();
    });
  });

  test('signs out without clearing local data when parent chooses to keep data', async () => {
    const tree = await renderCard();

    await act(async () => {
      findButtonByText(tree, 'Đăng xuất').props.onPress();
    });

    const buttons = getLastAlertButtons();
    await act(async () => {
      await buttons.find(
        button => button.text === 'Đăng xuất, giữ dữ liệu',
      )?.onPress?.();
    });

    expect(mockSignOutParent).toHaveBeenCalledTimes(1);
    expect(mockDeleteLocalAccountData).not.toHaveBeenCalled();

    await act(async () => {
      tree.unmount();
    });
  });

  test('clears local data after sign-out when parent chooses cleanup', async () => {
    const events: string[] = [];
    mockSignOutParent.mockImplementation(async () => {
      events.push('signOut');
    });
    mockDeleteLocalAccountData.mockImplementation(async () => {
      events.push('deleteLocal');
    });
    const tree = await renderCard();

    await act(async () => {
      findButtonByText(tree, 'Đăng xuất').props.onPress();
    });

    const buttons = getLastAlertButtons();
    await act(async () => {
      await buttons.find(
        button => button.text === 'Đăng xuất và xoá dữ liệu local',
      )?.onPress?.();
    });

    expect(events).toEqual(['signOut', 'deleteLocal']);
    expect(mockSignOutParent).toHaveBeenCalledTimes(1);
    expect(mockDeleteLocalAccountData).toHaveBeenCalledTimes(1);

    await act(async () => {
      tree.unmount();
    });
  });
});

async function renderCard(compact = false) {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await act(async () => {
    tree = ReactTestRenderer.create(<ParentAccountCard compact={compact} />);
  });
  return tree!;
}

function findButtonByText(
  tree: ReactTestRenderer.ReactTestRenderer,
  label: string,
) {
  return tree.root.find(
    node =>
      node.props.accessibilityRole === 'button' &&
      getChildText(node.props.children).includes(label),
  );
}

function getLastAlertButtons() {
  const buttons = alertSpyLastCall()[2] as AlertButton[] | undefined;
  expect(buttons).toBeDefined();
  return buttons ?? [];
}

function alertSpyLastCall() {
  const call = alertMock().mock.calls.at(-1);
  expect(call).toBeDefined();
  return call!;
}

function alertMock() {
  return Alert.alert as jest.MockedFunction<typeof Alert.alert>;
}

function getChildText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(getChildText).join('');
  }
  if (React.isValidElement(value)) {
    return getChildText(
      (value.props as { children?: unknown } | undefined)?.children,
    );
  }
  if (value && typeof value === 'object' && 'children' in value) {
    return getChildText((value as { children?: unknown }).children);
  }
  return '';
}
