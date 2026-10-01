# Task Brief · Prompt 12 · Stage 2 未修补同义变体加速样本

> **状态（2026-09-20）**：已开工。候选池在 `confideStage2SynonymCandidates.js`；筛选逻辑在 `confideStage2FavorableScreen.js`。**禁止**拿已修好的「累积了多久 / 忙啥 / 列出记忆」充数。  
> **口令**：`cd focus-tiger/desktop && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 npm run companion:stage2-synonym-screen`  
> **CSV**：`/tmp/ft-l0-lab/stage2-synonym-screen-*.csv`（列与 Prompt 8 影子分歧表相同；`favorable_disagreement` 留空给 PO）

## 提醒（硬）

这批加速样本用来凑 Stage 2「有利分歧」数量，**不能完全替代真实聊天 CSV**。真实 CSV 至少保留 **5–10** 条人工标注分歧，不能为了快而变成 0。

## 本机真向量筛选结果（2026-09-20）

池 20 条；**KEEP 12**（字面仍 gray/generate，语义已落到预期桶）；DROP 8（语义落 gray，不能充数）。

建议 PO 确认的 KEEP（`favorable_disagreement` 仍须你手填）：

| id | 句子 | 建议桶 |
|---|---|---|
| busy-03 | 最近都在捣鼓什么 | functional |
| busy-04 | what's eating up my hours lately | functional |
| busy-05 | where did all my time go this week | functional |
| show-01 | 这几天有来吗 | functional |
| show-03 | have I been coming by these days | functional |
| show-04 | did I drop in this week | functional |
| mem-01 | 把你记得的念一遍 | functional |
| mem-03 | dump your notes on me | functional |
| dur-02 | how much sitting have I clocked | functional |
| dur-03 | 这周我来了几回 | functional |
| emo-01 | 胸口像压了块石头 | emotional |
| emo-02 | 今天整个人是空的 | emotional |

CSV：`/tmp/ft-l0-lab/stage2-synonym-screen-1789883958100.csv`（本机实验室，不进 Git）。


- 不改任何现网正则 / `confideClassify` 分支
- 不往 100 句冻表加句
- 筛选结果只是建议，PO 逐条确认后才算数
