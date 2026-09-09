# tracker fragment · docs/shared-mechanism-consumer-check

| 共用机制核对（Brief 结论句 · 扩现有登记） | 纯后端 | 仅单元测试覆盖 | 无 UI。Agent 写 Brief 触及 overlayBusy / HUD 呼吸 / 遮罩 dim 时须写出点名消费者的结论句（`COLLAB.md` 第七节），禁止纯打勾。清单：`SHARED_RESOURCES.md` §4.1–4.2、`Z_INDEX.md` Idle 常驻 chrome。不另起总册、不改运行时。自动化：无新单测（本 PR 文档）；后续 breath/dim 仍走既有 `ritualFlowHudWiring.test.js` / `overlayBackdrop.test.js`。 | — | — | — | `COLLAB.md` · `SHARED_RESOURCES.md` · `Z_INDEX.md` | 2026-09-09 |
