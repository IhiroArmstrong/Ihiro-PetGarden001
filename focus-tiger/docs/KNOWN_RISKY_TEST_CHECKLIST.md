# Known-Risky 优先验收清单

创建日期：2026-08-04  
权威路径：`focus-tiger/docs/KNOWN_RISKY_TEST_CHECKLIST.md`  
性质：**人工验收操作步骤**——对应 `DEVELOP_DEBT_INVENTORY.md` §1 `known-risky` 优先批。  
基线：验收前须 `git pull` 到当时 `origin/develop` tip，并跑 `npm run check:branch-freshness`（behind 须为 0 才可关单级验收）。

> 根目录曾有本地 `KnownRisky测试清单.numbers`（未入库）。**本 MD 为 SSOT**；同目录 `known-risky-test-checklist.csv` 为薄导出（便于表格软件）；Numbers / 其它副本不得另立权威。

---

## 0. 怎么用

| 问题 | 答案 |
|---|---|
| 开始测产品，优先测什么？ | **本表**（= 债务清单里风险最高的一批） |
| 状态标签 / 判定依据？ | 仍看 `DEVELOP_DEBT_INVENTORY.md` §1；本表只补**可执行步骤** |
| 关单写哪？ | `TEST_TRACKER.md` 对应行（书面反馈进「用户反馈」列；关单门禁见文首） |
| 自动化绿了算过？ | **不算**关单；本表是人工走查 |

**公共前置（每条默认）**

1. `cd focus-tiger && npm run dev`  
2. Safari 打开 `http://127.0.0.1:5173/?product=1`（窄屏用响应式 375×667）  
3. 需要干净开局时：在**非** `?product=1` 的实验室页重置本地状态 / 清空 hints，再回产品壳  

---

## 1. 清单（17 条）

| # | 功能/交互点 | 需要的具体测试操作步骤 | TRACKER / 债务指针 |
|---|---|---|---|
| 1 | Idle 窄宽 chrome 总验收（三球 / ⋯ / 抽屉） | **【前置】** 已 pull 到 `origin/develop` tip。<br><br>**【宽屏 ≥900】**<br>1) Idle：见宽屏三球（Quick · Sit · Honesty）+「⋯」，不是旧 Sit+⚡ pill。<br>2) 点「⋯」：应代理 Honesty / How / Sound / 提醒等；行内若有脉冲点，点开文案**不得**误绑成「Tap to sit with Yin」。<br>3) 点 Sit → Arrival → Choose → Companion 点选 → Focusing；见 Focus HUD。<br>4) Rise → 回 Idle，壳仍正常（三球+⋯）。<br><br>**【窄屏 375×667】**<br>5) Idle：主画布三球 + 底栏抽屉；无宽窄双壳叠点。<br>6) Sit → Arrival：Arrival 开着时 Sit 应隐藏；Breath 勿再露主 Sit。<br>7) **Focusing 时点「?」/ tip**：行为须符合预期——主条 +「还有 N 条」芯片逐条展开；**禁止**多条 tip 叠成一团难读（曾报 Focusing tip 问题；2026-08-04 复测仍失败，见工作流 §6.12）。<br>8) Sit options / How：若有脉冲点，窄屏应有、且不指错控件。<br><br>**【断点】** Companion/How 打开时 375↔480 改宽：面板不得被误关。<br><br>**【通过】** §8 375 故事最小集 + §9 W1–W8；Bugs 记回 TRACKER。 | `TEST_TRACKER`「响应式 Task 3 · 窄宽单代码线」· 债务 §1 首行 |
| 2 | Honesty Check-in（Idle 补登主路径） | 1) Idle 点 Honesty → 选时长 → 呼吸引导。<br>2) 呼吸中底栏：应仅保留 Quick Start（keepQuickStart），**不得**满排三球挡流程。<br>3) 结束 → 成功 toast + 桥接 CTA 同屏可读。<br>4) 回流：同日再走一遍。<br>5) 时长面板打开时点「?」：尖角须指可见锚点，**不得**指虚空。 | Honesty 主路径行 · 债务 §1 |
| 3 | Honesty 桥接 CTA | 1) 补登结束立刻出桥接：thanks + Yes/No。<br>2) 气泡暖米半透明，勿近乎不透明挡阿寅。<br>3) 桥接可见时 Honesty / 一分钟呼吸入口须隐藏，勿叠 Yes/No。<br>4) Yes → Arrival → Companion；No → Idle 入口恢复。<br>5) 375：toast 与桥接同屏可读。 | Honesty 桥接行 · 债务 §1 |
| 4 | Ambient Soundscape + 右上音符静音 | **宽屏** 1) 音符关=可开播；在播再点=静音。2) 选曲有声→静音→再点：应**续播**同曲。3) 面板显式 Off：再开不自动续播。<br>**窄屏** 4) ActionBar ♪ 可开面板；抽屉开着点 ♪ 勿被挡。<br>**Focusing/Rise** 5) 计时中可换曲。6) Rise/达标 → 音乐自动停。<br>回流：刷新后仍尊重静音偏好。 | Ambient / 音符相关行 · 债务 §1 |
| 5 | 「本周陪伴」热力图 UI | 1) Idle 见 7 格。2) 宽屏多在「?」上方；窄屏勿看不见。<br>3) Focusing：热力图隐藏/park，不挡 HUD。<br>4) 完成短计时或 Honesty 后回 Idle：今日格应变亮。<br>5) 清 hints 后点「?」：weekly-heatmap tip 立刻出且尖角近热力图（不得等 More tips / 指空）。 | 热力图行 · 债务 §1 |
| 6 | 应用内提醒设置 + 横幅 | 1) 点热力图簇旁时钟 → 设即将到点并保存。<br>2) 取消偏好 → 存储清空。<br>3) 到点且今日未练 → gentle 横幅；关后勿无故刷屏。<br>4) Focusing / Arrival / Reflection / 微仪式 → 横幅 suppress。<br>5) 整页刷新后再到条件：行为符合偏好。 | 提醒设置/横幅行 · 债务 §1 |
| 7 | Onboarding Hints · ? 补救 / Lit 试点 | 1) 清 hints：冷 Idle 见 Sit tip / 薄荷绿 click 圆点。<br>2) 点「?」：此刻可见控件出 tip；⋯/抽屉项折进 More tips 芯片。<br>3) 点 tip 本身 → 立刻消失。<br>4) 宽屏 tip 尖角贴锚；窄屏抽屉未开时勿乱指抽屉内控件。<br>5) Rise 后再 Focusing 点「?」仍可用（**叠层观感**另见 #1 步 7 / §6.12）。<br>护栏试点 ≠ 替代本条人工观感。 | 「点 ? 补救」行 · 债务 §1 |
| 8 | 冷启动「开场即睡」vs live DORMANT | 1) 硬刷新 `?product=1`：须 Idle 闭目有精神，**不得**立刻披斗篷睡着。<br>2) 对照：≥2h 条件切后台再回 → 允许 live 披毯进睡。<br>3) 若长挂 Vite 第一眼已睡着：先分清 Expand A / 冷启动（见 `DEV_WORKFLOW_QUALITY` §6.11，若已合入）。 | 开场即睡 / cloak 行 · 债务 §1 |
| 9 | earWiggle / 摇耳摸头回 Idle | 1) 播摇耳/摸头：正放 → 倒放一次 → ~1s CapCut 溶回 Idle。<br>2) 禁止只停入库定格、禁止倒放后再正放循环。<br>3) 叠化后稳定呼吸、不闪切。 | earWiggle 行 · 债务 §1 |
| 10 | `completionPending` 时 Sit 静默 return | 1) 走到完成反馈窗口尚未清完时点 Sit。<br>2) 期望：Sit **不可点**（禁用/隐藏）或有明确反馈；**禁止**可点却完全没反应。 | EDGE_CASES #5 · 债务 §1 |
| 11 | Visibility 契约 `gap-*` | 抽查：宽屏 Focusing 见 `#focus-hud`；375 桥接时 Honesty/微仪式入口隐藏；鞠躬后 Companion 在视口内；Focusing 热力图 park。一侧对一侧错 → 记 gap。 | SHARED_RESOURCES / V-gap · 债务 §1 |
| 12 | 场景动画 Dispatcher（欢迎/深夜/好奇互斥） | 1) 当日首次打开：欢迎池（书/点头）；同 tick **不应**再叠深夜茶/哈欠。<br>2) Focusing 中 Rise：加权池（伸懒腰/茶/书），勿魔法书/庆祝舞。<br>3) `welcomeBack` 空实现属预期，勿当 Bug 重开。 | SCENE_ANIMATION_WIRING · 债务 §1 |
| 13 | MilestoneGlow 与 Celebrating 同刻 | 1) 当日首次达标且跨里程碑：优先 MilestoneGlow；庆祝戳仍记账；勿双动画打架。<br>2) 非里程碑当日首次：仍 Celebrating。<br>3) Honesty 跨里程碑：先 Glow 再桥接。 | MilestoneGlow 行 · 债务 §1 |
| 14 | Companion 点选→开表门闩（含 375 鞠躬） | 1) Sit → Choose → 鞠躬后：三选一须在视口内。<br>2) Here/Flow：立刻 Focusing（门闩就绪）。<br>3) Offline：立刻 Focusing，**不得**再 Notice。<br>4) Rise 后 hint→Here/Flow 回流立刻开表；Sit 仍走 Arrival。 | Companion 门闩行 · 债务 §1 |
| 15 | Emotion / `playEmotion` 返回值常忽略 | **非第一批必过**。实验室连播若干情绪：强情绪/hold 勿被弱情绪打断；控制台无连环错即可。可标「跳过（工程观察）」。 | EDGE_CASES #17–19 · 债务 §1 |
| 16 | `main.js` 完成路径 / `pendingAutoStart*` | **大重构暂不处理**。抽查：达标→Reflection→Idle；未达标 Rise→Reflection→Idle；完成反馈期勿连点 Sit/⚡ 半卡。 | 债务 §1 |
| 17 | Grow / `Milestone.js` 等占位 TODO | **Backlog**。确认产品壳无「假完整纪念柜」；MilestoneGlow 产品路径 ≠ `Milestone.js` 脚手架。可标「跳过（Backlog）」。 | 债务 §1 |

---

## 2. 与其它文档的关系

| 文档 | 关系 |
|---|---|
| `DEVELOP_DEBT_INVENTORY.md` | **标签与判定依据** SSOT；本表是其 known-risky 的**操作步骤层** |
| `TEST_TRACKER.md` | 逐功能反馈 / 关单；本表失败项必须写回对应行「用户反馈」 |
| `COVERAGE_GAP_AUDIT.md` | 自动化分层；本表不替代 e2e |
| `HINTS_WIRING.md` / `RESPONSIVE_LAYOUT.md` | Focusing「?」叠 tip、窄宽故事细节 |
| `DEV_WORKFLOW_QUALITY.md` §6.12 | Focusing tip「记入 ≠ 开修」工作流根因 |

---

## 3. 维护

- 债务清单增删 known-risky 行时：**同批**更新本表步骤列。  
- 根目录 `.numbers` / 导出 `.csv` **不得**再当权威；改步骤只改本 MD。  
- 复测失败 → TRACKER「有问题」+ 原话；**禁止**只改本表状态假装已修。
