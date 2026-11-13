# MENU_CHROME_CENSUS.md — 角落按钮 vs 菜单对照

创建日期：2026-09-14  
修订：2026-11-13 T93 D5 把第 3 条灰行剧本改成 Preferences 真入口（无运行时）  
状态：**纯文档 · 不改菜单运行时**（真入口已由 T93 D3 #1679 合入）  
基线：`origin/develop` `0b2ebc90`；第 3 条运行时锚 `#1679`  
权威路径：`focus-tiger/docs/MENU_CHROME_CENSUS.md`  
姊妹审计：[`LABEL_HINT_TIP_AUDIT.md`](./LABEL_HINT_TIP_AUDIT.md)（说明信号，不重复）  
原则硬句：[`PRINCIPLES.md`](./PRINCIPLES.md)「菜单逃生舱」  
菜单列表 SSOT：`src/core/idleChromeOrchestration.js` → `listSecondaryChromeEntries`

本文件回答三件事：（1）当初四条计划各完成到哪；（2）每个角落按钮能不能从菜单摸到；（3）还要不要再改代码。

---

## 1. 计划四条（唯一进度表）

当初拍板（分析师四条 + Cursor 收窄 + 你同意分两刀）：

| # | 计划原文要点 | 收窄后的约定 | 代码现状（git） | 文档现状 | 还差什么 | 下一步 |
|---|---|---|---|---|---|---|
| **1** | 菜单入口不能因叠层卡死消失；挂在最外层、不依赖 overlay / sprite 仲裁；Esc 或长按空白清空叠层 | **同意逃生舱。Esc 只关最上一层。不做长按空白清空全部。** 第一刀做「叠层时入口仍在」；Esc 放第二刀 | **已完成行为。** #757：宽屏 `⋯` / 窄屏 grabber 在 overlay suppress 时仍可见可开。#759：`overlayEscapeStack` — Esc 只关顶层（菜单 → 再 Esc 才关 Reflection） | **本 PR 写入 PRINCIPLES 硬句。** 此前只有代码注释，原则文档没有 | 长按清空：**按约定不做。** 硬句若未合入则文档仍缺（本 PR 补） | **无第三刀代码。** 合入本 PR 后本条关文档账。人工复测 #757+#759 |
| **2** | 菜单收纳所有「只有按钮、没有入口」的功能（语言、Support Yin、寅币商店、设置等）作降级路径 | **同意普查，作为第二刀**；不把快捷按钮拆掉 | **行为大半早已在菜单里；#759 只补了漏项 Zen Cinema。** 语言 / 提醒 / 寅币 / 倾诉 / 会员 CTA 已在 `listSecondaryChromeEntries`。Support Yin **五卡（仅 FAB 模态；`SupportYinModalUI.js`）**——菜单只有一行 membership 降级入口，是 2026-08-15 既有产品决定，不是漏挂 | **#759 没有交出对照表**（这才叫普查没做完）。本文件补表 | 表里标「故意不进菜单」的项（环境音 ♪、`?` 帮助、左上日历）**不改为菜单行**，除非你另拍板。Support 五卡是否再挂进菜单：**不默认改**（**2026-09-15 拍板**：五卡不进菜单；菜单 membership 一行已够） | **无菜单重写。** 新角落按钮必须先改本表再决定是否进 `listSecondaryChromeEntries` |
| **3** | 要不要基础 Login/Logout；至少「恢复购买 / 账号与设备」占位 | **同意先占位、不急着做账号**；T93 另开「用邮箱保存或找回」 | **双态。** 开闸：#1679 Preferences 真入口 `idle-account-email-restore`，开 `#email-journey-restore-panel`。首包关闸（2026-11-12）：Web 仍灰行 `idle-account-placeholder`。Setapp / MAS：`idle-account-store-off`，不可点。Journey 角落不再当登录。购买恢复仍走原卡 | 开闸文案切片 `email-journey-restore`；关闸占位 `ACCOUNT_MENU_PLACEHOLDER` | **Circle 统一 Login / Logout /「账号与设备」仍不写。** 禁止把商店渠道做成假可点 | **统一身份触发仍未到（2026-09-26 PO）**：（A）开工 **Circle 跨设备认人** 须先写统一 Brief；（B）或换设备/清缓存找不回投诉 ≥3。T93 旅程找回 **不算** 统一 Login。首包关闸发，不对客打开邮箱找回 |
| **4** | 入口放右上角齿轮或 `⋯`；左上留给日历；不要两边都塞菜单 | **同意右上 `⋯`，左上日历** | **早已如此，两刀都没改位置。** 宽屏 `#ft-wide-more-btn` 右上；窄屏 grabber 底缘抽屉。左上仍是打卡/热力图 | 代码里曾有 TODO「audit 后再搬菜单位置」——**位置已拍死，不应再搬** | 无功能缺口 | **禁止再提案左上汉堡。** TODO 改为指向本文 |

**一句话：** 四条里，1/4 的约定行为已在 #757+#759；第 3 条代码已有 Preferences 真入口（#1679），首包关闸时 Web 仍灰行；Circle 统一账号仍不写。2 的「漏项补行」已做。Support 五卡不必进菜单（**2026-09-15 拍板**）。

---

## 2. 角落按钮 vs 菜单

「菜单」= 宽屏 `⋯` 与窄屏抽屉共用的 `listSecondaryChromeEntries`（不是底栏主按钮、不是 FAB 本身）。

### 2.1 分析师点名的四类

| 角落 / 快捷入口 | 菜单降级路径 | 结论 |
|---|---|---|
| 语言地球 `#language-preference-fab` | Preferences → Language（`shouldOfferLanguagePicker()` 为真时） | **已在菜单** |
| Support Yin `#yin-support-fab` | 菜单 Preferences 有 **Subscription** 一行（打开既有会员卡）；未购仪式锁行也可打开同一张卡；五卡（Sanctuary / Membership / Tea / Pro / Add-on）全目录仍只在 FAB 模态 | **半在菜单。** 降级「打开付费」够；目录级对等没有。**2026-09-15 拍板**：五卡不进菜单。**2026-10-16 第一刀**：去掉 Rituals 上方 CTA / Premium unlocked 行。 |
| 寅币商店 | Practice → Yin Coin（闸关则隐） | **已在菜单** |
| 设置类（提醒、语言、备份、社区、通讯） | Preferences 组 | **已在菜单** |

### 2.2 菜单里已有的功能（SSOT 分组）

手写对照表已停用。以下机器块与 `listSecondaryChromeEntries` 对齐；漏登由 `docs:check` 的 kb live 菜单对照红灯，不对照本表 Markdown。

<!-- menu-chrome-census-proxies:begin -->

> **机器块 · 勿手改**。真源：`listSecondaryChromeEntries`（`idleChromeOrchestration.js`）。刷新：`npm run audit:menu-chrome-census -- --write`。角落豁免见 §2.3 与 `src/core/kbLiveMenuChromeExemptions.js`。

| 组 locale key | 菜单 proxy（审计最大可见集） |
|---|---|
| `MENU_GROUP_PRACTICE` | `sanctuary-nav` · `companion` · `ground-exercise` · `guided-meditation` · `five-moments` · `honesty` · `confide` |
| `MENU_GROUP_RECORDS` | `journey-log` · `presence-signals` · `yin-coin` |
| `MENU_GROUP_INSPIRATION` | `daily-quote` · `contemplative-inquiry` · `zen-cinema` · `mustard-seed-seal` · `contemplative-archive-seal:ca-01-old-pond` · `contemplative-archive-seal:ca-02-cherry-blossoms` · `contemplative-archive-seal:ca-03-morning-field` · `contemplative-archive-seal:ca-04-empty-room` · `contemplative-archive-seal:ca-05-bird-has-flown` · `contemplative-archive-seal:ca-06-spring-water` · `contemplative-archive-seal:ca-07-distant-mountain` · `contemplative-archive-seal:ca-08-moonlight` · `contemplative-archive-seal:ca-09-still-tree` · `contemplative-archive-seal:ca-10-sound-after-bell` · `contemplative-archive-seal:ca-11-falling-leaf` · `contemplative-archive-seal:ca-12-cypress-old-lane` · `wallpapers` · `art-collection` |
| `MENU_GROUP_NOT_ALONE` | `quiet-together` · `focus-circle` · `community` |
| `MENU_GROUP_PREFERENCES` | `reminder` · `work-end` · `language` · `sound` · `always-on-top` · `window-layout` · `input-rhythm` · `mindflow-nebula` · `presence-field` · `health-shortcut-log` · `today-direction` · `newsletter` · `account` · `help-center` · `local-backup` · `practice-study` · `membership` |
| `ritual.menu_group` | `ritual-morning` · `ritual-emotional-reset` · `ritual-work-transition` |

<!-- menu-chrome-census-proxies:end -->

### 2.3 故意不进菜单（不是漏项）

代码豁免表（核实日 **2026-11-13**）：[`src/core/kbLiveMenuChromeExemptions.js`](../src/core/kbLiveMenuChromeExemptions.js)。豁免的是角落 / 主路径 chrome，**不是**菜单 `proxy`。`help-center` / `sound` / `confide` 菜单行仍须登记。

| 角落入口 | 为什么不进菜单 |
|---|---|
| Sit / Rise、左球 Breath practice | 主路径，不是次级功能 |
| 窄屏 ActionBar `?` | 产品简介 / hint，不是功能列表项 |
| 宽屏簇 / 窄屏 ActionBar Help Center 快捷（`#onboarding-hint-help-center` / `#ft-narrow-help-center-btn`，T26） | **不是漏项。** 菜单 Preferences 已有同一张帮助中心（`help-center` / `idle-help-center`）。新钮是快捷，不搬家 |
| 音符 / 环境音面板 | **主入口**仍是角落音符 / 窄屏 ♪；Preferences 一行 **Sound**（`sound`）只打开**同一张**面板，作逃生舱（Brief 冷启动声音入口 · 2026-10-28） |
| 左上日历 / 周热力图 | 内容导航；原则 4 把左上留给日历 |
| 倾听耳（宽） | 倾诉另有菜单行 `confide`；耳是快捷 |
| 桌面更新提示条 | 系统状态，不是功能入口（#758） |

### 2.4 #759 实际补的两行

| 项 | 补前 | 补后 |
|---|---|---|
| Zen Cinema | handler 已有，列表漏了 | Inspiration 组可见并可开卡 |
| Sign in / 用邮箱保存或找回 | 无 | 开闸：Preferences 真入口；关闸 Web：灰行不可点；商店渠道不可点 |

---

## 3. 逃生舱（原则 1 的实现锚）

| 行为 | 锚 |
|---|---|
| 叠层 suppress 时 `⋯` 仍显示 | `WideIdleMoreMenu._sync`：escape hatch，不随 home CTA 隐藏 |
| 叠层 suppress 时 grabber 仍在 | `NarrowIdleShell.setSuppressed`：Reflection 藏 home/sheet，**grabber 留下** |
| Esc 只关顶层 | `overlayEscapeStack`；登记层：宽菜单、窄抽屉、Reflection、接地练习选择 |
| 禁止 | 长按空白清空全部叠层（会清掉写到一半的问答） |

禁止再把 `⋯` / grabber 的 `hidden` 绑到 `overlaySlotArbitration` / `spriteChannelArbitration` 的「有人占用就藏 chrome」结果上。

---

## 4. 维护

新加 Idle 常驻可点 chrome 时：先决定是否进 `listSecondaryChromeEntries`；进了就必须在 `kbLiveEntryRegistry.js` 有一行。§2.2 跑 `npm run audit:menu-chrome-census -- --write`。角落入口改 §2.3 并同步 `kbLiveMenuChromeExemptions.js`。只加 FAB、不改豁免表 = 普查回退。

## 5. 宽屏五图标索引（2026-10-16 · 三刀已合）

「印揭晓前不进菜单」维持。账号行见 §1 第 3 行（开闸真入口 / 首包关闸灰行）。付费行、分组和扇形见 [`task-briefs/task-wide-menu-radial-index.md`](./task-briefs/task-wide-menu-radial-index.md)。本表 §1 第 4 条「⋯ 在宽屏、左上留给日历」仍然有效。
