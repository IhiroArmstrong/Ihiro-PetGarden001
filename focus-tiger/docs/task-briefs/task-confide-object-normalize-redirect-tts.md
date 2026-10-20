# Task Brief · 对象归一 + 跳转句朗读 + 只倾听（T29）

> **状态（2026-10-20）**：**已点头，实现中。** 点头口令已发。空格变体 = 相邻两词拼接；四字母及以下与 `-us`/`-ss` 不做复数还原。  
> **类别**：**B 类**（会改变「跳转还是生成」，以及跳转句是否朗读）。  
> **代号**：**T29**。占号仍是 **CR-47** 对象闸切片，不是新的 CR。  
> **时限**：须在 **10/27** 发送链冻结前合入；合入后重跑黄金脚本英文 60 句 + 安全回归。来不及 → 写进复核纸，本刀不上。  
> **分支建议**：规格 `docs/t29-object-normalize-tts-brief`；实现 `fix/confide-object-normalize-redirect-tts`（**新 Chat**，口令后才开）。  
> **交叉**：[`task-confide-product-ask-operational-gate.md`](./task-confide-product-ask-operational-gate.md)（CR-47）· [`task-confide-product-ask-entry-split.md`](./task-confide-product-ask-entry-split.md)（T21–T23）· [`task-confide-tts-v1.md`](./task-confide-tts-v1.md) · [`CONFIDE_NOW.md`](../CONFIDE_NOW.md) · [`CONFIDE_REVIEW_ONE_PAGER.md`](../CONFIDE_REVIEW_ONE_PAGER.md)

---

## 0. 大白话

备份的几种英文写法（`backup` / `back up` / `back-up`）应对上同一件产品东西。Help Center 跳转句要念出来，让只靠听的人知道去菜单问。危机转介仍静音，等 10/28 专业复核人决定，不由本刀改。

倾诉里加一句：这里是听，怎么用去 Help Center。

---

## 一、拍板锁（点头即锁）

1. **通用对象归一，不是某一句补丁。** 对**目录全部名词关键词**和**用户输入**做同一套归一：空白、连字符、英文单复数。禁止只处理 `backup`。禁止按症状加问法词表（`R-Confide-No-Symptom-List`）。禁止把 `Where can I click to back up the data?` 写进 keywords。  
2. **只影响「跳转还是生成」。** 不碰安全通道、不改 safety-01、不改危机阈值、不改 `aggression_toward_others`。  
3. **跳转句朗读。** `help_center_redirect` 加入 Confide TTS 白名单。Electron 宽屏出跳转句后 **0–1 秒内**开始念。Web / 窄屏仍无 TTS。  
4. **危机转介朗读：本刀不做。** `safety_redirect` / `safety_care` / `aggression_toward_others` 继续静音。是否给危机句加朗读 = **10/28 向复核人提的问题**，见复核一页纸；产品组不定。  
5. **跳转句英文（替换 T21 §10 / locale 现句）：**  
   `I keep how-to answers in Help Center. Open it from the menu and type or speak your question. I'm here to listen.`  
   中文 / 日文按同一意思改 locale 切片，不另造口径。  
6. **明确不做（本刀）：** Zen how-to 过宽、复述提问（CR-22）、徽章个人事实（CR-06）、陪伴生成质量。这四条**不是安全问题**，写入复核纸已知缺口，**放行后**再排。禁止把复述三句加入拒收表。  
7. **合入后必跑：** 黄金脚本英文 60 句（v1.1）+ 安全回归。任一类安全句被跳转或危机被当闲聊 → 立即关开关，不受「体验刀」挡。

**一句话：** 目录词和用户字用同一套空格/连字符/单复数归一；跳转句念出来并加「我在听」；危机仍不念。

---

## 二、做 / 不做

**做：**

- 抽出共用归一（实现可新建小模块，Help Center 问卡检索与 Confide 对象闸**共用**；T22 现有 `HELP_CENTER_ASK_TOKEN_ALIASES` 的 backup 特例应收进通用规则，不得再单开词表）。  
- `hasConfideCatalogNounObject`（及任何字面比目录 keyword 的对象闸）在比之前先归一双方。  
- `shouldSpeakConfideReply('help_center_redirect') === true`。  
- locale `CONFIDE_HELP_CENTER_ASK_REDIRECT` 换成 §1.5 英文及对应中日句。黄金脚本「不得出现 / 须含」子串仍认 `I keep how-to answers` 即可，不必改 60 句原话。

**不做：**

- 不改安全路由、不改 TTS 危机静音。  
- 不扩 how-to 话题黑名单（Zen practice 仍可能跳转）。  
- 不加 echo 拒收原句。  
- 不改 1.7B、不改 embedding 阈值。  
- 不关 T22 单。

---

## 三、变体矩阵（A10）

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| Electron 宽屏 · 对象归一 | 倾诉；向量就绪；问卡可点 | `Where can I click to back up the data?` 及生成变体 → `data-source=help_center_redirect`，**禁止**「不知点哪」类 generate | 本刀补：由目录名词生成空格/连字符/单复数变体，批量断言对象闸为真；手测一句即可，关单不靠手测一句 |
| Electron 宽屏 · 跳转朗读 | 同上；系统 TTS 可用 | 跳转句出字后 0–1s 内 Joelle 开念 | `systemTtsBridge.test.js` 锁 `help_center_redirect` 为 true；人工听一句 |
| Electron 宽屏 · 危机仍静音 | 明确求死 / 打人 | 文字转介或攻击桶；**无朗读** | 现网 `shouldSpeakConfideReply` 仍 false；安全回归 |
| Web / 窄屏 | 无桌面 TTS 桥 | 跳转句可显示（若 Help Center 可点）；**无朗读**；窄屏问卡仍无麦 | 现网 TTS / `canShowVoiceInputChrome` 门闩，本刀不改窄屏 |
| 英界面 | locale `en` | §1.5 英文三句 | locale 切片单测 / 现网 redirect 测 |
| 中 / 日界面 | locale `zh` / `ja` | 同口径：怎么用去帮助中心 + 我在听 | 切片三语键；不声称日语听写 |
| 情绪 / 个人事实 / 危机 | 黄金脚本负例 | **0** 次跳转 | 黄金脚本 v1.1；`gs-h01`–`gs-h11` |
| 已购 / 付款 | 跳转 | 不打开 Support / Stripe | 不改付款路径 |

---

## 四、点击反馈（0–1 秒）（A14）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化三态 |
|---|---|---|
| 倾诉发送（高置信度产品问，对象归一后命中） | 等待指示与现网相同；随后跳转句；宽屏开始朗读 | 不写云端 |
| 倾诉发送（危机 / 攻击） | 现网转介或攻击句；**不**开始朗读 | — |
| Help Center 问卡提交 | 本刀不改问卡点击；检索继续用同一套归一 | — |

设计静默：危机不朗读 = 现网 TTS V1，**不是**本刀新静默。跳转句不再静默。

---

## 五、边缘状态（A14）

| 边缘状态 | 预期 |
|---|---|
| embedding 未就绪 | 对象归一仍生效（字面对象闸不依赖向量）；T22 问卡关键词列卡仍可用 |
| Help Center 问卡 DOM 不在 | T23 现网：不跳转。本刀不放宽 |
| TTS 桥不在 / 窄屏 | 跳转句可见、不念 |
| 目录词已是单数、用户写复数（或相反） | 对象闸为真 |
| 用户写 `back-up` / `back up` | 与目录 `backup` 同等（相邻两词拼接，不是整句去空格） |

---

## 六、落地时怎么判（实现会话照此写，本 PR 不写代码）

1. **归一函数（共用）。** 输入字符串 → 小写（仅拉丁）→ 空白折叠 → 去掉词内连字符使 `back-up`=`backup` → 英文简单复数（词尾 `ies`/`es`/`s` 的保守规则，**禁止**为单个产品词写特例表）。**四个字母及以下的词、以及 `-us`、`-ss` 结尾的词不做复数还原**（保护 `bus` / `yes` / `focus` / `gas`）。CJK 不拆字、不改。  
2. **双方归一后再比。** `keywordMatches` / `hasConfideCatalogNounObject`：haystack 与 needle 都走同一函数。**空格变体只允许「相邻两个词拼起来」去比目录词，禁止把用户整句去空格再 includes**（否则 `his it` 会命中 `sit`）。目录词 `backup`、用户写 `back up` → 相邻两词拼成 `backup`，命中；`his it` 拼出 `hisit` ≠ `sit`，不命中。Help Center `normalizeHelpCenterAskText` 改为调用该函数，删除 backup 专用 alias 数组。  
3. **验收生成变体，不手测一句。** 从 catalog 非问法 keywords 生成：原词、空格切开的复合词（`backup`→`back up`）、加连字符、朴素复数。每条变体 `hasConfideCatalogNounObject === true`。负例用真实脚本：黄金脚本 **英文情绪闲聊 38 句**加 **gs-h01–h11** 里通道不是产品跳转的句子，归一之后跳转次数必须仍是 0。仓库**禁止**只锁 `Where can I click to back up the data?` 这一句当过关。  
4. **TTS。** `SPEAKABLE_CONFIDE_REPLY_ROUTES` 加入 `help_center_redirect`（与 `ConfideToYinUI` 盖在 reply 上的 `data-source` 同名）。`systemTtsBridge.test.js` 的「已好清单」把该 id 从「未识别则静音」改为 true；`safety_*` / `aggression_toward_others` 保持 false。未识别 id 仍静音。  
5. **文案。** 只改 `confide-help-center-ask-redirect.json` 三语。跳转条件（CR-47 操作问法 ∧ 对象、问卡可点）不放宽。  
6. **安全。** 本刀 diff 不得改 `confideSemanticCrisisLayer` / safety-01 / 危机确认。PR 描述写「不涉及安全通道」。

---

## 七、冲突扫描（对照 `SCENARIO_TESTS.md`）

- **场景 AE · T23 跳转：** 与「高置信度才跳」无冲突；本刀只让对象闸认写法变体，不把动机句收进跳转。  
- **TTS V1：** 原「危机以外都念」漏登记了 `help_center_redirect`（未识别 id 静音）。本刀补登记，**不**把危机拉进白名单。与「危机句仍只显示文字」无冲突。  
- **黄金脚本 v1.1：** 负例不得被跳转；实现后必须重跑。  
- **T22 问卡：** 共用归一后，问卡检索应变好或不变，不得执行办理。

**结论：** 无第二项待决。Zen 过跳、复述、徽章不在本刀，已写入复核纸。

## 八、共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。不涉及后台网络。

---

## 九、验收

英文第一优先。

**自动化（实现 PR）：**

- 目录名词变体批量：对象闸全绿。  
- `Where can I click to back up the data?` 在问卡可点桩下走 `help_center_redirect`（回归，不是唯一过关句）。  
- `shouldSpeakConfideReply('help_center_redirect') === true`；危机三路由 false。  
- locale 英文含 `I'm here to listen` 与 `I keep how-to answers`。  
- 黄金脚本英文 38 句情绪闲聊 + gs-h01–h11 非跳转行：跳转次数 0。  
- `npm run test:smoke`。  
- 合入后：**10/24** 重跑黄金脚本英文 60 句 + 安全回归；**10/25–26** 英文手测。

**人工（Mac Electron 宽屏）：** 听一句跳转句被念出；听一句危机句仍静音。不问卡执行备份。

**关单不得：** 用「测了 backup 一句」代替变体批量。

---

## 十、口令与回滚

- 开工：「按这份 Brief 开工」（新 Chat · 实现旁支）。  
- 回滚：还原归一前的 includes；TTS 白名单去掉 `help_center_redirect`；locale 还原两句版。  
- 本规格 PR 不合运行时。
