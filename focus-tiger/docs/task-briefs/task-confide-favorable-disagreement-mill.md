# Task Brief · 有利分歧制造机 · Stage 2 60 候选筛

> **状态（2026-09-21）**：已开工。候选 60 条在 `confideStage2ChallengeCandidates.js`；判定在 `confideFavorableDisagreementMill.js`。  
> **口令**：`cd focus-tiger/desktop && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 npm run companion:favorable-disagreement-mill`  
> **产物**：`/tmp/ft-l0-lab/favorable-disagreement-mill-*.csv` + `.json`（本机实验室，不进 Git）

## 判定（硬）

Favorable Disagreement = **Literal ≠ Golden AND Semantic = Golden**

机器勾 `is_favorable_disagreement=yes` 后，PO 已确认 45 条 mill KEEP（`reviewer=PO`）。Prompt 12 的 12 句 KEEP 另标 `historical`，**不得**算真实 CSV。C 类仍是合成。

## 三层计数

- Layer 1 Synthetic：A + C（PO 已认 25）
- Layer 2 Real：Electron 肉测问句进制造机（`confideStage2RealMeatCandidates.js`）；影子 CSV「我有点不高兴」已勾 yes
- Layer 3 Adversarial：B（PO 已认 20）
- Historical：Prompt 12 KEEP 12（分开加）

脚本**不得**输出「可以切 Stage 2」。

## 本机真向量筛选结果（2026-09-21）

池 60；机器 KEEP **45**（Literal=gray 且 Semantic=Golden）；DROP 15（全部 `semantic_not_golden`，字面无一已命中）。

| 层 | 机器有利分歧 |
|---|---|
| Synthetic（A+C） | 25 |
| Real | 0 |
| Adversarial（B） | 20 |
| Historical | 12（Prompt 12 KEEP，分开加） |

合计库存行 **61**（45 mill + 12 historical + 3 现网肉测 KEEP + 1 影子 CSV）。Real **4 / 5** 门槛仍 FAIL。`我有点不高兴` 现网字面已能打中情绪桶，所以制造机今日 DROP；影子日志那一行仍按你的勾选计真实有利分歧。

Literal baseline **0%** · Semantic accuracy **75%** · Real minimum：**FAIL**（本池无真实 CSV）。

CSV：`/tmp/ft-l0-lab/favorable-disagreement-mill-1789927700271.csv`（本机实验室，不进 Git）。

## 不做

- 不改现网正则 / `confideClassify`
- 不往 100 句冻表加句
- 不把 mill / historical KEEP 当成真实层，也不据此切 Stage 2
