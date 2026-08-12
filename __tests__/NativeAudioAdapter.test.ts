jest.mock('react-native', () => ({
  NativeModules: {
    SkidsAudio: {
      play: jest.fn(() => Promise.resolve(true)),
      playUri: jest.fn(() => Promise.resolve(true)),
      speak: jest.fn(() => Promise.resolve(true)),
      stopSpeech: jest.fn(() => Promise.resolve(true)),
    },
  },
}));

jest.mock('../src/engine/AudioManager', () => ({
  configureAudioManager: jest.fn(),
}));

import { NativeModules } from 'react-native';

import {
  configureAudioManager,
  type AudioAdapter,
} from '../src/engine/AudioManager';
import { configureNativeAudioAdapter } from '../src/engine/NativeAudioAdapter';

const mockedConfigureAudioManager =
  configureAudioManager as jest.MockedFunction<typeof configureAudioManager>;
const mockedNativeAudio = NativeModules.SkidsAudio as {
  speak: jest.Mock;
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('bridges fallback speech options to the native audio module', async () => {
  configureNativeAudioAdapter();

  const configuredAdapter = mockedConfigureAudioManager.mock
    .calls[0][0] as AudioAdapter;
  await configuredAdapter.speak?.('water', {
    language: 'en-GB',
    pitch: 1,
    rate: 0.9,
  });

  expect(mockedNativeAudio.speak).toHaveBeenCalledWith(
    'water',
    'en-GB',
    1,
    0.9,
  );
});

test('rejects speech fallback when the native engine cannot speak', async () => {
  mockedNativeAudio.speak.mockResolvedValueOnce(false);
  configureNativeAudioAdapter();

  const configuredAdapter = mockedConfigureAudioManager.mock
    .calls[0][0] as AudioAdapter;

  await expect(
    configuredAdapter.speak?.('water', {
      language: 'en-US',
      pitch: 1,
      rate: 0.9,
    }),
  ).rejects.toThrow('Unable to speak text with locale: en-US');
});
