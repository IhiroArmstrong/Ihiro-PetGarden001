# tracker fragment · fix/l0-gguf-resume

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 备注 | 日期 |
|---|---|---|---|---|---|---|---|---|
| 桌面 GGUF 断点续传 | 仅后端 | 仅单元测试覆盖 | 无产品 UI。`ensureGgufDownloaded`：`.part` + `.meta.json` + HTTP Range；同 URL 最多 5 次、间隔 2s…32s；换镜像不删兼容 `.part`；源回 200 而非 206 时保留半截。完整条件 = 字节数等于 Content-Length（禁止再用 400MB 下限把 4B 残包当完成）。自动化：`desktopCompanionL0Download.test.js`。人工：系统终端重跑 4B 实验室脚本，确认断线后能从已有 `.part` 续下。 | 2026-08-23 系统终端 `FT_LAB_ONLY=4b node /tmp/ft-l0-qwen3-4b-lab.mjs`：进度从 2113 MB/2497 续到 2497，gguf 2497280960 `downloaded=true`。同一次跑 L0 probe 与 7 问回复均为 `!!!!…`（约 48 token），TTFT 3065ms 未过 3s 门；不据此关单、不锁 4B。 | — | 续传本条不改代码。4B 乱码另切片，未点名模块前不动 companion。 | `l0Download.js` · 不锁 4B · 不接 L1 面板 | 2026-08-23 |
