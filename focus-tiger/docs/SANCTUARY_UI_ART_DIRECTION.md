# Focus Tiger · Sanctuary UI Art Direction

> **版本**：1.1（v3 四层：A 语义 / B 对照 / C 主屏补丁 / D 次级表面）  
> **最后更新**：2026-09-02  
> **状态**：**栖居主屏 + 次级表面的唯一美术 SSOT**。不再另开 v2.0 / v2.1 / 十五条平行稿。A / B 可对照；C / D 是**已拍板、尚未改运行时**的补丁。未改代码前，玩法语义仍以 `DESIGN.md` / `ARRIVE_MOMENT_DESIGN.md` / `FOCUS_COINS.md` 为准。  
> **关系声明：** 本文补充 `PRODUCT_POSITIONING.md` / `PRINCIPLES.md` / `DESIGN.md` / `RESPONSIVE_LAYOUT.md` / `Z_INDEX.md` / `FOCUS_COINS.md` / `INTERACTION_FEEDBACK_PRINCIPLES.md` / `glassPanelStyles.js`，**不覆盖、不重写**它们。视觉条款与上述文档冲突时，以上述文档为准（实施时须先改对应 SSOT，再改代码）。本文只管「看起来像什么」；**不管**产品名、结缘动词、账本、SKU、数据保留策略。  
> **命名澄清：** 本文「Sanctuary」指 Idle **栖居主屏**整体，不特指 `#yin-sanctuary-card`（Lifetime 解锁卡）。「Secondary Sanctuary Surfaces」（D 章）指从主屏派生的次级界面，不是独立产品。

断点只引用 `RESPONSIVE_LAYOUT.md`（narrow ≤479 / medium 480–899 / wide ≥900）。层级只引用 `Z_INDEX.md`。本文不另给视口断点或 z-index 表。D.3 的 320–360px 是**宽屏侧栏面板 max-width**，不是新的视口断点。

后续若有新的次级界面（含 3D / 静物柜 Backlog），**续写 D 章之后**，不再另开文件。

---

# A. 视觉语言（长期，跨表面）

只写「感觉对不对」。具体 px / 断点 / z-index 不写在本层。

## A.1 一句话

栖居主屏是 Yin 陪伴用户的空间，不是功能仪表盘。

次级界面判断句（不推翻上一句，也不等于把清供摆回阿寅身边）：

> Yin is not a game character inside an app; the app is a quiet world grown around Yin.

## A.2 四个视觉品质

Calm 宁静 · Warm 温暖 · Focus 专注 · Growth 成长（极少量金色）

## A.3 材质与配色

对齐现网，不新开一套 token：

- 玻璃：`src/ui/glassPanelStyles.js`（例：`GLASS_FILL` = `rgba(255,252,245,.62)`）
- 暖米白基调、克制橙金。橙色可用于 Yin 与 Primary CTA；金色仅用于长期纪念 / Growth / **已结缘**物，**不得作为大面积背景色**，也不得作为 Collections 未结缘行的默认色

## A.4 字阶与圆角

沿用各组件已用字号与圆角。卡片圆角偏软；禁止新造第二套 type scale。不要从仓库外的 v2 草案抄 768/1024 或 Tailwind 类名当验收。

## A.5 图标

圆角、简洁、略带有机感。禁止玻璃拟态 3D、企业仪表盘图标包、彩色 emoji 风格图标。

## A.6 语义级禁止（不是布局级）

- 全屏 / 满版「成就墙网格」（多枚徽章 + 大标题 + 营销引导文案的组合）。**豁免：** 数量克制的 B 轨身份印记条（付费起步 ≥3 枚、只增；见 B / C.1）。
- 同一决策的三个及以上等重视觉 CTA 并排（例：Reflection 的 Skip / Skip all / Continue 三胶囊同级）。**豁免：** 主导航分流（宽屏三球 Quick Start / Sit / Honesty）。
- 未经产品确认，把已上线付费入口 / 主 CTA 降为无标签纯 icon。
- **已锁产品语义（美术只能改视觉，禁止改机制本身）。** 工程已对照原文，不是转述：
  - 对外名 **不得**改为 Desk / Study；Collections **不用** Desk 场景化产品名（`FOCUS_COINS.md` 文首 + §1.2；用户书面 2026-08-19，见 `TEST_TRACKER`「寅币 C 轨」行）。Sanctuary 已是 Lifetime 买断名，不可挪用给珍藏。
  - 结缘动词 **不得**从 **Bond / 结缘** 改名（`FOCUS_COINS.md` §2 第 7 项）。也不得因视觉降权变成不可点的哑状态（`INTERACTION_FEEDBACK_PRINCIPLES.md`「禁止哑点击」）。
  - 货币对外名 **不得**从 **寅币 / Focus Coins** 改为 Focus Tokens 等（`FOCUS_COINS.md` 文首）。抬头浮雕标 + 余额旁小 icon 为 2026-08-20 用户书面定稿；D.4 只允许弱化「金币/商店」气质，不换名、不拆抬头标。
  - 清供物 **不得**叠回主坐席 / `#sprite-stage` / 已入库 PNG 序列 / 莲花朵 / 蒲团（`PRINCIPLES.md`「既有序列帧不可改、不可盖」）。只出现在周边 DOM 或珍藏卡面。
  - Presence 的删除、90 天 freeText 保留、Reflection 双写联动 **不得**因视觉调整而被拿掉或减弱；只改展示（如 Delete 收进 `···`）。权威：`task-presence-signals-slice-0-1.md` / Slice 6 联动删除。

## A.7 Idle 默认态 · 5 秒测试

第一眼 Yin → 第二眼当前可坐下的主交互 → 不应注意到大量 UI → 感受接近「有只小老虎在等我的安静空间」。

## A.8 Idle 默认态 · 脸部安全区（无新 z-index）

Idle **默认态**（无 Arrival / Honesty / Reflection / Support 等叠层时）：Yin 头部下颌线以上（含眼、额、鼻、耳、嘴、下巴）不得被常驻 Card 视觉重叠。这是**布局留白**，不是把精灵抬到 `#ui-overlay` 之上。

**豁免：** 用户主动打开的半透明叠层（Arrival 气泡、Reflection 卡、Support 模态等）可以盖住身体甚至下半脸，以便透过玻璃看到动画。不得为叠层强制缩小 / 上移精灵。

D.5 是次级面板的**停靠优先**（侧停 / 缩小 / 下半屏），**不推翻本条豁免**，也不把「移动 Yin」写成实施项。

## A.9 Progressive disclosure（语义）

默认只给最必要的信息；细节留给主动展开（Drawer 折叠、人时 vs 精确时间、Support 文案、音乐钮重量）。**不是**一次改完全仓 chrome 的立项理由；按 C / D 分表面执行。

## A.10 四种 Surface（跨主屏与次级）

| Surface | 用途 | 视觉重量 |
|---|---|---|
| 主空间 | Idle 栖居首屏（A / B / C） | 最重（Yin） |
| 对话层 | 当前 Companion 交互，Yin 仍在场 | 重 |
| Quiet Drawer | 宽屏 ⋯ 导航 / 窄屏底栏抽屉 | 轻 |
| Quiet Object Surface | Presence / Collections 等点进去看的内容 | 轻 |

四级共用现网玻璃/纸感 token（A.3），**不为每个次级面板单开一套玻璃**。

---

# B. Chrome 对照表（工程已核对）

未被本表确认的元素，不得写成 C 层硬约束。D 层次级面板 id 见各节。

| 元素 | `#id` / 选择器 | 场景 | 层级初判 | 可点/装饰 | 既有拍板 | 本轮 |
|---|---|---|---|---|---|---|
| FocusHUD（状态名+计时+环+条+连胜环） | `#focus-hud`；子：`.ft-hud`、`.ft-hud__state`、`.ft-hud__time`、`.ft-hud__session-target`、`.ft-hud__gauge`、`.ft-hud__bar`、`.ft-hud__streak` | Idle / Focusing | Idle 应变轻；Focusing = 主反馈 | 可点；悬停出 `.ft-hud__detail` | `index.html` 样式：Idle 时时间半透明，hover / Focusing 提高不透明度；环/条/连胜环仍常驻 | **C.2** |
| Idle 倾听耳（向阿寅倾诉） | `#confide-ear-chrome`；窄屏 `#ft-narrow-confide-btn` | Idle 宽屏（闸开） | 次级入口；**不得**与 C.2 HUD 抢左上角 | 可点；悬停出 `#confide-ear-chrome-tip` | 现网 `top/left: 14px` 与 HUD 重叠（2026-09-04 用户书面） | **待 chrome 小 PR**（建议 ⋯ 邻侧或右上 Support 避让带；不改 z-index 登记数字除非另开） |
| Support Yin | `#yin-support-fab`；标签 `.yin-support-fab__label` | Idle（Focusing 隐藏） | L2 付费入口 | 可点 | 统一 Support 三卡；A.6 禁止无标签纯 icon | **D.8**（Idle 默认小标；hover/展开后完整药丸；**不是**去标签） |
| 徽章条 | `#yin-tip-kindness-badges` | Idle | B 轨身份印记，非成就墙 | 可点，下载 PNG | 右侧；付费 `min=3`（Sanctuary 上限 17 / tip 上限 9）；练习分上涨只增 | **C.1** |
| 宽屏三球 | `#ft-wide-home-ctas`；`#ft-wide-home-quickstart` · `#ft-wide-home-sit` · `#ft-wide-home-honesty`；⋯ `#ft-wide-more-btn` | Idle ≥480 | **主 CTA** | 可点 | `RESPONSIVE_LAYOUT` 宽屏清场；e2e `wide-idle-more-menu` | **维持** |
| 窄屏三球 | `#ft-narrow-home-quickstart` 等（`NarrowIdleShell`） | Idle ≤479 | 主 CTA | 可点 | 同上，形态为底栏+抽屉 | **维持** |
| 星期热力图 | `#weekly-practice-heatmap`（簇 `#weekly-practice-heatmap-cluster`） | Idle | 环境层 | 可点 | 练习日点亮；非连坐惩罚 | **维持** |
| 提醒时钟 | `#reminder-preference-toggle`（在热力图簇内） | Idle | 环境层 | 可点 | 应用内提醒入口 | **维持** |
| Arrival | `#arrival-practice`（实现类 `ArrivalPracticeUI`） | Overlay | 轻量气泡，**无**面板内 Skip 三钮 | 点选前进 | `ARRIVE_MOMENT_DESIGN` §五：面板内 Skip / Skip — begin / Skip all **已移除**；跳过走 ⚡ | **C.3 不改 Arrival CTA** |
| 跳过 Arrival | `#quick-start-focus`（宽屏球 `#ft-wide-home-quickstart`） | Idle / Arrival 中 | 主路径捷径 | 可点 | ⚡ = `skipToBegin` | **维持** |
| Reflection | `#tiger-reflection-moment` | Overlay | 现网 Skip / Skip all / Continue **同级胶囊** | 可点 | `DESIGN.md`「Skip 与 Continue 视觉同级」；e2e 点 Skip all 关卡 | **C.3**（先改 DESIGN 再改代码） |
| 右下语言地球 | `#language-preference-fab` | 宽屏 Idle | 环境层 | 可点 | 与左下 `?` 同高；窄屏 CSS 隐藏 | **维持** |
| 声音 FAB | `#ambient-soundscape` 内 `.ambient-soundscape__mute` | 多场景 | 环境层 | 可点 | 常见于右上，与 Support 避让；**不是**左下 Enso | **维持**（可按 A.9 降低圆形容器视觉重量；不改入口） |
| 左下 Enso 印记 | `#yin-sanctuary-enso-mark` | Idle / Focusing 淡化 | B 轨装饰 | **不可点**（`pointer-events: none`） | entitled 才显示；不打开商店 | **维持** |
| 左下「?」 | `#onboarding-hint-help` | 多场景 | 帮助 | 可点 | 用途简介卡 | **维持** |
| 宽屏 ⋯ 菜单 | `#ft-wide-more-menu` + `#ft-wide-more-backdrop` | Idle ≥480 | Quiet Drawer | 可点 | 四组已验收；不得竖切面部 | **D.3** |
| 窄屏选项抽屉 | `#ft-narrow-options-drawer` | Idle ≤479 | Quiet Drawer | 可点 | 上滑抽屉，不是右侧栏 | **D.3 不搬宽屏侧栏样式** |
| Presence check-ins | `#presence-signals-panel` | Quiet Object | 次级 | 可点（含删除） | Slice 6 联动删除；90 天 | **D.2** |
| Yin's Collections | `#yin-coin-panel` | Quiet Object | 次级 | 可点（Bond / Wear / Play） | `FOCUS_COINS.md` L3；≥480 靠右停 | **D.4** |

截图里「底部三个金色图标」= 宽屏三球，不是未分类仪式入口。「右下金环」优先对照语言地球；若截图更像音符，则是 Sound FAB（右上族）。「左下圆环」在已购用户上是 Enso，不是未知齿轮。

---

# C. 主屏已拍板补丁（尚未改运行时）

每条只改一个表面。C 层 PR **不得**顺手改断点、z-index、三球、Enso。**Support FAB 走 D.8，不要绑进 C.1 / C.2。**

## C.1 徽章条 `#yin-tip-kindness-badges`

**决策：保留印记条（付费起步 ≥3 枚），去标题去营销句，不收成 1 枚入口。**

只改视觉，不改授予公式 / 下载：

- 默认态**不显示**标题与 hint 段落（locale：`SANCTUARY_BADGES_BESIDE_LABEL` / `PRACTICE_BADGES_BESIDE_LABEL` / `TIP_BADGES_BESIDE_LABEL`；`SANCTUARY_BADGES_DOWNLOAD_HINT` / `TIP_BADGES_DOWNLOAD_HINT`）。下载说明保留在每枚按钮的 `aria-label` / `title`（`*_DOWNLOAD_ONE`）。
- 去掉「成就面板」感：弱化或去掉独立厚卡片+阴影组合；容器可更贴近 `GLASS_FILL`，或仅保留徽章行。
- **不要**把枚数锁死为正好 3。付费 min=3，随后随练习分只增（Sanctuary 上限 17）。
- 位置仍在阿寅右侧中部（勿压右上 Support / mute）。
- 回归：付费后 ≥3 且可下载 PNG；免费练习章路径未被误删；Focusing 时仍按现网隐藏。

## C.2 FocusHUD `#focus-hud`

**决策：Idle 默认态变轻；Focusing 时环 / 条保持完整。**

现网已有：Idle 时 `.ft-hud__time` / `.ft-hud__session-target` 降低不透明度；hover / `:focus-within` / `data-focusing="1"` 提高。**不要**再加一套「点击展开」——沿用已有 hover / 键盘 focus。

本补丁要做的是 Idle **默认态**少露信息：

- Idle 默认：状态名 + 克制计时（可保持现网半透明时间）。`.ft-hud__bar` 与 `.ft-hud__streak`（截图中的「8 点环」）不在 Idle 默认态抢视线（可用降低不透明度或仅 hover / Focusing 显示）。
- Focusing：环、条、计时、连胜环保持完整，**不裁剪**。
- 卡片去边框：仅当与其它 Idle chrome 不一致时再动；若 Calm 卡已与玻璃族同类，不必单独再降一级。
- 回归：Idle → Focusing 信息增加时布局尽量不跳；窄屏 375 不挡 mute；e2e `focus-hud-hover` 仍能悬停出 tip。

## C.3 CTA 分层 —— **只改 Reflection**，不改 Arrival

**决策：Reflection 的 Skip = Continue 同级改为 Continue 更重。**  
这是**推翻** `DESIGN.md` / `TigerReflectionMoment.js` 文件头现网契约，不是补规则空白。

**Arrival 不在本补丁内。** `ARRIVE_MOMENT_DESIGN.md` §五与 `ArrivalPracticeUI` 已删除面板内 Skip / Skip — begin / Skip all；跳过走 ⚡ Quick Start。不要把三胶囊规则套回 Arrival。

实施前（同一文档 PR 或紧随的代码 PR **先**改 SSOT）：

1. 修订 `DESIGN.md`「结束反思」：删除「Skip 与 Continue 视觉同级」；改为 Continue = Primary pill，Skip = 文字链，Skip all = 角落 Tertiary。
2. 修订 `TigerReflectionMoment.js` 文件头注释。
3. 邻接：`HonestyBridgeCtaUI` 曾写「对齐 Reflection Skip/Continue」——**本轮不要顺手改 Honesty Yes/No**，除非另拍板。

视觉（`#tiger-reflection-moment`）：

- Continue：保留 pill（Primary）
- Skip：去描边/填充，纯文字（Secondary）
- Skip all：移出与 Skip/Continue 同一行，卡片角落小号文字（Tertiary）
- 字号沿用该卡现有 13px 量级，不引入新 type scale
- **行为不变**：Skip 跳过本题、Skip all 划过整场、Continue 提交本题；e2e 仍可用 Skip all 回到 Idle

回归：场景 A Reflection 可关；末题非空 Continue 仍先留共鸣再关；Esc 仍整场划过；零劝导文案（不因降权 Skip 而加挽留句）。

---

# D. Secondary Sanctuary Surfaces

审查来源：Presence / Drawer / Collections 截图。诊断：这三处仍是「网站目录 / 数据库行 / 商店行」组件语言。结论分 **Adopt / Adopt-as / Reject**。

D.9 的 Reject **不是**「以后再看」，是**本轮明确不做**。若有人换说法再提「去掉 Bond」，指回 D.9 与 A.6。

## D.1 四种 Surface — Adopt

见 A.10。本章把 Presence / Drawer / Collections 收进 Quiet Drawer 与 Quiet Object Surface，不各开一套玻璃。

## D.2 Presence `#presence-signals-panel` — Adopt

- **records → moments**：展示语言从「记录」改为时刻 / 观察；存储 key 与字段名不改。
- **人时**：默认 `Today · 2:47 AM` 一类；秒级时间戳只在展开 / 长按。存储仍 ISO。
- **Delete**：从常驻按钮收进 `···` → Remove。行为与联动删除不变（A.6）。
- 表面：实色纸感、轻阴影、暖描边；圆角跟现有 Object 卡，不新造 24px token 体系。
- **不改**：storage、Consent、90 天、双写。

## D.3 Quiet Drawer — Adopt

- 宽屏 `#ft-wide-more-menu`：已有四组标题。本条只加 **accordion（默认展开当前 section）+ 字重**，**不重组 IA**（Journey / Presence / Collections 不拆成新的 Practice vs Moments 产品分组）。
- 宽屏面板 max-width **320–360px**，上限 **380px**（面板宽度，不是视口断点）。打开后仍须能看见 Yin；列表不得竖切面部（现网契约保留）。
- 窄屏继续 `#ft-narrow-options-drawer` 上滑抽屉，**不**把宽屏侧栏搬到 375。

## D.4 Collections `#yin-coin-panel` — Adopt + Adopt-as

**Adopt（只改视觉）：**

- Object Card，而不是「图标 + 价 + 大白 pill + 差价」商品行。
- Gold 分级：Locked = ivory / stone；可结缘 = 轻暖；Collected 才金。
- 弱化余额区的游戏金币感（数字 + 寅标），**不**拆抬头浮雕标、**不**改币名。

**Adopt-as（气质改、机制留）：**

- **Bond**：问题是大白 pill 像 Buy，不是「不该有按钮」。余额与门槛都够时必须可点主操作 + 0–1s 按压。不够时用弱文案（Not yet / A little further），不要等重假按钮。
- **缺口句**：可去「充值差价」口吻，**数字诚实保留**（`focusCoinsSurface.test.js` 锁的差额不得改成含糊）。
- 视觉调整若必须改 `FOCUS_COINS.md` 账本 / SKU / 门槛数据结构 → **超出本文授权**，另走产品确认，禁止塞进同一 chrome PR。

## D.5 Overlay 停靠（次级面板）— Adopt，不推翻 A.8

Quiet Object Surface / Quiet Drawer **优先**：侧停、缩小、下半屏，少挡脸。现网 Collections ≥480 靠右停已符合方向。

**不授权：** 为 Presence / Collections 移动 Yin、改 PNG 构图、把精灵抬到 overlay 之上。Arrival / Reflection / Support 模态仍走 A.8 豁免。

## D.6 Progressive disclosure — Adopt（原则）

见 A.9。按 D.2–D.4 / D.8 分 PR，不作为全仓 chrome 一次立项。

## D.7 North Star — Adopt

见 A.1 第二句。禁止解读为「清供回主坐席」（D.9 / A.6）。

## D.8 Support Yin Idle — Adopt-as（已拍板）

**决策：Idle 默认只留小标；hover / 键盘 focus / 展开后再显示完整 “Support Yin” 药丸。**

- **不是**无标签纯 icon（A.6）。标签可在默认态视觉收起，但控件仍须有可访问名称（`aria-label` 保持 Support Yin）。
- 现网 `.yin-support-fab:hover` 已有加重；本条是默认态收起 `.yin-support-fab__label`，不是新交互模式。
- **独立小 PR**，文件主战场 `SupportYinModalUI.js`。不要塞进 `#yin-coin-panel` 的 Collections PR，也不要和 C.1 / C.2 抢同一批 Idle chrome（串行：C.1/C.2 合入后再做，或明确不同文件互不重叠后才能并行）。

## D.9 Reject — 本轮明确不做（不是 Backlog 候补菜单）

1. **去掉 Bond 按钮**，改成用户自己发现可结缘 → 哑状态，违反 A.6 与交互原则。换说法再提，仍指本条。
2. **Yin's Desk / 器物出现在桌面场景** → 产品名禁用 Desk；铁律禁止叠回序列 / 莲花。长期 3D/静物柜须**另拍板**后才能写进 D 章新节，不是「先做了再补文档」。
3. **借 Drawer 折叠重组导航 IA**。

「以后可以做空间化珍藏」只存在于需另拍板的 Backlog，**不等于**本轮半开绿灯。

---

# E. 明确不在本文范围

- 不改 `Z_INDEX.md` 数值、不把 Yin 设为高于 `#ui-overlay`
- 不改 479 / 900 断点
- 不把三球、Enso、语言地球降为 Level 3 无标签 icon
- 不改寅币账本 / SKU id / `isEntitled` / 花园叠层
- v2.1 Implementation Contract（Yin z=10、768/1024、Tailwind 验收）**冻结作废**，只保留审计方法（脸部含下颌、等重胶囊按**实际表面**验证）

---

# F. 实施顺序

1. 本文档合入 `develop`（本 PR）——对照表生效，C / D 仍是待办。
2. **C.1** 徽章去文案（最小视觉 PR）。
3. **C.2** Idle HUD 变轻（独立 PR）。
4. **C.3** Reflection CTA：先改 `DESIGN.md` 再改 `TigerReflectionMoment.js`；Honesty 不同批。
5. **D PR 1 · Presence**（D.2）：人时、`···` 删除、纸感、侧停优先。不改存储。
6. **D PR 2 · Quiet Drawer**（D.3）：accordion、字重、宽屏 max-width。不改分组。
7. **D PR 3 · Collections chrome**（D.4）：Object Card、Gold 分级、Bond 视觉降权、缺口句。不改账本 / SKU / 币名 / 抬头浮雕标。
8. **D.8 Support 小标**：独立 PR，与 C.1/C.2 串行；不绑进 D PR 3。

主屏 C 与次级 D **尽量不共享同一批 chrome 文件**。脸部安全区（A.8）若 Idle 主卡仍压嘴/下巴，另开构图 PR，不要绑进 C.3 或 D PR 1。
