# Floating marker demo（对照用）

阶段 1 单文件 Demo。**产品运行时不 spawn 本目录**；Electron 走上级 `floating-marker.swift`。

目录名用 kebab-case（仓库路径规则）。对照你本机 `Downloads/main.swift`。

本副本已修「勾上全屏时隐藏仍可见」：隐藏时去掉 `canJoinAllSpaces` / `fullScreenAuxiliary`，并在菜单栏收起或其它窗口铺满屏时 `orderOut`。

```bash
swiftc -framework AppKit -framework QuartzCore main.swift -o FloatingMarker && ./FloatingMarker
```
