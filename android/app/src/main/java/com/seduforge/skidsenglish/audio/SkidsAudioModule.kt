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

  private val soundPool: SoundPool
  private val soundIds = mutableMapOf<String, Int>()
  private var speechPlayer: MediaPlayer? = null
  private var speechPromise: Promise? = null
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

    try {
      stopSpeechPlayer(resolvePendingPromise = true)

      val player = MediaPlayer()
      speechPromise = promise
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
        it.start()
      }
      player.setOnCompletionListener {
        if (speechPlayer === it) {
          speechPlayer = null
          resolveSpeechPromise(true)
        }
        it.release()
      }
      player.setOnErrorListener { mediaPlayer, _, _ ->
        if (speechPlayer === mediaPlayer) {
          speechPlayer = null
        }
        Log.w(tag, "Unable to play audio uri: $uri")
        mediaPlayer.release()
        resolveSpeechPromise(false)
        true
      }

      speechPlayer = player
      player.prepareAsync()
    } catch (error: Exception) {
      stopSpeechPlayer(resolvePendingPromise = false)
      if (speechPromise === promise) {
        speechPromise = null
      }
      promise.reject("SKIDS_AUDIO_PLAY_URI_ERROR", error)
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
    speechPlayer?.let { player ->
      try {
        if (player.isPlaying) {
          player.stop()
        }
      } catch (_: Exception) {
      } finally {
        player.release()
      }
    }
    speechPlayer = null
    if (resolvePendingPromise) {
      resolveSpeechPromise(false)
    }
  }

  private fun resolveSpeechPromise(value: Boolean) {
    speechPromise?.resolve(value)
    speechPromise = null
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
