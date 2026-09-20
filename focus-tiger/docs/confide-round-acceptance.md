# Confide 本轮肉测验收冻表（100 句 · 终止条件）

> **状态（2026-09-19）**：冻表 + 单测锁路由；**过关本表 100/100 = 本轮 Confide regex / 安全 / 事实桶肉测终止**，可先上线；**不等于** L3 答句质量关单，**不等于** Stage 2 语义向量真路由切换。  
> **代码真源**：`src/core/confide/confideRoundAcceptanceFixtures.js`（**100 句** = 元问题 32 + 攻击边界 30 + 补充 38）。  
> **背景**：「想到新说法 → 发现漏洞 → 修规则」无自然终点；参照六语 108 句闲聊冻表，为本轮 Confide 设硬终止条件。

## 三表组成

| 子表 | 句数 | 文档 | 单测 | Electron 核对字段 |
|---|---:|---|---|---|
| 元问题 / Hybrid | 32 | `confide-meta-query-acceptance.md` | `confideMetaQueryAcceptanceFixtures.test.js` | `data-source` · 是否 `read_hybrid_classify` |
| 攻击 / 安全边界 | 30 | `confide-aggression-acceptance.md` | `confideAggressionAcceptanceFixtures.test.js` | `data-route` · 禁 Heard/点头/generate |
| 补充（情绪桶 · 1B 事实 · L3 §4.2 · 锚点） | 38 | 本文 §补充桶 | `confideRoundAcceptanceFixtures.test.js` | `data-route` / `data-source` / generate 门闩 |

**过关线**：按 `id` 字母序逐句发送 · **100/100** · **禁止**即兴加句（新漏洞 → 新 issue / 冻表 `v2`）。

## 补充 38 句 · 桶定义

| 桶 / 断言 | 句数 | 通过标准（Electron 宽屏 · Confide ready · memory Allow） |
|---|---:|---|
| `classify_route` 情绪语料 + 负例 | 13 | `data-route` = `tired` / `anxious` / `stuck` / `sad` / `scattered` · `data-source=corpus` · **禁止** generate |
| `desktop_source` 练习事实 | 8 | `data-source=practice_facts`（含锚点 **累积了多久** · **我累计练习多久了**） |
| `desktop_source` 在场趋势 | 3 | `data-source=presence_facts` |
| `desktop_source` 陪伴在场 | 2 | `data-source=companion_presence` |
| `desktop_source` 边界 / 抑制 | 2 | `boundary` · `memory_suppress` |
| `desktop_source` 诚实反思 | 2 | `reflective_honesty`（含锚点 **忙啥** · **忙什么**） |
| `desktop_source` 闲聊问候 | 1 | `companion_greeting` |
| `generate_eligible` L3 §4.2 | 7 | `data-source=generate`（宽屏 ready）· 对照：情绪桶仍 corpus |
| 负例 | 1 | `I'm just tired of everything.` → `tired`，**不得** `boundary` |

## 人工验收协议

1. **壳**：`origin/develop` tip · Electron 宽屏 · `npm run desktop:dev`（或 `?product=1&confide=1`）。
2. **顺序**：`CONFIDE_ROUND_ACCEPTANCE_FIXTURES` 按 `id` 字母序；可分段（先 32 元问题 → 30 攻击 → 38 补充），但关单须 **100/100**。
3. **记录**：每句记 `data-route`、`data-source`、秒表；元问题句另记是否出现 `read_hybrid_classify`。
4. **自动化（必跑 · 取代逐句 Electron 点按）**：`npm run test:confide-acceptance` → 默认 **100/100**；`--suites=meta,aggression` → **62/62**。真源：`confideAcceptanceEvaluate.js` + `scripts/run-confide-acceptance.js`；已接入 `npm run test:smoke` / CI。
5. **人工（一次性 · 与句数无关）**：竖线颜色、点击耗时——各抽 1–2 句肉眼确认即可。
6. **子表单测**：`confideMetaQueryAcceptanceFixtures.test.js` · `confideAggressionAcceptanceFixtures.test.js` 仍可分段调试。

## 与 Stage 2 语义影子分流的关系

| 问题 | 建议 |
|---|---|
| Electron 聊 **100 句**够决定 Stage 2 切真路由吗？ | **不够。** 本表 100 句只锁 **regex 肉测终止**。Stage 2 另走两条自动化，**不与真实聊句数绑死**。 |
| Stage 2 拍板看什么？ | **离线（Prompt 7）**：`npm run test:confide-semantic-acceptance` → A/B 库各 50 + 3 锚点全绿（实验室/夜间 · 真 GGUF · **不进** `test:smoke`）。**真实日志（Prompt 8）**：`npm run audit:confide-semantic-shadow` 报 N、D、D÷N 并导出分歧 CSV；**不设 N 硬下限**。人工标「有利分歧」建议 ≥30 后 **PO 拍板**。脚本与 Agent **不得**写「够不够切 Stage 2」。 |
| 有利分歧不够 30 怎么办？ | 继续后台攒影子日志。80 条里够 30、或 500 条才够 30，都可以；分歧本应是少数（约 5–15%），不是健康系统的多数事件。 |
| 还要肉测吗？ | **regex 关单** = 本表 100/100；**语义离线** = Prompt 7 命令；**影子评估** = Prompt 8 导出 + 人工标注。三条线并行、门槛不同。 |
| 影子锚点句 | 本表已含 **累积了多久** · **忙啥** · **忙什么** · **我累计练习多久了**。Prompt 7 对前三句单独标红；发过后也可查 `semantic_shadow_classify` 是否写入且 `text` 可读。 |

## 2026-09-19 补丁（同轮）

| 句 | 修前 | 修后 |
|---|---|---|
| `累积了多久` / `我累计练习多久了` | `累` 子串 → `tired` 语料 | `practice_facts`（classify 先过练习事实） |
| `忙啥` / `忙什么`（裸句） | fallback → generate | `reflective_honesty` |

**未改**（须 PO 另议）：`我最近在忙什么` 有记忆时是否列列表（#822）；L3 风景/幼虎/Journey 口径仍走 ISSUE_LEDGER 扇出。**本表 100 句不锁套话质量**：观察翼陈词滥调下一刀见 `task-l3-observe-cliche-semantic-guard.md`，不必为耳/尾/爪改写重跑冻表。
