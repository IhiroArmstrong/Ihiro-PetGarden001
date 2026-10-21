---
ledger: Confide 日语无语言闸，语义危机层对假名 fail-open，未测委婉说法可进情绪桶或生成
kind: progress
status: 跟进中
updated: 2026-10-21
---

政策已锁：日语倾诉选「暂未开放（过安全后提示）」。文字不强制 Hi Yin。

登记 **T35**（矩阵，P1）· **T36**（运行时，P2，待冻结例外点头）· **T37**（静态短答，随 T35）。

主干复核（`origin/develop` `09f11959`）：

1. `looksLikeJapaneseConfideText` 为真时语义危机层不跑，保留字面路由。  
2. 发送链无「暂未开放」语言闸。  
3. `FT_CONFIDE_HELP_ENTRY` 默认 off。

本旁支只落文档 + Brief，不改 `src/`。
