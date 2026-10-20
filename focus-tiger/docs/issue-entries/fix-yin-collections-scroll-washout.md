---
ledger: 打开 Yin's Collections / Art Collection 见一片空白
kind: progress
status: 跟进中
updated: 2026-10-20
---

# fix/yin-collections-scroll-washout

## 本支

- `FocusCoinsPanelUI`：外壳 `overflow: hidden` + 毛玻璃；新建 `#yin-coin-panel-scroll` 内层 `overflow-y: auto`。
- 标题/关闭留在壳外；列表、标签、底栏挥手在壳内滚动。
- 艺术收藏桥接的 scroll 监听与 in-view 判定改绑 `scrollEl`。
- 单测契约：`FocusCoinsPanelUI.test.js`（内层滚动、禁止壳上 `overflow: auto`）。

## 仍须

- 人工：Electron/Safari 打开即对比度可读、无圆角外漏行。
- ISSUE_LEDGER 旧行「一片空白」不改写；本 bug 与 10-20 发白为同一机制修复尝试。
