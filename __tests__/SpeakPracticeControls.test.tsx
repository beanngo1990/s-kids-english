import React from 'react';
import {
  Alert,
  AppState,
  Linking,
  Text,
  type AppStateStatus,
} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import { KidIconButton } from '../src/components/KidIconButton';
import { SpeakPracticeControls } from '../src/components/SpeakPracticeControls';
import {
  playSoundEffect,
  speakTeacherPromptSegments,
} from '../src/engine/AudioManager';
import {
  checkVoiceRecordingPermission,
  getVoiceRecordingLevel,
  requestVoiceRecordingPermission,
  startVoiceRecording,
  stopVoiceRecording,
} from '../src/engine/VoiceRecorder';

jest.mock('../src/engine/AudioManager', () => ({
  playSoundEffect: jest.fn(() => Promise.resolve()),
  playTapSound: jest.fn(() => Promise.resolve()),
  speakTeacherPromptSegments: jest.fn(() => Promise.resolve()),
  speakVi: jest.fn(() => Promise.resolve()),
  speakWord: jest.fn(() => Promise.resolve()),
  startNarrationSession: jest.fn(() => ({
    isActive: () => true,
    ready: Promise.resolve(),
  })),
}));

jest.mock('../src/engine/VoiceRecorder', () => ({
  checkVoiceRecordingPermission: jest.fn(() => Promise.resolve('denied')),
  getVoiceRecordingLevel: jest.fn(() => Promise.resolve(null)),
  isVoiceRecorderAvailable: jest.fn(() => true),
  playVoiceRecording: jest.fn(() => Promise.resolve()),
  requestVoiceRecordingPermission: jest.fn(() => Promise.resolve('granted')),
  startVoiceRecording: jest.fn(() => Promise.resolve('file://kid-voice.m4a')),
  stopVoiceRecording: jest.fn(() => Promise.resolve('file://kid-voice.m4a')),
}));

const flushPromises = () => Promise.resolve();
const mockedCheckVoiceRecordingPermission =
  checkVoiceRecordingPermission as jest.MockedFunction<
    typeof checkVoiceRecordingPermission
  >;
const mockedGetVoiceRecordingLevel =
  getVoiceRecordingLevel as jest.MockedFunction<typeof getVoiceRecordingLevel>;
const mockedStopVoiceRecording =
  stopVoiceRecording as jest.MockedFunction<typeof stopVoiceRecording>;
const mockedRequestVoiceRecordingPermission =
  requestVoiceRecordingPermission as jest.MockedFunction<
    typeof requestVoiceRecordingPermission
  >;
const mockedStartVoiceRecording =
  startVoiceRecording as jest.MockedFunction<typeof startVoiceRecording>;
const mockedPlaySoundEffect =
  playSoundEffect as jest.MockedFunction<typeof playSoundEffect>;
const mockedSpeakTeacherPromptSegments =
  speakTeacherPromptSegments as jest.MockedFunction<
    typeof speakTeacherPromptSegments
  >;
let mockAppStateListener: ((state: AppStateStatus) => void) | null = null;
const mockRemoveAppStateListener = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockAppStateListener = null;
  jest.spyOn(AppState, 'addEventListener').mockImplementation(
    (eventType, listener) => {
      if (eventType === 'change') {
        mockAppStateListener = listener as (state: AppStateStatus) => void;
      }
      return { remove: mockRemoveAppStateListener };
    },
  );
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
  mockedCheckVoiceRecordingPermission.mockResolvedValue('denied');
  mockedGetVoiceRecordingLevel.mockResolvedValue(null);
  mockedRequestVoiceRecordingPermission.mockResolvedValue('granted');
  mockedStartVoiceRecording.mockResolvedValue('file://kid-voice.m4a');
  mockedStopVoiceRecording.mockResolvedValue('file://kid-voice.m4a');
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('shows audio preparation separately from active speech', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SpeakPracticeControls isInstructionPreparing word="jacket" />,
    );
    await flushPromises();
  });

  const textValues =
    tree?.root.findAllByType(Text).map(node => node.props.children) ?? [];
  expect(textValues).toContain('Đang chuẩn bị giọng cô...');
  expect(textValues).not.toContain('Cô đang nói...');

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('keeps the lesson available when an automatic microphone request is denied', async () => {
  mockedRequestVoiceRecordingPermission.mockResolvedValue('denied');
  const onContinue = jest.fn();
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SpeakPracticeControls
        autoStartRequestId={1}
        onContinue={onContinue}
        word="sun"
      />,
    );
    await flushPromises();
    await flushPromises();
  });

  expect(mockedRequestVoiceRecordingPermission).toHaveBeenCalledWith(
    expect.any(Object),
    { source: 'automatic' },
  );
  expect(mockedStartVoiceRecording).not.toHaveBeenCalled();
  expect(Alert.alert).not.toHaveBeenCalled();
  expect(getTextValues(tree)).toContain('Cần cấp quyền Micro. Từ này đọc là:');
  expect(findContinueButton(tree, onContinue).props.disabled).toBe(false);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('does not send a simple microphone denial to Settings', async () => {
  mockedRequestVoiceRecordingPermission.mockResolvedValue('denied');
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SpeakPracticeControls autoStartRequestId={1} word="sun" />,
    );
    await flushPromises();
    await flushPromises();
  });

  await ReactTestRenderer.act(async () => {
    await findByAccessibilityLabel(tree, 'Thu âm lại').props.onPress();
    await flushPromises();
  });

  expect(mockedRequestVoiceRecordingPermission).toHaveBeenLastCalledWith(
    expect.any(Object),
    { source: 'manual' },
  );
  expect(Alert.alert).not.toHaveBeenCalled();
  expect(Linking.openSettings).not.toHaveBeenCalled();

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('opens Settings only when microphone permission is blocked and refreshes on return', async () => {
  mockedRequestVoiceRecordingPermission.mockResolvedValue('blocked');
  mockedCheckVoiceRecordingPermission.mockResolvedValue('granted');
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SpeakPracticeControls autoStartRequestId={1} word="sun" />,
    );
    await flushPromises();
    await flushPromises();
  });

  await ReactTestRenderer.act(async () => {
    await findByAccessibilityLabel(tree, 'Thu âm lại').props.onPress();
    await flushPromises();
  });

  expect(Alert.alert).toHaveBeenCalledWith(
    'Quyền truy cập Micro',
    expect.any(String),
    expect.any(Array),
  );

  const openSettingsButton = getLastPermissionAlertButtons().find(
    button => button.text === 'Mở Cài đặt',
  );
  expect(openSettingsButton).toBeDefined();
  await ReactTestRenderer.act(async () => {
    openSettingsButton?.onPress?.();
    await flushPromises();
  });
  expect(Linking.openSettings).toHaveBeenCalledTimes(1);

  await ReactTestRenderer.act(async () => {
    mockAppStateListener?.('background');
    mockAppStateListener?.('active');
    await flushPromises();
    await flushPromises();
  });

  expect(mockedCheckVoiceRecordingPermission).toHaveBeenCalledTimes(1);
  expect(getTextValues(tree)).not.toContain(
    'Cần cấp quyền Micro. Từ này đọc là:',
  );
  expect(findByAccessibilityLabel(tree, 'Bé nói sun')).toBeDefined();

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('auto-stops recording after speech followed by silence', async () => {
  jest.useFakeTimers();
  const levels = [0.02, 0.18, 0.2, 0.025, 0.02, 0.018, 0.018, 0.016, 0.015];
  mockedGetVoiceRecordingLevel.mockImplementation(() =>
    Promise.resolve(levels.shift() ?? 0.015),
  );

  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(
      <SpeakPracticeControls autoStartRequestId={1} word="sun" />,
    );
    await flushPromises();
    await flushPromises();
  });

  expect(mockedStopVoiceRecording).not.toHaveBeenCalled();

  await advanceRecordingClock(1500);

  expect(mockedStopVoiceRecording).toHaveBeenCalledTimes(1);
  expect(mockedPlaySoundEffect).toHaveBeenCalledWith('yay');
  expect(mockedSpeakTeacherPromptSegments).toHaveBeenCalledWith(
    [{ language: 'vi', text: 'Cô nghe rồi! Giỏi quá!' }],
    undefined,
    expect.anything(),
  );
});

test('falls back to a max recording window when voice levels are unavailable', async () => {
  jest.useFakeTimers();
  mockedGetVoiceRecordingLevel.mockResolvedValue(null);

  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(
      <SpeakPracticeControls autoStartRequestId={1} word="sun" />,
    );
    await flushPromises();
    await flushPromises();
  });

  await advanceRecordingClock(5100);
  expect(mockedStopVoiceRecording).not.toHaveBeenCalled();

  await advanceRecordingClock(120);
  expect(mockedStopVoiceRecording).toHaveBeenCalledTimes(1);
});

test('keeps lesson controls busy until recording encouragement finishes', async () => {
  jest.useFakeTimers();
  let finishEncouragement: (() => void) | undefined;
  mockedSpeakTeacherPromptSegments.mockImplementationOnce(
    () =>
      new Promise<void>(resolve => {
        finishEncouragement = resolve;
      }),
  );
  const onBusyChange = jest.fn();
  const onContinue = jest.fn();
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SpeakPracticeControls
        autoStartRequestId={1}
        onBusyChange={onBusyChange}
        onContinue={onContinue}
        word="sun"
      />,
    );
    await flushPromises();
    await flushPromises();
  });

  await advanceRecordingClock(5280);

  expect(mockedSpeakTeacherPromptSegments).toHaveBeenCalledTimes(1);
  expect(onBusyChange).toHaveBeenLastCalledWith(true);
  expect(findContinueButton(tree, onContinue).props.disabled).toBe(true);

  await ReactTestRenderer.act(async () => {
    finishEncouragement?.();
    await flushPromises();
    await flushPromises();
  });

  expect(onBusyChange).toHaveBeenLastCalledWith(false);
  expect(findContinueButton(tree, onContinue).props.disabled).toBe(false);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('uses a try-next prompt when stopping without detected speech', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  try {
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <SpeakPracticeControls autoStartRequestId={1} word="sun" />,
      );
      await flushPromises();
      await flushPromises();
      await flushPromises();
    });

    const stopButton = findByAccessibilityLabel(tree, 'Dừng ghi âm');

    await ReactTestRenderer.act(async () => {
      await stopButton.props.onPress();
      await flushPromises();
      await flushPromises();
    });

    expect(mockedPlaySoundEffect).not.toHaveBeenCalledWith('yay');
    expect(mockedSpeakTeacherPromptSegments).toHaveBeenCalledWith(
      [
        {
          language: 'vi',
          text: 'Không sao, từ sau mình thử đọc cùng cô nhé.',
        },
      ],
      undefined,
      expect.anything(),
    );

    const textValues =
      tree?.root.findAllByType(Text).map(node => node.props.children) ?? [];
    expect(textValues).toContain(
      'Không sao, từ sau mình thử đọc cùng cô nhé.',
    );
  } finally {
    await ReactTestRenderer.act(async () => {
      tree?.unmount();
    });
  }
});

function findByAccessibilityLabel(
  tree: ReactTestRenderer.ReactTestRenderer | undefined,
  accessibilityLabel: string,
) {
  const node = tree?.root.findAll(
    candidate => candidate.props.accessibilityLabel === accessibilityLabel,
  )[0];

  if (!node) {
    throw new Error(`${accessibilityLabel} button was not rendered`);
  }

  return node;
}

type PermissionAlertButton = {
  onPress?: () => void;
  text?: string;
};

function getLastPermissionAlertButtons() {
  const lastAlertCall = (
    Alert.alert as jest.MockedFunction<typeof Alert.alert>
  ).mock.calls.at(-1);
  expect(lastAlertCall).toBeDefined();
  return (lastAlertCall?.[2] ?? []) as PermissionAlertButton[];
}

function getTextValues(
  tree: ReactTestRenderer.ReactTestRenderer | undefined,
) {
  return tree?.root.findAllByType(Text).map(node => node.props.children) ?? [];
}

test('stops a recorder that starts after the practice controls unmount', async () => {
  let finishStartingRecorder:
    | ((recordingUri: string | null) => void)
    | undefined;
  mockedStartVoiceRecording.mockImplementationOnce(
    () =>
      new Promise<string | null>(resolve => {
        finishStartingRecorder = resolve;
      }),
  );
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SpeakPracticeControls autoStartRequestId={1} word="sun" />,
    );
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });
  expect(mockedStartVoiceRecording).toHaveBeenCalledTimes(1);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
  expect(mockedStopVoiceRecording).not.toHaveBeenCalled();
  await ReactTestRenderer.act(async () => {
    finishStartingRecorder?.('file://late-kid-voice.m4a');
    await flushPromises();
    await flushPromises();
  });

  expect(mockedStopVoiceRecording).toHaveBeenCalledTimes(1);
});

function findContinueButton(
  tree: ReactTestRenderer.ReactTestRenderer | undefined,
  onContinue: () => void,
) {
  const button = tree?.root
    .findAllByType(KidIconButton)
    .find(node => node.props.onPress === onContinue);

  if (!button) {
    throw new Error('Continue button was not rendered');
  }

  return button;
}

async function advanceRecordingClock(durationMs: number) {
  const stepCount = Math.ceil(durationMs / 120);

  for (let index = 0; index < stepCount; index += 1) {
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(120);
      await flushPromises();
      await flushPromises();
    });
  }
}
