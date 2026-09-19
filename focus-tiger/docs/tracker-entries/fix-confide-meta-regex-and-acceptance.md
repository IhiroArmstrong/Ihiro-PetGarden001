# fix-confide-meta-regex-and-acceptance

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 本轮肉测验收冻表（100 句） | UI可见 | 待人工测试 | **功能回归（必跑）**：`npm run test:confide-acceptance` → **100/100**（CI 已接入 `test:smoke`）。**62 句子集**：`--suites=meta,aggression`。**人工（一次性）**：竖线颜色 · 点击手感 — 各 1–2 句，不必 100 句全点。SSOT：`docs/confide-round-acceptance.md` | **2026-09-19 用户书面**：62/100 句冻表须终端批量自动化，取代逐句 Electron 点按 | — | — | `fix/confide-meta-regex-and-acceptance` | 2026-09-19 |
