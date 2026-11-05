# Task Brief · 冷启动四选卡 · 正念引导语一行

> **状态（2026-11-05）**：**已点头**（PO 书面确认定稿；分析师上一轮「第五项」方案作废）。  
> **人话**：第一次自动弹出「今天想做什么」时，在标题和四个按钮之间加一句短引导，说明健身之外还有练心，把理由接到第一项「正念冥想」上。  
> **类**：**B 类**（用户可见卡面文案 + 布局一行）。  
> **依赖**：`origin/develop` tip；现网四选卡与 **T76** 已合口径（[`task-t76-cold-start-quiet-sit.md`](./task-t76-cold-start-quiet-sit.md)）。  
> **不是**：**第五项**、引导冥想菜单（[`guided-meditation-p0-audit.md`](../guided-meditation-p0-audit.md) PO 不做冷启动项）、`?` 简介卡 wellness 重复、疗效宣称、**bump** `COLD_START_GOAL_OPTIONS_VERSION`（现为 **2**）。

---

## 0. 背景

冷启动目标卡（`ColdStartGoalCardUI` · `#cold-start-goal-card`）标题为 **What would you like to do today? / 今日は何をしたいですか？**。现网 **四项**（`COLD_START_GOAL_CHOICES`）：

| # | id | 英文主标（现网） |
|---|---|---|
| 1 | `mindfulness` | Mindfulness & meditation |
| 2 | `breath` | Follow your breath |
| 3 | `study-work` | Study or work |
| 4 | `browse` | Just looking |

第一项已是正念默坐入口；副标 **Sit quietly with Yin, no guidance / ガイドなしで、阿寅と静かに座る** 说明**怎么练**。本 Brief 加一行**为什么第一项值得点**，不增选项、不改 id。

**代码入口（显示条件 SSOT）**：

- 首跑自动卡：`maybeOfferColdStartGoalCard()` → `coldStartGoalCardUI.open()`（**无** `manual`）。**须显示引导语**。  
- 手动重开：⋯ / 首页「重新选择今日方向」、? 简介次级链、选项版本横幅 CTA → `open({ manual: true })`（见 `main.js` · `openTodayDirectionManual`）。**须隐藏引导语**。  
- 实现建议：`引导语可见 ⇔ !this._manual`（与上表一致；**不要**另造 localStorage 键）。

若实卡标题/项数与本表不符 → **停工**，在 PR 前向 PO 说明差异，禁止自行加第五项。

---

## 1. 范围（只做这些）

1. 在标题 `#cold-start-goal-title` 与选项区 `.cold-start-goal-card__options` **之间**新增静态文本节点（非按钮、非新叠层）。  
2. 新增 i18n 键（建议名 **`COLD_START_GOAL_MINDFULNESS_LEDE`**，写入现有切片 [`src/locales/slices/cold-start-quiet-sit.json`](../../src/locales/slices/cold-start-quiet-sit.json)，三语键一致）：

   | locale | 文案 |
   |---|---|
   | **en** | Wellness isn't only about the gym. Many people overlook a more foundational practice: training the mind. |
   | **ja** | 運動は、からだを整えるすてきな習慣。心を整える練習にも、目を向けてみませんか。 |
   | **zh** | 健康不只有健身房。很多人忽略了一种更基本的练习：训练内心。 |

   - 对客卡面仍以 **en / ja** 为准；zh 仅工程字典，**不作**对外承诺（与 T76 §4 一致）。  
   - **禁止**写「比健身更重要」、临床疗效、或把第 2–4 项说成次等。  
3. **保留**第一项副标键 `COLD_START_GOAL_MINDFULNESS_HINT` 与现网日文主标 **マインドフルネス・瞑想**（不改「マインドフルネスと瞑想」）。  
4. 样式：副标题级字号/行距，小屏可换行；日语两行在最小支持宽度下不得裁切到不可读、不得挤没按钮可点区域（见 §6 验收）。  
5. 可访问性：引导语节点建议 `id="cold-start-goal-mindfulness-lede"`，`data-testid="cold-start-goal-mindfulness-lede"`；对话框 `aria-describedby` 可指向该 id（与 title 分工）。  
6. 回归测试：首跑显示 + 手动重开隐藏（单测或 e2e 至少各一条；撤掉逻辑须红）。

---

## 2. 不做（硬边界）

- 不加第五项；不改 `COLD_START_GOAL_CHOICES`、顺序、`resolveColdStartGoalAction` 去向。  
- **不** bump `COLD_START_GOAL_OPTIONS_VERSION`（仍为 **2**）；不触发 `today-direction-options-banner` 新理由。  
- 不新增弹层 / 气泡 / 轮询 / toast；不在 `#onboarding-app-purpose` / wellness 强制卡重复本句。  
- 不改 `en.json` / `zh.json` / `ja.json` 总账（只改 slice + 跑 `locale:slices` 生成链）。  
- 不碰付款/Support 受保护路径；不新增 `OVERLAY_UI_SURFACE` 行（卡内静态文本）。

---

## 3. 文案与产品边界

- 语气：观察式邀请，**不说教**（`PRINCIPLES.md` · `EMOTION_BIBLE.md` 观察式措辞）。  
- 「更基本 / 容易被忽略」≠ 贬低健身或疗效声称（对齐 `PRODUCT_POSITIONING.md` wellness 边界）。  
- 引导语与第一项副标分工：**为什么练** vs **怎么练**，禁止合并成一句。

**小屏日语备选（仅当验收 4 失败时启用，须 PR 说明）**：

> からだを動かす習慣のほかに、心を整える練習もあります。

---

## 4. 变体矩阵（A10）

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| EN 首跑自动卡 | 清库 · `shouldOfferColdStartGoalCard` · `open()` 无 manual | 顺序：标题 → **引导语 en** → 四项；第 1 项副标仍在 | 本刀补 e2e 或 DOM 单测 |
| JA 首跑自动卡 | 语言 ja + 清库 | 引导语为日语两句；主标仍为 マインドフルネス・瞑想 + ガイドなし副标 | 同 spec locale |
| EN/JA 窄屏 375 首跑 | 同上 | 引导语可读、四项可点；必要时启用 §3 日语一句版 | e2e 375 或手测截图 |
| 手动重开四选 | 已 seen · `open({ manual: true })` | **无**引导语；标题 + 四项与现网一致 | 单测 `manual` + testid absent |
| 选项版本横幅 CTA | 老用户横幅 · 点 CTA | 走 `manual: true` → **无**引导语 | 沿用 `today-direction-options-refresh` 路径断言 |
| ? 简介 → 今日方向 | purpose 次级链 | **无**引导语 | 手测或 e2e 若已有 |
| zh locale 首跑 | 语言 zh（若 QA 测） | 引导语显示 zh 工程句；卡面主标仍可按现网 en 键（不扩大 scope 改卡面语言策略） | 可选单测 `t()` |

---

## 5. 点击反馈（0–1 秒）（A14）

| 控件 | 点击后 0–1 秒 | 持久化三态 |
|---|---|---|
| 引导语行 | **不可点**；无 hover 假按钮 | 不涉及 |
| 四个选项 | 与现网相同（卡关 / 开练 / Idle） | 与 T76 一致；manual 时 browse 不写 seen |
| Esc / 空白 / 第 4 项 | 与现网相同 | 不变 |

引导语不引入新可点击控件 → 无新增 0–1s 反馈义务；选项行为 **不得**因多一行文本回归为哑点击。

---

## 6. 边缘状态（A14）

| 边缘 | 预期 |
|---|---|
| `manual: true` 且选 browse | 关卡不写 seen（现网）；引导语始终未显示 |
| 首跑选任一项后再次自动 offer | `shouldOfferColdStartGoalCard` false → 不再自动开卡；引导语仅首跑自动那一次 |
| Arrival / Reflection / overlay 忙碌 | 现网 `handleColdStartGoalSelect` / 开卡门闩不变 |
| 切语言（卡已开） | `onLocaleChange` 刷新引导语与选项文案 |
| Electron vs Web | 行为相同 |

---

## 7. 共用机制核对

本次不新增 overlay id、不改 `OVERLAY_SOURCES.COLD_START_GOAL`、不改 z-index 登记表；引导语为卡内静态 `<p>`。**核对结论**：Support FAB（`#yin-support-fab`）、Ambient 音符、四选卡 backdrop（现网 `Z.OVERLAY_DIM`）层级与 busy 门闩 **不受影响**；直坐 / 呼吸路由 **不**因本刀改动。

---

## 8. 冲突扫描（实现前）

**相邻场景**：场景 W 冷启动四选卡（`SCENARIO_TESTS.md`）；T76 第一项直坐；第 2 项呼吸；T64/C-11「不是禅师」；引导冥想 P1 菜单（冷启动不加项）。

| 轴 | 结论 |
|---|---|
| **强度** | 多一行只读文案，轻于到达/倾诉；不加重首屏焦虑（非 wellness 警告牌） |
| **语气** | 邀请式；ja 无「Is… only…? Not at all.」式否定；en 无反问说教 |
| **职责** | 只解释第 1 项动机；第 2–4 项去向不变；**不是**第五张同路卡 |

无「须停手改产品哲学」冲突。若 e2e 快照硬编码「标题下即选项」，须更新断言而非删引导语。

---

## 9. 验收（点头后可开工）

- [ ] 清库首跑：DOM 顺序 title → lede → options；en/ja 文案与 §1 表一致。  
- [ ] `open({ manual: true })`：`cold-start-goal-mindfulness-lede` **不存在或 hidden**。  
- [ ] `COLD_START_GOAL_OPTIONS_VERSION` 仍为 **2**；无新「选项更新」横幅理由。  
- [ ] 第 1 项副标 **未删未改键**（除非 PO 另书面改口）。  
- [ ] 375 / 最小宽度：ja 不严重裁切；若用一句备选，PR 贴 before/after 截图。  
- [ ] `npm run test:smoke`（含冷启动 / today-direction 相关用例）；Yin 首屏可见性用例无回归。  
- [ ] PR 标题含 **「纯文案，不 bump 版本号」**；描述贴 en/ja 小屏截图各一张。

---

## 10. PR / 跟踪

- **一 PR 一任务**；分支建议 `feature/cold-start-goal-mindfulness-lede` 或 `fix/…`。  
- 验收 walking fragment：`docs/tracker-entries/<分支名>.md`（待人工测试 · 首跑 + 手动重开 + 375 ja）。  
- 口令：**「按冷启动正念引导语 Brief 开工」** = 本文件已点头后可写 `src/`。

---

*版本：1.0 · 2026-11-05 · PO 确认：四选卡标题下、仅首跑自动、三语定稿、不 bump 版本、保留第一项副标*
