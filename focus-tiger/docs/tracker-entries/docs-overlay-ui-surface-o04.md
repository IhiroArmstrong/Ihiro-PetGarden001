# docs-overlay-ui-surface-o04

| 功能 | 类型（UI可见 / 纯后端） | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| O-04 叠层完整契约面（检查脚本 + §6.23） | 纯后端 | 仅单元测试覆盖 | **自动化已锁**：`overlay-contract-ui-check.js` 七列（登记 / slot 接线或 derive / body z 底线 / O-02 / 失败反馈 token 或 grandfather gap / e2eOverlap 声明 / TRACKER token）；`overlayUiSurfaceContract.test.js` 行集合。**提醒遮挡 e2e**（须 CI / `test:e2e:changed -- e2e/in-app-reminder.spec.js`）：hint 气泡上仍能保存；冷启动吹花气泡仍开得了提醒面板。**人工未测**：无用户路径观感。**明确未做**：z-index 常量化全表扫描（Z-dim）。 | — | — | — | `overlayUiSurfaceContract.js` · `DOC_CODE_CONTRACT` O-04 | 2026-09-16 |
| 留痕迹选句 · 本周人工关回归窗 | UI可见 | 待人工测试 | **自动化已锁**：契约单测（picker 占 Tier27 / 失败红字 token / body z35）；**无**遮挡共存 e2e。**须你本周人工（develop QA 5173 · 已入圈）**：Emotional Reset 或 Sit **≥60s** → Rise → ~3s 玻璃底条 → Leave a trace → 玻璃选句（首/中/尾均可点）→ 成功关条 **或** 提交失败见红字；Cancel 回底条。对照：开着 hint / 窄屏 ActionBar 时 picker 仍可点。**明确未测**：自定义痕迹、2e 昵称。禁止用「待人工测试」四字代替本段。 | **2026-09-11 已合 develop**；合入后至本周若无人走完选句+失败红字，与提醒假修窗口同构。 | — | 本周内人工走场景 AP | `FocusCircleWitnessLeaveUI.js` · 场景 AP | 2026-09-16 |
