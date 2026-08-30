# Yin Personal Memory · Persistence Policy（Don't save this）

**状态（2026-08-30）**：**PO 正式定稿** · Slice **1f** runtime 已批准 · **不是** CI 白名单条目  
**签字**：Product Owner · 2026-08-30  
**实现 Brief**：`task-briefs/task-yin-memory-slice-1f-dont-save-this.md`  
**交叉引用**：`YIN_PERSONAL_MEMORY.md` · `CONFIDE_EXECUTABLE_INTENTS.md`（CI-01）· Slice 1b Remember · Slice 1e 口头 Forget

---

## 0. 与 CI-01 口头 Forget 的分工

| 能力 | CI-01 口头 Forget | Don't save this（本政策） |
|---|---|---|
| **用户意图** | 删掉**已经入库**的主题记忆 | **阻止入库**或**发后撤回**上一 turn |
| **典型说法** | 「别再记**周一的事**了」 | 「**别记这句**」· `Forget this` · 「刚才那句别记」 |
| **实现** | `memory_forget` · CI-01 | **`memory_suppress`** · Remember 管道门闩 · **无新 CI** |
| **V1 时序** | L3 之后 · 主题匹配删库 | **(b) 发后撤回**必做；**(a) 同句 inline opt-out** 拦 Remember；**(c) 发前 opt-out** = Phase 2 |

**诚实边界（硬约束）**

> Yin **不得**说「好的，我不会记」——除非 Remember 管道**真的**被拦下（`data-source=memory_suppress` 可核对）。

---

## 1. PO 定稿四问

| 问 | 定稿 |
|---|---|
| **作用域** | 默认 **(a) 仅本条 turn**；用户**两次**表达别记类意愿后，Yin **可**主动问是否以后都不记（不首句给永久选项） |
| **时序** | **V1 必做**：**(b) 发后撤回** + 同句 inline 拦 Remember；**V1 不做**：**(a) 发前 opt-out**（Phase 2） |
| **诚实** | 见 §0 |
| **Consent** | **逐句 Don't save 优先于**一次性 Allow（运行时例外覆盖默认） |

---

## 2. 触发短语（V1）

| 语言 | 短语 |
|---|---|
| EN | `don't save this` · `don't remember this` · `don't keep this` · **`forget this`** · **`forget that`**（无 `about`） |
| ZH | 别记这句 · 不要记这句 · 这句话别记住 · 忘掉刚才那句 · 刚才那句别记 |
| JA | **待定**（locale 审后再填） |

**路由**：`forget what I said about Monday` → **CI-01**；`forget this` / 忘掉刚才那句 → **memory suppress 发后撤回**（**不**扩 CI-01）。

---

## 3. 工程映射

- **无新 CI id** · 不进入 `confideExecutableTools.js` 生产 registry  
- **`rememberOptOuts[]`** 持久化于 `userData/companion-l2/yin-personal-memory.json`：`{ turnId, scope: 'turn'|'session', at }`  
- **R1**：同句 inline → 跳过 `rememberFromConfide` · 写 opt-out  
- **R2**：发后撤回 → 删上一 turn 的 `confide:turn:N` 记忆 + opt-out + `memory_suppress`  
- **Web/375**：无 bridge · 行为不变

---

## 4. 回复模板 · `data-source`

| 场景 | EN | ZH | `data-source` |
|---|---|---|---|
| 本条不记 / standalone opt-out | I won't keep that in memory. | 好的，这句我不会记下来。 | `memory_suppress` |
| 发后已删 | I've removed that from what I remember. | 好的，我已经不记那一句了。 | `memory_suppress` |
| 无匹配 | I don't see a matching memory to remove. | 我没有找到对应的一句可以删掉。 | `memory_suppress` |

---

## 5. 验收（tracker · SCENARIO_TESTS AG · 1f）

见 `SCENARIO_TESTS.md` AG · Slice 1f · `TEST_TRACKER` 行 `feature-yin-memory-slice-1f-dont-save-this.md`。

---

## 6. 变更记录

| 日期 | 说明 |
|---|---|
| 2026-08-30 | PO 定稿 · Slice 1f 开工 |
