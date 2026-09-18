# feature-mutation-three-state-slice-3 · 2026-09-18

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 修复分支 | 日期 |
|---|---|---|---|---|---|---|---|---|
| 状态变更三态可见性 Slice 3（点击 mutation 超时中间件 + M-01） | 纯后端 + 部分 UI 失败句 | 待人工测试 | **自动化已锁**：`cloudApiClient.test.js` 超时 408；`focusCircleMembership.test.js` leave 超时保留本地；witness/was-here 408→timeout；`mutationThreeStateSlice3.regression.test.js`（提醒成功 token **且** Circle 超时失败映射）；`mutation-m01-check.js` 进 `docs:check`。**人工测（feature 自检，非正式关单）**：Privacy Focus Circle Start a circle 卡住约 12s 须失败句；Leave 失败须仍显示已入圈；Witness 选句卡住约 12s 须错误句且 picker 还在。Support 请茶/栖居：点 CTA 须先见到详情卡，不得先黑屏再等。**明确未做**：O-04 全表补 UI；Ritual Leave 不改白名单；#838 人工关单；不解冻 Z-dim。 | — | — | — | `mutationFeedback` · M-01 · #839 | 2026-09-18 |
