# 向阿寅倾诉 · 语料种子稿（人工）

> **状态（2026-08-10）**：样板 A/B 六句全部 **`ok`**（语气基调收尾）· 其余对齐桶仍须按样板再扫后才进运行时。  
> **权威实现约束**：`task-briefs/task-confide-to-yin-v1.md`。  
> **用法**：人工撰写 / 离线 AI 扩写候选 → **人 review** 后迁入运行时语料；本文件**不是**产品运行时数据源。

## 声音标准（入库前自检）

对齐已上线 `REFLECTION_ECHO_*` 气质：短、留白、陪伴；再略偏「茶友在场」。

| 维度 | 要 | 不要 |
|---|---|---|
| 长度 | 中文约 12–28 字（偏短优于凑满 50） | 心灵鸡汤长段、并列三条建议 |
| 人称 | 少用「你该」；可用「听见了」/ 旁白式；「寅」可在场 | 第二人称指令（「你要深呼吸三次」） |
| 动作 | 可选极轻**阿寅侧**场景（茶还热、点头）——描述在场，非命令用户 | 「喝了口茶吧」「快去休息」；**呼吸/身体动作引导式**（见下） |
| 机锋 | 一句放下 / 半寸 / 路过 / 并置即可 | 百科、人生道理、「不必…」类替用户下结论 |
| 标签 | 不点名用户情绪诊断；不复读「你很焦虑」式共情 | 「你这是焦虑」「我感觉到你…」 |

**禁止**：AI Coach、客服安抚腔、诊断、评判专注、付费 CTA。  
**禁止（2026-08-10 审稿补）**：语料里写「呼吸来/去」「跟随呼吸」「吸—呼」等**可被读成正念指导脚本**的短句模式；环境意象（风、茶、灯）代替身体指令。规模化时不得复制成「呼吸引导变体池」。

**三语**：en / ja / zh 同构；可先锁 zh 再补译。

## 样板桶（语气基准）

锚点句：**fallback-01**（最干净）。其余桶对齐「短 + 听见了 + 留白 + 偶有茶/点头」，禁鸡汤/客服/轻教练。

### `fallback`（唯一兜底 · **样板 A**）

| id | zh | en | ja | review |
|---|---|---|---|---|
| fallback-01 | 听见了。寅安静地点头。 | Heard. Yin nods quietly. | 聴いた。寅は静かにうなずく。 | **ok** |
| fallback-02 | 你说的，留在这里。 | What you said stays here. | あなたの言葉はここに置く。 | **ok** |
| fallback-03 | 坐一会儿。茶还热着。 | Sit a while. Tea is still warm. | 少し坐ろう。茶はまだ温かい。 | **ok** |

### `anxious`（**样板 B**）

| id | zh | en | ja | review |
|---|---|---|---|---|
| anxious-01 | 心口紧的时候——茶还热着。 | When the chest feels tight — tea is still warm. | 胸がせまい時——茶はまだ温かい。 | **ok** |
| anxious-02 | 听见了。结，还在那儿。 | Heard. The knot is still there. | 聴いた。結び目は、まだそこにある。 | **ok** |
| anxious-03 | 寅在这儿。风来了，风走了。 | Yin is here. Wind comes; wind goes. | 寅はここにいる。風が来て、風が去る。 | **ok** |

> 样板六句（2026-08-10）人审收尾：禁呼吸指令 → anxious-03 用风版作示范，与 Brief 约束一致。

## 对齐桶（仍按样板扫 · 未本轮人审）

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
| scattered-02 | 心乱也不罚。念头路过。 | A scattered mind is not punished. Thoughts pass by. | 心が乱れても罰しない。思いが通り過ぎる。 | tone-v1 |
| scattered-03 | 木鱼一声——只这一下。 | One soft knock — just once. | 木魚をひとつ——ただ一度。 | tone-v1 |

> scattered-02：已去掉「这一息就好」（呼吸引导擦边），待对齐扫时一并审。

## review 标记含义

| 标记 | 含义 |
|---|---|
| `draft` | 未对齐样板 |
| `tone-v1` | 已按样板改过；**仍须人标 ok** |
| `pending-reconfirm` | 本轮已按审稿改写；等你确认后改 `ok` |
| `discuss` | 口径待产品拍板（非纯措辞） |
| `ok` | 人确认可进运行时语料 |

## 入库清单（MVP 开工前）

- [x] 样板 A（`fallback`）三条均为 `ok`  
- [x] 样板 B（`anxious`）三条均为 `ok`  
- [x] 样板 A/B 六句全部 `ok`（语气基调门闩已解除）  
- [ ] 其余桶每桶 ≥3 条 `ok`，语气与样板一致（并扫掉「不必…」轻建议 / 呼吸指令）  
- [ ] 三语齐（对齐桶）  
- [ ] 无教练 / 诊断 / 付费 CTA  
- [ ] `fallback` 池独立，不被其它桶复用键  

**门闩分层**：
- **语气基调**：样板六句已 `ok` → 可开 `feature/confide-to-yin` 工程骨架（入口/分类/检索壳）。  
- **运行时上线**：其余桶未全部 `ok` 前，产品壳不得挂完整倾诉回应（或仅允许样板已 ok 的桶 + fallback）。
