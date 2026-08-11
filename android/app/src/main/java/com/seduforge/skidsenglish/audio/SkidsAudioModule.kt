package com.seduforge.skidsenglish.audio

import android.Manifest
import android.content.pm.PackageManager
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaPlayer
import android.media.MediaRecorder
import android.media.SoundPool
import android.media.audiofx.NoiseSuppressor
import android.net.Uri
import android.os.SystemClock
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.system.Os
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.seduforge.skidsenglish.R
import java.io.File
import java.io.FileOutputStream
import java.net.URLDecoder
import java.nio.charset.StandardCharsets
import java.util.Locale
import java.util.UUID
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicReference
import kotlin.math.max

class SkidsAudioModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

  private val tag = "SkidsAudio"

  private data class SpeechPlayback(
    val player: MediaPlayer,
    val promise: Promise,
  )

  private data class TextToSpeechPlayback(
    val utteranceId: String,
    val text: String,
    val language: String,
    val pitch: Float,
    val rate: Float,
    val promise: Promise,
  )

  private data class AudioRecordConfiguration(
    val audioRecord: AudioRecord,
    val sampleRate: Int,
    val noiseSuppressor: NoiseSuppressor?,
  )

  private class VoiceRecordingSession(
    val sessionId: String,
    val recordingFile: File,
    val audioRecord: AudioRecord,
    val waveWriter: PcmWaveFileWriter,
    val noiseSuppressor: NoiseSuppressor?,
    val detector: LightweightVoiceActivityDetector,
    val targetMatcher: OnDeviceTargetWordMatcher?,
    val targetMatchPostRollMs: Long,
    val sampleRate: Int,
    val autoEndpointEnabled: Boolean,
    val startedAtMs: Long = SystemClock.elapsedRealtime(),
  ) {
    val completionLatch = CountDownLatch(1)
    val finalizationStarted = AtomicBoolean(false)
    val stopRequested = AtomicBoolean(false)
    val requestedStopReason = AtomicReference<VoiceActivityStopReason?>(null)

    @Volatile
    var snapshot: VoiceActivitySnapshot = detector.currentSnapshot()

    @Volatile
    var recordingUri: String? = Uri.fromFile(recordingFile).toString()

    @Volatile
    var worker: Thread? = null

    var targetMatchPostRollStartedAtMs: Long? = null
  }

  private val soundPool: SoundPool
  private val soundIds = mutableMapOf<String, Int>()
  private val bundledRawResourceNamePattern = Regex("^[a-z][a-z0-9_]*$")
  private val speechPlaybackLock = Any()
  private val textToSpeechLock = Any()
  private val backgroundMusicLock = Any()
  private val voiceRecordingLock = Any()
  private val voiceControlExecutor = Executors.newSingleThreadExecutor { runnable ->
    Thread(runnable, "SkidsVoiceControl").apply {
      isDaemon = true
    }
  }
  private var speechPlayback: SpeechPlayback? = null
  private var textToSpeech: TextToSpeech? = null
  private var textToSpeechPlayback: TextToSpeechPlayback? = null
  private var isTextToSpeechReady = false
  private var isTextToSpeechInitializationFinished = false
  private var backgroundMusicPlayer: MediaPlayer? = null
  private var backgroundMusicVolume = 0.16f
  private var latestVoiceSession: VoiceRecordingSession? = null

  @Volatile
  private var isReleased = false

  @Volatile
  private var isHostPaused = false

  init {
    val attributes = AudioAttributes.Builder()
      .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
      .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
      .build()

    soundPool = SoundPool.Builder()
      .setAudioAttributes(attributes)
      .setMaxStreams(4)
      .build()

    soundIds["tap"] = soundPool.load(reactContext, R.raw.sfx_tap, 1)
    soundIds["correct"] = soundPool.load(reactContext, R.raw.sfx_correct, 1)
    soundIds["wrong"] = soundPool.load(reactContext, R.raw.sfx_wrong, 1)
    soundIds["complete"] = soundPool.load(reactContext, R.raw.sfx_complete, 1)
    soundIds["ding"] = soundPool.load(reactContext, R.raw.sfx_ding, 1)
    soundIds["yay"] = soundPool.load(reactContext, R.raw.sfx_yay, 1)
    soundIds["clap"] = soundPool.load(reactContext, R.raw.sfx_clap, 1)

    textToSpeech = TextToSpeech(reactContext.applicationContext) { status ->
      val playbackToStart = synchronized(textToSpeechLock) {
        isTextToSpeechInitializationFinished = true
        isTextToSpeechReady = status == TextToSpeech.SUCCESS && !isReleased
        if (isTextToSpeechReady) textToSpeechPlayback else null
      }

      if (playbackToStart != null) {
        startTextToSpeechPlayback(playbackToStart)
      } else if (status != TextToSpeech.SUCCESS) {
        finishTextToSpeechPlayback(didSpeak = false)
      }
    }.also { engine ->
      engine.setOnUtteranceProgressListener(
        object : UtteranceProgressListener() {
          override fun onStart(utteranceId: String) = Unit

          override fun onDone(utteranceId: String) {
            finishTextToSpeechPlayback(utteranceId, didSpeak = true)
          }

          @Deprecated("Deprecated in Java")
          override fun onError(utteranceId: String) {
            finishTextToSpeechPlayback(utteranceId, didSpeak = false)
          }

          override fun onError(utteranceId: String, errorCode: Int) {
            finishTextToSpeechPlayback(utteranceId, didSpeak = false)
          }
        },
      )
    }

    reactContext.addLifecycleEventListener(this)
  }

  override fun getName() = "SkidsAudio"

  @ReactMethod
  fun play(effect: String, promise: Promise) {
    if (isReleased) {
      promise.resolve(false)
      return
    }

    val soundId = soundIds[effect]
    if (soundId == null) {
      promise.resolve(false)
      return
    }

    val volume = if (effect == "wrong") 0.34f else 0.46f
    soundPool.play(soundId, volume, volume, 1, 0, 1.0f)
    promise.resolve(true)
  }

  @ReactMethod
  fun playUri(uri: String, promise: Promise) {
    if (isReleased) {
      promise.resolve(false)
      return
    }

    var createdPlayer: MediaPlayer? = null
    var installedPlayback = false
    try {
      stopSpeechPlayer(resolvePendingPromise = true)

      val player = MediaPlayer()
      createdPlayer = player
      val attributes = AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_MEDIA)
        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
        .build()

      player.setAudioAttributes(attributes)
      setPlayerDataSource(player, uri)
      player.setOnPreparedListener {
        try {
          if (!startSpeechPlayerIfCurrent(it)) {
            safelyReleasePlayer(it)
          }
        } catch (error: Exception) {
          Log.w(tag, "Unable to start audio uri: $uri", error)
          finishSpeechPlayer(it, didPlay = false)
        }
      }
      player.setOnCompletionListener {
        finishSpeechPlayer(it, didPlay = true)
      }
      player.setOnErrorListener { mediaPlayer, _, _ ->
        Log.w(tag, "Unable to play audio uri: $uri")
        finishSpeechPlayer(mediaPlayer, didPlay = false)
        true
      }

      synchronized(speechPlaybackLock) {
        speechPlayback = SpeechPlayback(player, promise)
      }
      installedPlayback = true
      player.prepareAsync()
    } catch (error: Exception) {
      val pendingPlayback = detachSpeechPlaybackForPromise(promise)
      safelyReleasePlayer(pendingPlayback?.player ?: createdPlayer)
      if (pendingPlayback != null || !installedPlayback) {
        promise.reject("SKIDS_AUDIO_PLAY_URI_ERROR", error)
      }
    }
  }

  @ReactMethod
  fun speak(
    text: String,
    language: String,
    pitch: Double,
    rate: Double,
    promise: Promise,
  ) {
    val trimmedText = text.trim()
    if (isReleased || trimmedText.isEmpty()) {
      promise.resolve(trimmedText.isEmpty() && !isReleased)
      return
    }

    stopSpeechPlayer(resolvePendingPromise = true)
    val playback = TextToSpeechPlayback(
      utteranceId = UUID.randomUUID().toString(),
      text = trimmedText,
      language = language,
      pitch = pitch
        .takeIf { it.isFinite() }
        ?.toFloat()
        ?.coerceIn(0.5f, 2f)
        ?: 1f,
      rate = rate
        .takeIf { it.isFinite() }
        ?.toFloat()
        ?.coerceIn(0.5f, 2f)
        ?: 0.9f,
      promise = promise,
    )
    val initializationState = synchronized(textToSpeechLock) {
      textToSpeechPlayback = playback
      when {
        isTextToSpeechReady -> 1
        isTextToSpeechInitializationFinished -> -1
        else -> 0
      }
    }

    when (initializationState) {
      1 -> startTextToSpeechPlayback(playback)
      -1 -> finishTextToSpeechPlayback(playback.utteranceId, didSpeak = false)
    }
  }

  @ReactMethod
  fun stopSpeech(promise: Promise) {
    stopSpeechPlayer(resolvePendingPromise = true)
    promise.resolve(true)
  }

  @ReactMethod
  fun playBackgroundMusic(uri: String, volume: Double, promise: Promise) {
    if (isReleased) {
      promise.resolve(false)
      return
    }

    backgroundMusicVolume = clampVolume(volume)
    var createdPlayer: MediaPlayer? = null
    var didResolve = false

    fun resolveOnce(value: Boolean) {
      if (!didResolve) {
        didResolve = true
        promise.resolve(value)
      }
    }

    try {
      stopBackgroundMusicPlayer()

      val player = MediaPlayer()
      createdPlayer = player
      val attributes = AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_MEDIA)
        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
        .build()

      player.setAudioAttributes(attributes)
      player.isLooping = true
      setPlayerVolume(player, backgroundMusicVolume)
      setBackgroundMusicDataSource(player, uri)
      player.setOnPreparedListener {
        try {
          val shouldStart = synchronized(backgroundMusicLock) {
            backgroundMusicPlayer === it
          }
          if (!shouldStart) {
            safelyReleasePlayer(it)
            resolveOnce(false)
            return@setOnPreparedListener
          }

          it.start()
          resolveOnce(true)
        } catch (error: Exception) {
          Log.w(tag, "Unable to start background music: $uri", error)
          finishBackgroundMusicPlayer(it)
          resolveOnce(false)
        }
      }
      player.setOnErrorListener { mediaPlayer, _, _ ->
        Log.w(tag, "Unable to play background music: $uri")
        finishBackgroundMusicPlayer(mediaPlayer)
        resolveOnce(false)
        true
      }

      synchronized(backgroundMusicLock) {
        backgroundMusicPlayer = player
      }
      player.prepareAsync()
    } catch (error: Exception) {
      val player = synchronized(backgroundMusicLock) {
        val currentPlayer = backgroundMusicPlayer
        if (currentPlayer === createdPlayer) {
          backgroundMusicPlayer = null
        }
        createdPlayer
      }
      safelyReleasePlayer(player)
      if (!didResolve) {
        promise.reject("SKIDS_AUDIO_BACKGROUND_MUSIC_ERROR", error)
      }
    }
  }

  @ReactMethod
  fun setBackgroundMusicVolume(volume: Double, promise: Promise) {
    backgroundMusicVolume = clampVolume(volume)
    val player = synchronized(backgroundMusicLock) {
      backgroundMusicPlayer
    }
    setPlayerVolume(player, backgroundMusicVolume)
    promise.resolve(true)
  }

  @ReactMethod
  fun stopBackgroundMusic(promise: Promise) {
    stopBackgroundMusicPlayer()
    promise.resolve(true)
  }

  @ReactMethod
  fun startVoiceRecording(promise: Promise) {
    if (isReleased) {
      promise.resolve(null)
      return
    }

    submitVoiceControl(
      promise = promise,
      errorCode = "SKIDS_VOICE_RECORD_START_ERROR",
    ) {
      val session = startVoiceRecordingInternal(VoiceActivityRecordingOptions.defaults())
      promise.resolve(session.recordingUri)
    }
  }

  @ReactMethod
  fun startVoiceActivityRecording(options: ReadableMap, promise: Promise) {
    if (isReleased) {
      promise.resolve(null)
      return
    }

    val recordingOptions = VoiceActivityRecordingOptions.fromReadableMap(options)
    submitVoiceControl(
      promise = promise,
      errorCode = "SKIDS_VOICE_ACTIVITY_START_ERROR",
    ) {
      val session = startVoiceRecordingInternal(recordingOptions)
      promise.resolve(Arguments.createMap().apply {
        putString("uri", session.recordingUri)
        putString("sessionId", session.sessionId)
        putString("detector", VOICE_ACTIVITY_DETECTOR)
      })
    }
  }

  @ReactMethod
  fun stopVoiceRecording(promise: Promise) {
    if (isReleased) {
      promise.resolve(null)
      return
    }

    try {
      voiceControlExecutor.execute {
        val session = synchronized(voiceRecordingLock) {
          latestVoiceSession
        }
        if (session == null) {
          promise.resolve(null)
          return@execute
        }

        requestVoiceSessionStop(session, VoiceActivityStopReason.MANUAL)
        if (!awaitVoiceSessionCompletion(session)) {
          markVoiceSessionStopTimedOut(session)
          promise.resolve(null)
          return@execute
        }
        promise.resolve(session.recordingUri)
      }
    } catch (_: Exception) {
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun getVoiceRecordingActivity(sessionId: String, promise: Promise) {
    val session = synchronized(voiceRecordingLock) {
      latestVoiceSession?.takeIf { it.sessionId == sessionId }
    }
    promise.resolve(session?.snapshot?.toWritableMap())
  }

  @ReactMethod
  fun stopVoiceActivityRecording(
    sessionId: String,
    requestedReason: String?,
    promise: Promise,
  ) {
    if (isReleased) {
      promise.resolve(null)
      return
    }

    try {
      voiceControlExecutor.execute {
        val session = synchronized(voiceRecordingLock) {
          latestVoiceSession?.takeIf { it.sessionId == sessionId }
        }
        if (session == null) {
          promise.resolve(createVoiceRecordingErrorResult())
          return@execute
        }

        requestVoiceSessionStop(
          session,
          VoiceActivityStopReason.fromBridgeValue(requestedReason),
        )
        if (!awaitVoiceSessionCompletion(session)) {
          markVoiceSessionStopTimedOut(session)
          promise.resolve(createVoiceRecordingErrorResult(session.snapshot))
          return@execute
        }
        promise.resolve(createVoiceRecordingResult(session))
      }
    } catch (error: Exception) {
      promise.reject("SKIDS_VOICE_ACTIVITY_STOP_ERROR", error)
    }
  }

  @ReactMethod
  fun getVoiceRecordingLevel(promise: Promise) {
    val session = synchronized(voiceRecordingLock) {
      latestVoiceSession
    }
    val snapshot = session?.snapshot

    if (isReleased || snapshot == null || !snapshot.isRecording) {
      promise.resolve(null)
      return
    }

    promise.resolve(snapshot.level)
  }

  @ReactMethod
  fun promoteVoiceRecording(
    tempUri: String,
    recordingId: String,
    promise: Promise,
  ) {
    runVoiceRecordingStorageOperation(
      promise = promise,
      fallbackErrorCode = "SKIDS_VOICE_RECORDING_STORE_ERROR",
    ) {
      val normalizedRecordingId = validateVoiceRecordingId(recordingId)
      val source = resolveCompletedTempVoiceRecording(tempUri)
      val storageDirectory = durableVoiceRecordingDirectory(createIfMissing = true)
      deleteStaleVoiceRecordingStagingFiles(storageDirectory)
      val destination = File(
        storageDirectory,
        "$normalizedRecordingId.${source.extension.lowercase(Locale.ROOT)}",
      )
      val stagingFile = File(
        storageDirectory,
        ".$normalizedRecordingId-${UUID.randomUUID()}.tmp",
      )

      try {
        source.inputStream().use { input ->
          FileOutputStream(stagingFile).use { output ->
            input.copyTo(output)
            output.fd.sync()
          }
        }
        if (stagingFile.length() != source.length()) {
          throw VoiceRecordingStorageException(
            bridgeCode = "SKIDS_VOICE_RECORDING_STORE_ERROR",
            message = "The durable voice recording copy is incomplete",
          )
        }

        // Staging and destination are on the same no-backup filesystem. rename(2)
        // atomically installs the new take and safely replaces the previous take
        // when callers intentionally reuse a recording ID.
        Os.rename(stagingFile.absolutePath, destination.absolutePath)
        promise.resolve(Uri.fromFile(destination).toString())
      } finally {
        stagingFile.delete()
      }
    }
  }

  @ReactMethod
  fun deleteStoredVoiceRecording(uri: String, promise: Promise) {
    runVoiceRecordingStorageOperation(
      promise = promise,
      fallbackErrorCode = "SKIDS_VOICE_RECORDING_DELETE_ERROR",
    ) {
      val recordingFile = resolveDurableVoiceRecording(uri)
      if (!recordingFile.exists()) {
        promise.resolve(false)
        return@runVoiceRecordingStorageOperation
      }
      if (!recordingFile.isFile) {
        throw VoiceRecordingStorageException(
          bridgeCode = "SKIDS_VOICE_RECORDING_URI_INVALID",
          message = "The durable voice recording URI does not identify a file",
        )
      }
      if (!recordingFile.delete()) {
        throw VoiceRecordingStorageException(
          bridgeCode = "SKIDS_VOICE_RECORDING_DELETE_ERROR",
          message = "Unable to delete the durable voice recording",
        )
      }
      promise.resolve(true)
    }
  }

  @ReactMethod
  fun clearStoredVoiceRecordings(promise: Promise) {
    runVoiceRecordingStorageOperation(
      promise = promise,
      fallbackErrorCode = "SKIDS_VOICE_RECORDING_CLEAR_ERROR",
    ) {
      val storageDirectory = durableVoiceRecordingDirectory(createIfMissing = false)
      if (!storageDirectory.exists()) {
        promise.resolve(true)
        return@runVoiceRecordingStorageOperation
      }

      val children = storageDirectory.listFiles() ?: throw VoiceRecordingStorageException(
        bridgeCode = "SKIDS_VOICE_RECORDING_CLEAR_ERROR",
        message = "Unable to inspect the durable voice recording directory",
      )
      children
        .filter(::isOwnedVoiceRecordingStorageFile)
        .forEach { file ->
          if (!file.delete()) {
            throw VoiceRecordingStorageException(
              bridgeCode = "SKIDS_VOICE_RECORDING_CLEAR_ERROR",
              message = "Unable to clear all durable voice recordings",
            )
          }
        }
      promise.resolve(true)
    }
  }

  override fun invalidate() {
    if (!isReleased) {
      isReleased = true
      stopSpeechPlayer(resolvePendingPromise = true)
      synchronized(textToSpeechLock) {
        isTextToSpeechReady = false
        isTextToSpeechInitializationFinished = true
      }
      textToSpeech?.shutdown()
      textToSpeech = null
      stopBackgroundMusicPlayer()
      disposeLatestVoiceSession(deleteRecording = true)
      voiceControlExecutor.shutdownNow()
      soundPool.release()
      reactContext.removeLifecycleEventListener(this)
    }
    super.invalidate()
  }

  override fun onHostResume() {
    isHostPaused = false
  }

  override fun onHostPause() {
    isHostPaused = true
    synchronized(voiceRecordingLock) {
      latestVoiceSession
    }?.let { session ->
      requestVoiceSessionStop(session, VoiceActivityStopReason.INTERRUPTED)
    }
  }

  override fun onHostDestroy() {
    isHostPaused = true
    synchronized(voiceRecordingLock) {
      latestVoiceSession
    }?.let { session ->
      requestVoiceSessionStop(session, VoiceActivityStopReason.INTERRUPTED)
    }
  }

  private fun stopSpeechPlayer(resolvePendingPromise: Boolean = false) {
    val pendingPlayback = synchronized(speechPlaybackLock) {
      val playback = speechPlayback
      speechPlayback = null
      playback
    }

    pendingPlayback?.let { playback ->
      try {
        if (playback.player.isPlaying) {
          playback.player.stop()
        }
      } catch (_: Exception) {
      } finally {
        safelyReleasePlayer(playback.player)
      }

      if (resolvePendingPromise) {
        playback.promise.resolve(false)
      }
    }

    stopTextToSpeechPlayback(resolvePendingPromise)
  }

  private fun startTextToSpeechPlayback(playback: TextToSpeechPlayback) {
    val engine = textToSpeech
    if (engine == null || isReleased) {
      finishTextToSpeechPlayback(playback.utteranceId, didSpeak = false)
      return
    }

    val languageResult = engine.setLanguage(
      Locale.forLanguageTag(playback.language),
    )
    if (
      languageResult == TextToSpeech.LANG_MISSING_DATA ||
      languageResult == TextToSpeech.LANG_NOT_SUPPORTED
    ) {
      finishTextToSpeechPlayback(playback.utteranceId, didSpeak = false)
      return
    }

    engine.setPitch(playback.pitch)
    engine.setSpeechRate(playback.rate)
    val speakResult = synchronized(textToSpeechLock) {
      if (textToSpeechPlayback?.utteranceId != playback.utteranceId) {
        return@synchronized TextToSpeech.ERROR
      }
      engine.speak(
        playback.text,
        TextToSpeech.QUEUE_FLUSH,
        null,
        playback.utteranceId,
      )
    }
    if (speakResult == TextToSpeech.ERROR) {
      finishTextToSpeechPlayback(playback.utteranceId, didSpeak = false)
    }
  }

  private fun stopTextToSpeechPlayback(resolvePendingPromise: Boolean) {
    val pendingPlayback = synchronized(textToSpeechLock) {
      val playback = textToSpeechPlayback
      textToSpeechPlayback = null
      playback
    }

    try {
      textToSpeech?.stop()
    } catch (_: Exception) {
    }

    if (resolvePendingPromise) {
      pendingPlayback?.promise?.resolve(false)
    }
  }

  private fun finishTextToSpeechPlayback(
    utteranceId: String? = null,
    didSpeak: Boolean,
  ) {
    val completedPlayback = synchronized(textToSpeechLock) {
      val playback = textToSpeechPlayback
      if (
        playback == null ||
        (utteranceId != null && playback.utteranceId != utteranceId)
      ) {
        return@synchronized null
      }
      textToSpeechPlayback = null
      playback
    }

    completedPlayback?.promise?.resolve(didSpeak)
  }

  private fun startSpeechPlayerIfCurrent(player: MediaPlayer): Boolean =
    synchronized(speechPlaybackLock) {
      if (speechPlayback?.player !== player) {
        return@synchronized false
      }

      player.start()
      true
    }

  private fun finishSpeechPlayer(player: MediaPlayer, didPlay: Boolean) {
    val completedPlayback = synchronized(speechPlaybackLock) {
      val playback = speechPlayback
      if (playback?.player !== player) {
        return@synchronized null
      }

      speechPlayback = null
      playback
    }

    safelyReleasePlayer(player)
    completedPlayback?.promise?.resolve(didPlay)
  }

  private fun detachSpeechPlaybackForPromise(promise: Promise): SpeechPlayback? =
    synchronized(speechPlaybackLock) {
      val playback = speechPlayback
      if (playback?.promise !== promise) {
        return@synchronized null
      }

      speechPlayback = null
      playback
    }

  private fun safelyReleasePlayer(player: MediaPlayer?) {
    if (player == null) {
      return
    }

    try {
      player.release()
    } catch (_: Exception) {
    }
  }

  private fun stopBackgroundMusicPlayer() {
    val player = synchronized(backgroundMusicLock) {
      val currentPlayer = backgroundMusicPlayer
      backgroundMusicPlayer = null
      currentPlayer
    }

    try {
      if (player?.isPlaying == true) {
        player.stop()
      }
    } catch (_: Exception) {
    } finally {
      safelyReleasePlayer(player)
    }
  }

  private fun finishBackgroundMusicPlayer(player: MediaPlayer) {
    val shouldRelease = synchronized(backgroundMusicLock) {
      if (backgroundMusicPlayer !== player) {
        return@synchronized false
      }

      backgroundMusicPlayer = null
      true
    }

    if (shouldRelease) {
      safelyReleasePlayer(player)
    }
  }

  private fun setPlayerVolume(player: MediaPlayer?, volume: Float) {
    try {
      player?.setVolume(volume, volume)
    } catch (_: Exception) {
    }
  }

  private fun setPlayerDataSource(player: MediaPlayer, uri: String) {
    if (uri.startsWith("http://") || uri.startsWith("https://")) {
      player.setDataSource(uri)
      return
    }

    if (uri.startsWith("asset:/")) {
      val assetPath = URLDecoder.decode(
        uri
          .removePrefix("asset:/")
          .substringBefore("?")
          .removePrefix("/"),
        StandardCharsets.UTF_8.name(),
      )
      reactContext.assets.openFd(assetPath).use { descriptor ->
        player.setDataSource(
          descriptor.fileDescriptor,
          descriptor.startOffset,
          descriptor.length,
        )
      }
      return
    }

    if (setBundledRawResourceDataSource(player, uri)) {
      return
    }

    player.setDataSource(reactContext, Uri.parse(uri))
  }

  private fun setBundledRawResourceDataSource(
    player: MediaPlayer,
    uri: String,
  ): Boolean {
    if (!bundledRawResourceNamePattern.matches(uri)) {
      return false
    }

    val rawResourceId = reactContext.resources.getIdentifier(
      uri,
      "raw",
      reactContext.packageName,
    )
    return rawResourceId != 0 && setRawResourceDataSource(player, rawResourceId)
  }

  private fun setBackgroundMusicDataSource(player: MediaPlayer, uri: String) {
    if (
      isSungyBackgroundMusicUri(uri) &&
      setRawResourceDataSource(player, R.raw.sungy_background)
    ) {
      return
    }

    setPlayerDataSource(player, uri)
  }

  private fun setRawResourceDataSource(
    player: MediaPlayer,
    rawResourceId: Int,
  ): Boolean =
    try {
      val descriptor = reactContext.resources.openRawResourceFd(rawResourceId)
      if (descriptor == null) {
        false
      } else {
        descriptor.use {
          player.setDataSource(
            it.fileDescriptor,
            it.startOffset,
            it.length,
          )
        }
        true
      }
    } catch (error: Exception) {
      Log.w(tag, "Unable to open bundled raw audio resource", error)
      false
    }

  private fun isSungyBackgroundMusicUri(uri: String): Boolean {
    val normalizedUri = uri.lowercase()
    return normalizedUri.contains("sungy-background.mp3") ||
      normalizedUri.contains("sungybackground.mp3") ||
      normalizedUri.contains("src_assets_ui_audio_music_sungybackground")
  }

  private fun clampVolume(volume: Double): Float =
    volume
      .takeIf { it.isFinite() }
      ?.coerceIn(0.0, 1.0)
      ?.toFloat()
      ?: 0.16f

  private fun submitVoiceControl(
    promise: Promise,
    errorCode: String,
    action: () -> Unit,
  ) {
    try {
      voiceControlExecutor.execute {
        try {
          action()
        } catch (error: Exception) {
          promise.reject(errorCode, error)
        }
      }
    } catch (error: Exception) {
      promise.reject(errorCode, error)
    }
  }

  private fun runVoiceRecordingStorageOperation(
    promise: Promise,
    fallbackErrorCode: String,
    action: () -> Unit,
  ) {
    try {
      voiceControlExecutor.execute {
        try {
          action()
        } catch (error: VoiceRecordingStorageException) {
          promise.reject(error.bridgeCode, error.message, error)
        } catch (error: Exception) {
          promise.reject(fallbackErrorCode, error)
        }
      }
    } catch (error: Exception) {
      promise.reject(fallbackErrorCode, error)
    }
  }

  private fun validateVoiceRecordingId(recordingId: String): String {
    if (!VOICE_RECORDING_ID_PATTERN.matches(recordingId)) {
      throw VoiceRecordingStorageException(
        bridgeCode = "SKIDS_VOICE_RECORDING_ID_INVALID",
        message = "Voice recording IDs must contain 1-64 ASCII letters, digits, underscores, or hyphens",
      )
    }
    return recordingId
  }

  private fun resolveCompletedTempVoiceRecording(uriString: String): File {
    val source = resolveLocalFileUri(uriString)
    val cacheDirectory = reactContext.cacheDir.canonicalFile
    if (
      source.parentFile != cacheDirectory ||
      !source.name.startsWith(VOICE_RECORDING_TEMP_PREFIX) ||
      source.extension.lowercase(Locale.ROOT) != VOICE_RECORDING_ANDROID_EXTENSION
    ) {
      throw VoiceRecordingStorageException(
        bridgeCode = "SKIDS_VOICE_RECORDING_SOURCE_INVALID",
        message = "The source URI is not a Sungy temporary voice recording",
      )
    }

    val isRecordingActive = synchronized(voiceRecordingLock) {
      latestVoiceSession?.let { session ->
        session.recordingFile.canonicalFile == source &&
          session.completionLatch.count > 0L
      } == true
    }
    if (isRecordingActive) {
      throw VoiceRecordingStorageException(
        bridgeCode = "SKIDS_VOICE_RECORDING_SOURCE_INVALID",
        message = "The temporary voice recording has not finished",
      )
    }
    if (!source.exists()) {
      throw VoiceRecordingStorageException(
        bridgeCode = "SKIDS_VOICE_RECORDING_SOURCE_MISSING",
        message = "The temporary voice recording no longer exists",
      )
    }
    if (!source.isFile || !source.canRead() || source.length() <= 0L) {
      throw VoiceRecordingStorageException(
        bridgeCode = "SKIDS_VOICE_RECORDING_SOURCE_INVALID",
        message = "The temporary voice recording is not a readable audio file",
      )
    }
    return source
  }

  private fun resolveDurableVoiceRecording(uriString: String): File {
    val recordingFile = resolveLocalFileUri(uriString)
    val storageDirectory = durableVoiceRecordingDirectory(createIfMissing = false)
    if (
      recordingFile.parentFile != storageDirectory ||
      recordingFile.extension.lowercase(Locale.ROOT) != VOICE_RECORDING_ANDROID_EXTENSION
    ) {
      throw VoiceRecordingStorageException(
        bridgeCode = "SKIDS_VOICE_RECORDING_URI_INVALID",
        message = "The URI is not a Sungy durable voice recording",
      )
    }
    validateVoiceRecordingId(recordingFile.nameWithoutExtension)
    return recordingFile
  }

  private fun resolveLocalFileUri(uriString: String): File {
    val uri = try {
      Uri.parse(uriString)
    } catch (error: Exception) {
      throw VoiceRecordingStorageException(
        bridgeCode = "SKIDS_VOICE_RECORDING_URI_INVALID",
        message = "The voice recording URI is invalid",
        cause = error,
      )
    }
    if (
      uri.scheme != "file" ||
      !uri.authority.isNullOrEmpty() ||
      uri.path.isNullOrEmpty() ||
      uri.query != null ||
      uri.fragment != null
    ) {
      throw VoiceRecordingStorageException(
        bridgeCode = "SKIDS_VOICE_RECORDING_URI_INVALID",
        message = "Voice recording URIs must be local file URIs",
      )
    }
    return try {
      File(uri.path!!).canonicalFile
    } catch (error: Exception) {
      throw VoiceRecordingStorageException(
        bridgeCode = "SKIDS_VOICE_RECORDING_URI_INVALID",
        message = "The voice recording path is invalid",
        cause = error,
      )
    }
  }

  private fun durableVoiceRecordingDirectory(createIfMissing: Boolean): File {
    val noBackupDirectory = reactContext.noBackupFilesDir.canonicalFile
    val storageDirectory = File(
      noBackupDirectory,
      VOICE_RECORDING_STORAGE_DIRECTORY,
    ).canonicalFile
    if (storageDirectory.parentFile != noBackupDirectory) {
      throw VoiceRecordingStorageException(
        bridgeCode = "SKIDS_VOICE_RECORDING_STORE_ERROR",
        message = "The durable voice recording directory is invalid",
      )
    }
    if (createIfMissing && !storageDirectory.exists() && !storageDirectory.mkdirs()) {
      throw VoiceRecordingStorageException(
        bridgeCode = "SKIDS_VOICE_RECORDING_STORE_ERROR",
        message = "Unable to create the durable voice recording directory",
      )
    }
    if (storageDirectory.exists() && !storageDirectory.isDirectory) {
      throw VoiceRecordingStorageException(
        bridgeCode = "SKIDS_VOICE_RECORDING_STORE_ERROR",
        message = "The durable voice recording path is not a directory",
      )
    }
    return storageDirectory
  }

  private fun deleteStaleVoiceRecordingStagingFiles(storageDirectory: File) {
    val staleFiles = storageDirectory.listFiles()
      ?.filter(::isVoiceRecordingStagingFile)
      ?: throw VoiceRecordingStorageException(
        bridgeCode = "SKIDS_VOICE_RECORDING_STORE_ERROR",
        message = "Unable to inspect the durable voice recording directory",
      )
    staleFiles.forEach { file ->
      if (!file.delete()) {
        throw VoiceRecordingStorageException(
          bridgeCode = "SKIDS_VOICE_RECORDING_STORE_ERROR",
          message = "Unable to remove an incomplete voice recording copy",
        )
      }
    }
  }

  private fun isOwnedVoiceRecordingStorageFile(file: File): Boolean =
    isVoiceRecordingStagingFile(file) ||
      (
        file.extension.lowercase(Locale.ROOT) == VOICE_RECORDING_ANDROID_EXTENSION &&
          VOICE_RECORDING_ID_PATTERN.matches(file.nameWithoutExtension)
      )

  private fun isVoiceRecordingStagingFile(file: File): Boolean =
    VOICE_RECORDING_STAGING_PATTERN.matches(file.name)

  private fun startVoiceRecordingInternal(
    options: VoiceActivityRecordingOptions,
  ): VoiceRecordingSession {
    check(!isReleased) { "SkidsAudio is released" }
    check(!isHostPaused) { "Cannot record while the host is paused" }
    stopSpeechPlayer(resolvePendingPromise = true)
    disposeLatestVoiceSession(deleteRecording = true, requireCompletion = true)
    check(!isReleased) { "SkidsAudio is released" }

    val recordingFile = File.createTempFile(
      "skids_voice_",
      ".wav",
      reactContext.cacheDir,
    )
    var audioRecordConfiguration: AudioRecordConfiguration? = null
    var waveWriter: PcmWaveFileWriter? = null
    var noiseSuppressor: NoiseSuppressor? = null
    var targetMatcher: OnDeviceTargetWordMatcher? = null
    var session: VoiceRecordingSession? = null

    try {
      audioRecordConfiguration = createStartedAudioRecordConfiguration()
      waveWriter = PcmWaveFileWriter(
        file = recordingFile,
        sampleRate = audioRecordConfiguration.sampleRate,
      )
      noiseSuppressor = audioRecordConfiguration.noiseSuppressor
      val sessionId = UUID.randomUUID().toString()
      val detector = LightweightVoiceActivityDetector(
        sessionId = sessionId,
        sampleRate = audioRecordConfiguration.sampleRate,
        options = options,
      )
      targetMatcher = options.targetText?.let { targetText ->
        OnDeviceTargetWordMatcher(
          context = reactContext,
          targetText = targetText,
          targetLocale = options.targetLocale,
          sampleRate = audioRecordConfiguration.sampleRate,
        )
      }
      session = VoiceRecordingSession(
        sessionId = sessionId,
        recordingFile = recordingFile,
        audioRecord = audioRecordConfiguration.audioRecord,
        waveWriter = waveWriter,
        noiseSuppressor = noiseSuppressor,
        detector = detector,
        targetMatcher = targetMatcher,
        targetMatchPostRollMs = options.targetMatchPostRollMs,
        sampleRate = audioRecordConfiguration.sampleRate,
        autoEndpointEnabled = options.autoEndpointEnabled,
      )

      synchronized(voiceRecordingLock) {
        latestVoiceSession = session
      }
      val worker = Thread(
        { captureVoiceRecording(session) },
        "SkidsVoiceCapture-${sessionId.take(8)}",
      ).apply {
        isDaemon = true
      }
      session.worker = worker
      worker.start()
      if (isHostPaused) {
        requestVoiceSessionStop(session, VoiceActivityStopReason.INTERRUPTED)
      }
      return session
    } catch (error: Exception) {
      synchronized(voiceRecordingLock) {
        if (latestVoiceSession === session) {
          latestVoiceSession = null
        }
      }
      try {
        noiseSuppressor?.release()
      } catch (_: Exception) {
      }
      targetMatcher?.close()
      safelyStopAndReleaseAudioRecord(audioRecordConfiguration?.audioRecord)
      waveWriter?.abort()
      recordingFile.delete()
      throw error
    }
  }

  private fun createStartedAudioRecordConfiguration(): AudioRecordConfiguration {
    if (
      reactContext.checkSelfPermission(Manifest.permission.RECORD_AUDIO) !=
      PackageManager.PERMISSION_GRANTED
    ) {
      throw SecurityException("Record-audio permission is not granted")
    }

    val sources = intArrayOf(
      MediaRecorder.AudioSource.VOICE_RECOGNITION,
      MediaRecorder.AudioSource.MIC,
    )
    val sampleRates = intArrayOf(16_000, 44_100, 48_000)

    for (source in sources) {
      for (sampleRate in sampleRates) {
        val minBufferSize = AudioRecord.getMinBufferSize(
          sampleRate,
          AudioFormat.CHANNEL_IN_MONO,
          AudioFormat.ENCODING_PCM_16BIT,
        )
        if (minBufferSize <= 0) {
          continue
        }

        val frameSizeBytes = max(1, sampleRate / VOICE_FRAMES_PER_SECOND) * 2
        val bufferSizeBytes = max(minBufferSize, frameSizeBytes * 8)
        val audioRecord = try {
          AudioRecord.Builder()
            .setAudioSource(source)
            .setAudioFormat(
              AudioFormat.Builder()
                .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                .setSampleRate(sampleRate)
                .setChannelMask(AudioFormat.CHANNEL_IN_MONO)
                .build(),
            )
            .setBufferSizeInBytes(bufferSizeBytes)
            .build()
        } catch (error: Exception) {
          Log.w(
            tag,
            "Unable to create AudioRecord source=$source sampleRate=$sampleRate",
            error,
          )
          null
        }

        if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
          try {
            audioRecord?.release()
          } catch (_: Exception) {
          }
          continue
        }

        val noiseSuppressor = createNoiseSuppressor(audioRecord)
        try {
          audioRecord.startRecording()
          if (audioRecord.recordingState == AudioRecord.RECORDSTATE_RECORDING) {
            return AudioRecordConfiguration(
              audioRecord = audioRecord,
              sampleRate = sampleRate,
              noiseSuppressor = noiseSuppressor,
            )
          }
        } catch (error: Exception) {
          Log.w(
            tag,
            "Unable to start AudioRecord source=$source sampleRate=$sampleRate",
            error,
          )
        } finally {
          if (audioRecord.recordingState != AudioRecord.RECORDSTATE_RECORDING) {
            try {
              noiseSuppressor?.release()
            } catch (_: Exception) {
            }
            safelyStopAndReleaseAudioRecord(audioRecord)
          }
        }
      }
    }

    throw IllegalStateException("Unable to initialize AudioRecord")
  }

  private fun createNoiseSuppressor(audioRecord: AudioRecord): NoiseSuppressor? {
    if (!NoiseSuppressor.isAvailable()) {
      return null
    }

    return try {
      NoiseSuppressor.create(audioRecord.audioSessionId)?.also { suppressor ->
        try {
          suppressor.enabled = true
        } catch (error: Exception) {
          Log.w(tag, "Unable to enable noise suppression", error)
        }
      }
    } catch (error: Exception) {
      Log.w(tag, "Unable to attach noise suppression", error)
      null
    }
  }

  private fun captureVoiceRecording(session: VoiceRecordingSession) {
    val frameSampleCount = max(1, session.sampleRate / VOICE_FRAMES_PER_SECOND)
    val samples = ShortArray(frameSampleCount)

    try {
      while (!session.stopRequested.get()) {
        val samplesRead = session.audioRecord.read(
          samples,
          0,
          samples.size,
          AudioRecord.READ_BLOCKING,
        )
        if (samplesRead > 0) {
          session.waveWriter.write(samples, samplesRead)
          session.targetMatcher?.acceptPcm(samples, samplesRead)
          val elapsedMs = voiceSessionElapsedMs(session)
          val detectorSnapshot = session.detector.process(samples, samplesRead, elapsedMs)
          val snapshot = decorateVoiceSnapshot(session, detectorSnapshot)
          val targetMatchPostRollStartedAtMs =
            session.targetMatchPostRollStartedAtMs ?: if (
              snapshot.hadSpeech &&
              snapshot.targetMatchState == TargetWordMatchState.MATCHED
            ) {
              elapsedMs.also { startedAtMs ->
                session.targetMatchPostRollStartedAtMs = startedAtMs
              }
            } else {
              null
            }
          val shouldStopForTargetMatch = targetMatchPostRollStartedAtMs != null &&
            elapsedMs - targetMatchPostRollStartedAtMs >= session.targetMatchPostRollMs

          if (session.autoEndpointEnabled) {
            val stopReason = when {
              snapshot.shouldStop -> snapshot.stopReason
              shouldStopForTargetMatch -> VoiceActivityStopReason.TARGET_WORD_MATCH
              else -> null
            }
            if (stopReason != null) {
              session.requestedStopReason.compareAndSet(null, stopReason)
              session.stopRequested.set(true)
            }
          }
          session.snapshot = snapshot
          continue
        }

        if (!session.stopRequested.get()) {
          throw IllegalStateException("AudioRecord read failed with code $samplesRead")
        }
      }
    } catch (error: Exception) {
      if (!session.stopRequested.get()) {
        Log.w(tag, "Voice capture failed", error)
        session.requestedStopReason.set(VoiceActivityStopReason.ERROR)
        session.stopRequested.set(true)
      }
    } finally {
      finalizeVoiceSession(session)
    }
  }

  private fun finalizeVoiceSession(session: VoiceRecordingSession) {
    if (!session.finalizationStarted.compareAndSet(false, true)) {
      return
    }

    var didWritePlayableFile = true
    try {
      session.targetMatcher?.close()
      safelyStopAudioRecord(session.audioRecord)
      try {
        session.noiseSuppressor?.release()
      } catch (_: Exception) {
      }
      try {
        session.audioRecord.release()
      } catch (_: Exception) {
      }

      try {
        session.waveWriter.finish()
      } catch (error: Exception) {
        Log.w(tag, "Unable to finalize voice recording WAV", error)
        didWritePlayableFile = false
        session.requestedStopReason.set(VoiceActivityStopReason.ERROR)
        session.waveWriter.abort()
      }

      val reason = session.requestedStopReason.get() ?: VoiceActivityStopReason.ERROR
      session.snapshot = decorateVoiceSnapshot(
        session,
        session.detector.finish(
          reason = reason,
          elapsedMs = voiceSessionElapsedMs(session),
        ),
      )
      if (!didWritePlayableFile) {
        session.recordingUri = null
      }
    } finally {
      session.completionLatch.countDown()
    }
  }

  private fun requestVoiceSessionStop(
    session: VoiceRecordingSession,
    reason: VoiceActivityStopReason,
  ) {
    if (session.completionLatch.count == 0L) {
      return
    }

    session.requestedStopReason.compareAndSet(null, reason)
    session.stopRequested.set(true)
    safelyStopAudioRecord(session.audioRecord)
  }

  private fun awaitVoiceSessionCompletion(
    session: VoiceRecordingSession,
    timeoutMs: Long = VOICE_STOP_TIMEOUT_MS,
  ): Boolean {
    val didComplete = try {
      session.completionLatch.await(timeoutMs, TimeUnit.MILLISECONDS)
    } catch (_: InterruptedException) {
      Thread.currentThread().interrupt()
      false
    }
    if (!didComplete) {
      Log.w(tag, "Timed out stopping voice session ${session.sessionId}")
    }
    return didComplete
  }

  private fun markVoiceSessionStopTimedOut(session: VoiceRecordingSession) {
    session.requestedStopReason.set(VoiceActivityStopReason.ERROR)
    session.targetMatcher?.close()
    // The worker still owns AudioRecord and the WAV writer. Do not race its
    // cleanup, but never expose a file whose header may not be finalized.
    session.recordingUri = null
  }

  private fun disposeLatestVoiceSession(
    deleteRecording: Boolean,
    requireCompletion: Boolean = false,
  ) {
    val session = synchronized(voiceRecordingLock) {
      latestVoiceSession
    } ?: return

    requestVoiceSessionStop(session, VoiceActivityStopReason.INTERRUPTED)
    val didComplete = awaitVoiceSessionCompletion(session)
    if (requireCompletion && !didComplete) {
      throw IllegalStateException("Previous voice recording did not stop")
    }
    if (deleteRecording) {
      session.recordingFile.delete()
      session.recordingUri = null
    }
    synchronized(voiceRecordingLock) {
      if (latestVoiceSession === session) {
        latestVoiceSession = null
      }
    }
  }

  private fun createVoiceRecordingResult(session: VoiceRecordingSession): WritableMap =
    Arguments.createMap().apply {
      session.recordingUri?.let { uri ->
        putString("uri", uri)
      } ?: putNull("uri")
      putMap("finalSnapshot", session.snapshot.toWritableMap())
    }

  private fun createVoiceRecordingErrorResult(
    lastSnapshot: VoiceActivitySnapshot? = null,
  ): WritableMap = Arguments.createMap().apply {
    putNull("uri")
    putString("stopReason", VoiceActivityStopReason.ERROR.bridgeValue)
    if (lastSnapshot == null) {
      putNull("finalSnapshot")
    } else {
      putMap(
        "finalSnapshot",
        lastSnapshot.copy(
          sequence = lastSnapshot.sequence + 1L,
          phase = VoiceActivityPhase.ENDED,
          isRecording = false,
          shouldStop = true,
          stopReason = VoiceActivityStopReason.ERROR,
        ).toWritableMap(),
      )
    }
  }

  private fun voiceSessionElapsedMs(session: VoiceRecordingSession): Long =
    max(
      0L,
      SystemClock.elapsedRealtime() - session.startedAtMs,
    )

  private fun decorateVoiceSnapshot(
    session: VoiceRecordingSession,
    snapshot: VoiceActivitySnapshot,
  ): VoiceActivitySnapshot {
    val targetSnapshot = session.targetMatcher?.currentSnapshot() ?: return snapshot
    return snapshot.copy(
      targetMatchState = targetSnapshot.state,
      targetMatchConfidence = targetSnapshot.confidence,
    )
  }

  private fun safelyStopAudioRecord(audioRecord: AudioRecord?) {
    try {
      if (audioRecord?.recordingState == AudioRecord.RECORDSTATE_RECORDING) {
        audioRecord.stop()
      }
    } catch (_: Exception) {
    }
  }

  private fun safelyStopAndReleaseAudioRecord(audioRecord: AudioRecord?) {
    safelyStopAudioRecord(audioRecord)
    try {
      audioRecord?.release()
    } catch (_: Exception) {
    }
  }

  private companion object {
    val VOICE_RECORDING_ID_PATTERN = Regex("^[A-Za-z0-9_-]{1,64}$")
    val VOICE_RECORDING_STAGING_PATTERN = Regex(
      "^\\.[A-Za-z0-9_-]{1,64}-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\\.tmp$",
    )
    const val VOICE_RECORDING_ANDROID_EXTENSION = "wav"
    const val VOICE_RECORDING_STORAGE_DIRECTORY = "voice-recordings"
    const val VOICE_RECORDING_TEMP_PREFIX = "skids_voice_"
    const val VOICE_FRAMES_PER_SECOND = 50
    const val VOICE_STOP_TIMEOUT_MS = 3_000L
  }

  private class VoiceRecordingStorageException(
    val bridgeCode: String,
    message: String,
    cause: Throwable? = null,
  ) : Exception(message, cause)
}
