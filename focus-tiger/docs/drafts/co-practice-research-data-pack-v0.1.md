# 研究共修数据方案包 v0.1

草案 · 2026-11-03 · 修订 2026-11-04 · **PO 已拍板第 0 节 #1–#8（2026-11-04）** · **内部隐私审核（§0.1 · PO 豁免持牌副署）** · **伦理审查未豁免**  
代号：**T80**（人话：把「愿意参加的人，每周只分享几个汇总数字」写成可执行的字段、文案和后续任务）  
**不是**：**T54** 已上线的 Privacy「改进产品」计时计数开关。**不是** T54 90 天实验。口令「开工 T54」仍不执行。

> **大白话**：愿意参加的人，每周用一个随机编号，把几个汇总数字分享给我们，用来看「练习习惯」和「Yin 的陪伴」有没有关系。不收任何文字。默认关。先看到真实样例再决定。随时可退出并删除。本页是方案包：字段字典、中英日同意文案、首次练习后的定位提示、隐私政策三层英文稿、以及后面怎么做。

权威路径（点开用这一份）：[`co-practice-research-data-pack-v0.1.md`](./co-practice-research-data-pack-v0.1.md)

---

## 0 待拍板清单（含我的推荐）

| # | 问题 | 我认为最合理的 | PO 拍板 |
| --- | --- | --- | --- |
| 1 | 研究数据保留多久 | **24 个月后删除，或只留无法指回个人的汇总** | **已拍板** |
| 2 | 是否上传 locale 与 platform | **上传**（分析要分层）；任何分组不足 10 人不发布 | **已拍板** |
| 3 | 邀请触发 | **首次完成一次练习后轻提示一次**；点「暂不」后 30 天内不再提，最多提 2 次，之后只在设置里放入口 | **已拍板** |
| 4 | 第 2 层问卷第一版是否上线 | **不上线**（**T85** 搁置）。先把第 1 层跑稳 | **已拍板** |
| 5 | 数据控制者名称与联系邮箱 | **Twinsology** · **hello@twinsology.com**（与现网隐私页联系一致） | **已拍板** |
| 6 | 本地差分隐私噪声 | **第一版不做**（**T86** 后置） | **已拍板** |
| 7 | 与现网 **T54** Privacy 开关的关系 | **并存，不互相改写。** 新「研究共修」是独立入口、独立同意、独立 payload。不把新开关塞进 Privacy 勾选（设计要点 1）。日后若合并，另开 Brief | **已拍板** |
| 8 | 主体与伦理审查时机 | **发表论文或对外宣称「研究产品」之前**必须有书面伦理意见。第一版上传接口可在顾问函进行中开发，**不得**在无顾问函时对外说已通过伦理审查 | **已拍板** |

其余方案为何较弱：把新研究塞进现有 T54 开关会把「改进产品计数」和「共修研究周汇总」混成一次同意，律师和用户都更难理解；第一版就上问卷会把体验问题混进可能被当成健康数据的回答。

---

## 0.1 内部隐私审核（2026-11-04 · 产品授权 · PO 豁免持牌副署）

你授权本回合按隐私律师角色审方案包。**这是产品内部关闸，不是持牌律师对监管机关或期刊的法律意见书。** 对外**不得**写「已经过法律审查」或「律师已批准」。PO **2026-11-04 拍板**：R-11 持牌律师副署**豁免**；以本节 + 第 0 节拍板为准即可推进文档与实验室接口。**伦理审查（R-12）未豁免**，仍须早于任何分析结果发布；不能用本审核代替。

**持牌副署重开条件**（任一触发须重新请持牌律师书面审阅同意文案与政策，并更新 §0.1 日期）：

1. 面向欧盟或日本用户做**明确推广**（不仅 en 默认受众）  
2. 上线第 2 层问卷（**T85**）  
3. 上架 Setapp 或 Mac App Store（渠道声明变更）  
4. 收到与「研究共修」相关的隐私/数据投诉  
5. 论文或预印本投稿前（与 R-12 伦理函并行，不互相替代）

**可以按此方案往下做文档与实验室接口的理由**

- 默认关闭、独立入口、不预勾、无奖励、先给真实样例：符合「知情 + 自愿 + 可撤回」。
- 第 0 层（原文、Memory、情绪词、安全路由）写进 schema / CI，而不只写进政策。
- 18 岁自述、不收集出生日期：对未成年人规则更干净。
- 周聚合、粗时段、未知字段丢弃：符合数据最小化。
- 删除凭据即 studyId、与账单分库、不持久化 IP：方向正确。
- 第 2 层问卷第一版不上：避免把「心情/帮助感」做成健康数据争议。

**必须改口或写进政策的点（已写入本文同意文案）**

1. **不要写「完全匿名」**。studyId 在 24 个月里仍能串起同一设备的周节奏，法律上多半是**假名数据**。中英日处理说明已改。
2. **dayMask** 比「本周练了几天」更像个人轨迹。可以收，**禁止按个人公开发布**。
3. **locale × platform** 是间接识别符。维持「不足 10 人不发布」，交叉表同样适用。
4. **T54 与本研究不得用同一 ID、不得在同一秒对齐上传**，以免两套「去身份」数据对上。
5. **`fallback` / `generate` 不得作为 route.class**。它们是分类残差，可能含未命中的心情倾诉。S0 已冻结功能类三枚，见 §2.2。
6. 撤回时若 DELETE 失败：界面仍须清掉本机 ID，并**排队重试删除**；不得说「已经在服务器上删掉」除非请求成功或进入重试队列。DELETE 凭据走 `Authorization: Bearer <studyId>`，**不得**把 studyId 放进 URL（避免进边缘日志与浏览器历史）。
7. Worker / CDN 访问日志必须对本路径关闭；Bearer 凭据**不得**写入持久日志。政策只可写「不保存 IP」，不可写「传输中看不到 IP」。
8. 数据控制者：**Twinsology** · **hello@twinsology.com**（PO 拍板 #5）。跨境（若 Cloudflare 在美/欧）须在隐私政策写清。
9. 发表论文或对外称「研究产品 / 带科学研究的共修」之前：伦理书面意见（R-12）。内部本审核**不够**。在 R-12 之前，§4.1 首次提示**不得**含「科学研究 / informed by research / 裏打ち」类定位（见 §4.1）。

**对第 0 节 #1–#6 的审核结论（PO 已于 2026-11-04 拍板 #1–#8；下表保留当时内部意见）**

| # | 结论 |
| --- | --- |
| 1 保留 24 个月 | 同意。到期删除或只留不可指回个人的汇总。 |
| 2 locale / platform | 同意上传。发布时 k≥10。 |
| 3 首次练习后轻提示 | 同意。两次上限 + 设置常驻入口。专注中禁止。 |
| 4 问卷不上第一版 | **强烈同意。** |
| 5 控制者 | **Twinsology / hello@twinsology.com**（PO 已拍板） |
| 6 差分隐私后置 | 同意。有 dayMask 与纵贯 ID 时，噪声是加分项不是第一版门槛。 |

---

## 1 八条设计要点覆盖对照

对照你写的 8 条。原 v0.1 草案**没有写全**第 7 条的「官网公开页」、第 8 条伦理审查，也没有把「不放进隐私政策勾选」和现网 T54 勾选拆开。本版补全。

| # | 设计要点 | 本包落点 | 产品里现在有没有 | 后续任务 |
| --- | --- | --- | --- | --- |
| 1 | 默认关；独立「研究共修」入口；不在安装时弹；**不放进隐私政策勾选**；完成过一次练习后再出现 | §3.1、§4 | **没有**独立入口。现网只有 Privacy 里的 T54 勾选 | **T82** 同意页；**T83** 首次提示 |
| 2 | 先展示真实上传样例再同意 | §2.6、§3 | **没有**样例页 | **T82** |
| 3 | 第 1 / 第 2 层分开开关；可撤回；撤回时用研究 ID 删服务端 | §2.5、§3 | T54 关掉**不假装已删云端**（Brief 已写下一刀） | **T81** DELETE；**T82** 分层开关 |
| 4 | 不用寅币换同意；关掉后体验完全一样 | §3.1 | 现网 T54 也无奖励 | **T82** 禁奖励；单测锁体验不变 |
| 5 | 设备上算完再传；优先周聚合；差分隐私后置 | §2.2、§2.5 | T54 现为计时结束后若干计数字段，**不是**周聚合 | **T81** 周聚合；噪声归 **T86** |
| 6 | 只对 18 岁以上开放 | §3 勾选 | T54 **没有**满 18 岁勾选（当时明确不做对照入组） | **T82** |
| 7 | 公开数据字典与保留期限；小样本不发布 | §2、§6 | 无官网字段页 | **T84** 应用内政策；**T86** 官网页 |
| 8 | 独立伦理审查（发表论文几乎都要） | §8 | **没有** | **T86** |
| 附加 | 第一次练完后的轻提示（桌面共修 + 可选 weekly 研究入口；**R-12 前不写「研究产品」定位**） | §4 | **没有** | **T83** |
| 附加 | 该句纳入问号简介 + 隐私政策三层英文 | §4.2、§6 | 问号无此句；政策无三层 | **T84** |

三层数据本身：

| 层 | 含义 | 本包 |
| --- | --- | --- |
| 第 0 层 | 永不收集 | §2.4；上传接口未知字段丢弃 + CI（**T81**） |
| 第 1 层 | 研究真正需要的结构化、无文本 | §2.2 |
| 第 2 层 | 可选问卷，单独同意；不用临床量表 | §2.3；第一版不上线 |

---

## 2 研究问题与字段白名单（schema v1）

研究问题：练习行为与陪伴交互（Confide、Sit with Yin）之间的长期关系。观察性研究，只能说相关，不能说因果。

起步假设（字段必须服务其中至少一个，否则删）：

- H1：每周打开 Confide 的次数，与之后几周练习持续有关
- H2：中断之后能否回来，与此前陪伴交互**强度**有关（Confide 打开/发送、一起坐、非心情芯片点击等计数；功能类 route 枚举过窄，**不测「交互类型」**）
- H3：不同练习组合（坐、呼吸、Honesty、微仪式）与长期留存有关

### 2.1 信封字段（每次上传都有）

| 字段 | 取值 | 说明 | 服务 |
| --- | --- | --- | --- |
| studyId | 随机 UUIDv4 | 开启时在设备上生成；不从账号、邮箱、设备指纹派生；退出即删除；DELETE 凭据（`Authorization: Bearer`，不进 URL） | 去重、删除 |
| schemaVersion | 整数 | 不认识的版本整包丢弃 | 解析 |
| week | `YYYY-Www` | ISO 周，不含具体日期 | 时间轴 |
| tenureWeeks | 0–260 | 加入研究后第几周 | H1–H3 |
| locale | en / ja / zh | 界面语言 | 分层 |
| platform | web / mac / win | 运行平台 | 分层 |
| consent | v（整数）、tier2（布尔） | 同意文案版本；是否同意第 2 层；服务器另记同意日期（只到日） | 合规留档 |

### 2.2 第 1 层：周聚合（t1）

| 字段 | 取值 | 说明 | 服务 |
| --- | --- | --- | --- |
| practice.{sit,breath,honesty,micro}.started | 0–200 | 本周开始次数 | H3 |
| practice.{…}.completed | 0–200 | 本周完成次数 | H1 H3 |
| practice.{…}.minutes | 0–10080 | 本周累计分钟，整数 | H3 |
| dayMask | 7 位 0/1 | 本周每天是否有完成的练习（周一起，设备本地日） | H1 H2 |
| timeSlots.{morning,afternoon,evening,lateNight} | 0–200 | 本周**开始**的练习按四个时段计数，不记精确时间 | H3 |
| companion.confideOpened | 0–500 | 打开 Confide 次数 | H1 |
| companion.confideSent | 0–500 | 发送条数，不含内容 | H1 |
| companion.chips.{chipId} | 0–500 | 点击快捷选项次数；chipId 只能是冻结枚举 | H1 H2 |
| companion.route.{class} | 0–500 | 回应落到哪一类**功能**；class 只能是功能类白名单 | H1 H2 |
| companion.sitWithYin | 0–200 | 「一起坐」次数 | H1 H2 |
| retention.daysSinceLastPractice | 0–365 | 周末时距上次完成练习几天 | H2 |
| retention.longestGapDays | 0–365 | 本周内最长连续没练习的天数 | H2 |
| retention.comebacks | 0–7 | 本周内「中断 3 天以上后第一次回来」次数 | H2 |
| flags.{localAi,focusCircle,reminders} | 布尔 | 当周功能开关状态 | H1–H3 |

**时段（设备本地钟，不上传时钟）**

| 槽 | 本地钟 |
| --- | --- |
| morning | 05:00–11:59 |
| afternoon | 12:00–16:59 |
| evening | 17:00–21:59 |
| lateNight | 22:00–04:59 |

**chipId 冻结（S0 已对照 `confideVerbalHintChips.js`）**

现网口头芯片 id 见 `CONFIDE_VERBAL_HINT_CHIP_ID`。研究只计**非情绪**芯片：

- 可计：`forget_this`、`dont_save_this`、`practice_duration`、`practice_compare`
- **不计（第 0 层）**：`presence_trend`、`presence_recent`（问心情）

**route.class 冻结（S0 已对照 `confideRoutes.js` / 可执行工具 / 回复戳）**

只计**功能类戳**，不计分类残差、不计情绪、不计安全、不计入 Memory / 心情工具。H1 已有 `confideOpened` / `confideSent`，不必用 `fallback` / `generate` 再描一条「闲聊」。

| 可上传的 class | 现网锚点 | 为何算功能类 |
| --- | --- | --- |
| `help_center_redirect` | `CONFIDE_HELP_CENTER_REDIRECT_REPLY_ROUTE` | 产品问跳 Help Center |
| `query_practice_duration` | `CONFIDE_TOOL_ID.QUERY_PRACTICE_DURATION` | 练习时长查询 |
| `language_not_yet_open` | `CONFIDE_ROUTE.LANGUAGE_NOT_YET_OPEN` | 语种未开放提示，非心理状态 |

| 永不计数（第 0 层） | 现网锚点 | 原因 |
| --- | --- | --- |
| `safety_redirect` · `safety_care` · `aggression_toward_others` | `CONFIDE_ROUTE` | 安全 / 伤害 |
| `anxious` · `tired` · `stuck` · `sad` · `scattered` | `CONFIDE_EMOTION_BUCKETS` | 情绪桶 |
| `fallback` · `generate` | 分类残差 / 生成回复戳 | 可能夹带未命中的心情倾诉 |
| `query_presence_trend` | 心情趋势工具 | 心理状态 |
| `query_memory_list` · `forget_memory_entry` | Memory 工具 | 记忆面 |

未知 class 与未知 chipId：**丢弃、不计、不入库**。增枚举必须改 schemaVersion 并过 CI。

### 2.3 第 2 层：可选问卷（t2，单独同意，第一版不上线）

| 字段 | 取值 | 说明 |
| --- | --- | --- |
| t2.questionId | `companion_helps_continue_v1` | 固定题号 |
| t2.answer | 1–5 或空 | 「这周 Yin 的陪伴对我继续练习有帮助」；可跳过 |

无自由输入。不用临床量表。心情 / 心理状态题不做。

### 2.4 永不收集（第 0 层）

- 用户写的任何文字；Yin 回复原文；Memory 摘要；Journey Log 正文
- 情绪标签、情绪桶命中、安全路由命中；心情类芯片
- 精确时间戳、位置、IP 的持久记录、设备指纹、广告 ID
- 账号、邮箱、付款与寅币状态
- 出生日期（年龄只靠勾选「我已满 18 岁」，不保存、不上传）

写入**结构**（schema + Worker 拒收 + CI），不只写入政策。

### 2.5 服务端规则

1. 白名单校验：未知字段丢弃并只计数；类型或范围越界整包拒收；schemaVersion 不认识整包丢弃。
2. 每个 studyId 每周一条，重复上传按周覆盖。
3. 此端点不写入 IP 与 User-Agent，关闭请求日志。传输中服务器会短暂经手 IP，政策写「不保存」，不写「看不到」。
4. 存储与付费、账号数据物理分离，独立数据库或命名空间，静态加密。
5. 删除：`DELETE /api/co-practice-research-ingest`（路径中**无** studyId）。凭据：`Authorization: Bearer <studyId>`（须合法 UUIDv4；**不用**请求 body）。线上立即删除，备份最长 30 天内清除。边缘不得持久记录 Bearer 值。
6. 保留：24 个月（PO 拍板 #1）。
7. 访问：仅 PO 与指定分析人，访问留痕。
8. 发布：分组不足 10 人不发布；不发布个人轨迹。
9. 节奏：每周一次，设备端随机延后 0–24 小时；失败静默重试，不打断动效。
10. **滥用防护（S3 必验收）**：请求体大小上限（建议 ≤32 KiB，实现可微调须写进运行手册）；Cloudflare / 边缘**限流**（按 IP 或指纹做速率限制，**不**把 IP 写入研究库）；POST 信封 `studyId` 与 DELETE Bearer 值均须通过 UUIDv4 校验，否则 400。**上传无法认证真实参与者**——数据集可能混入伪造行；预注册（R-14）与分析计划须写明并规划清洗规则。

与现网 T54 `/api/t54-research-ingest`：**新路径**，例如 `/api/co-practice-research-ingest`。禁止把周聚合字段塞进旧白名单凑合。

### 2.6 样例 payload

同意页展示的必须由 **T81 周聚合序列化器**（与实际上传同一函数）生成，**禁止**在 UI 或文档里手写 JSON。实验室夹具输入固定时，输出须与 golden 逐字段一致。

**Golden SSOT**（CI S4(e)、同意页预览对照）：[`../research/research-payload.v1.golden.json`](../research/research-payload.v1.golden.json) · 须通过 [`research-payload.v1.schema.json`](../research/research-payload.v1.schema.json)。`route` 仅含冻结枚举（本例 `help_center_redirect`）。

```json
{
  "studyId": "9b1f2c7e-0000-4000-8000-000000000000",
  "schemaVersion": 1,
  "week": "2026-W46",
  "tenureWeeks": 3,
  "locale": "en",
  "platform": "mac",
  "consent": { "v": 1, "tier2": false },
  "t1": {
    "practice": {
      "sit": { "started": 4, "completed": 3, "minutes": 45 },
      "breath": { "started": 2, "completed": 2, "minutes": 10 },
      "honesty": { "started": 1, "completed": 1, "minutes": 3 },
      "micro": { "started": 0, "completed": 0, "minutes": 0 }
    },
    "dayMask": "1011010",
    "timeSlots": { "morning": 5, "afternoon": 0, "evening": 2, "lateNight": 0 },
    "companion": {
      "confideOpened": 2,
      "confideSent": 3,
      "chips": { "practice_compare": 1 },
      "route": { "help_center_redirect": 2 },
      "sitWithYin": 1
    },
    "retention": { "daysSinceLastPractice": 1, "longestGapDays": 2, "comebacks": 1 },
    "flags": { "localAi": true, "focusCircle": false, "reminders": true }
  }
}
```

---

## 3 同意页文案（草案 · 待 PO 审阅 · 已拍板字段见 §0）

实现：**T82**。切片 `src/locales/slices/co-practice-research-consent.json`。禁止改 `en.json` / `zh.json` / `ja.json`。

### 3.1 界面规则

- 入口两处：首次完成练习后的轻提示（**T83**）；设置里的「研究共修」。**不在安装时弹。不放进隐私政策勾选。**
- 三个勾选都不预勾：满 18 岁、第 1 层、第 2 层（第一版不显示第 2 层；第 1 层未勾时第 2 层置灰）。
- 页面中部：「下周将发送的内容样例」，真实序列化器 + 完整字段清单链接。
- 不加倒计时，不用愧疚式文案，不给寅币或任何权益。选「暂不」无后果。关掉后 Sit / Confide / 成长旅程与未参加者**像素级同行为**（允许文案入口本身不同）。
- 专注或仪式进行中不出现；新浮层须登记 overlay 仲裁与 `SHARED_RESOURCES` overlayBusy。

### 3.2 中文

**研究共修（可选）**

你可以选择把每周几个汇总数字，用随机编号分享给我们，帮助我们研究「练习习惯」和「Yin 的陪伴」之间有什么关系。参加与否都不影响任何功能；参加没有奖励，不参加也不会失去任何东西。

**我们会收集（每周一次，只有数字）**

- 各类练习的次数、时长、是否完成
- 练习大致在一天中的哪个时段（早、午、晚、深夜）
- 是否使用 Confide、用了几次、点了哪些快捷选项（不含内容）
- 中断了几天、之后是否回来
- 几个功能开关的状态

**我们永远不会收集**：你写的任何文字、Yin 对你说的话、记忆内容、情绪标签、你的位置、你的账号或邮箱。

**数据怎么处理**：不与你的姓名、邮箱或账号配对。我们用一个只存在本机的随机编号，把每周数字串起来。这不是「完全匿名」（同一编号下仍能看出一周周的练习节奏），但我们不会把它连回账号。单独存放，保留 24 个月；只做汇总研究，不出售、不用于广告。个人的按日练习格子（dayMask）只用于内部统计，不会按个人公开发布。

你可以随时在「设置 › 研究共修」中退出，并删除已经发送的数据。

- [ ] 我已年满 18 岁
- [ ] 我同意发送上面列出的每周汇总数据

按钮：**参加** ／ 暂不

数据控制者：Twinsology　联系：hello@twinsology.com

退出确认：**已退出。**本机上的随机编号已删除，我们会删除已收到的数据。

### 3.3 English

**Practice Study (optional)**

You can choose to share a few weekly summary numbers, under a random ID, to help us study how practice habits relate to time with Yin. Everything in the app works the same whether or not you join. There is no reward for joining, and you lose nothing by saying no.

**What we collect (once a week, numbers only)**

- How many times you did each kind of practice, for how long, and whether you finished
- Roughly what part of the day you practiced (morning, afternoon, evening, late night)
- Whether you used Confide, how many times, and which quick options you tapped (never the content)
- How many days you took off, and whether you came back
- The on/off state of a few features

**What we never collect**: anything you type, anything Yin says to you, Memory content, emotion labels, your location, your account or email.

**How it is handled**: Not linked to your name, email, or account. A random ID that lives only on this device lets us connect weekly numbers. That is not full anonymity (the same ID still shows a practice rhythm over weeks), but we will not join it to an account. Stored separately and kept for 24 months. Used only in aggregate for research. Never sold, never used for ads. Your day-by-day practice grid (dayMask) is not published as an individual record.

You can leave any time in Settings › Practice Study and delete what we have received.

- [ ] I am 18 or older
- [ ] I agree to send the weekly summary data listed above

Buttons: **Join** / Not now

Data controller: Twinsology　Contact: hello@twinsology.com

Leave confirmation: **You have left the study.** The random ID on this device is deleted, and we will delete the data we received.

### 3.4 日本語

**練習リサーチへの参加（任意）**

週ごとのいくつかの集計数値を、ランダムな番号のもとで共有していただくことで、「練習の習慣」と「Yinとの関わり」にどんな関係があるかの研究にご協力いただけます。参加してもしなくても、すべての機能をこれまでどおりご利用いただけます。参加による特典はなく、参加しなくても失うものはありません。

**収集するもの（週1回、数値のみ）**

- 各練習の回数・時間・完了したかどうか
- 練習がおおよそ一日のどの時間帯か（朝・昼・夕方・深夜）
- Confideを使ったか、何回使ったか、どのクイック選択をタップしたか（内容は含みません）
- 練習が何日途切れたか、その後戻ってきたか
- いくつかの機能のオン／オフの状態

**決して収集しないもの**：あなたが入力した文章、Yinがあなたに返した言葉、メモリの内容、感情ラベル、位置情報、アカウントやメールアドレス。

**データの扱い**：氏名・メール・アカウントとは結びつけません。この端末だけにあるランダムな番号で、週ごとの数字をつなぎます。完全な匿名ではありません（同じ番号の下では練習のリズムが見えます）が、アカウントには接合しません。専用の保管場所に24か月間保存し、集計したうえで研究にのみ使用します。販売や広告への利用は一切しません。日ごとの練習格子（dayMask）を個人単位で公表することはありません。

いつでも「設定 › 練習リサーチ」から参加をやめ、送信済みのデータの削除を求めることができます。

- [ ] 18歳以上です
- [ ] 上記の週次集計データの送信に同意します

ボタン：**参加する** ／ 今はしない

データ管理者：Twinsology　連絡先：hello@twinsology.com

参加終了の確認：**参加をやめました。**この端末のランダム番号は削除され、受信済みのデータも削除します。

---

## 4 首次练习后的定位提示（T83）

完成**第一次**合格练习（计时 Sit 达标完成，或 Honesty / 呼吸 / 微仪式完成——实现时与「练习完成」现网口径对齐）之后，Idle 且无其它叠层时，出现一次轻提示。点「了解」进入同意页；点「暂不」按 §0 #3。

**不是**安装欢迎。**不是** T51 觉照邀请。**不是** T76 冷启动。专注 / Arrival / Honesty / Reflection 进行中禁止出现。

### 4.1 锁定候选（PO 已拍板 · 点头后实现不得改口）

**与 §0 #8 / R-12 对齐**：在拿到外部伦理书面意见之前，提示**只**描述人机共修 + 可选 weekly 汇总研究，**不得**写「研究产品」「informed by research」「科学研究」「裏打ち」等对外研究定位。R-12 到位后，另 Brief 恢复「带科学研究的人机共修」定位句（可写入 §4.2 / 问号 / `CO_PRACTICE_POSITIONING`）。

禁止子串：已证明有效、诊疗、训练模型、不带任何隐私痕迹、干预、临床病名、寅币奖励。

**en**

We make a human–AI co-practice product for desk work. Your privacy is protected by default. If you'd like, you can learn about an optional weekly summary study—nothing in the app changes either way.

**zh**

我们做的是一款人机共修产品，陪你安静练习桌面工作。默认保护你的隐私。如果你想了解，可以看看可选的「研究共修」：每周只分享几个汇总数字，不参加也一切照常。

**ja**

私たちは、人とAIが一緒に練習する製品です。デスクワークの練習に静かに寄り添います。プライバシーを最優先に守ります。任意の週次集計研究について知りたい場合だけご案内します。参加しなくても、使い方は変わりません。

按钮：了解研究共修 / 暂不　·　Learn about Practice Study / Not now　·　練習リサーチについて / 今はしない

### 4.2 纳入问号与产品定位（T83 / T84 · R-12 后）

**R-12 之前**：问号与 `CO_PRACTICE_POSITIONING` **不加**「带科学研究的人机共修」叠加句；仅 §4.1 轻提示 + 同意页内研究说明。

**R-12 之后**（另 Brief 点头）可写入：

1. 问号简介 `HINT_APP_PURPOSE_BODY`（**T64** 已有「一起练习、不催不评判」）。须改「不挖矿 / no data mining」的绝对口气：改成「默认本地；研究共修仅自愿周汇总」，避免与自愿研究矛盾。
2. [`CO_PRACTICE_POSITIONING.md`](../CO_PRACTICE_POSITIONING.md) §1 叠加层可加一句「带科学研究的人机共修」，**不得**说已证明有效。
3. 身心免责段（`HINT_APP_PURPOSE_WELLNESS_BODY`）保持「不是医疗、不是心理治疗」；研究提示不得削弱这句。

未实现前：禁止在问号里写「我们正在收集研究数据」。

---

## 5 现网功能差距（安排进任务，不在本 PR 写 `src/`）

| 需要的能力 | 现网 | 安排 |
| --- | --- | --- |
| 第 0 层结构锁 + 未知字段丢弃 | T54 接收口会丢未知字段，但是**另一套字段** | **T81** 新白名单 + CI |
| 随机研究 ID、周聚合、粗粒度时段 | 无 | **T81** |
| Confide 打开/发送/芯片/功能路由计数（无原文） | 有芯片 id；无研究周账本 | **T81** 本机账本 |
| 留存：断几天、是否回来 | T54 有 14 日是否回来等，粒度不同 | **T81** 按本字典 |
| 功能开关快照 | 无研究用 flags | **T81** |
| 独立同意页 + 样例 + 18 岁 + 分层开关 + 删除 | 仅 Privacy T54 勾选 | **T82** |
| 首次练习后定位提示 | 无 | **T83** |
| 问号 + 隐私政策三层 | 隐私页只有 T54 一句 | **T84** |
| 第 2 层问卷 | 无 | **T85** 搁置 |
| 官网字典页、差分隐私、伦理审查函 | 无 | **T86** |

### 5.1 分析师 002 的 R-00–R-20 对照（2026-11-04 再核实）

002 把「产品里可能还没有」拆成 R 表。下面接到已有 T 号，**不另开代号**。S0/R-01 文档侧已做；其余未写 `src/`。

| 002 | 内容 | 接到 | 现状 |
| --- | --- | --- | --- |
| R-00 | Epic「研究共修」入任务线 | **T80** 术语表 | 已登记 T80–T86 |
| R-01 | 字典 + schema 冻结 | **T80** S0 | **已做** [`../research/DATA_DICTIONARY.md`](../research/DATA_DICTIONARY.md) |
| R-02 | 周聚合器 | **T81** S1 | 未写代码 |
| R-03 | Confide 打开/发送、chip、路由、一起坐的本地次数 | **T81** S1 补点 | **缺口最大**：只准整数，不准文本 |
| R-04 | 研究 ID 与同意 store | **T82** | 无（勿复用 T54 同意键） |
| R-05 | 同意页 + 设置独立入口 | **T82** | 无；禁止放进 Privacy 勾选 |
| R-06 | 18 岁自述 | **T82** | 无 |
| R-07 | Worker POST/DELETE | **T81** S3 | 无此端点 |
| R-08 | CI 五项守门 | **T81** S4 | 无 |
| R-09 | 周上传调度 | **T81** S5 | 无 |
| R-10 | 应用内隐私政策 + 官网字段页 | **T84** 应用内；**T86** 官网 | 政策无研究共修三层；无官网页 |
| R-11 | 持牌律师书面审阅 | **PO 豁免（§0.1）**；重开条件见 §0.1 | 内部审核已做；**不是**法律意见 |
| R-12 | 外部伦理意见 | **T86** | 无；发表分析前必过 |
| R-13 | 轻量 DPIA / 处理活动记录 | **T80** | **已做** [`../research/practice-study-dpia-self-check-v1.md`](../research/practice-study-dpia-self-check-v1.md)（一页自查，非律师意见） |
| R-14 | 研究预注册（假设与分析计划） | **T80** 文档后置 | **不是** T54 90 天预注册；须写明 **POST 无法认证**、数据集可能含伪造周包与清洗规则 |
| R-15 | 邀请话术与样本量 | **T83** | 首次提示文案已锁候选 |
| R-16 | 运行手册（访问、删除、泄露应急） | **T81** 合入时草稿 + **T86** | 无 |
| R-17 | DMG / Setapp / Mac App Store 数据声明 | **T86** | 无 |
| R-18 | 分析管线 k&lt;10 不发布 | **T86** | 无 |
| R-19 | 第 2 层问卷 | **T85** | 搁置 |
| R-20 | 本地差分隐私 | **T86** | 搁置 |

原始「三份东西」落点：字段字典 = R-01；同意页中英日 = §3 + **T82**；上传接口 Brief = **T81**（002 §4 已并入）。

---

## 6 隐私政策三层说明（英文定稿候选 · T84 写入 `PRIVACY_NOTICE.md`）

中英日三版须等价；冲突时仍以中文为准（现网惯例）。下列英文供 PO / T84 审阅定稿；中日由同一结构翻译，不另发明规则。

**Recommended English block (new subsection under Default Data Storage)**

**Practice Study (optional; off by default; separate from Privacy checkboxes)**

We never collect Layer 0: anything you type, anything Yin says, Memory summaries, emotion words, safety-route hits, precise timestamps, location, payment, email, or account identifiers.

If you are 18 or older and you opt in, Layer 1 is a weekly packet of numbers only: how often and how long you practiced each kind of session, rough time of day (morning / afternoon / evening / late night), whether you opened Confide and which non-mood quick options you tapped (counts, never text), whether you took days off and came back, and a few feature on/off flags. A random study ID lives on your device and is not derived from your account. You can leave anytime; leaving deletes the ID on the device and asks us to delete what we stored under that ID. We keep Layer 1 for 24 months, store it apart from billing, do not sell it, and do not use it for ads. Groups smaller than 10 people are not published.

Layer 2 is an optional weekly product question (not a clinical scale), behind a separate opt-in. It is not in the first release.

This Practice Study is independent of the existing Privacy switch for optional timed-sit research counts used to improve the product.

**中文对应块（写入政策时用）**

**研究共修（可选，默认关，独立入口，不是 Privacy 勾选）**

第 0 层永不收集：你输入的任何文字、Yin 的回复、Memory 摘要、情绪词、安全路由命中、精确时间、位置、付款、邮箱、账号。

年满 18 岁并自愿打开后，第 1 层每周只上传数字：各类练习的次数与时长、粗粒度时段、是否打开 Confide 以及非心情快捷选项的点击次数（无原文）、中断与回来、若干功能开关。随机研究编号只存在本机，不从账号派生。可随时退出；退出时删除本机编号并请求删除该编号下已存数据。第 1 层保留 24 个月，与账单分开放，不出售、不做广告。不足 10 人的分组不发布。

第 2 层是可选的每周产品体验题（非临床量表），须单独同意。第一版不上线。

本项与 Privacy 里现有的「可选练习效果计数（改进产品）」相互独立。

---

## 6.1 实现切片（来自草案 002 · 映射到 T80–T86）

一 PR 一切片。口令按切片来，不混 PR。

| 切片 | 内容 | 映射 | 建议模型（以 Cursor 当前列表为准） |
| --- | --- | --- | --- |
| S0 | 只读核实 + 字典 + 冻结枚举 | **本修订已完成文档侧**；对照表见 [`../research/DATA_DICTIONARY.md`](../research/DATA_DICTIONARY.md) | Composer 2.5 / Fast OFF |
| S1 | 设备端周聚合器，无网络 | **T81** 第一刀 | Composer 2.5 / Fast OFF |
| S2 | 同意页与设置 | **T82** | Composer 2.5 / Fast OFF |
| S3 | Worker POST/DELETE | **T81** 第二刀 | Grok 4.6 / Medium / Fast OFF |
| S4 | CI 五项守门 | **T81** 与 S1/S3 同批测试，出错代价高 | Grok 4.6 / Medium / Fast OFF |
| S5 | 周上传调度 | **T81** 第三刀 | Composer 2.5 / Fast OFF |
| S6 | 第 2 层问卷 | **T85** 搁置 | — |

建议顺序：S0（已做）→ S1 → S4(a)(b) → S3 → S2 → S4(c)(d)(e) → S5。

对真实用户打开前必须：S4 五项绿、隐私政策已更新（T84）、人工走通同意/撤回/删除。R-11 持牌副署 **PO 已豁免**（§0.1）；对外不得声称「已过法律审查」。伦理意见（R-12）**未豁免**，必须早于任何分析结果发布；可晚于实验室接口，但不得在无 R-12 书面意见时对外说已通过伦理审查。

## 7 执行顺序（点头后）

**我认为最合理的是：本治理 PR 只锁定方案包与 Brief；实现按 T81 → T82 → T83 与 T84 可并行文案 → T85/T86 后置。**

不把上传接口和同意页做进同一个 PR：接口可以先用实验室夹具验白名单，同意页是用户可见 B 类，要单独点头。

| 代号 | 名称 | 状态 | 槽位 | 风险 |
| --- | --- | --- | --- | --- |
| T80 | 研究共修方案包（本文） | 立即做 · 本 PR | 可选 | 低：纯文档 |
| T81 | 上传接口 + 周聚合 + CI 白名单 | 排队中 · Brief 待点头 | 可选 | 中：新后台网路 + 存储隔离 |
| T82 | 同意页与分层开关 | 排队中 · Brief 待点头 | 可选 | 中：B 类新叠层 |
| T83 | 首次练习后定位提示 | 排队中 · 依赖 T82 | 可选 | 中：结束路径打断风险 |
| T84 | 问号 + 隐私政策三层 | 排队中 · 可与 T82 并行审文案 | 可选 | 低：文案；须改「不挖矿」绝对句 |
| T85 | 第 2 层问卷 | 搁置 | 未排期 | 中：更接近体验数据 |
| T86 | 官网字典、伦理审查、差分隐私 | 搁置 | 未排期 | 低–中：法务/顾问，非代码主路径 |

口令：

- 「按 T80 方案包开工」= **不写 `src/`**。只允许改本包笔误。
- 「按 T81 Brief 开工」= 点头后新 Chat + `feature/t81-co-practice-research-upload`。
- 「按 T82 Brief 开工」= 点头后新 Chat；**禁止**与 T81 抢同一 worktree。
- 「开工 T54」仍不执行。

---

## 8 伦理审查

若要发表论文，或对外把产品称为「带科学研究的共修」，期刊与会议通常要求伦理审查或等价声明。

- 找一位外部隐私/伦理顾问，或大学伦理委员会，出一页书面意见：观察性、opt-in、无临床量表、可撤回删除。
- 成本相对论文周期不高；**T86** 跟踪，不挡 T81 实验室接口，但挡「我们已通过伦理审查」类文案。

---

## 9 冲突扫描（文档）

相邻：场景 **W**（? / Privacy / T54 勾选）、练习结束（Honesty / Reflection）、**T51** 邀请、**T76** 冷启动、问号简介（T64）、漏斗 / YPE / 备份同意。

| 轴 | 判断 |
| --- | --- |
| a. 强度 | 轻提示一次，轻于 Honesty / 危机。不得比结束庆祝更重，不得在 overlayBusy 时出现 |
| b. 语气 | 可选、可关、无奖励。禁止疗效、禁止「已证明」。§4.1 只描述可选 weekly 研究，R-12 前禁止「研究产品」定位 |
| c. 职责 | **不替代** T54 改进产品开关；**不替代** 90 天实验；**不替代** 漏斗。新研究线独立 |

疑点（须你点头，不替你改现网）：设计要点 1 要求独立开关、不放进 Privacy 勾选。现网 T54 **已经在 Privacy 里**。本包推荐**并存**。若你要求「只留一个研究开关」，须另 Brief 做迁移，本包不默默关掉 T54。
