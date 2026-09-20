# Task Brief · 有利分歧制造机 · Stage 2 60 候选筛

> **状态（2026-09-21）**：已开工。候选 60 条在 `confideStage2ChallengeCandidates.js`；判定在 `confideFavorableDisagreementMill.js`。  
> **口令**：`cd focus-tiger/desktop && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 npm run companion:favorable-disagreement-mill`  
> **产物**：`/tmp/ft-l0-lab/favorable-disagreement-mill-*.csv` + `.json`（本机实验室，不进 Git）

## 判定（硬）

Favorable Disagreement = **Literal ≠ Golden AND Semantic = Golden**

机器勾 `is_favorable_disagreement=yes` 仍须 PO 在 `reviewer` 列确认。C 类是真实表达的人工变体，**不得**标 `source=real`。

## 三层计数

- Layer 1 Synthetic：A + C  
- Layer 2 Real：本池为 0；须另从聊天 CSV 人工确认 5–10  
- Layer 3 Adversarial：B（字面规则边界）

脚本**不得**输出「可以切 Stage 2」。

## 本机真向量筛选结果（2026-09-21）

池 60；机器 KEEP **45**（Literal=gray 且 Semantic=Golden）；DROP 15（全部 `semantic_not_golden`，字面无一已命中）。

| 层 | 机器有利分歧 |
|---|---|
| Synthetic（A+C） | 25 |
| Real | 0 |
| Adversarial（B） | 20 |
| Historical | 0 |

Literal baseline **0%** · Semantic accuracy **75%** · Real minimum：**FAIL**（本池无真实 CSV）。

CSV：`/tmp/ft-l0-lab/favorable-disagreement-mill-1789927700271.csv`（本机实验室，不进 Git）。

## 不做

- 不改现网正则 / `confideClassify`
- 不往 100 句冻表加句
- 不把机器 KEEP 当成已关单
