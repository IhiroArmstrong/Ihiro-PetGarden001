# Task Brief · 共修稳定偏好 L1 + L2（记住 · 说出 · 可纠正）

> **状态**：**已点头**（2026-11-01 PO 书面「按三条勘误点头」）。点头后实现走 **T73** 新 worktree，本 docs PR 不写 `src/`。  
> **地面真相**：[`co-practice-stable-prefs-inventory.md`](../co-practice-stable-prefs-inventory.md)。  
> **类**：**B 类**（用户可见：预选、L2 事实句、续练位、纠正/忘掉）。过 **T55** **C-01 / C-08 / C-09 / C-11**；L2 句须过 **`npm run check:companion-contract`**。  
> **从属**：[`CO_PRACTICE_POSITIONING.md`](../CO_PRACTICE_POSITIONING.md) · **T58**（不重做变安静数字）· **T59** · **T63** 契约面 · **T67** 接合账 · **T68** 曝光夹具（验收挂钩，不改已锁档位）。  
> **实现拆分**：**T73** PR-1 → **T74** PR-2 → **T75** PR-3（见 §12）。**T60** 补强 [#1525](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1525) **已合** `origin/develop`（`de3f6403`，merge 2026-11-01）。

---

## 0. 大白话

Yin 要记住的不该是「你在时长条上点过一圈」，而是「你真的开始练了、且常做哪一种」。系统可以预选默认，但你**手动改**才算投票；顺着默认开练只表示「还在用」，不能把次数刷满。说出来的话只描述配置（多少分钟、哪种坐法），**不说晚间、不说懂你**；你说「不是这样」或「忘掉」，该清的学来的都清，你自己设的提醒和上次分钟留着。

---

## 1. 目标

### 1.1 L1（稳定偏好层）

1. 新键 **`focus-tiger.stable-prefs.v1`**（名称实现时可微调，须进 T60 白名单 + 本地 backup v6+；**不进** T54）。  
2. **维度 v1 四件套**（实现分 PR，规则一次锁死）：  
   - Focus 计时分钟（10 / 15 / 25 / 45 / open-ended 按 Brief 枚举）  
   - Breath 计时分钟（**T75** 新轨，与 Focus 分计数）  
   - Companion 模式（三选一 ID）  
   - **练习配置签名**（官方模板 id + 关键 recipe 字段 hash；供 **T74** 续练位，**不**存页面 id）  
3. **晋升规则（滚动 3/5，不是连续三次）**：只统计 **投票场**（§1.3）。最近 **5 场投票**里同一选择 **≥3** → 该维度晋升 **stable**。`25, 15, 25, 25` 可以晋升 25；禁止实现成「必须连续 3 场同档」。  
4. **展示粘性**：已晋升的 stable 一直用到：(a) 另一选择也达到 3/5；(b) 「不是这样」；(c) **14 天未开表**（含接受默认开练刷新 `lastUsedAt`）。衰减后回退「仅上次 pref」。  
5. **读口**：开表前预选、L2 文案、续练位目标、T67 `offeredDefaultMinutes` **须同一 resolver**（PR-1 至少收 Focus + stable；PR-2/3 扩展维度）。

### 1.2 L2（事实句 + 可纠正）

1. **仅当**某维度已有 stable 值时，在 **T63 契约面允许的位置**（成长旅程详情 / 小本子邻域 / 续练位旁，PR 分刀具体 DOM）展示 **一句**观察式事实 + **「不是这样」**（必要时 **「忘掉」** 仍走小本子已有入口，范围见 §1.4）。  
2. 模板 **只写配置**，禁止时段词、禁止性格、禁止「懂你 / 有效 / 成功分」。  
3. **「不是这样」**：清空该维度 stable + **投票窗**；**14 天 suppress**（该维度不得再晋升 stable、不得再出 L2 句）；14 天后须重新 ≥3/5。  
4. **T63 契约面**：新增一行或扩展现有行——说明「常做配置」来自本机计数、可关适应总开关、可「不是这样」/ 忘掉（不新增独立 localStorage 键）。

### 1.3 计数与投票（PO 硬锁 · 2026-11-01 勘误）

**计票事件 = 亲手改选之后开表**，不是点 chip。浏览一圈不计。顺着预选开练不算一票。

| 事件 | 记入 3/5 投票窗？ | 写 lastUsedAt？ | 写 focus-duration-pref？ |
|---|---|---|---|
| **亲手改选（chip / 模式）之后开表** | **是（+1 票）** | 开表时 | 是（这次开练用的档） |
| **未改选、顺着预选开表** | **否** | 开表时 | 否 |
| **只点 chip / 模式、没开表** | **否** | 否 | **解耦**：现网点选仍可写「上次选的分钟」（T59）；**稳定层不计**。PR-1 最小 diff = 不把点选当投票；不强制改浏览写 pref |
| T58 倦时 **短一档默认** 被接受开表 | **否**（不能算投短档票） | 开表时 | 不额外记「更短偏好」 |

禁止把「连续次数 / 改档重置连续」写进实现。投票窗是滚动 5 场，不是连胜。

**开表事件定义**：计时 Focus `beginFocus`（含 timed / open-ended 进入 FOCUSING）；Breath 计时等价入口；**不含** Sit 预览、不含只改配方未开练。

### 1.4 忘掉（扩展现网 `forgetYinAdaptationTuning`）

**清除**：`stable-prefs` 全部或按维度、`yin-adaptation` 适应态、**手动时长锚点**、T57 invite-outcomes、T67 session-duration-offer（与现网忘掉 / clearInvite 对齐）。  
**保留**：`reminder-preference`、`ambient` 用户轨、**`focus-duration-pref`（上次选的分钟）**、用户自设收工 **T61**、T62 同意位（除非 Privacy 全删）。  
**与现网差**：现网忘掉 **不清** 手动锚点——**PR-1 须改**以本 Brief 为准。

---

## 2. 非目标

- 不新增 **feature-affinity**、不记入口点击、不记 Confide 次数。  
- 不重排首页菜单顺序（续练位 **固定槽**）。  
- 不改 T58：3 次拒绝 / 5 次 ignored / 7 天暂停；倦 **相对锚点** 最多短一档、不累计。  
- 不启动 T54 90 天；stable 字段不进研究分享 payload。  
- L3 时段：续练位与 L2 **v1 零时段词**（T62 仍单独 Brief/同意）。  
- 不 reopen **T68** 第 1 档曝光数字；L1 上线后 **复跑** T68 夹具看 C 通过率（§11）。  
- 不做键盘 / 窗口三态。

---

## 3. 续练位（**T74 · PR-2**）

1. **含义**：一键用 stable 的 **练习配置** 开练（分钟 + 同坐方式 / 模板），**不是**「最常打开的页面」。  
2. **文案 v1 示例（en）**：`Continue your usual: 25 min · Here & Now` — **禁止** `evening` / `at night` 等。  
3. **ja / zh**：同结构；zh 若切片为草稿须标注；正式 en/ja 人审。  
4. **无 stable**：不显示续练位或显示中性「开始练习」（不假装懂）。  
5. **叠层**：遵守 **T42** / 玻璃卡仲裁；不挡 Support FAB（`00-protected-paths`）。

---

## 4. 冲突扫描

对照：场景 **T** 时长、**T58** 小本子、**T59**、**T52/T65**、**T61/T62**、**T63**、**T67**、**T68** C 曝光、付款 FAB。

- **强度**：L2 一句 + 轻纠正低于新 FAB；续练位一键 ≤ 现有开表路径点击数。  
- **语气**：事实配置；**C-11** 允许「越来越懂你」仅当 **CO_PRACTICE_POSITIONING §3 对应行已实现**——本 Brief 上线后由治理 PR 改表，不在实现 PR 偷换口径。  
- **职责**：不是 T54 证明；不是 T62 晚间诊断；不是第二套 T58。

---

## 5. 变体矩阵（A10 · 全维度规则）

图例：**PR-1** = T73 · **PR-2** = T74 · **PR-3** = T75 · **—** = 本 Brief 仅锁规则

### 5.1 Focus 分钟 × 状态

| 状态 | 用户操作 | stable / UI | L2 句 | T63 契约面一行 |
|---|---|---|---|---|
| 未达 3 场 | 投票窗里同档 <3 | 无 stable；预选 = T58 高亮 + 上次 pref | 无 | 「常做配置：还没有足够次数」 |
| 达 3/5 | 最近 5 场**投票**里同档 ≥3（不必连续） | stable=该档；预选可升 stable | 见 §5.5 en/ja/zh | 「常做配置：来自最近几次开练；可点不是这样」 |
| 衰减 | stable 存在但 14 天未开表 | stable 清除 | 句消失 | 读 stable 空 |
| 手动改档 | stable=25，用户点 15 并开表 | 25 的 stable 仍在直到衰减/不是这样；**新档开始计票** | 仍可说 25 常做，直到 15 达 3/5 或不是这样 | 如实 |
| 接受默认 | stable 预选 25，用户未点 chip 开表 | **不涨** stable 计数；刷新 lastUsedAt | 不变 | 不变 |
| 不是这样 | 点纠正 | 清 Focus stable + suppress 14d | 句消失 | suppress 期内不显示常做 |
| 忘掉 | 小本子忘掉 | 清 stable + 锚点 + T57/T67；**保留** pref | 全清 | 适应关态如实 |

### 5.2 Breath 分钟 × 状态（**PR-3**）

同 §5.1 结构；维度键独立；**无** T58 短档逻辑。L2 模板：`You often breathe for {n} minutes.` / 对应 ja · zh。

### 5.3 Companion 模式 × 状态（**PR-3**）

同 §5.1；枚举 `stay` / `step-away` / `across-tools`。L2：`You often choose {mode label}.` **不**改三钮排序（仅预选高亮若 PR-3 做）。

### 5.4 续练位 × 状态（**PR-2**）

| 状态 | 预期 |
|---|---|
| 无 stable 配置签名 | **隐藏续练位**（禁止用中性「开始练习」冒充续练） |
| 有 stable | 一键开练；文案 **无时段词** |
| 不是这样 / suppress | **隐藏**，14 天内不展示 |
| 忘掉 | 隐藏 |

### 5.5 Locale × 模板

| locale | L2 Focus 事实句（stable=25） | 续练位 | 契约面补充行 |
|---|---|---|---|
| **en** | `You often practice for 25 minutes.` | `Continue your usual: 25 min · {template}` | `Usual practice settings are counted on this device after you start sessions; you can say “not quite” or turn off adaptation above.` |
| **ja** | （正式句进切片，结构同上） | `いつもの：25分 · {template}` | 同义，禁止「夜/晩」作配置描述 |
| **zh** | `你常做 25 分钟。`（草稿可标 draft） | `继续你常做的：25 分钟 · {模板名}` | 同义；禁止「晚间练习」 |

**禁词（全语言）**：懂你、only Yin、有效、成功分、熬夜、失眠、性格、应该、晚间/early morning（作配置描述）。

### 5.6 T63 契约面（每 PR 交付时核对）

实现 PR 须在详情契约 section 可读一行：**常做配置来自本机开练计数；适应关 / 不是这样 / 忘掉的作用范围**（不新键）。自动化：`co-practice-contract` 单测 + 文案切片键存在。

---

## 6. 点击反馈（0–1 秒 · A14）

| 控件 | 0–1s | 持久化 |
|---|---|---|
| 手动 chip | 现网按下态 | 仅开表成功后才入投票窗；pref 可仍随点选（解耦） |
| 续练位（PR-2） | 进入开表或配置屏；busy 门闩 | 开表计票 |
| 「不是这样」 | 句消失 + toast 可选「好，我先不这么记」 | suppress + 清 stable |
| 忘掉（已有） | 小本子句清空 | §1.4 |
| Support / 付款 | **不变** | — |

---

## 7. 边缘状态

- suppress 期内手动达 3/5：**仍不得**晋升（单测锁）。  
- 适应总开关关：stable **仍可写**（事实层），但 L2 / 预选 **不展示**（与 T58 关一致）。  
- 删除所有数据：走 `clearAllFocusTigerUserData()`（#1525 已合）；stable 空。  
- PR-1 与 T59：有 stable 时 T59 句 **优先说常做档**（PO 2026-11-01 盘点建议；若点头改口「永远说上次」须在回复写明）。

---

## 8. 共用机制核对

- **overlayBusy**：续练位（PR-2）不得与 FOCUSING 冲突；开练走现网门闩。  
- **z≥17**：续练位不得新建遮罩盖住 `#yin-support-fab`。  
- 结论：**PR-1 无新叠层**；PR-2 须写一句「续练位附在已有 Idle/Sit 面，不新增 z≥17 遮罩」。

---

## 9. 验收（点头后 · 分 PR）

### T73 PR-1

- 单测：计票矩阵 §1.3 全覆盖；suppress 14d；忘掉清 anchor 不清 pref；未开表不涨票。  
- 改 chip 浏览行为单测（与现网 diff 说明）。  
- `npm run check:companion-contract` L2 句绿。  
- e2e：一条开表 stable 晋升（可选 smoke 标签 `co-practice-stable`）。

### T74 PR-2

- 续练位可见 / 无 stable 隐藏；无时段词字面扫描。  
- payment-contract 若动共享层须跑（Brief 预期 **不**动付款）。

### T75 PR-3

- Breath + Companion 维度单测同结构。

### T68 挂钩（**不重开档位**）

- **T73 合 develop 后**：复跑 **T68 Brief** 曝光夹具（C 通过率）；若相对点头基线 **显著升高**，PO 决定是否微调 T68 C 文案/阈值——**不在本 Brief 改 T68 第 1 档数字**。

---

## 10. 点头后禁止顺手

T62 新句、菜单重排、feature-affinity、到达 Notice 预选、T54 字段、Confide 读 stable。

---

## 11. PO 已锁决策（2026-11-01）

1. 盘点落盘 + 本 Brief + 术语表 **同一 docs PR**。  
2. PR 顺序：**#1525 T60 已合** → 本 docs（Brief 点头）→ **T73 → T74 → T75**。  
3. v1 无 feature-affinity；续练 = 配置续练。  
4. T68：曝光夹具复跑，不重开已锁第 1 档。  
5. **三条勘误（点头条件）**：计票 = 改选后开表；晋升 = 滚动 3/5 非连续；无 stable 时隐藏续练位。

---

## 12. 任务代号与 PR 映射

| 代号 | 名称 | 状态（点头后） | PR |
|---|---|---|---|
| **T73** | 稳定偏好层 · Focus · L2 纠正 | 排队中 · Brief 已点头 | PR-1 |
| **T74** | 续练位 | 排队中 · 依赖 T73 | PR-2 |
| **T75** | Breath · Companion 稳定维度 | 排队中 · 依赖 T73 | PR-3 |

口令「按 L1 Brief 开工」= **T73 新 worktree**；「续练位」= **T74**；「Breath 稳定偏好」= **T75**。

---

## 13. 自动化索引（实现 PR 填）

| 场景 | 建议标签 / 文件 |
|---|---|
| stable 晋升 | `co-practice-stable-focus-promote` |
| 接受默认不涨票 | `co-practice-stable-accept-default` |
| 不是这样 suppress | `co-practice-stable-not-quite` |
| 忘掉清 anchor | `co-practice-forget-clears-anchor` |
| 续练位无时段词 | `co-practice-continue-slot-copy` |
