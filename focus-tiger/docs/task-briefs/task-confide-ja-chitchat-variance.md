# Task Brief · 日语 Confide 闲聊：首轮生成质量

**Issue**：[#774](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/774)  
**Epic**：#639 Confide  
**口令**：统计阶段用 QA 树终端实验室脚本，**不要**在 Agent Chat 里连跑 10–20 次生成。生产改路由须新 Chat **「开工」** 且须你书面同意加规则（PO 曾否决残差语用扩规则）。

## 不做

- 换默认 GGUF
- 把 `confidePracticeFacts` 当本单根因
- 为「烦躁 / 草莓」（本轮用户标还可以）加规则
- 云端危机命中率报警（隐私；另见 ISSUE_LEDGER 技术债）
- 再跑 `companion:ja-chitchat-variance`（已跑过；贪婪解码下 15/15 完全相同，无新信息）

## 统计结论（已完成 · 2026-09-16）

1. **空历史探针** `FT_CHITCHAT_RUNS=15 npm run companion:ja-chitchat-variance`：5/5 差样本 × 15 次，逐字完全相同 → **非方差**，是确定性首轮 generate 质量。
2. **同会话连发** `FT_CHITCHAT_REPEATS=3 npm run companion:ja-chitchat-session-repeat`：首轮 generate → 第 2 次起 fallback-02 → 第 3 次 fallback-01；去重/回落与产品 `_l2Turns` 一致。**非**去重机制故障。
3. **根因**：首轮 L3 generate 在 5 类问句上确定性跑题；同句再问时产品表现为「换了一种说法」，实为去重后语料链。

## 待拍板（修复方向）

- 规则桶 / 生成质量改进仅覆盖差样本集，须书面同意。
- 禁止用「方差 vs 回归」二分继续套本单——方差支已排除。

## 验收

#774 正文「验收」三条。
