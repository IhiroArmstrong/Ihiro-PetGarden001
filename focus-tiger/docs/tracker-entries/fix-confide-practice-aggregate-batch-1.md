# fix-confide-practice-aggregate-batch-1

| Confide practice_facts · Batch 1 aggregate read | UI可见 | 待人工测试 | **这是修复，不是新功能**：此前 Confide 总时长/对比优先读 Journey Log（仅 Sit/Breath 留痕），Honesty 等补登练习常被漏算；接入 aggregate 后数字**可能高于**旧版，属预期修复。**Electron 宽屏** `desktop:dev`：① 仅做 Honesty 30min（Journey 空）→ 问 `How long have I practiced?` → `practice_facts` 须含 30 分钟；② Journey 有 Sit 22min + Honesty 使 lotus 累计更高 → 答复须跟 lotus/练习日一致，**不得**只报 Journey 22min。**回归**：危机句仍 sad；天气仍 generate。自动化：`confidePracticeFacts.test.js`。 | — | — | `desktop:dev` · Confide · Journey log 手算对照 | 2026-09-09 |
