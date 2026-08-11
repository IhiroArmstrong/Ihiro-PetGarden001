# Task Brief · 增长向内容包（决策锁 · ①③ 已合入 · ②A 延后 · ②B 已取消）

> **状态（2026-08-06）**：① Zen Cinema / ③ Quiet Line 已合 `develop`（PR #148 / #153）。**②A 延后**。**②B 已于 2026-08-07 取消**（不改造）。  
> **性质**：可延后增发；不得挤占壳选型、主路径债。  
> **2026-08-07**：付费双入口见技术方向纪要（A Tip + B Sanctuary）；本包不另开付费解锁轨。

## 权威边界（先读）

| 项 | 口径 |
|---|---|
| Settings / Culture Space | **不存在**；勿假设二级分类馆。最接近入口 = Idle 宽屏 `WideIdleMoreMenu` / 窄屏抽屉扁平列表 |
| soft-schedule / CloudConfigClient | **不在** `origin/develop`；v1 **禁止**复活归档作内容前置 |
| 分享 | **Save image / 存图**是正式路径，且**预期**用户可拿图去社交分享；「一键发到 IG/X/小红书」**暂不做**（非永久禁止社交，只是暂无一键深链） |
| i18n 对外 | v1.0.0 = **en + ja**；金句/卡片 **不做中文** |
| MilestoneGlow | **不是**通用成就/解锁引擎 |
| 电子书 ②B | **已取消**；内容解锁只跟 B Sanctuary 付费绑定 |

## 建议实现顺序（增长向）

1. **① YouTube 卡片入口** — Idle ⋯ / 抽屉 **平级**新项（与 breath / companion / reminder / language 同级） — **已合 develop**  
2. **③ 每日签文卡片** — 本地文案选取 + canvas 合成 + **保存图片** — **已合 develop**  
3. **②A 电子书免费下载** — 菜单静态入口；内容可并行撰写 — **延后**（2026-08-06 用户书面）  
4. ~~**②B 电子书连续练习解锁**~~ — **已取消（2026-08-07）**；不改造、不排期  

相对 **主动 Recover / breath-pacer**、壳选型、主路径债：本包整体 **让路**。**②A 另再让路**：当前排期不得默认「下一件就做 ②A」。

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
| 分享 v1 | canvas 合成 + **「保存图片」**（方便用户自行发社交）；`navigator.share` 可作渐进增强，**不得**写成「一键发到某某 App」核心卖点 |
| **禁止** | 为分享绑架 PWA/原生壳选型；把「暂无一键深链」写成「产品不做社交」 |

## ②A 电子书（免费下载）

| 项 | 口径 |
|---|---|
| 入口 | Idle 菜单平级静态项 |
| 交付 | 本机可下载的静态文件（或外链）；无解锁门闩 |
| 内容 | 可与工程并行撰写 |

## ②B 电子书 — **已取消（2026-08-07）**

> **不再实现、不改造成非 streak 版本。**  
> 理由：已有 **A Tip（打赏）** 作情绪化付费；**内容解锁只跟 B Sanctuary 付费绑定**，不再叠加练习时长/频率门槛，避免与禁 streak / 不制造焦虑红线摩擦。

历史曾写的 `ebook-unlocked` + 连续天数门闩方案 **作废**。若将来要「付费可得电子书」，并入 Sanctuary 权益或另开付费 SKU Brief——**不是**本增长包 ②B。

## 明确不做（本决策包）

- Settings / Culture Space 分类导航树（内容项变多后再另议薄分组）  
- Reflection 边缘入口  
- 复活 soft-schedule 作为金句前置  
- 「一键分享到指定社交 App」作**当前阶段**核心承诺（Save image 出口保留；日后可另开 Brief 加系统分享表） 
- 金句中文版 / 把 zh 升 ready  
- 把电子书塞进 MilestoneGlow 节点表  
- **②B 连续练习 / 任何练习门槛解锁**

## 相邻增长（另 Brief · 非本包四件）

- **阿寅壁纸免费赠送**：见 `task-digital-wallpapers-gift.md`（候选静帧 Save image；可与 Quiet Line 同菜单气质）。  
- **2026-08-07 晚**：付费双轨 A/B 见 `task-tech-direction-v1-shell-monetization.md`（与本增长包车道独立）。
## 实现开工口令（将来）

分别开 feature（勿一次四件揉进同一 PR），例如：

- `feature/idle-youtube-menu-entry`  
- `feature/daily-zen-quote-card`  
- `feature/ebook-static-download`  
- ~~`feature/ebook-practice-unlock`~~ — **勿开工**（②B 已取消）

口令示例：「按 `task-growth-content-pack-decision` 开工 ①」。

## 邻接保护面（任一实现 Task 的已好清单须含）

- Idle ⋯ / 抽屉现有项（breath / companion / reminder / language）可见性与 hints 薄荷绿  
- MilestoneGlow streak-7/21/100 产品路径不被文案/入口误绑  
- Reflection 主路径不被新叠层打扰  
- en/ja Language 切换后新文案键齐全  
