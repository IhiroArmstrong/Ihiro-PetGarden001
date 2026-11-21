# Task Brief · 入口信号账本 + 说明信号方向锁落地

> **状态**：**L0 政策 + L4 仲裁已拍 · L1/L3 另开会话 · 勿在本刀改 `src/`**（PO 2026-11-21：四层信号保留；乱在缺总账与拦截；同屏最多 1 个发现性脉冲；**L4 序 = 主路径先于外围**；队列须让位；触屏第一次按控件记）  
> **类**：**B**（同屏单脉冲会改 onboarding 节奏；查询皮肤统一、触屏第一次短提示也会改可见行为）  
> **政策 SSOT**：[`LABEL_HINT_TIP_STANDARDS.md`](../LABEL_HINT_TIP_STANDARDS.md)（方向锁，不是草案）  
> **账本落点**：[`LABEL_HINT_TIP_AUDIT.md`](../LABEL_HINT_TIP_AUDIT.md) 机器块（**不**新开文档）  
> **接线**：[`HINTS_WIRING.md`](../HINTS_WIRING.md)（本 Brief 不重写场景表）  
> **口令**：`大任务 入口信号账本`（只碰 `focus-tiger/docs/` + 约定切片里的 `src` / `scripts`）  
> **依赖**：#1840 普查已合；#1834 孤儿蓝脉冲已合。

---

## 0. 大白话

按钮上的字、悬停小胶囊、绿色小圆点、偶尔冒出的一句气泡——这四层都要。现在乱，是因为没人能回答「这个按钮挂了几种信号」，规则散在几份稿里，代码又各画各的。本 Brief 先把政策锁在一份标准里；然后做一张**一行一个控件**的账本，用检查脚本拦住新的乱点；再删已经没宿主的钢蓝点代码、关掉的栖居蓝脉冲绘制；最后才限制「同一屏只亮一个发现点」，并改掉地球仪/时钟上那种慢一拍的系统悬停。

---

## 1. 切片（顺序强制）

| 切片 | 内容 | 类 | 本 Brief 文档刀 |
|---|---|---|---|
| **L0** | 标准改为方向锁；CENSUS 降为附录；本 Brief；任务片 | A（无运行时） | **本 PR** |
| **L1** | 账本生成器：`docs:check` **只做静态**（registry / 选择器 / class 名）→ `LABEL_HINT_TIP_AUDIT.md` 机器块；**DOM 实扫放 nightly**，禁止拖慢 `docs:check` | A | 否 |
| **L2** | 删 C 族代码；D 族绘制在 nav 关闭期摘除；开闸须走 registry | A（现网 nav 关；删死代码） | 否 |
| **L3** | lint：禁用途类 `.title=`；禁 registry 外彩色脉冲 class；**同时扫 CSS `@keyframes` / `animation` 名含 pulse，走白名单**（只改 class 名不得绕过） | A | 否 |
| **L4** | 同屏最多 1 个发现性脉冲（仲裁 + 让位 + 单测/e2e） | **B** | 否 · **仲裁序与让位已拍；实现另开会话、勿跟 L1/L3 绑一刀** |
| **L5** | 批 2：地球仪、时钟、滑杆原生 `title` → 耳皮肤 | **B** | 否 · 须点头 |
| **L6** | 脉冲与 tip 同句去重扫尾 | **B** | 否 · 须点头 |

**禁止**：L5/L6 先于 L1/L3（迁完会回潮；#1834 已吃过孤儿点）。  
**禁止**：一次性重做成统一组件（动到 Support FAB 等受保护路径的概率大）。  
**禁止**：只迁移不立账本。

---

## 2. 变体矩阵（A10）

L0 无运行时。下表约束 **L4–L6**（点头后的实现刀须逐行勾）。

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| 宽屏 Idle · 未读 hints | `?product=1` 清空 hints | 0–1s 内**至多一枚**发现性脉冲；赢家须是 **How**（`how-shall-we-sit`），**不得**先亮音符或地球 | L4 单测 + `hints-visual-guardrail` 收紧 |
| 宽屏 Idle · How 已静止或 done | 同上且 How 已让位 | 下一赢家 **Rise / idle-after-session**（若在屏），否则按 §8 序继续 | L4 单测 |
| 窄屏 375 Idle | 同上 | 同上；抽屉开着时行内 mint 仍 ≤1 | 窄壳 e2e 锚 |
| ⋯ / 抽屉打开 | 未读 How / 提醒 | 菜单内不得多行同时 mint | `wide-idle-more-menu` |
| Focusing HUD | 未读 HUD hints | **仍无**浮动 mint；悬停金环/条/环出文案 | `focus-hud-hover.spec.js` |
| Home 左球 | — | **仍无** mint | 账本断言 |
| 触屏图标（L5 后） | 第一次点地球；时钟与 ♪ 从未点过 | 地球：**执行 + ~1.2s 短提示**；时钟 / ♪ **各自仍有**自己的第一次（禁止全站一次后全部不再出） | 单测门闩 + 人工 |
| 触屏已有 Label 的菜单行 | — | 不出 tip | 账本 `touch=label-enough` |
| en / zh / ja | 查询文案 | 仍走 locale；本 Brief 不改句子内容（L5 只换载体） | slice 既有 |
| Electron vs Web | — | 无分叉 | — |
| Support / 付款 CTA | — | **不改** | `test:payment-contract` 若动共享层 |

---

## 3. 点击反馈（0–1 秒）（A14）

L0：`本次无可点击交互改动，点击反馈节跳过。`（仅文档）

L4–L6 实现刀须填：

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化 |
|---|---|---|
| 带发现性脉冲的图标 | 动作发生（面板/扇形/设置）；脉冲按 tier 弱化或移除 | hints-seen 仅在既有 ack 规则下写 |
| 触屏第一次点图标（L5） | 动作发生 **且** 短提示可见 | **按 `controlId` 各记一次**，写入既有 `OnboardingHintsStore`（或同 store 旁路键）；禁止全站一个布尔；失败不得挡第二次执行 |
| `?` | 仍只出产品简介（purpose only） | — |

设计静默：冷却中的 mint 不再出现 = 已读，挂既有 hints store，不新造 `SB-xx`。

---

## 4. 边缘状态

| 边缘状态 | 预期（含 0–1 秒反馈） |
|---|---|
| 全部 click hint `done` | 屏上 **0** 枚发现性脉冲；查询 tip 仍可用 |
| 赢家未点、已静止（§8 冷落） | 0–1s 内亮**下一**优先者；查询 tip 仍可用；静止 ≠ done |
| 栖居导航总闸关（现网） | **0** 枚 D 族蓝脉冲；L2 后源码不再绘制 |
| 叠层 / Journey 开 | 底栏 chrome suppress 仍有效；不得脉冲穿透点击 |
| 不可逆入口 | 仍须单独 Brief；本默认「点了就做」不适用 |
| 窄屏 park | remap 后仍 ≤1 脉冲 |
| 已购 / 付款 | 不触及 |

---

## 5. 共用机制核对

- **overlayBusy**：不改第一幕 occupancy；额头一次性句仍不进 mint 池。  
- **HUD 呼吸**：L4 不给 HUD 加脉冲。  
- **z≥17 遮罩**：不改 dim / Support 26。  
- **新建可点击叠层**：无。  
- **受保护路径**：Support FAB / 三卡 / 请茶 / 结账 URL **不进**账本生成器的「可加脉冲」名单；lint 不得误伤 `#yin-support-fab`。倾听耳皮肤收编不得改 Support 模态 z。

---

## 6. 冲突扫描

相邻：场景 Hint 脉冲悬停、倾听耳查询、Focus HUD 宿主悬停、栖居导航、冷启动额头句。  
**强度**：同屏 1 脉冲 **轻于** 现网多点齐亮；主路径先亮 **轻于**「外围入口先占唯一脉冲」。不重于 Recover / Confide。  
**语气**：查询句仍是用途，不是监工。  
**职责**：发现（registry）与查询（耳皮肤）分层；CENSUS 不再当政策。`HINTS_WIRING` 簇字母仍是**场景分组**，**不是** L4 脉冲序。  
无冲突疑点。

---

## 7. 已好清单（L4 开工前必须守住）

1. `?` 仍 purpose only，不铺开其它 tip。  
2. Home 左球、Focus HUD 三条 **无**浮动 mint。  
3. ⋯ 开时禁止浮动 badge + 行内 dot 双重（现网 2026-08-02）。  
4. 菜单逃生舱：`⋯` / grabber 不因本刀 hide。  
5. 倾听耳查询句仍在；不改成原生 `title`。

---

## 8. L4 仲裁 + 队列让位（PO 2026-11-21 拍板）

实现时写入接线旁**单一数组**，不另开政策文档。`HINTS_WIRING` 簇 A/B/C **不是**本序。

### 8.1 谁赢（主路径先于外围）

在屏、未 `done`、未 **静止**、`triggerMode: click`、且政策允许画 mint 的 hint 中，取下列**最先**一条：

1. `how-shall-we-sit`
2. `rise-button` / `idle-after-session`（互斥表面，同一槽）
3. `ambient-soundscape`
4. `in-app-reminder`
5. `weekly-heatmap`
6. `language-preference`
7. `help-affordance`

`quick-start` 与 `focus-hud-*` **不参与**（禁止 mint）。  
禁止在 UI 里再写一套序。

### 8.2 队列怎么往下走（禁止永远卡住）

「同屏最多 1 个」只回答谁赢，必须同时让位，否则第一名一直不点则后面永远不亮。

| 让位 | 条件 | 写盘 | 下一帧 |
|---|---|---|---|
| **完成让位** | 既有 ack：点宿主完成相关动作 → 该 id `done` | 既有 hints store | 按 §8.1 取下一合格者 |
| **冷落让位** | 同一赢家已在 Idle **连续 3 次进入**（冷启动或回 Idle）为可见脉冲，且宿主**未被点** | 该 id 标 **静止 `resting`**（同 store，**不是** `done`） | 按 §8.1 取下一合格者 |

静止后：该 id **不再赢仲裁**（直到用户重置 hints，或该 id 后来被 `done`）。查询 tip 仍可用。  
**禁止**用全站冷却把整队一起关掉。  
**禁止**赢家未完成且未满 3 次冷落时卡住整队。

### 8.3 触屏「第一次」粒度（L5，政策现在锁）

按 **`controlId` 各记一次**，键进既有 `OnboardingHintsStore`（例 `touchFirstToast:<controlId>`）。  
点过地球仪 **不得**取消时钟 / ♪ 的第一次短提示。  
禁止全站一个「已经提示过触屏」布尔。

---

## 9. 验收

**L0（本 PR）**

1. `LABEL_HINT_TIP_STANDARDS.md` 文首为方向锁，不再写「草案 · 待拍板」。  
2. `RULES_INDEX` 不以 CENSUS 为独立主题；政策指向 STANDARDS。  
3. `npm run docs:check` 绿。

**L1 / L3（另开会话 · 不带 L4）**

1. `docs:check` 静态账本绿；未登记脉冲 class → 红。  
2. `docs:check` **不起浏览器**、不做 DOM 实扫。  
3. L3：改 class 名仍须被 `@keyframes` / `animation` 白名单闸拦住。  
4. DOM 实扫只在 nightly（或等价非 PR 热路径）。

**L4 以后（另 PR · 勿与 L1 绑刀）**

1. 空表 C 族模块删除；D 绘制在关闸时不存在（L2 可与 L1 同会话但须独立 PR）。  
2. 清空 hints 的 Idle：可见发现性脉冲 **≤ 1** 且赢家是 How。  
3. How 冷落 3 次 Idle 后，下一合格者亮。  
4. `test:smoke` 绿；相关 e2e 按切片补。

---

## 10. 不做

- 新开 `RULES_INDEX` 主题或第四份普查。  
- 重开栖居导航功能（`HOME_SANCTUARY_NAV_ENABLED` 仍 false，除非另拍板）。  
- 改 Support / 结账 / Confide 路由。  
- 恢复 auto-tip 喷洒。  
- 把 L4 运行时绑进 L1/L3 PR。  
- 让 `docs:check` 起浏览器做 DOM 扫描。
