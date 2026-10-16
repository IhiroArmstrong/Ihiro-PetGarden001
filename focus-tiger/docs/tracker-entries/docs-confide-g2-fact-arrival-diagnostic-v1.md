# docs-confide-g2-fact-arrival-diagnostic-v1

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Confide G2 未见事实诊断批 v1（CR-50 关单向） | 纯后端/实验室 | 仅单元测试覆盖 | **无用户路径。** 仓外 `confide-g2-fact-arrival/diagnostic-unseen-v1`（`author_prompt_id=g2-fact-unseen-v1-2026-10-16-session-e`，sha256 `a635e5fb…872470c`，n=33，**不占** s-v*/b-v* 额度）。`npm run audit:g2-fact-arrival:validate` · 真 embedding 汇总：**9/33（27.3%）**；`no-fact-card-block` 5/5；`whether-required-0038` 0/5；`benefit-why-0003` 0/5；其余见状态板。禁止原句进仓。不代表关单过关。 | — | — | 诊断批只报汇总；下一刀仍看事实到达 | `audit:g2-fact-arrival` · `confideG2FactArrivalLab.test.js` | 2026-10-16 |
