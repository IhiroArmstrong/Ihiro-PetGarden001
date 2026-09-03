# Task Brief · Confide 句库 / 模板 overlay

> **状态（2026-09-03）**：口令已给 · **#548 已合**（`/api/confide-copy` 并进品味层预取）。父概念 `ANTI_PLAGIARISM_LAYER.md` §5 序 3。在场 EN 分叉 **#550**。boundary EN 审定句见 `task-confide-boundary-prod-fork.md`（生产须「部署」）。  
> **硬边界**：只 overlay **已审回复句正文**。路由、E′ 正则、CI 白名单、Tool Registry、Qwen **留下本机**。

## 一句话

有网时非阻塞拉一份与 locale 键对齐的 Confide 模板表；Send 当下只用内存/本地冻结句。没网 = 今天的 corpus / locale。

## 已拍板

1. 可 overlay：情绪桶短句、boundary / companion_presence / 诚实空态等 **模板键**（须与现网 locale key 1:1）。  
2. **不可** overlay：intent 正则、优先级、Tool handler、GGUF、L3 system prompt（prompt 另会）。  
3. **禁止**把用户本轮原文或 Memory 摘要上传来「换一句」。  
4. 与 YPE Pack、Quiet Line 池 **分端点或分字段**；禁止写进练习备份。  
5. `?tasteLayer=0` 或未来独立 kill-switch：无 overlay 时行为 = 现网。

## 冲突扫描

对照 AE Confide（边界 / 陪伴在场 / CI / L3）、Gate 0.D、用户体验优先。

| 轴 | 判断 |
|---|---|
| **a. 强度** | Send 不得等网；0–1 秒 `data-source` 不变 |
| **b. 语气** | 换字不得改成教练或给边界句贴「I am curious」 |
| **c. 职责** | ≠ 口头白名单扩权；≠ Operating |

**疑点（已收口）**：换句可能让人工 TRACKER 金句对不上。运行时须：overlay 只替换 **value**、**key / data-source 契约单测锁现网 id**。

## 点击反馈

点 Share：0–1 秒内发送钮 disabled + 回复区出现；句子来源仍是模板或 generate，不出现「正在下云端句库」。

## 后台网络三问（运行时）

1. **Q1**：Idle Confide 未开时预取须让开 Arrival/Honesty/精灵预加载；建议并进品味层预取槽，或首次打开面板后、首句 Send 前的空闲拉取（不得挡淡入）。  
2. **Q2**：模板 JSON 相同跳过写盘。  
3. **Q3**：慢网不得让 Idle 呼吸或卡淡入掉帧；失败用本地句。

## 不做

- 把 E′ / CI 正则上云  
- 默认上传 turns.jsonl  
- 与 Quiet Line / YPE V2 同一 PR
