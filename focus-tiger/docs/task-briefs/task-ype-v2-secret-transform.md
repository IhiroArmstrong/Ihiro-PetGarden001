# Task Brief · YPE V2 秘密变换 + algorithmVersion

> **状态（2026-09-02）**：口令已给 · **本 Brief 无运行时**。父概念 `ANTI_PLAGIARISM_LAYER.md` §5 序 2。  
> **与 V1 的关系**：V1 = 校验五键 + **回声**用户已选 `companionStyle` + `patternInsights=[]`。V2 = **同一五键上的闭包变换**（非空、白名单 insight）+ 服务器只存的 `algorithmVersion`。  
> **是同一件事**：把 YPE 从「回声选档」做成真正的秘密变换 = 本 Brief。`algorithmVersion` **并进本刀**，禁止单独空 bump。

交叉：`task-l2-personalization-algorithm.md`（V1 仍有效，直至本刀改 Worker / Pack 校验）。

## 一句话

云端用已同意的五键算出一小份 Pack：档位仍回声用户选择；**允许**白名单 `patternInsights`；变换公式与 `algorithmVersion` **不下发**。没网 / 样本不足 / 关同意 → 与今天一样走 L0/L1。

## 已拍板（硬闸）

1. **禁止** Confide 原文、Memory 摘要、Whisper、AF 标签、邮箱进入本变换。  
2. **禁止**用 `focus_return_rate` / `reflection_frequency` / `practice_day_count_window` **改** `companionStyle`（完成率当教练）。  
3. `intervention_preference` 仍只作输入，**禁止**出现在 Pack。  
4. Pack **禁止** `rankHint` / `memoryHints` / 开口指令。  
5. `algorithmVersion` 只写 KV 行，**不**进 Pack；Pack `schemaVersion` 仍为 1（形状不变）。本机碰到未知 Pack 键 → 整包丢。  
6. 灰度：窗口完成次数 &lt;10 → 不签发 overlay（与 V1 同）。

## V2 闭包（冻结表 · 运行时不得发明新 id）

输入：V1 五键。输出：`companionStyle` = 合法选档否则 `default`。

`patternInsights` 仅允许下列 **token**（字符串；顺序不含义；未知 token 客户端丢弃该条、保留其余合法条；全非法则当空数组）：

| token | 何时写入（闭包） | 本地允许怎么用（本刀可只缓存、暂不消费） |
|---|---|---|
| `returns_often` | `focus_return_rate >= 0.6` | 观察式；**禁止**改成 quiet/warm；**禁止**评判「不够专注」 |
| `reflects_often` | `reflection_frequency >= 0.4` | 同上 |

禁止第三 token，直至另会。空数组合法（两个阈值都未过）。

服务器记录 `algorithmVersion: 2`。改阈值或增 token → 升 `algorithmVersion`，**另口令**；客户端不读该字段。

## 冲突扫描

对照 AE Confide / AG Memory / AF Presence / 品味层 / Y Whisper。

| 轴 | 结论 |
|---|---|
| **a. 强度** | 仍异步 ingest；禁止每次 Sit/开口等服务器 |
| **b. 语气** | insight 是节奏观察，不是诊断/人格类型 |
| **c. 职责** | ≠ 品味层权重；≠ Memory ranking；≠ Speak probability |

**无冲突**，前提是运行时 **先改** `validatePersonalizationStatePack`（V1 非空 insight 会 `non-empty-cloud-insights` 整包丢）。

## 点击反馈

不涉及可点击交互。Privacy 第四条路径不变。

## 后台网络

ingest 已接线。本刀只改 **签发函数 + 客户端校验**。若新增请求须重答三问；仅改响应体 → PR 写清 Q2（相同 Pack JSON 跳过写盘）。

## 不做

- 训练 / LoRA / 心理诊断  
- 把 insight 打进 Confide L3 prompt（另口令）  
- Quiet Line / Confide 句 overlay  
- 把五键写入 `/api/emotion-weight`
