# Task Brief · Ambient Deep · 15s 试听（Audition）

> **状态（2026-08-12）**：**实现中** · `feature/ambient-deep-audition-15s`（Gate #251 已合）。  
> **目的**：在深度曲真锁之后，用低打扰试听把「假收费修补」变成转化路径——未付费可尝 Deep，再柔和引导 Unlock。  
> **原则**：`PRINCIPLES.md` 经济可持续；商业红线仍禁 FOMO / 稀缺倒计时。

## 为何必须另开（不要并进 Gate PR）

| 层 | 谁做 | 范围 |
|---|---|---|
| Sound Gate | **#251 已合** tip `5969872` | Basic vs Deep 分层；Deep 播前 `isEntitled('ambient.deep.play')` |
| **本 Brief · Audition** | 本任务 | 未授权点 Deep → **约 15s 试听** → fade out → 极简 Unlock 提示 |

Gate 只解决合规；**没有试听**时，Deep 行易变成「点了灰掉 / 直接跳商店」——转化弱、也易像惩罚。试听是付费价值感知的关键一环，**建议安排**，但须等 Gate 合入或可基于其 tip 开姊妹支，避免双写播放器。

## 产品契约

| 项 | 口径 |
|---|---|
| 触发 | 未 `isEntitled('ambient.deep.play')` 时点选 Deep 曲 |
| 试听长 | **15s**（可 `?ambientAuditionMs=` DEV/e2e 缩短） |
| 结束 | **柔和 fade out**（非硬切静音）；停在未授权态，不得偷偷写 preferred=deep 持久解锁 |
| 提示 | 极简一句 + 可忽略入口（Support / Sanctuary / Membership 既有路径）；文案须点名 **Sanctuary 或 Yin Membership** 均可（`ambient.deep.play` = lifetime∪subscription）；观察式 / 场域感，**禁止**「限时」「仅剩」、**禁止**只写 Sanctuary |
| 再点 | 同曲当日可再试听（或轻限频，开修前拍板；默认允许再试，忌惩罚感） |
| 上传曲 | **不受** Deep audition；用户曲始终免费 |
| i18n | en + ja（+ zh 键对齐若项目惯例） |

建议提示方向（定稿走 locales，非硬编码）：

> Unlock Sanctuary or Yin Membership to immerse in full soundscapes.

## 实现要点（将来）

1. 播放器：试听 timer + fade；与 Focusing Rise 停播 / ephemeral 契约不打架。  
2. UI：Deep 行可点（非永久 disabled）；试听中有轻量进度或静默即可。  
3. 单测：未授权 → 可开试听；15s 后停且未 entitlement；已授权 → 无试听截断。  
4. e2e：可选 1 条 shortened audition（本地 `test:e2e:changed` 单 spec）。  
5. 同步 `FREE_PAID_MATRIX`「深度音效」差距说明；`TEST_TRACKER` 新行。

## 保护面

- 免费 Basic 子集完整可播；用户上传主路径。  
- Tip ↔ Sanctuary 零耦合。  
- 不改 Rituals / Reflection。

## 建议分支

`feature/ambient-deep-audition-15s`（**base**：Gate 合入后的 `develop`，或临时 cherry Gate tip——开修前对齐）。

## 不做

- 把试听做成全曲可循环白嫖。  
- Idle 自动弹付费。  
- 与 Gate 抢同一 PR 除非用户当回合明确要求合并。
