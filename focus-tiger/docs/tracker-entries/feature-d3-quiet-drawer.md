# feature/d3-quiet-drawer

| D.3 Quiet Drawer 宽屏 ⋯ | UI可见 | 待人工测试 | **宽屏 ≥480**：点 ⋯ → `#ft-wide-more-menu` 宽 **≤380px**、靠右；四组变 **accordion**（默认展开 Practice）；组标题可点折叠/展开；行字重略轻。**窄屏**：`#ft-narrow-options-drawer` 不变（不搬宽屏侧栏样式）。**回流**：关 ⋯ 再开，Practice 仍默认展开。自动化：`WideIdleMoreMenu.test.js` 锁宽度 + accordion。 | — | — | — | `#ft-wide-more-menu` · `/?product=1` · Safari ≥480 | 2026-09-13 |
