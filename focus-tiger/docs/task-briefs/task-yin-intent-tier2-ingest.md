# Task Brief · Yin Intent Diagnostic Tier 2 入库（盲测 fixture + 一轮 Metal）

> **状态（2026-09-01）**：**#526 已合 develop** · 金标 **v3.1 冻结** · Metal 一轮 `passTier2` ❌ · **PO 不立项 Phase 3 / 不换模** · **不进 Confide send** · **不调 E′ prompt**  
> **轨道**：Gate 0.D 实验室 · 切片 3 双命中 **#525**（分口令已合）

---

## 产品定位

Tier 2 验证：在排除调参痕迹、词面/句法捷径、桶内重复、以及不存在的产品 intent 之后，同一 1.7B Q4 对**全新句**仍能否分开 `COMPANION_PRESENCE` / `OTHER` / `BOUNDARY`。

**不是**「COMPANION 已够用」。过关 ≠ 开 Phase 3。

---

## 冻结句（v3.1 · T2-A3 L1-safe）

权威实现：`confideIntentDiagnosticTier2.js`（**独立文件**，勿并入 `phase2b.js`）。

| ID | 句 | Gold | Probe / queryKind |
|---|---|---|---|
| T2-A1 | Could we share the next few minutes without trying to accomplish anything? | `COMPANION_PRESENCE` | no-agenda |
| T2-A2 | I'm not looking for guidance in this. I want a person, not a helper. | `COMPANION_PRESENCE` | pragmatic · 拒指导角色 |
| T2-A3 | This stretch of time shouldn't have only me in it. | `COMPANION_PRESENCE` | companionship · **不用** `I'd rather not`（避评分集 C3） |
| T2-A4 | I'm not asking you to lift this. I want it seen, not treated. | `COMPANION_PRESENCE` | vs-intervention |
| T2-B1 | What's my all-time sit minutes on this device? | `OTHER` | `query_practice_duration` |
| T2-B2 | Which mood labels have I used most often in my recent check-ins? | `OTHER` | `query_presence_trend`（CI-02 = presence emotionTag 计数，非练习规律） |
| T2-B3 | What's sitting in the remember panel right now? | `OTHER` | `query_memory_list` |
| T2-B4 | Can you give me the current list of memories you've saved for me? | `OTHER` | `query_memory_list` |
| T2-C1 | Some of this stays off-limits in what we cover. | `BOUNDARY` | topic off-limits |
| T2-C2 | I'd rather keep that part to myself for now. | `BOUNDARY` | information |
| T2-C3 | I haven't got the stamina to take that further. | `BOUNDARY` | capacity |
| T2-C4 | That question doesn't get a reply from me in this turn. | `BOUNDARY` | 拒答此问 · **保留**（Phase 1/2 仅 L1；无 3 词连续撞 Maybe later） |

---

## 独立性扫描（冻结规则）

| 语料 | 层级 | 失败 |
|---|---|---|
| 2b 评分集 44 + holdout 9 | L1–L4 | 硬打回 |
| Phase 1 + Phase 2 | **仅 L1**（exact / 3 词连续 / 明显 phrase family） | 硬打回；**不**因同属 delay/presence 子型打回 |
| L5 | 必须映射现网 CI / 陪伴 / 软边界 | 无工具归宿则撤句 |

L1 = 非换 2–3 词；无 3+ 连续词与对照语料重合。  
L2 = 非同一骨架只换主语/时态。  
L3 = 不能靠 E/E′ 已强化 shortcut 直接猜 gold。  
L4 = 同桶两条不能主要依赖同一 reasoning cue。

**禁止**用本轮 Metal 分数改 E′ prompt。只跑一轮。

---

## 跑分

```bash
cd focus-tiger/desktop && FT_INTENT_PHASE=2b FT_INTENT_ARCH=E FT_INTENT_TIER2=1 npm run companion:intent-diagnostic
```

- `FT_INTENT_TIER2=1` → **只跑 12 条**，不混 2b 44 / holdout。  
- 默认架构 **E**（E′ prompt）。  
- 过关：COMPANION ≥3/4 且 Begin 误吸 ≤1；OTHER ≥3/4 且 EMOTION 误吸 ≤1；软 BOUNDARY ≥3/4。  
- JSON：`/tmp/ft-l0-lab/intent-diag-*.json`；须复制到 `~/Library/Application Support/Focus Tiger/lab/`（`/tmp` 重启会清）。

---

## 明确不做

| 项 | |
|---|---|
| 改 `_onSend` / 默认 GGUF / E′ prompt | 禁止 |
| 为 A14/A15/D7 加生产正则 | 已否决 |
| 实现 FORGET 双命中 | 另口令 |
| `FT_INTENT_HOLDOUT=1` 与 TIER2 同跑 | 禁止混跑 |

---

## 冲突扫描

| 轴 | 对照 |
|---|---|
| **强度** | 实验室探针 · 无产品 UI |
| **人设** | 禁止 Yin 口吻泄漏（既有 `yinVoiceLeaks`） |
| **职责** | 不接 Share；与 CI-00/02/03 合同对齐，不发明 `query_practice_regularity` |

无用户路径。
