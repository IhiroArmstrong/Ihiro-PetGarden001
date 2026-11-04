# Practice Study · 数据字典（schema v1）

> **S0 · 2026-11-04**。从属 [`../drafts/co-practice-research-data-pack-v0.1.md`](../drafts/co-practice-research-data-pack-v0.1.md)。  
> 实现冻结：chipId / route.class 以本文 + 方案包 §2.2 为准。改枚举必须升 `schemaVersion`。  
> Golden 样例（S4(e)）：[`research-payload.v1.golden.json`](./research-payload.v1.golden.json)

## 信封

| 字段 | 类型 | 源 | S0 结论 |
| --- | --- | --- | --- |
| studyId | UUIDv4 字符串 | 同意开启时本机 `crypto.randomUUID()` | **需新增**同意 store |
| schemaVersion | 整数 | 常量 `1` | **需新增** |
| week | `YYYY-Www` | 设备本地日历 → ISO 周 | **需新增**派生 |
| tenureWeeks | 0–260 | 同意日到本周末的整周数 | **需新增** |
| locale | `en` \| `ja` \| `zh` | 现网 locale | **已有** |
| platform | `web` \| `mac` \| `win` | Electron vs 浏览器 | **已有**可派生 |
| consent.v | 整数 | 同意文案版本 | **需新增** |
| consent.tier2 | 布尔 | 第 2 层；v1 恒 false | **需新增**（第一版不上传 t2） |

## 第 1 层

| 字段 | 源（只读核实） | S0 结论 |
| --- | --- | --- |
| practice.sit.{started,completed,minutes} | 计时专注结束 / 莲花计入 | **部分已有**；缺「开始次数」与周桶 |
| practice.breath.* | 呼吸练习完成 | **部分已有**；需周聚合 |
| practice.honesty.* | Honesty 完成 | **部分已有**；需周聚合 |
| practice.micro.* | MicroRitual 完成 | **部分已有**；需周聚合 |
| dayMask | 练习日历按本地周 | **需派生**；禁止按个人发布 |
| timeSlots.* | 练习**开始**的本地钟点 | **多半缺口**（若只存日期） |
| companion.confideOpened | Confide 开面板 | **缺口**（现网遥测多为本机 log） |
| companion.confideSent | 点发送 | **缺口**；只计次数 |
| companion.chips.* | `trackConfideChipTapped` | **缺口**周计数；枚举已冻 |
| companion.route.* | 回复戳 / 工具 id，不是原文 | **缺口**；枚举已冻 |
| companion.sitWithYin | 一起坐 / Quiet Together | **需 S1 对照现网键**；没有则本字段恒 0 直到补点 |
| retention.* | 练习完成日 | **部分已有**（T54 粒度不同，不可复用其 payload） |
| flags.localAi | 本地 AI 开关 | **已有**偏好 |
| flags.focusCircle | Focus Circle | **需对照键名** |
| flags.reminders | 提醒总开关 | **需对照键名** |

补点纪律：只加整数计数器。禁止存文本、禁止存分类为情绪/安全的 route id。

## 冻结枚举

chipId 可上传：`forget_this` · `dont_save_this` · `practice_duration` · `practice_compare`  
chipId 禁止：`presence_trend` · `presence_recent`

route.class 可上传：`help_center_redirect` · `query_practice_duration` · `language_not_yet_open`  
route.class 禁止：`safety_redirect` · `safety_care` · `aggression_toward_others` · `anxious` · `tired` · `stuck` · `sad` · `scattered` · `fallback` · `generate` · `query_presence_trend` · `query_memory_list` · `forget_memory_entry`

## 第 0 层（永不出现在 schema）

Confide 原文、Yin 回复原文、Memory 摘要、Journey Log 正文、情绪词/情绪桶、安全路由、任何自由文本、精确时间戳、位置、持久 IP、设备指纹、账号/邮箱/付款/寅币、出生日期。未知字段：丢弃并计数，不入库。
