# Task Brief · 增长向内容包（决策锁 · ①③ 已合入 · 电子书延后）

> **状态（2026-08-06）**：产品/工程共识已拍板并落档；**① Zen Cinema 已合 `develop`**（PR [#148](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/148)）；**③ Quiet Line 已合 `develop`**（PR [#153](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/153)）；**②A/②B 电子书明确延后**（用户书面：目前非最急，延迟安排——**禁止**当下一优先开工项）。人工验收见 `TEST_TRACKER` Zen Cinema / Quiet Line 行。  
> **触发**：用户「合理则办」——固化分析师与 Cursor 调查对齐后的收紧口径。  
> **性质**：可延后的 **v1.0.0 增发**候选；**不得**挤占壳选型、主路径债、已知叠层问题。  
> **2026-08-07 车道关系**：本包与 Sanctuary **阶段 2「内容生态」为同一批**（见 `task-tech-direction-v1-shell-monetization.md` §四/§六），**禁止**再开一条平行「内容生态」待办。阶段 2 **非近期 sprint**。

## 权威边界（先读）

| 项 | 口径 |
|---|---|
| Settings / Culture Space | **不存在**；勿假设二级分类馆。最接近入口 = Idle 宽屏 `WideIdleMoreMenu` / 窄屏抽屉扁平列表 |
| soft-schedule / CloudConfigClient | **不在** `origin/develop`（仅归档 `29770cc` / `origin/archive/soft-schedule-path-b`）；v1 **禁止**「复活归档再复用」作为内容功能前置 |
| 分享 | **无** `navigator.share` / 无原生壳 / 无 PWA manifest·SW；「一键发到 IG/X/小红书」**不做核心承诺** |
| i18n 对外 | v1.0.0 = **en + ja**；金句/卡片 **不做中文**（勿顺手把 `zh` 升 `ready`） |
| MilestoneGlow | 仪式节点 **streak-7 / 21 / 100**；**不是**通用成就/解锁引擎 |
| 付费解锁触发 | 与 Sanctuary 纪要一致：**禁止**连续/断签式解锁；**不**为付费内容留 streak 接口。②B 旧「连续练习解锁」**冲突**——阶段 2 须改为「遇见/Sanctuary 支持解锁」或取消 |

## 建议实现顺序（增长向）

1. **① YouTube 卡片入口** — Idle ⋯ / 抽屉 **平级**新项（与 breath / companion / reminder / language 同级） — **已合 develop**  
2. **③ 每日签文卡片** — 本地文案选取 + canvas 合成 + **保存图片** — **已合 develop**  
3. **②A 电子书免费下载** — 菜单静态入口；内容可并行撰写 — **延后**（2026-08-06 用户书面）  
4. **②B 电子书解锁** — 仅在 A 之后；**原「连续练习」方案已作废**（见上节）；阶段 2 须非 streak 重设计或取消 — **延后**  

相对 **主动 Recover / breath-pacer**、壳选型、主路径债：本包整体 **让路**（人力/上下文切换，非代码硬耦合）。**电子书两项另再让路**：当前排期不得默认「下一件就做 ②A」。

## ① YouTube 卡片

| 项 | 口径 |
|---|---|
| 落点 | `listSecondaryChromeEntries` 增加一项 → 打开外链或轻量说明卡 |
| **禁止** | Reflection Moment 边缘塞入口（`#tiger-reflection-moment` 无预留槽；易撞窄屏/z-index） |
| 风险 | **不是零风险**：须碰编排 + visibility + hints；仍 **远低于** 改 Reflection / MilestoneGlow |
| 验收（实现时） | 主路径：Idle 打开 ⋯/抽屉见项并可点；回流：关闭后再开、Rise 后再开；375 不挡主球 |

## ③ 每日签文卡片

| 项 | 口径 |
|---|---|
| 文案选取 | **新建**本地池（建议 `COPY_POOLS` / `DAILY_ZEN_QUOTE_*`）；按 `localDate` 确定性取模；**不**复活 soft-schedule |
| 语言 | **仅 en + ja** 键对齐 |
| 分享 v1 | canvas 合成 + **「保存图片」**；`navigator.share` 仅可作渐进增强，**不得**写成卖点 |
| **禁止** | 为分享绑架 PWA/原生壳选型；承诺「一键发到小红书」 |

## ②A 电子书（免费下载）

| 项 | 口径 |
|---|---|
| 入口 | Idle 菜单平级静态项 |
| 交付 | 本机可下载的静态文件（或外链）；无解锁门闩 |
| 内容 | 可与工程并行撰写 |

## ②B 电子书（原「连续练习解锁」）— **须重设计或取消**

> **2026-08-07**：Sanctuary 纪要已禁止任何连续/断签付费解锁。下文旧「streak 解锁」方案 **不得按原文实现**。阶段 2 若仍要 ②B，只允许：Sanctuary 支持解锁、或非胁迫的「遇见」叙事（**无**连续天数门闩、**无** streak API）。取消 ②B 亦为合法选项。

工程隔离（若重设计后仍做独立解锁位）：

- 独立 localStorage（建议 key 形如 `focus-tiger.ebook-unlocked.v1`）  
- **禁止**写入 / 读取 `MilestoneGlowStore` / `Milestone.js`  
- **禁止**用 `PracticeDaysStore` streak / 连续天数作为解锁门闩  

**产品文案验收（重设计后）**：

1. **禁止**里程碑 / 成就 / 打卡 / streak / 「连续 N 天可取」等胁迫或连签叙事。  
2. 宜用观察式、礼物式或 Sanctuary 支持语气。  
3. **不得**挂在 Glow / 成就墙路径。  

若只做 ②A、不做 ②B → 本节约强制项不适用（**推荐**在禁 streak 口径下优先此路径）。

## 明确不做（本决策包）

- Settings / Culture Space 分类导航树（内容项变多后再另议薄分组）  
- Reflection 边缘入口  
- 复活 soft-schedule 作为金句前置  
- 「一键分享到指定社交 App」核心承诺  
- 金句中文版 / 把 zh 升 ready  
- 把电子书 B 塞进 MilestoneGlow 节点表  

## 实现开工口令（将来）

分别开 feature（勿一次四件揉进同一 PR），例如：

- `feature/idle-youtube-menu-entry`  
- `feature/daily-zen-quote-card`  
- `feature/ebook-static-download`  
- `feature/ebook-practice-unlock`（须引用本节 ②B 文案验收）

口令示例：「按 `task-growth-content-pack-decision` 开工 ①」。

## 邻接保护面（任一实现 Task 的已好清单须含）

- Idle ⋯ / 抽屉现有项（breath / companion / reminder / language）可见性与 hints 薄荷绿  
- MilestoneGlow streak-7/21/100 产品路径不被文案/入口误绑  
- Reflection 主路径不被新叠层打扰  
- en/ja Language 切换后新文案键齐全  
