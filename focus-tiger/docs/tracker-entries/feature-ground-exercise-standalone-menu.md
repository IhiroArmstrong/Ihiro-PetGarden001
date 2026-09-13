# feature/ground-exercise-standalone-menu

| Ground exercise 独立菜单 | UI可见 | 待人工测试 | **主路径**：Idle → 「更多」/ 窄屏抽屉 → **接地练习**（在 Five Moments 上方）→ 选择层出现 **感受地面** / **环顾四周** 两按钮（0–1s 内可见）→ 点 **感受地面** → 四段引导半高卡；点 **环顾四周** → 5-4-3-2-1 分步。**对照**：被动 Re-focus 后 **不再** 出现 emoji 条（`recover-reset-offer` 已删）。**保护面**：Re-focus toast + nod-bow 仍正常；Take a Breath / MicroRitual 入口不变；主动 Tiger Anchor Recover 不接本练习。e2e：`e2e/ground-exercise-menu.spec.js`。Brief：`task-ground-exercise-standalone-menu.md`。 | — | — | — | `GroundExerciseChoiceUI.js` · `RecoverResetPracticeUI.js` · `idleChromeOrchestration.js` | 2026-09-13 |
