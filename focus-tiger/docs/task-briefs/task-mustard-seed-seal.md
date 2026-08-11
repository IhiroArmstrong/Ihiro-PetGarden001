# Task Brief · 芥子须弥纪念印（Mustard Seed · Sumeru）

> 状态：**#246 已合**；金章专用素材 **2026-08-12 入库**（`feature/mustard-seed-seal-badge`）  
> 拍板：统一徽章 `score` 门槛；首次挂在计时完成仪式后；署名「乐五斋诗稿」一并露出。  
> **2026-08-12**：EN 译维持现稿（不另开人审）；金章用方章 `yin-badge-square-gold-on-silver-alt.png`（根目录中文名入库译为 kebab-case）。

## 目标

把《芥子须弥》原诗纳入产品**隐形原创标志**：达标练习水平后，在完成仪式与 Reflection 之间以 Quiet Line 式卡片首次出现；之后可从 Idle 菜单重读。

## 契约

| 项 | 口径 |
|---|---|
| 门槛 | `score = practiceDayCount + floor(lifetimeMinutes/60) ≥ 21`（`computePracticeScore`） |
| 首次时机 | 计时会话完成反馈播完 → `finishCompletedSession` → 印章卡 → Continue → Reflection |
| 文案 | 固定 ZH 原诗四句 + EN 译 + `乐五斋诗稿 · Verses of Le Wu Zhai`（不随 locale 替换原诗） |
| 徽章 | `public/ui/support/mustard-seed-seal/yin-badge-square-gold-on-silver-alt.png`（**不**写入 tip/Sanctuary `badgeIds`；与 tip 目录文件名可同名但路径分立） |
| 持久化 | `focus-tiger.mustard-seed-seal.v1`：`{ revealed, revealedAt, scoreAtReveal }` |
| 菜单 | 解锁后 ⋯ / 抽屉 `mustard-seed-seal`；未解锁不出现 |
| 禁止 | 绑付费、概率彩蛋、断签门槛、日常完成轻确认层插诗 |

## 调试

- `__mustardSeedSeal.open({ mode: 'force' })`
- `__mustardSeedSeal.clear()` / `.resolve()`

## 测试

- 单元：`mustardSeedSeal.test.js`（含 badge src 路径）+ orchestration 解锁行
- 人工：见 `TEST_TRACKER`「芥子须弥纪念印」——须见方章（非 tip 圆金章）
