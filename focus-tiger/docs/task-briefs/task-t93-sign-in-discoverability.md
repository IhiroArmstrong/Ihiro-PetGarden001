# Task Brief：T93 D6 · Sign in 可发现性（只文档，不改运行时）

> 状态：**方案已写 · PO 2026-11-27 已点头两项**（改用「Sign in」字样；入口移到 `⋯` 菜单最顶部）· **本文件无运行时**
> 挂线：**T93** 邮箱登录（Epic [#631](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/631)）· 不是新 T 号 · **不是** Circle 统一账号
> 禁止：本刀写 `focus-tiger/src/` / Worker / locale 运行时。口令「按 D6 Brief 开工」才开实现旁支。
> 地面真相：`origin/develop` `3dac9e6f`（2026-11-27 读点）· D1–D5 已合 #1663 / #1674 / #1679 / #1682 / #1702 · 开闸 #1708 · 首包关闸 #1881
> 基线 Brief：[`task-email-sign-in-p0.md`](./task-email-sign-in-p0.md)（§4 旧拍「只留 Preferences / 避开 Sign in」**已被本刀书面推翻**）

---

## 0. 大白话摘要（给 PO）

现在换设备用邮箱找回，藏在设置里的二级页，标题也不叫登录，所以不像正规软件。你已经同意：菜单最上面写「Sign in」，登录后显示脱敏邮箱。本文件只把核实结果和实现规格写清楚。练习、购买、Focus Circle、研究分享**都不要求**先登这个号。邀请制第一份安装包仍关云端找回，那一版菜单不应假装已经能 Sign in。

---

## 1. 预检

| 问 | 答 |
|---|---|
| 有没有 PR | T93 实现与说明书均 **MERGED**；**没有**「Sign in 提到菜单顶 / 两步式登录卡」的 OPEN 或 MERGED 实现 PR |
| 开发是否已完成本次范围 | **否**。已完成的是 Preferences 里「用邮箱保存这段旅程」单页表单 |
| 本刀做什么 | 只文档。实现另开 `feature/t93-sign-in-discoverability` |

---

## 2. ① 需要或暗示「账号 / 邮箱」的功能清单

读点：`origin/develop`。原则：**没有功能把门闩设成「必须先走 T93 邮箱会话」**。登录仍是可选保险，不是门。

| 功能 | 用户可见位置 / 文案 | 要邮箱吗 | 是否依赖 T93 登录 | 结论 |
|---|---|---|---|---|
| **练习云备份 / 换设备找回旅程** | `⋯` → Preferences → Account 组 →「Save or restore with email」；卡标题 `EMAIL_JOURNEY_PANEL_TITLE`「Save this journey with email」；截图即此页 | 可选。OTP + `practice-backup` deviceToken | **就是** T93 | 唯一「像账号」的会话。不挡 Sit |
| **坐完一次轻提示** | `EMAIL_JOURNEY_SIT_PROMPT`「Want a way back if this device forgets?」 | 点了才进同一张卡 | 指向 T93，不强制 | 保留；实现后仍开同一入口 |
| **电脑空库芯片** | Electron 第一幕结束后 `EMAIL_JOURNEY_EMPTY_RESTORE`「Restore from email」 | 点了才进同一张卡 | 指向 T93 | 保留；不占冷启动 E01–E14 |
| **本地 Backup & restore** | Preferences → Backup & restore | 否。导出/导入 JSON 文件 | 否 | 换机主路径（首包也可用） |
| **Membership 换机恢复** | Support / Preferences → Subscription 卡底「Restore on another device」 | 收据邮箱 + 独立 OTP（`membership`） | **否** | 只恢复会员权益，不签发练习备份 token |
| **Sanctuary 换机恢复** | Sanctuary 卡「Restore on another device」 | 收据邮箱 + OTP（`sanctuary`） | **否** | 与旅程备份分开 |
| **请茶恢复** | Tip 卡 Restore | 付款邮箱查找，**不是** T93 会话 | **否** | 文案写明不共用 Sanctuary 码 |
| **Art collection 恢复** | 典藏卡 `YIN_ART_SIGNIN_*`：**「Sign in to bring pieces you already own」** / 按钮「Sign in」 | 该 SKU 的 restore OTP（`art-collection`） | **否**。文案却已用 Sign in | **暗示最强。** D6 实现后应改成「Restore with email」或「Verify email」，避免两套「Sign in」 |
| **Companion add-on** | Support 第五卡 | 购买邮箱在权益 KV；现网新结账暂停 | **否** | 文案「account」指购买记录，不是 T93 |
| **Newsletter / Stay in touch** | Preferences 同组 ✉ | 通讯录邮箱 | **否** | 不是凭证 |
| **Focus Circle** | You are not alone → Focus Circle | 本机 `focus-tiger.focus-circle-identity.v1`，不跟邮箱 | **否** | 普查仍写：统一 Login 未到 |
| **T54 练习效果计数** | Privacy 开关，默认关 | 本机研究代号，无邮箱 | **否** | 不上送倾诉原文 |
| **研究共修（T80–T84）** | 首包：**菜单不应出现**；同意本机、无邮箱 | **否** | 独立于 T93 |
| **安静同坐 / 灯火** | 默认开，Privacy 可关 | 随机会话 id，无邮箱 | **否** | |
| **核心练习** | Sit / Breath / Journey | 否。`PRIVACY_SHEET_INTRO`：core practice does not require an account | **否** | 登录不是门 |

**清单不是空的，但「要求登录才能用」是空的。** 用户感觉「不少功能要账号」，多半来自：（1）各购买卡各自填邮箱；（2）典藏卡已经写 Sign in；（3）找不到正规入口。

OTP purpose 仍是：`sanctuary` · `membership` · `practice-backup` · `companion-addon` · `art-collection`。**没有**独立 `sign-in` purpose。D6 **继续复用 `practice-backup`**。

---

## 3. ② 当前入口：组件与菜单注册（改动面）

### 3.1 用户现在怎么走到截图那一页

1. 点右上 `⋯`（宽）或底缘抽屉（窄）——逃生舱，不走 overlay 仲裁。
2. 滚到 **Preferences** 组（列表后部；宽屏扇面也不在最前）。
3. 进入偏好中心，再点 Account 组里带云朵图标的一行。
4. 偏好中心把 `#email-journey-restore-panel` **嵌进设置页**（`preferenceSheetEmbed.js` 的 `account`），顶部出现「Back to Preferences」——即截图。

菜单注册：

| 锚 | 现状 |
|---|---|
| `idleChromeOrchestration.js` `accountRow` | 开闸：`proxy: 'account'`，`labelKey: EMAIL_JOURNEY_MENU_LABEL`（「Save or restore with email」），`testId: idle-account-email-restore` |
| 关闸 / 商店 | `ACCOUNT_MENU_PLACEHOLDER` 或 `EMAIL_JOURNEY_MENU_STORE_OFF`，`interactive: false` |
| `listPreferenceCenterSubgroups` | Account 组：newsletter + **accountRow** + Help + local-backup + … |
| 面板 | `EmailJourneyRestorePanelUI.js` · `data-testid=email-journey-restore-panel` |
| 可达性契约 | `menuReachabilityContract.js` `account` → `#email-journey-restore-panel` |
| KB 路径 | `⋯ → Preferences → Save or restore with email` |
| 已绑定 UI | 同行仍叫保存文案；卡内 `EMAIL_JOURNEY_BOUND` + **明文全邮箱**（未脱敏）；Sign out / Delete 与发码表单同一页 |

表单一次铺开：Email、Code、同意勾选、Send code、Verify（未绑定）；已绑定才藏发码钮。与截图一致。

### 3.2 目标信息架构（PO 已点头）

| 项 | 目标 |
|---|---|
| 位置 | `listSecondaryChromeEntries` **最顶部一行**（Practice 组之前），宽窄同一列表。**不是**新角落按钮，不改左上日历 |
| 未登录 | 行文案 **Sign in** |
| 已登录 | 行文案 **脱敏邮箱**（`s•••@gmail.com`）；点开账号页 |
| Preferences | **不再挂**同一行（避免两入口）。Newsletter / Backup 文件导出仍留设置 |
| 嵌页 | 从 `PREFERENCE_SHEET_EMBED_SELECTORS.account` **移除**，打开独立玻璃卡（不再「Back to Preferences」） |
| 商店渠道 | 仍不可点或整行隐藏（Setapp / MAS） |
| 首包关闸 | 邀请 DMG `VITE_FT_PRACTICE_BACKUP_CLOUD=0`：**不要**露出可点 Sign in。可隐藏整行，或灰行「Sign in not on this build」——实现时二选一，**推荐隐藏**，避免 coming soon 回潮 |

### 3.3 实现改动面（下一刀，本 PR 不写代码）

| 文件（预计） | 为什么 |
|---|---|
| `idleChromeOrchestration.js` | 顶行插入；已登录换 labelKey；不再 `flattenPreferenceCenterEntries` 塞 account |
| `preferencesCenterCatalog.js` | Account 组去掉 email 行 |
| `preferenceSheetEmbed.js` | 去掉 `account` 嵌入 |
| `EmailJourneyRestorePanelUI.js` | 两步式 + 未登录/已登录两态；脱敏；关嵌入后恢复自有 Close |
| `locales/slices/email-journey-restore.json` | 新键；en/ja 完整、zh 草稿 |
| `kbLiveEntryRegistry.js` | menuPath 改为 `⋯ → Sign in` |
| `menuReachabilityContract.js` / `menu-full-reachability` | 顶行可点；Preferences 不再含 account |
| `MENU_CHROME_CENSUS.md` §1.3 / 机器块 | 实现 PR 同批 `audit:menu-chrome-census --write` |
| `task-wide-menu-radial-index.md` | 扇面第一枚语义从练习组变为 Sign in——**须在实现 Brief 写清：顶行进列表，不进五图标径向快捷** |

**已好清单（实现时守住）：** ⋯ 逃生舱不因 overlay 隐藏；Esc 只关顶层；Support FAB / 付款卡不动；购买 Restore 各卡不合并进 Sign in；Journey 角落不复活登录；Confide 原文不上云；合并去重规则不动。

---

## 4. ③ 两步式登录卡 + 已登录账号页

### 4.1 未登录 · 步骤 1（只邮箱）

- 标题：Sign in with email
- 说明一句：可选；用来在别的电脑或浏览器找回练习记录
- 控件：Email · **Continue**（或 Send code）
- 勾选框 **删除**。按钮下小字承担同意（发码即同意把练习天数快照存到该邮箱；可读、不加密）
- 0–1s：Continue → Sending…

### 4.2 未登录 · 步骤 2（验证码）

- 邮箱只读 + Change email 回到步骤 1
- Code 此时才出现
- 按钮：Verify
- 成功 → 切账号页（脱敏 + 备份已开）

### 4.3 已登录 · 账号页

- 标题：Account（或 Your email）——**不是**资料/头像
- 脱敏邮箱
- 备份状态一行（本机已保存 / 上次同步失败可 Retry）
- Sign out on this device（清 token，**不**删云）
- Delete cloud copy（再要一次码）
- 不做：密码、头像、显示名、设备列表、强制登录墙

### 4.4 文案表（实现写入 `email-journey-restore.json`）

| 键（建议） | en | ja | zh（draft，不对外 claim） |
|---|---|---|---|
| `EMAIL_JOURNEY_MENU_SIGN_IN` | Sign in | サインイン | 登录 |
| `EMAIL_JOURNEY_MENU_SIGNED_IN` | `{masked}` | `{masked}` | `{masked}` |
| `EMAIL_JOURNEY_PANEL_TITLE` | Sign in with email | メールでサインイン | 用邮箱登录 |
| `EMAIL_JOURNEY_PANEL_BLURB` | Optional. Use this to bring practice days back on another computer or browser. Thought Drop words stay on this device. | 任意です。別のパソコンやブラウザに練習日を戻すためのものです。寅と話すの原文はこの端末に残ります。 | 可选。用来在另一台电脑或浏览器找回练习天数。觉察一句的原文仍留在本机。 |
| `EMAIL_JOURNEY_FOOT_CONSENT` | Sending a code means you agree to save practice-day snapshots to this email. They are stored as readable records, not encrypted. | コードを送ると、練習日の控えをこのメールに保存することに同意したことになります。読める記録として保存し、暗号化しません。 | 发送验证码即表示你同意把练习天数快照存到这个邮箱。按可读记录存放，目前不加密。 |
| `EMAIL_JOURNEY_CONTINUE` | Continue | 続ける | 继续 |
| `EMAIL_JOURNEY_CHANGE_EMAIL` | Use a different email | 別のメールにする | 换一个邮箱 |
| `EMAIL_JOURNEY_ACCOUNT_TITLE` | Account | アカウント | 账号 |
| `EMAIL_JOURNEY_BACKUP_OK` | Practice days are saved with this email. | 練習日はこのメールで保存されています。 | 练习天数已用这个邮箱保存。 |
| `EMAIL_JOURNEY_SIGN_OUT` | Sign out on this device | この端末からサインアウト | 在此设备退出登录 |
| `EMAIL_JOURNEY_DELETE_CLOUD` | Delete cloud copy | クラウド控えを削除 | 删除云端副本 |
| 保留 | Send code / Verify / Sending… / 状态句 / Not now / Restore from email | 同切片已有 ja | 同切片已有 zh draft |

脱敏规则（实现锁单测）：本地 `s` + `•••` + `@` + 域名；极短本地名仍至少遮到不可整段复制识别。菜单行与账号页同一函数。

坐完提示 / 空库芯片：**文案可保持**，点击改为打开顶行同一张卡（步骤 1 或账号页）。

**典藏卡** `YIN_ART_SIGNIN_*`：不在 D6 必做；**建议同批或紧随的文案刀**改掉 Sign in，避免用户以为登了 T93 就会带回画作。

---

## 5. ④ 冲突点（实现前已扫；PO 已覆盖入口两项）

对照 `SCENARIO_TESTS.md` 菜单可达、场景 Z 备份、冷启动 AD/V、隐私路径。

| 相邻 | 轴 | 判断 | 处置 |
|---|---|---|---|
| T93 §4「入口只留 Preferences」+ 禁止 Sign in 主标题 | 职责 / 语气 | **已被 2026-11-27 PO 点头推翻** | 本文件为新 SSOT；旧 Brief 加失效句 |
| `MENU_CHROME_CENSUS` §1 第 3 条「Preferences 真入口」；§1 第 4 条禁止再搬菜单**位置**（左上 vs 右上） | 职责 | 顶行仍在 `⋯` 内，**不**开左上汉堡 → 与第 4 条无冲突。第 3 条要从「设置里一行」改成「列表顶行 Sign in」 | 实现 PR 改普查；本刀只预告 |
| 宽屏径向索引把练习组放在扇面 | 强度 | Sign in 进**列表顶**若误挂五图标，会挤掉练习快捷 | **推荐：只改 `⋯` 展开列表顺序，不进径向五图标** |
| 偏好中心「Back to Preferences」 | 语气 | 正是「不正规」来源 | 取消嵌入 |
| 冷启动第一幕 E01–E14 | 强度 | 顶行不自动弹出。空库芯片仍须 `firstSceneOpen === false` | 不改仲裁表；D4 门闩保持 |
| 坐完提示 overlay | 强度 | 已登记 `EMAIL_JOURNEY_SIT_PROMPT`，让路 Celebrating / 付款 | 不新增 busy |
| `PRIVACY_NOTICE.md` §4 首包「不提供填邮箱找回」 | 职责 | 邀请包装 `practiceBackupCloudEnabled=false`。可点 Sign in 会与对外声明打架 | **关闸构建隐藏顶行**；开闸包才显示。开闸对外声明走已有 `PRIVACY_SHEET_CLOUD_GATE_ON` |
| Newsletter 同组 | 职责 | 通讯录 ≠ 登录 | 设置里留下 newsletter，登录搬走 |
| 购买 Restore 各卡 | 职责 | 并存；不合并进 Sign in 卡（付款保护路径） | 已好清单 |
| 典藏「Sign in」 | 语气 | 两处 Sign in 语义不同 | 见 §4.4 建议改 restore 文案 |
| Focus Circle | 职责 | 仍本机 ID | 不写统一 Login |
| 强制登录墙 | 强度 | PO：不做 | 不挡 Sit |

变体矩阵 / 点击反馈：见下节（实现开工用）。本刀无用户路径变更（纯文档）。

### 5.1 变体矩阵（A10 · 留给实现 Brief）

| 变体 | 预期 |
|---|---|
| 宽屏 `⋯` 列表顶 | 第一行 Sign in 或脱敏邮箱；0–1s 开卡，无 Back to Preferences |
| 窄屏抽屉顶 | 同文案 |
| 宽屏径向五图标 | **不变**（Sign in 不进扇面） |
| 关闸邀请包 | 无顶行或不可点且不写 coming soon |
| Setapp/MAS | 无顶行 |
| en / ja | claim |
| zh | draft |
| 已登录再开 | 账号页，不是发码表 |

### 5.2 点击反馈（A14 · 留给实现）

| 控件 | 0–1 秒 |
|---|---|
| 菜单 Sign in | 玻璃卡步骤 1 |
| Continue | Sending… |
| Verify | 忙碌 → 账号页或错误 |
| Sign out | 行变回 Sign in |
| Delete cloud | 要码 → 成功句 |
| 设计静默 | 关闸无行 = 渠道策略，须在 SILENT 或普查写明，禁止假可点 |

后台网络：D6 **不**改 Idle flush；三问仍沿用 T93 D3。

---

## 6. 明确不做

密码、第三方登录、头像资料页、强制登录墙、新 `sign-in` OTP purpose、Circle 绑邮箱、把购买 Restore 并进此卡、改隐私声明首包 §4 事实（仍是关闸邀请包）、本 PR 改运行时。

---

## 7. 下一刀口令

新 Chat：**按 T93 D6 Brief 开工 Sign in 可发现性**（建议大任务）。第一刀只做菜单顶行 + 两步卡 + 文案切片 + 普查/可达性测试。不要重开 D1–D4。

---

## 8. 冲突扫描（本 docs PR）

本 PR 只加方案与失效旧拍板句，**不把普查现状改成「已经在菜单顶」**（代码还没有）。三轴：不加重 Sit；语气按 PO 改用 Sign in；职责上旧「只留 Preferences」与新顶行冲突——以 2026-11-27 点头为准，在旧 Brief 标明失效。
