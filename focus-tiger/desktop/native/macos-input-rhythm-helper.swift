/**
 * Focus Tiger — macOS input-rhythm helper (listen-only).
 * Emits one JSON object per second: keys / backs / switches.
 * Never prints keycodes, characters, or window titles.
 */

import AppKit
import ApplicationServices
import Foundation

let emitLock = NSLock()

func emitJson(_ payload: [String: Any]) {
  guard
    let data = try? JSONSerialization.data(withJSONObject: payload, options: []),
    let line = String(data: data, encoding: .utf8)
  else {
    return
  }
  emitLock.lock()
  print(line)
  fflush(stdout)
  emitLock.unlock()
}

final class RhythmTap {
  private var tap: CFMachPort?
  private var source: CFRunLoopSource?
  private var keys = 0
  private var backs = 0
  private var switches = 0
  private var lastBundle: String?
  private let deleteKey: CGKeyCode = 51
  private var flushTimer: DispatchSourceTimer?

  func start() {
    installTap()
    NSWorkspace.shared.notificationCenter.addObserver(
      forName: NSWorkspace.didActivateApplicationNotification,
      object: nil,
      queue: nil
    ) { [weak self] _ in
      self?.noteSwitch()
    }
    NSWorkspace.shared.notificationCenter.addObserver(
      forName: NSWorkspace.didWakeNotification,
      object: nil,
      queue: nil
    ) { [weak self] _ in
      self?.installTap()
    }
    let timer = DispatchSource.makeTimerSource(queue: DispatchQueue.main)
    timer.schedule(deadline: .now() + 1, repeating: 1)
    timer.setEventHandler { [weak self] in
      self?.flush()
    }
    timer.resume()
    flushTimer = timer
  }

  private func noteSwitch() {
    let bundle = NSWorkspace.shared.frontmostApplication?.bundleIdentifier
    if bundle == lastBundle { return }
    let previous = lastBundle
    lastBundle = bundle
    guard previous != nil else { return }
    let current = bundle ?? ""
    if current.contains("focus-tiger") || current.contains("Electron") { return }
    switches += 1
  }

  private func installTap() {
    if let existing = tap {
      CGEvent.tapEnable(tap: existing, enable: false)
    }
    tap = nil
    source = nil
    let mask = (1 << CGEventType.keyDown.rawValue)
    let callback: CGEventTapCallback = { _, type, event, refcon in
      guard type == .keyDown else { return Unmanaged.passUnretained(event) }
      guard let refcon else { return Unmanaged.passUnretained(event) }
      let box = Unmanaged<RhythmTap>.fromOpaque(refcon).takeUnretainedValue()
      box.keys += 1
      if CGKeyCode(event.getIntegerValueField(.keyboardEventKeycode)) == box.deleteKey {
        box.backs += 1
      }
      return Unmanaged.passUnretained(event)
    }
    guard
      let created = CGEvent.tapCreate(
        tap: .cgSessionEventTap,
        place: .headInsertEventTap,
        options: .listenOnly,
        eventsOfInterest: CGEventMask(mask),
        callback: callback,
        userInfo: Unmanaged.passUnretained(self).toOpaque()
      )
    else {
      emitJson(["ok": false, "error": "input_monitoring_denied", "t": Int(Date().timeIntervalSince1970 * 1000)])
      return
    }
    tap = created
    CGEvent.tapEnable(tap: created, enable: true)
    let loopSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, created, 0)
    source = loopSource
    CFRunLoopAddSource(CFRunLoopGetCurrent(), loopSource, .commonModes)
  }

  private func flush() {
    if tap == nil {
      emitJson(["ok": false, "error": "input_monitoring_denied", "t": Int(Date().timeIntervalSince1970 * 1000)])
      installTap()
      return
    }
    let payload: [String: Any] = [
      "ok": true,
      "t": Int(Date().timeIntervalSince1970 * 1000),
      "keys": keys,
      "backs": backs,
      "switches": switches
    ]
    keys = 0
    backs = 0
    switches = 0
    emitJson(payload)
  }
}

let rhythm = RhythmTap()
rhythm.start()
RunLoop.main.run()
