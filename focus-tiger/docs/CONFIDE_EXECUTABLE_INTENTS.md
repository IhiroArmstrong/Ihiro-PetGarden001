# Confide 可执行意图白名单（V1）

**状态（2026-08-26）**：产品方向锁 · 与 `YIN_PERSONAL_MEMORY.md` · `presenceSignalsGate.js` · `desktopCompanionL2Route.js` 四层门闩一致。  
**规划 SSOT**：`LOCAL_AI_SCENARIOS_V1.md`。  
**Operating 长期边界**：`LOCAL_AI_OPERATING_LAYER.md`（只设计；Confide **禁止**执行 Operating Tools）。  
**工程 SSOT**：`confideExecutableTools.js`（CI → Tool Registry；生产仍正则匹配）。  
**不是**开放域 Agent；**不是**「用户说什么都能自动执行」；**不是** Auto-Operating 入口。

---

## 原则

1. **仅系统已有权威数据 + 产品明确允许的动作** 才可进入本白名单。  
2. **执行路径在层 3 之前**：规则识别 → 确定性 handler → 模板/系统字段回复；**禁止** Qwen 编造数字、假装删库、假装备份。  
3. **优先级不变**：Safety → 情绪桶语料 → **本表白名单** → L3 短生成（仅接不住的闲聊）。  
4. **新意图**须 Brief + 冲突扫描；**禁止**为每句用户话无限加 slice。

---

## V1 白名单

| ID | Tool id | 用户意图（示例） | 数据 / 动作 | 风险 | 入口 | 实现 |
|---|---|---|---|---|---|---|
| **CI-00** | `query_practice_duration` | 「练了多久？」/ How long have I practiced? | 读 `PracticeDaysStore`（与 Journey Log 同源） | read | Confide · `fallback` 前 | `confidePracticeFacts.js` · `practice_facts` |
| **CI-01** | `forget_memory_entry` | 「别再记周一的事了」/ Please forget what I said about Monday | 真删 `yin-personal-memory.json` 单条（同 1c IPC） | local_reversible | Confide · `fallback` + Consent granted | `yinPersonalMemoryVerbalForget.js` · `memory_forget` |

> **PO · 2026-08-31**：CI-01 / `memory_suppress` **意图对了、指代解析不到**时，保留诚实短句（`YIN_MEMORY_SUPPRESS_NO_MATCH`），**禁止猜删**。`turns.jsonl` ≠ Yin Personal Memory。口头「昨天那件事」解析是 entity 缺口，另口令，不在本表白名单扩成对话全量可删。
| **CI-02** | `query_presence_trend` | 「最近两周我的情绪看起来怎样？」/ What has my mood looked like over the last two weeks? | 读 `focus-tiger.presence-signals.v1`（封闭标签；14 日；≥3 条描述性 breakdown） | read | Confide · `fallback` 前 | `confidePresenceFacts.js` · `presence_facts` |

> **PO · 2026-08-28**：**正式示例**改用描述性问法。**不再推广**「Has my mood improved? / 改善了吗」（可作路由 alias）。答句禁止诊断与人格进步评判（**你更稳了 / 你进步了**）。  
> **PO · 2026-08-28 晚**：**Bounded Temporal Compare** — 对照型问句（比以前久 / 稳不稳 / 进状态）可路由；答句须**两段时期并列事实**，见 `LOCAL_AI_SCENARIO_EXPANSION_PO_DECISION.md` Amendment。

**面板 Forget（1c）** 不在此表重复登记：同一 `forget` IPC，入口为 UI 行按钮，非口头意图。

---

## 明确不在白名单（V1 禁止口头自动执行）

| 用户可能说 | 为何不做 | 合理行为 |
|---|---|---|
| 帮我备份练习记录 | 备份属 Operating Layer（`LOCAL_AI_OPERATING_LAYER.md`）；现网走 Journey / 练习云备份链 | 诚实说明入口，或 L3 不接「已备份」幻觉 |
| 忘掉你记得的一切 | bulk wipe 风险高 | 引导「What Yin remembers」逐条 Forget（1e 负例） |
| 喜欢吃什么 / 任意 Preference | 本机无该事实字段 | 不记、不编（架构 § 延后） |
| Don't save this / 别记这句 | **Slice 1f · pipeline** · `memory_suppress` · **非 CI** | 见 `YIN_PERSONAL_MEMORY_PERSISTENCE_POLICY.md` · `forget this` → suppress · 非 CI-01 |
| Delete today's Journey entry | V2 **Future Candidate** · Phase 1 **NOT MVP** | 指向 Journey Log UI；Phase 2 另 Brief |

---

## 与 Personal Memory 切片关系

| 切片 | 能力 | 是否口头可执行 |
|---|---|---|
| 1a Consent | 能不能记 | 否（一次性 UI） |
| 1b Remember | 静默记下 | 否（L3 后管道） |
| 1c 列表 + 面板 Forget | 看 / 点删 | 面板，非口头表项 |
| 1d Use | L3 注入回指 | 否（被动） |
| 1e 口头 Forget | 对话删一条 | **是（CI-01）** |

---

## 新增意图准入（未来）

须同时满足：

1. 系统有 **可审计** 的本地真数据或 **不可逆风险可控** 的写操作定义；  
2. Confide 内确有 **轻于专门 UI** 的用户故事；  
3. 冲突扫描（强度 / 人设 / 职责）无未拍板疑点；  
4. 更新 **本表** + Task Brief + tracker。

**我认为最合理的下一候选（若做）**：#472 Read Hybrid 已合 · **先人工测**；至多一个新 read tool 须另拍板。Operating / Backup / Update **不**进本表（见 `LOCAL_AI_OPERATING_LAYER.md`）。

---

## Tool Registry（2026-08-26 · V1）

**原则**：**Qwen 候选 tool call · Registry 执行 · Data stays local。** 现网 **正则优先**；regex miss 时 L0 仅可补 **readOnly + autoExecute** 的 registry 项（2026-08-27 · Read Hybrid V1）。

```text
ConfideToYinUI._onSend
  → Safety / emotion（不变）
  → matchConfideExecutableTool (regex)
       → CI-00 / CI-02: 确定性读 + 模板
       → CI-01: 口头 Forget handler（非 autoExecute）
  → regex miss + fallback → classifyReadTool (L0, read prompt only)
       → registry readOnly + autoExecute → 同上模板
  → 仍未命中 → YPE 门闩 → L3 短生成
```

| 风险级 | 例子 | 生产策略 |
|---|---|---|
| `read` | 练了多久、情绪趋势 | 正则优先；regex miss 可 L0 补漏（registry 闸门） |
| `local_reversible` | 删一条 memory | 正则 + Consent；**禁止**模型直接写 |
| `destructive` | bulk wipe、备份、更新 | **禁止**进 Confide registry；长期见 Operating Layer |

新增 CI-xx：先扩 `CONFIDE_EXECUTABLE_TOOLS` + 单测 + 本表；**禁止**在 UI 堆识别 if。

---

## 工程注册（实现参考）

`ConfideToYinUI._onSend` 经 `matchConfideExecutableTool` 于层 3 之前判定；顺序 = registry 数组顺序（practice → presence → forget）。  
实验室：`desktop/scripts/l0-tool-call-probe.js` · `npm run companion:tool-call` · fixture `confideToolCallFixtures.js`。  
Gate 0.D intent JSON（**不**进 send）：`npm run companion:intent-diagnostic` · `confideIntentDiagnosticFixtures.js`。  
新增 CI-xx 时应扩 **registry + 纯函数模块 + 单测**，禁止在 UI 内堆 if 树。


---

## Memory suppress（Slice 1f · pipeline · 非 CI 表项）

| 机制 | 说明 |
|---|---|
| **`memory_suppress`** | Remember 管道 opt-out · `rememberOptOuts[]` · **无** `confideExecutableTools` id |
| **发后撤回** | `Forget this` / 忘掉刚才那句 → 删上一 turn 记忆 · **不**扩 CI-01 |
| **CI-01 不变** | `Please forget about Monday` / 别再记周一 → `memory_forget` |

**SSOT**：`YIN_PERSONAL_MEMORY_PERSISTENCE_POLICY.md`
