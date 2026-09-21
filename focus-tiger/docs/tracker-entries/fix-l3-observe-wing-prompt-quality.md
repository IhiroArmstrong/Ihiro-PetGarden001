# fix/l3-observe-wing-prompt-quality

| L3 观察翼 prompt 质量 · e-motions ↔ e-mind-away 撞车（Prompt 15） | 纯后端/桌面 | 待人工测试 | **Electron 宽屏 Confide ready。** ① `I'm here, but my mind really isn't.` → generate，答句须贴「注意力不在」而非 autopilot 标签。② `I feel like I'm just going through the motions today.` → generate，答句须贴「走过场/autopilot」，**禁止**与①同句（如两句都是 `Drifting attention.`）。**单测**：`node --test src/core/l3ObserveShuffleGate.test.js`。实验室（系统终端）：`npm run test:observe-shuffle-screen` → `e-motions` shuffle_hit。 | — | — | — | `l2Persona.js` · Brief §十四 · #823 | 2026-09-21 |
