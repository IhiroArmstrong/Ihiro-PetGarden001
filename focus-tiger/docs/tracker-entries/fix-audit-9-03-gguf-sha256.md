# tracker fragment · fix/audit-9-03-gguf-sha256

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 备注 | 日期 |
|---|---|---|---|---|---|---|---|---|
| 9-03 本地模型 GGUF SHA-256 校验 | 纯后端 | 仅单元测试覆盖 | **无日常 UI。** 单测 `l0GgufSha256.test.js` · `desktopCompanionL0Download.test.js`。可选：本机已有完整 GGUF 时开 Confide，首次 ensure 应通过校验不重下。篡改本地文件应抛 `model_sha256_mismatch`。 | B5 9-03 / B6 10-08 | — | audit-fix-9-03 | `fix/audit-9-03-gguf-sha256` | 2026-11-07 |
