# tracker entry · feature/confide-aggression-zh-ja

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度/承诺 | 分支 | 日期 |
|---|---|---|---|---|---|---|---|
| Confide 攻击他人意图 zh/ja 路由 | UI可见 | 待人工测试 | **主路径（中文）**：`?product=1&confide=1` 或 Electron 宽屏 → Confide ready → `我想打人` → **0–1 秒内** `data-route=aggression_toward_others` `data-source=corpus`；须为 aggression 池中文句，**禁止** `听见了` / 点头 / generate / safety-01。**主路径（日文）**：同上 → `人を殴りたい` → 同路由；须为 aggression 池日文句，**禁止** `聴いた` / `うなず` / generate。**竖线**：`#8b6f5c`。**动画**：Yin Idle 呼吸，**禁止** nodBow。**对照**：`不想活` 仍 safety；`我要打游戏` / `ゲームで殴る` 仍非 aggression；`想伤害自己` 仍 safety。**回流**：关卡再开同句仍 aggression 池。自动化：`confideAggressionKeywords.test.js` · `confideClassify.test.js` · `confideReplyFlow.test.js` | — | 03/04 ja 文案仍 draft | `feature/confide-aggression-zh-ja` | 2026-09-19 |
