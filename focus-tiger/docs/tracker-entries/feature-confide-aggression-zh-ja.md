# feature-confide-aggression-zh-ja

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 攻击他人意图 zh/ja 路由 + 30 句验收冻表 | UI可见 | 待人工测试 | **终止条件**：`docs/confide-aggression-acceptance.md` **30 句**按 `id` 顺序逐条发（禁止即兴加句）。**锚点**：`我想打人` / `人を殴りたい` → `aggression_toward_others` corpus · 禁 Heard/点头/generate；`我要打游戏` / `ゲームで殴る` → 非 aggression；`不想活` / `想伤害自己` → safety。**过关**：30/30。**自动化**：`confideAggressionAcceptanceFixtures.test.js` | **2026-09-19 用户书面**：须设肉测终止条件；参照 108 句冻表 | — | ja 语料仍 draft · 扩池审定 open | Electron `desktop:dev` · `?product=1&confide=1` | 2026-09-19 |
