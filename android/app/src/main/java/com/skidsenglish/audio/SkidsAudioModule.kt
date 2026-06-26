package com.skidsenglish.audio

import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.SoundPool
import android.net.Uri
import android.util.Log
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.skidsenglish.R

class SkidsAudioModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

  private val tag = "SkidsAudio"

  private val soundPool: SoundPool
  private val soundIds = mutableMapOf<String, Int>()
  private var speechPlayer: MediaPlayer? = null
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
      stopSpeechPlayer()

      val player = MediaPlayer()
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
        promise.resolve(true)
      }
      player.setOnCompletionListener {
        if (speechPlayer === it) {
          speechPlayer = null
        }
        it.release()
      }
      player.setOnErrorListener { mediaPlayer, _, _ ->
        if (speechPlayer === mediaPlayer) {
          speechPlayer = null
        }
        Log.w(tag, "Unable to play audio uri: $uri")
        mediaPlayer.release()
        promise.resolve(false)
        true
      }

      speechPlayer = player
      player.prepareAsync()
    } catch (error: Exception) {
      stopSpeechPlayer()
      promise.reject("SKIDS_AUDIO_PLAY_URI_ERROR", error)
    }
  }

  @ReactMethod
  fun stopSpeech(promise: Promise) {
    stopSpeechPlayer()
    promise.resolve(true)
  }

  override fun invalidate() {
    if (!isReleased) {
      isReleased = true
      stopSpeechPlayer()
      soundPool.release()
      reactContext.removeLifecycleEventListener(this)
    }
    super.invalidate()
  }

  override fun onHostResume() = Unit

  override fun onHostPause() = Unit

  override fun onHostDestroy() = Unit

  private fun stopSpeechPlayer() {
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
  }
}
