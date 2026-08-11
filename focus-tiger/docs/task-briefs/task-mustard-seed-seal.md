# Task Brief · 芥子须弥纪念印（Mustard Seed · Sumeru）

> 状态：实现于 `feature/mustard-seed-seal`（2026-08-11）  
> 拍板：统一徽章 `score` 门槛；首次挂在计时完成仪式后；署名「乐五斋诗稿」一并露出。

## 目标

把《芥子须弥》原诗纳入产品**隐形原创标志**：达标练习水平后，在完成仪式与 Reflection 之间以 Quiet Line 式卡片首次出现；之后可从 Idle 菜单重读。

## 契约

| 项 | 口径 |
|---|---|
| 门槛 | `score = practiceDayCount + floor(lifetimeMinutes/60) ≥ 21`（`computePracticeScore`） |
| 首次时机 | 计时会话完成反馈播完 → `finishCompletedSession` → 印章卡 → Continue → Reflection |
| 文案 | 固定 ZH 原诗四句 + EN 译 + `乐五斋诗稿 · Verses of Le Wu Zhai`（不随 locale 替换原诗） |
| 徽章 | 同伴金章（暂复用 tip `yin-medallion-gold-monochrome-engraved`；**不**写入 tip/Sanctuary `badgeIds`） |
| 持久化 | `focus-tiger.mustard-seed-seal.v1`：`{ revealed, revealedAt, scoreAtReveal }` |
| 菜单 | 解锁后 ⋯ / 抽屉 `mustard-seed-seal`；未解锁不出现 |
| 禁止 | 绑付费、概率彩蛋、断签门槛、日常完成轻确认层插诗 |

## 日后跟进（2026-08-11 拍板 · 不挡本 PR）

1. **英文译人审**：现稿为工程占位译；须另开任务人审改一版（语气对齐 presence / vastness-in-the-small，忌励志鸡汤腔）。
2. **独立金章素材**：换掉 tip `gold-mono` 复用；入库 `public/ui/support/mustard-seed-seal/`（kebab-case）后再改 `MUSTARD_SEED_SEAL_BADGE_FILE` / `mustardSeedSealBadgeSrc`。

## 调试

- `__mustardSeedSeal.open({ mode: 'force' })`
- `__mustardSeedSeal.clear()` / `.resolve()`

## 测试

- 单元：`mustardSeedSeal.test.js` + orchestration 解锁行
- 人工：见 `TEST_TRACKER`「芥子须弥纪念印」
