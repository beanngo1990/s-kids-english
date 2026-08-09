import Foundation
import React
import AVFoundation
import Speech
import UIKit

@objc(SkidsAudio)
class SkidsAudio: NSObject {

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

  private enum VoiceActivityPhase: String {
    case calibrating
    case waitingForSpeech
    case candidateSpeech
    case speaking
    case trailingSilence
    case ended
  }

  private struct VoiceActivityOptions {
    let minSpeechMs: Double
    let silenceAfterSpeechMs: Double
    let noSpeechTimeoutMs: Double
    let maxDurationMs: Double
    let targetText: String?
    let targetLocale: String
    let targetMatchPostRollMs: Double

    static let defaults = VoiceActivityOptions(
      minSpeechMs: 240,
      silenceAfterSpeechMs: 900,
      noSpeechTimeoutMs: 5_200,
      maxDurationMs: 6_700,
      targetText: nil,
      targetLocale: "en-US",
      targetMatchPostRollMs: 350
    )

    init(
      minSpeechMs: Double,
      silenceAfterSpeechMs: Double,
      noSpeechTimeoutMs: Double,
      maxDurationMs: Double,
      targetText: String?,
      targetLocale: String,
      targetMatchPostRollMs: Double
    ) {
      self.minSpeechMs = minSpeechMs
      self.silenceAfterSpeechMs = silenceAfterSpeechMs
      self.noSpeechTimeoutMs = min(noSpeechTimeoutMs, maxDurationMs)
      self.maxDurationMs = maxDurationMs
      self.targetText = targetText
      self.targetLocale = targetLocale
      self.targetMatchPostRollMs = targetMatchPostRollMs
    }

    init(dictionary: NSDictionary) {
      let minimumSpeech = Self.milliseconds(
        in: dictionary,
        keys: ["minSpeechMs"],
        fallback: Self.defaults.minSpeechMs,
        range: 120...1_200
      )
      let trailingSilence = Self.milliseconds(
        in: dictionary,
        keys: ["silenceAfterSpeechMs", "endSilenceMs"],
        fallback: Self.defaults.silenceAfterSpeechMs,
        range: 400...2_500
      )
      let noSpeechTimeout = Self.milliseconds(
        in: dictionary,
        keys: ["noSpeechTimeoutMs"],
        fallback: Self.defaults.noSpeechTimeoutMs,
        range: 1_500...15_000
      )
      let maximumDuration = Self.milliseconds(
        in: dictionary,
        keys: ["maxDurationMs"],
        fallback: max(Self.defaults.maxDurationMs, noSpeechTimeout + 1_000),
        range: 2_500...20_000
      )
      let targetText = (dictionary["targetText"] as? String)?
        .trimmingCharacters(in: .whitespacesAndNewlines)
      let requestedTargetLocale = dictionary["targetLocale"] as? String
      let targetLocale = requestedTargetLocale == "en-GB" ? "en-GB" : "en-US"
      let targetMatchPostRoll = Self.milliseconds(
        in: dictionary,
        keys: ["targetMatchPostRollMs"],
        fallback: Self.defaults.targetMatchPostRollMs,
        range: 200...1_000
      )

      self.init(
        minSpeechMs: minimumSpeech,
        silenceAfterSpeechMs: trailingSilence,
        noSpeechTimeoutMs: noSpeechTimeout,
        maxDurationMs: maximumDuration,
        targetText: targetText?.isEmpty == false ? targetText : nil,
        targetLocale: targetLocale,
        targetMatchPostRollMs: targetMatchPostRoll
      )
    }

    private static func milliseconds(
      in dictionary: NSDictionary,
      keys: [String],
      fallback: Double,
      range: ClosedRange<Double>
    ) -> Double {
      for key in keys {
        guard let number = dictionary[key] as? NSNumber else {
          continue
        }

        let value = number.doubleValue
        if value.isFinite {
          return min(range.upperBound, max(range.lowerBound, value))
        }
      }

      return fallback
    }
  }

  private final class VoiceActivityDetector {
    private static let calibrationDurationMs = 300.0
    private static let maximumCalibrationNoiseFloorDbfs = -42.0
    private static let minimumLevelDbfs = -80.0
    private static let maximumNoiseFloorDbfs = -32.0
    private static let minimumNoiseFloorDbfs = -70.0
    private static let speechSnrDb = 8.0

    let sessionId: String
    private let options: VoiceActivityOptions
    private let autoEndpointEnabled: Bool
    private let startedAt: TimeInterval
    private var phase = VoiceActivityPhase.calibrating
    private var sequence = 0
    private var hadSpeech = false
    private var shouldStop = false
    private var stopReason: String?
    private var level = 0.0
    private var levelDbfs = VoiceActivityDetector.minimumLevelDbfs
    private var noiseFloorDbfs = -55.0
    private var speechConfidence = 0.0
    private var speechCandidateMs = 0.0
    private var speechDurationMs = 0.0
    private var trailingSilenceMs = 0.0
    private var processedDurationMs = 0.0
    private var previousSample = Float.zero
    private var previousHighPassSample = Float.zero

    init(
      sessionId: String,
      options: VoiceActivityOptions,
      autoEndpointEnabled: Bool
    ) {
      self.sessionId = sessionId
      self.options = options
      self.autoEndpointEnabled = autoEndpointEnabled
      startedAt = ProcessInfo.processInfo.systemUptime
    }

    func process(_ buffer: AVAudioPCMBuffer) {
      guard !shouldStop else {
        return
      }

      let frameCount = Int(buffer.frameLength)
      let sampleRate = buffer.format.sampleRate
      guard frameCount > 0, sampleRate > 0 else {
        return
      }

      let metrics: (rms: Double, peak: Double, zeroCrossingRate: Double)?
      if let samples = buffer.floatChannelData?[0] {
        metrics = analyzeFloatSamples(samples, frameCount: frameCount)
      } else if let samples = buffer.int16ChannelData?[0] {
        metrics = analyzeInt16Samples(samples, frameCount: frameCount)
      } else {
        metrics = nil
      }

      guard let metrics else {
        return
      }

      let frameDurationMs = Double(frameCount) / sampleRate * 1_000
      processedDurationMs += frameDurationMs
      sequence += 1
      level = min(1, max(0, metrics.rms))
      levelDbfs = max(
        Self.minimumLevelDbfs,
        20 * log10(max(metrics.rms, 0.000_1))
      )

      let snrDb = levelDbfs - noiseFloorDbfs
      let crestFactor = metrics.peak / max(metrics.rms, 0.000_1)
      let isImpulse = crestFactor > 9.5 && frameDurationMs < 140
      let hasSpeechLikeCrossings =
        metrics.zeroCrossingRate >= 0.004 && metrics.zeroCrossingRate <= 0.48
      // Starting speech needs stronger evidence. Once a candidate exists, keep
      // softer phoneme endings alive instead of bouncing back to the start
      // threshold on every buffer.
      let isContinuingSpeech = hadSpeech || speechCandidateMs > 0
      let speechEnergyThresholdDbfs = isContinuingSpeech
        ? max(-55, noiseFloorDbfs + 4)
        : max(-50, noiseFloorDbfs + Self.speechSnrDb)
      let hasSpeechEnergy = levelDbfs >= speechEnergyThresholdDbfs
      let isSpeechFrame = hasSpeechEnergy && hasSpeechLikeCrossings && !isImpulse

      let energyConfidence = min(1, max(0, (snrDb - 3) / 15))
      let crossingConfidence = min(
        1,
        max(0, 1 - abs(metrics.zeroCrossingRate - 0.12) / 0.36)
      )
      speechConfidence = isImpulse
        ? 0
        : min(1, max(0, energyConfidence * 0.78 + crossingConfidence * 0.22))

      updateNoiseFloor(isSpeechFrame: isSpeechFrame)

      if processedDurationMs < Self.calibrationDurationMs {
        phase = .calibrating
        // Preserve early speech evidence, but do not confirm it until the
        // detector has completed its short ambient calibration window.
        if isSpeechFrame {
          speechCandidateMs += frameDurationMs
        } else {
          speechCandidateMs = max(0, speechCandidateMs - frameDurationMs * 1.7)
        }
      } else if !hadSpeech {
        if isSpeechFrame {
          speechCandidateMs += frameDurationMs
          phase = .candidateSpeech
          if speechCandidateMs >= options.minSpeechMs {
            hadSpeech = true
            phase = .speaking
            speechDurationMs = speechCandidateMs
            trailingSilenceMs = 0
          }
        } else {
          // Require sustained evidence, while tolerating a short gap between phonemes.
          speechCandidateMs = max(0, speechCandidateMs - frameDurationMs * 1.7)
          phase = speechCandidateMs > 0 ? .candidateSpeech : .waitingForSpeech
        }
      } else if isSpeechFrame {
        phase = .speaking
        speechDurationMs += frameDurationMs
        trailingSilenceMs = 0
      } else {
        phase = .trailingSilence
        trailingSilenceMs += frameDurationMs
        if autoEndpointEnabled &&
            trailingSilenceMs >= options.silenceAfterSpeechMs {
          end(reason: "endOfSpeech")
        }
      }

      if autoEndpointEnabled {
        if !hadSpeech && processedDurationMs >= options.noSpeechTimeoutMs {
          end(reason: "noSpeechTimeout")
        }
        if processedDurationMs >= options.maxDurationMs {
          end(reason: "maxDuration")
        }
      }
    }

    var hasConfirmedSpeech: Bool {
      hadSpeech
    }

    func end(reason: String) {
      guard !shouldStop else {
        return
      }

      shouldStop = true
      stopReason = reason
      phase = .ended
      sequence += 1
    }

    func snapshot(isRecording: Bool) -> [String: Any] {
      let elapsedMs = max(
        processedDurationMs,
        (ProcessInfo.processInfo.systemUptime - startedAt) * 1_000
      )
      let reason: Any = stopReason ?? NSNull()

      return [
        "sessionId": sessionId,
        "sequence": sequence,
        "phase": phase.rawValue,
        "detector": "nativeVoiceActivity",
        "isRecording": isRecording,
        "shouldStop": shouldStop,
        "hadSpeech": hadSpeech,
        "level": level,
        "levelDbfs": levelDbfs,
        "noiseFloorDbfs": noiseFloorDbfs,
        "speechConfidence": speechConfidence,
        "elapsedMs": elapsedMs,
        "speechDurationMs": speechDurationMs,
        "trailingSilenceMs": trailingSilenceMs,
        "stopReason": reason
      ]
    }

    private func updateNoiseFloor(isSpeechFrame: Bool) {
      if processedDurationMs < Self.calibrationDurationMs {
        // Do not absorb a child who starts speaking immediately into the floor.
        let boundedLevel = min(Self.maximumCalibrationNoiseFloorDbfs, levelDbfs)
        noiseFloorDbfs = min(
          Self.maximumCalibrationNoiseFloorDbfs,
          max(
            Self.minimumNoiseFloorDbfs,
            noiseFloorDbfs * 0.82 + boundedLevel * 0.18
          )
        )
        return
      }

      guard !hadSpeech, !isSpeechFrame else {
        return
      }

      let weight: Double
      if levelDbfs < noiseFloorDbfs {
        weight = 0.10
      } else {
        weight = 0.015
      }

      let boundedLevel = min(Self.maximumNoiseFloorDbfs, levelDbfs)
      noiseFloorDbfs = min(
        Self.maximumNoiseFloorDbfs,
        max(
          Self.minimumNoiseFloorDbfs,
          noiseFloorDbfs * (1 - weight) + boundedLevel * weight
        )
      )
    }

    private func analyzeFloatSamples(
      _ samples: UnsafePointer<Float>,
      frameCount: Int
    ) -> (rms: Double, peak: Double, zeroCrossingRate: Double) {
      var sumSquares = 0.0
      var peak = 0.0
      var zeroCrossings = 0
      var lastSign = previousHighPassSample >= 0

      for index in 0..<frameCount {
        let sample = samples[index]
        let highPassSample = sample - previousSample + 0.97 * previousHighPassSample
        previousSample = sample
        previousHighPassSample = highPassSample

        let value = Double(highPassSample)
        let magnitude = abs(value)
        sumSquares += value * value
        peak = max(peak, magnitude)
        let sign = highPassSample >= 0
        if sign != lastSign && magnitude > 0.000_5 {
          zeroCrossings += 1
        }
        lastSign = sign
      }

      return (
        rms: sqrt(sumSquares / Double(frameCount)),
        peak: peak,
        zeroCrossingRate: Double(zeroCrossings) / Double(frameCount)
      )
    }

    private func analyzeInt16Samples(
      _ samples: UnsafePointer<Int16>,
      frameCount: Int
    ) -> (rms: Double, peak: Double, zeroCrossingRate: Double) {
      var sumSquares = 0.0
      var peak = 0.0
      var zeroCrossings = 0
      var lastSign = previousHighPassSample >= 0

      for index in 0..<frameCount {
        let sample = Float(samples[index]) / Float(Int16.max)
        let highPassSample = sample - previousSample + 0.97 * previousHighPassSample
        previousSample = sample
        previousHighPassSample = highPassSample

        let value = Double(highPassSample)
        let magnitude = abs(value)
        sumSquares += value * value
        peak = max(peak, magnitude)
        let sign = highPassSample >= 0
        if sign != lastSign && magnitude > 0.000_5 {
          zeroCrossings += 1
        }
        lastSign = sign
      }

      return (
        rms: sqrt(sumSquares / Double(frameCount)),
        peak: peak,
        zeroCrossingRate: Double(zeroCrossings) / Double(frameCount)
      )
    }
  }

  private enum TargetMatchState: String {
    case unavailable
    case listening
    case candidate
    case matched
  }

  private final class VoiceTargetMatcher {
    private let normalizedTarget: String
    private let lock = NSLock()
    private var state = TargetMatchState.unavailable
    private var confidence: Double?
    private var consecutiveExactMatches = 0
    private var partialCandidateStartedAtMs: Double?
    private var isStopped = false
    private var recognizer: SFSpeechRecognizer?
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var task: SFSpeechRecognitionTask?

    init(targetText: String, localeIdentifier: String) {
      normalizedTarget = Self.normalize(targetText)

      guard
        !normalizedTarget.isEmpty,
        SFSpeechRecognizer.authorizationStatus() == .authorized,
        let recognizer = SFSpeechRecognizer(
          locale: Locale(identifier: localeIdentifier)
        ),
        recognizer.isAvailable,
        recognizer.supportsOnDeviceRecognition
      else {
        return
      }

      let request = SFSpeechAudioBufferRecognitionRequest()
      request.requiresOnDeviceRecognition = true
      request.shouldReportPartialResults = true
      request.contextualStrings = [targetText]
      request.taskHint = .confirmation

      self.recognizer = recognizer
      self.request = request
      state = .listening
      task = recognizer.recognitionTask(with: request) { [weak self] result, error in
        self?.handle(result: result, error: error)
      }
    }

    func append(_ buffer: AVAudioPCMBuffer) {
      lock.lock()
      defer { lock.unlock() }

      guard !isStopped, let request else {
        return
      }

      request.append(buffer)
    }

    var hasMatched: Bool {
      lock.lock()
      defer { lock.unlock() }
      return state == .matched
    }

    func snapshot() -> [String: Any] {
      lock.lock()
      defer { lock.unlock() }

      var result: [String: Any] = [
        "targetMatchState": state.rawValue
      ]
      if let confidence {
        result["targetMatchConfidence"] = confidence
      }
      return result
    }

    func stop() {
      lock.lock()
      guard !isStopped else {
        lock.unlock()
        return
      }

      isStopped = true
      let resources = detachRecognitionLocked()
      lock.unlock()

      Self.endAndCancel(resources)
    }

    private func handle(result: SFSpeechRecognitionResult?, error: Error?) {
      lock.lock()
      guard !isStopped else {
        lock.unlock()
        return
      }

      if state != .matched, let result {
        let normalizedTranscript = Self.normalize(
          result.bestTranscription.formattedString
        )
        let resultConfidence = Self.averageConfidence(
          result.bestTranscription.segments,
          isFinal: result.isFinal
        )
        let hasAcceptableConfidence = resultConfidence.map {
          $0 >= Self.minimumMatchConfidence
        } ?? true
        if normalizedTranscript == normalizedTarget && hasAcceptableConfidence {
          consecutiveExactMatches += 1
          confidence = resultConfidence
          let nowMs = ProcessInfo.processInfo.systemUptime * 1_000
          if partialCandidateStartedAtMs == nil {
            partialCandidateStartedAtMs = nowMs
          }
          let candidateDurationMs = nowMs - (partialCandidateStartedAtMs ?? nowMs)
          if result.isFinal || (
            consecutiveExactMatches >= Self.requiredPartialMatches &&
              candidateDurationMs >= Self.minimumPartialStabilityMs
          ) {
            state = .matched
          } else {
            state = .candidate
          }
        } else {
          resetPartialCandidate()
          confidence = nil
          state = .listening
        }
      }

      var terminalResources: RecognitionResources?
      if state == .matched || error != nil || result?.isFinal == true {
        if state != .matched {
          state = .unavailable
        }
        isStopped = true
        terminalResources = detachRecognitionLocked()
      }
      lock.unlock()

      if let terminalResources {
        Self.endAndCancel(terminalResources)
      }
    }

    private func resetPartialCandidate() {
      consecutiveExactMatches = 0
      partialCandidateStartedAtMs = nil
    }

    private typealias RecognitionResources = (
      request: SFSpeechAudioBufferRecognitionRequest?,
      task: SFSpeechRecognitionTask?
    )

    private func detachRecognitionLocked() -> RecognitionResources {
      let resources = (request: request, task: task)
      request = nil
      task = nil
      recognizer = nil
      return resources
    }

    private static func endAndCancel(_ resources: RecognitionResources) {
      resources.request?.endAudio()
      resources.task?.cancel()
    }

    private static func normalize(_ value: String) -> String {
      value
        .folding(
          options: [.caseInsensitive, .diacriticInsensitive],
          locale: Locale(identifier: "en_US_POSIX")
        )
        .lowercased()
        .components(separatedBy: CharacterSet.alphanumerics.inverted)
        .filter { !$0.isEmpty }
        .joined(separator: " ")
    }

    private static func averageConfidence(
      _ segments: [SFTranscriptionSegment],
      isFinal: Bool
    ) -> Double? {
      guard !segments.isEmpty else {
        return nil
      }

      let total = segments.reduce(0.0) { partialResult, segment in
        partialResult + Double(segment.confidence)
      }
      let value = total / Double(segments.count)
      guard value.isFinite else {
        return nil
      }

      // Speech can report zero while a partial hypothesis has no meaningful
      // confidence yet. A final zero is a real low-confidence result and must
      // still be rejected by the high-precision threshold above.
      if value == 0, !isFinal {
        return nil
      }
      return min(1, max(0, value))
    }

    private static let minimumMatchConfidence = 0.55
    private static let minimumPartialStabilityMs = 120.0
    private static let requiredPartialMatches = 2
  }

  private struct AudioSessionConfiguration {
    let category: AVAudioSession.Category
    let mode: AVAudioSession.Mode
    let options: AVAudioSession.CategoryOptions
  }

  private final class VoiceCapture {
    let sessionId: String
    let uri: String
    let url: URL
    let engine: AVAudioEngine
    let inputNode: AVAudioInputNode
    let detector: VoiceActivityDetector
    let targetMatcher: VoiceTargetMatcher?
    let targetMatchPostRollMs: Double
    let previousAudioSessionConfiguration: AudioSessionConfiguration
    let lock = NSLock()
    var audioFile: AVAudioFile?
    var isRecording = true
    var finalizationScheduled = false
    var tapInstalled = false
    private var targetMatchPostRollDurationMs = 0.0

    init(
      sessionId: String,
      url: URL,
      engine: AVAudioEngine,
      inputNode: AVAudioInputNode,
      audioFile: AVAudioFile,
      detector: VoiceActivityDetector,
      targetMatcher: VoiceTargetMatcher?,
      targetMatchPostRollMs: Double,
      previousAudioSessionConfiguration: AudioSessionConfiguration
    ) {
      self.sessionId = sessionId
      self.uri = url.absoluteString
      self.url = url
      self.engine = engine
      self.inputNode = inputNode
      self.audioFile = audioFile
      self.detector = detector
      self.targetMatcher = targetMatcher
      self.targetMatchPostRollMs = targetMatchPostRollMs
      self.previousAudioSessionConfiguration = previousAudioSessionConfiguration
    }

    func process(_ buffer: AVAudioPCMBuffer) -> Bool {
      lock.lock()
      defer { lock.unlock() }

      guard isRecording else {
        return false
      }

      do {
        try audioFile?.write(from: buffer)
      } catch {
        detector.end(reason: "error")
      }
      detector.process(buffer)
      targetMatcher?.append(buffer)
      if detector.hasConfirmedSpeech && targetMatcher?.hasMatched == true {
        let sampleRate = buffer.format.sampleRate
        if sampleRate > 0 {
          targetMatchPostRollDurationMs +=
            Double(buffer.frameLength) / sampleRate * 1_000
        }
        if targetMatchPostRollDurationMs >= targetMatchPostRollMs {
          detector.end(reason: "targetWordMatch")
        }
      } else {
        targetMatchPostRollDurationMs = 0
      }

      let snapshot = combinedSnapshot(isRecording: true)
      guard snapshot["shouldStop"] as? Bool == true, !finalizationScheduled else {
        return false
      }

      finalizationScheduled = true
      return true
    }

    func snapshot() -> [String: Any] {
      lock.lock()
      defer { lock.unlock() }
      return combinedSnapshot(isRecording: isRecording)
    }

    func markStopped(requestedReason: String) -> [String: Any] {
      lock.lock()
      defer { lock.unlock() }

      detector.end(reason: requestedReason)
      isRecording = false
      audioFile = nil
      targetMatcher?.stop()
      return combinedSnapshot(isRecording: false)
    }

    private func combinedSnapshot(isRecording: Bool) -> [String: Any] {
      var result = detector.snapshot(isRecording: isRecording)
      targetMatcher?.snapshot().forEach { key, value in
        result[key] = value
      }
      return result
    }
  }

  private struct VoiceCaptureResult {
    let sessionId: String
    let uri: String
    let snapshot: [String: Any]
    let url: URL
  }
  
  private var audioPlayers: [String: AVAudioPlayer] = [:]
  private let speechPlaybackLock = NSLock()
  private let backgroundMusicLock = NSLock()
  private let voiceRecordingQueue = DispatchQueue(
    label: "com.seduforge.skidsenglish.voice-recording"
  )
  private var speechPlayback: SpeechPlayback?
  private var backgroundMusicPlayback: BackgroundMusicPlayback?
  private var voiceCapture: VoiceCapture?
  private var lastVoiceCaptureResult: VoiceCaptureResult?
  private var audioSessionInterruptionObserver: NSObjectProtocol?
  private var audioSessionResetObserver: NSObjectProtocol?
  private var appDidEnterBackgroundObserver: NSObjectProtocol?
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
      try recordingSession.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetoothHFP, .mixWithOthers])
      try recordingSession.setActive(true)
    } catch {
      print("Failed to set up audio session: \(error)")
    }

    audioSessionInterruptionObserver = NotificationCenter.default.addObserver(
      forName: AVAudioSession.interruptionNotification,
      object: recordingSession,
      queue: nil
    ) { [weak self] notification in
      guard
        let typeValue = notification.userInfo?[AVAudioSessionInterruptionTypeKey] as? NSNumber,
        AVAudioSession.InterruptionType(rawValue: typeValue.uintValue) == .began
      else {
        return
      }

      self?.finishVoiceCaptureAfterSystemEvent(reason: "interrupted")
    }
    audioSessionResetObserver = NotificationCenter.default.addObserver(
      forName: AVAudioSession.mediaServicesWereResetNotification,
      object: recordingSession,
      queue: nil
    ) { [weak self] _ in
      self?.finishVoiceCaptureAfterSystemEvent(reason: "error")
    }
    appDidEnterBackgroundObserver = NotificationCenter.default.addObserver(
      forName: UIApplication.didEnterBackgroundNotification,
      object: nil,
      queue: nil
    ) { [weak self] _ in
      self?.finishVoiceCaptureAfterSystemEvent(reason: "interrupted")
    }
  }

  deinit {
    if let observer = audioSessionInterruptionObserver {
      NotificationCenter.default.removeObserver(observer)
    }
    if let observer = audioSessionResetObserver {
      NotificationCenter.default.removeObserver(observer)
    }
    if let observer = appDidEnterBackgroundObserver {
      NotificationCenter.default.removeObserver(observer)
    }
    if let capture = voiceCapture {
      finalizeVoiceCapture(capture, requestedReason: "manual")
    }
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
    startVoiceCapture(
      options: .defaults,
      autoEndpointEnabled: false
    ) { result in
      switch result {
      case .success(let capture):
        resolve(capture.uri)
      case .failure(let error):
        print("Could not start recording: \(error)")
        resolve(nil)
      }
    }
  }
  
  @objc func stopVoiceRecording(_ resolve: @escaping RCTPromiseResolveBlock,
                                rejecter reject: @escaping RCTPromiseRejectBlock) {
    voiceRecordingQueue.async { [weak self] in
      guard let self = self else {
        resolve(nil)
        return
      }

      if let capture = self.voiceCapture {
        let result = self.finalizeVoiceCapture(
          capture,
          requestedReason: "manual"
        )
        resolve(result.uri)
        return
      }

      resolve(self.lastVoiceCaptureResult?.uri)
    }
  }

  @objc func getVoiceRecordingLevel(_ resolve: @escaping RCTPromiseResolveBlock,
                                    rejecter reject: @escaping RCTPromiseRejectBlock) {
    voiceRecordingQueue.async { [weak self] in
      guard
        let snapshot = self?.voiceCapture?.snapshot(),
        snapshot["isRecording"] as? Bool == true
      else {
        resolve(nil)
        return
      }

      resolve(snapshot["level"])
    }
  }

  @objc func startVoiceActivityRecording(
    _ rawOptions: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    startVoiceCapture(
      options: VoiceActivityOptions(dictionary: rawOptions),
      autoEndpointEnabled: true
    ) { result in
      switch result {
      case .success(let capture):
        resolve([
          "uri": capture.uri,
          "sessionId": capture.sessionId,
          "detector": "nativeVoiceActivity"
        ])
      case .failure(let error):
        reject("SKIDS_VOICE_ACTIVITY_START_ERROR", error.localizedDescription, error)
      }
    }
  }

  @objc func getVoiceRecordingActivity(
    _ sessionId: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    voiceRecordingQueue.async { [weak self] in
      guard let self = self else {
        resolve(nil)
        return
      }

      if let capture = self.voiceCapture, capture.sessionId == sessionId {
        resolve(capture.snapshot())
        return
      }

      if let result = self.lastVoiceCaptureResult, result.sessionId == sessionId {
        resolve(result.snapshot)
        return
      }

      resolve(nil)
    }
  }

  @objc func stopVoiceActivityRecording(
    _ sessionId: String,
    requestedReason: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    voiceRecordingQueue.async { [weak self] in
      guard let self = self else {
        resolve(nil)
        return
      }

      if let capture = self.voiceCapture, capture.sessionId == sessionId {
        let result = self.finalizeVoiceCapture(
          capture,
          requestedReason: self.normalizedStopReason(requestedReason)
        )
        resolve([
          "uri": result.uri,
          "finalSnapshot": result.snapshot
        ])
        return
      }

      if let result = self.lastVoiceCaptureResult, result.sessionId == sessionId {
        resolve([
          "uri": result.uri,
          "finalSnapshot": result.snapshot
        ])
        return
      }

      resolve([
        "uri": NSNull(),
        "finalSnapshot": NSNull(),
        "stopReason": "error"
      ])
    }
  }

  @objc func requestRecordPermission(_ resolve: @escaping RCTPromiseResolveBlock,
                                     rejecter reject: @escaping RCTPromiseRejectBlock) {
    AVAudioSession.sharedInstance().requestRecordPermission { [weak self] granted in
      guard granted else {
        resolve(false)
        return
      }

      guard let self = self else {
        resolve(true)
        return
      }
      self.requestSpeechRecognitionPermissionBestEffort { _ in
        // Target-word recognition is only an optional endpoint hint. Microphone
        // permission remains the recorder's sole availability requirement.
        resolve(true)
      }
    }
  }

  @objc func requestTargetWordRecognitionPermission(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    requestSpeechRecognitionPermissionBestEffort { authorized in
      resolve(authorized)
    }
  }
  
  @objc func checkRecordPermission(_ resolve: @escaping RCTPromiseResolveBlock,
                                   rejecter reject: @escaping RCTPromiseRejectBlock) {
    let status = AVAudioSession.sharedInstance().recordPermission
    resolve(status == .granted)
  }

  private func startVoiceCapture(
    options: VoiceActivityOptions,
    autoEndpointEnabled: Bool,
    completion: @escaping (Result<VoiceCapture, Error>) -> Void
  ) {
    voiceRecordingQueue.async { [weak self] in
      guard let self = self else {
        completion(.failure(NSError(
          domain: "SkidsAudio",
          code: 1,
          userInfo: [NSLocalizedDescriptionKey: "Audio module is unavailable"]
        )))
        return
      }

      guard self.isApplicationActive() else {
        if let activeCapture = self.voiceCapture {
          _ = self.finalizeVoiceCapture(
            activeCapture,
            requestedReason: "interrupted"
          )
        }
        completion(.failure(self.applicationInactiveError()))
        return
      }

      if let activeCapture = self.voiceCapture {
        _ = self.finalizeVoiceCapture(
          activeCapture,
          requestedReason: "manual"
        )
      }
      if let previousResult = self.lastVoiceCaptureResult {
        try? FileManager.default.removeItem(at: previousResult.url)
        self.lastVoiceCaptureResult = nil
      }

      self.stopSpeechPlayer(resolvePendingPromise: true)

      let session = self.recordingSession ?? AVAudioSession.sharedInstance()
      let previousConfiguration = AudioSessionConfiguration(
        category: session.category,
        mode: session.mode,
        options: session.categoryOptions
      )
      let sessionId = UUID().uuidString
      var outputUrl: URL?
      var captureToCleanUp: VoiceCapture?

      do {
        try session.setCategory(
          .playAndRecord,
          mode: .voiceChat,
          options: [.defaultToSpeaker, .allowBluetoothHFP]
        )
        try? session.setPreferredSampleRate(48_000)
        try? session.setPreferredIOBufferDuration(0.02)
        try session.setActive(true)

        let engine = AVAudioEngine()
        let inputNode = engine.inputNode
        // This supplies Apple's local echo cancellation/noise processing when the
        // route supports it. Raw PCM analysis remains available if it fails.
        try? inputNode.setVoiceProcessingEnabled(true)
        if inputNode.isVoiceProcessingEnabled {
          inputNode.isVoiceProcessingAGCEnabled = true
        }

        let recordingFormat = inputNode.outputFormat(forBus: 0)
        guard recordingFormat.sampleRate > 0, recordingFormat.channelCount > 0 else {
          throw NSError(
            domain: "SkidsAudio",
            code: 2,
            userInfo: [NSLocalizedDescriptionKey: "Microphone returned an invalid audio format"]
          )
        }

        let cacheDirectory = FileManager.default.urls(
          for: .cachesDirectory,
          in: .userDomainMask
        )[0]
        let audioUrl = cacheDirectory.appendingPathComponent(
          "skids_voice_\(sessionId).caf"
        )
        outputUrl = audioUrl
        let audioFile = try AVAudioFile(
          forWriting: audioUrl,
          settings: recordingFormat.settings,
          commonFormat: recordingFormat.commonFormat,
          interleaved: recordingFormat.isInterleaved
        )
        let detector = VoiceActivityDetector(
          sessionId: sessionId,
          options: options,
          autoEndpointEnabled: autoEndpointEnabled
        )
        let targetMatcher = autoEndpointEnabled
          ? options.targetText.map {
              VoiceTargetMatcher(
                targetText: $0,
                localeIdentifier: options.targetLocale
              )
            }
          : nil
        let capture = VoiceCapture(
          sessionId: sessionId,
          url: audioUrl,
          engine: engine,
          inputNode: inputNode,
          audioFile: audioFile,
          detector: detector,
          targetMatcher: targetMatcher,
          targetMatchPostRollMs: options.targetMatchPostRollMs,
          previousAudioSessionConfiguration: previousConfiguration
        )
        captureToCleanUp = capture
        self.voiceCapture = capture

        inputNode.installTap(
          onBus: 0,
          bufferSize: 1_024,
          format: recordingFormat
        ) { [weak self, weak capture] buffer, _ in
          guard let self = self, let capture = capture else {
            return
          }

          if capture.process(buffer) {
            self.voiceRecordingQueue.async { [weak self, weak capture] in
              guard
                let self = self,
                let capture = capture,
                self.voiceCapture === capture
              else {
                return
              }

              let snapshot = capture.snapshot()
              let reason = snapshot["stopReason"] as? String ?? "maxDuration"
              _ = self.finalizeVoiceCapture(
                capture,
                requestedReason: reason
              )
            }
          }
        }
        capture.tapInstalled = true

        engine.prepare()
        try engine.start()

        guard self.isApplicationActive() else {
          let interruptedResult = self.finalizeVoiceCapture(
            capture,
            requestedReason: "interrupted"
          )
          try? FileManager.default.removeItem(at: interruptedResult.url)
          if self.lastVoiceCaptureResult?.sessionId == capture.sessionId {
            self.lastVoiceCaptureResult = nil
          }
          completion(.failure(self.applicationInactiveError()))
          return
        }

        completion(.success(capture))
      } catch {
        if let capture = captureToCleanUp {
          _ = capture.markStopped(requestedReason: "error")
          if capture.tapInstalled {
            capture.inputNode.removeTap(onBus: 0)
            capture.tapInstalled = false
          }
          capture.engine.stop()
        }
        self.voiceCapture = nil
        if let outputUrl = outputUrl {
          try? FileManager.default.removeItem(at: outputUrl)
        }
        self.restoreAudioSession(previousConfiguration)
        completion(.failure(error))
      }
    }
  }

  private func isApplicationActive() -> Bool {
    if Thread.isMainThread {
      return UIApplication.shared.applicationState == .active
    }

    return DispatchQueue.main.sync {
      UIApplication.shared.applicationState == .active
    }
  }

  private func applicationInactiveError() -> NSError {
    NSError(
      domain: "SkidsAudio",
      code: 3,
      userInfo: [
        NSLocalizedDescriptionKey: "Voice recording cannot start while the app is inactive"
      ]
    )
  }

  @discardableResult
  private func finalizeVoiceCapture(
    _ capture: VoiceCapture,
    requestedReason: String
  ) -> VoiceCaptureResult {
    if capture.tapInstalled {
      capture.inputNode.removeTap(onBus: 0)
      capture.tapInstalled = false
    }
    capture.engine.stop()
    let snapshot = capture.markStopped(requestedReason: requestedReason)
    restoreAudioSession(capture.previousAudioSessionConfiguration)

    let result = VoiceCaptureResult(
      sessionId: capture.sessionId,
      uri: capture.uri,
      snapshot: snapshot,
      url: capture.url
    )
    if voiceCapture === capture {
      voiceCapture = nil
    }
    lastVoiceCaptureResult = result
    return result
  }

  private func finishVoiceCaptureAfterSystemEvent(reason: String) {
    voiceRecordingQueue.async { [weak self] in
      guard let self = self, let capture = self.voiceCapture else {
        return
      }

      _ = self.finalizeVoiceCapture(capture, requestedReason: reason)
    }
  }

  private func restoreAudioSession(_ configuration: AudioSessionConfiguration) {
    let session = recordingSession ?? AVAudioSession.sharedInstance()
    try? session.setActive(false, options: .notifyOthersOnDeactivation)
    do {
      try session.setCategory(
        configuration.category,
        mode: configuration.mode,
        options: configuration.options
      )
      try session.setActive(true)
    } catch {
      print("Failed to restore audio session: \(error)")
    }
  }

  private func normalizedStopReason(_ reason: String) -> String {
    switch reason {
    case "endOfSpeech", "targetWordMatch", "noSpeechTimeout", "maxDuration",
         "manual", "interrupted", "error":
      return reason
    default:
      return "manual"
    }
  }

  private func requestSpeechRecognitionPermissionBestEffort(
    completion: @escaping (Bool) -> Void
  ) {
    switch SFSpeechRecognizer.authorizationStatus() {
    case .notDetermined:
      DispatchQueue.main.async {
        SFSpeechRecognizer.requestAuthorization { status in
          completion(status == .authorized)
        }
      }
    case .authorized:
      completion(true)
    case .denied, .restricted:
      completion(false)
    @unknown default:
      completion(false)
    }
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
