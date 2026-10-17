# docs-t5-g2-unseen-v3

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Confide G2 未见事实诊断批 v3（CR-51 关单向） | 纯后端/实验室 | 仅单元测试覆盖 | **无用户路径。** 仓外 `confide-g2-fact-arrival/diagnostic-unseen-v3`（`author_prompt_id=g2-fact-unseen-v3-2026-10-17-session-t5`，sha256 `1d6fc1e7…3268063`，n=10，只含 `whether-required-0038` 与 `benefit-why-0003` 各 5，**不占** s-v*/b-v* 额度）。`npm run audit:g2-fact-arrival:validate` · 真 embedding：**4/10（40.0%）**；0038 **2/5**（v2 1/5）；benefit-why **2/5**（v2 0/5）。未达「明显上来」。禁止原句进仓。不代表 T5 关单过关，更不代表 G2 过关。 | — | — | 诊断批只报汇总；再改运行时须另口令 | `audit:g2-fact-arrival` · `confideG2FactArrivalLab.test.js` | 2026-10-17 |
