---
id: confide-jsonl-gates-2026-10-12
kind: note
status: 10/12 书面 defer（Stage 2b / with-prior live / KB 第二轮均不开）
updated: 2026-10-12
---

# 2026-10-12 Confide jsonl 门闩复核

数据文件（开发壳）：`~/Library/Application Support/focus-tiger-desktop/companion-l2/turns.jsonl`  
打包壳路径 `Focus Tiger/…` 本机不存在。脚本默认先读 `focus-tiger-desktop`。

## 门闩（均不开）

| 线 | 结论 | 依据 |
|---|---|---|
| Stage 2b | **defer** | 官方产品路径 M 仍远低于 25。代理 M=14 不当官方。本晚 Electron 四句里 live 仅 1 条 gray∩functional。 |
| with-prior live | **defer** | 新 jsonl `eligible=3`（naiveHarm=1，ruleHarm=0）。不得与 9/26 的 eligible=45 比较：影子行只留 7 天，旧行已被 prune。 |
| KB 第二轮 probe | **defer** | `kb_retrieval_miss` **0 行**。原因不是样本不够聊天，而是 renderer 调 `companion.appendTurnLog`，preload / IPC **没有这个方法**。另：K-4 已去掉原文，probe 脚本要 `row.text`，接上 IPC 后仍无法从 hash 造问法。禁止头脑风暴补 probe。 |

## 影子 / live 写入（地面真相）

接线**仍在**：`semanticShadowClassify` / `semanticLiveClassify` 经 preload IPC 落到 `l1Runtime._appendTurnLog`。  
本晚 00:49–00:55（UTC 10-11 16:49）四句关单已写出 live=4（failOpen=1 `embed_not_ready`，semanticOk=3）、shadow N=4 D=1。  
更早审计看到 0，是 7 天滚动清理删掉 9 月影子行，加上当时还没有今晚这 8 行——**不是 Stage 2 没在跑**。

## 唯一仍断的写入

`kb_retrieval_miss` 与危机改写影子：`ConfideToYinUI` 调用 `this._companion.appendTurnLog`，`desktop/preload.js` 未暴露，`l1Ipc.js` 无 handler。今晚「观察翼是什么」已走诚实空态，jsonl 仍无 miss 行。

## 人工关单四句（用户 2026-10-12 书面）

- 「观察翼是什么」→ `Yin doesn't keep a manual for that...`（诚实空态，符合）
- 「怎么开始坐」→ `Tap Sit with Yin...`（知识库短答，符合）
- 「今天想去骑车」→ `A desire to ride a bike.`（闲聊/观察，用户：基本可以）
- 「有点烦」→ `a feeling of irritation.`（情绪观察句，不是说教）

不据此关 TEST_TRACKER 主表行（须用户明示关单）。
