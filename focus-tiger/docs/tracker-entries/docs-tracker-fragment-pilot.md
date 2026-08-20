# docs/tracker-fragment-pilot · 2026-08-20

| TEST_TRACKER 碎片试点（tracker-entries + assemble-tracker） | 纯后端 | 仅单元测试覆盖 | `node --test scripts/assemble-tracker.test.js`：文件名 kebab-case；合法行写入机器块；非法尾列失败；与主表功能名重复须红。`npm run docs:check` 含 `tracker:check`（**不**要求功能 PR 同步机器块）。新增行走 `docs/tracker-entries/<branch>.md`。 | — | — | — | `docs/tracker-entries/` · `scripts/assemble-tracker.js` | 2026-08-20 |
