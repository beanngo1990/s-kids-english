import Foundation
import React
import AVFoundation

@objc(SkidsAudio)
class SkidsAudio: NSObject, AVAudioRecorderDelegate {
  
  private var audioPlayers: [String: AVAudioPlayer] = [:]
  private var speechPlayer: AVPlayer?
  private var speechResolve: RCTPromiseResolveBlock?
  private var speechEndObserver: NSObjectProtocol?
  private var speechFailObserver: NSObjectProtocol?
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
    var finalUrl: URL?
    if uri.hasPrefix("http") || uri.hasPrefix("file") {
      finalUrl = URL(string: uri)
    } else {
      // Local file path
      finalUrl = URL(fileURLWithPath: uri)
    }
    
    guard let url = finalUrl else {
      resolve(false)
      return
    }
    
    stopSpeechPlayer(resolvePendingPromise: true)
    
    let playerItem = AVPlayerItem(url: url)
    let player = AVPlayer(playerItem: playerItem)
    speechPlayer = player
    speechResolve = resolve
    speechEndObserver = NotificationCenter.default.addObserver(
      forName: .AVPlayerItemDidPlayToEndTime,
      object: playerItem,
      queue: .main
    ) { [weak self, weak player] _ in
      guard let self = self, let player = player else {
        return
      }
      self.finishSpeechPlayer(player, didPlay: true)
    }
    speechFailObserver = NotificationCenter.default.addObserver(
      forName: .AVPlayerItemFailedToPlayToEndTime,
      object: playerItem,
      queue: .main
    ) { [weak self, weak player] _ in
      guard let self = self, let player = player else {
        return
      }
      self.finishSpeechPlayer(player, didPlay: false)
    }
    
    player.play()
  }
  
  @objc func stopSpeech(_ resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) {
    stopSpeechPlayer(resolvePendingPromise: true)
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

  private func finishSpeechPlayer(_ player: AVPlayer, didPlay: Bool) {
    guard speechPlayer === player else {
      return
    }

    speechPlayer = nil
    removeSpeechObservers()
    resolveSpeechPromise(didPlay)
  }

  private func stopSpeechPlayer(resolvePendingPromise: Bool = false) {
    speechPlayer?.pause()
    speechPlayer = nil
    removeSpeechObservers()

    if resolvePendingPromise {
      resolveSpeechPromise(false)
    }
  }

  private func removeSpeechObservers() {
    if let observer = speechEndObserver {
      NotificationCenter.default.removeObserver(observer)
      speechEndObserver = nil
    }

    if let observer = speechFailObserver {
      NotificationCenter.default.removeObserver(observer)
      speechFailObserver = nil
    }
  }

  private func resolveSpeechPromise(_ value: Bool) {
    speechResolve?(value)
    speechResolve = nil
  }
}
