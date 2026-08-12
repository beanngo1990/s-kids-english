import React from 'react';
import { Alert, Switch } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';

type MockVoiceSetting = {
  consentedAt?: string;
  consentVersion?: number;
  enabled: boolean;
  updatedAt?: string;
};

const mockSaveParentSettings = jest.fn((_patch?: unknown, _options?: unknown) =>
  Promise.resolve(),
);
let mockVoiceSetting: MockVoiceSetting = { enabled: false };

jest.mock('../src/engine/ParentSettingsManager', () => ({
  VOICE_RECORDING_LIBRARY_CONSENT_VERSION: 1,
  getParentSettings: () =>
    Promise.resolve({ voiceRecordingLibrary: mockVoiceSetting }),
  saveParentSettings: (patch: unknown, options: unknown) =>
    mockSaveParentSettings(patch, options),
}));

jest.mock('../src/i18n', () => {
  const actual = jest.requireActual('../src/i18n');
  return {
    ...actual,
    useI18n: () => actual.createTranslator('vi'),
  };
});

import { ParentVoiceRecordingSettingsCard } from '../src/components/ParentVoiceRecordingSettingsCard';

async function renderCard() {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <ParentVoiceRecordingSettingsCard />,
    );
    await Promise.resolve();
  });
  return renderer!;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockVoiceSetting = { enabled: false };
});

test('requires explicit parent confirmation only before first enable', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  const renderer = await renderCard();

  const toggle = renderer.root.findByType(Switch);
  act(() => toggle.props.onValueChange(true));

  expect(mockSaveParentSettings).not.toHaveBeenCalled();
  expect(alert).toHaveBeenCalledWith(
    'Bật lưu giọng đọc của bé?',
    expect.stringContaining('không tải lên cloud'),
    expect.any(Array),
  );

  const buttons = alert.mock.calls[0]?.[2];
  await act(async () => {
    buttons?.[1]?.onPress?.();
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(mockSaveParentSettings).toHaveBeenCalledWith(
    {
      voiceRecordingLibrary: expect.objectContaining({
        consentVersion: 1,
        enabled: true,
      }),
    },
    { touchUpdatedAt: false },
  );

  alert.mockRestore();
  await act(async () => renderer.unmount());
});

test('re-enables directly after consent was already recorded', async () => {
  mockVoiceSetting = {
    consentedAt: '2026-08-11T08:00:00.000Z',
    consentVersion: 1,
    enabled: false,
  };
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  const renderer = await renderCard();

  const toggle = renderer.root.findByType(Switch);
  await act(async () => {
    toggle.props.onValueChange(true);
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(alert).not.toHaveBeenCalled();
  expect(mockSaveParentSettings).toHaveBeenCalledWith(
    {
      voiceRecordingLibrary: expect.objectContaining({
        consentedAt: '2026-08-11T08:00:00.000Z',
        consentVersion: 1,
        enabled: true,
      }),
    },
    { touchUpdatedAt: false },
  );

  alert.mockRestore();
  await act(async () => renderer.unmount());
});

test('turns off directly and retains existing recordings', async () => {
  mockVoiceSetting = {
    consentedAt: '2026-08-11T08:00:00.000Z',
    consentVersion: 1,
    enabled: true,
  };
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  const renderer = await renderCard();

  const toggle = renderer.root.findByType(Switch);
  await act(async () => {
    toggle.props.onValueChange(false);
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(alert).not.toHaveBeenCalled();
  expect(mockSaveParentSettings).toHaveBeenCalledWith(
    {
      voiceRecordingLibrary: expect.objectContaining({ enabled: false }),
    },
    { touchUpdatedAt: false },
  );

  alert.mockRestore();
  await act(async () => renderer.unmount());
});

test('shows local-only details from the information icon', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  const renderer = await renderCard();

  const infoAction = renderer.root.findByProps({
    accessibilityLabel: 'Xem thông tin về tự động lưu giọng đọc',
  });
  act(() => infoAction.props.onPress());

  expect(alert).toHaveBeenCalledWith(
    'Chỉ lưu trên thiết bị',
    expect.stringContaining('không tải lên cloud'),
    [{ text: 'Đóng' }],
  );

  alert.mockRestore();
  await act(async () => renderer.unmount());
});
