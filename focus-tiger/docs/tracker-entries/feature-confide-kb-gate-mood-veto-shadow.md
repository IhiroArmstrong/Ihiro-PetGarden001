# feature/confide-kb-gate-mood-veto-shadow

| Confide 产品闸情绪否决 · 第一段影子日志 + 实验室 | 仅单元测试覆盖 | 待人工测试 | 不改用户可见回复。单测 `node --test src/core/confide/confideKbMoodVeto.test.js`。实验室 `node desktop/scripts/l0-kb-mood-veto-lab.js`（真 embedding；结果在 `/tmp/ft-l0-lab/kb-mood-veto-lab-*.json`）。可选人工：桌面版倾诉发一句「我想抽烟」后看 `~/Library/Application Support/Focus Tiger/companion-l2/turns.jsonl` 末尾有 `kb_product_gate_shadow` 行且无原文。 | — | — | — | `l1KbProductGateShadowLog.js` · `l1SemanticShadowLog.js` · `task-confide-kb-gate-mood-veto.md` | 2026-10-13 |
