package com.seduforge.skidsenglish.assets

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import java.io.File
import java.net.URL
import java.security.MessageDigest
import java.util.concurrent.Executors

class SkidsAssetCacheModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  private val executor = Executors.newSingleThreadExecutor()
  private val cacheRoot = File(reactContext.cacheDir, "skids_remote_assets")

  override fun getName() = "SkidsAssetCache"

  @ReactMethod
  fun getCachedAssetUrl(remoteUrl: String, cacheKey: String, promise: Promise) {
    executor.execute {
      try {
        cacheRoot.mkdirs()

        val targetFile = File(cacheRoot, cacheFileName(cacheKey, remoteUrl))
        if (targetFile.exists() && targetFile.length() > 0) {
          promise.resolve(targetFile.toURI().toString())
          return@execute
        }

        val tempFile = File(cacheRoot, "${targetFile.name}.tmp")
        URL(remoteUrl).openConnection().apply {
          connectTimeout = 15000
          readTimeout = 20000
        }.getInputStream().use { input ->
          tempFile.outputStream().use { output ->
            input.copyTo(output)
          }
        }

        if (targetFile.exists()) {
          targetFile.delete()
        }
        tempFile.renameTo(targetFile)

        promise.resolve(targetFile.toURI().toString())
      } catch (error: Exception) {
        promise.reject("SKIDS_ASSET_CACHE_ERROR", error)
      }
    }
  }

  @ReactMethod
  fun prefetchAssets(assets: ReadableArray, promise: Promise) {
    executor.execute {
      try {
        cacheRoot.mkdirs()
        for (i in 0 until assets.size()) {
          val asset = assets.getMap(i) ?: continue
          val remoteUrl = asset.getString("remoteUrl")
          val cacheKey = asset.getString("cacheKey")

          if (remoteUrl != null && cacheKey != null) {
            try {
              val targetFile = File(cacheRoot, cacheFileName(cacheKey, remoteUrl))
              if (targetFile.exists() && targetFile.length() > 0L) {
                continue
              }

              val tempFile = File(cacheRoot, "${targetFile.name}.tmp")
              URL(remoteUrl).openConnection().apply {
                connectTimeout = 15000
                readTimeout = 20000
              }.getInputStream().use { input ->
                tempFile.outputStream().use { output ->
                  input.copyTo(output)
                }
              }

              if (targetFile.exists()) {
                targetFile.delete()
              }
              tempFile.renameTo(targetFile)
            } catch (e: Exception) {
               // Ignore errors for individual prefetch so others can proceed
            }
          }
        }
        promise.resolve(true)
      } catch (error: Exception) {
        promise.reject("SKIDS_ASSET_CACHE_PREFETCH_ERROR", error)
      }
    }
  }

  @ReactMethod
  fun clearCache(promise: Promise) {
    executor.execute {
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
}
