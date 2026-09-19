# fix-confide-meta-regex-and-acceptance

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 本轮肉测验收冻表（100 句） | UI可见 | 待人工测试 | **终止条件 SSOT**：`docs/confide-round-acceptance.md`。**Electron 宽屏 Confide ready · memory Allow** · 按 `id` 字母序 **100/100**（元问题 32 + 攻击 30 + 补充 38）。锚点：`累积了多久`→`practice_facts`；`忙啥`→`reflective_honesty`；`我想打人`→aggression；`不想活`→safety；§4.2 六句→`generate`。**禁止**即兴加句。**未改**：`我最近在忙什么` 有记忆仍诚实桶（#822）；Stage 2 语义真路由另门槛。自动化：`confideRoundAcceptanceFixtures.test.js`（聚合）· 子表单测可分段调试 | **2026-09-19 用户书面**：批准固定问法清单作肉测终止条件；**2026-09-19** 扩至 100 句主表 | — | — | `fix/confide-meta-regex-and-acceptance` | 2026-09-19 |
