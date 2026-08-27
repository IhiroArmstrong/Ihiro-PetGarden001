# Confide 可执行意图白名单（V1）

**状态（2026-08-26）**：产品方向锁 · 与 `YIN_PERSONAL_MEMORY.md` · `presenceSignalsGate.js` · `desktopCompanionL2Route.js` 四层门闩一致。  
**规划 SSOT**：`LOCAL_AI_SCENARIOS_V1.md`。  
**工程 SSOT**：`confideExecutableTools.js`（CI → Tool Registry；生产仍正则匹配）。  
**不是**开放域 Agent；**不是**「用户说什么都能自动执行」；**不是**全 App Operating Layer。

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
| **CI-02** | `query_presence_trend` | 「我情绪这两周改善了吗？」/ Has my mood improved these two weeks? | 读 `focus-tiger.presence-signals.v1`（封闭标签；14 日；≥3 条描述性 breakdown） | read | Confide · `fallback` 前 | `confidePresenceFacts.js` · `presence_facts` |

**面板 Forget（1c）** 不在此表重复登记：同一 `forget` IPC，入口为 UI 行按钮，非口头意图。

---

## 明确不在白名单（V1 禁止口头自动执行）

| 用户可能说 | 为何不做 | 合理行为 |
|---|---|---|
| 帮我备份练习记录 | 备份在 Journey / 练习云备份链；Confide 非全 App 命令行 | 诚实说明入口，或 L3 不接「已备份」幻觉 |
| 忘掉你记得的一切 | bulk wipe 风险高 | 引导「What Yin remembers」逐条 Forget（1e 负例） |
| 喜欢吃什么 / 任意 Preference | 本机无该事实字段 | 不记、不编（架构 § 延后） |

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

**我认为最合理的下一候选（若做）**：实验室 tool-call 探针过门后，**只读** paraphrase 补漏（正则 miss → Qwen 选 read tool）；写工具仍正则或确认。较弱：在未关 1d/1e/CI-02 tracker 前开新 CI-xx。仪式 generate 须产品拍板。见 `LOCAL_AI_SCENARIOS_V1.md` §6 · `task-confide-tool-registry-v1.md`。

---

## Tool Registry（2026-08-26 · V1）

**原则**：**Qwen decides（未来、白名单内）· Tools execute · Data stays local。** 现网仍是 **正则优先**；Qwen tool-call **仅实验室**，未过探针不得进生产 send。

```text
ConfideToYinUI._onSend
  → matchConfideExecutableTool (registry)
       → CI-00 / CI-02: 确定性读 + 模板
       → CI-01: 口头 Forget handler（非 autoExecute）
  → 未命中 → YPE 门闩 → L3 短生成
```

| 风险级 | 例子 | 生产策略 |
|---|---|---|
| `read` | 练了多久、情绪趋势 | 正则命中即执行；未来可模型补漏 |
| `local_reversible` | 删一条 memory | 正则 + Consent；**禁止**模型直接写 |
| `destructive` | bulk wipe、备份、更新 | **禁止**进 V1 registry |

新增 CI-xx：先扩 `CONFIDE_EXECUTABLE_TOOLS` + 单测 + 本表；**禁止**在 UI 堆识别 if。

---

## 工程注册（实现参考）

`ConfideToYinUI._onSend` 经 `matchConfideExecutableTool` 于层 3 之前判定；顺序 = registry 数组顺序（practice → presence → forget）。  
实验室：`desktop/scripts/l0-tool-call-probe.js` · `npm run companion:tool-call` · fixture `confideToolCallFixtures.js`。  
新增 CI-xx 时应扩 **registry + 纯函数模块 + 单测**，禁止在 UI 内堆 if 树。
