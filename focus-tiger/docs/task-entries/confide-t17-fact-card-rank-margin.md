---
id: confide-t17-fact-card-rank-margin
kind: feature
status: 实现中 · T17 · 判定一刀
updated: 2026-10-18
---

T17：事实卡近邻门在 0.80 与 0.62 之间增加「同形状轴排名第一 + 领先余量 ≥0.05 + 语义产品问确认」放行；不调 0.80 常数。验收：`node --test src/core/confide/confideGoldenScriptV1.test.js` 英文 60 句；无卡英文句 0 误接（手测/黄金脚本）。依赖 T15 四批英文占比行（#1338）。
