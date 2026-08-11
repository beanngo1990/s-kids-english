package com.seduforge.skidsenglish

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.seduforge.skidsenglish.assets.SkidsAssetCachePackage
import com.seduforge.skidsenglish.appinfo.SkidsAppInfoPackage
import com.seduforge.skidsenglish.audio.SkidsAudioPackage

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          add(SkidsAppInfoPackage())
          add(SkidsAssetCachePackage())
          add(SkidsAudioPackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
