# Task Brief · 朴素顿悟 Phase 1（Quiet Line 内容池 + Journey Log 静默标记）

> **状态（2026-08-14）**：Phase 1 内容层已接线（本支 `feature/quiet-line-insight-spark`）。生产洞察池 **12** 句（`INSIGHT_1`–`12`）。  
> **明确不做（本 Phase）**：Moment Whisper 插入、ACTIVE_RECOVER 池、Reflection 三问、Tip Jar / Sanctuary / `practiceBadgeAward` 耦合。

## 机制（已落地）

| 项 | 口径 |
|---|---|
| 抽取 | 经典 `DAILY_ZEN_QUOTE` ∪ 洞察种子 `DAILY_ZEN_QUOTE_INSIGHT`；按本地日取模；一天一句 |
| 同日锁 | 新 key `focus-tiger.daily-zen-quote-pool-v2.v1`（`{ dateKey, key, opened }`）；**不**覆盖旧 key |
| 当场触达 | 打开 Quiet Line 卡片才把 `opened: true`；仅当 `key` 属于种子池时给 Journey Log `insightSpark: true` |
| 展示 | Journey 行末安静 `◦`；非徽章、不跨模块 |

## 生产键 ↔ 候选编号

语气：观察 / 悖论提问；不说教；句尾避免「你应该 / 你要」。结构借鉴公案与认知解离，**非**逐句翻译商业产品。  
生产键连续 `INSIGHT_1`–`12`。候选 **#11 / #15** 结构性重写另开一轮（下一档从 `INSIGHT_13` 起）。

| 生产 key | 候选 # | EN | 状态 |
|---|---|---|---|
| `INSIGHT_1` | 1 | If a thought is already here, who is arriving late to meet it? | 生产 |
| `INSIGHT_2` | 2 | The mood has weather; the sky was not asked to agree. | 生产 |
| `INSIGHT_3` | 3 | When attention wandered, something stayed to notice the empty seat. | 生产 |
| `INSIGHT_4` | 4 | Is the tightness a story, or only tightness for a while? | 生产 |
| `INSIGHT_5` | 5 | Before the next sentence forms, a gap is already being heard. | 生产（2026-08-14 扩） |
| `INSIGHT_6` | 8 | A feeling asks to be someone; it can also remain only a feeling. | 生产（2026-08-14 扩） |
| `INSIGHT_7` | 9 | Where does the day begin, if this breath has no yesterday? | 生产（2026-08-14 扩） |
| `INSIGHT_8` | 10 | What hears the quiet after a thought ends? | 生产（2026-08-14 扩） |
| `INSIGHT_9` | 12 | This moment does not need a better version of itself. | 生产（2026-08-14 扩） |
| `INSIGHT_10` | 13 | The question of doing it right is also just a sound passing through. | 生产（2026-08-14 扩） |
| `INSIGHT_11` | 7′ | Can looking look, without turning into a chore? | 生产（#7 小改：`project` → `chore`） |
| `INSIGHT_12` | 14′ | Not every ache needs a name to be felt. | 生产（#14 小改：`tightness` → `ache`） |

## 未进生产

| 候选 # | EN | 下一步 |
|---|---|---|
| 6 | The one who wants calm is also passing weather. | 备选；与 #2 同用天气意象，池子更大后再考虑 |
| 11 | If there is a watcher, does the watcher also come and go? | 另轮重写：先定立意，勿只换措辞 |
| 15 | After the search for a self, sitting is still sitting. | 另轮重写：保留「回到日常」，勿化用砍柴挑水句式 |
