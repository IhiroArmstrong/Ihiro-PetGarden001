# 向阿寅倾诉 · 语料种子稿（人工）

> **状态（2026-08-10）**：语气基调 v1 已定（样板桶对齐中）· 仍须人标 `review=ok` 后方可进运行时。  
> **权威实现约束**：`task-briefs/task-confide-to-yin-v1.md`。  
> **用法**：人工撰写 / 离线 AI 扩写候选 → **人 review** 后迁入运行时语料；本文件**不是**产品运行时数据源。

## 声音标准（入库前自检）

对齐已上线 `REFLECTION_ECHO_*` 气质：短、留白、陪伴；再略偏「茶友在场」。

| 维度 | 要 | 不要 |
|---|---|---|
| 长度 | 中文约 12–28 字（偏短优于凑满 50） | 心灵鸡汤长段、并列三条建议 |
| 人称 | 少用「你该」；可用「听见了」/ 旁白式；「寅」可在场 | 第二人称指令（「你要深呼吸三次」） |
| 动作 | 可选极轻场景提示（茶还热、点头）——描述阿寅侧，非命令用户 | 「喝了口茶吧」「快去休息」 |
| 机锋 | 一句放下 / 半寸 / 路过即可 | 百科解释、人生道理讲稿 |
| 标签 | 不点名用户情绪诊断 | 「你这是焦虑」「你抑郁了」 |

**禁止**：AI Coach、客服安抚腔、诊断、评判专注、付费 CTA。

**三语**：en / ja / zh 同构；可先锁 zh 再补译。

## 样板桶（语气基准 · 先审这两桶）

其余桶应对齐这两桶的「短 + 听见了 + 留白 + 偶有茶/点头」，而不是对齐鸡汤或客服。

### `fallback`（唯一兜底 · **样板 A**）

| id | zh | en | ja | review |
|---|---|---|---|---|
| fallback-01 | 听见了。寅安静地点头。 | Heard. Yin nods quietly. | 聴いた。寅は静かにうなずく。 | tone-v1 |
| fallback-02 | 你说的，留在这里。不必修好什么。 | What you said stays here. Nothing to fix. | あなたの言葉はここに置く。直す必要はない。 | tone-v1 |
| fallback-03 | 坐一会儿。茶还热着。 | Sit a while. Tea is still warm. | 少し坐ろう。茶はまだ温かい。 | tone-v1 |

### `anxious`（**样板 B**）

| id | zh | en | ja | review |
|---|---|---|---|---|
| anxious-01 | 心口紧的时候——茶还热着。 | When the chest feels tight — tea is still warm. | 胸がせまい時——茶はまだ温かい。 | tone-v1 |
| anxious-02 | 听见了。不必立刻解开。 | Heard. No need to untie it at once. | 聴いた。すぐ解かなくていい。 | tone-v1 |
| anxious-03 | 寅在这儿。呼吸来，呼吸去。 | Yin is here. Breath comes; breath goes. | 寅はここにいる。息が来て、息が去る。 | tone-v1 |

## 对齐桶（按样板改过 · 仍待人标 ok）

### `tired`

| id | zh | en | ja | review |
|---|---|---|---|---|
| tired-01 | 累了。蒲团还在。 | Tired. The cushion stays. | 疲れた。座布団はここにある。 | tone-v1 |
| tired-02 | 不必撑满今天。坐着，也算在场。 | No need to fill the day. Sitting is already being here. | 今日を埋めなくていい。坐っているだけで、すでにここ。 | tone-v1 |
| tired-03 | 茶凉了再续。不着急。 | Tea cools; we pour again. No hurry. | 茶が冷めれば、また注ぐ。急がなくていい。 | tone-v1 |

### `stuck`

| id | zh | en | ja | review |
|---|---|---|---|---|
| stuck-01 | 卡住时，把问题放下半寸。 | When stuck, set the question down half an inch. | 行き詰まったら、問いを半寸下ろす。 | tone-v1 |
| stuck-02 | 路还在。此刻只坐这一步。 | The path remains. Just this one sitting now. | 道はある。今は、この坐りだけ。 | tone-v1 |
| stuck-03 | 听见了。不催你。 | Heard. No hurry from here. | 聴いた。急かさない。 | tone-v1 |

### `sad`

| id | zh | en | ja | review |
|---|---|---|---|---|
| sad-01 | 沉的，可以先放在垫子边。寅陪着。 | The heavy may rest by the cushion. Yin sits with you. | 重いものは座布団のそばに。寅が陪る。 | tone-v1 |
| sad-02 | 难过来过就好。不必解释。 | Sadness may visit. No need to explain. | 悲しさが来てもいい。説明しなくていい。 | tone-v1 |
| sad-03 | 灯还亮着一点点。 | A little light stays on. | 灯りが少し残っている。 | tone-v1 |

### `scattered`

| id | zh | en | ja | review |
|---|---|---|---|---|
| scattered-01 | 念头多的时候，看它们路过。 | When thoughts crowd, let them pass by. | 思いが多い時は、通り過ぎるのを見る。 | tone-v1 |
| scattered-02 | 心乱也不罚。这一息就好。 | A scattered mind is not punished. This one breath is enough. | 心が乱れても罰しない。この一息でいい。 | tone-v1 |
| scattered-03 | 木鱼一声——只这一下。 | One soft knock — just once. | 木魚をひとつ——ただ一度。 | tone-v1 |

## review 标记含义

| 标记 | 含义 |
|---|---|
| `draft` | 未对齐样板 |
| `tone-v1` | 已按样板 A/B 改过语气；**仍须人标 ok** |
| `ok` | 人确认可进运行时语料 |

## 入库清单（MVP 开工前）

- [ ] 样板 A（`fallback`）三条均为 `ok`  
- [ ] 样板 B（`anxious`）三条均为 `ok`  
- [ ] 其余桶每桶 ≥3 条 `ok`，语气与样板一致  
- [ ] 三语齐  
- [ ] 无教练 / 诊断 / 付费 CTA  
- [ ] `fallback` 池独立，不被其它桶复用键  

**MVP 门闩**：上表未勾完 → **不开** `feature/confide-to-yin` 运行时。
