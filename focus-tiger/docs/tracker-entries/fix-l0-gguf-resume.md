# tracker fragment · fix/l0-gguf-resume

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 备注 | 日期 |
|---|---|---|---|---|---|---|---|---|
| 桌面 GGUF 断点续传 | 仅后端 | 仅单元测试覆盖 | 无产品 UI。`ensureGgufDownloaded`：`.part` + `.meta.json` + HTTP Range；同 URL 最多 5 次、间隔 2s…32s；换镜像不删兼容 `.part`；源回 200 而非 206 时保留半截。完整条件 = 字节数等于 Content-Length（禁止再用 400MB 下限把 4B 残包当完成）。自动化：`desktopCompanionL0Download.test.js`。人工：系统终端重跑 4B 实验室脚本，确认断线后能从已有 `.part` 续下。 | — | — | — | `l0Download.js` · 不锁 4B · 不接 L1 面板 | 2026-08-23 |
