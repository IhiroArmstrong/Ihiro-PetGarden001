# Confide 语义影子 · 上一轮上下文实验（Prompt 6）

> **状态（2026-09-20）**：影子模式接线已落地；**不改**用户看到的回复。  
> **不是**持久化会话摘要模块。Web / 窄屏 **无** 内存历史，本轮不覆盖。

## 覆盖缺口

| 路径 | `_l2Turns` | 本轮行为 |
|---|---|---|
| Electron 宽屏 Confide | 有（面板开着；关面板清空） | 有上一轮时，影子分类 **再 embed 一次**「上一轮 user+yin + 当前句」 |
| Web / 窄屏 | 无可用历史给影子 | 不跑桌面影子 IPC（与 Stage 1 相同） |

## 日志怎么读

同一行 `kind: semantic_shadow_classify`：

- `text` / `semanticCoarse` / `scoreA` / `scoreB` = **只看当前句**（原 Stage 1）
- `hadPriorTurn` / `contextualText` / `semanticCoarseWithPrior` / `scoreAWithPrior` / `scoreBWithPrior` = **看了上一轮**

第一轮或没有完整上一对 user+yin 时：`hadPriorTurn: false`，with-prior 字段为 `null`。

## 对照样本（机制，不是 Qwen 实测）

单测用合成向量锁住「输入变了、桶可以变」；**不能**代替本机 embedding 模型的真实打分。

| id | 上一轮用户句 | 本轮 | 只看当前句（合成） | 看了上一轮（合成） | 用意 |
|---|---|---|---|---|---|
| F1 | 今天什么都不想做，心里很闷 | 好累 | gray（A/B 同分） | emotional | 架构师「诉苦后说好累」 |
| F2 | 累积了多久 | 好累 | gray | functional | 轻量拼接也可能把功能句上下文带偏——对照污染 |
| F3 | （无） | 好累 | gray | 不跑第二路 | 第一轮无历史 |

## 本机真实对比（须 Electron + embedding 模型）

1. 宽屏 Confide 先发一句情绪独白，再发「好累」。
2. 打开 `userData/companion-l2/turns.jsonl` 最近一条 `semantic_shadow_classify`。
3. 看 `semanticCoarse` vs `semanticCoarseWithPrior` 是否不同、后者是否更像 `emotional`。
4. 再测「功能句 → 好累」，看 with-prior 会不会误拉去 `functional`。

**本轮不声称**真实模型已经救回「好累」。单测只证明对照日志和拼接逻辑成立。

## 已知风险（轻量实验）

把上一轮原文拼进当前句，可能让明确的功能短句被上一轮情绪（或反过来）带偏。这正是对照日志要回答的问题，不是本轮要修的生产路由。
