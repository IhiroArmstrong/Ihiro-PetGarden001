# 密钥与凭据 — 启发式扫描（第 0 轮）

**工具**：未安装 gitleaks / trufflehog。使用 `git log -G"sk_live|BEGIN RSA PRIVATE KEY|AWS_SECRET|ghp_[A-Za-z0-9]{20,}" --oneline -i --all`。

## 结果

- 曾命中历史 commit（文档性文字说明「不得提交 sk_live_」等，非真实密钥）
- **不能**替代专业扫描器；B5 应建议 CI 接入 gitleaks 并保存脱敏报告

**禁止**在 findings 正文复述密钥片段。
