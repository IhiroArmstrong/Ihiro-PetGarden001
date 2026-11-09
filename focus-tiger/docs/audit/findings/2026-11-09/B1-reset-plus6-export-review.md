# B1 · reset +6 钥匙 vs export 核对（只读）

- 日期：2026-11-09
- 对照：第 0 轮 facts [`BACKUP_RESTORE_WALKTHROUGH.md`](../../facts/2026-11-06/BACKUP_RESTORE_WALKTHROUGH.md) **31 export / 99 reset**
- 现网：`origin/develop` @ `65431541`（#1647 合入后尖端）`npm run audit:local-backup-coverage` → **31 export / 105 reset**
- 范围：只读核对；**未改** `localStateKeys.js` / `localBackupStorageRegistry.js` / `practiceBackupSnapshot.js`
- 结论一句话：**不是 export 少了 6 把**；reset 白名单相对 facts 长了 6 把，六把都是 T81/T83 研究共修键，**均不进**练习 Backup 导出

99 把基线 = T87 稳定偏好合入后的 `FOCUS_TIGER_LOCAL_STORAGE_KEYS`（`18882c9f` / **#1582**）。其后只增不减。

## 六把钥匙

| Key | 何时进 reset | 建议档 | 依据 |
|---|---|---|---|
| `focus-tiger.co-practice-research-week-ledger.v1` | #1585 T81 S1 | **仅 reset** | [`SHARED_RESOURCES.md`](../../../SHARED_RESOURCES.md) 写明**不进** T54 / 练习云备份。周整数账本可从现网练习记录重算；T81 Brief 要求「删除全部本地数据」清研究账本。同类：T54 流水也不在 31 把 export 里 |
| `focus-tiger.co-practice-research-consent.v1` | #1593 T81 S4 | **仅 reset** | 独立 `studyId`（UUIDv4）+ 同意。T81：与 T54 同意键隔离；清库须一并清研究 ID。导出到另一台机会复制造号或未再确认就恢复同意。先例：`t54-research-consent.v1` 在 99 把 reset 内、不在 export |
| `focus-tiger.co-practice-research-last-post.v1` | #1593 T81 S4 | **仅 reset** | 上次周包指纹，避免重复 POST。属上送节流，不是练习记忆。先例：`t54-research-last-post.v1` |
| `focus-tiger.co-practice-research-weekly-schedule.v1` | #1610 T81 S5 | **仅 reset** | `{ lastPostedWeek }`；撤回同意时清除。设备周调度旗，恢复备份不该跨设备跳过当周上送 |
| `focus-tiger.co-practice-research-first-sit-prompt.v1` | #1617 T83 | **仅 reset** | 轻提示「已看过 / 暂不」门闩（最多 2 次、30 天）。与 `hints-seen` / `cold-start-goal-seen` 同类，不在练习记忆白名单。T83 Brief 不管备份 |
| `focus-tiger.dev-co-practice-research-consent-fixture.v1` | #1593 T81 S4 | **豁免（不进 export）** | SHARED_RESOURCES：**禁止**生产默认读取；仅测试 / DEV 夹具。T81：实验室键须明显命名且默认关。进 JSON 备份会把实验室同意带给用户档。仍须留在 reset，以便 DEV「删除全部」清干净 |

## 档位说明

- **应进 export**：会进 `PRACTICE_BACKUP_EXPORT_KEYS` / 本地 Preferences → Backup & restore（现 schema v7 · **31** 把）。本表 **0** 把。
- **仅 reset**：留在 `FOCUS_TIGER_LOCAL_STORAGE_KEYS`（一键清空会删），**不**进 export。本表 5 把。
- **豁免**：明确不得进备份文件；DEV 夹具 1 把。仍走 reset。

未改级别：B1 **1-05** 仍为 P2（覆盖闸绿；无「练习记忆漏备份」证据）。不升 V4。

## 文档债（本 PR 可写 md；改 JS 名单另刀）

1. `SHARED_RESOURCES.md` 补 T83 `first-sit-prompt` 行，并写清六把**亦不进本地 Backup 导出**。
2. `docs/local-backup-storage-registry.md` reset 计数仍写 **94**（滞后）；改为 **105**，并把六把列入「Explicitly NOT exported」。
3. **后续实现 PR**（需口令，不在本回合）：`LOCAL_BACKUP_EXCLUDE_ROWS` 补这六把（`exclude-product` / `exclude-ephemeral`），与 recipe 键同一闸。无口令不得改产品代码。

## 冲突扫描

无用户路径。只钉「研究键不进练习备份」的既有口径，不改练习 / 倾诉 / 付款。
