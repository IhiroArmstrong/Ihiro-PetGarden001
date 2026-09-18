# Task Brief · 日语 Confide 闲聊：方差统计后再改

> **状态（2026-09-18）**：**Brief 已发起 · Electron 5 句连发探针已开工** · 空会话统计已完成 · **下一步 = 你/Electron 复测后决定是否加规则**

**Issue**：[#774](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/774)  
**Epic**：#639 Confide  
**口令**：统计阶段用 QA 树终端实验室脚本，**不要**在 Agent Chat 里连跑 10–20 次生成。生产改路由须新 Chat **「开工」** 且须你书面同意加规则（PO 曾否决残差语用扩规则）。

## 不做

- 换默认 GGUF
- 把 `confidePracticeFacts` 当本单根因
- 为「烦躁 / 草莓」（本轮用户标还可以）加规则
- 云端危机命中率报警（隐私；另见 ISSUE_LEDGER 技术债）

## 做（顺序）

1. ~~**空历史方差**~~ **已完成**（2026-09-16 · `compare-1789489932173.json` · 5×15 · `FT_CHITCHAT_RUNS=15 npm run companion:ja-chitchat-variance`）。路由 100% generate；贪婪解码下零波动。
2. **同会话连发**（**Electron 探针已加** · 2026-09-19）：`cd focus-tiger/desktop && FT_CHITCHAT_REPEATS=3 npm run companion:ja-chitchat-electron-session-repeat`；实验室对照仍用 `FT_CHITCHAT_REPEATS=3 npm run companion:ja-chitchat-session-repeat`。**2026-09-19 首轮 Electron 结果（未写 JSON，进程超时前 stderr）**：同句第 1–2 次多为 `generate`；第 3 次起或长会话后见 `corpus/fallback`（如 ja-chitchat-03/04 repeat 2）。**支持**「sanitize 历史去重 → 语料回落」假设，**仍须**你本地跑完 5×3 落盘 JSON 再定规则桶。
3. 加规则仅覆盖差样本集，且须另拍板。**当前先不加**；等同会话连发 / Electron 结果后再决定规则要堵住「首次 generate 差」还是连「去重回落也差」。

## 验收

#774 正文「验收」三条。
