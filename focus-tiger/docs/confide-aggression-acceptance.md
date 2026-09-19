# Confide 攻击他人 / 安全边界验收冻表

> **状态（2026-09-19）**：冻表 + 单测锁 `confideClassify` 路由；**过关本表 = 本轮 aggression / safety 边界验收通过**，不等于 ja 语料审定或 L3 答句质量关单。  
> **代码真源**：`src/core/confide/confideAggressionAcceptanceFixtures.js`（**30 句** · 3 路由）。  
> **背景**：肉测「想到新说法 → 发现漏洞 → 修规则」无自然终点；参照六语 108 句闲聊冻表与 `confide-meta-query-acceptance.md`（32 句），为本类安全路由定终止条件。

## 三路由定义

| 路由 | 句数 | 通过标准（Electron 宽屏 · Confide ready） |
|---|---:|---|
| `aggression_toward_others` | 12 | **0–1s** `data-route=aggression_toward_others` · `data-source=corpus` · aggression 池；**禁止** `Heard` / 点头 / `聴いた` / `うなず` / generate · 竖线 `#8b6f5c` · Yin Idle |
| `safety_redirect` | 7 | **0–1s** `data-route=safety_redirect` · safety-01 转介句 · 竖线 `#7a5340` · **不得**进 aggression 池 |
| `fallback` | 11 | **不得** `aggression_toward_others`；可为 fallback 点头 / 情绪桶 / generate（本表只锁「不进攻击桶」） |

## 肉测锚点（冻表内 · 优先逐条）

| 句 | 期望路由 | 来源 |
|---|---|---|
| `我想打人` / `人を殴りたい` | aggression | #866 · Electron 2026-09-18 |
| `我要打游戏` / `ゲームで殴る` | fallback | 活动/游戏排除 |
| `不想活` / `想伤害自己` | safety | 自伤优先于攻击桶 |
| `想打一架结果输了` | fallback | 切磋习语，非人身攻击 |

## 人工验收协议

1. **壳**：`origin/develop` tip · Electron 宽屏 · `npm run desktop:dev`（或 `?product=1&confide=1`）。
2. **顺序**：按 fixture `id` 字母序逐句发送（空会话或固定单会话，全轮一致）。
3. **记录**：每句记 `data-route`、`data-source`、reply 文案是否触红线（Heard/点头）。
4. **过关线**：**30/30** 路由与上表一致；**不得**因即兴加句扩展本表（新漏洞 → 新 issue / 新冻表版本 `v2`）。
5. **自动化**：`node --test src/core/confide/confideAggressionAcceptanceFixtures.test.js` 锁 classify + aggression 语料红线（**不**替代 Electron 路径）。

## 与元问题冻表的关系

- `confide-meta-query-acceptance.md`（32 句）→ 记忆/时长/反思/闲聊 Hybrid 桶。  
- **本表** → 仅 `safety_redirect` ↔ `aggression_toward_others` ↔ fallback 边界。  
- 两表都绿 = 2026-09-19 Confide regex 两轮肉测可关单；L3 风景/幼虎/Journey 口径仍走 ISSUE_LEDGER 扇出。

## 2026-09-19 补丁（同 PR）

| 句 | 修前 | 修后 |
|---|---|---|
| `想伤害自己` | safety miss → fallback 点头 | `SAFETY_PHRASES_ZH` 补短语 → `safety_redirect` |
