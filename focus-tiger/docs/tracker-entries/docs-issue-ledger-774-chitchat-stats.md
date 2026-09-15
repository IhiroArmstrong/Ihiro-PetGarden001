# docs/issue-ledger-774-chitchat-stats

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| #774 日语 Confide：同一会话 5 句连发（验证去重回落） | UI可见 | 待人工测试 | **Electron 日语 · Confide ready · 同一面板不关。** 5 句各连发 ≥2 次（建议 3）：①小可耐喜欢吃胖粉吗？ ②小姐姐喜欢吃啥？ ③我今天不太想静坐练习。 ④I only have ten minutes… ⑤Today was a mess…。每句记：第 1 次是否 generate 跑题；第 2+ 次是否改语料（含 fallback-02）。**不要**中途关面板。对照实验室空会话 15/15 同句。 | — | — | 本回合只更新 ISSUE_LEDGER/Brief；连发须你测完再决定规则桶 | `npm run desktop:dev` · `#confide-to-yin-reply` | 2026-09-16 |
