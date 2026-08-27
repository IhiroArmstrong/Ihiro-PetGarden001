# FEATURE_CONFLICT_REVIEW.md — 功能冲突扫描（实现前）

创建日期：2026-08-16  
权威路径：`focus-tiger/docs/FEATURE_CONFLICT_REVIEW.md`  
索引：`RULES_INDEX.md` → `feature-conflict-review`  
对照剧本：[`SCENARIO_TESTS.md`](./SCENARIO_TESTS.md)

地位：与 `INTERACTION_FEEDBACK_PRINCIPLES.md` / `RISK_MITIGATION_PLAYBOOK.md` / `BACKGROUND_NETWORK.md` **平级**的实现前门禁。  
目的：任何新功能/改动，实现前必须先做「冲突扫描」，而不是先做完再让用户发现问题。

---

## 核心原则

**先扫相邻已上线场景，再动手。** 扫描对照 `SCENARIO_TESTS.md` 里已经在走的用户路径，不是对照自己刚写的提案。

有冲突疑点时，本条优先级高于「验证通过后默认 commit / push / 开 PR」（见 regression-lock「Commit 汇报与分支门禁」）。即使是文档改动也不能默认执行。

---

## 何时扫描

接到会改产品行为、文案、入口、场景剧本或用户路径的任务时，**写第一行代码或改权威文档之前**先扫。

机械改动（错字、机器块 `rules:doc-sync`、纯注释、与用户路径无关的索引刷新）可在回复里写 **「无用户路径」** 并跳过三轴展开，不必硬造相邻场景。

不确定算不算用户路径 → **按有路径来扫**，不要用「只是文档」跳过。

---

## 扫描三轴

对照 `SCENARIO_TESTS.md`，找出本次改动涉及的用户路径是否和现有已上线场景在以下三方面有重叠或相近。不必通读全文；按用户意图、Five Moments、入口位置圈相邻场景即可。

### a. 强度错位

新交互的成本（点击次数、耗时、认知负荷）是否**高于**处理「更严重情形」的既有场景。

例（已发生）：切走标签后再回来的被动回归，一度比主动 Recover（用户自己点阿寅）更重——两钮 + 嵌套呼吸 vs 轻触 + toast。产品判断：被动回归不应比主动 Recover 更重，已收回。

问自己：用户没主动求助时，我们是否塞了比「更糟情况的正式路径」更重的仪式？

### b. 人设 / 语气不一致

新文案的语气是否和相邻场景的角色定位冲突（观照式 vs 指导式、伙伴 vs 教练、允许补登 vs 怀疑质问等）。

阿寅是观照者，不是监工。相邻场景若已是观察式短句，新入口就不要改口说教、追因或评判「不够专注」。权威语气仍看 `EMOTION_BIBLE.md` / `PRINCIPLES.md`；本条只问**和旁边那条路径是否打架**。

### c. 职责重叠

是否已有别的入口在处理**同一个用户意图**，导致新功能和旧入口边界模糊。

例：Honesty 已处理「别处完成的练习要补登」；若再做一个「我刚在别的 App 坐完」钮，用户分不清该点哪个。允许两个入口，但必须先写清互斥 / 主次 / 何时用哪个，并等用户拍板。

---

## 扫描后怎么走

### 无冲突

在回复里**简述**：比对了哪些相邻场景、三轴为何判断无冲突，然后按常规流程实现。

PR 第三问写同一结论（场景名 + 一句为何无冲突即可）。

### 发现任一类冲突

必须先在回复里列出：

1. **冲突点**（哪条场景、哪一轴、用户会感到什么别扭）  
2. **你的判断**（建议方案可以给；列出 ≥2 个开放方案时仍须给「我认为最合理的」，见 `recommend-most-reasonable`）  
3. **不能替用户下结论**——停在「待你决定」，**等待用户明确决定**后才能开始实现或改动代码/文档

未获明确决定前禁止：改运行时、改权威 md 正文、commit/push「先做了再说」。允许只读查证。

---

## 正面案例（照此格式）

**托盘 vs 旧 Brief（2026-08-16 选型 → 2026-08-17 分析师拍板）**

上一轮选型 Brief 曾写「脚手架不引入托盘」，与「桌面渠道 = 愿意为真 App 多付钱」可能打架。扫描**没有**默默把托盘塞进方案，而是先标出口径冲突、给判断、等拍板。分析师书面同意分层，并补了执行顺序：**步骤 A 窗口必须没有托盘；步骤 B 第一颗对外收费的 DMG 必须有**（托盘与走神修同一条验收）。随后才改权威文档（旧句改为「仅步骤 A」）。

以后类似「新方案和旧 Brief 互斥」：先摆冲突 → 等明确决定 → 再改文档/代码；禁止两份口径长期并存。分析师第二份补了执行顺序：步骤 A 窗口不带托盘；步骤 B 收费前托盘与走神修同一条验收——产品「收费 DMG 必须有托盘」不变。

**Personal Memory vs Journey Log vs turns.jsonl（2026-08-24）**

专有陪伴记忆提案与场景 Z（练习留痕）、练习云备份 6 key、L2 调试 jsonl **职责重叠**。用户书面：另开一轮只写架构、不写代码。处置：SSOT `YIN_PERSONAL_MEMORY.md`——三套边界写死；危机/情绪桶永不入库；local-only；注入 **Safety > Corpus > Memory 检索 > Qwen**；仪式 generate **仍未拍板**。`turns.jsonl` 调试边界见 `RULES_INDEX` → `companion-debug` / `.cursor/rules/focus-tiger-companion-debug.mdc`。无运行时用户路径。

**YPE vs Memory / 品味层 / 备份 / 仪式 generate（2026-08-26）**

设计师「核心算法 IP」提案与 AG Memory、品味层、练习备份、场景 Y Whisper **职责重叠**。用户书面：只写架构、不写代码。处置：SSOT `YIN_PERSONALIZATION_ENGINE.md`——YPE 是编排不是 store；云是可选 overlay；原文默认不上云；Speak probability / 仪式 generate / Memory 上云 **未拍板**。无运行时用户路径。

**YPE L0 收口（2026-08-26 · 口令开工）**

对照场景 Y Whisper / AE Confide / Sit。L0 只把现有 busy / 一生一次 Whisper / 层 3 用户主动 generate / 层序收成 `yinPersonalizationEngine.js`，parity 单测锁行为不变。不加重 Sit；不改人设层序；不接 Pack / Worker；无新可点击路径。

**YPE L1 本地智能（2026-08-26 · 口令开工 L1）**

对照 Y Whisper / AE Confide / AG Memory / Z Journey。L1 检索仍只在层 3 之前、≤3 条、low 不进；三档在 What Yin remembers 邻接、可关回 usual。Insight 只是计数对象，禁止诊断句。不替代 Memory store。用户书面：与 AG/AF 人工验收无耦合。

**YPE L2 契约收口（2026-08-26 · 文档；无运行时）**

对照 Y Whisper / AE / AG / AF / Z / 备份 / 漏斗。用户书面按收口版拍板：H.3 V1 仅五键；AF 标签与 Whisper 掩码不上云；记忆排序留 L1（不下发 `rankHint` / `memoryHints`）；云端不得用五键假装 `morning_settle`；四条同意独立。不加重 Sit；不改层序；不写 Worker。无新用户路径。

**YPE L2 Consent 关即删（2026-08-26 · 文档；无 locale / 无 UI）**

对照 AG Memory / Z 备份 / Privacy 漏斗 / AE Confide。用户确认分析师收口：默认关；关即删（停发 + 删与这次同意绑定的云记录 + 作废本机 Pack）；HINT + 可展开 DETAIL；不宣传 derived quiet/warm；禁止 anonymous。不加重 Sit；不与备份/漏斗/Memory 合并开关；不写 locale。无新用户路径。身份键后补见下行。

**YPE L2 身份键（2026-08-26 · 文档；无 Worker）**

对照 AG / Z 备份 OTP / 漏斗 / Membership `deviceToken`。设计师书面：V1 = 本机随机 opaque `ype_profile_id`（非硬件指纹、非邮箱）；第二设备 = 新档案；DELETE 只动 YPE signals+Pack；离线关闭不得假装云端已删。不加重 Sit；不与备份 OTP 合并身份；不写 locale。无新用户路径。

**YPE L2 算法契约（2026-08-26 · 文档；无 Worker）**

对照 Y Whisper / AE / AG ranking / 品味层。V1 变换 = 五键 → Pack：`companionStyle` 回声用户选档；`patternInsights=[]`；完成率 **不得**改档。不加重 Sit；不把云变成遥控器。无新用户路径。

**检索不生成 vs 桌面陪伴（2026-08-18）**

2026-08-10「禅意倾听者」已锁 **检索不生成**。桌面端侧模型提案与之冲突（人设 / 职责），扫描没有默默开工，而是列出 0.4 三问等拍板。用户书面：**不要全面推翻**；批复措辞为 **「仅限桌面端受约束生成、其余场景仍然检索不生成」**。入口与 Confide 合并；仅用户主动；生成只在安全阀 + 仪式文案 + 语料桶都未接住之后。**2026-08-18 补**：本地智能体仅 **Electron 宽屏 ⋯**；窄屏抽屉 / 手机 **没有**该能力（故意不对等，不是漏适配）。随后才改定位稿。**禁止**把这次批准扩大到 Web / Whisper / Recover / 主动开口 / 窄屏。

**低配购买 vs 假收费（2026-08-19）**

用户想在 Support / 安装说明里写 8GB 警告，并问能否让低配「知情后仍买 US$12.99 本地智能体版、不能退款」。扫描：

- **场景 Q** 现货三卡是 Tea / Membership **$6.99/月** / Sanctuary **$89.99**。立刻加第四张 $12.99 卡会和 Q 职责重叠，也容易让人以为 Membership 含该能力。
- **假收费**：L1 未开、低配默认隐藏入口时，再收一笔「只为本地智能体」的钱 = 付了看不见的能力。
- **场景 W** 的「?」适合放系统技术说明；阿寅不说这句。

**同日晚补拍板**：禁止「现在卖能聊的 AI / 低配冒险覆盖入口」。**允许** L1 后另开 **Focus Tiger Pro US$12.99/月**。

**2026-08-20 纠正**：Pro **包含** Focus Tiger Base（B 轨），不是「只买运行时、不含 Membership」。本地模型测试/入口仍是 Electron；**付款** L1 后可走 Safari（与现货 Membership 相同）。Stripe Pro Price `price_1U6EB1FuIhgJPGLiuciuX1to` 已记文档，Checkout 未接。现货仍三卡。

**同日 · Lifetime 加购（方案 A）**：已买 Sanctuary Lifetime 要本地智能体 → 一次性 **`companion.addon.lifetime`**（US$29.99 · Price `price_1U6GnXFuIhgJPGLiNlXs0IKe` 已记）——将来 **第五卡**，**不**订阅、**不**拆 Ultimate Lifetime。对照场景 Q：现货仍只测三卡；加购不是现货第四卡，也不改 `isEntitled` 对 B 轨的互覆盖。非 Lifetime 仍走 Pro $12.99/月（将来 **第四卡**；数字已锁定）。Checkout 未接。**一旦接线须第四+第五同批。**

拍板后的现货落地：说明文案进 Electron **?** + **Support Yin** 底部 + `desktop/README.md`；Windows 与 Mac 同样写 8GB；低配仍可买现有三卡（B 轨其它权益），**不能**自行打开被隐藏入口。

**Lifetime 已买断 vs 本地智能体（2026-08-20）**

用户问：买了 Sanctuary Lifetime 还要本地智能体怎么办？扫描：场景 Q 的 Lifetime 卡职责是 **B 轨买断**，不是智能体。若把智能体绑进 Lifetime 主 SKU = 白送；若再推销 Base = 和已买断的 B 轨职责重叠。**#359 曾写** L1 后另订 Pro。**同日稍后书面改价（方案 A）**：一次性 **`companion.addon.lifetime`** US$29.99（Price `price_1U6GnXFuIhgJPGLiNlXs0IKe`），**不**订阅、**不必**再买 Base。Safari / QA 5173 测的是 Web，**不能**当成「Web 已有本地 AI」——那是 Electron 主进程窄例外，不是漏做。

**同日晚 · 五产品截图纠正**：用户书面「不止需要第四卡，也需要第五卡」。对照场景 Q：现货仍三卡（Sanctuary / Base / Tea）。Dashboard 另两张（Pro、Add-on）是将来第四、第五卡，Price 已记。Sanctuary「2 prices」、Tea「3 prices」是历史价，**不是**新卡、**不是**漏接的现货。无运行时用户路径，直到另下接线口令。

**#362 合入后 · 测试节奏（2026-08-20）**：用户书面同意等 L2 真能聊再下「接 Checkout」口令（两卡同批）。**同日口令「开工桌面陪伴 L2」**：宽屏 fallback 短生成已接线；场景 Q 现货仍三卡；Whisper / Recover 仍无 generate。关单能聊待 Electron 人工。无 Checkout 用户路径。

**Local AI 扩场景会审（2026-08-26 起 · 2026-08-28 会前立场收口 · 未拍板）**

对照 Y Whisper / X Recover / X2 / S Breath / Z Journey / AE / AF / AG。设计师书面：产品层先于 A/B/C；C0–C4 ≠ 路由 L 层；V1–V5 现场唱名；Journey Delete = V2；Reflection generate = V3；C4 关闭；MUST NOT ENTER 是产品原则。与 `LOCAL_AI_OPERATING_LAYER.md`：Backup/Update 仍不进 Confide。处置：只维护 `LOCAL_AI_SCENARIO_EXPANSION_REVIEW.md`；**不**改 `LOCAL_AI_SCENARIOS_V1.md` 政策句；无 runtime。

---

## PR 第三问

点击反馈原「两问」现为 **三问**。前两问仍见 [`INTERACTION_FEEDBACK_PRINCIPLES.md`](./INTERACTION_FEEDBACK_PRINCIPLES.md)（`interaction-feedback`）。第三问在本页：

3. **冲突扫描结论**：对照了 `SCENARIO_TESTS.md` 哪些相邻场景？三轴是无冲突，还是有冲突且用户已拍板（写拍板原话要点）？

纯机械、无用户路径：写 **「无用户路径」**。  
未改可点击控件：Q1–Q2 仍可写「不涉及可点击交互」；**Q3 对所有非机械改动生效**。

改 `SCENARIO_TESTS.md` 时：新场景 / 改写场景除 0–1 秒句外，须能回答本页三轴（写在场景标题下或 PR 里）。

---

## 与相邻门禁的边界（防重复）

| 主题 | 管什么 | 不管什么 |
|---|---|---|
| **本文件** | 实现前：新路径 vs 已上线故事的强度 / 语气 / 职责 | 怎么切片落地、点击 0–1s、合入 Git |
| `interaction-feedback` | 点下去 0–1 秒看到什么；设计静默进白名单 | 这条功能该不该存在、会不会比邻路更重 |
| `recommend-most-reasonable` | 列出开放方案时必须表态最合理项 | 不代替本条「先停、等拍板」 |
| `risk-mitigation-playbook` | 中高风险**如何**切片落地（Lab / flag / 不绕 Dispatcher） | 用户路径是否与已上线故事冲突 |
| 回归锁 N7 / N10 已好清单 / 保护面 | 重写时别踩坏邻接**实现/观感** | 产品层「新仪式是否比旧路径更重」 |
| `git-agent-commit` 默认执行 | 验证通过后的 commit / push / 开 PR | 扫描有疑点时不得拿默认执行压过本条 |

降险 Playbook 与本条**叠加**：先扫冲突（本页）→ 用户拍板或确认无冲突 → 若属中高风险再套 Playbook。

---

## Agent 摘要

Cursor 规则（glob 注入，非 alwaysApply）：`.cursor/rules/focus-tiger-feature-conflict-review.mdc`（**非** SSOT；只留强制动作）。PR 模板有第三问栏。勿在其它文档复述三轴全文。正面案例（托盘 vs 旧 Brief；检索不生成 vs 桌面窄例外）见上文，照该格式处理口径冲突。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-08-28 | 会审表收口为正式会程：Ceiling / MUST NOT ENTER / Top 3 候选 / V2·V3 唱名；不改场景规划政策句。无运行时 |
| 2026-08-26 | Local AI 扩场景会审表入库（未拍板）：产品层先于 A/B/C；对照 Y/X/Z/AE/AF/AG；不改窄例外锁句。无运行时用户路径 |
| 2026-08-26 | YPE L2 算法契约入库（无代码）：五键→Pack 闭包；不按完成率改档；非空 insight / ranking 仍禁。对照 Whisper / Memory / 品味层。无运行时用户路径 |
| 2026-08-26 | YPE L2 身份键入库（无代码）：本机随机 profile ID；第二设备新档案；删除不连带备份/Memory/漏斗。对照 AG / Z OTP / 漏斗。无运行时用户路径 |
| 2026-08-24 | Yin Personal Memory 架构入库（无代码）：对照 AE / Y / Z / 练习备份；职责用三套边界拆开；仪式生成仍未拍板 |
| 2026-08-25 | Confide「练了多久」排 Slice 0：读同一练习账本、不另建记忆柜；危机/情绪桶仍先于事实应答；未写 store |
| 2026-08-24 | Agent 摘要：`focus-tiger-feature-conflict-review.mdc` 改为 glob 注入（`src` / `desktop` / `docs`），不再 alwaysApply |
| 2026-08-20 | L1 口令「开工桌面陪伴 L1」：宽屏 Confide 同一入口 + 下载层；仍不上 L2 生成、不接第四卡 / 第五卡。对照 Confide / 场景 Q / Whisper：无新菜单、无假收费卡、仪式文案不生成 |
| 2026-08-20 | 口令「开工桌面陪伴 L2」：fallback 短生成 + 四层路由。对照 Confide（桶/安全仍语料）、场景 Q（不接卡）、Whisper/Recover（无 generate）。无假收费 |
| 2026-08-20 | 用户书面纠正：Checkout 将来是五卡，不只第四卡 Pro，也必须第五卡 `companion.addon.lifetime`。Price 已记。场景 Q 关单仍只测三卡。Dashboard Sanctuary/Tea 多 price 不是新卡。无运行时用户路径 |
| 2026-08-20 | Lifetime 要本地 AI：同日稍后书面改价为一次性 `companion.addon.lifetime` US$29.99（取代稍早「另订 Pro」）。无 Electron 壳则无本地 AI；QA Safari 5173 ≠ 本地 AI 测试。Pro 含 Base（B 轨）+ 本地智能体（非 Lifetime）。Safari 可测付款、模型仍 Electron；Price ID 已记、Checkout 未接。08-19 晚「互不含 / 只有 Electron 能买」废止 |
| 2026-08-18 | 正面案例：检索不生成 vs 桌面陪伴——窄例外拍板后再改定位稿；禁止把批准扩大到 Web / 仪式文案。同日补：本地智能体仅宽屏，与原则 A 故意不对等 |
| 2026-08-17 | 正面案例：托盘 vs 旧 Brief——先摆冲突再等拍板；分析师分层后改文档。同日第二份：两步执行（窗口先、托盘+走神后），禁止绑成一次验收 |
| 2026-08-16 | 初版：实现前对照 `SCENARIO_TESTS.md` 扫强度错位 / 人设语气 / 职责重叠；有冲突须等拍板（优先于默认执行）；PR 第三问；索引 `feature-conflict-review` |
