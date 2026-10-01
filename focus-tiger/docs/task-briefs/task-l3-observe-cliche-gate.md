# Task Brief · Prompt 13 · 观察翼陈词滥调守门 + 照抄 + 关心式问句

> **状态（2026-09-20）**：已开工。独白仍走观察翼 generate，不迁问答翼。  
> **代码**：`observeClicheExamples.js`（追加套话）· `observeClicheGate.js`（余弦）· `l2Sanitize.js`（`isHighOverlapWithUserLine`）· `l2Persona.js`（`L3_OBSERVE_CARING_QUESTION`）· `l1Runtime.generate`（embedding 已就绪才打分，最多重试 1 次）

## 默认阈值

`DEFAULT_OBSERVE_CLICHE_COSINE = 0.82`（可用 `FT_OBSERVE_CLICHE_COSINE` 覆盖）。理由：同句改写通常 >0.85；点出本句主题的观察应明显低于对「耳朵/你还好吗」银行的分数。

## 追加套话

肉测发现新夹克时，只往 `observeClicheExamples.js` 加一行，不必改守门逻辑。

## 安全

分类仍只看**当前用户这一句**。阿寅上一句是不是关心式问句，不改变 `safety_redirect` / `aggression_toward_others`。
