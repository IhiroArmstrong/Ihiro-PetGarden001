# Task Brief · 增长向内容包（决策锁 · ①③ 已合入 · 电子书延后）

> **状态（2026-08-06）**：产品/工程共识已拍板并落档；**① Zen Cinema 已合 `develop`**（PR [#148](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/148)）；**③ Quiet Line 已合 `develop`**（PR [#153](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/153)）；**②A/②B 电子书明确延后**（用户书面：目前非最急，延迟安排——**禁止**当下一优先开工项）。人工验收见 `TEST_TRACKER` Zen Cinema / Quiet Line 行。  
> **触发**：用户「合理则办」——固化分析师与 Cursor 调查对齐后的收紧口径。  
> **性质**：可延后的 **v1.0.0 增发**候选；**不得**挤占壳选型、主路径债、已知叠层问题。

## 权威边界（先读）

| 项 | 口径 |
|---|---|
| Settings / Culture Space | **不存在**；勿假设二级分类馆。最接近入口 = Idle 宽屏 `WideIdleMoreMenu` / 窄屏抽屉扁平列表 |
| soft-schedule / CloudConfigClient | **不在** `origin/develop`（仅归档 `29770cc` / `origin/archive/soft-schedule-path-b`）；v1 **禁止**「复活归档再复用」作为内容功能前置 |
| 分享 | **无** `navigator.share` / 无原生壳 / 无 PWA manifest·SW；「一键发到 IG/X/小红书」**不做核心承诺** |
| i18n 对外 | v1.0.0 = **en + ja**；金句/卡片 **不做中文**（勿顺手把 `zh` 升 `ready`） |
| MilestoneGlow | 仪式节点 **streak-7 / 21 / 100**；**不是**通用成就/解锁引擎 |

## 建议实现顺序（增长向）

1. **① YouTube 卡片入口** — Idle ⋯ / 抽屉 **平级**新项（与 breath / companion / reminder / language 同级） — **已合 develop**  
2. **③ 每日签文卡片** — 本地文案选取 + canvas 合成 + **保存图片** — **已合 develop**  
3. **②A 电子书免费下载** — 菜单静态入口；内容可并行撰写 — **延后**（2026-08-06 用户书面）  
4. **②B 电子书连续练习解锁** — 仅在 A 之后；见下方强制验收 — **延后**（同上）  

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

## ②B 电子书（连续练习解锁）— 文案验收强制项

工程隔离（实现时）：

- 独立 localStorage（建议 key 形如 `focus-tiger.ebook-unlocked.v1` 布尔或等价）  
- **禁止**写入 / 读取 `MilestoneGlowStore` / `Milestone.js`  
- streak 判定可 **只读** `PracticeDaysStore`（或同等练习日源），不得把解锁记进 Glow `played[]`

**产品文案验收（必须写入实现 Task 的测试步骤，不只是工程隔离）**：

1. 解锁说明 **禁止**使用易与 MilestoneGlow 官方体系混淆的词：里程碑 / 成就 / 打卡 / streak 庆典 / 「第 N 天仪式」等。  
2. 宜用观察式、礼物式措辞（例：「一份小礼物」「练习几天后可取」——最终句走 i18n，此处只锁气质）。  
3. **不得**在成就墙、MilestoneGlow 播放路径、或 Glow 调试叙事里展示该解锁。  
4. 人工验收须能回答：用户看到「约 3 天可取电子书」与「约 7 天金辉仪式」时，**不会**误以为同一套成就引擎缺了半截。

若只做 ②A、不做 ②B → 两套连续天数叙事问题自然消失；本节约强制项不适用。

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
