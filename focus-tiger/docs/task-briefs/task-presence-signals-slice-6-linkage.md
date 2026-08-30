# Presence Signals · Slice 6 · 双写联动删除方案摘要

> **状态（2026-08-30）**：**方案摘要 · 待 PO/工程审** · Slice 6 开工口令前须本摘要拍板。  
> **前置**：Slice 0–1 + 4 + 5 ✅ · Slice 2 ✅ · Slice 3 ✅  
> **权威**：`task-presence-signals-slice-0-1.md` §Slice 6 · `reflectionPresenceBridge.js` · `SessionEndFlow.js`

---

## 1. 用户场景

用户在 Arrival / Reflection / Ritual 等处留下 Presence 观察后，需要：

1. **查看**：本机记了哪些观察（标签、freeText、来源、时间）  
2. **删除**：删掉某次 Reflection 或某条独立观察，且删除承诺须兑现（两侧数据一致）  
3. **Consent**：若 freeText 将被 L3 读取回指，须单独同意（与 Yin Memory Consent 分离）

Slice 3 披露文案刻意**未许诺**「查看/管理/删除」——可控入口留给本 Slice。

---

## 2. 现网双写事实（已合 #436）

一次 Reflection 会话结束（`SessionEndFlow.onDone`）且 `hasAnyAnswer`：

| 存储 | 写入内容 |
|---|---|
| `focus-tiger.reflections.v1` | **1 条 bundle**：`{ createdAt, notice?, emotion?, nextFocus? }`（仅非空字段） |
| `focus-tiger.presence-signals.v1` | **最多 3 条**：`reflection_q1` / `reflection_q2` / `reflection_q3`，各带 `freeText`，**无** `emotionTag` |

**关联缺口（Slice 6 须补）**：现网**没有** bundle ↔ signal 的稳定关联 id。`appendReflectionPresenceSignals` 用 `idFn` 生成 signal id（`refl-{at}-{field}-{seq}`），bundle 侧只有 `createdAt`，**无法**从 bundle 反查对应 3 条 signal。

Arrival Notice / Ritual chip 等**单条**写入 presence-signals，**无** reflections 侧镜像。

---

## 3. 推荐关联模型（Slice 6 写入侧改造 + 面板删除）

### 3.1 引入 `presenceSessionId`

每次产生「可删一组」的写入批次，生成 `presenceSessionId`（`crypto.randomUUID()` 或等价）。

| 写入类型 | reflections.v1 | presence-signals.v1 |
|---|---|---|
| Reflection 双写 | bundle 增 `presenceSessionId` | 该批 1–3 条均带同一 `presenceSessionId` |
| Arrival notice / choose | 无 bundle | 单条带 `presenceSessionId`（= 自身批次） |
| Ritual chip | 无 bundle | 单条带 `presenceSessionId` |

**向后兼容**：旧行无 `presenceSessionId` → 面板展示为「legacy」；删除时按 §3.3 降级匹配或只删 presence 侧单条。

### 3.2 面板「一条记录」的 UI 单元

| 面板行类型 | 数据源 | 删除范围 |
|---|---|---|
| **Reflection 会话** | 同 `presenceSessionId` 的 bundle + 1–3 signals | 删 bundle **且** 删该 id 下全部 signals |
| **独立观察** | 单条 presence（arrival / ritual，无 bundle） | 只删该 signal id |

列表排序：按批次 `createdAt` / 最早 signal `at` 降序。

### 3.3 删除 API（纯函数 · 建议 `presenceSignalsDelete.js`）

```text
deletePresenceSession(storage, presenceSessionId)
  → 从 reflections.v1 移除 matching bundle
  → 从 presence-signals.v1 移除 matching entries（by presenceSessionId）
  → 返回 { removedBundles, removedSignals }

deletePresenceSignalById(storage, signalId)
  → 仅删单条（独立观察）
  → 若 signal 带 presenceSessionId 且存在 bundle → **拒绝**或引导「删整组」
```

**硬规则**：用户点「删除这条 Reflection 记录」时，**禁止**只删 presence 或只删 reflections。

### 3.4 Legacy 降级（无 presenceSessionId 的历史数据）

| 策略 | 规则 | 风险 |
|---|---|---|
| **A（推荐）** | 按 `createdAt`（bundle）与 signal `at` 差 ≤ 2s 且 source 为 `reflection_q*` 批量匹配 | 极低概率误配 |
| **B** | Legacy 行只提供「删 presence 单条」，不承诺删 bundle | 删除承诺弱化 |

Slice 6 开工前在 DevTools 抽 1 台 QA 机核实 legacy 行占比；若几乎为空，可只实现 A + 新写入带 id。

---

## 4. freeText L3 Consent（Slice 6 范围）

| 项 | 口径 |
|---|---|
| 触发 | Presence freeText **首次**将被 L3 读取（非 Confide Memory Consent） |
| 存储 | 建议 `focus-tiger.presence-freetext-l3-consent.v1`（granted / denied / unset） |
| 默认 | 未同意 → L3 **不**注入 presence freeText；CI-02 趋势仍只读 `emotionTag` |
| UI | 面板邻接或 Slice 6 面板内一次性条 |

---

## 5. localStorage 容量（开工前 Gate）

Brief 要求 Slice 6 开工前全 key 体积快照。估算：

- 90 天 × 每日 3 Reflection 全答 ≈ 270 presence 行；硬顶 `PRESENCE_SIGNALS_MAX_ENTRIES = 240`  
- `reflections.v1` 上限 5 条 bundle（`REFLECTION_MAX_SAVED`）——与 presence 90 天策略**不对称**；面板须分别说明保留策略  

**开工前动作**：DevTools → Application → Local Storage → 导出各 key 字节数记入 tracker 行。

---

## 6. 与 Phase 1A Show memory 的分工

| 能力 | 负责 |
|---|---|
| Show memory read（Confide 口头） | `yin-personal-memory.json` · Phase 1A |
| Presence 查看/删除面板 | Slice 6 · `presence-signals.v1` + `reflections.v1` |

**禁止**混 PR；口头 read 不得替代面板删除承诺。

---

## 7. 验收要点（摘要）

1. Reflection 双写后 bundle 与 signals 共享 `presenceSessionId`  
2. 面板删 Reflection 行 → 两侧皆空  
3. 删 Arrival 单条 → 不影响 reflections  
4. freeText L3 Consent：未同意不注入；同意后仅读 presence freeText  
5. Legacy 行删除行为符合 §3.4 选定策略  

---

## 8. 开工阻塞项（审本摘要时勾选）

- [ ] PO 确认关联模型 §3.1（`presenceSessionId`）  
- [ ] PO 确认 legacy 策略 A 或 B  
- [ ] localStorage 全量快照完成  
- [ ] 口令「开工 Presence Signals Slice 6」
