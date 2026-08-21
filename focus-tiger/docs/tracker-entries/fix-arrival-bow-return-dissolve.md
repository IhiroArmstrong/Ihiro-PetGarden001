# fix/arrival-bow-return-dissolve · 2026-08-21

| Arrival Choose 鞠躬回落暖幕淡出 | UI可见 | 待人工测试 | **主路径**：`http://127.0.0.1:5173/?product=1` Sit → Arrival → Choose 任选 → Yin 鞠躬结束后回 Idle / Companion：**约 1s 叠化**，暖幕随角色一起淡、不得闪一下。**对照**：`?product=1&tasteLayer=0` 同一条鞠躬回落也应 1s、不闪。**回流**：Rise 后再走一遍 Arrival Choose。**邻接**：Honesty check-in 鞠躬后叠化仍须正常（#376 用户已书面 OK，勿回退）。自动化：`LightProgression.test.js` 锁 `clearArrivalAtmosphere({ animate:true, durationMs:1000 })` 有 1000ms opacity transition（**不**锁像素）。 | — | — | — | `http://127.0.0.1:5173/?product=1` · Sit → Choose | 2026-08-21 |
