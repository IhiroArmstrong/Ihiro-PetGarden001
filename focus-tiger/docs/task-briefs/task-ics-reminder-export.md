# Task Brief · 提醒 .ics 导出（添加到日历）

> **状态**：**PO 已点头（2026-11-10 ·「深链+ics」）** · Brief 已锁 · **无运行时**（须深链 A 合入后再开工）。  
> **人话**：在现有「每天几点来坐」设置里加「添加到日历」：手机本地生成一份日历文件给你下载。App 改时间后，日历 **不会自己变**。  
> **类**：实现时 **B 类**（设置面板新按钮 + 下载）。本 PR 只锁 Brief。  
> **依赖**：事件 URL 要能一键回 App 开坐 → **先点头并实现** [`task-deep-link-shortcuts-cookbook.md`](./task-deep-link-shortcuts-cookbook.md) 的 Sit 深链（至少 Web query + Electron 同键）。本 Brief 可先点头；**运行时 PR 不得早于深链 A 刀合入**（否则 URL 是死链）。  
> **槽位建议**：可选；本 PR **不改**术语表热点文件。  
> **git 依据**：2026-11-07 无 OPEN/MERGED 的日历导出实现 PR。  
> **不是**：webcal 订阅服务器、Google/Apple 日历 OAuth、读取用户日历、把 .ics 说成「同步」、提醒族新 busy 点。

**口令（点头且深链 A 已合后）**：`按 ics 导出 Brief 开工`。

---

## 0. 大白话

你已经可以在 App 里设一个每天提醒。这一份书是让那个设置多一个「放到我自己的日历」：点一下就下载一份日历文件，里面是重复的「来坐」事件，点事件可以回到 App。改 App 里的时间，旧日历条目不会跟着改，所以文案不许写「同步」。

---

## 1. 功能范围

在 [`ReminderPreferenceUI.js`](../../src/ui/ReminderPreferenceUI.js)（Idle 时钟面板，z=35）增加 **「添加到日历」**：

1. 用当前已保存的 `{ hour, minute }`（未开提醒则按钮禁用，说明先打开提醒）。  
2. **本地**拼 RFC 5545 `.ics`，浏览器下载（无云、无账号、无 OAuth）。  
3. 重复：每日 `FREQ=DAILY`；可选工作日 `FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR`。  
4. 可选 `VALARM`（显示提醒，建议提前 0 分钟或 5 分钟——实现锁一个默认，设置里可关闹钟，避免双提醒吵）。  
5. `URL:` 字段 = 深链（Web https query 或桌面 `focus-tiger://app/?product=1&start=sit&min=…`）。分钟数：用本场默认 5，或用户当前 Focus 预选档（若在 1/3/5/10/20 内）；**不得**读 Confide。

### 1.1 与提醒族的关系（不新增 busy）

| 现网 | 本功能 |
|---|---|
| `evaluateInAppReminderBanner` 到点横幅 | **不改**判定、不改限频、不改存储形状 `{ hour, minute }` |
| 横幅 z=16 / 窄屏 34 | 导出不是横幅，不抢槽 |
| 无浏览器 Notification 权限 | .ics 去的是 **系统日历**，权限在日历 App，不在我们 |

导出成功 **不是** `overlayBusy` 源。禁止把下载挂进精灵占用。

工作日重复若现网偏好没有「工作日」字段：第一刀 UI 用面板内一次选择（仅影响这份 .ics，**不写回** `reminder-preference.v1`），避免扩提醒 schema。我认为最合理的是：**第一刀 .ics 自带「每日 / 工作日」单选，只影响文件。** 弱方案是先改提醒键形状（会碰横幅判定，超出本刀）。

---

## 2. 诚实性（文案硬规则）

- 中性标题例：`Focus Tiger · Sit`（en/ja ready；zh 草稿 `坐禅小老虎 · 静坐`）。备注同样中性。  
- **禁止**「同步」「将一直与 App 保持一致」「自动更新」。须有一句：改 App 提醒后请重新导出；旧事件可能仍在。  
- 不含情绪、倾诉、Memory、地点精确到家。日历可能被家庭共享或企业日历看到。

### 2.1 UID 与重复导入（已搜他人验证 · 实现前再搜一轮）

稳定 UID 建议：`focus-tiger-reminder-sit-<host-or-app>@local`（不含水印个人信息）。同一用户重复导出 **保持同一 UID**，`SEQUENCE` 每次导出 +1，`DTSTAMP` 刷新。

| 客户端 | 他人结论（非本产品实测） | 对本产品的诚实句 |
|---|---|---|
| Google Calendar | 同 UID 再导入倾向 **更新** 而非第二条（[ICS 排错 2025](https://synara.events/articles/ics-troubleshooting-guide-2025)） | 文案可写「有的日历会覆盖旧的这一条」 |
| Apple 日历 | 对更新较严；`SEQUENCE` 不增可能 **静默不更新**；DTSTART 变了有人报告 **两条并存**（[icalconverter 合并说明](https://icalconverter.com/blog/merge-multiple-calendars-ics)） | **不得**承诺覆盖；验收 D 须 PO 手测 |
| Outlook | 同 UID 文件导入常 **再添一条**；更新语义更吃 METHOD/ORGANIZER | 文案按「可能出现两条」写 |

**未**找到「纯本地下载无 ORGANIZER 的 VEVENT、三家行为」的完整对照实验。因此：文案默认按 **可能重复** 写；用 UID+SEQUENCE 是尽力，不是保证。

`METHOD:PUBLISH`（无 ATTENDEE）更适合本产品；不要假装会议邀请。

---

## 3. 与深链 Brief 的顺序

```
深链 Brief 点头 → 深链 A（解析）合入
                 → 本 Brief 运行时（.ics URL 才能点得开）
深链 B（Web 接线）建议先于或同周于 .ics，否则用户点日历事件只会打开壳停在 Idle
```

`.ics` 的 `URL`：

- 网页用户：当前 `location.origin` + `/?product=1&start=sit&min=5`
- Electron：`focus-tiger://app/?product=1&start=sit&min=5`

禁止在 .ics 里写还没实现的 `focustiger://`。

---

## 4. 隐私

- 文件在用户本机生成；我们的服务器 **收不到** 日历内容。  
- 无后台网络。三问：**不涉及后台网络**。  
- 防剽窃层 **不算**（本地文件）。  
- Never-Cloud：是。

---

## 5. 技术决策（推荐 + 理由）

### 5.1 时区：浮动墙钟 vs TZID

现网提醒只存 **本地时分**，无 IANA 区。

| 方案 | 含义 | 评价 |
|---|---|---|
| **A 浮动时间（推荐）** | `DTSTART:20260115T090000` 无 Z、无 TZID；RRULE 按墙钟 9:00 | 与提醒族语义一致（「每天九点」跟人所在显示时钟）。夏令时两边都仍是 9:00 墙钟。旅行时日历 App 解释可能不一致，须在文案写「按你导入时的当地钟点」 |
| B TZID=导出瞬间 `Intl` 时区 | `DTSTART;TZID=America/Los_Angeles:…` + `VTIMEZONE` | 跨时区旅行更稳，但用户从没「选定时区」；导出在东京、打开在纽约会钉在东京 9 点。比现网提醒更重 |

**我认为最合理的是 A。** 与 `reminder-preference` 同形。弱在 Google 偶发把浮动当 UTC——验收 D 若发现偏移，再单开补丁改 TZID，不在第一刀赌。

### 5.2 Electron 下载 / 打开

| 方案 | 评价 |
|---|---|
| **A 渲染层 Blob + `<a download>`（推荐）** | 与 Web 同一条路径；电脑版同样弹出下载。零新 IPC |
| B `dialog.showSaveDialog` + 主进程写盘 | 更像原生，但新 IPC、要扩 preload 白名单，超出「提醒面板一个钮」 |
| C 下载后 `shell.openPath` 自动丢给日历 | 可能突然打开日历 App，偏吵 |

**我认为最合理的是 A。** 失败时按钮 fail 文案，不静默。

### 5.3 不新增 busy

下载同步、短于 1s、无精灵。不进入 `evaluateInAppReminderBanner`。不改 `DailyCompletionStore`。

---

## 6. 变体矩阵（A10）

| 变体 | 入口 | 预期 | 自动化 |
|---|---|---|---|
| 提醒已开 · 每日 | 时钟面板 | 点「添加到日历」≤1s 开始下载 `.ics`；含 `RRULE:FREQ=DAILY`、稳定 UID、`URL` 深链 | 单测生成字符串 + e2e 点击（不测系统日历） |
| 提醒已开 · 工作日 | 面板选工作日再点 | `BYDAY=MO,TU,WE,TH,FR` | 单测 |
| 提醒未开 | 按钮禁用 + 说明 | 不下载 | e2e |
| 宽 / 窄 | 同一面板 | 钮可见，不挡 Support | e2e 375 或可达网 |
| en / ja / zh 草稿 | 标题与诚实句 | 无「同步」字样 | locale 切片 + 单测禁词 |
| Electron | 同钮 | 下载而非打不开 | 层 C 人工 |
| VALARM 关 | 面板 | 文件无 VALARM | 单测 |

---

## 7. 点击反馈（0–1 秒）（A14）

| 控件 | 0–1 秒 | 三态 |
|---|---|---|
| 添加到日历 | 钮进入 pending（「正在准备文件」） | 成功：浏览器下载；失败：可再点，不空白 |
| 每日/工作日选择 | 选中态可见 | 不写提醒键 |
| 未开提醒时点击 | 不可点；若仍点到 = bug | — |

---

## 8. 边缘状态（A14）

| 边缘 | 预期 |
|---|---|
| 无提醒值 | 禁用 |
| 生成器抛错 | fail 句，不崩 |
| 日历导入后点 URL 但深链未上线 | 本刀不得合并早于深链 A；若只开网页：至少打开产品壳 |
| 企业日历共享 | 标题中性已锁 |
| 重复导入 | 见 §2.1；UI 不假装覆盖成功 |

---

## 9. 共用机制核对

- **overlayBusy**：导出 **不**计入。提醒面板已是 z=35 设置卡；新按钮不新开 overlay 状态。  
- **HUD 呼吸**：不触及。  
- **z / dim**：按钮在 `#reminder-preference-panel` 内，沿用已登记 z=35；**禁止**再套一层 viewport 遮罩。Support FAB 仍须可点（面板开着时现网本就可能挡一部分——本刀不恶化，不改 Support 豁免）。  
- **新建可点击叠层**：否。O-04 跳过：无新 `OVERLAY_UI_SURFACE`。

本次不新增练习种类（Sit 只出现在日历标题与 URL）；宽窄须对齐（矩阵已列）；多语言入口已列。

---

## 10. 验收

| 层 | 内容 |
|---|---|
| 格式 | 单测：`BEGIN:VCALENDAR` / `VERSION:2.0` / `VEVENT` / UID / RRULE / 无 METHOD:REQUEST / URL 含 `start=sit` / SUMMARY 无倾诉词 / 正文无「同步」 |
| 三客户端 | **PO 人工**：Apple 日历、Google Calendar、Outlook 各导入一次每日规则；看是否重复、墙钟是否 9:00、点 URL 是否回 App（深链已上之后） |
| 回归 | 提醒横幅仍只在到点+今日未练出现；不因导出多弹 |

规则：请用户导日历前，Agent 再搜一轮 UID 行为并贴链接（本 Brief §2.1 为 2026-11-07 快照）。

---

## 11. 明确不做

- `webcal://` 订阅（要服务器长期挂文件）  
- Google Calendar API / Apple CalDAV OAuth 写入  
- 读取用户已有日历  
- 改提醒存储为带时区对象（除非 PO 推翻 §5.1）  
- 把导出算进练习完成

---

## 12. 开工门禁

1. 本 Brief PO 点头（时区浮动、Blob 下载、工作日只影响文件）。  
2. 深链解析已合 **或** 同栈 stacked PR 且本 PR 标明依赖。  
3. 无同内容 OPEN 实现 PR。  
4. 不 Redeploy；不改 GLOSSARY。

---

## 13. 待 PO 拍板

> **地面真相**：依赖深链 Brief；深链说明书已合 `develop`（#1596）。本 Brief 点头后仍须 **深链 A 刀解析合入** 再开工运行时。  
> **合成 Agent + 分析师（2026-11-08）一致推荐**：

1. 时区：**浮动墙钟**（墙上钟点；夏令时按客户端浮动时间，见正文 §5 推荐）。  
2. VALARM：**默认无闹钟**（避免与 App 内提醒横幅叠响；用户可在日历 App 自加）。  
3. 重复：**每日 + 工作日** 第一刀都做（仅影响下载的 `.ics` 字符串，不改 `reminder-preference.v1`）。  
4. Epic：同深链，挂栖居壳层，不新建 Epic。  
5. 启用信号：仅本机计数（导出次数），不暗示云端 A/B（见深链 Brief §5.5）。

**PO 点头（2026-11-10）**：书面「深链+ics 点头」— 本节第 1–5 条 **已锁**。运行时口令 `按 ics 导出 Brief 开工` **仅当**深链 **A 刀** 已合 `develop` 后执行。

---

## 14. 冲突扫描

相邻：提醒族横幅、T44 系统通知（坐满才发，与日历无关）、T61 收工时间（**禁止**写入 reminder 键）、深链开坐、Honesty。

| 轴 | 判断 |
|---|---|
| a. 强度 | 多一次下载 < 到点催促。诚实「不会自动更新」避免用户以为比横幅更强 |
| b. 语气 | 中性事件名，不监工「你今天还没坐」进日历标题（完成态只由 App 横幅管） |
| c. 职责 | 日历 = 用户自己的回流触点；App 横幅仍是唯一应用内到点通道。不是 OAuth 日历产品 |

**结论：无冲突。** 注意 T61 收工邀请不得混进同一 .ics。
