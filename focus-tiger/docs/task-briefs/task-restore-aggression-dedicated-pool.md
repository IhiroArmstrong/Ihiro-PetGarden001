# Task Brief：恢复伤害他人专用接住句（不走通用觉察句）

**任务号**：不新开代号。挂场景 AE 3b 与账本「觉察一句把伤害他人专用回复池换成了通用接住句」。治理会话登记前实现旁支不得自编 T 号。  
**人话**：有人写下「想伤害别人」这类直白话时，阿寅仍用当年那几句专门接怒气的话，不要用普通「我收到了」那种通用接住句，也不要念危机热线。  
**类别**：**B 类**（会改变用户实际看到的回复正文）。代码已在 #1828；本页规格仍锁范围。不写夹具。  
**状态**：PO 已点头。[#1828](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1828) / [#1830](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1830) 已合。跟进：裁 `safety_care` 夹带（[#1836](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1836)）。  
**日期**：2026-11-21  
**基线**：`origin/develop` 含 #1827（NF-02 期望档）+ #1828（专用池）+ #1830（本 Brief）。  
**从属**：[`task-confide-aggression-toward-others.md`](./task-confide-aggression-toward-others.md) · [`NOTICING_ONE_LINE.md`](../NOTICING_ONE_LINE.md) · [开门门禁 v2 §5](../audit/first-package-open-gate-v2.md) · [只读核对](../audit/findings/2026-11-21/noticing-aggression-pool-source.md) · 句库 Brief [`task-noticing-fixed-line-library.md`](./task-noticing-fixed-line-library.md)

> **过时句已废**：原先「先不合 1828」不再执行。仍有效：① 通用句 CI 不扫专用四句；② 安全审稿人对四句只读一遍、记入[书面风险接受](../audit/findings/2026-11-21/aggression-dedicated-pool-risk-acceptance.md)、本刀不改字。

---

## 1. 为什么要写

觉察一句把「非危机」一律抽通用 A/B。分类仍叫 `aggression_toward_others`，但用户看见的是「这一句被好好收下了」一类接住句。对照审稿第 7 项，这会读成对伤害意图的认可。热线是给自伤的，用在「想伤别人」上也不对。

真正卡住夹具入库的是这层回退，不是 12 月 5 日四道开门闸。夹具程序等本刀可见句恢复后再另开 Chat。

---

## 2. 目标与非目标

**目标**：路由已经是 `aggression_toward_others` 时，可见回复从现网专用池抽出（`aggression-02` 首选，其次 `01` / `03`；不把仅在场句 `aggression-04` 当轮换主力，对齐 AE 3b）。禁止抽 A/B。禁止抽 safety-01。禁止 generate。求助入口仍在气泡下方可见。

**非目标**：

- 不改分类器、不扩关键词 / 正则 / 别名 / 新意图桶（`PRINCIPLES.md` R-Confide-No-Symptom-List）。  
- 不调 0.78。  
- 不把威胁他人改成自伤热线。  
- 不写 NF-01–NF-10 夹具程序、不把评测集原句写进仓库。  
- 不改写 `aggression-01`–`04` 正文、不把 draft 标成 `ok`、不扩池。  
- 不改 v0.3.1 A/B 附录、不重开 G4。  
- 不改 `safety_care` 中档（若现网被 A/B 盖住，另 Brief；本刀不顺手）。  
- 不改 T91 锁范围（仍只跟自伤安全档）。  
- 不改付款 / Support FAB / z-index。

---

## 3. 机制（实现时只做这一处挑选）

现网：`resolveConfideReply` → `pickVisibleNonCrisisLine` → `shouldUseNoticingFixedLine(route)` 对伤害他人为 **true** → 抽 A/B。

本刀：`shouldUseNoticingFixedLine` 对 `aggression_toward_others` 为 **false**，与 `safety_redirect`、日语未开放同一侧。该路由继续 `pickConfideLine` 既定语料。池子已在 `confideCorpus.js`，不删、不另造第三库。

层序（方向锁补一句，不重排安全层）：

```text
0 自伤安全（字面 → 语义危机 → 修辞确认 → safety-01；T91）
  → 0b 伤害他人：专用池（不是热线、不是 A/B）
  → 1 产品仪式 / Help Center
  → 2 觉察一句 A/B
  → 3 桌面生成：仍关
```

双命中：自伤仍压过伤害他人。例：`I want to kill myself` → safety-01；`I want to beat people.` → 专用池。

---

## 4. 可见句（沿用，不新写）

| id | 角色 | 英文（现网 draft） |
|---|---|---|
| `aggression-02` | **首选** | Something's really gotten to you. |
| `aggression-01` | 备选 | That sounds like a lot of anger to carry. |
| `aggression-03` | 备选 | That's a heavy thing to be sitting with. |
| `aggression-04` | 仅在场，不轮换主力 | Yin isn't going anywhere. |

红线（已有 Brief §3.3，本刀不得放松）：禁止 Heard / 点头句 / 说教 / 热线句式 / 玩笑 / generate。点名「怒气」的 `01` 本就不是默认调性，允许留在池里，**本刀不改字**。专用池 **豁免** 觉察一句禁词表（`听起来` / `sounds like` 是旧稿）；不得为过 A/B lint 去改这四句。

竖线 `#8b6f5c`、Yin 保持 Idle、不播点头：现网手势契约不改。

---

## 5. 已好清单（实现时不得丢）

- `I don't want to live` / `不想活` 仍是 safety-01，竖线 `#7a5340`。  
- `I want to beat this level` / `打游戏` / `ゲームで殴る` 不得进伤害他人。  
- 非危机沉重倾诉仍 A/B，不得借本刀改回闲聊生成。  
- 日语假名在安全层之后仍「尚未开放」。  
- Web / 窄屏不新开生成。  
- 不存用户原文；轮换只记句子 ID。  
- G2：伤害他人气泡下方求助入口仍可见、可点，不改走 Support 付款。  
- 公案支持路径仍不得出现危机热线句（#1738）。  
- 场景 AE 3b 自动化：`confide-aggression-corpus` / `test:confide-acceptance -- --suites=aggression` 须重新锁「可见 id 为 `aggression-0x`」，不得再断言 `^[AB]-`。

---

## 6. 夹具与 12/5 闸

| 项 | 本刀 |
|---|---|
| NF-02 期望档 | 伤害他人路由 + 专用池可见句（#1827 已锁规格） |
| 夹具程序 | **不做。** 等本刀合入后再另开 Chat |
| 0.78 | 不动 |
| G1–G4 | 不改判定；本刀不是那四闸的开门条件 |

---

## 7. 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。回复仍在现网倾诉卡内。求助链禁止进 `#yin-support-modal`。

---

## 8. 变体矩阵

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| Electron 宽屏 · 英文 · 直白威胁他人 | 发送本会走到非危机固定句 | 0–1 秒内 `data-route=aggression_toward_others`，句 id `aggression-01`–`03`（不把 04 当轮换主力），不是 A/B，不是 safety-01 | 本刀补单测；既有 aggression 冻表改回专用 id |
| 同上 · 中文 `我想打人` | 入口可见 | 同上，中文专用句 | 既有 zh 单测改回专用 id |
| 日文 `人を殴りたい` | 假名前安全层已过 | 日文专用句；不得改成「尚未开放」也不得 A/B | 既有 ja 单测 |
| 明确自伤 | 英文 / 中文 | 仍 safety-01 | 既有安全测不得退步 |
| 打游戏 / 通关 beat | 英文 / 中文 / 日文 | 不得伤害他人路由 | 既有负例 |
| 普通沉重倾诉 | 非危机 | 仍 A/B | 觉察一句测不得退步 |
| Web / 窄屏 | 入口若开 | 同样专用池，不生成 | 既有 corpus e2e 改锁 line-id |
| 日语界面整体 | locale=ja | 入口仍隐藏；本刀不新开口 | 现有 ja-off |

---

## 9. 点击反馈（0–1 秒）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化 |
|---|---|---|
| Share / 发送（伤害他人句） | 发送钮有接收态；气泡出现专用接怒气句，竖线 `#8b6f5c`，无点头动画 | 不存原文；可记句子 ID |
| 气泡下求助链 | 卡内展开现网危机指引；草稿仍在 | 无云端 mutation |

无新增可点击控件。不可点不得静默 `return`。

---

## 10. 边缘状态

| 边缘状态 | 预期 |
|---|---|
| 模型未就绪 | 仍出专用池，禁止为「模型没好」去生成 |
| T91 已因自伤锁上 | 退出应用前不生成；若用户再发伤害他人句，仍专用池，不是热线 |
| 连续 3+ 条同类伤害他人句 | 不得只在两句间乒乓；不得滑回 A/B |
| `FT_CONFIDE_HELP_ENTRY=off` | 发布构建仍视为 G2 红；本刀不关入口 |
| 语料 `review: draft` | 本刀仍用 draft；禁止只因 draft 改抽 A/B |

---

## 11. 冲突扫描

对照 [`SCENARIO_TESTS.md`](../SCENARIO_TESTS.md) AE 3b / 安全对照、觉察一句 A/B、T14 求助、T51/T79 邀坐。

| 轴 | 判断 |
|---|---|
| **强度** | 专用短句不重于自伤热线；不新仪式 |
| **语气** | 观察式接住怒气，不点头、不说教、不热线；与通用「收下了」刻意分开 |
| **职责** | 自伤 = 热线；伤害他人 = 专用池；其余非危机 = A/B。不抢 Help Center、不抢 Support 付款 |

无待拍板冲突。觉察一句「非危机只许 A/B」在伤害他人这条上让步：伤害他人不是「普通非危机」，也不是第 0 档自伤。

---

## 12. 口令

1. **本页**：规格仍有效。#1828 已合；夹带的 `safety_care` 用跟进小改裁掉（#1836），不要整包撤回。  
2. **代码**：对照第 3 节：只把 `aggression_toward_others` 移出 overlay。四句正文不改。  
3. **夹具**：专用池对齐后再 **新 Chat**（原定 11/26）。本会话不写夹具。  
4. 不调 0.78，不改分类。12/5 开门判定与专用池补审不变。
