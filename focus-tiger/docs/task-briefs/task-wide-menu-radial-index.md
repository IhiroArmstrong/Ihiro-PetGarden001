# Task Brief · 宽屏菜单：五图标索引 + 列表

> **状态（2026-10-17）**：**三刀均已合 develop。** 第一刀 #1289 · 第二刀 #1305（纯归类；混支 #1292 已关未合）· 第三刀 #1307（#1293/#1295/#1308）。开工前四处补充：渠道说明、锁行读屏、Manage 指向已随 #1289；高度阈值 **520px** 已量并写入本页「宽屏形态」，SSOT `wideMenuRadialLayout.js`。口令「开工菜单第一刀/二刀/三刀」均不得再开同内容 PR。关单仍须 TRACKER 人工测试行。  
> **2026-10-21 · T25 已点头**：宽屏 ⋯ 被 `#sprite-stage` AABB 误退化成老列表。改正规格见 [`task-wide-more-five-icon-show.md`](./task-wide-more-five-icon-show.md)。本页「宽屏形态」已删相交句。实现另 Chat，本刀不改运行时。  
> **类**：**B**（会改菜单里能点什么、付费从哪进、宽屏怎么展开）。 
> **拍板**：2026-10-16 对话。登录维持灰行；静思印揭晓前不进菜单。其余骨架同日同意。2026-10-16 书面补四处后放行第一刀。

## 一句话

宽屏底部现有的「⋯」先展开五个组图标，点一个组才打开现在这种暖米玻璃列表。手机仍用底边抽屉。付费状态不占菜单行；没买仪式时，仪式行上的淡色锁打开现有会员卡。

## 已经定下的做法

1. 起点就是现在停在底部控制排里的 `#ft-wide-more-btn`。五个图标在它上方浅浅展开，不新开角落，不盖住寅的脸。
2. 悬停只显示组名。打开某一组必须点一下（或键盘回车）。
3. 首页不加 PRO 勋章。右上 Support 五张卡仍只在 `#yin-support-fab`。
4. **登录**：Preferences 保留灰色 “Sign in (coming soon)”，`interactive: false`，不能点，点了不弹提示。维持 [MENU_CHROME_CENSUS.md](../MENU_CHROME_CENSUS.md) §1 第 3 条（2026-09-26）：真账号要等圈子跨设备认人开工，或「换设备 / 清缓存后找不回来」的具体投诉满 3 次。
5. 英文组名不改：Practice & moments、Records、Quiet gifts、You are not alone、Preferences。
6. **静思印**：芥子须弥及以后的印，揭晓之后才出现在 Quiet gifts。揭晓前不列出、不做淡锁。门槛仍只看累计练习（[CONTEMPLATIVE_ARCHIVE.md](../CONTEMPLATIVE_ARCHIVE.md)）。
7. 社区（Join our community）挪进 You are not alone。Choose today's direction again 与 Stay in touch 留在 Preferences。

## 分组（开工后的目录）

| 组 | 行 |
|---|---|
| Practice & moments | Navigate sanctuary；How Shall We Sit?（陪伴入口可见时）；Ground exercise；The 5 Moments；Honesty Check-in；Confide to Yin（现有门闩）；**Rituals** 再进 Morning Ritual / Emotional Reset / Work Transition |
| Records | Journey log；Presence moments；Yin's Collections（寅币闸开时） |
| Quiet gifts | A Quiet Line；Zen Cinema；Wallpapers；Yin's Art Collection；**已揭晓**的静思印 |
| You are not alone | Quiet together worldwide；My circle；Join our community |
| Preferences | 提醒（可用时）；Language（提供语言选择时）；Voice announcements（仅宽屏且可用）；Choose today's direction again；Stay in touch；Sign in 灰行；Help Center；Backup & restore；**Subscription**（见下） |

不收进这套菜单：坐下 / 呼吸 / 诚实打卡三颗主球、环境音、左上日历、窄屏问号、Support 五卡。

### 付费与恢复

- 删掉挂在 Rituals 标题外的那一行（现在的 “Subscribe for more scenes” / “Premium unlocked”）。
- 未解锁的仪式行保持可见，淡墨小锁，**可以点**。0–1 秒内打开现有 `#yin-membership-card`（`membershipUnlockUI.open()`），不新做订阅卡，不直接开 Stripe。
- 已解锁的仪式行打开 `#ritual-flow`。
- Preferences 增加一行 Subscription，两种状态都在：未购打开会员卡的订阅视图（卡底已有 “Restore on another device”）；已购打开同一张卡的已订阅视图（**Manage** = 现网 `MembershipUnlockUI` 的 Stripe 顾客账单门户 `#yin-membership-manage` / `MEMBERSHIP_MANAGE_*`，链路已存在，本刀保留；**Close** 关卡）。文案不用 “Premium unlocked”。若不存在账单门户，已订阅视图不得放 Manage——现网已有，故放。
- 恢复仍是卡内邮箱验证码，不是苹果内购的 Restore Purchases。**当前仅 Web / Stripe 渠道。** 若日后上架 Mac App Store，或数字内容走苹果内购，须在上架前重新评估标准 Restore Purchases，不得沿用本页这条恢复口径。
- 退款或恢复失败、本地权益消失后：仪式锁回来，Subscription 行回到未购，点开是订阅视图。
- **第一刀验收（读屏）**：未购仪式锁行可点；可访问名称须含「需订阅」（en：`Requires subscription`；zh：`需订阅`；ja：购読/サブスクリプション要求）。建议全称：「需订阅，按回车查看」。不得只读仪式名（如只读 Morning Ritual）。

## 宽屏形态（第三刀已合 #1307）

- **宽度分界**：与现网同一条，`min-width: 480px` 为宽屏。低于 480 仍是 `#ft-narrow-options-drawer`，不做扇形。
- **高度退化（T25）**：只在矮窗（高 &lt;520）或图标顶缘被切到顶安全区时，不展开图标、直接打开现在的列表。**不得**再用 `#sprite-stage` 整块矩形相交来退化。宽屏够高时五图标须先出现，且不得挡住 Sit 主球。
- **高度阈值（2026-10-16 量完 · 2026-10-21 T25 改退化 · SSOT 仍 `wideMenuRadialLayout.js`）**：
  - `innerHeight < 520px` → 一律退化（矮窗口 / 横屏手机高度）。
  - 否则以 `#ft-wide-more-btn` 中心为锚点，半径 **96px**、图标 **44px**，五个角 **95°–175°** 向上左展开。
  - **已删（T25）**：不再用任一图标外扩 8px 与 `#sprite-stage` 整块 `getBoundingClientRect()` 相交来退化。该层是中部大盒，普通桌面窗几乎必中，会把五图标主路径吃掉。
  - 任一图标顶缘 `< 12px`（顶安全区）→ 退化。
  - 退化时不画扇形，直接打开手风琴列表；窄屏 `<480px` 仍只用抽屉。
  - **手测（T25 验收）**：宽 ≥480 且高 ≥520 时，五图标不得挡住 Sit 主球。
- **减弱动画**：`prefers-reduced-motion: reduce` 时，展开改为淡入，不做缩放绽放。
- **键盘**：左右键在五个图标间移动；回车打开该组列表；列表内上下键移动、回车执行。Esc 只关最上一层（整份菜单仍算一层，与现网 `overlayEscapeStack` 一致）。
- **发现**：悬停与聚焦时组名可见。`⋯` 保留可读名称。这三刀不加新的首次引导。
- **列表**：沿用 D.3 的暖米玻璃，宽 320–360px，上限 380px，不得竖切面部。组内条目多时列表滚动，组名留在列表顶部。
- **层级**：图标优先留在现有菜单层（backdrop 25 / sheet 26）。若必须新的 `position: fixed`，先登记 `Z_INDEX.md`，且不得盖住 `#yin-support-fab`（z 24，菜单打开时的既有关系保持）。不把 Support 模态写进 inline z。

## 三刀（各一个 PR）

| 刀 | 改什么 | 不改什么 | develop |
|---|---|---|---|
| **1 付费** | 去掉菜单里的会员状态行；仪式锁可点并打开会员卡；Preferences 增加 Subscription 行 | 不挪社区；不做扇形；不改 Support FAB | **已合 #1289** |
| **2 归类** | 社区挪进 You are not alone；今日方向与 Stay in touch 留在 Preferences | 不改外观；不改登录灰行；不改印的揭晓 | **已合 #1305** |
| **3 扇形** | 宽屏 `⋯` 上五个图标 + 点击后的列表；高度退化、减弱动画、键盘 | 窄屏抽屉不动 | **已合 #1307** |

第一刀单独验付费。归类不并进第一刀：付费测试若要撤回，不会把分组一起撤掉。

**分支纪律（硬 · 防 git 冲突）**：每一刀各自 **独立旁支 + 一个 open PR**；**禁止**在前一刀 **尚未合入 `develop`** 的同一分支上叠下一刀的提交、cherry-pick 或 `merge origin/develop` 后再继续写下一刀。下一刀必须从 **当时 `origin/develop` tip** 新建 worktree/分支。前一刀 PR 被后续更干净的 PR 取代时，**当周关闭**旧 PR（见 `WORKFLOW.md`「陈旧 open PR」）。2026-10-17 反面教材：#1292 叠了第二刀与第三刀/e2e，与 #1305/#1293 文件重叠导致 `CONFLICTING`。

## 变体矩阵

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| 仪式未购 | 宽或窄，菜单 → Rituals 任一行 | 0–1 秒内见 `#yin-membership-card` 订阅视图；不打开 `#ritual-flow`；不跳 Stripe；读屏名称含「需订阅」 | 本刀补单测 + 可达契约 |
| 仪式已购（Membership 或 Sanctuary Lifetime） | 同上 | 0–1 秒内见 `#ritual-flow`；菜单无 “Premium unlocked” 行 | 本刀补 |
| 退款 / 权益清除 | 曾解锁后清 entitlement | 锁回到仪式行；再点仍开订阅卡 | 本刀补 |
| 恢复失败 | 订阅卡里验证失败 | 卡上现有失败文案；仪式仍锁 | 沿用会员卡现有失败；本刀只锁「仍锁着」 |
| 另一台设备要恢复 | 本机未购 → Preferences → Subscription | 打开订阅卡，卡底 Restore 链仍在 | 第一刀手测指针；不新做恢复流程 |
| 已购看状态 | Preferences → Subscription | 打开已订阅视图；无 Restore 表单；无 Stripe | 本刀补 |
| Support 五卡 | 右上 FAB | 与改菜单前相同，仍可点 | `npm run test:payment-contract` |
| 宽屏 ≥480 | 第三刀，`⋯` | 五个图标；点一组才出列表 | 第三刀补 |
| 窄屏 <480 | 三刀都算 | 底边抽屉；第一、二刀只改行，第三刀不出现扇形 | 现有 narrow 可达 e2e 仍绿 |
| 矮窗口 | 第三刀，图标会挡脸或被切掉 | 直接列表，无扇形 | 第三刀补 |
| 减弱动画 | 第三刀，系统开启 | 淡入，无绽放 | 第三刀补 |
| en / zh / ja | 新行文案 | 三语都有；不把 “Premium unlocked” 留给新行 | 第一刀 locale 测试 |
| 登录灰行 | 三刀之后 | 仍在 Preferences，禁用 | 现有占位测试保持红如果被删 |
| 未揭晓的印 | Quiet gifts | 行不存在 | 现有 `mustardSeedSealUnlocked: false` 测试保持 |

## 点击反馈（0–1 秒）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化时：挂起 / 成功 / 失败 |
|---|---|---|
| 未购仪式行 | 淡墨锁所在的行有按下；会员卡出现 | 本点击不写权益。卡内付款沿用会员卡现有三态 |
| 已购仪式行 | `#ritual-flow` 出现 | — |
| Preferences · Subscription | 会员卡出现（未购=订阅视图，已购=已订阅视图） | 同会员卡，本行自己不写盘 |
| 登录灰行 | 无按下、无新层 | 按设计不生效。不是失败。保持 `disabled`，不新增静默白名单条目 |
| 五个组图标（第三刀） | 该组列表出现；悬停只出组名，不出列表 | — |
| 矮窗口的 `⋯`（第三刀） | 直接出现列表 | — |

## 边缘状态

| 边缘状态 | 预期（含 0–1 秒反馈） |
|---|---|
| 已购 Lifetime / 订阅有效 | 仪式无锁；Subscription 开已订阅卡；不得再从这行开 Stripe |
| 仅请茶、未解锁仪式 | 仪式仍锁；请茶不打开仪式 |
| 窄屏 | 无扇形；锁与 Subscription 行仍在抽屉里 |
| 叠层已打开（Reflection 等） | `⋯` / 抽屉抓手仍在、仍可点（菜单逃生舱） |
| 印未揭晓 | 菜单里没有该印 |
| 印已揭晓 | Quiet gifts 里可再次打开，无锁 |
| 语言选择不提供 / 提醒不可用 / 语音仅窄屏 | 对应行继续隐藏，与现网相同 |

## 冲突扫描

对照菜单治理、仪式锁、会员卡恢复、静思印「揭晓后才重读」、D.3 玻璃抽屉、Support 五卡不进菜单。

| 轴 | 判断 |
|---|---|
| 强度 | 扇形只在第三刀，且服从减弱动画。不新加庆祝或催促。 |
| 语气 | 沿用现有组名。订阅行不用 “Premium unlocked”。锁的说明沿用冷静口吻（现有 “Available with subscription” 可改短，但不做促销句）。 |
| 职责 | 付钱仍在现有会员卡和 Support FAB。菜单只负责打开它们。印的揭晓时机不改。 |

无未决冲突。有意改掉的现网行为只有一处：未购仪式行从「禁用、只有提示」改为「可点、打开会员卡」。第三刀已合：宽屏为五图标索引 + 玻璃列表，IA 仍按本页分组表，不新造 Practice / Moments 拆分。第二刀只在已有组之间挪社区。

## 共用机制核对

- 第一刀不新增 overlay。会员卡仍是 `#yin-membership-card`。不把仪式锁算进新的 overlayBusy。HUD 呼吸驱动不接线。
- 菜单遮罩仍是现有 `#ft-wide-more-backdrop`（z 25）。打开菜单时 Support FAB 的 dim 关系保持 `Z_INDEX.md`「Idle 常驻 chrome」里 Support Yin FAB 那一行，不得改成盖死后点不到。
- 第三刀若新增 fixed 图标层，才登记 `Z_INDEX.md` 并补 O-04；第一、二刀不登记新层。
- 不涉及后台网络。恢复请求仍只在用户于会员卡里点 Restore / Send code 时发出。

## 范围（out）

- 不实现登录、头像、统一账号。
- 不把未揭晓的印做成锁定列表。
- 不把 Support 五卡抄进菜单。
- 不做悬停展开二级。
- 不移动左上日历，不把 `⋯` 搬到右上或左下。
- 第三刀已合后，D.3 运行时以 develop 为准；本页为索引 SSOT，艺术方向见 `SANCTUARY_UI_ART_DIRECTION.md` D.3 指针。

## 开工闸

三刀均已合 develop（#1289 · #1305 · #1307）。不得再因「开工菜单第一/二/三刀」重开同内容 PR。新改动须新 Brief 切片。口令「立刻开工」不能跳过本页。
