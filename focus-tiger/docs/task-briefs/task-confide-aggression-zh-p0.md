# Task Brief · P0 中文「攻击他人」规则（EN 桶 fast-follow）

> **状态（2026-09-18）**：Brief 已开 · **未开工代码**。工单 [#847](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/847)。须另口令「开工 P0 中文 aggression」。  
> **并行线**：Read Hybrid 补漏率审计 `docs/read-hybrid-gapfill-rate-audit.md`（**禁止**与本 Brief 混 PR 改 send / Hybrid / E′）。  
> **父 Brief**：`task-confide-aggression-toward-others.md`（#566 已合；当时拍板本轮仅 EN）。  
> **账本**：`ISSUE_LEDGER.md`「I want to beat people」行 · 2026-09-18 肉测 `我想打人` → L3。

---

## 一、问题

英文 `I want to beat people` 已进 `aggression_toward_others`（禁 Heard / 点头 / generate）。  
中文 **字面攻击他人** 仍走 `confideClassify` → `fallback`，宽屏可进观察翼 / L3（肉测「胸腔低沉咆哮」）。

单测**故意锁住**这个洞：

- `confideClassify('想打人') === fallback`
- `matchesAggressionTowardOthers('想打人') === false`

自伤中文已在 `SAFETY_PHRASES_ZH`；攻击他人中文 **不对称**。

## 二、范围

### 2.1 做

- 在 `confideAggressionKeywords.js` 用与 safety **同型**的中文 `includes` 短语表（不要套英文 `\b` 词界）。
- `confideClassify` 层序不变：`safety_redirect` → `aggression_toward_others` → 情绪桶 → fallback。
- 翻掉「EN-only this round」单测；改为锁中文正例 + 排除项。
- `SCENARIO_TESTS.md` 他人攻击 3b **加一条中文锚点**（与英文同路由、同禁 generate / 同 Idle）。
- 语料：沿用已有 aggression 池 zh 行；本轮 **不**扩写新金句、不改动画契约。

### 2.2 不做

- 不改 `_onSend`、Read Hybrid、`classifyReadTool`、gloss。
- **禁止** Gate 0.D E′ / 7-way 进 send。
- 不改 `safety_redirect` 中文表。
- 不把日语攻击短语塞进本 PR（JA 另 follow）。
- 不把「打游戏 / 打卡 / 打坐 / 打球 / 打电话」升格为攻击。
- 不把「想伤害自己 / 自残」从 safety 抢走。

## 三、短语表（实现时人审可删减，不可默扩）

**正例（须命中 aggression）**

| 短语 | 来源 |
|---|---|
| `想打人` / `我想打人` | 肉测锚点 |
| `想揍人` / `我想揍人` | 同义 |
| `想打他` / `想打她` / `想打他们` / `想打别人` | 指向他人 |
| `想伤害他` / `想伤害她` / `想伤害别人` | 伤害意象；「想伤害自己」除外 |

**排除（须 false）**

| 短语 | 原因 |
|---|---|
| `打游戏` `打卡` `打坐` `打球` `打电话` `打字` | 无攻击对象 |
| `想伤害自己` `自残` `自杀` | safety 优先 |
| 英文旧正例 / 旧排除 | 回归锁，不得回退 |

繁体可加：`想打人` 已覆盖；`想傷害他` / `想傷害別人` 与简体并列（safety 亦简繁双收）。

## 四、验收

1. `想打人` / `我想打人` → `aggression_toward_others`；**0–1 秒** corpus 池；禁止 Heard / 点头 oneshot / L3。  
2. `I want to beat people` 仍 aggression（EN 不回退）。  
3. `不想活` 仍 `safety_redirect`。  
4. `打游戏` 仍非 aggression。  
5. 冲突扫描：场景 3b 强度/语气不变，只补中文入口；职责仍在安全层，不进 Hybrid。

## 五、冲突扫描（Brief 预检）

| 轴 | 相邻 | 结论 |
|---|---|---|
| 强度 | `SCENARIO_TESTS` 3b 他人攻击 vs safety 自伤 | 中文攻击仍低于危机转介，与英文 3b 同级 |
| 语气 | aggression 池禁 Heard / 说教 | 不改金句 |
| 职责 | Hybrid 读工具 / L3 观察 / E′ | **不重叠**；本 Brief 只扩 classify 规则表 |

无未拍板冲突。实现仍须口令开工。

## 六、我认为最合理的实现切面

只改 `confideAggressionKeywords.js` + 对应单测 + `SCENARIO_TESTS` 3b 一句中文。**不要**在 `_onSend` 加中文 if。
