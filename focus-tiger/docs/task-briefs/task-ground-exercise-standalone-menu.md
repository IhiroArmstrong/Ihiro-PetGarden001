# Task Brief：Ground Exercise 独立化改造（修订版方案）

> **状态（2026-09-13）**：方案文档 · **本轮不写实现代码**  
> **取代**：`task-reset-return-mvp.md` 中「Reset 并入 Recover、接被动 Re-focus、5-emoji 分流」的触发/归属决策（该文保留作历史与组件盘点，实现以本文为准）  
> **上游拍板**：分析师确认方向 + 用户三板（范围 / 菜单位置 / 去掉心情层）

---

## 大白话总结

接地练习改成你自己从「更多」菜单点进去做，不再由系统猜你状态不好、也不再算复苏仪式的一部分。点进去后直接出现两个练习按钮，选「感受地面」或「环顾四周」即可，中间不再先选心情表情。深呼吸练习维持现在的入口，本轮不搬、不合并。实现还没开始，请你先确认：原来那条「回来之后弹出表情条」要不要整条下线。

---

## 一、架构变更（推翻此前决策 1，不是微调）

此前拍板：「Reset 并入 Recover(#6) 叙事、接被动 Re-focus Acknowledge」。

**现予推翻。** 新主张：

- Ground exercise 是**独立基本功能**，不属于 Recover 桶。
- **不**接被动 Re-focus Acknowledge。
- **不**接主动 Recover（Tiger Anchor）toast / 后续卡。
- 触发方式从「系统猜你需不需要」改为「你自己点菜单」。
- 已实现的练习本体（感受地面引导、环顾四周分步）**搬过去复用**，不推倒重做。

分析师判断（采纳）：这比硬凑进 Recover 叙事更干净；Electron 失焦检测准不准、主动 Recover 要不要加后续卡，都不再需要为本功能纠结。

---

## 二、已拍板决策（本轮以这些为准）

| # | 决策 | 落点 |
|---|---|---|
| 范围 | 新菜单项只放 **Feel the Ground** + **Look Around**。**Take a Breath 维持现状完全不动**（不搬入新菜单、不与 MicroRitual 合并） | §四复用表 · §六排除项 |
| 触发 | 仅用户点「更多」菜单；无任何被动触发 | §五 |
| 交互 | **去掉 5-emoji 心情层**。进菜单后直接两个练习按钮 | §五 |
| 位置 | 「更多」里插在 **Five Moments 入口上方**。本轮落地；菜单治理线日后可能迁移 | §五 · 代码须留 TODO 注释 |
| Recover | 主动 / 被动两条 Recover 路径都不接入 | §六 |

菜单位置注释原文（实现期写入挂载处）：

```
// TODO: menu position may move once menu-governance audit lands
```

---

## 三、地面真相（已对照当前主干代码，非假设）

审查时主干相对 `origin/develop` 不落后。下列 Reset 实现**已合入主干**（不是只停在旁支上的半成品）。本地旁支名 `feature/recover-reset-overlay` / `feature/recover-reset-offer-ui` 只作历史线索。

### 3.1 练习本体：可以复用

`RecoverResetPracticeUI.js` 已写好三条路线：

| 路线 | 行为 | 本轮 |
|---|---|---|
| `ground` | 四段引导文案约 7+7+7+6 秒，结尾 `RESET_GROUND_OUTRO` | **复用** |
| `look` | 5-4-3-2-1 分步，`Next` 或约 9 秒步进，结尾 `RESET_LOOK_OUTRO` | **复用** |
| `breath` / `overwhelmed` | compact `breath-pacer`；overwhelmed 练后 Confide 柔性链 | **不搬进新菜单**；代码本轮不删不改接线以外的「维持现状」 |

`show(route)` 已能按路线打开，**不依赖**必须先经过 emoji。新入口可直接 `show('ground')` / `show('look')`。

文案键 `RESET_GROUND_*` / `RESET_LOOK_*`（英/中/日）已存在，练习进行中**继续用这些**，不重写语气。

### 3.2 必须废弃或停用的「系统猜你」层

| 件 | 现状 | 本轮主张 |
|---|---|---|
| `RecoverResetOfferUI.js` | Re-focus toast + nod-bow 后约 8.2s 弹出 5-emoji 条 | **停用调度**：不再 `tryScheduleAfterRefocus()` |
| emoji 路由 | 🌤️继续 / 🪨地面 / 💨呼吸 / 👀环顾 / 😰呼吸后倾诉 | 新菜单**不用**这层；心情标签文案（`RESET_EMOJI_*`）不拿来当按钮名 |
| overlay 源 `recover-reset-offer` | 已登记契约 + 仲裁 + z-index 17 | 停用后可保留登记一版以免半删，或随实现 PR 删除；**不得再被 refocus 唤醒** |
| overlay 源 `recover-reset-practice` | Focusing 时允许穿过 session-hard-gate 的「软卡」例外 | **改造**：改为 Idle 菜单打开的练习卡（见 §五仲裁） |
| `TEST_TRACKER`「Reset & Return MVP · PR-A」 | 主路径仍是「切走 70s → emoji 条」 | 实现时改步骤，禁止两套互斥验收文案并存 |

### 3.3 「更多」菜单挂载（Five Moments 模式）

菜单行的唯一列表在 `idleChromeOrchestration.js` 的 `listSecondaryChromeEntries`：`MENU_GROUP_PRACTICE` 里第一项常为 companion（若可见），**紧接着就是 `five-moments`**。

新行插入方式：在 `five-moments` **正上方**推入 `{ proxy: 'ground-exercise', labelKey: 'GROUND_EXERCISE_MENU_LABEL' }`，并加上述 TODO 注释。

同模式还要改：

| 文件 | 做什么 |
|---|---|
| `idleChromeOrchestration.js` | 插入行 + TODO |
| `idleChromeOrchestration.test.js` | 窄抽屉 / 宽「更多」期望数组在 `five-moments` 前加 `ground-exercise` |
| `WideIdleMoreMenu.js` | `_proxy('ground-exercise')`：关菜单 → `onGroundExercise`（抄 `five-moments`） |
| `NarrowIdleShell.js` | 同上（关 sheet） |
| `main.js` | `onGroundExercise`：先关其它增长卡，再打开选择层（两按钮） |

宽窄壳的 handler 构造参数与 `onFiveMoments` 并列新增即可。

### 3.4 触发改主动点击后，还要不要过仲裁？

**结论：要过 `overlaySlotArbitration`；不必新开 `spriteChannelArbitration` 占用通道（与现网 Reset 练习一致）。**

依据：

1. **浮层互斥是真问题。** 用户从 Idle「更多」点开练习卡，会与 Arrival / Honesty / Reflection / Confide / MicroRitual / Five Moments 等抢同一视觉槽。现网 `RECOVER_RESET_PRACTICE` 已是 `VISUAL_SECONDARY`、`blocksIdleYinTap: true`、`BACKDROP_ONLY` 点空白关。换成菜单入口后，碰撞面从「专注中的底条」变成「Idle 增长卡族」，**更需要** `requestOverlaySlot`，不能因为「是用户点的」就跳过。
2. **现网契约不能原样照搬。** 当前仲裁把 Offer/Practice 写成 **Focusing 专用软卡**（与 Focus Awareness 同类，可穿过 `session-hard-gate`）。Idle 菜单入口必须改掉这条：Idle 应允许打开；Focusing 是否仍允许从菜单进，本方案默认 **仅 Idle「更多」可见**（「更多」本就在 park/Idle 出现），专注中不另开入口。
3. **`spriteChannelArbitration.js` 现网对 recover-reset 零引用。** 练习卡只挡摸头（契约 `blocksIdleYinTap`），不另占精灵表演通道。本轮保持：不播新情绪序列、不抢 Celebrating。若日后要在开卡时唤醒睡着的阿寅，再单独立项（对照 Confide 睡态唤醒），**本轮不做**。
4. **overlayBusy。** `recoverResetPracticeOpen` 已是 snapshot 字段，会经 overlay 契约进入 sceneAnim 忙碌。Idle 开卡后必须继续算忙，以免摸头/进睡/场景动画穿模。`SHARED_RESOURCES.md` §4.1 实现期补一行：`recoverResetPracticeOpen`（或新源 id）默认计入 overlayBusy，**无例外**（不像语言面板要给切语问候让路）。
5. **HUD 呼吸。** Feel the Ground / Look Around **没有**呼吸步，不进 `overlayBreathing`。Take a Breath 本轮不搬，§4.2 不新增驱动者。
6. **z-index / dim。** 现网练习卡登记 **z=17 半高卡、无 overlayBackdrop**。Idle 菜单打开的选择层更接近 Five Moments（卡 z18 + 遮罩 z17、`overlayBackdrop` dim）。实现期选择层走 Compass 同族遮罩，并点名：Support FAB / 音符 / 倾听耳（z=24）须走 `overlayBackdrop` idle-chrome dim，不得只盖低于 17 的背景。练习进行中可继续用现成半高卡（z17），避免重做动效。

---

## 四、复用 / 废弃 / 改造盘点

| 资产 | 处置 | 说明 |
|---|---|---|
| `RecoverResetPracticeUI` 的 ground / look 引导 | **留 · 复用** | 新菜单点按钮后直接 `show` |
| 同文件 breath / overwhelmed + Confide 链 | **留代码、不接线到新菜单** | 「Take a Breath 现状不动」= 不并入新项、不改 MicroRitual；Reset 呼吸若随 Offer 停用，等于暂时没有第三条 Reset 入口——这是刻意的 |
| `RESET_GROUND_*` / `RESET_LOOK_*` / `RESET_LOOK_NEXT` / `RESET_DISMISS` | **留** | 练习中文案 |
| `RESET_OFFER_PROMPT` / `RESET_EMOJI_*` | **停用展示** | 可留 locale 以免半删；UI 不再引用 |
| `RecoverResetOfferUI` + refocus 调度 | **废弃触发** | `main.js` 在 refocus shown 后的 `tryScheduleAfterRefocus` 删除或空实现 |
| overlay 源 `recover-reset-offer` | **停用** | 仲裁用例改为「不得再被 refocus 拉起」 |
| overlay 源 `recover-reset-practice` | **改** | 去掉 Focusing-only 软卡例外；按 Idle 增长卡让路规则改 `mustYieldTo` |
| `practice-aggregate` 的 `recover-reset-breath` 排除项 | **不动** | 本轮不处理 Breath 记账 |
| e2e `recover-reset-offer.spec.js` | **改写或替换** | 主路径改为：Idle → 更多 → Ground exercise → 点 Feel the Ground / Look Around |
| 新选择层（两按钮） | **新增薄 UI** | 不要复用 emoji 条；不要新建心情语义 |

---

## 五、菜单与交互方案

### 5.1 用户路径

```
Idle → 「更多」/ 窄屏抽屉
  → [Ground exercise]   ← 插在 Five Moments 上方
  → 选择层：两个按钮
        [ Feel the Ground ]
        [ Look Around ]
  → 对应 RecoverResetPracticeUI 练习（可 ✕ / 点空白按现契约关）
  → 关卡后回到 Idle（计时器若本就没开则无 HUD 问题；Focusing 本轮不提供此菜单）
```

### 5.2 文案 / 图标（取舍）

| 位置 | 建议 | 取舍 |
|---|---|---|
| 菜单行 | 新键 `GROUND_EXERCISE_MENU_LABEL`：英 `Ground exercise` / 中 `接地练习` / 日另译 | 不用 Five Moments 口吻，也不用 Recover |
| 按钮 1 | 新键，英 **Feel the Ground**（产品名） | **不用** `RESET_EMOJI_HEAVY`（"Heavy or ungrounded"，那是心情分流词） |
| 按钮 2 | 新键，英 **Look Around** | **不用** `RESET_EMOJI_SCANNING` |
| 按钮装饰 | 可沿用 🪨 / 👀 作图标，纯装饰 | 不是第三套选择器 |
| 练习正文 | 沿用已有 `RESET_GROUND_*` / `RESET_LOOK_*` | 观察式，不新写说教句 |
| Take a Breath | 本层**不出现** | 避免与左侧呼吸球 / MicroRitual 抢入口 |

点击后 0–1 秒：菜单收起，选择层出现（或直接进入练习——若选择层与练习同卡，则 0–1 秒内必须看见两个可点按钮，禁止静默 `return`）。不在 `SILENT_BEHAVIORS` 的沉默视为 bug。

### 5.3 冲突扫描（对照已上线路径）

- **强度**：用户主动点菜单 → 两按钮 → 短引导，轻于「被动回归还要选心情再练」（旧 Reset Offer），也不重于主动 Recover 的点虎 toast。与「被动不应比主动 Recover 更重」的历史教训**同向**（我们是在撤掉那层被动重仪式）。
- **语气**：沿用已有观察式引导句；新按钮用练习名而非情绪标签，避免「系统给你贴状态」。
- **职责**：与 MicroRitual 不重叠（Breath 不进本菜单）。与 Tiger Anchor Recover 不重叠（不接线）。与 Five Moments 指南卡：一个是一天叙事罗盘，一个是当下身体练习——入口相邻但职责不同。与仍待人工测的「Reset & Return emoji 条」**互斥**——必须停用后者，否则用户会以为接地练习有两套入口、两套故事。

无「实现前必须另选产品方向」的强度/语气冲突。**职责上唯一要你点头的**：整条被动 emoji 条下线（见文末）。

---

## 六、明确排除（本次实现仍不做）

- 不改 Take a Breath / MicroRitual
- 不接 Re-focus、不接 Tiger Anchor
- 不做 5-emoji
- 不对「菜单入口可达性」治理线统一定案（只借用「Five Moments 上方」并加 TODO）
- 不把 Ground 记入练习天数 / 莲花 / Journey（沿用 Reset MVP 对微练习的克制，除非另案）
- **本文件对应回合不写实现代码**

---

## 七、共用机制核对（`COLLAB.md` 第七节）

- **overlayBusy**：新/改后的接地选择层与练习卡开着时，须计入 sceneAnim `overlayBusy`（点名消费者：摸头、进睡、多数场景动画）。例外：**无**。不得套用 `languageOpen` 那种「切语问候要排除」的例外。
- **HUD 呼吸**：Feel the Ground / Look Around 无呼吸步；核对 `SHARED_RESOURCES.md` §4.2 后 **不** 接入 `overlayBreathing`。左上角专注计时本轮无新驱动者。
- **z≥17 遮罩**：选择层若使用 `overlayBackdrop`（建议与 Five Moments 同族），须点名 Support FAB / Ambient 音符 / 倾听耳（z=24）走 idle-chrome dim，不得只盖低于 17 的背景。练习半高卡若保持无全屏遮罩，则不新增 dim 消费者，但 z 仍须继续登记在 `Z_INDEX.md`。

---

## 八、建议的实现切片（等你说「大任务」后再写代码）

1. 停用 Offer 的 refocus 调度 + 改仲裁（Idle 可开 Practice；Offer 不再出现）。
2. 菜单行 + 两按钮选择层 + 接到现有 `show('ground'|'look')`。
3. locale / Z_INDEX / SHARED_RESOURCES §4.1 / SCENARIO_TESTS 或 tracker 步骤 / e2e 主路径替换。
4. 单测：菜单顺序；点菜单 0–1 秒可见按钮；Focusing 硬门闩下不得误开旧 Offer。

---

## 九、对分析师三点的书面确认（已拍板）

1. 新菜单只放 Feel the Ground + Look Around；Take a Breath 保持现状不动。  
2. 位置：Five Moments 上方；治理线定案后可能再迁（代码 TODO）。  
3. 不要 5-emoji；直接两个练习按钮。
