# Task Brief：觉察一句 · 固定句库（A 接住 / B 邀你坐一会儿）

**任务号**：不新开代号。挂开门闸 G2–G4 与 T100 关单第 1 项。治理会话登记前实现旁支不得自编 T 号。  
**人话**：用户写下不是危机的那一句，只用已经审过的固定句接住，或可选地邀请坐一会儿。句子本身必须在「其实是危机」时也安全。求助按钮做在每条回复下面，不写进句子里。  
**类别**：B 类（用户看见的回复文案）。本 PR **只锁 Brief + 草稿附录**，不改 `src/`、不把草稿当已定稿。  
**状态**：PO 2026-11-19 点头写文档。附录 **v0.3**（A/B 各 20）。**PO 语气审**：同日书面「该审核的已审」。**独立安全审**：2026-11-19 另一会话书面通过（见 [G4 安全审](../audit/findings/2026-11-19/noticing-fixed-line-library-g4-security-review.md)）；G4 **两份齐**。G1–G3 仍各看各自闸。审稿退回宁可少而稳，不为凑 15 条放宽禁词。  
**日期**：2026-11-19  
**从属**：[`NOTICING_ONE_LINE.md`](../NOTICING_ONE_LINE.md) · [开门门禁 v2](../audit/first-package-open-gate-v2.md) · [结构 Brief](./task-noticing-no-generate-invariant.md) · [`COMPANION_CONTRACT.md`](../COMPANION_CONTRACT.md)

---

## 1. 目标与非目标

**目标**：

- 非危机回复只许两类：A 接住、B 邀你坐一会儿。  
- 每一句在用户其实处于危机时也安全：不淡化、不给建议、不附和。A/B 路由错了没有安全代价，因此第一版 **不** 把「接住 vs 邀你坐」的分离试验当开门条件。  
- 求助入口不写进句子；统一为每条回复下方的固定行。复用 T14 现网 `[data-testid=confide-to-yin-help-resources]`，标签与现有 UI 一致，不写号码，不改走 Support 付款。  
- 同一会话不重复同一句；轮换只记句子 ID，不存用户原文。

**非目标**：

- 不做轻松档 / 第 2 档闲聊。  
- 不定稿危机转介句（第 0 档沿用现网 safety-01）。  
- 不自动开练习。B 类只是话，不是 Sit 按钮。  
- 不开放日语。  
- 不把附录当成已过 G4（缺独立安全审则不得接线）。  
- 情绪选项按钮（累、焦虑、难过、生气）推迟。

---

## 2. 硬规则（实现与 lint 共用）

1. 每一句在「用户其实处于危机」时必须安全。  
2. 求助入口不进句子正文。  
3. A 类：单纯接住，不含邀请、不含建议。中文不得含「坐」。英文不得含整词 `sit` / `sitting`。  
4. B 类：先接住，再以可选口气邀请；必须明说可以不坐；不自动开练习。中文必须含「不坐 / 不想 / 不愿意 / 不接受 / 不用做 / 可以不」之一。  
5. 不点名情绪（不写「你好像……」「听起来你……」），不暗示 Yin 在评估。  
6. 不诊断、不说教、不承诺好转、不说「只有我懂你」、不承诺「一直陪」（C-01、C-05、C-07、C-08）。  
7. 轮换只记句子 ID。  
8. 每句中文不超过 40 字，英文不超过 25 词；每句最多一个邀请。  
9. 新文案进 `src/locales/slices/`（en / zh / ja 同片；日语界面仍隐藏，切片可留占位，不得当开放）。禁止改 `en.json` / `zh.json` / `ja.json`。

---

## 3. 禁词（lint；命中即失败）

中文按子串匹配：

`休息`、`歇`、`放下`、`解脱`、`不用再撑`、`辛苦了`、`尽力了`、`没关系`、`会好的`、`别想太多`、`一直陪`、`只有我`、`你好像`、`听起来`、`其实你`

英文按 **整词** 匹配（避免 `received` 误伤）：

`rest`、`relax`、`let go`、`release`、`relief`、`peace`、`you did your best`、`it's okay`、`it'll be fine`、`get better`、`don't overthink`、`always be here`、`only I`、`you seem`、`sounds like`

其它结构：

- ID 唯一；定稿目标每类至少 15 条；中英条数一致。审稿退回后允许暂时少于 15，**禁止**为凑数放宽本表。  
- 句库文件不含号码、网址、用户原文。  
- 过现有 T100 输出闸 600 条违规样本 + 20 条放行样本（开门 G3）。闸对固定句跑，不是对模型输出跑。

---

## 4. 求助入口可见（开门 G2）

二值 e2e；失败 = 12/5 **G2 红**（记残余，不藏入口，见开门门禁 v2）：

- 发送后用户气泡一旦出现（A、B、或第 0 档安全句），同一卡片内 `[data-testid=confide-to-yin-help-resources]` **可见、可点**。  
- 点链 0–1 秒内展开现网 crisis 指引面板；草稿仍在；禁止改走 `#yin-support-modal`。  
- `FT_CONFIDE_HELP_ENTRY=off` 仍可关（开发），发布构建默认开。默认关则 G2 红。

---

## 5. 审稿（开门 G4）

两份独立审稿共用清单，逐句答是/否，任一「是」即退回：

1. 在危机时是否淡化、附和或给建议？  
2. 是否诊断、说教、承诺好转？  
3. 是否带有委婉死亡或告别的词感？  
4. 是否点名情绪标签或暗示在评估用户？  
5. 是否有陪伴承诺或排他性（「一直」「只有我」）？  
6. B 类：是否缺少「不坐也可以」？

通过：两份均全部通过；审稿期间句库不改动。起草人、语气审、安全审分离。英文建议另请英语母语者审语气（不挡 12/5 的 G4 最低线：PO 语气 + 独立安全审）。重点看 **B-19** 英文 *you can also choose not to*。

**2026-11-19 审稿进度**

| 份 | 状态 |
|---|---|
| 语气（PO） | 已书面完成（含 v0.3 本批） |
| 安全（另一会话） | **已完成**（2026-11-19；[G4 安全审](../audit/findings/2026-11-19/noticing-fixed-line-library-g4-security-review.md)）。附录 v0.3 审稿期间未改 |

建议以本附录 v0.3 为冻结候选（目标不晚于 11/26）。本会话收到安全审退回之前 **不再改附录**。安全审应覆盖新增 A-16–A-20、改写 B-09/B-10、新增 B-16–B-20；其余沿用已审原文。B-16「也没有任何问题」/ *perfectly fine* 贴近淡化，请安全审点名。

仓内 5–10 条自编漏接型夹具：只验落到哪类回复、求助入口在不在。不用评测集原句，不算识别率。

---

## 6. v0.3 草稿附录（A/B 各 20；PO 语气已审，独立安全审已过）

相对 v0.2：B-09、B-10 改写以过 lint；新增 A-16–A-20、B-16–B-20。实现不得在 G4 两份审稿都通过前把这些句子接进用户气泡。

分析师人工核对（10 条新句 + 2 条改写）：未命中禁词；A 类中文无「坐」、英文无 sit/sitting；B 类均含可选表达。**以日后 CI lint 实跑为准。** 本附录不再列 B-09/B-10 为已知失败。

### A.1 硬规则

（与第 2 节相同。）

### A.2 A 类 · 接住（20 条）

| ID | 中文 | English |
|---|---|---|
| A-01 | 这一句，我收到了。 | I received this one. |
| A-02 | 谢谢你把它写下来。 | Thank you for writing it down. |
| A-03 | 它在这里了。不用急着整理它。 | It's here now. There's no rush to sort it out. |
| A-04 | 我看到这一句了。它被写出来了。 | I see this line. It has been put into words. |
| A-05 | 不用解释，也不用证明什么。这一句我接着。 | You don't have to explain or prove anything. I'm holding this line. |
| A-06 | 你写的，我没有跳过去。 | I didn't skip past what you wrote. |
| A-07 | 这句话有分量。谢谢你让我知道。 | This line has weight. Thank you for letting me know. |
| A-08 | 能把它写出来，就是在看着它了。 | Putting it into words is a way of looking at it. |
| A-09 | 这一句，被听见了。 | This line has been heard. |
| A-10 | 谢谢你写下这一句。我读到了。 | Thank you for writing this line. I read it. |
| A-11 | 这一句不需要答案。它被收到了。 | This line doesn't need an answer. It has been received. |
| A-12 | 我读完了这一句，认真读的。 | I finished reading this line. I read it carefully. |
| A-13 | 你不用把它说得更清楚。我在听。 | You don't have to make it any clearer. I'm listening. |
| A-14 | 这一句来到这里了，我收下了。 | This line has arrived here, and I've taken it in. |
| A-15 | 它不需要被评判。我只是收下它。 | It doesn't need to be judged. I'm simply taking it in. |
| A-16 | 这一句，我读了。它在这里。 | I read this line. It's here. |
| A-17 | 谢谢你愿意把它写在这里。 | Thank you for being willing to put it here. |
| A-18 | 我看到了你写下的这一句。 | I see the line you wrote down. |
| A-19 | 这一句没有被忽略。它被好好收下了。 | This line wasn't overlooked. It has been received with care. |
| A-20 | 我停下来，读了这一句。 | I paused and read this line. |

### A.3 B 类 · 邀你坐一会儿（20 条）

| ID | 中文 | English |
|---|---|---|
| B-01 | 这一句我收到了。你愿意的话，可以坐一会儿；不坐也可以。 | I've got this line. If you'd like, you can sit for a moment, or not. |
| B-02 | 谢谢你写下它。要不要坐一会儿，由你决定，不坐也可以。 | Thank you for writing it down. Whether to sit for a while is up to you, and not sitting is fine. |
| B-03 | 这一句不用马上有答案。想坐的话，我们可以坐一小会儿；不想坐，也完全可以。 | This doesn't need an answer right away. If you'd like, we can sit for a little while; if not, that's fine too. |
| B-04 | 它被听见了。坐一会儿也好，不坐也好，都可以。 | It's been heard. Sitting a while or not, either is fine. |
| B-05 | 我看到这一句了。愿意的话，我们一起坐一小会儿；不愿意，就不坐。 | I see this line. If you're willing, we can sit for a little while; if not, we won't. |
| B-06 | 谢谢你说出来。想坐就坐，不想也不用勉强。 | Thank you for saying it. Sit if you like; no need to force it. |
| B-07 | 我读到这一句了。想的话，可以安静坐一小会儿；不想，这里不要求你做什么。 | I read this line. If you want, you can sit quietly for a little while; if not, nothing is asked of you here. |
| B-08 | 这一句我收下了。想坐一坐，随时可以；不坐，也不影响什么。 | I've taken this line in. If you'd like to sit, you can at any time; if not, nothing changes. |
| B-09 | 谢谢你写下它。坐一小会儿是个选择；不想坐，也完全可以。 | Thank you for writing it down. Sitting for a little while is a choice; if you'd rather not, that's fine. |
| B-10 | 我听到了。你可以坐一会儿，也可以不坐，两种都可以。 | I heard it. You can sit for a while, or not; either is fine. |
| B-11 | 这一句，被好好读过了。想坐一会儿的话，坐坐也行；不想，就停在这里。 | This line has been read with care. If you'd like to sit, you can; if not, we'll stop here. |
| B-12 | 不用解释它。想坐一小会儿的话可以；不想，也完全可以。 | No need to explain it. If you'd like to sit for a little while, you can; if not, that's fine too. |
| B-13 | 这一句有分量，我收到了。坐一会儿是个邀请，你可以不接受。 | This line has weight, and I've received it. Sitting for a while is an invitation you can decline. |
| B-14 | 谢谢你让我知道。愿意的话，可以坐一小会儿；不愿意，什么都不用做。 | Thank you for letting me know. If you're willing, you can sit for a little while; if not, you don't have to do anything. |
| B-15 | 我看见你写下的这一句了。坐一坐也行，不坐也行，由你决定。 | I see the line you wrote. Sitting or not is fine; it's up to you. |
| B-16 | 这一句我读到了。想坐一小会儿的话可以；不想，也没有任何问题。 | I read this line. If you'd like to sit for a little while, you can; if not, that's perfectly fine. |
| B-17 | 谢谢你写下它。我们可以坐一小会儿，也可以不坐，由你决定。 | Thank you for writing it down. We can sit for a little while, or not; it's up to you. |
| B-18 | 这一句，我认真读过了。愿意的话可以坐一坐；不愿意，就不用做什么。 | I read this line carefully. If you're willing, you can sit for a bit; if not, you don't need to do anything. |
| B-19 | 它已经被收下了。想坐一会儿，这里可以；也可以不坐。 | It has been taken in. If you want to sit for a while, you can here; you can also choose not to. |
| B-20 | 我看到你写的了。坐一小会儿是个邀请；不接受，也完全可以。 | I see what you wrote. Sitting for a little while is an invitation; declining is perfectly fine. |

---

## 7. 共用机制核对

不新建叠层。回复与求助行都在现网倾诉卡内。`confideOpen` overlayBusy 现网例外不改。不碰 HUD 呼吸。不改 z-index。求助链禁止进 `#yin-support-modal`（受保护付款路径）。

---

## 8. 变体矩阵

| 变体 | 入口 / 前置状态 | 预期 | 自动化 |
|---|---|---|---|
| Electron 宽屏 · 英文 | 非危机发送 | A 或 B 一句 + 下方求助行可见 | G2 e2e + 句库 lint |
| 同上 · 第 0 档 | 安全层命中 | safety-01，不是 A/B；求助行仍可见 | 现有安全测试 + G2 |
| 中文界面 | 若入口可见 | 中文句；日语仍隐藏 | locale 切片测试 |
| 日语界面 | locale=ja | 无入口，本库不露出 | 现有 ja-off |
| 同会话第二条非危机 | 已用过某 ID | 换另一 ID，不重复 | 单测轮换 |
| Web / 窄屏 | 入口若开 | 同样固定句 + 求助行；不生成 | G2 在开入口的视口各一条 |

---

## 9. 点击反馈（0–1 秒）

| 控件 | 0–1 秒内 | 持久化 |
|---|---|---|
| 发送 | 接收态后出现固定句 | 不存原文；可记句子 ID |
| 求助链 | 卡内展开 crisis 指引；草稿仍在 | 无云端 mutation |
| B 类句子 | **只是字**；不得因此自动 Sit | — |

---

## 10. 边缘状态

| 边缘 | 预期 |
|---|---|
| 句库未过审 | 12/5 G4 红 → 记残余，不藏入口 |
| 句库条数审稿后 <15 | 允许，lint 下限可临时降，禁词不放宽 |
| 模型未就绪 | 仍出固定句 |
| T91 已锁 | 可用 A/B 或安全句，不可生成 |
| 帮助入口环境变量 off | 发布构建视为 G2 红 |

---

## 11. 冲突扫描

- **AE**：从聊天降为接住句。语气须观察式，不是教练、不是评估。已拍板。  
- **T51 / T79**：B 类可邀请坐，不自动开练习；公案不写进回复当老师。  
- **T14 / CR-46**：复用常驻求助，不做中档轻句。  
- 陪伴契约字面检查须扫本句库切片。  
- 不与 Support FAB / 付款卡抢层。

无待拍板冲突。

---

## 12. 口令

句库扩写与审稿在仓外继续，**不进实现会话**。B-09/B-10 已改写。接线须 **新 Chat**：「按句库 Brief 开工」，且 G4 两份审稿已通过（PO 语气已过，仍欠独立安全审）。T95 优先。本会话不改 `src/`。 R2L-02 另项，勿拖到包装最后一周。
