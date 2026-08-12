package com.seduforge.skidsenglish.audio

import android.content.Context
import android.content.Intent
import android.media.AudioFormat
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.ParcelFileDescriptor
import android.os.SystemClock
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import java.io.OutputStream
import java.util.Locale
import java.util.concurrent.ArrayBlockingQueue
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicReference

/**
 * A local, positive-only endpoint hint for a single expected word or phrase.
 *
 * The matcher never exposes a transcript and never treats a non-match as a
 * pronunciation decision. Android 13's PCM input is required so this helper
 * can share the app's existing AudioRecord stream instead of competing for the
 * microphone. Unsupported devices and recognizer failures simply leave the
 * regular voice-activity endpoint in control.
 */
internal enum class TargetWordMatchState(val bridgeValue: String) {
  UNAVAILABLE("unavailable"),
  LISTENING("listening"),
  CANDIDATE("candidate"),
  MATCHED("matched"),
}

internal data class TargetWordMatchSnapshot(
  val state: TargetWordMatchState,
  val confidence: Double?,
)

internal class OnDeviceTargetWordMatcher(
  context: Context,
  private val targetText: String,
  private val targetLocale: String,
  private val sampleRate: Int,
) : AutoCloseable {
  private val applicationContext = context.applicationContext
  private val mainHandler = Handler(Looper.getMainLooper())
  private val targetNormalized = normalizeTargetHypothesis(targetText)
  private val state = AtomicReference(TargetWordMatchState.UNAVAILABLE)
  private val confidence = AtomicReference<Double?>(null)
  private val transportClosed = AtomicBoolean(false)
  private val audioQueue = ArrayBlockingQueue<ByteArray>(MAX_QUEUED_PCM_FRAMES)
  private val recognizer = AtomicReference<SpeechRecognizer?>(null)
  private val recognitionInput = AtomicReference<ParcelFileDescriptor?>(null)
  private val recognitionOutput = AtomicReference<OutputStream?>(null)

  @Volatile
  private var writerThread: Thread? = null

  // Recognition callbacks are delivered on the main thread.
  private var consecutivePartialMatches = 0
  private var partialCandidateStartedAtMs = NO_MATCH_TIME

  init {
    mainHandler.post(::startOnMainThread)
  }

  fun currentSnapshot(): TargetWordMatchSnapshot = TargetWordMatchSnapshot(
    state = state.get(),
    confidence = confidence.get(),
  )

  fun acceptPcm(samples: ShortArray, sampleCount: Int) {
    if (
      transportClosed.get() ||
      targetNormalized.isEmpty() ||
      sampleCount <= 0
    ) {
      return
    }

    val bytes = ByteArray(sampleCount * BYTES_PER_SAMPLE)
    for (index in 0 until sampleCount) {
      val value = samples[index].toInt()
      bytes[index * 2] = (value and 0xff).toByte()
      bytes[index * 2 + 1] = ((value ushr 8) and 0xff).toByte()
    }

    if (!audioQueue.offer(bytes)) {
      // Keep capture latency bounded. Dropping the oldest recognizer-only frame
      // never affects the WAV recording or the native VAD.
      audioQueue.poll()
      audioQueue.offer(bytes)
    }
  }

  override fun close() {
    if (!transportClosed.compareAndSet(false, true)) {
      return
    }

    closeRecognitionOutput()
    audioQueue.clear()
    writerThread?.interrupt()
    mainHandler.post {
      destroyRecognizerOnMainThread(cancelFirst = true)
    }
  }

  private fun startOnMainThread() {
    if (transportClosed.get()) {
      return
    }
    if (
      targetNormalized.isEmpty() ||
      Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU
    ) {
      failOnMainThread()
      return
    }

    var createdRecognizer: SpeechRecognizer? = null
    var readSide: ParcelFileDescriptor? = null
    var outputStream: OutputStream? = null
    try {
      if (!SpeechRecognizer.isOnDeviceRecognitionAvailable(applicationContext)) {
        failOnMainThread()
        return
      }

      val pipe = ParcelFileDescriptor.createPipe()
      readSide = pipe[0]
      outputStream = ParcelFileDescriptor.AutoCloseOutputStream(pipe[1])
      createdRecognizer = SpeechRecognizer.createOnDeviceSpeechRecognizer(applicationContext)

      recognitionInput.set(readSide)
      recognitionOutput.set(outputStream)
      recognizer.set(createdRecognizer)
      createdRecognizer.setRecognitionListener(createRecognitionListener())
      startPcmWriter()

      val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
        putExtra(
          RecognizerIntent.EXTRA_LANGUAGE_MODEL,
          RecognizerIntent.LANGUAGE_MODEL_FREE_FORM,
        )
        putExtra(RecognizerIntent.EXTRA_LANGUAGE, targetLocale)
        putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
        putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, MAX_RECOGNITION_RESULTS)
        putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
        putStringArrayListExtra(
          RecognizerIntent.EXTRA_BIASING_STRINGS,
          arrayListOf(targetText),
        )
        putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE, readSide)
        putExtra(
          RecognizerIntent.EXTRA_AUDIO_SOURCE_ENCODING,
          AudioFormat.ENCODING_PCM_16BIT,
        )
        putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE_CHANNEL_COUNT, CHANNEL_COUNT)
        putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE_SAMPLING_RATE, sampleRate)
        putExtra(
          RecognizerIntent.EXTRA_SEGMENTED_SESSION,
          RecognizerIntent.EXTRA_AUDIO_SOURCE,
        )
      }

      createdRecognizer.startListening(intent)
      if (!transportClosed.get()) {
        state.compareAndSet(
          TargetWordMatchState.UNAVAILABLE,
          TargetWordMatchState.LISTENING,
        )
      }
    } catch (error: Exception) {
      Log.d(LOG_TAG, "On-device target-word recognition is unavailable", error)
      if (recognizer.get() == null) {
        try {
          createdRecognizer?.destroy()
        } catch (_: Exception) {
        }
        try {
          readSide?.close()
        } catch (_: Exception) {
        }
        try {
          outputStream?.close()
        } catch (_: Exception) {
        }
      }
      failOnMainThread()
    }
  }

  private fun createRecognitionListener(): RecognitionListener =
    object : RecognitionListener {
      override fun onReadyForSpeech(params: Bundle?) {
        if (
          !transportClosed.get() &&
          state.get() == TargetWordMatchState.UNAVAILABLE
        ) {
          state.set(TargetWordMatchState.LISTENING)
        }
      }

      override fun onBeginningOfSpeech() = Unit

      override fun onRmsChanged(rmsdB: Float) = Unit

      override fun onBufferReceived(buffer: ByteArray?) = Unit

      override fun onEndOfSpeech() = Unit

      override fun onError(error: Int) {
        if (state.get() != TargetWordMatchState.MATCHED) {
          Log.d(LOG_TAG, "Target-word recognizer ended with error=$error")
          failOnMainThread()
        }
      }

      override fun onResults(results: Bundle?) {
        handleRecognitionResults(results, isFinalEvidence = true)
        if (state.get() != TargetWordMatchState.MATCHED) {
          failOnMainThread()
        }
      }

      override fun onPartialResults(partialResults: Bundle?) {
        handleRecognitionResults(partialResults, isFinalEvidence = false)
      }

      override fun onEvent(eventType: Int, params: Bundle?) = Unit

      override fun onSegmentResults(segmentResults: Bundle) {
        handleRecognitionResults(segmentResults, isFinalEvidence = true)
      }

      override fun onEndOfSegmentedSession() {
        if (state.get() != TargetWordMatchState.MATCHED) {
          failOnMainThread()
        }
      }
    }

  private fun handleRecognitionResults(
    results: Bundle?,
    isFinalEvidence: Boolean,
  ) {
    if (transportClosed.get() || state.get() == TargetWordMatchState.MATCHED) {
      return
    }

    val hypotheses = results
      ?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
    val topHypothesis = hypotheses?.firstOrNull()
    val resultConfidence = results
      ?.getFloatArray(SpeechRecognizer.CONFIDENCE_SCORES)
      ?.firstOrNull()
      ?.toDouble()
      ?.takeIf { it.isFinite() && it in 0.0..1.0 }
    val isExactTarget = topHypothesis != null &&
      normalizeTargetHypothesis(topHypothesis) == targetNormalized &&
      (resultConfidence == null || resultConfidence >= MIN_REPORTED_MATCH_CONFIDENCE)

    if (!isExactTarget) {
      resetPartialCandidate()
      state.set(TargetWordMatchState.LISTENING)
      confidence.set(null)
      return
    }

    confidence.set(resultConfidence)
    if (isFinalEvidence) {
      markMatched()
      return
    }

    val nowMs = SystemClock.elapsedRealtime()
    if (consecutivePartialMatches == 0) {
      partialCandidateStartedAtMs = nowMs
    }
    consecutivePartialMatches += 1
    state.set(TargetWordMatchState.CANDIDATE)
    if (
      consecutivePartialMatches >= REQUIRED_PARTIAL_MATCHES &&
      nowMs - partialCandidateStartedAtMs >= MIN_PARTIAL_STABILITY_MS
    ) {
      markMatched()
    }
  }

  private fun markMatched() {
    if (state.getAndSet(TargetWordMatchState.MATCHED) == TargetWordMatchState.MATCHED) {
      return
    }

    transportClosed.set(true)
    closeRecognitionOutput()
    audioQueue.clear()
    writerThread?.interrupt()
    destroyRecognizerOnMainThread(cancelFirst = true)
  }

  private fun resetPartialCandidate() {
    consecutivePartialMatches = 0
    partialCandidateStartedAtMs = NO_MATCH_TIME
  }

  private fun startPcmWriter() {
    if (writerThread != null) {
      return
    }

    writerThread = Thread(
      {
        try {
          while (!transportClosed.get()) {
            val frame = audioQueue.poll(PCM_QUEUE_POLL_MS, TimeUnit.MILLISECONDS)
              ?: continue
            recognitionOutput.get()?.write(frame)
          }
        } catch (_: InterruptedException) {
          Thread.currentThread().interrupt()
        } catch (error: Exception) {
          if (!transportClosed.get()) {
            Log.d(LOG_TAG, "Target-word PCM stream stopped", error)
            mainHandler.post(::failOnMainThread)
          }
        }
      },
      "SkidsTargetWordPcm",
    ).apply {
      isDaemon = true
      start()
    }
  }

  private fun failOnMainThread() {
    if (state.get() == TargetWordMatchState.MATCHED) {
      return
    }

    state.set(TargetWordMatchState.UNAVAILABLE)
    confidence.set(null)
    transportClosed.set(true)
    closeRecognitionOutput()
    audioQueue.clear()
    writerThread?.interrupt()
    destroyRecognizerOnMainThread(cancelFirst = true)
  }

  private fun closeRecognitionOutput() {
    try {
      recognitionOutput.getAndSet(null)?.close()
    } catch (_: Exception) {
    }
  }

  private fun destroyRecognizerOnMainThread(cancelFirst: Boolean) {
    closeRecognitionOutput()
    val activeRecognizer = recognizer.getAndSet(null)
    if (activeRecognizer != null) {
      try {
        if (cancelFirst) {
          activeRecognizer.cancel()
        }
      } catch (_: Exception) {
      }
      try {
        activeRecognizer.destroy()
      } catch (_: Exception) {
      }
    }
    try {
      recognitionInput.getAndSet(null)?.close()
    } catch (_: Exception) {
    }
  }

  private companion object {
    const val LOG_TAG = "SkidsTargetWord"
    const val BYTES_PER_SAMPLE = 2
    const val CHANNEL_COUNT = 1
    const val MAX_QUEUED_PCM_FRAMES = 50
    const val MAX_RECOGNITION_RESULTS = 3
    const val PCM_QUEUE_POLL_MS = 100L
    const val REQUIRED_PARTIAL_MATCHES = 2
    const val MIN_PARTIAL_STABILITY_MS = 120L
    const val MIN_REPORTED_MATCH_CONFIDENCE = 0.55
    const val NO_MATCH_TIME = -1L
  }
}

internal fun normalizeTargetHypothesis(value: String): String =
  value
    .lowercase(Locale.ROOT)
    .replace(NON_ALPHANUMERIC, " ")
    .trim()
    .replace(REPEATED_WHITESPACE, " ")

private val NON_ALPHANUMERIC = Regex("[^\\p{L}\\p{Nd}]+")
private val REPEATED_WHITESPACE = Regex("\\s+")
