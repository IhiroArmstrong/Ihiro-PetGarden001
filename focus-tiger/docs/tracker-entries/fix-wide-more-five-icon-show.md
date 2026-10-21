# fix/wide-more-five-icon-show

| T25 宽屏 ⋯ 先出五组图标 | UI/交互 | 待人工测试 | **本条验收的是 T25 退化判定**：宽 ≥480 且高 ≥520 点底栏 `#ft-wide-more-btn` → **0–1s** 见 `#ft-wide-more-radial` 五个组图标，即使 `#sprite-stage` 很大。**不得**直接出手风琴整表。五图标不得挡住 Sit 主球（Electron 默认窗、约 1280×800、1440×900）。矮窗高 &lt;520 仍直接列表。不测指南针三叶、不测窄屏抽屉改版。单测：`wideMenuRadialLayout.test.js`（有大 sprite-stage 不得退化）。 | — | — | — | `?product=1` 宽屏 Idle · Brief `task-wide-more-five-icon-show.md` | 2026-10-21 |
