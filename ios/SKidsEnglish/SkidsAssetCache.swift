import CryptoKit
import Foundation
import React

@objc(SkidsAssetCache)
class SkidsAssetCache: NSObject {
  private var appCheckToken: String?
  private let fileLock = NSLock()
  private let workQueue = DispatchQueue(
    label: "com.seduforge.skidsenglish.asset-cache",
    qos: .utility,
    attributes: .concurrent
  )

  static func moduleName() -> String! {
    return "SkidsAssetCache"
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc func setAppCheckToken(_ token: String) {
    fileLock.lock()
    defer { fileLock.unlock() }
    self.appCheckToken = token.isEmpty ? nil : token
  }


  @objc func getCachedAssetUrl(
    _ remoteUrl: String,
    cacheKey: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let sourceUrl = URL(string: remoteUrl) else {
      reject(
        "SKIDS_ASSET_CACHE_URL_ERROR",
        "Invalid remote asset URL.",
        nil
      )
      return
    }

    let destinationUrl = cachedFileUrl(cacheKey: cacheKey, remoteUrl: remoteUrl)
    if isUsable(destinationUrl) {
      resolve(destinationUrl.absoluteString)
      return
    }

    cacheAsset(sourceUrl: sourceUrl, destinationUrl: destinationUrl) { result in
      switch result {
      case .success(let cachedUrl):
        resolve(cachedUrl.absoluteString)
      case .failure(let error):
        reject("SKIDS_ASSET_CACHE_ERROR", error.localizedDescription, error)
      }
    }
  }

  @objc func prefetchAssets(
    _ assets: [NSDictionary],
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: @escaping RCTPromiseRejectBlock
  ) {
    let validAssets = assets.compactMap { asset -> (URL, URL)? in
      guard
        let remoteUrl = asset["remoteUrl"] as? String,
        let cacheKey = asset["cacheKey"] as? String,
        let sourceUrl = URL(string: remoteUrl)
      else {
        return nil
      }

      return (
        sourceUrl,
        cachedFileUrl(cacheKey: cacheKey, remoteUrl: remoteUrl)
      )
    }

    guard !validAssets.isEmpty else {
      resolve(false)
      return
    }

    let group = DispatchGroup()
    let resultLock = NSLock()
    var allAssetsReady = true

    for (sourceUrl, destinationUrl) in validAssets {
      group.enter()
      cacheAsset(sourceUrl: sourceUrl, destinationUrl: destinationUrl) { result in
        if case .failure = result {
          resultLock.lock()
          allAssetsReady = false
          resultLock.unlock()
        }
        group.leave()
      }
    }

    group.notify(queue: workQueue) {
      resultLock.lock()
      let ready = allAssetsReady
      resultLock.unlock()
      resolve(ready)
    }
  }

  @objc func clearCache(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    workQueue.async { [weak self] in
      guard let self else {
        resolve(false)
        return
      }

      fileLock.lock()
      defer { fileLock.unlock() }

      do {
        if FileManager.default.fileExists(atPath: cacheRoot.path) {
          try FileManager.default.removeItem(at: cacheRoot)
        }
        resolve(true)
      } catch {
        reject("SKIDS_ASSET_CACHE_CLEAR_ERROR", error.localizedDescription, error)
      }
    }
  }

  private var cacheRoot: URL {
    let cachesDirectory = FileManager.default.urls(
      for: .cachesDirectory,
      in: .userDomainMask
    )[0]
    return cachesDirectory.appendingPathComponent(
      "skids_remote_assets",
      isDirectory: true
    )
  }

  private func cachedFileUrl(cacheKey: String, remoteUrl: String) -> URL {
    let fileExtension = (cacheKey as NSString).pathExtension.isEmpty
      ? "asset"
      : (cacheKey as NSString).pathExtension
    let digest = SHA256.hash(data: Data("\(cacheKey)|\(remoteUrl)".utf8))
      .map { String(format: "%02x", $0) }
      .joined()

    return cacheRoot.appendingPathComponent("\(digest).\(fileExtension)")
  }

  private func isUsable(_ fileUrl: URL) -> Bool {
    guard
      let attributes = try? FileManager.default.attributesOfItem(
        atPath: fileUrl.path
      ),
      let size = attributes[.size] as? NSNumber
    else {
      return false
    }

    return size.int64Value > 0
  }

  private func cacheAsset(
    sourceUrl: URL,
    destinationUrl: URL,
    completion: @escaping (Result<URL, Error>) -> Void
  ) {
    if isUsable(destinationUrl) {
      completion(.success(destinationUrl))
      return
    }

    var request = URLRequest(url: sourceUrl)
    request.timeoutInterval = 35
    fileLock.lock()
    if let token = appCheckToken {
      request.setValue(token, forHTTPHeaderField: "X-Firebase-AppCheck")
    }
    fileLock.unlock()

    URLSession.shared.downloadTask(with: request) { [weak self] temporaryUrl, response, error in
      guard let self else {
        completion(.failure(cacheError("Asset cache was released.")))
        return
      }
      if let error {
        completion(.failure(error))
        return
      }
      guard
        let httpResponse = response as? HTTPURLResponse,
        (200..<300).contains(httpResponse.statusCode),
        let temporaryUrl
      else {
        completion(.failure(cacheError("Remote asset download failed.")))
        return
      }

      fileLock.lock()
      do {
        try FileManager.default.createDirectory(
          at: cacheRoot,
          withIntermediateDirectories: true
        )
        if isUsable(destinationUrl) {
          fileLock.unlock()
          completion(.success(destinationUrl))
          return
        }
        if FileManager.default.fileExists(atPath: destinationUrl.path) {
          try FileManager.default.removeItem(at: destinationUrl)
        }
        try FileManager.default.moveItem(
          at: temporaryUrl,
          to: destinationUrl
        )
        guard isUsable(destinationUrl) else {
          throw cacheError("Downloaded asset is empty.")
        }
        fileLock.unlock()
        completion(.success(destinationUrl))
      } catch {
        fileLock.unlock()
        completion(.failure(error))
      }
    }.resume()
  }
}

private func cacheError(_ message: String) -> NSError {
  NSError(
    domain: "com.seduforge.skidsenglish.asset-cache",
    code: 1,
    userInfo: [NSLocalizedDescriptionKey: message]
  )
}
