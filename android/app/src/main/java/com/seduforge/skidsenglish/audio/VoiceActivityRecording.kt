package com.seduforge.skidsenglish.audio

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import java.io.File
import java.io.RandomAccessFile
import kotlin.math.exp
import kotlin.math.log10
import kotlin.math.max
import kotlin.math.sqrt

internal const val VOICE_ACTIVITY_DETECTOR = "nativeVoiceActivity"

internal enum class VoiceActivityPhase(val bridgeValue: String) {
  CALIBRATING("calibrating"),
  WAITING_FOR_SPEECH("waitingForSpeech"),
  CANDIDATE_SPEECH("candidateSpeech"),
  SPEAKING("speaking"),
  TRAILING_SILENCE("trailingSilence"),
  ENDED("ended"),
}

internal enum class VoiceActivityStopReason(val bridgeValue: String) {
  END_OF_SPEECH("endOfSpeech"),
  TARGET_WORD_MATCH("targetWordMatch"),
  NO_SPEECH_TIMEOUT("noSpeechTimeout"),
  MAX_DURATION("maxDuration"),
  MANUAL("manual"),
  INTERRUPTED("interrupted"),
  ERROR("error");

  companion object {
    fun fromBridgeValue(value: String?): VoiceActivityStopReason =
      entries.firstOrNull { it.bridgeValue == value } ?: MANUAL
  }
}

internal data class VoiceActivityRecordingOptions(
  val minSpeechMs: Long,
  val silenceAfterSpeechMs: Long,
  val noSpeechTimeoutMs: Long,
  val maxDurationMs: Long,
  val autoEndpointEnabled: Boolean,
  val targetText: String?,
  val targetLocale: String,
  val targetMatchPostRollMs: Long,
) {
  companion object {
    private const val DEFAULT_MIN_SPEECH_MS = 240L
    private const val DEFAULT_SILENCE_AFTER_SPEECH_MS = 750L
    private const val DEFAULT_NO_SPEECH_TIMEOUT_MS = 5_200L
    private const val DEFAULT_MAX_DURATION_MS = 6_700L
    private const val DEFAULT_TARGET_MATCH_POST_ROLL_MS = 350L

    fun defaults(): VoiceActivityRecordingOptions = VoiceActivityRecordingOptions(
      minSpeechMs = DEFAULT_MIN_SPEECH_MS,
      silenceAfterSpeechMs = DEFAULT_SILENCE_AFTER_SPEECH_MS,
      noSpeechTimeoutMs = DEFAULT_NO_SPEECH_TIMEOUT_MS,
      maxDurationMs = DEFAULT_MAX_DURATION_MS,
      autoEndpointEnabled = false,
      targetText = null,
      targetLocale = "en-US",
      targetMatchPostRollMs = DEFAULT_TARGET_MATCH_POST_ROLL_MS,
    )

    fun fromReadableMap(options: ReadableMap): VoiceActivityRecordingOptions {
      val minSpeechMs = options.readLong("minSpeechMs", DEFAULT_MIN_SPEECH_MS)
        .coerceIn(100L, 1_500L)
      val silenceAfterSpeechMs = options.readLong(
        "silenceAfterSpeechMs",
        DEFAULT_SILENCE_AFTER_SPEECH_MS,
      ).coerceIn(300L, 4_000L)
      val noSpeechTimeoutMs = options.readLong(
        "noSpeechTimeoutMs",
        DEFAULT_NO_SPEECH_TIMEOUT_MS,
      ).coerceIn(1_000L, 30_000L)
      val requestedMaxDurationMs = options.readLong(
        "maxDurationMs",
        max(DEFAULT_MAX_DURATION_MS, noSpeechTimeoutMs + 1_500L),
      ).coerceIn(1_500L, 60_000L)
      val targetText = options.readString("targetText")
        ?.trim()
        ?.takeIf { it.isNotEmpty() }
        ?.take(MAX_TARGET_TEXT_LENGTH)
      val targetLocale = when (options.readString("targetLocale")?.trim()?.lowercase()) {
        "en-gb" -> "en-GB"
        else -> "en-US"
      }
      val targetMatchPostRollMs = options.readLong(
        "targetMatchPostRollMs",
        DEFAULT_TARGET_MATCH_POST_ROLL_MS,
      ).coerceIn(200L, 1_500L)

      return VoiceActivityRecordingOptions(
        minSpeechMs = minSpeechMs,
        silenceAfterSpeechMs = silenceAfterSpeechMs,
        noSpeechTimeoutMs = noSpeechTimeoutMs,
        maxDurationMs = max(requestedMaxDurationMs, noSpeechTimeoutMs),
        autoEndpointEnabled = true,
        targetText = targetText,
        targetLocale = targetLocale,
        targetMatchPostRollMs = targetMatchPostRollMs,
      )
    }

    private const val MAX_TARGET_TEXT_LENGTH = 80
  }
}

internal data class VoiceActivitySnapshot(
  val sessionId: String,
  val sequence: Long,
  val phase: VoiceActivityPhase,
  val isRecording: Boolean,
  val shouldStop: Boolean,
  val hadSpeech: Boolean,
  val level: Double,
  val levelDbfs: Double,
  val noiseFloorDbfs: Double,
  val speechConfidence: Double,
  val elapsedMs: Long,
  val speechDurationMs: Long,
  val trailingSilenceMs: Long,
  val stopReason: VoiceActivityStopReason?,
  val targetMatchState: TargetWordMatchState? = null,
  val targetMatchConfidence: Double? = null,
) {
  fun toWritableMap(): WritableMap = Arguments.createMap().apply {
    putString("sessionId", sessionId)
    putDouble("sequence", sequence.toDouble())
    putString("phase", phase.bridgeValue)
    putString("detector", VOICE_ACTIVITY_DETECTOR)
    putBoolean("isRecording", isRecording)
    putBoolean("shouldStop", shouldStop)
    putBoolean("hadSpeech", hadSpeech)
    putDouble("level", level)
    putDouble("levelDbfs", levelDbfs)
    putDouble("noiseFloorDbfs", noiseFloorDbfs)
    putDouble("speechConfidence", speechConfidence)
    putDouble("elapsedMs", elapsedMs.toDouble())
    putDouble("speechDurationMs", speechDurationMs.toDouble())
    putDouble("trailingSilenceMs", trailingSilenceMs.toDouble())
    stopReason?.let {
      putString("stopReason", it.bridgeValue)
    } ?: putNull("stopReason")
    targetMatchState?.let {
      putString("targetMatchState", it.bridgeValue)
    }
    targetMatchConfidence?.let {
      putDouble("targetMatchConfidence", it)
    }
  }
}

/**
 * A deliberately small, local-only voice activity detector. It does not identify
 * words or speakers. It combines adaptive energy with simple speech-like signal
 * features and requires activity across multiple frames so short impacts do not
 * count as speech.
 */
internal class LightweightVoiceActivityDetector(
  private val sessionId: String,
  private val sampleRate: Int,
  private val options: VoiceActivityRecordingOptions,
) {
  private val calibrationDurationMs = 300L
  private val candidateGapToleranceMs = 160L
  private val speechHangoverMs = 120L
  private val noiseHistory = DoubleArray(50)
  private var noiseHistoryCount = 0
  private var noiseHistoryIndex = 0
  private var noiseFloorDbfs = -55.0
  private var sequence = 0L
  private var phase = VoiceActivityPhase.CALIBRATING
  private var hadSpeech = false
  private var candidateSpeechMs = 0L
  private var candidateGapMs = 0L
  private var speechDurationMs = 0L
  private var lastSpeechAtMs: Long? = null
  private var previousInput = 0.0
  private var previousHighPass = 0.0
  private var latestSnapshot = snapshot(
    elapsedMs = 0L,
    level = 0.0,
    levelDbfs = DBFS_FLOOR,
    speechConfidence = 0.0,
    trailingSilenceMs = 0L,
  )

  fun currentSnapshot(): VoiceActivitySnapshot = latestSnapshot

  fun process(
    samples: ShortArray,
    sampleCount: Int,
    elapsedMs: Long,
  ): VoiceActivitySnapshot {
    if (latestSnapshot.shouldStop || sampleCount <= 0) {
      return latestSnapshot
    }

    val frameDurationMs = max(1L, sampleCount.toLong() * 1_000L / sampleRate)
    val features = analyzeFrame(samples, sampleCount)
    val isCalibrating = elapsedMs < calibrationDurationMs
    if (!hadSpeech && isCalibrating) {
      // Learn steady room noise even when it starts above the initial floor. The
      // cap prevents a child who speaks immediately from teaching the detector
      // that their full voice level is ambient noise.
      updateNoiseFloor(features.levelDbfs.coerceAtMost(-42.0))
    }
    val enterThresholdDbfs = max(-50.0, noiseFloorDbfs + 8.0)
    val continueThresholdDbfs = max(-55.0, noiseFloorDbfs + 4.0)
    val energyMarginDb = features.levelDbfs - noiseFloorDbfs
    val energyConfidence = ((energyMarginDb - 3.0) / 12.0).coerceIn(0.0, 1.0)
    val zeroCrossingConfidence = when {
      features.zeroCrossingRate in 0.012..0.34 -> 1.0
      features.zeroCrossingRate in 0.005..0.45 -> 0.55
      else -> 0.15
    }
    val crestConfidence = when {
      features.crestFactor in 1.15..10.0 -> 1.0
      features.crestFactor <= 18.0 -> 0.55
      else -> 0.15
    }
    val speechConfidence = (
      energyConfidence * 0.72 +
        zeroCrossingConfidence * 0.18 +
        crestConfidence * 0.10
      ).coerceIn(0.0, 1.0)
    val isCandidate = if (hadSpeech) {
      features.levelDbfs >= continueThresholdDbfs && speechConfidence >= 0.34
    } else {
      features.levelDbfs >= enterThresholdDbfs && speechConfidence >= 0.52
    }

    if (!hadSpeech && !isCalibrating && !isCandidate) {
      updateNoiseFloor(features.levelDbfs)
    }

    var trailingSilenceMs = 0L
    if (!hadSpeech) {
      if (isCandidate) {
        candidateSpeechMs += frameDurationMs
        candidateGapMs = 0L
      } else if (candidateSpeechMs > 0L) {
        candidateGapMs += frameDurationMs
        if (candidateGapMs > candidateGapToleranceMs) {
          candidateSpeechMs = 0L
          candidateGapMs = 0L
        }
      }

      phase = when {
        elapsedMs < calibrationDurationMs && candidateSpeechMs == 0L ->
          VoiceActivityPhase.CALIBRATING
        candidateSpeechMs > 0L -> VoiceActivityPhase.CANDIDATE_SPEECH
        else -> VoiceActivityPhase.WAITING_FOR_SPEECH
      }

      val isStrongPersistentEarlySpeech =
        features.levelDbfs >= max(-34.0, noiseFloorDbfs + 16.0)
      if (
        isCandidate &&
        candidateSpeechMs >= options.minSpeechMs &&
        (!isCalibrating || isStrongPersistentEarlySpeech)
      ) {
        hadSpeech = true
        speechDurationMs = candidateSpeechMs
        lastSpeechAtMs = elapsedMs
        phase = VoiceActivityPhase.SPEAKING
      }
    } else if (isCandidate) {
      speechDurationMs += frameDurationMs
      lastSpeechAtMs = elapsedMs
      phase = VoiceActivityPhase.SPEAKING
    } else {
      trailingSilenceMs = lastSpeechAtMs?.let { max(0L, elapsedMs - it) } ?: 0L
      phase = if (trailingSilenceMs >= speechHangoverMs) {
        VoiceActivityPhase.TRAILING_SILENCE
      } else {
        VoiceActivityPhase.SPEAKING
      }
    }

    val stopReason = if (!options.autoEndpointEnabled) {
      null
    } else {
      when {
        !hadSpeech && elapsedMs >= options.noSpeechTimeoutMs ->
          VoiceActivityStopReason.NO_SPEECH_TIMEOUT
        elapsedMs >= options.maxDurationMs -> VoiceActivityStopReason.MAX_DURATION
        hadSpeech && trailingSilenceMs >= options.silenceAfterSpeechMs ->
          VoiceActivityStopReason.END_OF_SPEECH
        else -> null
      }
    }

    sequence += 1L
    latestSnapshot = snapshot(
      elapsedMs = elapsedMs,
      level = features.level,
      levelDbfs = features.levelDbfs,
      speechConfidence = speechConfidence,
      trailingSilenceMs = trailingSilenceMs,
      stopReason = stopReason,
    )
    return latestSnapshot
  }

  fun finish(
    reason: VoiceActivityStopReason,
    elapsedMs: Long,
  ): VoiceActivitySnapshot {
    if (
      latestSnapshot.phase == VoiceActivityPhase.ENDED &&
      reason != VoiceActivityStopReason.ERROR
    ) {
      return latestSnapshot
    }

    sequence += 1L
    val trailingSilenceMs = lastSpeechAtMs?.let { max(0L, elapsedMs - it) } ?: 0L
    latestSnapshot = snapshot(
      elapsedMs = elapsedMs,
      level = latestSnapshot.level,
      levelDbfs = latestSnapshot.levelDbfs,
      speechConfidence = latestSnapshot.speechConfidence,
      trailingSilenceMs = trailingSilenceMs,
      stopReason = reason,
    )
    return latestSnapshot
  }

  private fun snapshot(
    elapsedMs: Long,
    level: Double,
    levelDbfs: Double,
    speechConfidence: Double,
    trailingSilenceMs: Long,
    stopReason: VoiceActivityStopReason? = null,
  ): VoiceActivitySnapshot {
    val hasEnded = stopReason != null
    return VoiceActivitySnapshot(
      sessionId = sessionId,
      sequence = sequence,
      phase = if (hasEnded) VoiceActivityPhase.ENDED else phase,
      isRecording = !hasEnded,
      shouldStop = hasEnded,
      hadSpeech = hadSpeech,
      level = level,
      levelDbfs = levelDbfs,
      noiseFloorDbfs = noiseFloorDbfs,
      speechConfidence = speechConfidence,
      elapsedMs = elapsedMs,
      speechDurationMs = speechDurationMs,
      trailingSilenceMs = trailingSilenceMs,
      stopReason = stopReason,
    )
  }

  private fun analyzeFrame(samples: ShortArray, sampleCount: Int): FrameFeatures {
    var sumSquares = 0.0
    var peak = 0.0
    var zeroCrossings = 0
    var previousSign = 0
    val highPassAlpha = exp(-2.0 * Math.PI * 100.0 / sampleRate)

    for (index in 0 until sampleCount) {
      val input = samples[index].toDouble() / Short.MAX_VALUE.toDouble()
      val highPass = highPassAlpha * (previousHighPass + input - previousInput)
      previousInput = input
      previousHighPass = highPass
      val absolute = kotlin.math.abs(highPass)
      sumSquares += highPass * highPass
      peak = max(peak, absolute)

      val sign = when {
        highPass > 0.0005 -> 1
        highPass < -0.0005 -> -1
        else -> previousSign
      }
      if (previousSign != 0 && sign != previousSign) {
        zeroCrossings += 1
      }
      previousSign = sign
    }

    val rms = sqrt(sumSquares / sampleCount).coerceAtLeast(1e-6)
    val levelDbfs = (20.0 * log10(rms)).coerceIn(DBFS_FLOOR, 0.0)
    return FrameFeatures(
      level = ((levelDbfs - DBFS_FLOOR) / -DBFS_FLOOR).coerceIn(0.0, 1.0),
      levelDbfs = levelDbfs,
      zeroCrossingRate = zeroCrossings.toDouble() / sampleCount,
      crestFactor = peak / rms,
    )
  }

  private fun updateNoiseFloor(levelDbfs: Double) {
    if (!levelDbfs.isFinite() || levelDbfs > -24.0) {
      return
    }

    noiseHistory[noiseHistoryIndex] = levelDbfs
    noiseHistoryIndex = (noiseHistoryIndex + 1) % noiseHistory.size
    noiseHistoryCount = (noiseHistoryCount + 1).coerceAtMost(noiseHistory.size)

    val sorted = noiseHistory.copyOf(noiseHistoryCount).sortedArray()
    val percentileIndex = ((sorted.size - 1) * 0.25).toInt()
    val target = sorted[percentileIndex].coerceIn(-75.0, -30.0)
    noiseFloorDbfs = (noiseFloorDbfs * 0.82 + target * 0.18).coerceIn(-75.0, -30.0)
  }

  private data class FrameFeatures(
    val level: Double,
    val levelDbfs: Double,
    val zeroCrossingRate: Double,
    val crestFactor: Double,
  )

  private companion object {
    const val DBFS_FLOOR = -80.0
  }
}

internal class PcmWaveFileWriter(
  private val file: File,
  private val sampleRate: Int,
) {
  private val output = RandomAccessFile(file, "rw")
  private var dataBytes = 0L
  private var isClosed = false

  init {
    output.setLength(0L)
    output.write(ByteArray(WAVE_HEADER_SIZE))
  }

  fun write(samples: ShortArray, sampleCount: Int) {
    check(!isClosed) { "WAV writer is closed" }
    val bytes = ByteArray(sampleCount * BYTES_PER_SAMPLE)
    for (index in 0 until sampleCount) {
      val value = samples[index].toInt()
      bytes[index * 2] = (value and 0xff).toByte()
      bytes[index * 2 + 1] = ((value ushr 8) and 0xff).toByte()
    }
    output.write(bytes)
    dataBytes += bytes.size
  }

  fun finish() {
    if (isClosed) {
      return
    }

    output.seek(0L)
    output.writeAscii("RIFF")
    output.writeIntLittleEndian((36L + dataBytes).coerceAtMost(Int.MAX_VALUE.toLong()).toInt())
    output.writeAscii("WAVE")
    output.writeAscii("fmt ")
    output.writeIntLittleEndian(16)
    output.writeShortLittleEndian(1)
    output.writeShortLittleEndian(CHANNEL_COUNT)
    output.writeIntLittleEndian(sampleRate)
    output.writeIntLittleEndian(sampleRate * CHANNEL_COUNT * BYTES_PER_SAMPLE)
    output.writeShortLittleEndian(CHANNEL_COUNT * BYTES_PER_SAMPLE)
    output.writeShortLittleEndian(BITS_PER_SAMPLE)
    output.writeAscii("data")
    output.writeIntLittleEndian(dataBytes.coerceAtMost(Int.MAX_VALUE.toLong()).toInt())
    output.close()
    isClosed = true
  }

  fun abort() {
    if (!isClosed) {
      try {
        output.close()
      } catch (_: Exception) {
      }
      isClosed = true
    }
    file.delete()
  }

  private companion object {
    const val BITS_PER_SAMPLE = 16
    const val BYTES_PER_SAMPLE = BITS_PER_SAMPLE / 8
    const val CHANNEL_COUNT = 1
    const val WAVE_HEADER_SIZE = 44
  }
}

private fun ReadableMap.readLong(key: String, fallback: Long): Long =
  if (hasKey(key) && !isNull(key)) {
    try {
      getDouble(key).toLong()
    } catch (_: Exception) {
      fallback
    }
  } else {
    fallback
  }

private fun ReadableMap.readString(key: String): String? =
  if (hasKey(key) && !isNull(key)) {
    try {
      getString(key)
    } catch (_: Exception) {
      null
    }
  } else {
    null
  }

private fun RandomAccessFile.writeAscii(value: String) {
  write(value.toByteArray(Charsets.US_ASCII))
}

private fun RandomAccessFile.writeIntLittleEndian(value: Int) {
  write(value and 0xff)
  write((value ushr 8) and 0xff)
  write((value ushr 16) and 0xff)
  write((value ushr 24) and 0xff)
}

private fun RandomAccessFile.writeShortLittleEndian(value: Int) {
  write(value and 0xff)
  write((value ushr 8) and 0xff)
}
