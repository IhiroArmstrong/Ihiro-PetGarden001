# Task Brief · 芥子须弥纪念印（Mustard Seed · Sumeru）

> 状态：**#246 + #256 已合** `origin/develop` tip `5440a53`（方章金章）  
> 拍板：统一徽章 `score` 门槛；首次挂在计时完成仪式后；署名「乐五斋诗稿」一并露出。  
> **2026-08-12**：EN 译维持现稿（不另开人审）；金章用方章 `yin-badge-square-gold-on-silver-alt.png`（根目录中文名入库译为 kebab-case）。  
> **2026-08-17**：第二 case《乐五斋七言歌行》纳入同一场景（同一 score、同一卡、下一场完成仪式再出）。  
> **2026-09-02**：第三 case《乐五斋诗稿〇九〇二》纳入同一场景（縱橫馳騁…所向無痕皆披靡）。

## 目标

把乐五斋原诗纳入产品**隐形原创标志**：达标练习水平后，在完成仪式与 Reflection 之间以 Quiet Line 式卡片首次出现；之后可从 Idle 菜单重读。Case 1 = 《芥子须弥》；Case 2 = 七言歌行（山海奇云…英雄岂是池中物）；Case 3 = 诗稿〇九〇二（縱橫馳騁…所向無痕皆披靡）。

## 契约

| 项 | 口径 |
|---|---|
| 门槛 | `score = practiceDayCount + floor(lifetimeMinutes/60) ≥ 21`（`computePracticeScore`）；三 case 同一门槛 |
| 首次时机 | 计时会话完成反馈播完 → `finishCompletedSession` → 印章卡（下一未揭示 case）→ Continue → Reflection |
| 文案 | Case 1：ZH 四句 + EN + `乐五斋诗稿 · Verses of Le Wu Zhai`。Case 2：ZH 四句 + EN + `乐五斋七言歌行 · Song Verse of Le Wu Zhai`。Case 3：ZH 四句 + EN + `樂五齋詩稿〇九〇二 · Verses of Le Wu Zhai · 0902`。不随 locale 替换原诗 |
| 徽章 | `public/ui/support/mustard-seed-seal/yin-badge-square-gold-on-silver-alt.png`（**不**写入 tip/Sanctuary `badgeIds`；与 tip 目录文件名可同名但路径分立） |
| 持久化 | `focus-tiger.mustard-seed-seal.v1`：`{ revealed, revealedAt, scoreAtReveal, revealedCaseIds, lastShownCaseId }`；旧档仅 `revealed` 视为 Case 1 已见 |
| 菜单 | 解锁后 ⋯ / 抽屉 `mustard-seed-seal`；未解锁不出现；已揭示 case 轮换 |
| 禁止 | 绑付费、概率彩蛋、断签门槛、日常完成轻确认层插诗 |

## 调试

- `__mustardSeedSeal.open({ mode: 'force' })`
- `__mustardSeedSeal.open({ mode: 'force', caseId: 'hero-not-pond' })`
- `__mustardSeedSeal.open({ mode: 'force', caseId: 'no-trace-might' })`
- `__mustardSeedSeal.clear()` / `.resolve()` / `.cases()`

## 测试

- 单元：`mustardSeedSeal.test.js`（含 badge src、三 case、旧档迁移）+ orchestration 解锁行
- 人工：见 `TEST_TRACKER`「芥子须弥纪念印」——须见方章（非 tip 圆金章）；Case 2 须见七言歌行署名；Case 3 须见诗稿〇九〇二
