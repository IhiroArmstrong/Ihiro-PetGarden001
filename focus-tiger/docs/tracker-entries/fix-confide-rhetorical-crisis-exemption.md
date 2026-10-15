# fix/confide-rhetorical-crisis-exemption

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 修辞性「死」不进转介 | UI可见 | 待人工测试 | **仅 Electron 宽屏 · embedding 已 ready。** **改动**：语义危机命中后确认自指 vs 修辞/亲昵；修辞不转介、无棕色竖线；拿不准仍转介。不降 0.78。**主路径（英文优先）**：dying to / killing me 一类不得 `safety_redirect`。明确撑不住英文 → `data-route=safety_redirect` · 文案 safety-01 · 竖线 #7a5340 · 不朗读。**中文对照**：想死你了不得转介；我不想活了仍转介。**回流**：关卡再开后再发。自动化：confideRhetoricalCrisisConfirm.test.js · confideSemanticCrisisLayer.test.js。封存未见句另会话。 | 2026-10-15 用户书面：想死你了误进转介金句。明确危机竖线本场未测。 | — | — | Electron 宽屏 Confide | 2026-10-15 |
