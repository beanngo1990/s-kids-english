import {
  advanceVoiceEndpoint,
  classifyVoiceLevel,
  createLevelVoiceClassifierState,
  createVoiceEndpointState,
  type VoiceEndpointOptions,
  type VoiceEndpointState,
} from '../src/engine/VoiceEndpointDetector';

const options: VoiceEndpointOptions = {
  candidateGapMs: 160,
  maxDurationMs: 6700,
  minSpeechMs: 240,
  noSpeechTimeoutMs: 5200,
  silenceAfterSpeechMs: 750,
};

test('requires sustained speech and ignores a single impulse', () => {
  let state = createVoiceEndpointState(0);

  state = observe(state, 120, false);
  state = observe(state, 240, true);
  state = observe(state, 360, false);
  state = observe(state, 480, false);

  expect(state.hadSpeech).toBe(false);
  expect(state.phase).toBe('waitingForSpeech');
});

test('confirms sustained speech and stops only after trailing silence', () => {
  let state = createVoiceEndpointState(0);

  state = observe(state, 120, true);
  state = observe(state, 240, true);
  state = observe(state, 360, true);
  expect(state.hadSpeech).toBe(true);
  expect(state.phase).toBe('speaking');

  state = observe(state, 960, false);
  expect(state.phase).toBe('trailingSilence');
  state = observe(state, 1080, true);
  expect(state.phase).toBe('speaking');

  state = observe(state, 1830, false);
  expect(state.phase).toBe('ended');
  expect(state.stopReason).toBe('endOfSpeech');
});

test('ends quiet and continuously active sessions with distinct reasons', () => {
  const quietState = observe(createVoiceEndpointState(0), 5200, null);
  expect(quietState.stopReason).toBe('noSpeechTimeout');

  let activeState = createVoiceEndpointState(0);
  activeState = observe(activeState, 120, true);
  activeState = observe(activeState, 240, true);
  activeState = observe(activeState, 360, true);
  activeState = observe(activeState, 6700, true);
  expect(activeState.stopReason).toBe('maxDuration');
});

test('keeps terminal endpoint state idempotent', () => {
  const endedState = observe(createVoiceEndpointState(0), 5200, null);

  expect(observe(endedState, 9000, true)).toBe(endedState);
});

test('fallback level classifier calibrates noise and uses hysteresis', () => {
  let classifier = createLevelVoiceClassifierState();

  for (const level of [0.02, 0.021, 0.019]) {
    const result = classifyVoiceLevel(classifier, level);
    classifier = result.state;
    expect(result.classification).toBeNull();
  }

  const speech = classifyVoiceLevel(classifier, 0.12);
  expect(speech.classification).toBe(true);
  const quieterContinuation = classifyVoiceLevel(speech.state, 0.05);
  expect(quieterContinuation.classification).toBe(true);
  expect(
    classifyVoiceLevel(quieterContinuation.state, Number.NaN).classification,
  ).toBeNull();
});

function observe(
  state: VoiceEndpointState,
  atMs: number,
  isSpeech: boolean | null,
) {
  return advanceVoiceEndpoint(state, { atMs, isSpeech }, options);
}
