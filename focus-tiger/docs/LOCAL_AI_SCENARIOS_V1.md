# 本地 AI 场景规划 · V1

**状态（2026-08-26）**：产品方向锁 · 规划稿（Tool Registry V1 已开工；Qwen tool-call 仅实验室）。  
**SSOT 交叉引用**：`CONFIDE_EXECUTABLE_INTENTS.md` · `task-confide-tool-registry-v1.md` · `task-desktop-on-device-companion.md` · `YIN_PERSONAL_MEMORY.md` · `YIN_PERSONALIZATION_ENGINE.md` · `task-presence-signals-slice-0-1.md`

---

## 1. 政策边界（不变）

本地 AI = **桌面端窄例外**：Electron 宽屏 Confide **fallback** 短生成 + **层 3 之前**的确定性事实/动作路由。

```text
0 Safety → 1 仪式语料（无 generate IPC）→ 2 情绪桶语料 → CI 白名单 → 3 L3 短生成
```

**不是**：开放域 Agent · Web/PWA 生成 · 仪式文案改写 · 诊断/教练清单 · **全 App 自然语言 Operating Layer**（备份/更新仍走专门 UI）。

---

## 1.1 Tool Registry（2026-08-26 · V1）

CI 白名单的演进形态 = **有限 Tool Registry**（`confideExecutableTools.js`），不是设计师提案里的全量 JOURNEY/FOCUS/APP CLI。

```text
                 ┌──────────────────────┐
User ──────────► │ Safety / 情绪桶       │（不变）
                 └──────────┬───────────┘
                            ▼
                 ┌──────────────────────┐
                 │ Tool Registry (CI-xx) │  ← 现网：正则 match
                 │  read / reversible  │
                 └──────────┬───────────┘
                            ▼
                 ┌──────────────────────┐
                 │ 确定性 handler       │
                 └──────────┬───────────┘
                            ▼
                 ┌──────────────────────┐
                 │ L3 短生成（闲聊）     │
                 └──────────────────────┘

实验室（未进生产）：1.7B JSON tool id → 与 fixture 对照 → write FP 须为 0
```

**未来 hybrid（须探针过门）**：正则 miss 且 fallback → 仅允许 Qwen 选 **read** tool；写工具仍正则或用户确认。

---

## 2. 三条轨道（规划用）

| 轨道 | 含义 | 准入 |
|---|---|---|
| **A · 口头可执行（CI-xx）** | 规则识别 → 读/写本地真数据 → 模板回复 | 有权威字段 + 比专门 UI 更轻 + 写操作风险可控 |
| **B · L3 被动增强** | generate 时注入观察块 | 不诊断、不 coach；例：Yin Memory 1d Use |
| **C · 仪式 generate** | Whisper / Recover / Reflection 等 | **全局未拍板**；须单独产品会，不与 A/B 混 PR |

---

## 3. 已落地 / 在途（2026-08-25）

### 3.1 Confide 口头白名单（轨道 A）

| ID | 用户意图 | 数据源 | 状态 |
|---|---|---|---|
| **CI-00** | 练了多久 | `PracticeDaysStore` | **#424 已合** · `practice_facts` |
| **CI-01** | 口头 Forget 单条 | `yin-personal-memory.json` | **#434 已合** · `memory_forget` |
| **CI-02** | 情绪这两周怎么样 / Has my mood improved? | **`focus-tiger.presence-signals.v1`** | **本旁支** `feature/presence-signals-slice-0-1` · `presence_facts` |

> **纠正（2026-08-25）**：Arrival Notice（calm / stressed / sad 等封闭标签）**已入账** `presence-signals.v1`；**不是**「无情绪账本」。趋势答句只作**描述性 breakdown**（如「14 天内 3 次 calm、2 次 stressed」），**禁止**诊断（「焦虑缓解」）或 L3 编造趋势。

### 3.2 Yin Personal Memory（轨道 B + 面板动作）

Slice 0 → 1e **代码已闭环**（#424–#434）。仪式 generate **仍未拍板**。

### 3.3 商业化（非场景扩展）

Support **第四卡 Pro + 第五卡 Lifetime AI Add-on** Checkout **已接线**（`feature/checkout-pro-companion-addon` · `FREE_PAID_MATRIX`）；TRACKER 待 Stripe Test 人工。

---

## 4. Presence Signals 路线图（情绪账本 · 优先）

SSOT：`SHARED_RESOURCES.md` · Brief `task-presence-signals-slice-0-1.md`。

| Slice | 内容 | 状态 |
|---|---|---|
| **0–1 + 4 minimal** | 文档 + Arrival Notice 写入 + Confide 趋势只读（CI-02） | **本旁支开工** |
| **2** | Ritual chip 点选入账 + Leave 弱提示 | 排期 |
| **3** | Reflection Q1–Q3 分拆双写 | 排期 |
| **5** | 用户查看/删除 + 首次告知 | 排期 |
| **6** | L3 引用 freeText（读取侧 Consent） | 排期 |

**分桶**：Presence（封闭标签事件）≠ Yin Memory（倾诉抽取）≠ Journey Log（留痕列表）≠ `reflections.v1`（自由文本最近 5 条）。

---

## 5. V1 明确不做（口头 / generate）

| 用户可能说 | 为何不做 | 合理行为 |
|---|---|---|
| 帮我备份练习 | Confide 非全 App CLI | 指向 Journey / 云备份入口 |
| 忘掉你记得的一切 | bulk wipe | 引导 What Yin remembers 逐条 Forget |
| 喜欢吃什么 | 无 Preference 字段 | 不记、不编 |
| Journey / Reflection 润色 | Slice 0 Brief 仍禁 | 检索语料或诚实说明 |
| 情绪趋势但 &lt;3 条 tagged | 产品门槛 | `presence_facts` insufficient 模板 |

---

## 5.1 Yin Personalization Engine（编排 · 非本文件扩 CI）

SSOT：`YIN_PERSONALIZATION_ENGINE.md`。**不是**新的 Confide CI-xx，**不是**轨道 C 仪式 generate。本地 AI 场景继续只谈路由与口头白名单；何时沉默 / 取哪几条记忆 / 政策档看 YPE。**L0** 门闩收口；**L1** 本地检索契约 / 计数 insight / 三档。L2 **契约**已拍（五键 + Pack）；Worker **未开工**。

## 6. 我认为最合理的下一刀

1. ~~跑实验室 tool-call 探针~~（2026-08-27 已过门：`writeFalsePositives === 0`）。  
2. **Read Hybrid V1 已开工**（`task-confide-read-hybrid-v1.md`）：regex miss → 仅 read tool；lab 探针仍单独跑回归。  
3. **关 Yin Memory 1d/1e + CI-02 tracker** 人工（canonical 句与改前一致）。  
4. **较弱**：仪式 generate（轨道 C）；未关 tracker 前开新 CI-xx。

**较弱选项**：把 Confide 扩成 App CLI（备份/更新/批量删）。

---

## 7. 新增场景准入 checklist

1. 本地有 **可审计** 数据源（或写操作定义清晰、风险可控）  
2. Confide 内故事 **轻于** 专门 UI  
3. `SCENARIO_TESTS.md` 冲突扫描（强度 / 人设 / 职责）无未拍板疑点  
4. 更新 **本文件** + `CONFIDE_EXECUTABLE_INTENTS.md` + Task Brief + tracker
