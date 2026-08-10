# 向阿寅倾诉 · 语料种子稿（人工）

> **状态**：草稿 · 可与实现并行攒句。  
> **权威实现约束**：`task-briefs/task-confide-to-yin-v1.md`。  
> **用法**：人工撰写 / 离线 AI 扩写候选 → **人 review** 后迁入运行时语料；本文件**不是**产品运行时数据源。

## 声音标准（入库前自检）

- 像禅师机锋或茶友：短、暖、留白；约 30–50 字（中）/ 对等英日长度。  
- 观察式：不贴标签、不追因、不说教、不给待办清单（`EMOTION_BIBLE`）。  
- 禁止：AI Coach 口吻、百科解释、诊断、评判「你不够专注」。  
- 三语同构：每条最终须有 en / ja / zh（可先写一语，补齐后再入库）。

## 桶与候选（v1 最小集）

### `anxious`

| id | zh（草稿） | en（草稿） | ja（草稿） | review |
|---|---|---|---|---|
| anxious-01 | 心口紧的时候，先坐一会儿。茶还热着。 | When the chest feels tight, sit a little. Tea is still warm. | 胸がせまい時は、少し坐る。茶はまだ温かい。 | draft |
| anxious-02 | 听见了。不必立刻解开——风也会过去。 | Heard. No need to untie it at once — wind passes too. | 聴いた。すぐ解かなくていい——風も過ぎる。 | draft |
| anxious-03 | 寅在这儿。呼吸来，呼吸去。 | Yin is here. Breath comes; breath goes. | 寅はここにいる。息が来て、息が去る。 | draft |

### `tired`

| id | zh（草稿） | en（草稿） | ja（草稿） | review |
|---|---|---|---|---|
| tired-01 | 累了就歇口气。蒲团还在。 | Tired — take a breath. The cushion stays. | 疲れたら一息。座布団はここにある。 | draft |
| tired-02 | 不必撑满今天。坐着，也算在场。 | No need to fill the day. Sitting is already being here. | 今日を埋めなくていい。坐っているだけで、すでにここ。 | draft |
| tired-03 | 茶凉了再续。你慢一点也无妨。 | Tea cools; we pour again. Slow is fine. | 茶が冷めれば、また注ぐ。ゆっくりでいい。 | draft |

### `stuck`

| id | zh（草稿） | en（草稿） | ja（草稿） | review |
|---|---|---|---|---|
| stuck-01 | 卡住时，先把问题放下半寸。 | When stuck, set the question down half an inch. | 行き詰まったら、問いを半寸下ろす。 | draft |
| stuck-02 | 路还在。此刻只坐这一步。 | The path remains. Just this one sitting now. | 道はある。今は、この坐りだけ。 | draft |
| stuck-03 | 听见卡住了。不催你。 | Heard the stuckness. No hurry from here. | 行き詰まりを聴いた。急かさない。 | draft |

### `sad`

| id | zh（草稿） | en（草稿） | ja（草稿） | review |
|---|---|---|---|---|
| sad-01 | 沉的东西可以先放在垫子边。寅陪着。 | Heavy things may rest by the cushion. Yin sits with you. | 重いものは座布団のそばに置いていい。寅が陪る。 | draft |
| sad-02 | 难过来过就好。不必解释给谁听。 | Sadness may visit. No need to explain it away. | 悲しさが来てもいい。誰かに説明しなくていい。 | draft |
| sad-03 | 灯还亮着一点点。你不是一个人坐着。 | A little light stays on. You are not sitting alone. | 灯りが少し残っている。ひとりで坐ってはいない。 | draft |

### `scattered`

| id | zh（草稿） | en（草稿） | ja（草稿） | review |
|---|---|---|---|---|
| scattered-01 | 念头多的时候，看它们路过就好。 | When thoughts crowd, let them pass by. | 思いが多い時は、通り過ぎるのを見るだけでいい。 | draft |
| scattered-02 | 心乱也不罚。回到这一息。 | A scattered mind is not punished. Return to this breath. | 心が乱れても罰しない。この一息に戻る。 | draft |
| scattered-03 | 木鱼敲一下——只这一下。 | One soft knock of the wooden fish — just once. | 木魚をひとつ——ただ一度。 | draft |

### `fallback`（唯一兜底 · 无匹配必须走这里）

| id | zh（草稿） | en（草稿） | ja（草稿） | review |
|---|---|---|---|---|
| fallback-01 | 听见了。寅安静地点头。 | Heard. Yin nods quietly. | 聴いた。寅は静かにうなずく。 | draft |
| fallback-02 | 你说的，留在这里。不必修好什么。 | What you said stays here. Nothing to fix. | あなたの言葉はここに置く。直す必要はない。 | draft |
| fallback-03 | 坐一会儿。茶友在。 | Sit a while. A tea friend is here. | 少し坐ろう。茶の友がいる。 | draft |

## 入库清单（实现前）

- [ ] 每桶 ≥3 条 **review=ok**  
- [ ] 三语齐  
- [ ] 无教练 / 诊断 / 付费 CTA  
- [ ] `fallback` 池独立，不被其它桶复用键  
