# docs/t100-output-gate-redteam-r3-record

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| T100 第 3 轮红队记录 + 通读附录 | 纯文档 | 仅单元测试覆盖 | 本条验收报告口径与附录生成器，**不是**闸已被验证。母记录含分臂判定分布、9 条候选、闸树 `7c0f3e7d`、封存题集 sha256。通读附录为全部 `pass` 哈希去重（595 句）。灰色裁定在 `borderline-judging` 须 PO locked 后再计 K。`node desktop/scripts/l0-output-gate-redteam-report.js` 可复现。不测界面。 | — | — | — | `focus-tiger/docs/audit/findings/2026-11-18/t100-output-gate-layer-b-redteam-round-3.md` | 2026-11-18 |