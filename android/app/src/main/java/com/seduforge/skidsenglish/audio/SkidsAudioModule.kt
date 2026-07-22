package com.seduforge.skidsenglish.audio

import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.MediaRecorder
import android.media.SoundPool
import android.net.Uri
import android.util.Log
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.seduforge.skidsenglish.R
import java.io.File

class SkidsAudioModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

  private val tag = "SkidsAudio"

  private data class SpeechPlayback(
    val player: MediaPlayer,
    val promise: Promise,
  )

  private val soundPool: SoundPool
  private val soundIds = mutableMapOf<String, Int>()
  private val speechPlaybackLock = Any()
  private var speechPlayback: SpeechPlayback? = null
  private var voiceRecorder: MediaRecorder? = null
  private var voiceRecordingFile: File? = null
  private var isReleased = false

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
      if (uri.startsWith("http://") || uri.startsWith("https://")) {
        player.setDataSource(uri)
      } else {
        player.setDataSource(reactContext, Uri.parse(uri))
      }
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
  fun stopSpeech(promise: Promise) {
    stopSpeechPlayer(resolvePendingPromise = true)
    promise.resolve(true)
  }

  @ReactMethod
  fun startVoiceRecording(promise: Promise) {
    if (isReleased) {
      promise.resolve(null)
      return
    }

    try {
      stopSpeechPlayer(resolvePendingPromise = true)
      stopVoiceRecorder(deleteRecording = true)

      val recordingFile = File.createTempFile(
        "skids_voice_",
        ".m4a",
        reactContext.cacheDir,
      )
      val recorder = createMediaRecorder()

      recorder.setAudioSource(MediaRecorder.AudioSource.MIC)
      recorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
      recorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
      recorder.setAudioEncodingBitRate(96000)
      recorder.setAudioSamplingRate(44100)
      recorder.setOutputFile(recordingFile.absolutePath)
      recorder.prepare()
      recorder.start()

      voiceRecorder = recorder
      voiceRecordingFile = recordingFile
      promise.resolve(Uri.fromFile(recordingFile).toString())
    } catch (error: Exception) {
      stopVoiceRecorder(deleteRecording = true)
      promise.reject("SKIDS_VOICE_RECORD_START_ERROR", error)
    }
  }

  @ReactMethod
  fun stopVoiceRecording(promise: Promise) {
    if (isReleased) {
      promise.resolve(null)
      return
    }

    val recordingFile = voiceRecordingFile

    try {
      voiceRecorder?.stop()
      promise.resolve(recordingFile?.let { Uri.fromFile(it).toString() })
    } catch (error: Exception) {
      recordingFile?.delete()
      promise.resolve(null)
    } finally {
      voiceRecorder?.release()
      voiceRecorder = null
      voiceRecordingFile = null
    }
  }

  @ReactMethod
  fun getVoiceRecordingLevel(promise: Promise) {
    val recorder = voiceRecorder

    if (isReleased || recorder == null) {
      promise.resolve(null)
      return
    }

    try {
      val amplitude = recorder.maxAmplitude
      promise.resolve((amplitude / 32767.0).coerceIn(0.0, 1.0))
    } catch (_: Exception) {
      promise.resolve(null)
    }
  }

  override fun invalidate() {
    if (!isReleased) {
      isReleased = true
      stopSpeechPlayer(resolvePendingPromise = true)
      stopVoiceRecorder(deleteRecording = true)
      soundPool.release()
      reactContext.removeLifecycleEventListener(this)
    }
    super.invalidate()
  }

  override fun onHostResume() = Unit

  override fun onHostPause() = Unit

  override fun onHostDestroy() = Unit

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

  @Suppress("DEPRECATION")
  private fun createMediaRecorder(): MediaRecorder = MediaRecorder()

  private fun stopVoiceRecorder(deleteRecording: Boolean) {
    voiceRecorder?.let { recorder ->
      try {
        recorder.stop()
      } catch (_: Exception) {
      } finally {
        recorder.release()
      }
    }

    if (deleteRecording) {
      voiceRecordingFile?.delete()
    }

    voiceRecorder = null
    voiceRecordingFile = null
  }
}
