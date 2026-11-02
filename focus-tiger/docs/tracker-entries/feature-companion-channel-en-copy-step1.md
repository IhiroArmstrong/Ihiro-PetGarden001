# feature/companion-channel-en-copy-step1

| 四通道英语句库第 1–2 步（换句开关关） | 纯后端 + 文案源 | 仅单元测试覆盖 | **本条验收的是**：英语 40 句进 `content/companion-channel-copy/en.json`（AI 审稿字段 + 哈希）、契约检查扫该文件、5 条近邻放行样本、recent-id 进删除白名单、取句器在 `overlayLive: false` 时仍返回现网冻表。**不代表**屏幕已换句，**不代表**人审完成，**不代表**已部署。对照：`?tasteLayer=0` 与现网一致。禁止把 AI 审稿写成母语人审。自动化：`check:companion-contract` · `companionChannelCopyPicker.test.js`。 | — | — | — | `content/companion-channel-copy/en.json` | 2026-11-02 |
