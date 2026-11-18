# Task Brief · Preferences Center（H7 信息架构 · H8 子页统一）

> **状态（2026-11-17）**：**已锁（PO 当回合：无需再点头，可连贯两 PR）**。  
> **人话**：设置从一条长清单改成按主题分块的偏好中心；短菜单不再拖出一大块空白；点进去的页面和列表是同一套样子。  
> **类**：两刀都是 **B 类**（改用户看见的菜单结构与交互）。  
> **依赖**：叠在 H1 宽屏侧栏（`feature/h1-home-side-nav` / #1756）。H1 未合时本刀 `--base` 该旁支。  
> **不是**：H2 首页三块骨架。**不是**把 How Yin may speak 改成 Gentle/Minimal/Quiet 三种说话风格（图 4 只锁版式）。**不是**把 Sound 收成唯一总开关而拿掉铃声/背景乐/朗读面板。**不是**把 Subscription 搬进 Support FAB。**不是**改付款路径选择器。

---

## 0. 大白话

现在 Preferences 是十几条字挤在一组里，下面还常留空。这一线做成分组卡片：能一眼看到现在开没开、是什么意思；开关就在列表上拨，复杂项再进同一张纸的下一页。

## 1. 冲突扫描

| 邻接 | 三轴 | 结论 |
|---|---|---|
| 场景 Z / 菜单目录 | 职责 | 代理行不删。只改 Preferences **组内顺序与分组标题**。Help Center / Backup / Practice Study / Subscription 仍在 Preferences |
| 场景 A / Sit | 职责 | 不改坐下路径 |
| T42 次级不挡脸 | 强度 | 列表仍贴右。宽度随窗，不做成全屏米色后台 |
| 菜单逃生舱 | 强度 | ⋯ / 抽屉仍在 |
| 场景 Q / Support | 职责 | `#yin-support-fab` 与五卡不进本刀。Subscription 行仍开既有会员卡 |
| Sound 逃生舱 | 职责 | Preferences → Sound 仍打开现网声景面板（普查逃生舱）。状态可显示 On/Off，**不**改成只能拨静音 |
| How Yin may speak（T63） | 语气 | 内容仍是「寅可在哪些时刻开口」，不是三种人格声线 |

无未拍板冲突。图 4 的 Gentle/Minimal/Quiet 是版式示意，不是改契约面语义。

## 2. 信息架构（H7）

Preferences 仍是五组菜单里的一组。组内再分块（可见标题用切片文案）：

| 块 | 行（proxy） | 交互 |
|---|---|---|
| 01 Your Experience | `co-practice-contract` · `reminder` · `work-end` | A 子页 |
| 02 Your Practice | `input-rhythm`（仅 Electron 可见时）· `today-direction` | A / C |
| 03 Your Space | `mindflow-nebula` · `presence-field` | A |
| 04 App & Devices | `language` · `sound` · `always-on-top` · `window-layout` · `health-shortcut-log` | A；**Keep in front = B 开关** |
| 05 Account & Support | `newsletter` · `account` · `help-center` · `local-backup` · `practice-study` · `membership` | A 或 C |

图 2 四条（Help Center、Backup & restore、Practice Study、Subscription）全部进 05，不丢行。

类型：

- **A** 进子页/既有面板：右侧状态 + 箭头。Sound 属 A（打开声景，不是只拨静音）。
- **B** 列表内开关：Keep in front。0–1 秒内拨杆跟上；失败见状态句，不静默。
- **C** 执行：Choose today's direction again、Save or restore with email。点了走现网流程。

每行可有一行说明（特色术语必须有）。

## 3. 导航与留白（H7 先做列表；H8 收子页）

- Preferences 标题 + 关闭固定；列表自己滚。
- 菜单高度跟内容走，`max-height` 封顶；禁止再 `top`+`bottom` 拉满造成图 3 空白。
- 滚动条弱化。
- 其它二级组（Practice 等）同一套行高/卡片/贴内容高度，不另做皮肤。
- **H8**：既有偏好玻璃卡改成「返回 Preferences」的同一张纸，不再各自一套 Dialog 皮肤。内容函数不改。How Yin may speak 用图 4 的选项行版式展示**现网契约开关**，不换三种声线。

## 4. H7 不做

改 How Yin 语义、改 Sound 为唯一总开关、H2–H6、往 `src/main.js` 加行、动 Support FAB。

---

## 变体矩阵

| 变体 | 入口 / 前置状态 | 预期 | 自动化 |
|---|---|---|---|
| 宽屏 Preferences | ⋯ → Preferences | 0–1 秒见五块卡片，含图 2 四行 | 单测目录顺序 |
| 宽屏 Practice | ⋯ → Practice | 列表贴内容高度，底部无大空白 | 源码锁 `bottom: auto` / `height: auto` |
| 窄屏抽屉 | &lt;480 | 同一分组与说明；底边抽屉骨架不改成侧栏 | NarrowIdleShell 渲染 sub-group |
| Electron only 行 | 无桥 | 不出现 Keep in front / Window / Focus rhythm | 既有 visibility |
| Language | ≥2 ready locale | 右侧 nativeLabel | 状态 helper 单测 |
| Reminder 关 | 无存储 | 右侧 Off | 状态 helper |
| Keep in front | Electron | 拨杆；不关菜单、不开旧卡 | 行 `prefKind=toggle` |
| Sound | 任意 | 点行仍开声景面板 | 既有 reachability |
| Subscription | 未购 / 已购 | 仍 `idle-membership-cta` / `unlocked` | 既有单测 |
| 三语 | en/zh/ja | 分组名与说明走切片 | locale slice |
| 付款 | 任意 | Support FAB 未改 | 未动保护选择器则沿用契约 |

## 点击反馈（0–1 秒）

| 控件 | 0–1 秒 | 持久化 |
|---|---|---|
| Preferences 组 | 分组卡片列表 | — |
| 类型 A 行 | 现网面板出现（H7）；H8 改为同纸下一页 | 随该行 |
| Keep in front 拨杆 | 拨杆位置变；失败状态句 | 挂起：拨杆不可连点；成功：跟上；失败：拨回 + 状态 |
| 类型 C | 现网结果（四选卡 / 邮箱卡） | 随该行 |
| 关闭 / 遮罩 / Esc | 只关最上一层 | — |

## 边缘状态

| 边缘 | 预期 |
|---|---|
| 关闸账号行 | 仍灰、不可点 |
| 已购会员 | Subscription 行仍走 unlocked testId，不开 Stripe |
| 练习中 | ⋯ 逃生舱逻辑不删 |
| `prefers-reduced-motion` | 不高弹 Dialog |
| Soundscape 已打开 | Sound 行仍可指向同一面板，不叠第二套 |

## 共用机制核对

- **overlayBusy**：不新增忙碌源。  
- **HUD 呼吸**：不接。  
- **z-index / dim**：仍 `#ft-wide-more-backdrop` 25、sheet 26。`#yin-support-modal` 不写 inline 18/19。  
- **新建叠层**：H7 不新开 OVERLAY 行。H8 把既有偏好卡收进 sheet 时仍用现网卡 id，避免可达脚本断。

口令「开工 H7」= 本 Brief 信息架构 + 列表。口令「开工 H8」= 子页统一，可在 H7 推送后同一会话接着做。
