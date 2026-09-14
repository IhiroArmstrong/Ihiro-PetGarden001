# fix/flower-welcome-diag-log

| #727 合入后仍无吹花（临时日志取证，不改逻辑） | UI/交互 | 待人工测试 | **不要用 5173 QA 树测本支。** 本旁支 Vite（约 5174）`?product=1`。指纹：`fetch('/src/main.js').then(r=>r.text()).then(t=>console.log('FT-DIAG-727 已加载', t.includes('[FT-DIAG-727]')))` 须 `true`。打开 Console → Filter 填 `FT-DIAG-727` → 清三 key 后 `location.reload()`。把带 `site` 的几行（至少 `welcome-boot`、`flowerBubble.onHidden`、`ensureIdleBaselineAfterWelcome`、`maybeOfferColdStartGoalCard`）整段复制或截图发回。**不要**关 Console 过滤后再说「没日志」。 | 2026-09-12：#727 5173 复测失败——完全无吹花，四选后仅毛玻璃后 Yin。分析师：先打三项输入日志，禁止猜第五版改法。 | — | 只取证，不标已修复 | 旁支 Vite，勿抢 QA 5173 | 2026-09-12 |
