# Task Brief：邮箱登录 P0（Email Sign-in，换设备/换载体找回旅程）

> 状态：**PO 已书面立项 · §4 已于 2026-11-10 点头 · 阶段 0/1 已对照 develop 核实 · 本文件含事实表 + 方案 · 本文件仍无运行时代码**
> 挂线：**苹果 DMG 发布准备 Epic #5 · Issue [#631](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/631)**（与官网 DMG 自动更新器同属发布门闩；**不**新开 Epic）
> 代号：**T93**（2026-11-08 治理 PR 已写入 `GLOSSARY.md` / `SCHEDULING_GLOSSARY.md`。**不是** 识别率四刀，那是 **T94**）
> 开工口令（§4 已点头、须另开对话）：**「开工邮箱登录 P0」** · 第一刀只做合并去重（D1），**不开云闸**
> 基线：`origin/develop` tip `195e3eb0` · 2026-11-08（事实核实）；§4 点头日 2026-11-10

---

## 0. 大白话摘要（给 PO）

缺的不是「账号系统」，而是换电脑或换网页/桌面版时，用户能自己把旅程找回来的一条路。零件以前做过（邮箱验证码、练习备份、购买恢复），但现在云备份在产品里是关掉的，菜单里登录还是灰的。第 4 节已拍完：先明文、入口只留设置里一处、商店渠道先关云登录。软件还没改。下一刀须另开对话，只做合并去重，先不要打开云端开关。

---

## 1. 已拍板（不要重开）

1. 正式书面要求做**真登录**；范围只限方案 **B**：邮箱验证码、无密码，复用 OTP 与练习备份。
2. P0 **并入第一份正式 DMG 出门前门闩**（与更新器并列）。
3. 昵称不是凭证；昵称显示名是 **P1**，本轮只预留一句。
4. Confide 原文 / Memory 摘要永不进云；备份不锁付费；本地为权威。
5. **明文开闸、不等加密**（2026-11-10 · 按推荐 A）：第一份包可用诚实隐私文案 + 可删除；加密另排。
6. **找回旅程入口只留 Preferences**（2026-11-10 · 按推荐 A）：去掉 Journey 角落备份链，不两处都留。
7. **Setapp / MAS 默认关云登录**（2026-11-10 · 按推荐关）：与更新器渠道拆分一致；这两渠尚未打，只写进清单。
8. 术语表 **T93** 已登记（2026-11-08）；PO 2026-11-10 无异议。识别率是 **T94**。

---

## 2. 阶段 0 事实表（对照 develop，不是印象）

每个问题：**结论 · 证据 · 置信度**。探索在预算内收敛；未再翻冷启动清单逐条 E 编号的原文。

### 2.1 OTP 现状

| 项 | 结论 | 证据 | 置信度 |
|---|---|---|---|
| purpose 清单 | 共用 `RestorePurpose`：`sanctuary` · `membership` · `practice-backup` · `companion-addon` · `art-collection`。**没有** `sign-in`。 | `cloud/src/lib/restoreOtp.ts` `isRestorePurpose` | 高 |
| 发码门闩 | 付费恢复（`/api/restore/request-otp`）**先查权益再发信**；无权益仍回 `{ ok: true }` 但不发码。练习备份（`/api/practice-backup/request-otp`）**无付费门闩**。 | `requestRestoreOtp.ts` · `requestPracticeBackupOtp.ts` | 高 |
| 速率 | OTP 层：冷却 60s / 邮箱+purpose；每小时 5 次；码 TTL **600s**；最多 **5** 次尝试验证。另有 Worker IP 桶（`cloud/README.md`：restore 5/min/IP）。 | `RESTORE_OTP_*` 常量 · README | 高 |
| 存储 | 明文码不落盘，只存 HMAC；pepper = `RESTORE_OTP_PEPPER`。KV key 含 **小写明文邮箱**：`restore-otp:{purpose}:{email}`。 | `restoreOtpKey` | 高 |
| 验证后凭证 | 练习备份签发 **deviceToken**（随机 32 字节，OTP_KV 只存 HMAC，记录里带明文 email），TTL **30 天**。付费恢复走各自 verify，不共用这份 token。 | `practiceBackupDeviceToken.ts` · `verifyPracticeBackup.ts` | 高 |
| 撤销 | OTP 一次性消耗即删。关备份可 `DELETE` 快照。deviceToken 到期或 KV 记录过期。**没有**「登出所有设备」列表。 | delete 路由 · token TTL | 高 |
| 侧信道 | 发信 `waitUntil` 不阻塞响应。付费恢复仍 **await 权益 KV** 后才返回（有/无权益耗时可能不同）。练习备份不读权益。 | `requestRestoreOtp.ts` 注释 vs 实现 | 中高 |
| 新增 `sign-in` purpose？ | **能加，但不该加。** purpose 枚举 + 邮件文案 + parse 白名单要改，但会变成第二套 token/快照。 | `isRestorePurpose` + 各 verify 路由 | 高 |

**计划 → 现状 → 还差 → 下一步**

| 计划 | 现状 | 还差 | 下一步 |
|---|---|---|---|
| 复用现有 OTP | 五类 purpose 已共用发码内核 | 没有面向「保存旅程」的 purpose/入口 | P0 **复用 `practice-backup`**，不新开 `sign-in` |

### 2.2 备份现状

| 项 | 结论 | 证据 | 置信度 |
|---|---|---|---|
| 落地到哪 | Prompt 11.5/12 曾合入（#270/#272 等），生产发过码（TRACKER 2026-08-13 书面）。**现在用户侧已关死。** | `practiceBackupCloudEnabled = false`；Journey 角落面板 `if (!practiceBackupCloudEnabled)` 不渲染 | 高 |
| Worker | **#1602 已合、#1615 已部署**。现网 `POST /api/practice-backup/request-otp` 返回 **410** `practice_backup_disabled`。`put` / `get` / `delete` 在当前源码里**没有**同样的 410 闸，空 body 会 400，带看起来合法的邮箱仍会走鉴权（get 见过 401）。前端闸仍关。 | `cloud/src/index.ts` · `practiceBackupWritesDisabled.ts` | 高 |
| 默认 | 关。opt-in 键 `focus-tiger.practice-backup.v1` 本机可能仍有历史 enabled，但 flag 让 upload/restore 直接 skip。 | `practiceBackupSync.js` 多处 early return | 高 |
| 云端白名单 | Worker schema **v2 八 key**：journey-log、practice-days、milestone-glow、entitlement-ownership、ritual-completions、mustard-seed-seal、lotus-pond、growth-journey-stage。不含 tip-jar cache、entitlement-cache、Confide 原文。 | `cloud/src/lib/practiceBackupKv.ts`；客户端 `PRACTICE_BACKUP_CLOUD_V2_STORE_KEYS` | 高 |
| 本地导出 | 另一套 schema **v7**，键更多（含偏好、Presence 等）。云端 **没有**跟到 v7。 | `practiceBackupSnapshot.js` `PRACTICE_BACKUP_SCHEMA_VERSION = 7` vs 云 v2 | 高 |
| 「合并去重」 | **地面真相与红线不一致。** 云恢复 `writePracticeBackupCloudStoresRaw` 对白名单 key 是 **整包覆盖**（云端 null 会删本地 key）。**仅**成长旅程阶段下限 `max(本地, 云)`。不是 journey 行并集。本地文件导入另有覆盖对照 UI。 | `practiceBackupSnapshot.js` 577 行起 · `practiceBackupSnapshot.test.js` 阶段下限用例 | 高 |
| 空库恢复 | 曾有开机约 2.5s 后拉云（`PRACTICE_BACKUP_BOOT_RESTORE_MS`），现被 flag 短路。 | `practiceBackupSync.js` | 高 |

**计划 → 现状 → 还差 → 下一步**

| 计划 | 现状 | 还差 | 下一步 |
|---|---|---|---|
| 登录后自动开备份 | 备份链路代码在、生产写入 **410**、UI 隐藏 | 重新打开客户端闸 + Worker 写入 + **先改合并规则** 再给人点 | 见方案刀 1–2；加密 vs 明文见待拍板 |

### 2.3 现有 UI 占位

| 项 | 结论 | 证据 | 置信度 |
|---|---|---|---|
| Sign in 灰行 | Preferences 组，`interactive: false`，`testId=idle-account-placeholder`。en「Sign in (coming soon)」/ zh「登录（即将推出）」/ ja「サインイン（近日公開）」。 | `idleChromeOrchestration.js` ~878 · `ACCOUNT_MENU_PLACEHOLDER` | 高 |
| 普查口径 | 真登录曾约定等投诉或 Circle 跨设备；现已被本 Brief 书面推翻。禁止假可点。 | `MENU_CHROME_CENSUS.md` §1 第 3 条 | 高 |
| 云备份入口 | Journey log 角落绑邮箱（现隐藏）。本地备份：Preferences → Backup & restore（文件导出/导入，仍可用）。 | `JourneyLogUI.js` · `LOCAL_BACKUP_MENU_LABEL` | 高 |
| 购买恢复 | Sanctuary / Membership 卡内填邮箱 → Send code → Verify。与灰行登录 **不是同一入口**。 | `SanctuaryUnlockUI.js` · TRACKER Restore OTP 行 | 高 |
| 换设备要几步（云开着时的历史路径） | ⋯ → Practice → Journey log → 绑邮箱 → 同意 → OTP → Enable；新设备再走一遍。现因闸关闭 **走不通**。本地文件路径：旧机导出 → 拷文件 → 新机导入（可覆盖）。 | 产品知识库 KB-FUNC-0009 标「云备份暂禁用」 | 高 |

### 2.4 Electron 与网页存储隔离

| 项 | 结论 | 证据 | 置信度 |
|---|---|---|---|
| 是否独立 | **是。** 桌面窗是独立 Chromium（默认 session，无自定义 `partition`），`file://` 或壳内 origin ≠ Safari/Chrome 网页 origin。localStorage **不会**从网页带进 DMG。 | `desktop/main.js` `webPreferences`（preload / isolation / sandbox；无 partition） | 高 |
| 首次启动导入 | **没有**「从邮箱恢复」壳层向导。首次画面走网页同一套冷启动，不是空状态专用登录页。 | 窗口 `createMainWindow`；冷启动审计仍是独立 backlog | 中高 |
| 挂恢复入口 | **可以**，但 **禁止**插入冷启动第一幕占用（E01–E14）。应挂：Preferences 真入口；空旅程时 Backup 面板次级按钮；第一幕 **结束之后** 才允许轻提示。 | Brief 红线 + `task-cold-start-first-scene-audit.md` 存在且 blocked 前置 | 中（未逐条重读 E 表） |

### 2.5 身份模型

| 项 | 结论 | 证据 | 置信度 |
|---|---|---|---|
| 云端键 | 备份快照 KV = `practice-backup:v1:{lowercase email}` **明文邮箱当 key**。权益 KV 同样按邮箱。Stripe Customer 不是备份主键。 | `practiceBackupSnapshotKvKey` | 高 |
| 一份还是两份 | **逻辑上同一邮箱字符串，存储上两份：** OTP/device 在 `OTP_KV`；快照在 `PRACTICE_BACKUP_KV`；Sanctuary/Membership 另 KV。没有「Account」行。 | 各 `*Kv.ts` | 高 |
| 迁移 | 统一成「一邮箱=一身份」**不必搬 KV 数据**，只要产品只签发一套 practice-backup deviceToken，付费恢复仍按原 purpose 查权益。 | — | 中高 |
| 枚举/泄露 | 发码恒 `{ ok: true }`。KV 运营者可见明文邮箱 key。device 记录 JSON 含 email。B5 已记快照未加密。 | B5 findings · `PracticeBackupDeviceRecord` | 高 |
| Focus Circle | 本机 `focus-tiger.focus-circle-identity.v1`，**不**跟邮箱走。 | `SHARED_RESOURCES.md` | 高 |

### 2.6 隐私与合规

| 项 | 结论 | 证据 | 置信度 |
|---|---|---|---|
| 对外怎么说 | 隐私卡 **「当前不提供云端备份」**（`PRIVACY_SHEET_CLOUD`）。与代码闸一致，与「登录后自动备份」**冲突**，P0 必须先改文案再开闸。 | `en.json` / `privacyNoticeCopy.js` | 高 |
| 撤销删除 | Worker `DELETE /api/practice-backup/delete`（OTP 或 deviceToken）存在，现 410。前端关备份曾走删云。隐私卡未给「删除我的云端副本」独立入口。 | `deletePracticeBackup` · JourneyLogUI 注释 | 高 |
| GDPR 是否 P0 | **是（最小集）**：开闸同时必须能 **用户自己删云端快照 + 解绑本机 token**，且隐私说明写清存什么、不加密（若 PO 选明文）。完整「删除账号」跨权益 KV 不是 P0。 | 开闸即处理个人数据 | 中（法律意见未核实） |

### 2.7 换设备场景矩阵

| 场景 | 现状能否恢复 | 需要几步 | 卡在哪 |
|---|---|---|---|
| S1 网页 → Mac DMG | 否（自动） | 若只用本地文件：导出→拷→导入。云路径现不可用 | 存储隔离 + 云闸关闭 + 无登录入口 |
| S2 Safari ITP 清空 | 否（除非事先本地文件或历史云备份仍在 KV） | 历史云用户也因 410/前端关 **拉不回来** | 云写入已停；灰行登录 |
| S3 手机浏览器 → 电脑 | 否 | 同上 | 同源策略 + 云关 |
| S4 Mac → 新 Mac | 否 | 同上；用户数据在新机 Electron 分区 | 无壳层迁移 |
| S5 已付费换载体 | **权益**可走各卡 Restore OTP（Sanctuary/Membership 等），与旅程备份 **分开**。旅程记录仍丢。 | 购买恢复 ≥3 步/SKU；旅程 0 步可用 | 身份未统一；备份关 |

### 2.8 测试与验收基础

| 项 | 结论 | 置信度 |
|---|---|---|
| 单测 | `restoreOtp.test.ts`、`practiceBackupSnapshot.test.js`、`practiceBackupSync.test.js`、`practiceBackupKv.test.ts`、Journey 面板对 flag 的源码断言 | 高 |
| e2e / 场景 | `SCENARIO_TESTS.md` Journey 备份角落 GWT（Sending… / Enable 换句）；TRACKER 云备份行状态 **「有问题」**（闸关闭）。无「Sign in 真入口」场景。菜单治理行仍要求灰行不可点——**P0 必须改这条剧本** | 高 |
| 无真邮件 | **没有**独立 mock mail provider。单测直接灌 KV。缺 `RESEND_*` 时发码仍 `{ ok: true }` **不发信**。DEV 曾有 `window.__practiceBackup`。本地 wrangler + 测邮箱仍是人工彩排路径 | 中高 |

### 2.9 PR 门闩（开工前已查）

| 切片 | 有没有 PR | 状态 | 结论 |
|---|---|---|---|
| 邮箱登录 P0 / 灰行改真入口 | **无**同切片 OPEN/MERGED 实现 PR | — | 开发未完成；本文件为文档第一刀 |
| 练习备份写入关闭 | **#1602 MERGED** | 已合 develop | 地面真相：云备份写入故意关闭 |
| 轻量身份 Brief 锁 | **#980 MERGED** | 文档 | 真登录触发条件已被本次书面要求取代 |

---

## 3. 阶段 1 方案（只文档）

### 3.1 我认为最合理的 P0 范围

**推荐：方案 B′（复用 `practice-backup` purpose + 先修合并再开闸 + 明文快照须 PO 豁免加密）。**

不要做：新 `sign-in` purpose、密码、第三方登录、资料页、实时同步、昵称登录。

P0 用户可见：

1. 把灰行改成可点入口，文案方向 **「用邮箱保存/恢复你的旅程」**（不是「Sign in」账号腔）。
2. 同一套抽屉：邮箱 → 发码 → 验证 → 本机保存 deviceToken → **默认打开备份**（仍可关；关=删云端副本，本地保留）。
3. 已绑定：脱敏邮箱 + **本机登出**（清 token，**不**默认删云）+ 「删除云端副本」需再次 OTP。
4. Mac：冷启动第一幕 **结束后**，若白名单空，Backup/该入口可从「从邮箱恢复」进；**不**做独立全屏向导抢第一幕。
5. 首次完成一次专注后 **一次性**轻提示（可永久关闭；走现有 overlay/精灵通道，失败态 Retry / Not now）。
6. 隐私卡改成诚实描述（存哪些 key、不加密或「传输 HTTPS、KV 明文」）。
7. Setapp / Mac App Store 编译期可关掉该入口（与更新器同清单，即使这两渠尚未打）。

**较弱路径**：只改文案加强本地备份提示（治标）；先做端到端加密再登录（挡 DMG 过久）；加独立 `sign-in` purpose（双身份）。

### 3.2 统一身份与状态机

产品身份 = **验证过的邮箱**。凭证 = 现有 practice-backup **deviceToken**（30 天，过期再 OTP）。付费 SKU 仍走原来的 restore purpose，验证成功后可 **静默**用同一邮箱字符串，不必用户再绑一次。

```
未绑定 → 验证中（发码/输入码） → 已绑定
                ↘ 失败（Retry / Not now）
已绑定 → 备份中（put，可跳过 unchanged）
      → 恢复中（get + 合并）
      → 失败（Retry / Not now）
      → 已登出（本机） / 已删云（OTP）
```

Focus Circle 本机 ID **本刀不动**。P1：显示名只是该邮箱下的可选预设名。

### 3.3 数据流（文字）

1. 用户点入口 → 填邮箱 → `POST /api/practice-backup/request-otp`（须先 **去掉 410**）→ 恒 `{ ok: true }` → Resend `waitUntil`。
2. 用户提交 6 位码 → `verify` → 签发 deviceToken → 写入 `practice-backup.v1`。
3. **恢复**：`get` → **合并去重（P0 必改，见下）** → 写本地 → 再 `put` 合并后快照。
4. **备份**：Idle 错峰 flush；指纹相同跳过 PUT；busy 含 Arrival/Honesty/Focus/Reflection（沿用现 probe）。
5. 本机为权威：合并结果以本地+云并集为准，禁止「云整包覆盖本地非空旅程」。

**P0 必须改的合并规则（否则违反红线）**

| store | 规则 |
|---|---|
| journey-log / practice-days / ritual-completions / milestone-glow | 按已有 id/日键 **并集**；冲突取较完整或较新，不得丢本地独有行 |
| entitlement-ownership | 并集；导入永久纪念仍走现有 unpaid gate |
| mustard-seed-seal / lotus-pond | 只增不减（与阶段下限同形） |
| growth-journey-stage | 已有 `max`，保持 |
| 云端为 null | **不得**删本地已有 key |

现网整包 `setItem` 必须换成上述合并，并补「撤掉合并会红」的单测。

### 3.4 安全与隐私清单

- 不新 purpose；防枚举保持恒 `ok: true`。
- 付费 restore 的权益 KV 时序差异 **本刀不修**（记风险，不顺手改付款路径）。
- 速率沿用 60s / 5 小时 / 5 次尝试 / IP 桶。
- KV key 短期仍明文邮箱（改哈希是 P2，要迁移）。
- 快照：推荐 P0 **继续明文 JSON**（历史已上过生产），隐私写清楚；加密另刀，不挡「能找回」。
- 删除：关备份 / 「删除云端副本」走 OTP；登出不清云。
- Confide turns / Yin personal memory：**继续排除**。本地 v7 导出已剥离 confide jsonl 出口径保持。

### 3.5 文案（须人审 · zh 草稿）

| 键（建议新 slice `email-journey-save.json`） | en | ja | zh（draft） | 人审 |
|---|---|---|---|---|
| 菜单行 | Save or restore your journey with email | メールで旅の記録を残す／取り戻す | 用邮箱保存或恢复你的旅程 | 是 |
| 说明 | Optional. Your sits stay on this device. A quiet cloud copy helps if this browser forgets, or if you open the Mac app. Not an account with a password. | 任意です。記録はまずこの端末に残ります。ブラウザが忘れたときや Mac 版を開くときに、静かな控えがあると戻れます。パスワードのアカウントではありません。 | 可选。记录先留在这台设备。浏览器清空或打开 Mac 版时，云端一份安静的副本能帮你找回。这不是带密码的账号。 | 是 |
| 发码 | Send a 6-digit code | 6桁のコードを送る | 发送 6 位验证码 | 是 |
| 发送中 | Sending… | 送信中… | 发送中… | 可沿用 Journey 键 |
| 已绑定 | Saved as s•••@domain | （同形脱敏） | 已保存为 s•••@域名 | 是 |
| 登出 | Stop using email on this device | この端末でメールの使用をやめる | 在这台设备停止使用邮箱 | 是 |
| 删云 | Delete the cloud copy | クラウドの控えを削除 | 删除云端副本 | 是 |
| 首次坐完提示 | Want a way back if this device forgets? | この端末が忘れても戻れるようにしますか？ | 如果这台设备忘了，要留一条回来的路吗？ | **是（禁倒计时、禁逼付费）** |
| Not now | Not now | 今はしない | 先不用 | 是 |
| Retry | Try again | やり直す | 再试 | 是 |
| 空机恢复 | Restore from email | メールから戻す | 从邮箱恢复 | 是 |

**禁止**：Sign in / Account / Log out 账号产品腔作主标题；衰败/离开逼登录；「必须登录才能继续」。

### 3.6 叠层 / 仲裁

| 入口 | 层 | 让路 |
|---|---|---|
| 菜单 Preferences 行 | 菜单逃生舱，**不**走 overlay 仲裁 | 永不因 busy 藏 ⋯ |
| 用户点开的保存/恢复卡 | 现有玻璃设置卡，跟 Backup 面板同级 | Esc 只关最上一层 |
| 首次坐完轻提示 | **主动弹出** → 必须登记 overlay/精灵通道；建议与 Journey 记忆卡同一「练习后轻量」档，让路 Celebrating / Arrival / Honesty / Reflection / 付款 | **不**新增平行 busy 布尔；复用 `setPracticeBackupBusyProbe` 已覆盖的 focusing/overlays |
| Mac 空库 | 第一幕结束后才出现次级按钮，不算弹窗 | 不占 E01 occupancy |

第七节结论句（实现开工时再点名消费者）：本刀主动提示点名 `overlayBusy` / 精灵占用 registry 的练习后通道；菜单行点名 `idleChromeOrchestration` Preferences，不含 Support FAB。

### 3.7 验收分层

| 层 | 内容 | 谁 |
|---|---|---|
| A | 状态机 + **合并去重**单测（双端都有数据不丢行；null 不删本地） | Agent |
| B | DEV：无 Resend 时不得假装已寄出；有 wrangler 时 `__practiceBackup` 假通路 | Agent |
| C | 本机网页 + Electron 各清库走一遍恢复 | 你（人工） |
| D | 真邮箱彩排（含 410 已解除的生产 Worker） | 你 · **发布前** |

已合入 ≠ 已验证。TRACKER 保持待人工，直到你关单。

### 3.8 渠道拆分（写入 DMG 检查清单）

- [ ] 官网 direct DMG：**开** 邮箱保存/恢复
- [ ] Setapp 编译旗标：**关** 或改写为「用官网账号体系」——P0 默认 **关云登录**（商店有自己的装机，避免双身份）
- [ ] Mac App Store：同 Setapp，P0 **关**
- [ ] 网页版：**开**（ITP 是主因）

### 3.9 DMG 发布门闩（与更新器并列）

第一份正式/收费 DMG 出门前：

1. 官网 DMG 自动更新器（已有 Brief #758 合入口径；运行时另计）
2. **邮箱保存/恢复 P0 完成并通过你的 C+D 人工验收**
3. 隐私文案已与开闸一致
4. Worker 生产已部署（须另下「部署」口令）且 practice-backup **不再 410**

### 3.10 工作量与分批（实现时一 PR 一刀）

| 刀 | 内容 | 顺序 |
|---|---|---|
| **本刀 D0** | 本 Brief + PROCESS/TASKS 登记（无运行时） | 正在做 |
| **D1** | 客户端合并去重 + 单测（云仍可关） | 必须先于开闸 |
| **D2** | Worker 去掉 410（或改为环境旗标默认 prod 开、审计环境可关） | 与 D3 同发布窗口；**先合客户端认 410/200 两态，再部署 Worker** |
| **D3** | 开 `practiceBackupCloudEnabled` + 菜单真入口 + 隐私文案 + 登出/删云 | 依赖 D1 |
| **D4** | 坐完一次性提示 + Electron 空库「从邮箱恢复」（不碰第一幕） | 可在 D3 后 |
| **D5** | 场景文档 + 菜单治理 TRACKER 改写灰行剧本 | 与 D3 同批文档 |

不可并行：D2 生产部署不能早于 D1 合并行为合入（否则用户一恢复就整包覆盖）。

### 3.11 风险

| 风险 | 等级 | 缓解 |
|---|---|---|
| 整包覆盖丢本地独有记录 | **高** | D1 不做完不准开闸 |
| 验证码滥用/信噪 | 中 | 沿用速率；失败也 `ok: true` |
| 邮件进垃圾箱 | 中 | 文案「几分钟」；DEV 不假装已寄 |
| 用户以为必须登录 | 中 | 可选 + Not now + 不挡练习 |
| 与 Circle 本机 ID 两套人 | 中 | P0 不绑 Circle；P1 再谈显示名 |
| B5「加密前不开写入」与 DMG 门闩冲突 | **高** | 待你豁免明文或接受延期 |
| 隐私卡仍写「无云备份」却开闸 | 高 | D3 同批改文案 |
| 菜单剧本仍要求灰行 | 中 | D5 改 SCENARIO/TRACKER |

### 3.12 冲突扫描（实现前）

| 相邻 | 轴 | 判断 |
|---|---|---|
| 菜单治理灰行 / 普查第 3 条 | 职责 | **有冲突**：本刀要改可点。PO 书面要求已覆盖「等投诉」旧闸。实现时改 census 状态句。 |
| Journey 角落备份 vs Preferences 新入口 | 职责 | **疑点**：两入口易重复。**推荐只留 Preferences 为主入口**，Journey 角落不再承担「登录」，最多一行「已保存到邮箱」。待拍板。 |
| Newsletter 留邮箱 | 职责 | 无冲突：通讯录 ≠ 旅程凭证。 |
| Sanctuary Restore | 职责 | 并存；P0 不合并进同一张卡，避免碰付款保护路径。 |
| 冷启动第一幕 | 强度 | 主动提示过强会抢幕。方案已禁。 |
| 本地 Backup & restore 文件 | 职责 | 保留；云是可选兜底，不是替换。 |

有「Journey 角落是否保留」疑点，**等你点头**后才能写 `src/`。

### 3.13 变体矩阵（A10 · 实现 Brief 锁栏）

| 变体 | 入口 / 前置 | 预期 | 自动化 |
|---|---|---|---|
| 宽屏菜单 | ⋯ Preferences | 行可点，0–1s 打开保存/恢复卡 | 改 `menu-full-reachability` 灰行断言 |
| 窄屏抽屉 | 同上 | 同文案、同卡 | 同上 |
| Electron 空库 | 第一幕结束后 | 「从邮箱恢复」可见，不挡 Sit | 单测 gate + 人工 C |
| 网页已有本地数据 | 坐完一次 | 最多一次提示，可永久关 | 单测 seen 键 |
| en / ja | 菜单+卡 | claim 语言 | locale slice 检查 |
| zh | 菜单+卡 | draft 可出，不对外 claim | 切片允许 draft |
| Setapp/MAS 关 | 编译旗标 | 无该行或变回不可点说明 | 单测 flag |
| 已购用户 | 换设备 | 旅程走本入口；权益仍走原 Restore | 不改付款契约 |

### 3.14 点击反馈（A14）

| 控件 | 0–1 秒 | 挂起 / 成功 / 失败 |
|---|---|---|
| 菜单「用邮箱保存/恢复」 | 卡展开（玻璃），禁止无反应 | — |
| Send code | Sending… | 挂起 Sending；成功「已发到邮箱」（即使枚举恒 ok，若格式错立刻 invalid）；失败 Retry |
| Verify | 按钮忙碌 | 成功脱敏邮箱+备份已开；失败 invalid/expired + Retry / Not now |
| 登出 | 行变为未绑定 | 本机 token 清 |
| 删云 | 确认短句 + OTP | 成功「云端副本已删除」 |
| 坐完提示 Not now | 提示关，不再挡 | 写 forever-dismiss |
| 灰行旧行为 | **删除**；不得留 `interactive:false` 假登录 | — |

### 3.15 边缘状态（A14）

| 状态 | 预期 |
|---|---|
| 无网 | 失败句 + Retry / Not now，练习继续 |
| Worker 仍 410 | 明确「云端暂时不可用」，**禁止**空 return |
| 本机已有旅程 + 云也有 | 合并去重，出一行「已合并，没有覆盖掉这边的记录」 |
| 本机空 + 云有 | 恢复后出现旅程 |
| 已绑定过期 token | 再走 OTP，不丢本地 |
| 专注中 | 不弹提示；不 PUT（现 busy） |
| 付款卡开着 | 提示让路，不盖 Support |

### 3.16 后台网络三问（开闸后的 Idle flush）

1. **时机**：沿用 Idle 2.5s flush；Arrival/Honesty/Focus/Reflection busy 时不发。坐完提示本身是点击后或练习后仲裁过的，不算静默抢第一幕。
2. **写盘**：指纹相同只更新 cloud-ok，不重复 PUT。
3. **慢网**：失败不卡精灵；状态在设置卡内，不在 HUD 倒计时。

### 3.17 P1 预留（本轮不设计）

邮箱身份下的显示名：仅预设词表、无自由文本、无头像；不作为凭证。接口上预留 `displayNameId` 挂在本机、**不**进练习备份白名单（Circle 认人另 Brief）。

---

## 4. 待 PO 拍板 — **已点头（2026-11-10）**

PO 书面：**四条均按推荐**。不要在本 Brief 对话写登录代码。口令约定：点头后 **新 Chat** 发「开工邮箱登录 P0」；第一刀只做合并去重（D1），先不要开云闸。

1. **明文快照 vs 等加密** → **A 明文开闸**（改隐私文案）。不等加密；不因此延期第一份安装包。加密另排。
2. **Journey 角落备份链** → **A 去掉，只留 Preferences**。
3. **T93 术语表** → **已登记，无异议**。T93 = 邮箱登录（第一份 DMG 门闩）· 槽位 **P1** · 风险高（隐私/合并；合入前须 B5 增量复核）。**不是** T94。不要把审计「P0」写进槽位列。
4. **Setapp/MAS 默认关云登录** → **关。**

---

## 5. 本轮明确不做

密码、第三方登录、Sign in with Apple、头像/资料页、昵称登录、设备管理/全设备登出、实时同步、运行时代码、Worker 部署、生产配置。

---

## 6. 对照表总览

| 计划 | 现状 | 还差 | 下一步 |
|---|---|---|---|
| 真登录书面要求 | PO 已答复算书面要求 | 实现 | §4 已点头；新 Chat 口令开工，先 D1 |
| 灰行变真入口 | 灰行仍在 | D3 | 改 census + 菜单 e2e 断言 |
| 复用 OTP/备份 | OTP 在；备份 **410+前端关** | D1–D3 | 先合并再开闸 |
| Mac 首次从邮箱恢复 | 无 | D4 | 不碰第一幕 |
| 坐完轻提示 | 无 | D4 | overlay 通道 |
| 本地权威合并 | **整包覆盖** | D1 | 单测锁并集 |
| DMG 门闩 | TASKS 只有更新器 P0 | 本文件 + TASKS 行 | 合 docs PR |
| 不锁付费 / Never-Cloud | 白名单已排除 Confide | 保持 | 实现时回归测 |

---

## 7. 开工口令

§4 已点头。在**新对话**发送：**开工邮箱登录 P0**。先 D1（合并去重，不开闸）。禁止只点亮按钮。禁止在锁 Brief 的对话里写 `src/`。
