# fix-confide-append-turn-log

| Confide renderer appendTurnLog IPC（KB 未命中 / 危机影子） | 纯后端/逻辑 | 仅单元测试覆盖 | **本条验收的是** Electron 宽屏诚实空态后 `turns.jsonl` 新增 `kind:kb_retrieval_miss`（仅 hash，无原文）；危机改写候选同样能落盘。**不代表** Stage 2b 扩面或回复改变。单测：`confideRendererTurnLogAllowlist.test.js`（拒绝 `l3_generate` / 剥掉 `text`）· `desktopCompanionL1.test.js` preload/IPC。 | — | — | — | `desktop/preload.js` · `l1Ipc.js` · `l1Runtime.appendTurnLogFromRenderer` | 2026-10-12 |
