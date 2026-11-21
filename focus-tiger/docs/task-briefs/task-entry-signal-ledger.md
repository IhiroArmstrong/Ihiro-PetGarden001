# Task Brief · 入口信号账本 + 说明信号方向锁落地

> **状态**：**方向已拍 · Brief 待你点头后改 `src/`**（PO 2026-11-21：四层信号保留；乱在缺总账与拦截；三件事 + 同屏最多 1 个发现性脉冲）  
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
| **L1** | 账本生成器：registry + DOM 扫描 → `LABEL_HINT_TIP_AUDIT.md` 机器块；进 `docs:check` | A | 否 |
| **L2** | 删 C 族代码；D 族绘制在 nav 关闭期摘除；开闸须走 registry | A（现网 nav 关；删死代码） | 否 |
| **L3** | lint：禁用途类 `.title=`；禁 registry 外彩色脉冲 class | A | 否 |
| **L4** | 同屏最多 1 个发现性脉冲（仲裁 + 单测/e2e） | **B** | 否 · **须点头** |
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
| 宽屏 Idle · 未读 hints | `?product=1` 清空 hints | 0–1s 内**至多一枚**发现性脉冲（音符 / 地球 / 时钟 / 热力图 / 菜单行不得同时亮） | L4 单测 + `hints-visual-guardrail` 收紧 |
| 窄屏 375 Idle | 同上 | 同上；抽屉开着时行内 mint 仍 ≤1 | 窄壳 e2e 锚 |
| ⋯ / 抽屉打开 | 未读 How / 提醒 | 菜单内不得多行同时 mint | `wide-idle-more-menu` |
| Focusing HUD | 未读 HUD hints | **仍无**浮动 mint；悬停金环/条/环出文案 | `focus-hud-hover.spec.js` |
| Home 左球 | — | **仍无** mint | 账本断言 |
| 触屏图标（L5 后） | 第一次点地球/时钟/♪ | **执行动作** + ~1.2s 短提示；第二次不再挡 | 单测门闩 + 人工 |
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
| 触屏第一次点图标（L5） | 动作发生 **且** 短提示可见 | 第一次标记本地；失败不得挡第二次执行 |
| `?` | 仍只出产品简介（purpose only） | — |

设计静默：冷却中的 mint 不再出现 = 已读，挂既有 hints store，不新造 `SB-xx`。

---

## 4. 边缘状态

| 边缘状态 | 预期（含 0–1 秒反馈） |
|---|---|
| 全部 click hint `done` | 屏上 **0** 枚发现性脉冲；查询 tip 仍可用 |
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
**强度**：同屏 1 脉冲 **轻于** 现网多点齐亮，不重于 Recover / Confide。  
**语气**：查询句仍是用途，不是监工。  
**职责**：发现（registry）与查询（耳皮肤）分层；CENSUS 不再当政策。  
无冲突疑点。

---

## 7. 已好清单（L4 开工前必须守住）

1. `?` 仍 purpose only，不铺开其它 tip。  
2. Home 左球、Focus HUD 三条 **无**浮动 mint。  
3. ⋯ 开时禁止浮动 badge + 行内 dot 双重（现网 2026-08-02）。  
4. 菜单逃生舱：`⋯` / grabber 不因本刀 hide。  
5. 倾听耳查询句仍在；不改成原生 `title`。

---

## 8. L4 仲裁（实现时写入接线，不另开政策文档）

在屏、未 done、`triggerMode: click`、且政策允许画 mint 的 hint 中，取 **HINTS_WIRING 簇序** 最高一条：

`ambient-soundscape` → `language-preference` → `in-app-reminder` → `weekly-heatmap` → `how-shall-we-sit` → `rise-button` / `idle-after-session`（互斥表面）→ `help-affordance`。

`quick-start` 与 `focus-hud-*` **不参与**（禁止 mint）。  
实现可把此序做成 registry 旁的单一数组，禁止在 UI 里再写一套。

---

## 9. 验收

**L0（本 PR）**

1. `LABEL_HINT_TIP_STANDARDS.md` 文首为方向锁，不再写「草案 · 待拍板」。  
2. `RULES_INDEX` 不以 CENSUS 为独立主题；政策指向 STANDARDS。  
3. `npm run docs:check` 绿。

**L1 以后（点头 + 另 PR）**

1. AUDIT 机器块列齐全；未登记脉冲 class → 红。  
2. 空表 C 族模块删除；D 绘制在关闸时不存在。  
3. 清空 hints 的 Idle：DOM 查询发现性脉冲节点 **≤ 1**。  
4. `test:smoke` 绿；相关 e2e 按切片补。

---

## 10. 不做

- 新开 `RULES_INDEX` 主题或第四份普查。  
- 重开栖居导航功能（`HOME_SANCTUARY_NAV_ENABLED` 仍 false，除非另拍板）。  
- 改 Support / 结账 / Confide 路由。  
- 恢复 auto-tip 喷洒。
