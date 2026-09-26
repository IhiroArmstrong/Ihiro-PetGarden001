/**
 * Focus Tiger — macOS Speech helper (Slice 0 probe).
 * Commands: gate | transcribe [--max-seconds N]
 * Stop early: write "stop\n" to stdin during transcribe.
 */

import AVFoundation
import Darwin
import Foundation
import Speech

let defaultLocale = "en-US"

func emitJson(_ payload: [String: Any]) {
  guard
    let data = try? JSONSerialization.data(withJSONObject: payload, options: []),
    let line = String(data: data, encoding: .utf8)
  else {
    fputs("{\"ok\":false,\"error\":\"json_encode_failed\"}\n", stderr)
    exit(2)
  }
  print(line)
  fflush(stdout)
}

func runCatching(_ body: @escaping () -> Void) -> String? {
  var reason: NSString?
  let ok = FTRunCatching({ body() }, &reason)
  return ok ? nil : (reason as String?)
}

func resolvedRecordingFormat(for node: AVAudioInputNode) -> AVAudioFormat? {
  var format = node.outputFormat(forBus: 0)
  if format.sampleRate <= 0 || format.channelCount == 0 {
    format = node.inputFormat(forBus: 0)
  }
  if format.sampleRate <= 0 || format.channelCount == 0 {
    return AVAudioFormat(standardFormatWithSampleRate: 48_000, channels: 1)
  }
  return format
}

func speechAuthLabel(_ status: SFSpeechRecognizerAuthorizationStatus) -> String {
  switch status {
  case .authorized: return "authorized"
  case .denied: return "denied"
  case .restricted: return "restricted"
  case .notDetermined: return "notDetermined"
  @unknown default: return "unknown"
  }
}

func microphoneAuthLabel() -> String {
  if #available(macOS 14.0, *) {
    switch AVAudioApplication.shared.recordPermission {
    case .granted: return "granted"
    case .denied: return "denied"
    case .undetermined: return "notDetermined"
    @unknown default: return "unknown"
    }
  }
  switch AVCaptureDevice.authorizationStatus(for: .audio) {
  case .authorized: return "granted"
  case .denied: return "denied"
  case .notDetermined: return "notDetermined"
  case .restricted: return "restricted"
  @unknown default: return "unknown"
  }
}

func pumpRunLoop(until shouldStop: () -> Bool, timeoutSeconds: Double) -> Bool {
  let deadline = Date().addingTimeInterval(timeoutSeconds)
  while !shouldStop() && Date() < deadline {
    RunLoop.current.run(mode: .default, before: Date(timeIntervalSinceNow: 0.05))
  }
  return shouldStop()
}

func requestSpeechAuthorization() -> SFSpeechRecognizerAuthorizationStatus {
  var result = SFSpeechRecognizer.authorizationStatus()
  if result != .notDetermined {
    return result
  }
  var finished = false
  SFSpeechRecognizer.requestAuthorization { status in
    result = status
    finished = true
  }
  _ = pumpRunLoop(until: { finished }, timeoutSeconds: 60)
  return result
}

func requestMicrophoneAuthorization() -> String {
  if #available(macOS 14.0, *) {
    if AVAudioApplication.shared.recordPermission == .granted {
      return "granted"
    }
    if AVAudioApplication.shared.recordPermission == .denied {
      return "denied"
    }
    var granted = false
    var finished = false
    AVAudioApplication.requestRecordPermission { ok in
      granted = ok
      finished = true
    }
    _ = pumpRunLoop(until: { finished }, timeoutSeconds: 60)
    return granted ? "granted" : "denied"
  }
  let status = AVCaptureDevice.authorizationStatus(for: .audio)
  if status == .authorized {
    return "granted"
  }
  if status == .denied || status == .restricted {
    return "denied"
  }
  var granted = false
  var finished = false
  AVCaptureDevice.requestAccess(for: .audio) { ok in
    granted = ok
    finished = true
  }
  _ = pumpRunLoop(until: { finished }, timeoutSeconds: 60)
  return granted ? "granted" : "denied"
}

func onDeviceSupported(for localeId: String) -> Bool {
  guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: localeId)) else {
    return false
  }
  if #available(macOS 13.0, *) {
    return recognizer.supportsOnDeviceRecognition
  }
  return false
}

func runGate(localeId: String) {
  let speechStatus = requestSpeechAuthorization()
  let micStatus = requestMicrophoneAuthorization()
  let recognizer = SFSpeechRecognizer(locale: Locale(identifier: localeId))
  emitJson([
    "command": "gate",
    "ok": true,
    "locale": localeId,
    "onDeviceSupported": onDeviceSupported(for: localeId),
    "recognizerAvailable": recognizer?.isAvailable ?? false,
    "speechAuthorization": speechAuthLabel(speechStatus),
    "microphoneAuthorization": micStatus,
    "requiresOnDeviceRecognition": true
  ])
}

func runTranscribe(localeId: String, maxSeconds: Double) {
  let started = Date()
  let speechStatus = requestSpeechAuthorization()
  if speechStatus != .authorized {
    emitJson([
      "command": "transcribe",
      "ok": false,
      "error": "speech_authorization_denied",
      "speechAuthorization": speechAuthLabel(speechStatus),
      "latencyMs": Int(Date().timeIntervalSince(started) * 1000)
    ])
    exit(1)
  }

  let micStatus = requestMicrophoneAuthorization()
  if micStatus != "granted" {
    emitJson([
      "command": "transcribe",
      "ok": false,
      "error": "microphone_authorization_denied",
      "microphoneAuthorization": micStatus,
      "latencyMs": Int(Date().timeIntervalSince(started) * 1000)
    ])
    exit(1)
  }

  guard onDeviceSupported(for: localeId) else {
    emitJson([
      "command": "transcribe",
      "ok": false,
      "error": "on_device_not_supported",
      "locale": localeId,
      "requiresOnDeviceRecognition": true,
      "latencyMs": Int(Date().timeIntervalSince(started) * 1000)
    ])
    exit(1)
  }

  guard
    let recognizer = SFSpeechRecognizer(locale: Locale(identifier: localeId)),
    recognizer.isAvailable
  else {
    emitJson([
      "command": "transcribe",
      "ok": false,
      "error": "recognizer_unavailable",
      "locale": localeId,
      "latencyMs": Int(Date().timeIntervalSince(started) * 1000)
    ])
    exit(1)
  }

  let request = SFSpeechAudioBufferRecognitionRequest()
  request.shouldReportPartialResults = true
  if #available(macOS 13.0, *) {
    request.requiresOnDeviceRecognition = true
    request.addsPunctuation = true
  }
  if #available(macOS 14.0, *) {
    request.taskHint = .dictation
  }

  let engine = AVAudioEngine()
  var finalText = ""
  var failure: String? = nil
  var finished = false
  var audioEnded = false
  var didSignal = false
  var bufferCount = 0
  var peakRms: Float = 0
  let finalizeLock = NSLock()
  var inputNode: AVAudioInputNode!
  var recordingFormat: AVAudioFormat!
  var engineStartError: String?

  func signalWhenReady() {
    finalizeLock.lock()
    defer { finalizeLock.unlock() }
    guard audioEnded, !didSignal else { return }
    didSignal = true
  }

  func isReadyToFinalize() -> Bool {
    finalizeLock.lock()
    let ready = didSignal
    finalizeLock.unlock()
    return ready
  }

  func endCapture() {
    finalizeLock.lock()
    defer { finalizeLock.unlock() }
    guard !audioEnded else { return }
    audioEnded = true
    request.endAudio()
    // On-device STT can need several seconds after endAudio for short utterances.
    DispatchQueue.global(qos: .utility).asyncAfter(deadline: .now() + 6.0) {
      signalWhenReady()
    }
  }

  DispatchQueue.global(qos: .utility).async {
    while !finished {
      let chunk = FileHandle.standardInput.availableData
      if !chunk.isEmpty {
        let line = String(data: chunk, encoding: .utf8) ?? ""
        if line.contains("stop") {
          finished = true
          endCapture()
          break
        }
      }
      Thread.sleep(forTimeInterval: 0.05)
    }
  }

  DispatchQueue.global(qos: .utility).asyncAfter(deadline: .now() + maxSeconds) {
    if !finished {
      finished = true
      endCapture()
    }
  }

  // Recognition callbacks are delivered on the main run loop. Start the task
  // before capture and pump the run loop while waiting — sem.wait would stall it.
  let task = recognizer.recognitionTask(with: request) { result, error in
    if let result {
      let text = result.bestTranscription.formattedString
      if !text.isEmpty {
        finalText = text
      }
      if result.isFinal {
        signalWhenReady()
      } else if !finalText.isEmpty {
        finalizeLock.lock()
        let ended = audioEnded
        finalizeLock.unlock()
        if ended {
          signalWhenReady()
        }
      }
    }
    if let error {
      failure = error.localizedDescription
      finalizeLock.lock()
      audioEnded = true
      finalizeLock.unlock()
      signalWhenReady()
    }
  }

  let thrown = runCatching {
    inputNode = engine.inputNode
    guard let format = resolvedRecordingFormat(for: inputNode) else {
      engineStartError = "input node sample rate is 0"
      return
    }
    recordingFormat = format
    inputNode.installTap(onBus: 0, bufferSize: 4096, format: format) { buffer, _ in
      request.append(buffer)
      finalizeLock.lock()
      bufferCount += 1
      if let channel = buffer.floatChannelData?[0] {
        let frames = Int(buffer.frameLength)
        if frames > 0 {
          var sum: Float = 0
          for i in 0..<frames {
            let sample = channel[i]
            sum += sample * sample
          }
          let rms = sqrt(sum / Float(frames))
          if rms > peakRms {
            peakRms = rms
          }
        }
      }
      finalizeLock.unlock()
    }
    do {
      try engine.start()
    } catch {
      engineStartError = error.localizedDescription
    }
  }
  if let thrown {
    task.cancel()
    emitJson([
      "command": "transcribe",
      "ok": false,
      "error": "audio_engine_start_failed",
      "detail": thrown,
      "latencyMs": Int(Date().timeIntervalSince(started) * 1000)
    ])
    exit(1)
  }
  if let engineStartError {
    task.cancel()
    engine.stop()
    let code = engineStartError.contains("sample rate") ? "audio_format_invalid" : "audio_engine_start_failed"
    emitJson([
      "command": "transcribe",
      "ok": false,
      "error": code,
      "detail": engineStartError,
      "latencyMs": Int(Date().timeIntervalSince(started) * 1000)
    ])
    exit(1)
  }

  _ = pumpRunLoop(until: { isReadyToFinalize() }, timeoutSeconds: maxSeconds + 12.0)
  finished = true
  engine.stop()
  inputNode.removeTap(onBus: 0)
  let capturedBuffers: Int
  let capturedPeak: Float
  finalizeLock.lock()
  capturedBuffers = bufferCount
  capturedPeak = peakRms
  finalizeLock.unlock()
  task.cancel()

  let latencyMs = Int(Date().timeIntervalSince(started) * 1000)
  if capturedBuffers == 0 {
    emitJson([
      "command": "transcribe",
      "ok": false,
      "error": "audio_tap_empty",
      "sampleRate": recordingFormat.sampleRate,
      "channelCount": Int(recordingFormat.channelCount),
      "bufferCount": capturedBuffers,
      "peakRms": Double(capturedPeak),
      "latencyMs": latencyMs
    ])
    exit(1)
  }
  if let failure, finalText.isEmpty {
    emitJson([
      "command": "transcribe",
      "ok": false,
      "error": "recognition_failed",
      "detail": failure,
      "requiresOnDeviceRecognition": true,
      "sampleRate": recordingFormat.sampleRate,
      "bufferCount": capturedBuffers,
      "peakRms": Double(capturedPeak),
      "latencyMs": latencyMs
    ])
    exit(1)
  }

  emitJson([
    "command": "transcribe",
    "ok": true,
    "locale": localeId,
    "transcript": finalText,
    "requiresOnDeviceRecognition": true,
    "onDeviceEnforced": true,
    "sampleRate": recordingFormat.sampleRate,
    "channelCount": Int(recordingFormat.channelCount),
    "bufferCount": capturedBuffers,
    "peakRms": Double(capturedPeak),
    "latencyMs": latencyMs
  ])
}

let args = CommandLine.arguments
setbuf(stdout, nil)
setbuf(stderr, nil)
guard args.count >= 2 else {
  emitJson(["ok": false, "error": "usage", "detail": "macos-speech-helper gate|transcribe [--max-seconds N]"])
  exit(2)
}

var localeId = defaultLocale
var maxSeconds = 15.0
if let localeIndex = args.firstIndex(of: "--locale"), localeIndex + 1 < args.count {
  localeId = args[localeIndex + 1]
}
if let maxIndex = args.firstIndex(of: "--max-seconds"), maxIndex + 1 < args.count {
  maxSeconds = Double(args[maxIndex + 1]) ?? maxSeconds
}

switch args[1] {
case "gate":
  runGate(localeId: localeId)
case "transcribe":
  runTranscribe(localeId: localeId, maxSeconds: maxSeconds)
default:
  emitJson(["ok": false, "error": "unknown_command", "detail": args[1]])
  exit(2)
}
