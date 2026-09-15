# Task Brief · 日语 Confide 闲聊：方差统计后再改

**Issue**：[#774](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/774)  
**Epic**：#639 Confide  
**口令**：统计阶段用 QA 树终端实验室脚本，**不要**在 Agent Chat 里连跑 10–20 次生成。生产改路由须新 Chat **「开工」** 且须你书面同意加规则（PO 曾否决残差语用扩规则）。

## 不做

- 换默认 GGUF
- 把 `confidePracticeFacts` 当本单根因
- 为「烦躁 / 草莓」（本轮用户标还可以）加规则
- 云端危机命中率报警（隐私；另见 ISSUE_LEDGER 技术债）

## 做（顺序）

1. 按 `LAB_SCRIPT_CONVENTIONS.md` 对 #774 差样本集同一版本重复采样 10–20 次/句，产出 `/tmp/ft-l0-lab/compare-*.json`（或同等机器 JSON），统计：规则桶 / fallback-02 / L3 generate / 贴题。
2. 结论：方差 vs 回归。回归才查 sanitize / 语料 / 采样 git。
3. 加规则仅覆盖差样本集，且须另拍板。

## 验收

#774 正文「验收」三条。
