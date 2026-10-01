# Task Brief · 徽章颁发那一下（Idle 身旁练习章）

> **状态（2026-10-02）**：待排期 · 产品口径已拍板；动作参考见本机原型（**不进仓库**）。  
> **性质**：B 类用户可见 · 仅「颁发瞬间」动效；**不**做奖章墙、**不**改修行纪念印卡、**不**改授章规则。  
> **接哪里**：`TipKindnessBadgesChrome`（`#yin-tip-kindness-badges`）+ 会话结束庆祝链（`main.js` · `practiceBadgeAward` / `idlePracticeBadges`）。

---

## 一句话目标

练习记上账后，若身旁那一排 **新多了一枚** Idle 练习/善意/尊贵章，且用户窗口在前台，让用户 **感觉到被颁发**——背景轻轻变暗、徽章弹性弹出、一道光扫过、飞回那一排落点。  
**不**制造收集焦虑；**不**与每日庆祝 / 金辉仪式 / 成长出卡叠播。

---

## 产品口径（已拍板 · 2026-10-02）

| 项 | 口径 |
|---|---|
| 弹出对象 | **身旁新多的那一枚**（`TipKindnessBadgesChrome` 行内新增项） |
| 修行纪念印 | 已有 `#practice-imprint-card` 淡入出卡 → **本任务不改** |
| 光效 | **要**一道扫光（只在透明 PNG 形状内）；**不要**彩带 |
| 后台通知 | **先不要**；窗口不在前台 → **不播**，章已记在本机 |
| 气质 | 对齐 `PRODUCT_POSITIONING` 三级反馈之「轻量确认」档；**禁止**街机式狂欢、灰色未获得墙、3D 旋转 |

---

## 什么时候播（须 **同时** 满足）

1. 本次结束后，身旁那一排 **新多了一枚**（对比 `syncTipBadgesFromPractice` / `syncSanctuaryBadgesFromPractice` 前后 `badgeIds` 长度或 diff）。
2. **小老虎庆祝**（`Celebrating`）或 **第 7/21/100 天金辉**（`MilestoneGlow`）已 **完全结束**（序列 `onComplete` / 仪式回落 idle 之后）。
3. 本轮 **没有** 要自动打开的成长出卡：修行纪念印（`#practice-imprint-card`）、芥子诗稿印（`#mustard-seed-seal-card`）、静思典藏印（contemplative archive 自动卡）。任一将要打开 → **本飞入不播**。
4. **窗口在前台**（`document.visibilityState === 'visible'`；Electron 壳须与现有 focus 语义一致）。
5. 身旁徽章条 **已显示** 且新徽章落点 DOM **可量**：`getBoundingClientRect()` 宽高 **> 0**。专注中该条 `hidden` → **不播**，章静默出现。

**任一不满足** → 不播动画；徽章像现网一样直接出现在那一排。

### 同轮多枚

一次练习上涨可能 **同时新授多枚**。只对 **最新一枚**（`badgeIds` diff 中 catalog 序最高 / 列表末位，实现时单测锁）播飞入；其余 **直接** 出现在那一排，**禁止** 排队连播多段 ~2.5s。

---

## 会话结束顺序（精确）

```
庆祝或金辉（不变）
  → [可选] 成长出卡（纪念印 / 诗稿 / 静思典藏）— 若开则本任务跳过
  → [本任务] 徽章颁发飞入（可播则播；可跳过）
  → Reflection / Honesty bridge / Idle（下一面须等飞入结束或跳过）
```

**禁止** 与庆祝 / 金辉 **同时** 播放。  
**禁止** 与成长出卡 **叠播**（出卡优先，飞入让路）。

---

## 动效规格

> **动作参考 only**：本机 `~/Downloads/focus-tiger-award-moment.html`（**不进仓库**；不含第 3 / 第 5 条门禁，不得当 SSOT）。

| 阶段 | 时长 | 说明 |
|---|---|---|
| 背景变暗 | ~300ms | 全屏轻 dim；z-index 须登记 `Z_INDEX.md` |
| 弹性弹出 | ~800ms | 先缩小再 spring 放大；居中浮层 |
| 扫光 | ~800ms | `mask-image` = 徽章透明 PNG；`mix-blend-mode: soft-light`；**不**铺满屏 |
| 飞回落点 | ~550ms | 飞向 `#yin-tip-kindness-badges` 内 **新枚** 按钮；落下轻弹（`settle`） |
| **总长** | ~2.5s | 点一下 / `Esc` → **立即跳过**，徽章直接出现在落点 |

**`prefers-reduced-motion: reduce`** → 不播飞入；新枚直接淡入那一排（与原型一致）。

---

## 工程触点（实现前 Read）

| 模块 | 用途 |
|---|---|
| `src/ui/TipKindnessBadgesChrome.js` | 落点 DOM、`refresh()`、`setVisible()` |
| `src/core/idlePracticeBadges.js` | 身旁章 pack 解析 |
| `src/core/practiceBadgeAward.js` | score → 目标枚数 |
| `src/main.js` | `continueAfterGrowthCeremony` · `maybeOfferGrowthSealAfterBaselineCeremony` · 庆祝链 |
| `docs/Z_INDEX.md` | 新 dim / fly 层登记 |
| `docs/PRODUCT_POSITIONING.md` §八 | 反馈分级 |
| `docs/PRINCIPLES.md` | 宁静型游戏化 · 不制造焦虑 |

**建议实现**：独立 `BadgeAwardMomentUI.js`（或同级模块）+ `shouldOfferBadgeAwardMoment()` 纯函数（单测锁五门禁 + 多枚只飞最新）。

---

## 明确不做

- 彩带、粒子爆发、后台系统通知、点开通知补播动画  
- 灰色未获得墙、奖章墙、3D 倾斜、新配色体系  
- 改 `practiceBadgeAward` 公式或 Tea/Sanctuary gate  
- 改修行纪念印 / 诗稿 / 静思典藏出卡逻辑（仅 **让路**）  
- 演示 HTML 入库

---

## 验收

| # | 场景 | 预期 |
|---|---|---|
| A | 庆祝或金辉后新多 1 枚、无出卡、前台、条可见 | 飞入完整或跳过后出现于正确落点 |
| B | 同轮新多 ≥2 枚 | 只飞 **最新** 一枚；其余静默在位 |
| C | 纪念印 / 诗稿 / 静思典藏任一要开 | **无** 飞入 |
| D | 专注中条 hidden | **无** 飞入；回 Idle 后枚已在位 |
| E | 后台 / `visibility hidden` | **无** 飞入 |
| F | `prefers-reduced-motion` | 直接淡入，无飞入 |
| G | Esc / 点击跳过 | 立即落位；Reflection 随后可开 |
| H | 庆祝 / 金辉 | 顺序与现网一致，无叠播 |

自动化：`shouldOfferBadgeAwardMoment` 单测覆盖 B–F 分支；DOM 飞入可选 1 条 e2e（`data-testid` 锚点）。  
`TEST_TRACKER` 登记「待人工测试」；关单须 develop tip。

---

## 验收一句话

身旁练习章新授时，前台用户能看见 **短暂、可跳过** 的颁发飞入，且不与庆祝、金辉、成长出卡打架；后台 / 减动效 / 条不可量时静默落位。
