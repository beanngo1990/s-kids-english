import Foundation
import React
import StoreKit
import UIKit

@objc(SkidsAppReview)
class SkidsAppReview: NSObject {
  static func moduleName() -> String! {
    return "SkidsAppReview"
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc func requestReview(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async {
      guard
        let windowScene = UIApplication.shared.connectedScenes
          .compactMap({ $0 as? UIWindowScene })
          .first(where: { $0.activationState == .foregroundActive })
      else {
        reject(
          "SKIDS_APP_REVIEW_SCENE_UNAVAILABLE",
          "A foreground window scene is unavailable.",
          nil
        )
        return
      }

      if #available(iOS 16.0, *) {
        AppStore.requestReview(in: windowScene)
      } else {
        SKStoreReviewController.requestReview(in: windowScene)
      }

      // StoreKit intentionally does not reveal whether the prompt was shown
      // or whether the parent submitted a rating.
      resolve(true)
    }
  }
}
