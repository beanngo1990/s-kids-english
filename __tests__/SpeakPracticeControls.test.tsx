import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { SpeakPracticeControls } from '../src/components/SpeakPracticeControls';
import {
  getVoiceRecordingLevel,
  stopVoiceRecording,
} from '../src/engine/VoiceRecorder';

jest.mock('../src/engine/AudioManager', () => ({
  playSoundEffect: jest.fn(() => Promise.resolve()),
  playTapSound: jest.fn(() => Promise.resolve()),
  speakVi: jest.fn(() => Promise.resolve()),
  speakWord: jest.fn(() => Promise.resolve()),
}));

jest.mock('../src/engine/VoiceRecorder', () => ({
  getVoiceRecordingLevel: jest.fn(() => Promise.resolve(null)),
  isVoiceRecorderAvailable: jest.fn(() => true),
  playVoiceRecording: jest.fn(() => Promise.resolve()),
  requestVoiceRecordingPermission: jest.fn(() => Promise.resolve(true)),
  startVoiceRecording: jest.fn(() => Promise.resolve('file://kid-voice.m4a')),
  stopVoiceRecording: jest.fn(() => Promise.resolve('file://kid-voice.m4a')),
}));

const flushPromises = () => Promise.resolve();
const mockedGetVoiceRecordingLevel =
  getVoiceRecordingLevel as jest.MockedFunction<typeof getVoiceRecordingLevel>;
const mockedStopVoiceRecording =
  stopVoiceRecording as jest.MockedFunction<typeof stopVoiceRecording>;

beforeEach(() => {
  jest.clearAllMocks();
  mockedGetVoiceRecordingLevel.mockResolvedValue(null);
});

afterEach(() => {
  jest.useRealTimers();
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
