# Task Brief · T62 晚间练习事实进练习纸

> **状态**：**扩写待点头**（2026-10-28 治理登记 + 本稿补全规格；**未点头不得写代码**）。  
> **代号**：**T62**。槽位 **未排期** · 状态 **搁置**。  
> **类**：**B 类**（练习观察纸新增可选事实句 + 单独同意 + 可清空）。过 **T55** 契约（**C-03 / C-04 / C-06 / C-11**）。  
> **依赖**：无硬依赖 **T61**（#1455 / #1456 已合）；**默认与 T61 分开交付**，不捆绑同一 PR。  
> **不是**：**T61**（收工时间 / 收工邀请）。**不是** T54 研究分享（#1434 已合层）。**不是** 睡眠诊断、健康分、推送催促。  
> **SSOT 盘点**：[`late-night-behavior-inventory.md`](../late-night-behavior-inventory.md) §3。方向锁：[`PRACTICE_PAPER.md`](../PRACTICE_PAPER.md)（本刀须 PO **书面改锁** 一小节，见 §1.3）。

## 0. 大白话

若要在练习纸里写「最近有几个晚上练到很晚」，不能只靠「有没有练过」那套日历——还得知道**结束时刻**（或等价事实）。现网没有这份表。要做：用户先单独同意；只在本机记「哪一天、大概多晚结束」；只在观察纸里用中性句展示；可关、可清、不进研究分享、不推送、不带「该睡了」的建议。

## 1. 目标与非目标

### 1.1 目标

1. **可选事实句**：在成长旅程详情 · 练习观察纸区域（节奏句与 Sit & Breath 卡之间或卡内脚注——**PO 点头时二选一**，默认建议 **节奏句下方独立一行**）展示**滚动 7 个本地日历日**内、满足阈值的「晚间仍坐着」**天数**（去重按日，不数场次）。
2. **默认关**：未同意前**不写入、不展示**；同意前须可读披露（采什么、不采什么、可清）。
3. **本机 ledger**：按日追加/更新，供观察纸读取；**不进**练习云备份；**不进** `buildT54ResearchUploadPayload` / Worker 白名单。
4. **重置**：新键进 `FOCUS_TIGER_LOCAL_STORAGE_KEYS`；`clearAllFocusTigerLocalState` 清光；单测钉住（吸取 **T60**）。
5. **方向锁合规**： rhythm 判定表与 Sit & Breath 卡逻辑**不改**；晚间句是**额外可选句**，不是 0–100 分、不是红黄绿、不是「熬夜诊断」。

### 1.2 非目标

- 不做睡眠监测、作息教练、连续熬夜小时数、改善习惯建议。
- 不用自然周「本周 vs 上周」口径（与观察纸一致，用**滚动 7 日**）。
- 不替代 **T61** 收工邀请；不读 `work-end-preference` 做推断。
- 不上送 **T54**；不暗示 **T54** 90 天实验已启动。
- 不把 Honesty 补登、微仪式、Recover 写成「晚间练习」（只认**计时专注结束**写盘路径，与 Journey 写入对齐——见 §2.2）。

### 1.3 方向锁变更（PO 点头 Brief 时须同时书面确认）

[`PRACTICE_PAPER.md`](../PRACTICE_PAPER.md) 现写「不加新计数器」。本刀**不是**给 rhythm 表加计数器，而是：

- **新增**一小节「可选 · 晚间练习事实句（须单独同意 · 默认关）」：允许**一条**中性观察句 + **本机 ledger**（按日、仅结束时刻事实）；仍禁止健康分、睡眠结论、推送。
- 实现 PR **须**同批改 `PRACTICE_PAPER.md` 该节（治理或实现 docs 同 PR，按 PO 指定）；**未改锁不得写运行时**。

## 2. 数据与写入

### 2.1 建议存储（实现时键名可微调，须登记 SHARED_RESOURCES + localStateKeys）

| 键 | 内容 |
|---|---|
| `focus-tiger.evening-practice-facts-consent.v1` | `{ enabled: boolean, consentedAt?: string ISO }`。`enabled` 默认 **false**。关同意 = 停写 + 隐藏句（**是否删历史**见 §2.4 PO 选项）。 |
| `focus-tiger.evening-practice-facts.v1` | `{ entries: EveningFactEntry[] }`，按 `date` 去重，最多 **90** 条滚动（与 `practice-days` 窗口同量级）。 |

**EveningFactEntry（建议）**

| 字段 | 类型 | 说明 |
|---|---|---|
| `date` | `YYYY-MM-DD` | 本地日历日（与 `practice-days` / Journey `journeyLogDateKey` 一致） |
| `endHour` | 0–23 | 该日**最近一次** qualifying 专注结束的本地小时 |
| `endMinute` | 0–59 | 同上 |

**禁止字段**：窗口标题、应用名、倾诉原文、键值、睡眠标签、用户自评。

### 2.2 何时写入（qualifying 事件）

- **触发点**：与 **Journey Log 追加行**同一事务（计时专注正常结束 / Rise 等已写 Journey 的路径）；**Honesty 补登不写**。
- **阈值常量**（Brief 建议，PO 可改数字、不可做远程开关）：`EVENING_PRACTICE_FACT_END_AT_OR_AFTER_HOUR = 1` → 本地结束时刻 **≥ 01:00** 且 **&lt; 06:00** 才记（与深夜披毯带重叠但**语义不同**：披毯是阿寅休息，本 ledger 是练习结束事实）。
- **同日复写**：同一 `date` 多次 qualifying 结束 → 只保留**更晚**的 `endHour:endMinute`（观察「最晚一次」）。
- **未同意**：跳过写入（零副作用）。

**为何不只用 Journey Log 推导？** Journey 仅 **30** 行且不含所有练习路径；滚动 7 日计数在活跃用户下会漏天。盘点 §3 要求按日保存——独立 ledger 与 T60 白名单一致。

### 2.3 观察纸如何读

- 窗口：**滚动 7 个本地日历日**（含今天），与 `PRACTICE_PAPER_WINDOW_DAYS` 对齐。
- 变量：`lateEveningDays` = 窗口内 ledger 条目数（按 `date` 去重，且 entry 仍满足阈值定义）。
- **展示门闩**：`consent.enabled === true` **且** `lateEveningDays > 0` **且** 观察纸未隐藏（`practice-paper-hidden` ≠ `'1'`）。
- **措辞**：禁止「熬夜」「不健康」「该休息」。inventory 回顾式示例：「这周有 3 个晚上，坐在凌晨 1 点之后。」→ 对外须改为**滚动 7 日**口径，且 PO 选是否**写具体数字**：
  - **草案 A（带数）**：「最近 7 天里，有 {n} 个晚上练到了很晚。」（n 仅 1–7，不用百分号）
  - **草案 B（不带数）**：「最近 7 天里，有几个晚上练到了很晚。」（n≥2 才出现句；n=1 时 PO 定是否仍显示——建议 **n=1 也显示** 草案 A 带「1」）
- 三语进 `practice-paper.json` slice；**ja 须母语者审**。
- **与 rhythm 句关系**：两句可同时出现；晚间句**不参与** rhythm 判定表 1–8 行。

### 2.4 PO 待定（扩写稿须书面选一项）

| 议题 | 选项 |
|---|---|
| 关同意后历史 ledger | **A** 保留但不展示（再开同意可继续用） · **B** 关同意即清空 ledger（建议 **B**，与「一键清」一致） |
| 展示位置 | **A** 节奏句下独立一行 · **B** Sit & Breath 卡展开脚注（建议 **A**） |
| 披露入口 | **A** 观察纸区域首次开启 · **B** Privacy 面板同步说明（建议 **A+B** 同文案） |

## 3. 同意、披露与清空

- **披露最低栏**：只记「哪一天的练习结束时刻（本地钟）」；不记内容、不记睡眠；默认关；可关可清；不进研究分享、不进云端备份。
- **首次开启**：须确认一步（非 Stripe）；拒绝则保持关。
- **一键清空**：只清 `evening-practice-facts.v1`（ consent 可保持开或 PO 选一并关——建议 **只清 facts、consent 保持** 以便用户知道仍 opted-in 但无数据）。
- **练习云备份**：两键 **不在** v2 八 key 白名单（与 `practice-paper-hidden` 同）。

## 4. 冲突扫描

对照场景 **AV**（练习观察纸）、**D** / **AD**（深夜披毯）、**T61** 收工邀请、**T52/T53** 觉照、Companion **C-03–C-06**。

| 轴 | 结论 |
|---|---|
| **强度** | 无新推送；句子随观察纸打开才见；每日最多随详情刷新，不弹窗。 |
| **语气** | 事实句不带账、不评判、不用「熬夜」；与 inventory 禁止句一致。 |
| **职责** | 不是 Yin「看出你熬夜」；不是 T61「你说要收工」；不是 rhythm 分数。披毯 / 收工 / 晚间事实**三句不得合并**成睡眠教练。 |

**无用户路径**（本 Brief 文档阶段）。

## 5. 变体矩阵

| 变体 | 前置 | 预期 | 自动化 |
|---|---|---|---|
| 默认 | 未同意 | 无写入；观察纸无晚间句 | 单测 |
| 同意开 · 无 qualifying 结束 | 7 日内无 ≥01:00 结束 | 无晚间句 | 单测 |
| 同意开 · 1 个 qualifying 日 | 1 次结束 01:30 | 句出现；n=1 文案 | 单测 + locale |
| 同意开 · 3 个不同 qualifying 日 | 滚动 7 日内 | 句 n=3（若 PO 选草案 A） | 单测 |
| 关同意 | 曾有 ledger | 不展示；写入停（删历史按 §2.4） | 单测 |
| 隐藏观察纸 | hidden=1 | 晚间句与 rhythm、卡一起藏 | 单测 |
| Honesty -only 日 | 无 Journey 行 | ledger **不**记；晚间句不出现 | 单测 |
| en / zh / ja | 同意开 · 有句 | 三语披露 + 事实句 | locale 切片 |
| 跨本地午夜 / DST | 结束时刻边界 | 按本地日历日与本地时分，禁止 ms÷24h | 单测（照 rhythm 表 DST 行） |
| T54 分享开 | consent product_improve | payload **不含** evening keys | `t54ResearchUpload.test.js` 扩展 |

## 6. 点击反馈（0–1 秒）

| 控件 | 0–1 秒 | 持久化 |
|---|---|---|
| 开启「记录晚间练习时刻」 | 开关或按钮进入 pending；披露已读才可开 | 成功：`consent.enabled=true` + 可选 toast「已开启」；失败：回关 + 一句可重试 |
| 关闭同意 | 立刻停写；隐藏句 | 若 PO 选 §2.4 B：同步清空 ledger |
| 一键清空晚间记录 | 确认 chip / 二次确认 | 成功：facts 空；失败：保留原数据 + 短句 |
| 打开 Privacy 链接 | 跳转或展开既有 Privacy 段 | 无 mutation |

## 7. 边缘状态

| 边缘 | 预期 |
|---|---|
| 写盘失败 | 该次结束仍完成 Journey；不阻塞练习；不弹 scare |
| ledger 满 90 | 丢最旧 date（与 practice-days 策略对齐） |
| 用户改系统时区 | 新写入用新时区；历史 date 键不 retroactive 改 |
| 应用内重置 | facts + consent 全清 |
| Journey 30 行挤掉旧行 | **不影响** ledger（独立键） |
| 与 T61 同晚 | 收工邀请与晚间事实句**独立**；不因 ledger 自动多开口 |

## 8. 共用机制核对

- 只在 `#growth-journey-detail` 观察纸区域增 UI；**不**新 FAB / 菜单项（方向锁）。
- 不新建 z≥17 遮罩；同意/disclosure 用现有暖米玻璃或详情卡内联。**不得**挡 `#yin-support-fab`。
- 随 `practice-paper-hidden` 一起隐藏（已有键）。

## 9. 后台网络

**零上传。** 禁止本刀把 ledger 字段加入 T54 Worker 白名单。

## 10. 验收（实现 PR）

- 单测：`eveningPracticeFacts*.test.js`（写入阈值、7 日计数、同意门闩、Honesty 不写、同日复写更晚）。
- 单测：`clearAllFocusTigerLocalState` 含两新键（撤登记则红）。
- 单测：`buildT54ResearchUploadPayload` 不含 evening 键（撤则红）。
- 单测：与 `practicePaperFacts` / rhythm 判定**无交叉污染**（撤 evening 模块 rhythm 仍绿）。
- e2e（建议）：`evening-practice-facts.spec.js` — 同意 → 模拟结束 → 打开详情见句 → 清空 → 句消失（可用 lab 钟 / 已有 debug hook 若需 PO 批准）。
- `PRACTICE_PAPER.md` 方向锁小节已更新。
- `PRIVACY_NOTICE.md` 三语同步（本刀必改）。
- TEST_TRACKER：B 类可见 → 「待人工测试」+ 分工（e2e 锁什么 / 人眼补什么）。

## 11. 开工闸

- 口令「按 T62 Brief 开工」= 本稿 **PO 书面点头** + §1.3 方向锁 **PO 书面点头** 后，新 Chat 写代码。
- 实现旁支 **禁止**改 `GLOSSARY.md` / `SCHEDULING_GLOSSARY.md`（治理另 PR）。
- **禁止**与 T61 功能混在同一 PR（可同会话先后两 PR）。

## 附录 A · 与 T53 / T61 的地面真相（2026-10-28）

| 项 | 状态 |
|---|---|
| **T53** 输入节奏 | **已合 develop #1437**；默认关 Mac 节奏；**不是** T62 数据源 |
| **T61** 收工时间 | **已合 #1455 + #1456**；键 `work-end-preference`；**不**写入晚间 ledger |
| Journey `at` + `minutes` | 可算单次结束时刻，但 **30 行上限** → 不足 §2 账本需求 |
