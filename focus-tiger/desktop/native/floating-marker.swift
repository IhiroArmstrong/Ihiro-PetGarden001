// Focus Tiger™ is a product of Twinsology.
// Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
//
// Embedded NSPanel helper. Spawned by Electron (`--embedded`).
// Compile:
//   swiftc -O -framework AppKit -framework SwiftUI -framework QuartzCore -framework CoreGraphics \
//     floating-marker.swift -o floating-marker

import AppKit
import CoreGraphics
import SwiftUI
import QuartzCore

let panelSize = NSSize(width: 56, height: 56)
let peekWidth: CGFloat = 12
let coveringRatio: CGFloat = 0.97

enum Edge: Int { case left = 0, right = 1 }

func displayID(of screen: NSScreen) -> UInt32 {
    (screen.deviceDescription[NSDeviceDescriptionKey("NSScreenNumber")] as? NSNumber)?.uint32Value ?? 0
}

func emit(_ event: String, extra: [String: Any] = [:]) {
    var payload: [String: Any] = ["event": event]
    extra.forEach { payload[$0.key] = $0.value }
    guard let data = try? JSONSerialization.data(withJSONObject: payload),
          let line = String(data: data, encoding: .utf8) else { return }
    fputs(line + "\n", stdout)
    fflush(stdout)
}

final class FloatingPanel: NSPanel {
    init() {
        super.init(contentRect: NSRect(origin: .zero, size: panelSize),
                   styleMask: [.borderless, .nonactivatingPanel],
                   backing: .buffered,
                   defer: false)
        isFloatingPanel = true
        level = .floating
        hidesOnDeactivate = false
        worksWhenModal = true
        isOpaque = false
        backgroundColor = .clear
        hasShadow = false
        isReleasedWhenClosed = false
        collectionBehavior = [.stationary, .ignoresCycle, .moveToActiveSpace]
    }

    override var canBecomeKey: Bool { false }
    override var canBecomeMain: Bool { false }

    override func constrainFrameRect(_ frameRect: NSRect, to screen: NSScreen?) -> NSRect {
        frameRect
    }
}

final class MarkerUIState: ObservableObject {
    @Published var expanded = false
    @Published var reduceMotion = false
}

struct TigerMarkView: View {
    @ObservedObject var state: MarkerUIState
    @State private var breathe = false

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(Color.black.opacity(state.expanded ? 0.62 : 0.42))
            if state.expanded {
                Text("🐯")
                    .font(.system(size: 28))
                    .scaleEffect(breathe && !state.reduceMotion ? 1.06 : 1.0)
                    .animation(
                        state.reduceMotion
                            ? nil
                            : .easeInOut(duration: 2.4).repeatForever(autoreverses: true),
                        value: breathe
                    )
            } else {
                Capsule()
                    .fill(Color.white.opacity(0.85))
                    .frame(width: 3, height: 20)
            }
        }
        .onAppear {
            if !state.reduceMotion { breathe = true }
        }
        .onChange(of: state.expanded) { _, expanded in
            if !expanded { breathe = false }
            else if !state.reduceMotion { breathe = true }
        }
    }
}

final class MarkerView: NSView {
    var onClick: (() -> Void)?
    var onDragEnd: (() -> Void)?
    var onHover: ((Bool) -> Void)?

    var edge: Edge = .right
    private(set) var isDragging = false
    let ui = MarkerUIState()

    private var dragStartMouse = NSPoint.zero
    private var dragStartOrigin = NSPoint.zero
    private var hosting: NSHostingView<TigerMarkView>!

    override init(frame frameRect: NSRect) {
        super.init(frame: frameRect)
        hosting = NSHostingView(rootView: TigerMarkView(state: ui))
        hosting.frame = bounds
        hosting.autoresizingMask = [.width, .height]
        addSubview(hosting)
    }

    required init?(coder: NSCoder) { nil }

    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }

    override func updateTrackingAreas() {
        super.updateTrackingAreas()
        trackingAreas.forEach(removeTrackingArea)
        addTrackingArea(NSTrackingArea(
            rect: .zero,
            options: [.mouseEnteredAndExited, .activeAlways, .inVisibleRect],
            owner: self, userInfo: nil))
    }

    override func mouseEntered(with event: NSEvent) { onHover?(true) }
    override func mouseExited(with event: NSEvent) { onHover?(false) }

    override func mouseDown(with event: NSEvent) {
        isDragging = false
        dragStartMouse = NSEvent.mouseLocation
        dragStartOrigin = window?.frame.origin ?? .zero
    }

    override func mouseDragged(with event: NSEvent) {
        let m = NSEvent.mouseLocation
        let dx = m.x - dragStartMouse.x
        let dy = m.y - dragStartMouse.y
        if !isDragging && hypot(dx, dy) > 4 { isDragging = true }
        if isDragging {
            window?.setFrameOrigin(NSPoint(x: dragStartOrigin.x + dx, y: dragStartOrigin.y + dy))
        }
    }

    override func mouseUp(with event: NSEvent) {
        if isDragging {
            isDragging = false
            onDragEnd?()
        } else {
            onClick?()
        }
    }
}

final class MarkerController: NSObject {
    private let defaults = UserDefaults.standard
    private let panel = FloatingPanel()
    private let view = MarkerView(frame: NSRect(origin: .zero, size: panelSize))

    private var screen: NSScreen = NSScreen.screens.first ?? NSScreen.main!
    private var edge: Edge = .right
    private var yRatio: CGFloat = 0.5
    private var expanded = false
    private var collapseWork: DispatchWorkItem?
    private var hideInFullScreen = true
    private var wantShow = false
    private var presenceTimer: Timer?
    private var parentPid: pid_t = 0

    func start() {
        for arg in CommandLine.arguments {
            if arg.hasPrefix("--parent-pid="), let n = Int32(arg.dropFirst("--parent-pid=".count)) {
                parentPid = n
            }
        }
        view.ui.reduceMotion = NSWorkspace.shared.accessibilityDisplayShouldReduceMotion
        panel.contentView = view
        view.onHover = { [weak self] inside in self?.hover(inside) }
        view.onClick = { [weak self] in
            emit("clicked")
            self?.view.ui.expanded = true
        }
        view.onDragEnd = { [weak self] in self?.dragEnded() }

        restorePlacement()
        applyCollectionBehavior()
        refreshVisibility()
        startPresenceWatch()

        NotificationCenter.default.addObserver(
            self, selector: #selector(screensChanged),
            name: NSApplication.didChangeScreenParametersNotification, object: nil)
        NSWorkspace.shared.notificationCenter.addObserver(
            self, selector: #selector(spaceOrAppChanged),
            name: NSWorkspace.activeSpaceDidChangeNotification, object: nil)
        NSWorkspace.shared.notificationCenter.addObserver(
            self, selector: #selector(spaceOrAppChanged),
            name: NSWorkspace.didActivateApplicationNotification, object: nil)
    }

    func applyCommand(_ json: [String: Any]) {
        let cmd = json["cmd"] as? String ?? ""
        if cmd == "quit" {
            NSApp.terminate(nil)
            return
        }
        if cmd == "configure" {
            if let show = json["show"] as? Bool { wantShow = show }
            if let hide = json["hideInFullScreen"] as? Bool { hideInFullScreen = hide }
            applyCollectionBehavior()
            refreshVisibility()
        }
    }

    private func startPresenceWatch() {
        presenceTimer?.invalidate()
        presenceTimer = Timer.scheduledTimer(withTimeInterval: 0.8, repeats: true) { [weak self] _ in
            self?.refreshVisibility()
        }
        presenceTimer?.tolerance = 0.3
    }

    private func hover(_ inside: Bool) {
        guard !view.isDragging else { return }
        collapseWork?.cancel()
        if inside {
            setExpanded(true)
        } else {
            let work = DispatchWorkItem { [weak self] in self?.setExpanded(false) }
            collapseWork = work
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5, execute: work)
        }
    }

    private func setExpanded(_ value: Bool) {
        guard expanded != value else { return }
        expanded = value
        view.ui.expanded = value
        place(animated: !view.ui.reduceMotion)
    }

    private func dragEnded() {
        let f = panel.frame
        let center = NSPoint(x: f.midX, y: f.midY)
        let target = NSScreen.screens.first { $0.frame.contains(center) } ?? screen
        screen = target
        edge = center.x < target.frame.midX ? .left : .right
        let vf = target.visibleFrame
        let range = vf.height - panelSize.height
        yRatio = range > 0 ? min(max((f.minY - vf.minY) / range, 0), 1) : 0.5
        savePlacement()
        expanded = true
        view.ui.expanded = true
        place(animated: !view.ui.reduceMotion)
        hover(targetFrame(expanded: true).contains(NSEvent.mouseLocation))
    }

    private func targetFrame(expanded: Bool) -> NSRect {
        let sf = screen.frame
        let vf = screen.visibleFrame
        let range = max(vf.height - panelSize.height, 0)
        let y = vf.minY + range * yRatio
        let visible = expanded ? panelSize.width : peekWidth
        let x = (edge == .right) ? sf.maxX - visible
                                 : sf.minX - (panelSize.width - visible)
        return NSRect(x: x, y: y, width: panelSize.width, height: panelSize.height)
    }

    private func place(animated: Bool) {
        view.edge = edge
        let f = targetFrame(expanded: expanded)
        let duration: TimeInterval = view.ui.reduceMotion ? 0 : 0.18
        if animated && duration > 0 {
            NSAnimationContext.runAnimationGroup { ctx in
                ctx.duration = duration
                ctx.timingFunction = CAMediaTimingFunction(name: .easeOut)
                panel.animator().setFrame(f, display: true)
            }
        } else {
            panel.setFrame(f, display: true)
        }
    }

    private func savePlacement() {
        var all = (defaults.dictionary(forKey: "marker.placements") as? [String: [Double]]) ?? [:]
        let id = displayID(of: screen)
        all[String(id)] = [Double(edge.rawValue), Double(yRatio)]
        defaults.set(all, forKey: "marker.placements")
        defaults.set(Int(id), forKey: "marker.lastScreen")
    }

    private func restorePlacement() {
        let lastID = UInt32(truncatingIfNeeded: defaults.integer(forKey: "marker.lastScreen"))
        if let s = NSScreen.screens.first(where: { displayID(of: $0) == lastID }) ?? NSScreen.screens.first {
            screen = s
        }
        let all = defaults.dictionary(forKey: "marker.placements") as? [String: [Double]]
        if let arr = all?[String(displayID(of: screen))], arr.count == 2 {
            edge = Edge(rawValue: Int(arr[0])) ?? .right
            yRatio = CGFloat(arr[1])
        } else {
            edge = .right
            yRatio = 0.5
        }
        place(animated: false)
    }

    @objc private func screensChanged() { restorePlacement(); refreshVisibility() }
    @objc private func spaceOrAppChanged() { refreshVisibility() }

    private func applyCollectionBehavior() {
        var b: NSWindow.CollectionBehavior = [.stationary, .ignoresCycle]
        if hideInFullScreen {
            b.insert(.moveToActiveSpace)
        } else {
            b.insert(.canJoinAllSpaces)
            b.insert(.fullScreenAuxiliary)
        }
        panel.collectionBehavior = b
        if panel.isVisible {
            panel.orderOut(nil)
            panel.orderFrontRegardless()
        }
    }

    private func menuBarCollapsed(on screen: NSScreen) -> Bool {
        (screen.frame.maxY - screen.visibleFrame.maxY) < 1
    }

    private func coveringWindow() -> Bool {
        guard let infoList = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]] else {
            return false
        }
        let selfPid = ProcessInfo.processInfo.processIdentifier
        let area = screen.frame.width * screen.frame.height
        guard area > 0 else { return false }
        for win in infoList {
            let layer = (win[kCGWindowLayer as String] as? NSNumber)?.intValue ?? 0
            if layer != 0 { continue }
            let pid = (win[kCGWindowOwnerPID as String] as? NSNumber)?.int32Value ?? 0
            if pid == selfPid || (parentPid != 0 && pid == parentPid) { continue }
            guard let boundsDict = win[kCGWindowBounds as String] as? NSDictionary,
                  let bounds = CGRect(dictionaryRepresentation: boundsDict as CFDictionary) else { continue }
            let ratio = (bounds.width * bounds.height) / area
            if ratio >= coveringRatio && abs(bounds.width - screen.frame.width) < 8 {
                return true
            }
        }
        return false
    }

    private func refreshVisibility() {
        if !wantShow {
            panel.orderOut(nil)
            return
        }
        let hideNow = hideInFullScreen && (
            NSScreen.screens.contains { menuBarCollapsed(on: $0) } || coveringWindow()
        )
        if hideNow {
            panel.orderOut(nil)
        } else {
            if !panel.isVisible {
                place(animated: false)
            }
            panel.orderFrontRegardless()
        }
    }
}

let embedded = CommandLine.arguments.contains("--embedded")
let app = NSApplication.shared
app.setActivationPolicy(.accessory)
let controller = MarkerController()
controller.start()
emit("ready")

if embedded {
    DispatchQueue.global(qos: .utility).async {
        while let line = readLine() {
            guard let data = line.data(using: .utf8),
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { continue }
            DispatchQueue.main.async { controller.applyCommand(json) }
        }
        DispatchQueue.main.async { NSApp.terminate(nil) }
    }
} else {
    controller.applyCommand(["cmd": "configure", "show": true, "hideInFullScreen": true])
}

app.run()
