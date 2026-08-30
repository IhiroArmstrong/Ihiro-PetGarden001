> ⚠️ **候选草案 · 未拍板**  
> 本文 **不是** Task Brief · **不是** PO 正式决策 · **不是** runtime 开工令。  
> 文中「分析师初步倾向」仅供讨论起点；**不得**引用为已批准产品政策。  
> 定稿后须 PO 书面签字，并同步下方 §9 所列 SSOT；定稿前 **禁止** 改 Remember 门闩或 `CONFIDE_EXECUTABLE_INTENTS` 白名单。

---

# Yin Personal Memory · Persistence Policy（Don't save this）· 候选草案

**文档类型**：政策候选 · 待 PO 勾选定稿  
**创建（2026-08-30）**：Cursor 起草 · PO / 分析师输入  
**关联（只读引用）**：`YIN_PERSONAL_MEMORY.md` · `CONFIDE_EXECUTABLE_INTENTS.md`（CI-01）· Slice 1a Consent · Slice 1b Remember · Slice 1e 口头 Forget  
**当前 SSOT 状态**：Don't save this = ❌ **未批准**（`LOCAL_AI_SCENARIOS_V1.md` · `LOCAL_AI_SCENARIO_EXPANSION_PO_DECISION.md`）

---

## 0. 与现有口头 Forget（CI-01）的关系

| 能力 | 现网 CI-01 口头 Forget | 本政策 Don't save this |
|---|---|---|
| **用户意图** | 删掉**已经入库**的记忆（主题匹配） | **阻止入库**，或入库后立即撤回 |
| **典型说法** | 「别再记**周一的事**了」 | 「**别记这句**」/ Don't save **this** |
| **前提** | Consent Allow + `memories[]` 已有匹配条目 | Consent Allow（逐句 opt-out 可覆盖） |
| **时机** | L3 之后 · Remember 已跑 | 本条发送前后 · **Remember 写库决策点** |
| **是否重复** | — | **发后撤回** 可复用 CI-01；**本条拦截** 须新门闩 |

**硬约束（非选择题 · 定稿须保留）**

> Yin **不得**说「好的，我不会记」/「I won't remember that」——除非 Remember 管道**真的**被拦下。  
> 拦截未接线时，只能用不过度承诺措辞（见 §5）。

---

## 1. 四问 · 候选方案与 PO 勾选

分析师初步倾向已标 **〔倾向〕**；定稿时在 **PO 勾选** 列打 ✅ 或改写。

### 1.1 作用域（Scope）

| 选项 | 含义 | 分析师 | PO 勾选 |
|---|---|---|---|
| **(a) 仅本条** | 只拦当前 turn / 当前用户句的 Remember | **〔倾向〕默认** | ☐ |
| **(b) 本会话** | 本会话 Confide 内后续 unmatched 也不 Remember | 升级动作 | ☐ |
| **(c) 永久关闭 Remember** | 等同撤回 Consent 或长期 suppress | 升级动作 · 门槛最高 | ☐ |

**〔倾向〕细化**：默认 (a)；用户**两次**表达「别记」类意愿后，Yin **可主动问**「要不要以后都不记？」——**不要**首句就给永久选项。

**PO 定稿须写死**：默认 scope = ___ · 升级路径 = ___ · 是否允许 Yin 主动追问 = ___

---

### 1.2 时序（Timing）

| 选项 | 含义 | 分析师 | PO 勾选 |
|---|---|---|---|
| **(a) 发前 opt-out** | 用户发送前/同句内声明「接下来别记」 | 后续增强 | ☐ |
| **(b) 发后撤回** | L3 已回复 · 用户反悔「刚才那句别记」 | **〔倾向〕优先落地** | ☐ |
| **(c) 两者都支持** | 全链路 | 分阶段 | ☐ |

**〔倾向〕细化**：V1 **优先 (b)**——贴近「事情已发生、用户反悔」；工程上复用 CI-01 Forget 链 + 必要时扩展「上一 turn」匹配。**(a)** 需预判「接下来这句话」· 作 Phase 2 增强。

**PO 定稿须写死**：V1 必做 = ___ · V1 明确不做 = ___

---

### 1.3 诚实边界（Honesty）

| 项 | 定稿要求 |
|---|---|
| 管道已拦下 | 可说短确认（须 `data-source` 可核对 · 见 §4） |
| 管道未拦下 | **禁止**承诺已控制未来保存 |
| 管道未做 | 引导面板 Forget / 说明限制 |

**PO 勾选**：☐ 采纳上述硬约束（建议直接 ✅）

---

### 1.4 与 Consent 分工

| 选项 | 含义 | 分析师 | PO 勾选 |
|---|---|---|---|
| **Allow 优先** | 一次性 Allow 覆盖后续逐句 Don't save | — | ☐ |
| **Don't save 优先** | 当下逐句意愿覆盖更早 Allow | **〔倾向〕** | ☐ |

**〔倾向〕原则**：越具体的当下意愿越优先；实现上 Allow = 默认通过 · Don't save = 运行时例外。

**PO 定稿须写死**：冲突裁决规则 = ___ · 是否写入 store 字段 = 见 §4

---

## 2. 触发短语范围（候选 · 待 PO 收窄）

### 2.1 核心意图（V1 候选白名单）

| 语言 | 候选触发句 | 备注 |
|---|---|---|
| EN | don't save this · don't remember this · don't keep this | 「this」须绑定当前/上一 turn |
| ZH | 别记这句 · 不要记这句 · 这句话别记住 | 同句携带内容时优先绑本条 |
| JA | （待定 · 定稿前须设计师/ locale 审） | 勿机翻自动填 |

### 2.2 与 CI-01 Forget 的口语边界

| 用户可能说 | 建议路由 | 理由 |
|---|---|---|
| forget what I said about **Monday** | **CI-01**（现网） | 主题删库 |
| forget **this** / 忘掉**刚才那句** | **Don't save 发后撤回** 或 CI-01 扩展 | 需 policy 定默认 |
| don't save **this**（同句带偏好内容） | **Don't save 本条拦截** | CI-01 无已入库条目可删 |
| forget everything | **负例**（现网） | 引导面板逐条 |

**PO 定稿须确认**：EN `forget this` 默认走 CI-01 还是 Don't save = ___ · 歧义句 Yin 澄清策略 = ___

### 2.3 明确不触发

- 危机 / 情绪桶句（Safety 仍优先 · 不写 memory 但走语料）
- `How long have I practiced?` 等 CI 白名单
- 纯 L3 闲聊无 opt-out 词

---

## 3. CI 映射与 Remember 管道（候选工程方案）

> 定稿前 **不**改 `confideExecutableTools.js` · **不**新增 CI id 进生产白名单。

### 3.1 能力分层

```text
用户句
  → Safety / 情绪桶 / CI 白名单（CI-00/01/02…）
  → Don't save 检测（新 · 待拍板）
       ├─ 本条拦截：跳过 rememberFromConfide（1b 门闩）
       └─ 发后撤回：CI-01 扩展 或 新 CI-0?（待定）
  → L3 generate
  → Remember 管道（仅 fallback + generate + Consent granted + 无 suppress 标记）
```

### 3.2 与 CI-01 的分工（〔倾向〕最小不重复）

| 场景 | 建议实现 | 新 CI？ |
|---|---|---|
| 库里已有 · 主题匹配删 | **CI-01** 不变 | 否 |
| 刚上一 turn 已入库 · 发后「别记刚才那句」 | **CI-01 扩展**（上一 turn 主题 / 摘要匹配） | 可选 CI-04 · 或扩 CI-01 |
| 同句「内容 + 别记这句」· Remember 未写 | **Remember 门闩** `suppressRememberThisTurn` | 否（管道标记） |
| 本会话 / 永久关闭 | **Consent 或 store suppress 字段** | 否 |

**PO 定稿须选**：发后撤回 = 仅扩 CI-01 ☐ · 新 CI id ☐ · 仅管道标记 ☐

### 3.3 Remember 拦截点（候选）

| 拦截点 | 位置 | 作用 |
|---|---|---|
| **R1 · turn 级** | L3 成功回调前 | 同句 Don't save → 本 turn 不写 `memories[]` |
| **R2 · 发后撤回** | 下一句检测到 opt-out → 若 R1 已写则走 Forget | 衔接 CI-01 |
| **R3 · session 级** | store / session 标记 | 本会话跳过 Remember（若 PO 选 1.1(b)） |

---

## 4. Consent 与 store schema（候选 · 待 PO 定字段名）

现网（Slice 1a）：`consentDecision` = `granted` | `denied` | 未决策。

**〔倾向〕冲突规则**：逐句 Don't save **优先于** `consentDecision=granted`（仅影响被标记的 turn / scope；不自动改 consent 全局）。

### 4.1 候选字段（定稿时二选一或合并）

| 字段（候选名） | 类型 | 用途 |
|---|---|---|
| `suppressRememberUntilTurnId` | string \| null | 本会话临时 suppress（scope b） |
| `rememberOptOuts[]` | `{ turnId, scope: 'turn' \| 'session', at }` | 审计 / 发后撤回 |
| `consentDecision` | 不变 | 全局 Allow / Not now；永久关闭走 denied 或新枚举 |

**PO 定稿须写死**：采用字段 = ___ · 是否持久化到 `yin-personal-memory.json` = ___ · Web 无 bridge 行为 = 不变

---

## 5. Yin 回复模板（候选 · 定稿须 locale 审）

### 5.1 允许（管道真的拦下 · 须有可核对 `data-source`）

| 场景 | EN 候选 | ZH 候选 |
|---|---|---|
| 本条不记 | I won't keep that in memory. | 好的，这句我不会记下来。 |
| 发后已删 | I've removed that from what I remember. | 好的，我已经不记那一句了。 |

> 定稿须指定 `data-source` 值（建议新值如 `memory_suppress` / 扩 `memory_forget`——**PO 选**）

### 5.2 禁止

- 「好的，我不会记」——**Remember 未拦下时**
- 「我已经帮你关掉了记忆功能」——**未改 Consent 时**
- L3 自由发挥承诺未来行为

### 5.3 未接线 / 做不到时的诚实模板

| 场景 | EN 候选 | ZH 候选 |
|---|---|---|
| 拦截未实现 | I can't control that from here yet. You can remove lines in What Yin remembers. | 我还不能从这里拦住记忆；你可以在「What Yin remembers」里删掉。 |
| 无匹配条目（发后撤回） | I don't see a matching memory to remove. | 我没有找到对应的一句可以删掉。 |

---

## 6. 验收口径（定稿后写入 tracker / SCENARIO_TESTS）

### 6.1 主路径（Electron 宽屏 · Consent Allow）

| # | 步骤 | 期望 |
|---|---|---|
| T-1 | 发 `I prefer quiet reflections. Don't save this.`（或 ZH 等价） | L3 正常；**`memories[]` 不增**；回复用 §5.1 且 `data-source` 可核对 |
| T-2 | 先发可抽取句入库 → 下一句「刚才那句别记」 | 条目删除或 suppress；**0–1s** 内确认；JSON 无该条 |
| T-3 | Consent Allow 后仅说 Don't save（无内容句） | 诚实边界：不虚假承诺；行为符合 PO 选的 scope |

### 6.2 负例

| # | 步骤 | 期望 |
|---|---|---|
| N-1 | Consent Not now | 本来就不写 memory；Don't save 不改变 consent UI |
| N-2 | 危机 / 情绪桶 + Don't save | Safety 优先；不写 memory |
| N-3 | `forget everything` | 仍引导面板 · 不 bulk wipe |
| N-4 | Web / 375 无 bridge | 行为不变（同 Memory 切片政策） |

### 6.3 与 CI-01 回归

| # | 步骤 | 期望 |
|---|---|---|
| R-1 | 「别再记周一的事了」+ 已有 Monday 条目 | **仍** `memory_forget` · CI-01 不退化 |

### 6.4 自动化（定稿后）

- 单测：opt-out 检测 · Remember 门闩 · 与 CI-01 路由不冲突
- **不**替代 Electron 宽屏人工关单

---

## 7. 定稿后文档同步范围（本草案 **尚未** 执行）

PO 签字定稿后，**同批**更新：

| 文档 | 变更 |
|---|---|
| **新建或升格** | 本草案 → `YIN_PERSONAL_MEMORY_PERSISTENCE_POLICY.md`（或 PO 指定路径）· 去掉「候选草案」头 |
| `CONFIDE_EXECUTABLE_INTENTS.md` | Don't save 移入白名单或保留禁止+诚实表 · 新 CI id（若有） |
| `LOCAL_AI_SCENARIOS_V1.md` | ❌ 未批准 → ✅ 已批准（若 PO 批准） |
| `LOCAL_AI_SCENARIO_EXPANSION_PO_DECISION.md` | 追加 Persistence Policy 小节 · **不**把倾向当决策 |
| `LOCAL_AI_PHASE1_TASK_PLAN.md` | §6 不开工表 · 若批准则另口令 |
| `task-local-ai-phase1-nl-actions-mvp.md` | 「不做 Don't save」→ 移除或改指向新 Brief |
| `TASKS.md` §Local AI | 状态行更新 |
| `SCENARIO_TESTS.md` · `TEST_TRACKER.md` | 新增 AG 子项或独立 tracker 行 |
| `YIN_PERSONAL_MEMORY.md` | Remember / Forget / Consent 交叉引用 |

**定稿前禁止**：改 `yinPersonalMemory*` runtime · 改 Remember 门闩 · 将 Don't save 加入 `confideExecutableTools.js` 生产路径。

---

## 8. PO 定稿清单（复制即用）

定稿会议或书面签字时勾选：

- [ ] §1 四问全部有 ✅ 选项（非仅〔倾向〕）
- [ ] §2 触发短语中英（+ JA 若需要）已审
- [ ] §3 CI 映射 / 新 CI id / 仅管道标记 已选
- [ ] §4 schema 字段名与 Consent 冲突规则已写死
- [ ] §5 回复模板 + `data-source` + locale 已审
- [ ] §6 验收口径同意作为关单依据
- [ ] §7 同步 PR 范围确认
- [ ] 签字日期 · 定稿文档路径：___

---

## 9. 变更记录

| 日期 | 说明 |
|---|---|
| 2026-08-30 | 候选草案 v0 · PO 批准起草 · 分析师四问〔倾向〕入库 |
