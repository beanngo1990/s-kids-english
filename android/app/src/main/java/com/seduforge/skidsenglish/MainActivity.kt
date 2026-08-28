package com.seduforge.skidsenglish

import android.content.pm.ActivityInfo
import android.content.res.Configuration
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.swmansion.rnscreens.fragment.restoration.RNScreensFragmentFactory

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    supportFragmentManager.fragmentFactory = RNScreensFragmentFactory()
    applyDeviceOrientationPolicy()
    super.onCreate(savedInstanceState)
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    applyDeviceOrientationPolicy()
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "SKidsEnglish"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  private fun applyDeviceOrientationPolicy() {
    requestedOrientation =
        if (resources.configuration.smallestScreenWidthDp >= TABLET_MIN_WIDTH_DP) {
          ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
        } else {
          ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
        }
  }

  private companion object {
    const val TABLET_MIN_WIDTH_DP = 600
  }
}
