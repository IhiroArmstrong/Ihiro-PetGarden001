# Task Brief · 首页三块区域骨架（H2）

> **状态（2026-11-17）**：**已锁**。H1 #1756 已合；PO 书面：后续可连贯执行，Brief 无需再点头。  
> **人话**：宽屏首页把散落的计时/成长收到左边一块，阿寅仍在中间，右边给出倾诉与三组目录的带字入口。  
> **类**：**B 类**（改宽屏 Idle 布局与入口位置）。  
> **依赖**：`origin/develop` tip（含 H1）。方向锁 [`HOME_UX_ARCHITECTURE.md`](../HOME_UX_ARCHITECTURE.md)。  
> **不是**：H3 纪念物一件+件数。**不是** H4 挪 Support。**不是** H5 问候轮换。**不是** H6 窄屏重排。**不是** 往 `src/main.js` 加行。**不是** 新练习种类。

---

## 0. 大白话

现在宽屏左边上面是计时、下面是成长，倾诉耳朵还贴在左上。这一刀只把「今天怎样」收成左栏，「阿寅与记忆」收成右栏带文字的轻入口；中间仍是阿寅和 Begin Practice。

---

## 1. 冲突扫描（实现前）

对照 [`SCENARIO_TESTS.md`](../SCENARIO_TESTS.md)：

| 邻接 | 三轴 | 结论 |
|---|---|---|
| 场景 AV / 首页旅程一行 | 职责 | 同一行、同一点开详情。只搬家到左栏，不改数字/打卡墙 |
| 场景 A / Sit · Begin Practice | 职责 | 中央练习入口不改 |
| 场景 AE / 倾诉 | 职责 | 宽屏 Idle 关掉左耳圆标，改走右栏带字「倾诉」；仍 `onConfide`。⋯ 里 Confide 行仍在。窄屏 ActionBar 耳钮不改 |
| 场景 Z / 宽屏 ⋯ | 职责 | 右栏 Practice / Records / Quiet gifts 只打开既有组列表，不新目录 |
| 场景 Q / Support | 职责 | `#yin-support-fab` 与五卡不改位置 |
| T42 次级不挡脸 | 强度 | 右栏贴右、⋯ 打开时右栏隐藏，避免和侧边名单叠在同一处 |
| T47 专注中收控件 | 职责 | 非 Idle 不画三块骨架 |
| 菜单逃生舱 | 强度 | ⋯ 仍在 |

无未拍板冲突。倾诉从左耳改右栏文字是本锁「裸圆标不再单独承担导航」的接法，不是漏修入口。

---

## 2. H2 要做

1. 宽屏 Idle：`body.ft-home-three-zone`。`#weekly-practice-heatmap-cluster` 从左下改到左上计时卡下方，与 `#focus-hud` 成一块 Personal Progress。成长一行语义不变。  
2. 右侧 `#ft-home-zone-memories`：抬头 + 四行带字入口——Confide（过现网 `shouldShowConfideEarChrome`）、Quiet gifts、Records、Practice & moments。后三行打开既有 ⋯ 对应组。  
3. 预留空槽 `#ft-home-memorabilia-slot`（H3 才填）。  
4. 宽屏 Idle 隐藏 `#confide-ear-chrome`（改由右栏承担）。窄屏耳钮/抽屉不改。  
5. ⋯ 打开时右栏隐藏。Support FAB、语言地球、Begin Practice、三球留下。

## 3. H2 不做

纪念物缩略图、Support 降优先级、问候轮换、窄屏骨架、新 overlayBusy 源、往 `src/main.js` 加行。

---

## 变体矩阵

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| 宽屏 Idle | ≥480、Idle | 左栏热力簇在 HUD 下；右栏四行（Confide 随闸）；中央 Begin Practice | 单测源码锁 + e2e 可见 |
| 宽屏 Focusing | 开坐后 | 无 `ft-home-three-zone`；HUD 仍左上；右栏隐藏 | 单测/e2e 非 Idle 隐藏 |
| 窄屏 | &lt;480 | 无右栏；簇仍走窄屏左上既有规则 | CSS `@media` + 不改 NarrowIdleShell |
| Confide 可开 | 英语 Idle、闸开 | 右栏 Confide 可见；点了 0–1 秒见倾诉卡 | 同 ear `onConfide` |
| Confide 不可开 | 日语或闸关 | 右栏无 Confide 行；不得空点 | `shouldShowConfideEarChrome` |
| 点 Records | 宽屏 Idle | 0–1 秒见 ⋯ 列表 Records 展开 | `openMenuGroup` |
| ⋯ 已开 | 侧边名单可见 | 右栏隐藏，名单可点 | CSS `ft-wide-more-open` |
| 三语 | en / zh / ja | 区抬头切片；组名沿用 `MENU_GROUP_*` | locale slice |
| 付款 | 任意 | Support FAB / 五卡不变 | 本刀不改保护选择器 |

## 点击反馈（0–1 秒）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化 |
|---|---|---|
| 成长一行 | 现网：Where you are 详情 | — |
| Confide 行 | 现网倾诉卡打开 | — |
| Quiet gifts / Records / Practice | 浅遮罩 + 右侧该组列表 | — |
| Confide 行而闸关 | 行不渲染，无静默成功 | 不在白名单外吞点击 |

## 边缘状态

| 边缘状态 | 预期 |
|---|---|
| 练习中 / overlay suppress | 三块骨架随 Idle park 消失 |
| Honesty bridge | 不另画右栏抢桥接 |
| 已购 Lifetime | 不改 Support 已购态 |
| 模型未就绪 | 不改倾诉发送；只改入口位置 |
| `prefers-reduced-motion` | 右栏无绽放，直接在 |

## 共用机制核对

- **overlayBusy**：不新增 `*Open` 忙碌源。右栏不是 overlay。对照 `SHARED_RESOURCES.md` §4.1：切语问候路径不受本刀布局影响。  
- **HUD 呼吸**：对照 §4.2，不接 `overlayBreathing`；`#focus-hud` 仍左上，Idle 只把热力簇收到它下方，左上计时驱动不变。  
- **z-index / dim**：右栏用既有 **12**（`Z.CLUSTER`），低于 dock 16、Support FAB 24、⋯ 遮罩 25。不把 `#yin-support-modal` 写成 inline 18/19。倾听耳宽屏 Idle 隐藏，故不再占左上 z24 常驻点；Support / Ambient 音符 dim 关系不变。  
- **新建可点击叠层**：右栏是 Idle 常驻 chrome，不进 `OVERLAY_UI_SURFACE`。

## 验收

- 宽屏 Idle：成长一行在左上计时下方，不在左下三球旁。  
- 右栏带字四入口（Confide 随闸）；点组名打开既有 ⋯ 列表。  
- Support Yin 仍在右上。窄屏无本刀右栏。
