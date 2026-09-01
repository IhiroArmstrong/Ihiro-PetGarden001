# fix/confide-eprime-rule-prescreen

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 访问路径 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Confide E′ 规则预筛（软边界 / 陪伴字面 / 窄 OTHER） | UI / 路由 | 待人工测试 | **Electron 宽屏 Confide**（`desktop:dev` · L2 ready）。Share 后 **0–1 秒内**见 reply `data-source`。① `I'd rather not get into that.` / `I don't think I'm up for that conversation.` → `boundary`，禁止 curious。② `Can you just sit next to me while I feel this?` / `Can we just breathe together for a bit?` → `companion_presence`，禁止 BEGIN 声线。③ `Have I been showing up consistently?` → `practice_facts`。④ `Can you tell me my mood trend from this week?` → `presence_facts`。⑤ **负例** `I'm just tired of everything.` 不得 boundary；`I don't need you to say anything.` 无关键词，允许 L3。回流：关卡再开后①②仍同 source。不测 diagnostic 探针。 | — | — | — | Electron Confide · 场景 AE L2 步 7–9 | 2026-09-01 |
