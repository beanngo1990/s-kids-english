import Foundation
import React
import AVFoundation

@objc(SkidsAudio)
class SkidsAudio: NSObject, AVAudioRecorderDelegate {

  private final class SpeechPlayback {
    let player: AVPlayer
    let resolve: RCTPromiseResolveBlock
    var endObserver: NSObjectProtocol?
    var failObserver: NSObjectProtocol?

    init(player: AVPlayer, resolve: @escaping RCTPromiseResolveBlock) {
      self.player = player
      self.resolve = resolve
    }
  }

  private final class BackgroundMusicPlayback {
    let player: AVPlayer
    var endObserver: NSObjectProtocol?
    var failObserver: NSObjectProtocol?

    init(player: AVPlayer) {
      self.player = player
    }
  }
  
  private var audioPlayers: [String: AVAudioPlayer] = [:]
  private let speechPlaybackLock = NSLock()
  private let backgroundMusicLock = NSLock()
  private var speechPlayback: SpeechPlayback?
  private var backgroundMusicPlayback: BackgroundMusicPlayback?
  private var voiceRecorder: AVAudioRecorder?
  private var recordingSession: AVAudioSession!
  
  static func moduleName() -> String! {
    return "SkidsAudio"
  }
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  override init() {
    super.init()
    recordingSession = AVAudioSession.sharedInstance()
    do {
      try recordingSession.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetooth, .mixWithOthers])
      try recordingSession.setActive(true)
    } catch {
      print("Failed to set up audio session: \(error)")
    }
  }

  deinit {
    stopSpeechPlayer(resolvePendingPromise: true)
    stopBackgroundMusicPlayer()
  }
  
  @objc func play(_ effect: String,
                  resolver resolve: @escaping RCTPromiseResolveBlock,
                  rejecter reject: @escaping RCTPromiseRejectBlock) {
    let soundName = "sfx_\(effect)"
    guard let url = Bundle.main.url(forResource: soundName, withExtension: "wav") else {
      print("Could not find sound effect file: \(soundName).wav")
      resolve(false)
      return
    }
    
    do {
      let player = try AVAudioPlayer(contentsOf: url)
      player.prepareToPlay()
      audioPlayers[effect] = player
      player.play()
      resolve(true)
    } catch {
      print("Failed to play effect: \(error)")
      resolve(false)
    }
  }
  
  @objc func playUri(_ uri: String,
                     resolver resolve: @escaping RCTPromiseResolveBlock,
                     rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let url = resolveAudioUrl(uri) else {
      resolve(false)
      return
    }
    
    stopSpeechPlayer(resolvePendingPromise: true)
    
    let playerItem = AVPlayerItem(url: url)
    let player = AVPlayer(playerItem: playerItem)
    let playback = SpeechPlayback(player: player, resolve: resolve)
    playback.endObserver = NotificationCenter.default.addObserver(
      forName: .AVPlayerItemDidPlayToEndTime,
      object: playerItem,
      queue: .main
    ) { [weak self, weak player] _ in
      guard let self = self, let player = player else {
        return
      }
      self.finishSpeechPlayer(player, didPlay: true)
    }
    playback.failObserver = NotificationCenter.default.addObserver(
      forName: .AVPlayerItemFailedToPlayToEndTime,
      object: playerItem,
      queue: .main
    ) { [weak self, weak player] _ in
      guard let self = self, let player = player else {
        return
      }
      self.finishSpeechPlayer(player, didPlay: false)
    }
    
    speechPlaybackLock.lock()
    speechPlayback = playback
    player.play()
    speechPlaybackLock.unlock()
  }
  
  @objc func stopSpeech(_ resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) {
    stopSpeechPlayer(resolvePendingPromise: true)
    resolve(true)
  }

  @objc func playBackgroundMusic(_ uri: String,
                                 volume: NSNumber,
                                 resolver resolve: @escaping RCTPromiseResolveBlock,
                                 rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let url = resolveAudioUrl(uri) else {
      resolve(false)
      return
    }

    stopBackgroundMusicPlayer()

    let playerItem = AVPlayerItem(url: url)
    let player = AVPlayer(playerItem: playerItem)
    player.volume = clampVolume(volume)
    let playback = BackgroundMusicPlayback(player: player)
    playback.endObserver = NotificationCenter.default.addObserver(
      forName: .AVPlayerItemDidPlayToEndTime,
      object: playerItem,
      queue: .main
    ) { [weak player] _ in
      guard let player = player else {
        return
      }
      player.seek(to: .zero) { _ in
        player.play()
      }
    }
    playback.failObserver = NotificationCenter.default.addObserver(
      forName: .AVPlayerItemFailedToPlayToEndTime,
      object: playerItem,
      queue: .main
    ) { [weak self, weak player] _ in
      guard let self = self, let player = player else {
        return
      }
      self.finishBackgroundMusicPlayer(player)
    }

    backgroundMusicLock.lock()
    backgroundMusicPlayback = playback
    player.play()
    backgroundMusicLock.unlock()
    resolve(true)
  }

  @objc func setBackgroundMusicVolume(_ volume: NSNumber,
                                      resolver resolve: @escaping RCTPromiseResolveBlock,
                                      rejecter reject: @escaping RCTPromiseRejectBlock) {
    backgroundMusicLock.lock()
    let player = backgroundMusicPlayback?.player
    backgroundMusicLock.unlock()

    player?.volume = clampVolume(volume)
    resolve(true)
  }

  @objc func stopBackgroundMusic(_ resolve: @escaping RCTPromiseResolveBlock,
                                 rejecter reject: @escaping RCTPromiseRejectBlock) {
    stopBackgroundMusicPlayer()
    resolve(true)
  }
  
  @objc func startVoiceRecording(_ resolve: @escaping RCTPromiseResolveBlock,
                                 rejecter reject: @escaping RCTPromiseRejectBlock) {
    let documentPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    let audioFilename = documentPath.appendingPathComponent("recording.m4a")
    
    let settings = [
      AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
      AVSampleRateKey: 44100,
      AVNumberOfChannelsKey: 1,
      AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
    ]
    
    do {
      voiceRecorder = try AVAudioRecorder(url: audioFilename, settings: settings)
      voiceRecorder?.delegate = self
      voiceRecorder?.isMeteringEnabled = true
      voiceRecorder?.record()
      resolve(audioFilename.absoluteString)
    } catch {
      print("Could not start recording: \(error)")
      resolve(nil)
    }
  }
  
  @objc func stopVoiceRecording(_ resolve: @escaping RCTPromiseResolveBlock,
                                rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let recorder = voiceRecorder else {
      resolve(nil)
      return
    }
    
    recorder.stop()
    voiceRecorder = nil
    resolve(recorder.url.absoluteString)
  }

  @objc func getVoiceRecordingLevel(_ resolve: @escaping RCTPromiseResolveBlock,
                                    rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let recorder = voiceRecorder, recorder.isRecording else {
      resolve(nil)
      return
    }

    recorder.updateMeters()
    let averagePower = recorder.averagePower(forChannel: 0)
    let normalizedLevel = pow(10.0, Double(averagePower) / 20.0)
    resolve(min(max(normalizedLevel, 0.0), 1.0))
  }

  @objc func requestRecordPermission(_ resolve: @escaping RCTPromiseResolveBlock,
                                     rejecter reject: @escaping RCTPromiseRejectBlock) {
    AVAudioSession.sharedInstance().requestRecordPermission { granted in
      resolve(granted)
    }
  }
  
  @objc func checkRecordPermission(_ resolve: @escaping RCTPromiseResolveBlock,
                                   rejecter reject: @escaping RCTPromiseRejectBlock) {
    let status = AVAudioSession.sharedInstance().recordPermission
    resolve(status == .granted)
  }

  private func finishSpeechPlayer(_ player: AVPlayer, didPlay: Bool) {
    guard let playback = detachSpeechPlayback(matching: player) else {
      return
    }

    removeSpeechObservers(playback)
    playback.resolve(didPlay)
  }

  private func stopSpeechPlayer(resolvePendingPromise: Bool = false) {
    speechPlaybackLock.lock()
    let playback = speechPlayback
    speechPlayback = nil
    speechPlaybackLock.unlock()

    playback?.player.pause()
    if let playback = playback {
      removeSpeechObservers(playback)
    }

    if resolvePendingPromise, let playback = playback {
      playback.resolve(false)
    }
  }

  private func detachSpeechPlayback(matching player: AVPlayer) -> SpeechPlayback? {
    speechPlaybackLock.lock()
    defer { speechPlaybackLock.unlock() }

    guard let playback = speechPlayback, playback.player === player else {
      return nil
    }

    speechPlayback = nil
    return playback
  }

  private func removeSpeechObservers(_ playback: SpeechPlayback) {
    if let observer = playback.endObserver {
      NotificationCenter.default.removeObserver(observer)
      playback.endObserver = nil
    }

    if let observer = playback.failObserver {
      NotificationCenter.default.removeObserver(observer)
      playback.failObserver = nil
    }
  }

  private func finishBackgroundMusicPlayer(_ player: AVPlayer) {
    backgroundMusicLock.lock()
    let playback = backgroundMusicPlayback
    if playback?.player === player {
      backgroundMusicPlayback = nil
    }
    backgroundMusicLock.unlock()

    guard let playback = playback, playback.player === player else {
      return
    }

    playback.player.pause()
    removeBackgroundMusicObservers(playback)
  }

  private func stopBackgroundMusicPlayer() {
    backgroundMusicLock.lock()
    let playback = backgroundMusicPlayback
    backgroundMusicPlayback = nil
    backgroundMusicLock.unlock()

    playback?.player.pause()
    if let playback = playback {
      removeBackgroundMusicObservers(playback)
    }
  }

  private func removeBackgroundMusicObservers(_ playback: BackgroundMusicPlayback) {
    if let observer = playback.endObserver {
      NotificationCenter.default.removeObserver(observer)
      playback.endObserver = nil
    }

    if let observer = playback.failObserver {
      NotificationCenter.default.removeObserver(observer)
      playback.failObserver = nil
    }
  }

  private func resolveAudioUrl(_ uri: String) -> URL? {
    if uri.hasPrefix("http") || uri.hasPrefix("file") {
      return URL(string: uri)
    }

    return URL(fileURLWithPath: uri)
  }

  private func clampVolume(_ volume: NSNumber) -> Float {
    let floatValue = volume.floatValue
    if !floatValue.isFinite {
      return 0.16
    }

    return min(1, max(0, floatValue))
  }
}
