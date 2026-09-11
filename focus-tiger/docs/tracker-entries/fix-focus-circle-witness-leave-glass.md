# fix/focus-circle-witness-leave-glass

| Focus Circle Witness Leave · 玻璃换肤 + 选句点击修复 | UI可见 | 待人工测试 | **前置**：已入圈 + Worker witness actions 已部署。**主路径**：Emotional Reset ≥60s → Rise → ~3s 底条（奶油玻璃 + 金色 CTA）→ Leave a trace → 选句面板（玻璃行列表，非深色块）→ 任一条 **0–1s** disabled → 成功关条或失败见红字提示。**回流**：Cancel 回底条；Skip 关条；再开一场仍只提示一次。**对照**：375 窄屏中间项可点；与摸头区重叠时 picker 仍可点。**不测**：自定义痕迹、方案 B 胶囊布局。 | **2026-09-11 用户书面**：深色 picker 与主屏不搭；选句项点击无反应。根因：leave picker 未占 Tier27 → `#idle-yin-tap-anchor` 抢点；提交失败无反馈。 | — | — | `FocusCircleWitnessLeaveUI.js` · `glassPanelStyles.js` | 2026-09-11 |
