# fix-confide-meta-regex-and-acceptance

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 元问题 regex 补洞 + 32/30 句验收冻表 | UI可见 | 待人工测试 | **Electron 宽屏 Confide ready · memory Allow。** **元问题 32 句**：按 `docs/confide-meta-query-acceptance.md` 冻表逐条核对 `data-source`。**攻击边界 30 句**：按 `docs/confide-aggression-acceptance.md` 冻表逐条核对 `data-route`（锚点：`我想打人` / `人を殴りたい` / `我要打游戏` / `ゲームで殴る` / `不想活`）。**过关线**：两表各 32/30 全绿 = 本轮 regex 肉测终止；**禁止**即兴加句扩展。**未改**：`我最近在忙什么` 有记忆仍诚实桶（#822）。自动化：`confideMetaQueryAcceptanceFixtures.test.js` · `confideAggressionAcceptanceFixtures.test.js` | **2026-09-19 用户书面**：批准固定问法清单作肉测终止条件（元问题 + aggression 各一表） | — | — | `fix/confide-meta-regex-and-acceptance` | 2026-09-19 |
