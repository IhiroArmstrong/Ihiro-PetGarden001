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

1. ~~按 `LAB_SCRIPT_CONVENTIONS.md` 对 #774 差样本集同一版本重复采样 10–20 次/句~~ **已完成**（2026-09-16 · `compare-1789489932173.json` · 5×15）。路由 100% generate；贪婪解码下零波动。
2. 结论：**不是采样方差**（产品默认 temperature=0，与探针同一调用）。不必先挖 sanitize/语料/采样的近期 git。田野「不同答案」**疑似** sanitize 历史去重 → 语料回落，**待 Electron 同一会话 5 句连发验证**后再当根因。
3. 加规则仅覆盖差样本集，且须另拍板。**当前先不加**；等步骤 2 的 Electron 连发结果，再决定规则要堵住「首次 generate 差」还是连「去重回落也差」。

## 验收

#774 正文「验收」三条。
