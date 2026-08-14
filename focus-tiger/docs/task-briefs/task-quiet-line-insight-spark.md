# Task Brief · 朴素顿悟 Phase 1（Quiet Line 内容池 + Journey Log 静默标记）

> **状态（2026-08-14）**：Phase 1 内容层已接线（本支 `feature/quiet-line-insight-spark`）。生产只接入 **4** 句种子；下列其余候选**未**进 `COPY_POOLS.DAILY_ZEN_QUOTE_INSIGHT`，待语气定稿后再扩。  
> **明确不做（本 Phase）**：Moment Whisper 插入、ACTIVE_RECOVER 池、Reflection 三问、Tip Jar / Sanctuary / `practiceBadgeAward` 耦合。

## 机制（已落地）

| 项 | 口径 |
|---|---|
| 抽取 | 经典 `DAILY_ZEN_QUOTE` ∪ 洞察种子 `DAILY_ZEN_QUOTE_INSIGHT`；按本地日取模；一天一句 |
| 同日锁 | 新 key `focus-tiger.daily-zen-quote-pool-v2.v1`（`{ dateKey, key, opened }`）；**不**覆盖旧 key |
| 当场触达 | 打开 Quiet Line 卡片才把 `opened: true`；仅当 `key` 属于种子池时给 Journey Log `insightSpark: true` |
| 展示 | Journey 行末安静 `◦`；非徽章、不跨模块 |

## 候选句（en；ja 生产句已入库）

语气：观察 / 悖论提问；不说教；句尾避免「你应该 / 你要」。结构借鉴公案与认知解离，**非**逐句翻译商业产品。

| # | EN | 生产？ |
|---|---|---|
| 1 | If a thought is already here, who is arriving late to meet it? | **是** `INSIGHT_1` |
| 2 | The mood has weather; the sky was not asked to agree. | **是** `INSIGHT_2` |
| 3 | When attention wandered, something stayed to notice the empty seat. | **是** `INSIGHT_3` |
| 4 | Is the tightness a story, or only tightness for a while? | **是** `INSIGHT_4` |
| 5 | Before the next sentence forms, a gap is already being heard. | 候选 |
| 6 | The one who wants calm is also passing weather. | 候选 |
| 7 | Can looking look, without turning into a project? | 候选 |
| 8 | A feeling asks to be someone; it can also remain only a feeling. | 候选 |
| 9 | Where does the day begin, if this breath has no yesterday? | 候选 |
| 10 | What hears the quiet after a thought ends? | 候选 |
| 11 | If there is a watcher, does the watcher also come and go? | 候选 |
| 12 | This moment does not need a better version of itself. | 候选 |
| 13 | The question of doing it right is also just a sound passing through. | 候选 |
| 14 | Not every tightness needs a name to be felt. | 候选 |
| 15 | After the search for a self, sitting is still sitting. | 候选 |

定稿后：把批准的 id 追加进 `COPY_POOLS.DAILY_ZEN_QUOTE_INSIGHT` + `en.json` / `ja.json`（zh 跟 key 奇偶）；**不要**改 gate key 名。
