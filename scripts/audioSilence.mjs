const PCM16_MAX = 32767;
const DEFAULT_SILENCE_THRESHOLD_DB = -40;
const DEFAULT_ANALYSIS_WINDOW_MS = 10;
const DEFAULT_PADDING_MS = 20;

export function trimWavSilence(
  input,
  {
    thresholdDb = DEFAULT_SILENCE_THRESHOLD_DB,
    analysisWindowMs = DEFAULT_ANALYSIS_WINDOW_MS,
    paddingMs = DEFAULT_PADDING_MS,
  } = {},
) {
  const wav = parseWav(input);
  if (!wav || wav.audioFormat !== 1 || wav.bitsPerSample !== 16) {
    return input;
  }

  const frameSize = wav.channels * 2;
  const frameCount = Math.floor(wav.dataSize / frameSize);
  if (frameCount === 0) {
    return input;
  }

  const threshold = PCM16_MAX * 10 ** (thresholdDb / 20);
  const windowFrames = Math.max(
    1,
    Math.round((wav.sampleRate * analysisWindowMs) / 1000),
  );

  let firstActiveFrame = -1;
  let lastActiveFrame = -1;

  for (let frameStart = 0; frameStart < frameCount; frameStart += windowFrames) {
    const frameEnd = Math.min(frameCount, frameStart + windowFrames);
    const rms = getFrameRms(wav, frameStart, frameEnd, frameSize);

    if (rms < threshold) {
      continue;
    }

    if (firstActiveFrame === -1) {
      firstActiveFrame = frameStart;
    }
    lastActiveFrame = frameEnd;
  }

  if (firstActiveFrame === -1) {
    return input;
  }

  const paddingFrames = Math.max(
    0,
    Math.round((wav.sampleRate * paddingMs) / 1000),
  );
  const startFrame = Math.max(0, firstActiveFrame - paddingFrames);
  const endFrame = Math.min(frameCount, lastActiveFrame + paddingFrames);

  if (startFrame === 0 && endFrame === frameCount) {
    return input;
  }

  const dataStart = wav.dataOffset + startFrame * frameSize;
  const dataEnd = wav.dataOffset + endFrame * frameSize;
  const trimmedData = input.subarray(dataStart, dataEnd);
  const output = Buffer.concat([
    input.subarray(0, wav.dataOffset),
    trimmedData,
    input.subarray(wav.dataOffset + wav.dataSize),
  ]);

  output.writeUInt32LE(trimmedData.length, wav.dataSizeOffset);
  output.writeUInt32LE(output.length - 8, 4);
  return output;
}

function parseWav(input) {
  if (
    !Buffer.isBuffer(input) ||
    input.length < 44 ||
    input.toString('ascii', 0, 4) !== 'RIFF' ||
    input.toString('ascii', 8, 12) !== 'WAVE'
  ) {
    return null;
  }

  let offset = 12;
  let format = null;
  let data = null;

  while (offset + 8 <= input.length) {
    const chunkId = input.toString('ascii', offset, offset + 4);
    const chunkSize = input.readUInt32LE(offset + 4);
    const chunkDataOffset = offset + 8;

    if (chunkDataOffset + chunkSize > input.length) {
      return null;
    }

    if (chunkId === 'fmt ' && chunkSize >= 16) {
      format = {
        audioFormat: input.readUInt16LE(chunkDataOffset),
        channels: input.readUInt16LE(chunkDataOffset + 2),
        sampleRate: input.readUInt32LE(chunkDataOffset + 4),
        bitsPerSample: input.readUInt16LE(chunkDataOffset + 14),
      };
    } else if (chunkId === 'data') {
      data = {
        dataOffset: chunkDataOffset,
        dataSize: chunkSize,
        dataSizeOffset: offset + 4,
      };
    }

    offset = chunkDataOffset + chunkSize + (chunkSize % 2);
  }

  if (
    !format ||
    !data ||
    format.channels < 1 ||
    format.sampleRate < 1 ||
    format.bitsPerSample !== 16
  ) {
    return null;
  }

  return { ...format, ...data, input };
}

function getFrameRms(wav, frameStart, frameEnd, frameSize) {
  let sumOfSquares = 0;
  let sampleCount = 0;

  for (let frame = frameStart; frame < frameEnd; frame += 1) {
    const frameOffset = wav.dataOffset + frame * frameSize;
    for (let channel = 0; channel < wav.channels; channel += 1) {
      const sample = wav.input.readInt16LE(frameOffset + channel * 2);
      sumOfSquares += sample * sample;
      sampleCount += 1;
    }
  }

  return sampleCount > 0 ? Math.sqrt(sumOfSquares / sampleCount) : 0;
}
