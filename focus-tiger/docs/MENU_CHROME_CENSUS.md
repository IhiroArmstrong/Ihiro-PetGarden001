# MENU_CHROME_CENSUS.md — 角落按钮 vs 菜单对照

创建日期：2026-09-14  
修订：2026-09-26 钉第 3 条「轻量身份 Brief」重新评估触发（无运行时）  
状态：**纯文档 · 不改菜单运行时**  
基线：`origin/develop` `39bb141d`（#759 已合）；本修订相对当时 `origin/develop` tip  
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
| **3** | 要不要基础 Login/Logout；至少「恢复购买 / 账号与设备」占位 | **同意先占位、不急着做账号** | **占位已完成。** #759：Preferences → Sign in (coming soon)，`interactive: false`，`testId=idle-account-placeholder` | 占位文案在 locale `ACCOUNT_MENU_PLACEHOLDER` | **真 Login / Logout / 恢复购买：未开工。** 统一「轻量身份 / 账号与设备」Brief **现在不写**（证据不够：Restore / 备份 OTP / Circle 暗号 仍各自撑得住；无「因无统一身份而出事」的具体投诉账）。**禁止**把灰行做成假可点 | **重新评估触发（2026-09-26 PO）**：（A）开工 **Circle 跨设备认人**（复用现有邮箱 OTP 把同一人绑回 member；**不是** 2e 昵称层——2e 已合 #615，本刀明确不做跨设备）时，**必须先**写统一 Brief，把 Restore / 备份 OTP / Circle / YPE 怎么接到同一入口说清；（B）若在（A）之前出现「换设备 / 清缓存后东西找不回来」的**具体投诉 ≥3 次**，提前写 Brief，不必等（A）。在此之前维持灰行。禁止无投诉、无跨设备开工令就写架构预判 |
| **4** | 入口放右上角齿轮或 `⋯`；左上留给日历；不要两边都塞菜单 | **同意右上 `⋯`，左上日历** | **早已如此，两刀都没改位置。** 宽屏 `#ft-wide-more-btn` 右上；窄屏 grabber 底缘抽屉。左上仍是打卡/热力图 | 代码里曾有 TODO「audit 后再搬菜单位置」——**位置已拍死，不应再搬** | 无功能缺口 | **禁止再提案左上汉堡。** TODO 改为指向本文 |

**一句话：** 四条里，1/3/4 的约定行为已在 #757+#759；2 的「漏项补行」已做，缺的是这张表；1 的「写成硬原则」本 PR 补。没有第三条代码刀，除非触发点到了要写统一身份 Brief / 真账号，或把 Support 五卡再挂进菜单（**2026-09-15 拍板：五卡不必**；五卡仅 FAB，菜单已有 membership 入口）。**2026-09-26：** 第 3 条触发点已钉进上表「下一步」，不是无限期空置、也不是现在写 Brief。

---

## 2. 角落按钮 vs 菜单

「菜单」= 宽屏 `⋯` 与窄屏抽屉共用的 `listSecondaryChromeEntries`（不是底栏主按钮、不是 FAB 本身）。

### 2.1 分析师点名的四类

| 角落 / 快捷入口 | 菜单降级路径 | 结论 |
|---|---|---|
| 语言地球 `#language-preference-fab` | Preferences → Language（`shouldOfferLanguagePicker()` 为真时） | **已在菜单** |
| Support Yin `#yin-support-fab` | 菜单有 Membership CTA / Premium unlocked **一行**；五卡（Sanctuary / Membership / Tea / Pro / Add-on）全目录仍只在 FAB 模态 | **半在菜单。** 降级「打开付费」够；目录级对等没有。**2026-09-15 拍板**：五卡不进菜单。维持现状 |
| 寅币商店 | Practice → Yin Coin（闸关则隐） | **已在菜单** |
| 设置类（提醒、语言、备份、社区、通讯） | Preferences 组 | **已在菜单** |

### 2.2 菜单里已有的功能（SSOT 分组）

| 组 | 菜单 proxy（可见时） |
|---|---|
| Practice | companion、ground-exercise、five-moments、honesty、journey-log、presence-signals、yin-coin、confide |
| Inspiration | daily-quote、**zen-cinema**（#759 补漏）、mustard-seed-seal（解锁后）、静思印、wallpapers |
| Not alone | quiet-together、focus-circle |
| Preferences | reminder、language、newsletter、**account 占位**（#759）、community、local-backup |
| 其它 | membership CTA/unlocked；Rituals 场景（按 entitlement 锁） |

### 2.3 故意不进菜单（不是漏项）

| 角落入口 | 为什么不进菜单 |
|---|---|
| Sit / Rise、左球 Breath practice | 主路径，不是次级功能 |
| 窄屏 ActionBar `?` | 产品简介 / hint，不是功能列表项 |
| 音符 / 环境音面板 | 编排注释显式排除；走 ActionBar / 右下 Sound FAB |
| 左上日历 / 周热力图 | 内容导航；原则 4 把左上留给日历 |
| 倾听耳（宽） | 倾诉另有菜单行 `confide`；耳是快捷 |
| 桌面更新提示条 | 系统状态，不是功能入口（#758） |

### 2.4 #759 实际补的两行

| 项 | 补前 | 补后 |
|---|---|---|
| Zen Cinema | handler 已有，列表漏了 | Inspiration 组可见并可开卡 |
| Sign in | 无 | Preferences 灰行，不可点 |

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

新加 Idle 常驻可点 chrome 时：先在本表 2.1–2.3 加一行，再决定是否进 `listSecondaryChromeEntries`。只加 FAB、不改本表 = 普查回退。
