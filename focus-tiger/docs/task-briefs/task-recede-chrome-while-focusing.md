# Task Brief · T47 专注中收控件

> **状态（2026-10-23）**：PO 书面同意「无声场」落地走已排队的 T39 / T45 / T47；**T39 代码已合 #1393**。本刀是三刀里**第三刀**（专注中收 chrome）。点头前 **禁止**改 `src/`。  
> **类**：**B**（坐下后主按钮/菜单退到边上，Idle 布局不变）。  
> **代号**：**T47**（电脑版十二条对照 #3 · 执行序 10）。  
> **拍板句**（[`GLOSSARY.md`](../GLOSSARY.md) 不得改口）：不要把「更多」藏死。专注进行中才收控件；Idle 仍留坐下 + 边缘可唤出。大改，单独 Brief。  
> **不是**：T45（藏数字）、T43（系统全屏窗）、T49（换原生壳）、Idle 默认极简藏 ⋯。

## 一句话

一坐下，周边按钮先让开，让人只看见阿寅。想找菜单时，把指针移到原来放「更多」的那条边，⋯ 会回来。空闲时坐下按钮和 ⋯ 都还在，不藏死。

## 地面真相（`origin/develop` · 2026-10-23）

1. `resolveRoleVisibility` 在 `stage === 'focusing'`：**Sit / Quick / Honesty / moreOrGrabber = hidden**；窄屏 **ActionBar 仍 visible**。可见性契约 `focusing-narrow-home-ctas-hidden` 锁死 Focusing 藏主球+抓手。  
2. 窄屏 Focusing 仍把 `#session-start-dock` / `#btn-focus`（此时是 **Rise**）摆回可见。宽屏 dock Rise 同样是起身出口。  
3. overlay-suppress 时 ⋯ **仍可见**（菜单逃生舱 #757）。Arrival 时 ⋯ hidden（本刀不改 Arrival）。  
4. 热力图 / Support FAB / 灯火等 Focusing 已隐藏（场景 O / Q）。Sound FAB 窄屏 Focusing 已 park。  
5. PRINCIPLES **菜单逃生舱**：`⋯` / 抽屉抓手不得因 overlay 仲裁消失。Focusing 把 more 整段 `hidden`，等于坐下期间没有逃生舱——本刀要补的就是这个。

## 已经定下的做法

1. **只在 Focusing（含 Breath 共用这场）收。** Idle / Arrival / overlay-suppress / Honesty bridge **不改**。Idle 必须仍见坐下 + 常显 ⋯（宽）或抓手（窄）。  
2. **收哪些。** 坐下后继续藏：Sit 主球、Quick/Breath 左球、Honesty 球、热力图簇、Support FAB（现网已藏则保持）。窄屏 ActionBar 上 **非 Rise** 的闲置钮（如未打开的 Sound 入口）一并收；**不要**把整根 ActionBar 做成第二套菜单。  
3. **Rise 不收。** `#btn-focus` 在 Focusing 必须仍可点起身（逃生不等于只有 ⋯）。可减弱视觉权重（不改文案语义）。禁止把 Rise 藏到必须先唤出 ⋯ 才能起身。  
4. **⋯ 不藏死：边缘可唤出。** Focusing 时宽屏 `#ft-wide-more-btn`、窄屏 `.ft-narrow-grabber` 默认视觉隐退，但：  
   - 指针进入该控件原驻边约 **24px** 热区 → **0–1 秒内** 控件出现且可点；  
   - 键盘：Tab 仍能落到 ⋯ / 抓手（读屏名称不变）；  
   - 点开后菜单行为与 Idle 相同（宽屏五组扇 / 窄屏抽屉；叠层时 Esc 只关一层）。  
   离开热区且菜单已关 → 再隐退。禁止 `display:none` 卸掉节点导致点了没反应。  
5. **HUD。** 本刀不改 `#hud-time` 显隐（交给 T45）。不卸 `#focus-hud`。  
6. **不新开关。** 禁止「专注时隐藏界面」偏好。  
7. **可见性契约。** 实现时改 `visibilityContractRegistry`：Focusing 的 more/grabber 从 `hidden` 改为 **edge-recall**（新 must 值或等价注释 + 测锚）。`focusing-narrow-home-ctas-hidden` 对 **主球** 仍 hidden；抓手改为可唤出。须 `visibility:doc-sync`。  
8. **受保护路径。** 不改 Support 模态 / 结账。Focusing 时 FAB 仍按现网隐藏；唤出 ⋯ 打开会员行仍走既有卡，不新开 Stripe 捷径。

## 变体矩阵

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| 宽屏 Idle | ≥480 | Sit + ⋯ 常显（零回归） | 现有 wide idle e2e |
| 宽屏 Focusing | Sit 之后 | 主球藏；Rise 在；⋯ 隐退；移到 ⋯ 原边 0–1s 出现 | 本刀改 `resolveRoleVisibility` + e2e 热区 |
| 宽屏 Focusing 开 ⋯ | 唤出后点 | 0–1s 见扇或列表（T25 规则）；Esc 只关菜单 | 现有 hatch + 本刀 focusing 入口 |
| 窄屏 Idle | 375 | 三球 + 抓手常显 | 现有 375 idle |
| 窄屏 Focusing | 375 | 主球+抓手默认隐；ActionBar 不挡阿寅；Rise 可见；底边热区唤出抓手 | 改 `focusing-narrow-home-ctas-hidden` 锚 |
| Breath | 左球短档 | 与 Focusing 同一套收/唤 | 同 focusing stage |
| Arrival | Notice/Choose | **不**用本刀规则（⋯ 仍按 Arrival hidden） | 现有 arrival 契约不动 |
| overlay 开着 | Reflection 等 | ⋯ 仍逃生舱常显（现网 overlay-suppress），本刀不改成还要热区 | 现有 #757 测 |
| 开 ⋯ 时点会员行 | 未购 | 0–1s 会员卡；不误伤 Support FAB 叠层 | `test:payment-contract` 若动共享层 |
| 多语言 | en / ja | 无新句 | — |

## 点击反馈（0–1 秒）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化时：挂起 / 成功 / 失败 |
|---|---|---|
| 边缘热区（非点击，指针进入） | ⋯ / 抓手在 0–1s 内出现 | 不写盘 |
| Focusing 点 ⋯ / 抓手 | 与 Idle 相同：扇或抽屉打开 | 不写盘 |
| Rise | 与现网相同开始收尾 | 不写盘 |
| Idle 点 Sit / ⋯ | **零回归**，不得变热区才能点 | — |
| 热区外点空白 | 不误开菜单；不关正在进行的坐 | 有意；若测成「没反应」须对照：空白本就不是按钮 |

设计静默：热区外空白不是控件。指针在热区内但未点 = 只显示 ⋯，不算 SB。禁止把 Focusing 点 ⋯ 做成无反馈 `return`。

## 边缘状态

| 边缘状态 | 预期 |
|---|---|
| 触屏无 hover | 点原 ⋯ / 抓手位置仍算命中热区（24px 扩大 hit）；不得只做 `mouseenter` |
| 菜单开着 | ⋯ 保持可见直到关；关后再隐退 |
| Recover 轻触阿寅 | 现网 Tiger Anchor 仍可点；不把热区做成全屏吞点击 |
| 倾诉开着 | 不改 T38 坐姿；宽屏倾诉几何仍归 T41/T42 |
| 付款大卡 | 本刀不在 Focusing 打开付款；若从菜单打开，居中例外仍归 T42 |
| 无障碍 | ⋯ 可 Tab；名称仍是更多/菜单 |

## 冲突扫描（`SCENARIO_TESTS.md`）

| 轴 | 判断 |
|---|---|
| 强度 | 收控件比再造全屏模式轻；Rise 仍在，成本不高于现网起身。 |
| 语气 | 不新增「进入禅模式」文案。 |
| 职责 | 只管 Focusing chrome。数字归 T45；系统全屏窗归 T43；逃生舱原则加强而非削弱。 |

相邻：场景 O 步 6（Focusing 藏主钮、Rise 仍在）、菜单逃生舱、场景 Q FAB 隐藏。疑点已在 Brief 内锁死（Rise 不收、⋯ 可唤出），**不**再等人裁「要不要留 Rise」。

## 共用机制核对

- **Idle chrome / 双壳（§6）**：改 `idleChromeOrchestration.resolveRoleVisibility` focusing 分支 + Narrow/Wide `_sync`。窄宽必须同一规则：Focusing 主球 hidden、more 为 edge-recall、Idle 不变。  
- **z≥17 遮罩**：不新增全屏 dim。热区是现有 ⋯ 层，不抬 z。Support FAB Focusing 已隐，唤出菜单不得把 `#yin-support-modal` 写成 inline 低 z。  
- **overlayBusy**：不新增 overlay 源。  
- **HUD 呼吸（§4.2）**：不改驱动。  
- 若改 `pointer-events` / 全局监听：作用于 `#ft-wide-more-btn`、`.ft-narrow-grabber` 及其 24px 热区包装；**不含** `#yin-support-fab` / Support 模态。  
- 后台网络：不涉及。受保护付款路径：**否**（不改结账）；动共享 pointer-events 则跑 `npm run test:payment-contract`。

## 范围（out）

- 不实现 T45 藏数字、T43 系统全屏、T44 快捷键。  
- 不把 Idle 做成默认无按钮。  
- 不自绘红绿灯、不换 AppKit 壳（T49）。  
- 不把 ⋯ 从底栏搬家（MENU_CHROME_CENSUS 第 4 条已钉）。

## 验收

- `cd focus-tiger && npm run test:smoke`（含 focusing role visibility + 热区）。  
- `npm run visibility:doc-sync` 后契约绿。  
- 单条 e2e：Focusing 主球 hidden、Rise 可见、⋯ 默认不可见但热区 click 后可见并可开菜单；Idle 回流 ⋯ 常显。窄屏 375 对称。  
- 动 pointer-events 则 `npm run test:payment-contract`。  
- 手测：坐下只见阿寅+Rise；鼠标/手指去 ⋯ 原位能打开更多；回到 Idle 坐下和 ⋯ 都在。

## 点头后开工

新 Chat · 旁支 `feature/t47-recede-chrome-while-focusing` · 基线 `origin/develop`（若 T45 已合则 rebase 其上）。口令：「按 T47 Brief 开工」。**禁止**与 T45 同一 PR。
