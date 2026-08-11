package com.seduforge.skidsenglish.review

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.play.core.review.ReviewManagerFactory

class SkidsAppReviewModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "SkidsAppReview"

  @ReactMethod
  fun requestReview(promise: Promise) {
    val activity = reactContext.currentActivity
    if (activity == null) {
      promise.reject(
        "SKIDS_APP_REVIEW_ACTIVITY_UNAVAILABLE",
        "The current activity is unavailable.",
      )
      return
    }

    val reviewManager = ReviewManagerFactory.create(reactContext)
    reviewManager.requestReviewFlow().addOnCompleteListener { requestTask ->
      if (!requestTask.isSuccessful) {
        promise.reject(
          "SKIDS_APP_REVIEW_REQUEST_FAILED",
          "Google Play could not prepare the review flow.",
          requestTask.exception,
        )
        return@addOnCompleteListener
      }

      activity.runOnUiThread {
        reviewManager
          .launchReviewFlow(activity, requestTask.result)
          .addOnCompleteListener {
            // Google Play intentionally does not reveal whether the card was
            // shown or whether the parent submitted a review.
            promise.resolve(true)
          }
      }
    }
  }
}
