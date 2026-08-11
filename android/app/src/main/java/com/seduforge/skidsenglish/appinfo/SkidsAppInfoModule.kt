package com.seduforge.skidsenglish.appinfo

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.seduforge.skidsenglish.BuildConfig

class SkidsAppInfoModule(
  reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "SkidsAppInfo"

  @ReactMethod
  fun getVersion(promise: Promise) {
    promise.resolve(BuildConfig.VERSION_NAME)
  }
}

