---
ledger: L3 generate 写入 turns.jsonl 时带用户原句，与语义危机日志（只存哈希和长度）不一致
kind: progress
status: 跟进中
updated: 2026-11-24
---

只读审计缺口 1。本支把 `l3_generate` 写盘前改成与语义危机日志同一口径：`queryHash` + `textLength`，去掉 `text`，`raw` 保持空。

未做：缺口 3（称呼加封闭命令）、缺口 2（帮助中心改写危机句）。
