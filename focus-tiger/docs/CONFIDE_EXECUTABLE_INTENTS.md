# Confide 可执行意图白名单（V1）

**状态（2026-08-25）**：产品方向锁 · 与 `YIN_PERSONAL_MEMORY.md` · `presenceSignalsGate.js` · `desktopCompanionL2Route.js` 四层门闩一致。  
**规划 SSOT**：`LOCAL_AI_SCENARIOS_V1.md`。  
**不是**开放域 Agent；**不是**「用户说什么都能自动执行」。

---

## 原则

1. **仅系统已有权威数据 + 产品明确允许的动作** 才可进入本白名单。  
2. **执行路径在层 3 之前**：规则识别 → 确定性 handler → 模板/系统字段回复；**禁止** Qwen 编造数字、假装删库、假装备份。  
3. **优先级不变**：Safety → 情绪桶语料 → **本表白名单** → L3 短生成（仅接不住的闲聊）。  
4. **新意图**须 Brief + 冲突扫描；**禁止**为每句用户话无限加 slice。

---

## V1 白名单

| ID | 用户意图（示例） | 数据 / 动作 | 入口 | 实现 |
|---|---|---|---|---|
| **CI-00** | 「练了多久？」/ How long have I practiced? | 读 `PracticeDaysStore`（与 Journey Log 同源） | Confide · `fallback` 前 | Slice 0 · `confidePracticeFacts.js` · `data-source=practice_facts` |
| **CI-01** | 「别再记周一的事了」/ Please forget what I said about Monday | 真删 `yin-personal-memory.json` 单条（同 1c IPC） | Confide · `fallback` + Consent granted | Slice 1e · `yinPersonalMemoryVerbalForget.js` · `data-source=memory_forget` |
| **CI-02** | 「我情绪这两周改善了吗？」/ Has my mood improved these two weeks? | 读 `focus-tiger.presence-signals.v1`（Arrival Notice 等封闭标签；14 日窗口；≥3 条才描述性 breakdown） | Confide · `fallback` 前 | Presence Slice 4 · `confidePresenceFacts.js` · `data-source=presence_facts` |

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

**我认为最合理的下一候选（若做）**：**CI-02** 合入 + tracker 人工（Presence Signals 旁支）；并行关 Yin Memory 1d/1e tracker。仪式 generate 须产品拍板，不进口头表。见 `LOCAL_AI_SCENARIOS_V1.md` §6。

---

## 工程注册（实现参考）

口头 / 事实类意图在 `ConfideToYinUI._onSend` 中于 `practice_facts` → `presence_facts` → `memory_forget` 之后、`ypeMayUseCompanionGenerate`（YPE L0 收口现网层 3 门闩）之前顺序判定。  
新增 CI-xx 时应扩 **纯函数模块 + 单测**，禁止在 UI 内堆 if 树。
