import Foundation
import React

@objc(SkidsAppInfo)
class SkidsAppInfo: NSObject {
  static func moduleName() -> String! {
    return "SkidsAppInfo"
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc func getVersion(
    _ resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    guard
      let version = Bundle.main.object(
        forInfoDictionaryKey: "CFBundleShortVersionString"
      ) as? String,
      !version.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    else {
      reject(
        "SKIDS_APP_INFO_VERSION_UNAVAILABLE",
        "The app version is unavailable.",
        nil
      )
      return
    }

    resolve(version)
  }
}

