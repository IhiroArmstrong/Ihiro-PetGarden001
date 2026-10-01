# TEST_TRACKER 碎片 · docs/confide-embedding-work-gate

| Confide companion `getLlama` 一层工作闸 | 纯后端 | 仅单元测试覆盖 | 本条验收的是互斥契约（重叠持有失败、聊天插队、聊天等待超时不永久占闸），**不代表** Electron 里「ok 后再发同句一定不卡」。单测：`desktop/companion/l1LlamaWorkGate.test.js`（`node --test`，不加载原生 addon）。Web Safari 无 llama。可选对照实验见 Brief，不挡合入。 | — | — | 不改 Stage 2；不加加载提示；不预加载 | `focus-tiger/desktop/companion/l1LlamaWorkGate.js` | 2026-09-22 |
