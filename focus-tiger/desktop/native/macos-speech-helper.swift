/**
 * Focus Tiger — macOS Speech helper (Slice 0 probe).
 * Commands: gate | transcribe [--max-seconds N]
 * Stop early: write "stop\n" to stdin during transcribe.
 */

import AVFoundation
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

func requestSpeechAuthorization() -> SFSpeechRecognizerAuthorizationStatus {
  let sem = DispatchSemaphore(value: 0)
  var result = SFSpeechRecognizer.authorizationStatus()
  if result == .notDetermined {
    SFSpeechRecognizer.requestAuthorization { status in
      result = status
      sem.signal()
    }
    sem.wait()
  }
  return result
}

func requestMicrophoneAuthorization() -> String {
  if #available(macOS 14.0, *) {
    let sem = DispatchSemaphore(value: 0)
    var granted = AVAudioApplication.shared.recordPermission == .granted
    if AVAudioApplication.shared.recordPermission == .undetermined {
      AVAudioApplication.requestRecordPermission { ok in
        granted = ok
        sem.signal()
      }
      sem.wait()
    }
    return granted ? "granted" : "denied"
  }
  let sem = DispatchSemaphore(value: 0)
  var granted = AVCaptureDevice.authorizationStatus(for: .audio) == .authorized
  if AVCaptureDevice.authorizationStatus(for: .audio) == .notDetermined {
    AVCaptureDevice.requestAccess(for: .audio) { ok in
      granted = ok
      sem.signal()
    }
    sem.wait()
  }
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
  let recognizer = SFSpeechRecognizer(locale: Locale(identifier: localeId))
  emitJson([
    "command": "gate",
    "ok": true,
    "locale": localeId,
    "onDeviceSupported": onDeviceSupported(for: localeId),
    "recognizerAvailable": recognizer?.isAvailable ?? false,
    "speechAuthorization": speechAuthLabel(SFSpeechRecognizer.authorizationStatus()),
    "microphoneAuthorization": microphoneAuthLabel(),
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
  }

  let engine = AVAudioEngine()
  let inputNode = engine.inputNode
  let recordingFormat = inputNode.outputFormat(forBus: 0)
  inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
    request.append(buffer)
  }

  let sem = DispatchSemaphore(value: 0)
  var finalText = ""
  var failure: String? = nil
  var finished = false
  var userStopped = false

  DispatchQueue.global(qos: .utility).async {
    while !finished {
      let chunk = FileHandle.standardInput.availableData
      if !chunk.isEmpty {
        let line = String(data: chunk, encoding: .utf8) ?? ""
        if line.contains("stop") {
          finished = true
          userStopped = true
          request.endAudio()
          DispatchQueue.global(qos: .utility).asyncAfter(deadline: .now() + 2.5) {
            sem.signal()
          }
          break
        }
      }
      Thread.sleep(forTimeInterval: 0.05)
    }
  }

  DispatchQueue.global(qos: .utility).asyncAfter(deadline: .now() + maxSeconds) {
    if !finished {
      finished = true
      request.endAudio()
    }
  }

  do {
    try engine.start()
  } catch {
    emitJson([
      "command": "transcribe",
      "ok": false,
      "error": "audio_engine_start_failed",
      "detail": error.localizedDescription,
      "latencyMs": Int(Date().timeIntervalSince(started) * 1000)
    ])
    exit(1)
  }

  let task = recognizer.recognitionTask(with: request) { result, error in
    if let result {
      finalText = result.bestTranscription.formattedString
      if result.isFinal {
        sem.signal()
      }
    }
    if let error {
      failure = error.localizedDescription
      sem.signal()
    }
  }

  let waitSeconds = userStopped ? 6.0 : maxSeconds + 8.0
  _ = sem.wait(timeout: .now() + waitSeconds)
  finished = true
  engine.stop()
  inputNode.removeTap(onBus: 0)
  task.cancel()

  let latencyMs = Int(Date().timeIntervalSince(started) * 1000)
  if let failure, finalText.isEmpty {
    emitJson([
      "command": "transcribe",
      "ok": false,
      "error": "recognition_failed",
      "detail": failure,
      "requiresOnDeviceRecognition": true,
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
    "latencyMs": latencyMs
  ])
}

let args = CommandLine.arguments
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
