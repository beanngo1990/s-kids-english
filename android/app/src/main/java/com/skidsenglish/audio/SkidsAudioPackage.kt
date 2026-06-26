@file:Suppress("OVERRIDE_DEPRECATION")

package com.skidsenglish.audio

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class SkidsAudioPackage : ReactPackage {
  @Suppress("DEPRECATION")
  override fun createNativeModules(
    reactContext: ReactApplicationContext,
  ): List<NativeModule> = listOf(SkidsAudioModule(reactContext))

  @Suppress("DEPRECATION")
  override fun createViewManagers(
    reactContext: ReactApplicationContext,
  ): List<ViewManager<*, *>> = emptyList()
}
