# tracker-entries · fix-practice-aggregate-batch-2

| Confide practice aggregate · Batch 2 badges + mustard score | UI可见 | 待人工测试 | **修复**：徽章与芥子须弥印 score 现读 aggregate（lotus 真终身分钟 + practice-days 日数），不再把 90 天窗口分钟当「终身」。**长练用户**可能突然多出徽章或芥子解锁——属预期修复。**测**：① QA seed 或手造 lotus 分钟远高于 practice-days 窗口和 → Idle 旁徽章数 / 芥子菜单解锁与 aggregate 一致；② 新用户仅 1–2 天练习 → 行为与改前相近。**自动化**：`practiceAggregateBatch2.test.js` + `mustardSeedSeal.test.js`。 | — | — | `desktop:dev` · Idle 徽章 · ⋯ 芥子须弥 | 2026-09-09 |
