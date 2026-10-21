// FloatingMarker — 最小可运行的 macOS 右侧悬浮标记 Demo
//
// 编译运行（需要 Xcode Command Line Tools，macOS 12+）：
//   swiftc main.swift -o FloatingMarker && ./FloatingMarker
//
// 特性：
//   1. NSPanel + .nonactivatingPanel：点击不抢焦点
//   2. level = .floating，collectionBehavior 支持所有桌面 + 他人全屏 Space
//   3. 贴左/右边缘，半隐藏，鼠标靠近滑出
//   4. 可拖动，松手自动吸附到最近的边，位置按屏幕 ID 记忆
//   5. 菜单栏图标兜底：显示开关 / 全屏时隐藏 / 重置位置 / 退出
//   6. 监听显示器插拔，自动恢复位置

import AppKit
import CoreGraphics

// MARK: - 常量与工具

let panelSize = NSSize(width: 56, height: 56)
let peekWidth: CGFloat = 12          // 收起时露出的宽度

enum Edge: Int { case left = 0, right = 1 }

func displayID(of screen: NSScreen) -> UInt32 {
    (screen.deviceDescription[NSDeviceDescriptionKey("NSScreenNumber")] as? NSNumber)?.uint32Value ?? 0
}

// MARK: - 悬浮面板

final class FloatingPanel: NSPanel {
    init() {
        super.init(contentRect: NSRect(origin: .zero, size: panelSize),
                   styleMask: [.borderless, .nonactivatingPanel],
                   backing: .buffered,
                   defer: false)
        isFloatingPanel = true
        level = .floating              // 只用 .floating，不用更高层级
        hidesOnDeactivate = false      // NSPanel 默认切走 App 就隐藏，必须关掉
        worksWhenModal = true
        isOpaque = false
        backgroundColor = .clear
        hasShadow = false
        isReleasedWhenClosed = false
    }

    override var canBecomeKey: Bool { false }    // 永不成为 key，彻底不抢焦点
    override var canBecomeMain: Bool { false }

    // borderless 窗口默认会被系统“拉回”屏幕内，这里放行，才能做半隐藏
    override func constrainFrameRect(_ frameRect: NSRect, to screen: NSScreen?) -> NSRect {
        frameRect
    }
}

// MARK: - 标记视图（绘制 + 悬停 + 拖动/点击区分）

final class MarkerView: NSView {
    var onClick: (() -> Void)?
    var onDragEnd: (() -> Void)?
    var onHover: ((Bool) -> Void)?

    var emoji = "🐯" { didSet { needsDisplay = true } }
    var edge: Edge = .right { didSet { needsDisplay = true } }
    var expanded = false { didSet { needsDisplay = true } }
    private(set) var isDragging = false

    private var dragStartMouse = NSPoint.zero
    private var dragStartOrigin = NSPoint.zero

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
        if !isDragging && hypot(dx, dy) > 4 { isDragging = true }   // 超过 4pt 才算拖动
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

    override func draw(_ dirtyRect: NSRect) {
        let body = NSBezierPath(roundedRect: bounds.insetBy(dx: 2, dy: 2), xRadius: 14, yRadius: 14)
        NSColor.black.withAlphaComponent(expanded ? 0.65 : 0.45).setFill()
        body.fill()

        if expanded {
            let attrs: [NSAttributedString.Key: Any] = [.font: NSFont.systemFont(ofSize: 28)]
            let s = emoji as NSString
            let size = s.size(withAttributes: attrs)
            s.draw(at: NSPoint(x: bounds.midX - size.width / 2, y: bounds.midY - size.height / 2),
                   withAttributes: attrs)
        } else {
            // 收起状态：在露出的那一侧画一条小把手
            let gripX: CGFloat = edge == .right ? 4 : bounds.maxX - 7
            let grip = NSBezierPath(roundedRect: NSRect(x: gripX, y: bounds.midY - 10, width: 3, height: 20),
                                    xRadius: 1.5, yRadius: 1.5)
            NSColor.white.withAlphaComponent(0.85).setFill()
            grip.fill()
        }
    }
}

// MARK: - 控制器

final class MarkerController: NSObject {
    private let defaults = UserDefaults.standard
    private let panel = FloatingPanel()
    private let view = MarkerView(frame: NSRect(origin: .zero, size: panelSize))

    private var screen: NSScreen = NSScreen.screens.first ?? NSScreen.main!
    private var edge: Edge = .right
    private var yRatio: CGFloat = 0.5          // 0 = 可用区域底部，1 = 顶部
    private var expanded = false
    private var collapseWork: DispatchWorkItem?

    private var statusItem: NSStatusItem!
    private var showItem: NSMenuItem!
    private var fullScreenItem: NSMenuItem!

    func start() {
        defaults.register(defaults: ["showMarker": true, "hideInFullScreen": true])

        panel.contentView = view
        view.onHover = { [weak self] inside in self?.hover(inside) }
        view.onClick = { [weak self] in self?.handleClick() }
        view.onDragEnd = { [weak self] in self?.dragEnded() }

        buildStatusItem()
        applyCollectionBehavior()
        restorePlacement()
        refreshVisibility()

        NotificationCenter.default.addObserver(
            self, selector: #selector(screensChanged),
            name: NSApplication.didChangeScreenParametersNotification, object: nil)
        NSWorkspace.shared.notificationCenter.addObserver(
            self, selector: #selector(screensChanged),
            name: NSWorkspace.activeSpaceDidChangeNotification, object: nil)
        NSWorkspace.shared.notificationCenter.addObserver(
            self, selector: #selector(screensChanged),
            name: NSWorkspace.didActivateApplicationNotification, object: nil)
        Timer.scheduledTimer(withTimeInterval: 0.8, repeats: true) { [weak self] _ in
            self?.refreshVisibility()
        }.tolerance = 0.3
    }

    // MARK: 交互

    private func handleClick() {
        // 这里换成你的真实动作（打开主窗口 / 展开面板等）。
        // 注意：点击不会让本 App 变成前台，其它 App 的焦点保持不变。
        view.emoji = (view.emoji == "🐯") ? "🧘" : "🐯"
        print("marker clicked")
    }

    private func hover(_ inside: Bool) {
        guard !view.isDragging else { return }
        collapseWork?.cancel()
        if inside {
            setExpanded(true)
        } else {
            let work = DispatchWorkItem { [weak self] in self?.setExpanded(false) }
            collapseWork = work
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5, execute: work)  // 延迟收起，避免抖动
        }
    }

    private func setExpanded(_ value: Bool) {
        guard expanded != value else { return }
        expanded = value
        place(animated: true)
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
        place(animated: true)

        // 松手后鼠标若不在标记上，按正常逻辑稍后收起
        hover(targetFrame(expanded: true).contains(NSEvent.mouseLocation))
    }

    // MARK: 布局

    private func targetFrame(expanded: Bool) -> NSRect {
        let sf = screen.frame
        let vf = screen.visibleFrame               // 避开菜单栏 / Dock / 刘海
        let range = max(vf.height - panelSize.height, 0)
        let y = vf.minY + range * yRatio
        let visible = expanded ? panelSize.width : peekWidth
        let x = (edge == .right) ? sf.maxX - visible
                                 : sf.minX - (panelSize.width - visible)
        return NSRect(x: x, y: y, width: panelSize.width, height: panelSize.height)
    }

    private func place(animated: Bool) {
        view.edge = edge
        view.expanded = expanded
        let f = targetFrame(expanded: expanded)
        if animated {
            NSAnimationContext.runAnimationGroup { ctx in
                ctx.duration = 0.18
                ctx.timingFunction = CAMediaTimingFunction(name: .easeOut)
                panel.animator().setFrame(f, display: true)
            }
        } else {
            panel.setFrame(f, display: true)
        }
    }

    // MARK: 位置记忆（按屏幕 ID）

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

    @objc private func screensChanged() {
        restorePlacement()
    }

    // MARK: 显示 / 全屏行为

    private func applyCollectionBehavior() {
        // Hide-in-fullscreen must NOT keep canJoinAllSpaces — that token
        // follows the panel into other apps' fullscreen Spaces.
        var b: NSWindow.CollectionBehavior = [.stationary, .ignoresCycle]
        if defaults.bool(forKey: "hideInFullScreen") {
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
            if pid == selfPid { continue }
            guard let boundsDict = win[kCGWindowBounds as String] as? NSDictionary,
                  let bounds = CGRect(dictionaryRepresentation: boundsDict as CFDictionary) else { continue }
            if abs(bounds.width - screen.frame.width) < 4 && abs(bounds.height - screen.frame.height) < 4 {
                return true
            }
        }
        return false
    }

    private func refreshVisibility() {
        let wantShow = defaults.bool(forKey: "showMarker")
        let hideFS = defaults.bool(forKey: "hideInFullScreen")
        let hideNow = hideFS && (menuBarCollapsed(on: screen) || coveringWindow())
        if wantShow && !hideNow {
            panel.orderFrontRegardless()
        } else {
            panel.orderOut(nil)
        }
        showItem?.state = wantShow ? .on : .off
        fullScreenItem?.state = hideFS ? .on : .off
    }

    // MARK: 菜单栏兜底入口

    private func buildStatusItem() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        statusItem.button?.title = "🐯"

        let menu = NSMenu()
        showItem = NSMenuItem(title: "显示悬浮标记", action: #selector(toggleShow), keyEquivalent: "")
        fullScreenItem = NSMenuItem(title: "全屏时隐藏", action: #selector(toggleFullScreen), keyEquivalent: "")
        let reset = NSMenuItem(title: "重置位置", action: #selector(resetPosition), keyEquivalent: "")
        let quit = NSMenuItem(title: "退出", action: #selector(quitApp), keyEquivalent: "q")
        [showItem, fullScreenItem, reset, quit].forEach { item in
            item?.target = self
            menu.addItem(item!)
        }
        statusItem.menu = menu
    }

    @objc private func toggleShow() {
        defaults.set(!defaults.bool(forKey: "showMarker"), forKey: "showMarker")
        refreshVisibility()
    }

    @objc private func toggleFullScreen() {
        defaults.set(!defaults.bool(forKey: "hideInFullScreen"), forKey: "hideInFullScreen")
        applyCollectionBehavior()
        refreshVisibility()
    }

    @objc private func resetPosition() {
        screen = NSScreen.screens.first ?? screen
        edge = .right
        yRatio = 0.5
        savePlacement()
        place(animated: true)
    }

    @objc private func quitApp() {
        NSApp.terminate(nil)
    }
}

// MARK: - 入口

let app = NSApplication.shared
app.setActivationPolicy(.accessory)     // 无 Dock 图标；Xcode 工程中等价于 Info.plist 的 LSUIElement = YES
let controller = MarkerController()
controller.start()
app.run()
