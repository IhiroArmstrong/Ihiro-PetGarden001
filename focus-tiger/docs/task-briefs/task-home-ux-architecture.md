# Task Brief · 首页交互架构（H0 锁 · H1 第一刀）

> **状态（2026-11-17）**：**已锁**。PO 书面：先写 H0，无需再点头；H1 立刻开工；可连贯两个 PR。  
> **人话**：首页先让人看见阿寅、知道今天怎样、很自然地坐下。围着阿寅散开的入口收成侧边名单，并加一颗写着字的开始练习。  
> **类**：H0 **A 类**（只锁文档）。H1 **B 类**（改宽屏 ⋯ 展开形态 + 新主按钮）。  
> **依赖**：`origin/develop` tip。方向锁 [`HOME_UX_ARCHITECTURE.md`](../HOME_UX_ARCHITECTURE.md)。  
> **不是**：H2 三块改版。**不是** H3 收藏陈列。**不是** H4 挪 Support。**不是** H5 问候轮换。**不是** H6 窄屏重排。**不是** 复活指南针。**不是** T25 径向几何的回归修复（本刀是有意替换那套圆标）。

---

## 0. 大白话

现在人一进首页会看见阿寅，但下一步要找一圈小圆钮。这一刀只做两件事：宽屏点 ⋯ 先看到带文字的侧边名单；阿寅附近出现 Begin Practice，点了就走现在的坐下，不再先钻菜单。

---

## 1. 冲突扫描（实现前）

对照 [`SCENARIO_TESTS.md`](../SCENARIO_TESTS.md)：

| 邻接 | 三轴 | 结论 |
|---|---|---|
| 场景 A / Sit 球开到达 | 职责 | Begin Practice **同一条** Sit 代理（`btn-focus`）。不新练习种类。日常 Sit 仍走到达（T76：四选卡直坐不等于底栏直坐） |
| 场景 Z / 宽屏 ⋯ | 职责 | 五组目录与代理行不改。改的是索引形态：径向圆标 → 侧边名单 |
| T25 五图标须先出现 | 强度 | **有意替换**宽屏先出五圆标。逃生舱 ⋯ 仍在。矮窗仍直接列表 |
| T42 次级不挡脸 | 强度 | 侧栏贴右，列表仍右缘停靠；比围着阿寅的圆标更不易挡脸 |
| T47 专注中收控件 | 职责 | ⋯ 边缘召回逻辑不删 |
| 场景 Q / Support | 职责 | H1 不改 `#yin-support-fab` 与五卡 |
| 菜单逃生舱 | 强度 | ⋯ 不得因本刀隐藏或吞点击 |

无未拍板冲突。径向被替换是本锁明文，不是漏修 T25。

---

## 2. H1 要做

1. 宽屏、高度未退化时：点 `#ft-wide-more-btn` → **0–1 秒**见右侧浮动名单 `#ft-wide-more-radial`（保留此 id，避免可达脚本断），五组各一行，组名始终可见。  
2. 点一组 → 既有 `#ft-wide-more-menu` 列表，只展开该组（现网 `_openRadialGroup`）。  
3. 点遮罩 / Esc / 再点 ⋯：只关最上一层。  
4. Idle 宽屏可见 `#ft-home-begin-practice`：文案 Begin Practice / 开始练习 / 練習をはじめる。点了走 `_proxyHome('sit')`。Sit 球禁用或隐藏时，本钮同样禁用或隐藏。  
5. 底栏三球留下。窄屏抽屉不改。指南针保持关。

## 3. H1 不做

Support 搬家、成长模块重排、纪念物画廊、问候句、窄屏骨架、新 overlayBusy 源、往 `src/main.js` 加行。

---

## 变体矩阵

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| 宽屏够高 | ≥480 且高 ≥520，Idle，点 ⋯ | 0–1 秒见五组侧边名单，不是围着 ⋯ 的圆标弧 | 单测源码锁 + 既有 wide ⋯ e2e（仍找 `#ft-wide-more-radial` 五枚） |
| 宽屏矮窗 | 高 &lt;520 | 不画侧栏，直接既有列表（`_menuFlat`） | 沿用 `shouldDegenerateWideMenuRadialForButton` |
| 窄屏 | &lt;480 | 本刀无新侧栏；仍抽屉 | 不改 NarrowIdleShell |
| 点 Practice 组 | 侧栏 `MENU_GROUP_PRACTICE` | 0–1 秒见右侧 sheet，Practice 展开 | `pickWideMoreRadialGroup` |
| Begin Practice | Sit 可用 | 0–1 秒见到达（或该路径现网结果），与 Sit 球相同 | 单测代理 sit + e2e 可与 Sit 球并列一条 |
| Begin Practice | Sit 禁用 / Arrival keepQuickStart 藏 Sit | 钮禁用或隐藏，不得空点 | 与 Sit 球同步 |
| 三语 | en / zh / ja | 侧栏组名沿用既有 `MENU_GROUP_*`；Begin Practice 切片三语 | locale slice |
| 付款 | 任意 | Support FAB 与五卡路径不变 | `test:payment-contract` 本刀若未动保护选择器则可沿用；H1 不改 FAB |

## 点击反馈（0–1 秒）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化 |
|---|---|---|
| ⋯ 打开 | 浅遮罩 + 右侧五组名单；钮 `aria-expanded=true` | — |
| 侧栏某一组 | 名单收起或让位，右侧 sheet 出现该组行 | — |
| sheet 某一行 | 现网代理结果（面板 / 卡 / toast）；菜单关 | 随该行既有契约 |
| 遮罩 / Esc | 只关最上一层 | — |
| Begin Practice | 与 Sit 球相同：到达或现网 Sit 结果；`:active` 压缩 | — |
| Begin Practice 而 Sit 不可用 | 不得静默当成功；钮 disabled | 不在 `SILENT_BEHAVIORS` 白名单外吞点击 |

## 边缘状态

| 边缘状态 | 预期 |
|---|---|
| 练习中 / overlay suppress | ⋯ 仍按现网角色（含边缘召回）；Begin Practice 随 home CTAs 隐藏 |
| Honesty bridge | ⋯ 边缘召回逻辑不删 |
| `prefers-reduced-motion` | 侧栏淡入，不做绽放弧 |
| 已购 Lifetime | 本刀不改 Support 已购态 |
| 模型未就绪 | 本刀不改倾诉发送 |

## 共用机制核对

- **overlayBusy**：不新增忙碌源。仍走现网宽屏 ⋯ 开合。对照 `SHARED_RESOURCES.md` §4.1：不登记新 `*Open` 字段；切语问候路径不受本刀名单形态影响。  
- **HUD 呼吸**：对照 §4.2，本刀不接 `overlayBreathing`，左上计时驱动不变。  
- **z-index / dim**：仍用 `#ft-wide-more-backdrop` **25**、名单与 sheet **26**（`Z.SUPPORT_DIM` / `Z.SUPPORT_MODAL`）。不把 `#yin-support-modal` 写成 inline 18/19。Support FAB **24** 在菜单打开时被遮罩盖住，与现网 ⋯ 相同，不是新关系。  
- **新建可点击叠层**：名单是现网 `#ft-wide-more-radial` 的换皮，不新开 `OVERLAY_UI_SURFACE` 行。

## 验收

- 宽屏点 ⋯ 先见五组文字行，组名不靠悬停才出现。  
- Begin Practice 与 Sit 球同一去向。  
- 菜单全走完 helper 仍能点组（保留 `data-group`）。  
- 窄屏抽屉无回归。

口令「开工 H1」= 按本节改运行时。口令「开工 H2」在 H1 合入前 **不执行**。
