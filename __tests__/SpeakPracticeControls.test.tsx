import React from 'react';
import {
  Alert,
  AppState,
  Linking,
  Text,
  View,
  type AppStateStatus,
} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import { KidIconButton } from '../src/components/KidIconButton';
import { SpeakPracticeControls } from '../src/components/SpeakPracticeControls';
import {
  playSoundEffect,
  speakTeacherPromptSegments,
  startNarrationSession,
} from '../src/engine/AudioManager';
import {
  checkVoiceRecordingPermission,
  getVoiceRecordingActivity,
  getVoiceRecordingLevel,
  requestVoiceRecordingPermission,
  startVoiceRecording,
  stopVoiceRecording,
  type VoiceActivitySnapshot,
  type VoiceRecordingSession,
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
  getVoiceRecordingActivity: jest.fn(() => Promise.resolve(null)),
  getVoiceRecordingLevel: jest.fn(() => Promise.resolve(null)),
  isVoiceRecorderAvailable: jest.fn(() => true),
  playVoiceRecording: jest.fn(() => Promise.resolve()),
  requestVoiceRecordingPermission: jest.fn(() => Promise.resolve('granted')),
  startVoiceRecording: jest.fn(() =>
    Promise.resolve({
      detector: 'levelFallback',
      sessionId: 'level-fallback-test',
      uri: 'file://kid-voice.m4a',
    }),
  ),
  stopVoiceRecording: jest.fn(() =>
    Promise.resolve({
      finalSnapshot: null,
      stopReason: 'manual',
      uri: 'file://kid-voice.m4a',
    }),
  ),
}));

const flushPromises = () => Promise.resolve();
const mockedCheckVoiceRecordingPermission =
  checkVoiceRecordingPermission as jest.MockedFunction<
    typeof checkVoiceRecordingPermission
  >;
const mockedGetVoiceRecordingLevel =
  getVoiceRecordingLevel as jest.MockedFunction<typeof getVoiceRecordingLevel>;
const mockedGetVoiceRecordingActivity =
  getVoiceRecordingActivity as jest.MockedFunction<
    typeof getVoiceRecordingActivity
  >;
const mockedStopVoiceRecording = stopVoiceRecording as jest.MockedFunction<
  typeof stopVoiceRecording
>;
const mockedRequestVoiceRecordingPermission =
  requestVoiceRecordingPermission as jest.MockedFunction<
    typeof requestVoiceRecordingPermission
  >;
const mockedStartVoiceRecording = startVoiceRecording as jest.MockedFunction<
  typeof startVoiceRecording
>;
const mockedPlaySoundEffect = playSoundEffect as jest.MockedFunction<
  typeof playSoundEffect
>;
const mockedSpeakTeacherPromptSegments =
  speakTeacherPromptSegments as jest.MockedFunction<
    typeof speakTeacherPromptSegments
  >;
const mockedStartNarrationSession =
  startNarrationSession as jest.MockedFunction<typeof startNarrationSession>;
let mockAppStateListener: ((state: AppStateStatus) => void) | null = null;
const mockRemoveAppStateListener = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockAppStateListener = null;
  jest
    .spyOn(AppState, 'addEventListener')
    .mockImplementation((eventType, listener) => {
      if (eventType === 'change') {
        mockAppStateListener = listener as (state: AppStateStatus) => void;
      }
      return { remove: mockRemoveAppStateListener };
    });
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
  mockedCheckVoiceRecordingPermission.mockResolvedValue('denied');
  mockedGetVoiceRecordingActivity.mockResolvedValue(null);
  mockedGetVoiceRecordingLevel.mockResolvedValue(null);
  mockedRequestVoiceRecordingPermission.mockResolvedValue('granted');
  mockedStartVoiceRecording.mockResolvedValue(fallbackRecordingSession);
  mockedStopVoiceRecording.mockResolvedValue({
    finalSnapshot: null,
    stopReason: 'manual',
    uri: fallbackRecordingSession.uri,
  });
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
  expect(getTextValues(tree)).toContain(
    'Micrô chưa bật. Bé có thể bật mic hoặc nghe mẫu nhé.',
  );
  const microphoneButton = findKidIconButtonByAccessibilityLabel(
    tree,
    'Bật mic để bé luyện nói',
  );
  expect(microphoneButton.props.disabled).toBe(false);
  expect(microphoneButton.props.iconBadge).toBe('warning');
  const warningBadges = tree?.root.findAllByType(View).filter(
    node => node.props.importantForAccessibility === 'no-hide-descendants',
  );
  expect(warningBadges).toHaveLength(1);
  expect(warningBadges?.[0].props.accessibilityElementsHidden).toBe(true);
  expect(getTextValues(tree)).toContain('!');
  expect(getTextValues(tree)).not.toContain('Thu lại');
  expect(findContinueButton(tree, onContinue).props.disabled).toBe(false);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('starts automatic recording without opening a redundant narration session', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SpeakPracticeControls autoStartRequestId={1} word="sun" />,
    );
    await flushPromises();
    await flushPromises();
  });

  expect(mockedStartNarrationSession).not.toHaveBeenCalled();
  expect(mockedStartVoiceRecording).toHaveBeenCalledTimes(1);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
    await flushPromises();
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
    await findByAccessibilityLabel(
      tree,
      'Bật mic để bé luyện nói',
    ).props.onPress();
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

  const blockedMicrophoneButton = findKidIconButtonByAccessibilityLabel(
    tree,
    'Nhờ ba mẹ bật mic trong Cài đặt',
  );
  expect(blockedMicrophoneButton.props.disabled).toBe(false);
  expect(blockedMicrophoneButton.props.iconBadge).toBe('alert');

  await ReactTestRenderer.act(async () => {
    await findByAccessibilityLabel(
      tree,
      'Nhờ ba mẹ bật mic trong Cài đặt',
    ).props.onPress();
    await flushPromises();
  });

  expect(Alert.alert).toHaveBeenCalledWith(
    'Bật micrô cho bé',
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
    'Nhờ ba mẹ bật mic trong Cài đặt nhé. Bé vẫn có thể nghe mẫu.',
  );
  expect(findByAccessibilityLabel(tree, 'Bé nói sun')).toBeDefined();

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('explains an unavailable microphone and keeps Continue enabled', async () => {
  mockedRequestVoiceRecordingPermission.mockResolvedValue('unavailable');
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

  expect(getTextValues(tree)).toContain(
    'Mic chưa dùng được. Bé nghe mẫu rồi tiếp tục nhé.',
  );
  const microphoneButton = findKidIconButtonByAccessibilityLabel(
    tree,
    'Mic hiện chưa sẵn sàng. Bé nghe từ mẫu rồi tiếp tục nhé.',
  );
  expect(microphoneButton.props.disabled).toBe(true);
  expect(microphoneButton.props.iconBadge).toBe('muted');
  expect(findContinueButton(tree, onContinue).props.disabled).toBe(false);
  expect(mockedStartVoiceRecording).not.toHaveBeenCalled();
  expect(Alert.alert).not.toHaveBeenCalled();
  expect(Linking.openSettings).not.toHaveBeenCalled();

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('auto-stops recording after speech followed by silence', async () => {
  jest.useFakeTimers();
  const levels = [
    0.02, 0.021, 0.019, 0.18, 0.2, 0.19, 0.025, 0.02, 0.018, 0.018, 0.016,
    0.015, 0.015,
  ];
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

  await advanceRecordingClock(1800);

  expect(mockedStopVoiceRecording).toHaveBeenCalledTimes(1);
  expect(mockedPlaySoundEffect).toHaveBeenCalledWith('yay');
  expect(mockedSpeakTeacherPromptSegments).toHaveBeenCalledWith(
    [{ language: 'vi', text: 'Cô nghe rồi! Giỏi quá!' }],
    undefined,
    expect.anything(),
  );
});

test('does not treat one fallback level impulse as speech', async () => {
  jest.useFakeTimers();
  const levels = [0.02, 0.021, 0.019, 0.35, 0.018, 0.019, 0.017];
  mockedGetVoiceRecordingLevel.mockImplementation(() =>
    Promise.resolve(levels.shift() ?? 0.018),
  );

  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(
      <SpeakPracticeControls autoStartRequestId={1} word="sun" />,
    );
    await flushPromises();
    await flushPromises();
  });

  await advanceRecordingClock(1800);

  expect(mockedStopVoiceRecording).not.toHaveBeenCalled();
  expect(mockedPlaySoundEffect).not.toHaveBeenCalledWith('yay');
});

test('uses a likely target-word match only as an early stop signal', async () => {
  jest.useFakeTimers();
  const nativeSession: VoiceRecordingSession = {
    detector: 'nativeVoiceActivity',
    sessionId: 'native-session',
    uri: 'file://native-kid-voice.m4a',
  };
  const finalSnapshot = createActivitySnapshot(nativeSession, {
    hadSpeech: true,
    phase: 'ended',
    shouldStop: true,
    stopReason: 'targetWordMatch',
    targetMatchConfidence: 0.9,
    targetMatchState: 'matched',
  });
  mockedStartVoiceRecording.mockResolvedValue(nativeSession);
  mockedGetVoiceRecordingActivity.mockResolvedValue(finalSnapshot);
  mockedStopVoiceRecording.mockResolvedValue({
    finalSnapshot,
    stopReason: 'targetWordMatch',
    uri: nativeSession.uri,
  });

  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(
      <SpeakPracticeControls autoStartRequestId={1} word="sun" />,
    );
    await flushPromises();
    await flushPromises();
  });
  await advanceRecordingClock(120);

  expect(mockedGetVoiceRecordingActivity).toHaveBeenCalledWith(nativeSession);
  expect(mockedGetVoiceRecordingLevel).not.toHaveBeenCalled();
  expect(mockedStopVoiceRecording).toHaveBeenCalledWith(
    nativeSession,
    'targetWordMatch',
  );
  expect(mockedPlaySoundEffect).toHaveBeenCalledWith('yay');
});

test('passes the target word and selected accent to native endpointing', async () => {
  jest.useFakeTimers();
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SpeakPracticeControls
        autoStartRequestId={1}
        englishAccent="en-GB"
        word="yellow sun"
      />,
    );
    await flushPromises();
    await flushPromises();
  });

  expect(mockedStartVoiceRecording).toHaveBeenCalledWith(
    expect.objectContaining({
      silenceAfterSpeechMs: 1100,
      targetLocale: 'en-GB',
      targetMatchPostRollMs: 350,
      targetText: 'yellow sun',
    }),
  );

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
    await flushPromises();
  });
});

test('does not treat a target hint as pronunciation correctness feedback', async () => {
  jest.useFakeTimers();
  const nativeSession: VoiceRecordingSession = {
    detector: 'nativeVoiceActivity',
    sessionId: 'native-unconfirmed-target-session',
    uri: 'file://native-unconfirmed-target.m4a',
  };
  const finalSnapshot = createActivitySnapshot(nativeSession, {
    hadSpeech: false,
    phase: 'ended',
    shouldStop: true,
    stopReason: 'targetWordMatch',
    targetMatchState: 'matched',
  });
  mockedStartVoiceRecording.mockResolvedValue(nativeSession);
  mockedGetVoiceRecordingActivity.mockResolvedValue(finalSnapshot);
  mockedStopVoiceRecording.mockResolvedValue({
    finalSnapshot,
    stopReason: 'targetWordMatch',
    uri: nativeSession.uri,
  });

  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(
      <SpeakPracticeControls autoStartRequestId={1} word="sun" />,
    );
    await flushPromises();
    await flushPromises();
  });
  await advanceRecordingClock(120);

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
});

test('does not celebrate a native no-speech timeout', async () => {
  jest.useFakeTimers();
  const nativeSession: VoiceRecordingSession = {
    detector: 'nativeVoiceActivity',
    sessionId: 'native-quiet-session',
    uri: 'file://native-quiet.m4a',
  };
  const finalSnapshot = createActivitySnapshot(nativeSession, {
    phase: 'ended',
    shouldStop: true,
    stopReason: 'noSpeechTimeout',
  });
  mockedStartVoiceRecording.mockResolvedValue(nativeSession);
  mockedGetVoiceRecordingActivity.mockResolvedValue(finalSnapshot);
  mockedStopVoiceRecording.mockResolvedValue({
    finalSnapshot,
    stopReason: 'noSpeechTimeout',
    uri: nativeSession.uri,
  });

  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(
      <SpeakPracticeControls autoStartRequestId={1} word="sun" />,
    );
    await flushPromises();
    await flushPromises();
  });
  await advanceRecordingClock(120);

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
    expect(textValues).toContain('Không sao, từ sau mình thử đọc cùng cô nhé.');
  } finally {
    await ReactTestRenderer.act(async () => {
      tree?.unmount();
    });
  }
});

test('does not encourage or expose playback when stopping the recorder fails', async () => {
  mockedStopVoiceRecording.mockResolvedValue({
    finalSnapshot: null,
    stopReason: 'error',
    uri: null,
  });
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SpeakPracticeControls autoStartRequestId={1} word="sun" />,
    );
    await flushPromises();
    await flushPromises();
  });

  await ReactTestRenderer.act(async () => {
    await findByAccessibilityLabel(tree, 'Dừng ghi âm').props.onPress();
    await flushPromises();
  });

  expect(mockedPlaySoundEffect).not.toHaveBeenCalledWith('yay');
  expect(mockedSpeakTeacherPromptSegments).not.toHaveBeenCalled();
  expect(findByAccessibilityLabel(tree, 'Bé nói sun')).toBeDefined();

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
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

function findKidIconButtonByAccessibilityLabel(
  tree: ReactTestRenderer.ReactTestRenderer | undefined,
  accessibilityLabel: string,
) {
  const button = tree?.root
    .findAllByType(KidIconButton)
    .find(node => node.props.accessibilityLabel === accessibilityLabel);

  if (!button) {
    throw new Error(`${accessibilityLabel} KidIconButton was not rendered`);
  }

  return button;
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

function getTextValues(tree: ReactTestRenderer.ReactTestRenderer | undefined) {
  return tree?.root.findAllByType(Text).map(node => node.props.children) ?? [];
}

test('stops a recorder that starts after the practice controls unmount', async () => {
  let finishStartingRecorder:
    | ((recordingSession: VoiceRecordingSession | null) => void)
    | undefined;
  mockedStartVoiceRecording.mockImplementationOnce(
    () =>
      new Promise<VoiceRecordingSession | null>(resolve => {
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
    finishStartingRecorder?.({
      detector: 'levelFallback',
      sessionId: 'late-session',
      uri: 'file://late-kid-voice.m4a',
    });
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

const fallbackRecordingSession: VoiceRecordingSession = {
  detector: 'levelFallback',
  sessionId: 'level-fallback-test',
  uri: 'file://kid-voice.m4a',
};

function createActivitySnapshot(
  session: VoiceRecordingSession,
  overrides: Partial<VoiceActivitySnapshot> = {},
): VoiceActivitySnapshot {
  return {
    detector: session.detector,
    elapsedMs: 1200,
    hadSpeech: false,
    phase: 'waitingForSpeech',
    sequence: 1,
    sessionId: session.sessionId,
    shouldStop: false,
    speechDurationMs: 0,
    stopReason: null,
    trailingSilenceMs: 0,
    ...overrides,
  };
}
