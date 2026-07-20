package com.seduforge.skidsenglish.assets

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import java.io.File
import java.io.IOException
import java.net.URL
import java.security.MessageDigest
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors

class SkidsAssetCacheModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  private val foregroundExecutor = Executors.newFixedThreadPool(4)
  private val prefetchExecutor = Executors.newSingleThreadExecutor()
  private val assetLocks = ConcurrentHashMap<String, Any>()
  private val cacheRoot = File(reactContext.cacheDir, "skids_remote_assets")

  override fun getName() = "SkidsAssetCache"

  @ReactMethod
  fun getCachedAssetUrl(remoteUrl: String, cacheKey: String, promise: Promise) {
    cacheRoot.mkdirs()
    val cachedFile = targetFile(cacheKey, remoteUrl)
    if (isUsable(cachedFile)) {
      promise.resolve(cachedFile.toURI().toString())
      return
    }

    foregroundExecutor.execute {
      try {
        promise.resolve(cacheAsset(remoteUrl, cacheKey).toURI().toString())
      } catch (error: Exception) {
        promise.reject("SKIDS_ASSET_CACHE_ERROR", error)
      }
    }
  }

  @ReactMethod
  fun prefetchAssets(assets: ReadableArray, promise: Promise) {
    prefetchExecutor.execute {
      try {
        cacheRoot.mkdirs()
        var attemptedAsset = false
        var allAssetsReady = true

        for (i in 0 until assets.size()) {
          val asset = assets.getMap(i) ?: continue
          val remoteUrl = asset.getString("remoteUrl")
          val cacheKey = asset.getString("cacheKey")

          if (remoteUrl != null && cacheKey != null) {
            attemptedAsset = true
            try {
              cacheAsset(remoteUrl, cacheKey)
            } catch (_: Exception) {
              allAssetsReady = false
            }
          }
        }
        promise.resolve(attemptedAsset && allAssetsReady)
      } catch (error: Exception) {
        promise.reject("SKIDS_ASSET_CACHE_PREFETCH_ERROR", error)
      }
    }
  }

  @ReactMethod
  fun clearCache(promise: Promise) {
    prefetchExecutor.execute {
      try {
        cacheRoot.deleteRecursively()
        promise.resolve(true)
      } catch (error: Exception) {
        promise.reject("SKIDS_ASSET_CACHE_CLEAR_ERROR", error)
      }
    }
  }

  private fun cacheFileName(cacheKey: String, remoteUrl: String): String {
    val extension = cacheKey.substringAfterLast('.', missingDelimiterValue = "asset")
    val digest = MessageDigest.getInstance("SHA-256")
      .digest("$cacheKey|$remoteUrl".toByteArray())
      .joinToString("") { "%02x".format(it) }

    return "$digest.$extension"
  }

  private fun targetFile(cacheKey: String, remoteUrl: String) =
    File(cacheRoot, cacheFileName(cacheKey, remoteUrl))

  private fun isUsable(file: File) = file.exists() && file.length() > 0L

  private fun cacheAsset(remoteUrl: String, cacheKey: String): File {
    cacheRoot.mkdirs()
    val targetFile = targetFile(cacheKey, remoteUrl)
    if (isUsable(targetFile)) {
      return targetFile
    }

    val assetLock = assetLocks.computeIfAbsent(targetFile.name) { Any() }
    return synchronized(assetLock) {
      if (isUsable(targetFile)) {
        return@synchronized targetFile
      }

      val tempFile = File(
        cacheRoot,
        "${targetFile.name}.${System.nanoTime()}.tmp",
      )
      try {
        URL(remoteUrl).openConnection().apply {
          connectTimeout = 15000
          readTimeout = 20000
        }.getInputStream().use { input ->
          tempFile.outputStream().use { output ->
            input.copyTo(output)
          }
        }

        if (!isUsable(tempFile)) {
          throw IOException("Downloaded asset is empty: $remoteUrl")
        }

        if (targetFile.exists() && !targetFile.delete()) {
          throw IOException("Unable to replace cached asset: ${targetFile.name}")
        }
        if (!tempFile.renameTo(targetFile)) {
          tempFile.copyTo(targetFile, overwrite = true)
        }
        if (!isUsable(targetFile)) {
          throw IOException("Cached asset is empty: ${targetFile.name}")
        }

        targetFile
      } finally {
        tempFile.delete()
      }
    }
  }
}
