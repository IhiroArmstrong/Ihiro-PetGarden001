# Task Brief · 留痕失败窗口保持 / 云端三态

> **状态（2026-11-21）**：**已锁** · 口令「立刻开工」+「如有 Brief 无需点头」。  
> **类**：**B**（选句失败可见句；不关窗）。  
> **不是**：强制失败关窗、自定义痕迹、Worker 新 action、玻璃工厂。

## 0. 大白话

点「留下痕迹」选句后如果云端没收下，窗口本来就会停着，但只说一句笼统「暂时没能留下」。这一刀在等待时写「正在留下」，失败时按原因写清（不在圈里、云端本子不可用、超时、太密、云未就绪），窗口仍开着，可以再选。

## 1. 目标

1. 选句提交 **挂起**：`aria-busy` + 全钮 disabled + 状态行 pending 文案。
2. **成功**：仍卸 picker（无成功句，与现网一致）。
3. **失败**：picker 仍在；`postFocusCircleWitness` 的 `reason` 映射到切片文案；未知原因仍用原 `FOCUS_CIRCLE_WITNESS_SUBMIT_ERROR`。
4. 客户端把 Worker `{ error }`（如 `not_member`、`kv_missing`、`bad_phrase`）写进 `result.reason`，不再一律 `network`。

## 2. 非目标

- 失败不自动关窗（现网即如此；本刀只补原因句）。
- 不改短语池、不改 ≥60s 门槛、不改 overlay 仲裁。
- 不部署 Worker（现网已有 error 码）。

## 3. 冲突扫描

相邻：场景 AH / 刀 2c、#709 选句可点、持久化三态。

| 轴 | 判断 |
|---|---|
| **强度** | 失败仍停在选句；多一句说明。不新开 overlay。 |
| **语气** | 观察式，不责备用户。 |
| **职责** | 只解释已有云端失败码。 |

无未决冲突。

## 共用机制核对

- **overlayBusy / HUD 呼吸**：不新增 overlay。仍用既有 picker。  
- **结论**：不改 overlayBusy 消费者。  
- **后台网络**：仅用户点选句后的既有 `witness_leave` / `witness_respond`。

## 变体矩阵

| 变体 | 入口 / 前置 | 预期 | 自动化 |
|---|---|---|---|
| HTTP 403 `not_member` | 选句 | 不在圈里的句子；picker 仍开 | 单测 map |
| HTTP 500 `kv_missing` | 选句 | 云端本子不可用；picker 仍开 | 单测 map |
| 408 / timeout | 选句 | 超时句 | 已有 + locale 键 |
| 429 | 选句 | 太密句 | locale 键 |
| 未知 / network | 选句 | 原笼统句 | 单测 fallback |
| 成功 | 选句 | 卸 picker | 现网 |

## 点击反馈（0–1 秒）

| 控件 | 0–1 秒 | 持久化 |
|---|---|---|
| 选一句 | disabled + pending 行 | 云端 traces KV |
| 失败 | 原因句 + 钮可再点 | 不关窗 |

## 边缘状态

| 边缘 | 预期 |
|---|---|
| 重复点同一句 | `_submitting` 挡住二次发送 |
| 已回应 | `already_responded` 专句 |
| 取消 | 仍关 picker，与现网一致 |
