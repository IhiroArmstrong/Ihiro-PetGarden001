# feature/local-export-import-hide-cloud-backup（#480 已合 develop）

> 列约定与 `TEST_TRACKER.md` 主表一致：**类型** = `UI可见` / `纯文档` / `仅单元测试覆盖` 等；**状态** = `待人工测试`；**严重度 / 处理承诺** 无分级时填 `—`。**P0 人工顺序**：导入闭环 → 云备份无网络残留 → boot 不拉云 → 其余。

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 访问路径 | 日期 |
|---|---|---|---|---|---|---|---|---|
| 本地导入闭环（P0） | UI可见 | 待人工测试 | **`?product=1`**：有 Journey/练习日 → **?** → Privacy → **导出数据** → 保存 `.json` → DEV 清 **6 whitelist key**（保留其他 key 亦可）→ **导入数据** 选同一文件 → Journey Log / 热力图与导出前一致。**复测须覆盖**：导入时 Journey 保持打开、窄屏抽屉保持打开——应无需关页重开即看到新数据（见 `fix-practice-import-refresh.md`）。自动化：`practiceBackupLocalIo.test.js`。 | 2026-08-31 开发自查：合入 #480 时 `ft:practice-data-imported` 无订阅，Journey 开着会误判导入失败。修复跟进 `fix/practice-import-refresh`。 | — | — | `#onboarding-privacy-sheet` · `#privacy-local-data-mount` | 2026-08-28 |
| 导入后全局状态未刷新（P0 缺口） | UI可见 | 待人工测试 | 打开 Journey Log 或窄屏抽屉热力图并保持在前台 → Privacy 完成本地导入 → **不**手动关页。预期：三处均读到新 storage。曾：事件已 dispatch 但无订阅。自动化见 `fix-practice-import-refresh.md`。 | 开发自查（Cursor review）发现，非用户上报 | — | — | `?` → Privacy → Journey Log / 练习日历 / 窄屏抽屉 | 2026-08-31 |
| 云端备份无网络残留（P0 · 曾 opt-in） | UI可见 | 待人工测试 | **前置**：`localStorage` 保留 `focus-tiger.practice-backup.v1` 且 `enabled:true` + 有效 `deviceToken`（或曾 Enable 过的测试邮箱）。**Network**：`?product=1` 冷启动 → Idle 操作（打卡/写 Journey）→ **全程无** `/api/practice-backup/*`（含 Idle ~2.5s flush）。**Journey Log**：无「绑定邮箱/云端备份」链。自动化：`practiceBackupSync.test.js`（`cloud_disabled`）。 | — | — | — | 全局 Network · Journey Log | 2026-08-28 |
| 启动不自动拉云端（P0 · boot restore） | UI可见 | 待人工测试 | **前置**：同上 opt-in 标记 + DEV **仅清 6 whitelist key**（保留 `practice-backup.v1`）。硬刷新 → 等 **≥3s** → Network **无** `practice-backup/get`；本机仍空（**不**被云端覆盖）。自动化：`maybeRestorePracticeBackupOnBoot` + `cloud_disabled`。 | — | — | — | App 冷启动 | 2026-08-28 |
| 完整隐私声明 §1–§5 + 导出/导入入口 | UI可见 | 待人工测试 | **?** → **Privacy**：见「完整隐私声明」导语 + **§1–§5 标题**（zh/en/ja 各一遍）→ §3 下 **导出数据 / 导入数据**；文案与 `PRIVACY_NOTICE.md` 一致（云备份「当前不提供」、6 key 范围、联系邮箱）。**375**：Sheet 可滚、按钮可点。自动化：`privacyNoticeCopy.test.js`。 | — | — | — | `http://127.0.0.1:5173/?product=1` | 2026-08-28 |
| 导入覆盖确认与错误态 | UI可见 | 待人工测试 | **覆盖**：本机非空 → 导入不同文件 → 对比表 + 勾选前确认钮禁用 + 少于本机时出现警示条。**错误**：非法 JSON / schema 过高 → 明确文案、本机不变。**空库导出**：各 key 空仍生成合法 JSON。 | — | — | — | `#privacy-local-data-mount` | 2026-08-28 |
| 导入中途失败回滚 | 纯后端 | 仅单元测试覆盖 | 人工难 mock。**自动化**：`practiceBackupLocalIo.test.js` — 第 1 key 失败回滚；**第 3 key**（`milestone-glow`）失败时前两 key 已写亦须整库回滚。 | — | — | — | `practiceBackupLocalIo.test.js` | 2026-08-28 |

---

## 待评估（非验收 · backlog）

曾 opt-in 云端备份的用户本次为 flag 静默关闭，无一次性告知。是否下次打开给轻提示（「云端备份暂不可用，请用本地导出」）——见 `PROCESS.md` Backlog「练习记忆云端备份」· 暂停项（2026-08-28）。
