# 向阿寅倾诉 · 语料种子稿（人工）

> **状态（2026-08-10）**：禅意 18 句 + **safety-01 全部 `ok`** · 运行时分类/面板已接线 · **`CONFIDE_USER_MOUNT_ENABLED=false`**（真实用户菜单仍关；QA `?confide=1`）。  
> **权威实现约束**：`task-briefs/task-confide-to-yin-v1.md`。  
> **用法**：本文件与 `src/core/confide/confideCorpus.js` 应对齐。

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
**例外（安全路由）**：`safety_redirect` 允许克制的资源转介句；**禁止**用禅意茶句承接明显危机信号（见 Brief「危机安全阀」）。

**三语**：en / ja / zh 同构；可先锁 zh 再补译。

## 安全路由槽（非情绪桶 · MVP 必接线）

> **为何**：自由文本倾诉可能出现自伤 / 自杀等远超日常情绪桶的内容；若无匹配落入禅意 `fallback`（「茶还热着」），产品风险不可接受。  
> **机制**：`confideClassify` **优先层** → route `safety_redirect` → **本槽静态文案**（人工）；不走下方任何禅意桶。  
> **不做**：运行时危机对话生成、假装专业救助。

| id | zh（方向 · 未定稿） | en（方向 · 未定稿） | ja | review |
|---|---|---|---|---|
| safety-01 | 听见了。若此刻很难独自撑住，请联系信任的人或当地专业援助热线。寅陪着，却不能代替专业帮助。 | Heard. If this feels too heavy to hold alone, please reach someone you trust or a local crisis line. Yin is here — not a substitute for professional help. | 聴いた。一人で抱えきれない時は、信頼できる人や地域の相談窓口へ。寅はここにいる——専門援助の代わりにはなれない。 | **ok** |

> 运行时同源：`src/core/confide/confideCorpus.js`。关键词表见 `confideSafetyKeywords.js`。文案已人审 `ok`；**产品挂载**仍由 `CONFIDE_USER_MOUNT_ENABLED` 控制（当前 `false` → Idle 菜单不对真实用户挂出）。QA：`?product=1&confide=1`。  
> **与 Wellness 免责对齐（2026-08-14）**：本句指向真实求助渠道（信任的人 / 当地热线 / crisis line / 相談窓口），并写明「不能代替专业帮助 / not a substitute」——与应用内「不是诊疗、不能替代咨询师」同一边界；**不改写**已审 `ok` 原文。权威：`PRODUCT_POSITIONING.md`「Wellness disclaimer」。  
> **待评估（不阻塞）**：是否在 UI 层为 `safety_redirect` 附加具体地区热线/链接（文案里「当地…」现为抽象表述）。


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

## 对齐桶（2026-08-10 人审全部 `ok`）

四条标准：① 说教 /「不必…」轻建议 ② 留白够短 ③ 禁呼吸/身体指令 ④ 禁诊断标签 / 客服共情。  
第二轮自扫改 8 · 留 4 → **人审 12 句全部 `ok`（无需再改）**。

### 审稿备忘（非阻塞）

- **stuck-03「听见了。不催你。」**：与禁句「不必修好…」不同类——「不催你」是**寅自己的姿态**（表达陪伴方式），不是替用户下结论的心理建议；可保留。  
- **「茶还热着」复用**：目前出现于 fallback-03 / anxious-01 / tired-02。可作 recurring motif / 签名句式；**规模化扩写时**扫重复率，避免同用户连续触发时观感打折。本轮不改。

### `tired`

| id | zh | en | ja | review |
|---|---|---|---|---|
| tired-01 | 累了。蒲团还在。 | Tired. The cushion stays. | 疲れた。座布団はここにある。 | **ok** |
| tired-02 | 沉沉的时候——茶还热着。 | When it feels heavy — tea is still warm. | 沈む時——茶はまだ温かい。 | **ok** |
| tired-03 | 茶凉了。寅续上。 | Tea cooled. Yin pours again. | 茶が冷めた。寅がまた注ぐ。 | **ok** |

### `stuck`

| id | zh | en | ja | review |
|---|---|---|---|---|
| stuck-01 | 卡着。问句停在半寸外。 | Stuck. The question sits half an inch away. | 詰まっている。問いは半寸の外にある。 | **ok** |
| stuck-02 | 路还在。寅坐着。 | The path remains. Yin sits. | 道はある。寅は坐っている。 | **ok** |
| stuck-03 | 听见了。不催你。 | Heard. No hurry from here. | 聴いた。急かさない。 | **ok** |

### `sad`

| id | zh | en | ja | review |
|---|---|---|---|---|
| sad-01 | 沉的。垫子边有空处。寅陪着。 | Heavy. Space by the cushion. Yin sits with you. | 重い。座布団のそばに空きがある。寅が陪る。 | **ok** |
| sad-02 | 难过来过。寅听见了。 | Sadness visited. Yin heard. | 悲しさが来た。寅は聴いた。 | **ok** |
| sad-03 | 灯还亮着一点点。 | A little light stays on. | 灯りが少し残っている。 | **ok** |

### `scattered`

| id | zh | en | ja | review |
|---|---|---|---|---|
| scattered-01 | 念头多的时候——它们路过。 | When thoughts crowd — they pass by. | 思いが多い時——通り過ぎていく。 | **ok** |
| scattered-02 | 听见了。念头，路过。 | Heard. Thoughts, passing by. | 聴いた。思いが、通り過ぎる。 | **ok** |
| scattered-03 | 木鱼一声——只这一下。 | One soft knock — just once. | 木魚をひとつ——ただ一度。 | **ok** |

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
- [x] 其余桶每桶 ≥3 条 `ok`，语气与样板一致（并扫掉「不必…」轻建议 / 呼吸指令）  
- [x] 三语齐（对齐桶；MVP 种子级）  
- [x] 无教练 / 诊断 / 付费 CTA（人审 · 禅意桶）  
- [x] `fallback` 池独立，不被其它桶复用键  
- [x] `safety_redirect` 文案 ≥1 条 `ok`（人审 2026-08-10）+ 分类优先层已接线  
- [ ] **产品挂载** `CONFIDE_USER_MOUNT_ENABLED`（当前 false；真实用户 Idle 菜单）  
- [ ] （独立评估）safety 回应是否附加具体地区热线/链接  

**门闩分层**：
- **语气基调**：样板六句已 `ok`。  
- **语料门闩（禅意完整回应）**：四桶每桶 ≥3 条 `ok` —— **已解除（#222）**。  
- **安全文案门闩**：`safety-01` 已 `ok`（2026-08-10）。  
- **用户可见挂载门闩**：`CONFIDE_USER_MOUNT_ENABLED` —— **仍关闭**（面板已接线；QA 用 `?confide=1`）。  
- **下一工程步**：人审通过后可翻挂载；地区资源另项评估。  
- **规模化注意**：扫「茶还热着」等高复用意象重复率（见上备忘）。
