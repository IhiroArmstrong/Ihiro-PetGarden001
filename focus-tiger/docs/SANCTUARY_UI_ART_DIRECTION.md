# Focus Tiger · Sanctuary UI Art Direction

> **版本**：1.0（由 v3 draft 工程核对后入库）  
> **最后更新**：2026-09-02  
> **状态**：A / B 层可对照；C 层是**已拍板、尚未改运行时**的补丁。未改代码前，玩法语义仍以 `DESIGN.md` / `ARRIVE_MOMENT_DESIGN.md` 为准。  
> **关系声明：** 本文补充 `PRODUCT_POSITIONING.md` / `PRINCIPLES.md` / `DESIGN.md` / `RESPONSIVE_LAYOUT.md` / `Z_INDEX.md` / `glassPanelStyles.js`，**不覆盖、不重写**它们。视觉条款与上述文档冲突时，以上述文档为准（C 层实施时须先改对应 SSOT，再改代码）。  
> **命名澄清：** 本文「Sanctuary」指 Idle **栖居主屏**整体，不特指 `#yin-sanctuary-card`（Lifetime 解锁卡）。

断点只引用 `RESPONSIVE_LAYOUT.md`（narrow ≤479 / medium 480–899 / wide ≥900）。层级只引用 `Z_INDEX.md`。本文不另给 px 断点或 z-index 表。

---

# A. 视觉语言（长期，跨表面）

只写「感觉对不对」。具体 px / 断点 / z-index 不写在本层。

## A.1 一句话

栖居主屏是 Yin 陪伴用户的空间，不是功能仪表盘。

## A.2 四个视觉品质

Calm 宁静 · Warm 温暖 · Focus 专注 · Growth 成长（极少量金色）

## A.3 材质与配色

对齐现网，不新开一套 token：

- 玻璃：`src/ui/glassPanelStyles.js`（例：`GLASS_FILL` = `rgba(255,252,245,.62)`）
- 暖米白基调、克制橙金。橙色可用于 Yin 与 Primary CTA；金色仅用于长期纪念 / Growth，**不得作为大面积背景色**

## A.4 字阶与圆角

沿用各组件已用字号与圆角。卡片圆角偏软；禁止新造第二套 type scale。不要从仓库外的 v2 草案抄 768/1024 或 Tailwind 类名当验收。

## A.5 图标

圆角、简洁、略带有机感。禁止玻璃拟态 3D、企业仪表盘图标包、彩色 emoji 风格图标。

## A.6 语义级禁止（不是布局级）

- 全屏 / 满版「成就墙网格」（多枚徽章 + 大标题 + 营销引导文案的组合）。**豁免：** 数量克制的 B 轨身份印记条（付费起步 ≥3 枚、只增；见 B / C.1）。
- 同一决策的三个及以上等重视觉 CTA 并排（例：Reflection 的 Skip / Skip all / Continue 三胶囊同级）。**豁免：** 主导航分流（宽屏三球 Quick Start / Sit / Honesty）。
- 未经产品确认，把已上线付费入口 / 主 CTA 降级为无标签纯 icon。

## A.7 Idle 默认态 · 5 秒测试

第一眼 Yin → 第二眼当前可坐下的主交互 → 不应注意到大量 UI → 感受接近「有只小老虎在等我的安静空间」。

## A.8 Idle 默认态 · 脸部安全区（无新 z-index）

Idle **默认态**（无 Arrival / Honesty / Reflection / Support 等叠层时）：Yin 头部下颌线以上（含眼、额、鼻、耳、嘴、下巴）不得被常驻 Card 视觉重叠。这是**布局留白**，不是把精灵抬到 `#ui-overlay` 之上。

**豁免：** 用户主动打开的半透明叠层（Arrival 气泡、Reflection 卡等）可以盖住身体甚至下半脸，以便透过玻璃看到动画。不得为叠层强制缩小 / 上移精灵。

---

# B. Chrome 对照表（工程已核对）

未被本表确认的元素，不得写成 C 层硬约束。

| 元素 | `#id` / 选择器 | 场景 | 层级初判 | 可点/装饰 | 既有拍板 | 本轮 |
|---|---|---|---|---|---|---|
| FocusHUD（状态名+计时+环+条+连胜环） | `#focus-hud`；子：`.ft-hud`、`.ft-hud__state`、`.ft-hud__time`、`.ft-hud__session-target`、`.ft-hud__gauge`、`.ft-hud__bar`、`.ft-hud__streak` | Idle / Focusing | Idle 应变轻；Focusing = 主反馈 | 可点；悬停出 `.ft-hud__detail` | `index.html` 样式：Idle 时时间半透明，hover / Focusing 提高不透明度；环/条/连胜环仍常驻 | **C.2** |
| Support Yin | `#yin-support-fab` | Idle（Focusing 隐藏） | L2 付费入口 | 可点 | 统一 Support 三卡入口，保留标签 | **维持** |
| 徽章条 | `#yin-tip-kindness-badges` | Idle | B 轨身份印记，非成就墙 | 可点，下载 PNG | 右侧；付费 `min=3`（Sanctuary 上限 17 / tip 上限 9）；练习分上涨只增 | **C.1** |
| 宽屏三球 | `#ft-wide-home-ctas`；`#ft-wide-home-quickstart` · `#ft-wide-home-sit` · `#ft-wide-home-honesty`；⋯ `#ft-wide-more-btn` | Idle ≥480 | **主 CTA** | 可点 | `RESPONSIVE_LAYOUT` 宽屏清场；e2e `wide-idle-more-menu` | **维持** |
| 窄屏三球 | `#ft-narrow-home-quickstart` 等（`NarrowIdleShell`） | Idle ≤479 | 主 CTA | 可点 | 同上，形态为底栏+抽屉 | **维持** |
| 星期热力图 | `#weekly-practice-heatmap`（簇 `#weekly-practice-heatmap-cluster`） | Idle | 环境层 | 可点 | 练习日点亮；非连坐惩罚 | **维持** |
| 提醒时钟 | `#reminder-preference-toggle`（在热力图簇内） | Idle | 环境层 | 可点 | 应用内提醒入口 | **维持** |
| Arrival | `#arrival-practice`（实现类 `ArrivalPracticeUI`） | Overlay | 轻量气泡，**无**面板内 Skip 三钮 | 点选前进 | `ARRIVE_MOMENT_DESIGN` §五：面板内 Skip / Skip — begin / Skip all **已移除**；跳过走 ⚡ | **C.3 不改 Arrival CTA** |
| 跳过 Arrival | `#quick-start-focus`（宽屏球 `#ft-wide-home-quickstart`） | Idle / Arrival 中 | 主路径捷径 | 可点 | ⚡ = `skipToBegin` | **维持** |
| Reflection | `#tiger-reflection-moment` | Overlay | 现网 Skip / Skip all / Continue **同级胶囊** | 可点 | `DESIGN.md`「Skip 与 Continue 视觉同级」；e2e 点 Skip all 关卡 | **C.3**（先改 DESIGN 再改代码） |
| 右下语言地球 | `#language-preference-fab` | 宽屏 Idle | 环境层 | 可点 | 与左下 `?` 同高；窄屏 CSS 隐藏 | **维持** |
| 声音 FAB | `#ambient-soundscape` 内 `.ambient-soundscape__mute` | 多场景 | 环境层 | 可点 | 常见于右上，与 Support 避让；**不是**左下 Enso | **维持** |
| 左下 Enso 印记 | `#yin-sanctuary-enso-mark` | Idle / Focusing 淡化 | B 轨装饰 | **不可点**（`pointer-events: none`） | entitled 才显示；不打开商店 | **维持** |
| 左下「?」 | `#onboarding-hint-help` | 多场景 | 帮助 | 可点 | 用途简介卡 | **维持** |

截图里「底部三个金色图标」= 宽屏三球，不是未分类仪式入口。「右下金环」优先对照语言地球；若截图更像音符，则是 Sound FAB（右上族）。「左下圆环」在已购用户上是 Enso，不是未知齿轮。

---

# C. 本轮已拍板补丁（尚未改运行时）

每条只改一个表面。实施 PR 不得顺手改断点、z-index、三球、Support FAB。

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

# D. 明确不在本文范围

- 不改 `Z_INDEX.md` 数值、不把 Yin 设为高于 `#ui-overlay`
- 不改 479 / 900 断点
- 不把三球、Support、Enso、语言地球、Sound FAB 降为 Level 3 无标签 icon
- v2.1 Implementation Contract（Yin z=10、768/1024、Tailwind 验收）**冻结作废**，只保留审计方法（脸部含下颌、等重胶囊按**实际表面**验证）

---

# E. 实施顺序

1. 本文档合入 `develop`（本 PR）——对照表生效，C 层仍是待办。
2. **C.1 徽章去文案**（最小视觉 PR；不变量：枚数公式、下载、右侧）。
3. **C.2 Idle HUD 变轻**（独立 PR；Focusing 完整；沿用 hover，不新增 click 模式）。
4. **C.3 Reflection CTA**：先改 `DESIGN.md` 再改 `TigerReflectionMoment.js`；Honesty 不同批。

脸部安全区（A.8）若 Idle 主卡仍压嘴/下巴，另开构图 PR，不要绑进 C.3。
