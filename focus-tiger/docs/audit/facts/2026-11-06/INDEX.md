# 第 0 轮事实底稿 — 2026-11-06

- **基准**：[`AUDIT_BASELINE.md`](../../AUDIT_BASELINE.md) v1.1 §9
- **取证日期文件夹**：与 v1.1 定稿日一致，使用 **`2026-11-06`**
- **环境（取证时）**：仓库根 `/Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001`，`focus-tiger`；未跑桌面/Electron 冷启动与内存（见 `PERF_NOT_RUN.md`）
- **纳入 develop**：#1581 已合并（基准包）；本目录经**跟进 PR**入库（非 #1581 追加 commit）

## 本目录文件

| 文件 | 对应 §9 条 |
|------|-------------|
| `NETWORK_AND_CONSENT_CROSSCHECK.md` | (1)(5) 网络路径清单 + 与同意/披露文案的对照（静态代码级） |
| `BACKUP_RESTORE_WALKTHROUGH.md` | (2) 备份/恢复可恢复性（脚本 + 文档摘录） |
| `licenses-focus-tiger-prod.json` / `licenses-desktop-prod.json` | (3) 依赖许可证（`license-checker --production`） |
| `npm-audit-focus-tiger.json` / `npm-audit-desktop.json` | (3) `npm audit` 原始输出（V3 输入） |
| `SECRET_SCAN_HEURISTIC.md` | (4) 工作副本 + `git log -G` 启发式扫描（**非** gitleaks） |
| `crisis-related-unit-tests.log` | (6) 危机相关自动化测试运行摘录 |
| `PERF_NOT_RUN.md` | (7) 桌面练习壳性能未测说明 |
| `MARKETING_SITE_NOT_RUN.md` | (7) 可选 Lighthouse/axe — 本轮未跑 |

## 执行的命令（可复现）

```bash
cd focus-tiger
node scripts/audit-local-backup-coverage.js
npx --yes license-checker --production --json > docs/audit/facts/2026-11-06/licenses-focus-tiger-prod.json
(cd desktop && npx --yes license-checker --production --json > ../docs/audit/facts/2026-11-06/licenses-desktop-prod.json)
npm audit --json > docs/audit/facts/2026-11-06/npm-audit-focus-tiger.json
(cd desktop && npm audit --json > ../docs/audit/facts/2026-11-06/npm-audit-desktop.json)
node --test src/core/reflectionCompanionValidation.test.js src/core/helpCenterAskSearch.test.js src/core/systemTtsBridge.test.js \
  2>&1 | tee docs/audit/facts/2026-11-06/crisis-related-unit-tests.log
```

## 摘要（供 B5 / B6 引用）

- **默认云 API 基址**：`src/core/cloudApiClient.js` · `DEFAULT_CLOUD_API_BASE_URL` = `https://focus-tiger-cloud.ihiro.workers.dev`
- **本地备份覆盖脚本**（develop 取证）：`audit-local-backup-coverage` → 31 export keys; 99 reset keys
- **启发式密钥历史搜索**：见 `SECRET_SCAN_HEURISTIC.md`
