# 全站发现性圆点普查（SITE_DISCOVERY_DOT_CENSUS）

创建日期：2026-11-21  
状态：**附录 · 考古**（政策 SSOT 已改回 [`LABEL_HINT_TIP_STANDARDS.md`](./LABEL_HINT_TIP_STANDARDS.md)；账本将生成在 [`LABEL_HINT_TIP_AUDIT.md`](./LABEL_HINT_TIP_AUDIT.md)）  
基线：`origin/develop` `ecf4ec44`（含 #1834 栖居蓝脉冲孤儿清理、#1838 收藏叠层）  
姊妹文档：[`HINTS_WIRING.md`](./HINTS_WIRING.md) · [`ONBOARDING_HINTS.md`](./ONBOARDING_HINTS.md) · [`MENU_CHROME_CENSUS.md`](./MENU_CHROME_CENSUS.md)

> **2026-11-21 方向锁覆盖本文「保持空表」旧句：**C 族删代码、D 族关闸期摘除绘制，见 STANDARDS §〇。本文保留 class 对照，避免手测仍问「蓝点是哪来的」。

> **口语「蓝点」**：产品手测里常把 **钢蓝 discovery 点**、**栖居指南针蓝脉冲**、以及 **底栏角上的小圆点** 统称「蓝点」。本表按 **机器 class + 色值** 分列，避免与 **薄荷绿 hint 点**（`#6db3a0`）混淆。

---

## 1. 圆点族谱（四类 + 一项排除）

| 族 | DOM class / 标记 | 色 / 动效 | 真源模块 | 是否 Hint 体系 | 2026-11-21 现网 |
|---|---|---|---|---|---|
| **A · 薄荷绿浮动** | `.onboarding-hint-badge` | mint 脉冲 | `OnboardingHintsUI.js` | 是 · `triggerMode: click` | 活跃 |
| **B · 薄荷绿行内** | `.ft-secondary-menu-hint-dot` · `has-hint-mint` | mint | `idleChromeOrchestration.syncSecondaryMenuHintDot` · `OnboardingHintsUI._syncHostMintDots` | 是 | 活跃（⋯/抽屉开时） |
| **C · 钢蓝 discovery** | `.ft-hint-discovery-dot` | `#5b9bb5` 钢蓝 | `hintDiscoveryDots.js` | 设计上是 hint 变体 | **宿主表为空 → 全站不绘制** |
| **D · 栖居蓝脉冲** | `.ft-home-sanctuary-nav-pulse` · `has-sanctuary-nav-pulse` | 蓝 pulse 动画 | `homeSanctuaryNavGate.js` · `homeSanctuaryNavPulseChrome.js` | **否**（独立 chrome） | **功能关** · 仅防孤儿点 |
| **排除 · 朱红 ?** | `notification-badge` on `#onboarding-hint-help` | 朱红 | `OnboardingHintsUI` | 警报 / 未读帮助 | 与 discovery 无关 |

层级登记：钢蓝 discovery 点 z-index 见 [`Z_INDEX.md`](./Z_INDEX.md)（`.ft-hint-discovery-dot` 相对宿主角标）。

---

## 2. 钢蓝 discovery（C 族）— 故意空表

| 字段 | 值 |
|---|---|
| SSOT 宿主表 | `hintDiscoveryDots.js` → `HINT_DISCOVERY_DOT_HOSTS` |
| 同步入口 | `OnboardingHintsUI.syncDiscoveryDots()` → `syncAllDiscoveryDots()` |
| 产品政策 | [`LABEL_HINT_TIP_STANDARDS.md`](./LABEL_HINT_TIP_STANDARDS.md) §〇：**删代码**，禁止空表复活 |
| 历史 | 2026-07-30 Calm 钢蓝点 `pointer-events:none` 事故；mint / 宿主悬停已覆盖 HUD |

**结论**：全站 **不应** 再出现 `.ft-hint-discovery-dot`。L2 起应删除绘制模块。若手测仍见钢蓝色小点，先查是否为 D 族残留或浏览器插件，再查是否旧分支未合 #1834。

---

## 3. 栖居蓝脉冲（D 族）— 与 Hint 分叉

| 字段 | 值 |
|---|---|
| 存储键 | `focus-tiger.home-sanctuary-nav-seen.v1`（`SHARED_RESOURCES.md`） |
| 功能总闸 | `HOME_SANCTUARY_NAV_ENABLED`（**现网 `false`** · PO 2026-11-13 · [`disable-home-sanctuary-nav`](./task-entries/disable-home-sanctuary-nav.md)） |
| 合法宿主（开闸时） | `#ft-sanctuary-nav-compass-fab`（角落指南针 FAB） |
| 同步 API | `syncSanctuaryNavPulseChrome(storage)` — 剥离 dock 遗留脉冲 |
| 合并修复 | **#1834** `fix/sanctuary-nav-pulse-chrome` — 宽/窄 home CTA 不再拥有蓝点；`removeOrphanSanctuaryNavPulses()` |

### 3.1 手测锚（nav 关 · 默认产品壳）

1. `?product=1` · Idle · 宽屏与 375：底栏 Home 球排 **无** `.ft-home-sanctuary-nav-pulse`（含右下角语言地球附近 cluster）。  
2. 清 `localStorage` 后刷新：**仍无**蓝脉冲（闸关，不应因「未 seen」误亮）。  
3. 开发者本地将 `HOME_SANCTUARY_NAV_ENABLED = true` 时：仅 FAB 上可见脉冲；打开扇形一次 → 脉冲消失且键写入。

### 3.2 遗留 dock 选择器（不得再挂脉冲）

宽屏 `#ft-wide-home-sanctuary-nav`、窄屏 `#ft-narrow-home-sanctuary-nav` 为旧 dock 球；#1834 后脉冲 **只** 跟角落 FAB。手测若 dock 球上见蓝点 = 回归。

---

## 4. 薄荷绿 click hint（A/B 族）— registry 全表

真源：`onboardingHintRegistry.js`（`npm run hints:doc-sync` 同步叙述块）。  
下列仅为 **`triggerMode: click`** 条目的 **绘制策略**（与颜色无关，但手测口语常称「小圆点」）。

| hintId | tier | 绘制策略（2026-08~11 政策） | 主锚点 selector |
|---|---|---|---|
| `quick-start` | simple | **无 mint** · 玻璃 hover 残句 only | `#quick-start-focus` 等 |
| `how-shall-we-sit` | simple | 浮动 mint **或** ⋯/抽屉行内 dot（菜单开时禁双重） | `.session-start-dock__hint` → park remap |
| `ambient-gated` | simple | 浮动 mint（FAB） | `.ambient-soundscape__fab` |
| `ambient-soundscape` | simple | **行内 / ♪ 上 mint**，禁浮动 badge | `.ambient-soundscape__mute` |
| `rise-button` | simple | 浮动 mint | `#btn-focus`（Focusing） |
| `idle-after-session` | simple | 浮动 mint | `#btn-focus`（Idle 有过完成） |
| `weekly-heatmap` | simple | 浮动 mint | `#weekly-practice-heatmap` |
| `language-preference` | simple | 浮动 mint（角落 FAB） | `#language-preference-fab` |
| `in-app-reminder` | simple | 浮动 mint **或** 菜单行 dot | `#reminder-preference-toggle` |
| `micro-ritual` | simple | 与 Home 左球相关 · 无独立 dock 行 | `#quick-start-focus` 等 |
| `focus-hud-ring` | simple | **无 mint** · 悬停金环出 tip | `#focus-hud .ft-hud__gauge` |
| `focus-hud-progress` | simple | **无 mint** · 悬停今日同坐条 | `#focus-hud .ft-hud__bar` |
| `focus-hud-streak` | simple | **无 mint** · 悬停近日环 | `#focus-hud .ft-hud__streak` |
| `help-affordance` | detailed | 薄荷 click badge on `?` | `#onboarding-hint-help` |

菜单 proxy → hint 映射（行内 mint）：`idleChromeOrchestration.js` → `SECONDARY_PROXY_HINT_IDS`（`companion`→`how-shall-we-sit`，`reminder`→`in-app-reminder`；`honesty` 映射为 auto hint，**不**走 click 行内同步循环）。

---

## 5. 表面 × 圆点对照（Idle 主路径）

| 表面 / 断点 | 可能出现的圆点族 | 备注 |
|---|---|---|
| 宽屏 Idle 三球 + ⋯ | A 浮动（FAB/heatmap 等）· B（开 ⋯ 时行内） | 左球 quick-start **无** mint |
| 窄屏 Idle 三球 + 抽屉 | 同上 · B 在 sheet 行 | `ft-narrow-park` 时部分 remap |
| Focusing HUD | **无** A 浮动 mint · 宿主悬停 tip | e2e `focus-hud-hover.spec.js` |
| 环境音 ♪ | B `has-hint-mint` + 行内 dot | 面板开时 hover 预览门闩 |
| 栖居指南针（关） | **无** D | #1834 孤儿清理 |
| Journey / 成长叠层开 | 底栏 chrome suppress | 曾报「蓝点穿透」· ledger **已解决** · TRACKER 仍待人工关单 |
| Immersive presence | CSS 隐藏 `.ft-hint-discovery-dot` | 防钢蓝残留 |

---

## 6. 自动化与人工关单锚

| 主题 | 命令 / 规格 |
|---|---|
| 菜单双重 mint | `e2e/wide-idle-more-menu.spec.js` |
| HUD 无碎点 + 悬停 tip | `e2e/focus-hud-hover.spec.js` |
| 音符 mint | `e2e/hints-visual-guardrail.spec.js` |
| 栖居脉冲逻辑 | `node --test src/core/homeSanctuaryNavGate.test.js src/core/homeSanctuaryNavPulseChrome.test.js` |
| 手测登记 | `TEST_TRACKER` 行「栖居总导航」「FocusHUD 无脉冲点宿主悬停」「⋯/抽屉薄荷绿」 |

---

## 7. 11/20 手测 #11 收口结论

| 反馈摘要 | 普查结论 | 建议下一刀（须另开功能 PR） |
|---|---|---|
| 底栏「其它蓝脉冲」 | D 族在 nav **关** 时不应存在；#1834 专清孤儿脉冲 | 手测关单：默认壳 Idle 扫一遍 DOM（无 `.ft-home-sanctuary-nav-pulse`） |
| 「全站蓝点盘点没收尾」 | 本文已降为 STANDARDS 附录；账本走 AUDIT | 统一规划见 `task-entry-signal-ledger` |
| 钢蓝 discovery 复活 | 空表仍会诱人复活 | L2 **删代码**（STANDARDS §〇.2） |
| Journey 叠层穿透 | 独立 bug · 已记 ledger 已解决 | 跟 TRACKER「叠层下宽屏 Home 球 / Journey 蓝点穿透」人工关单 |

---

## 8. 禁止项（防回归）

1. 在 dock Home 球（`#ft-wide-home-sanctuary-nav` / `#ft-narrow-home-sanctuary-nav`）上恢复 D 族脉冲。  
2. 给 Focus HUD 三条重新加浮动 mint（2026-08-15 拍板）。  
3. 在非空情况下往 `HINT_DISCOVERY_DOT_HOSTS` 填宿主而不改 `pointer-events` 与 e2e。  
4. ⋯/抽屉开时同时画浮动 badge **与** 行内 dot（2026-08-02 修过双重脉冲）。

---

## 9. 维护

- **不要**把本附录当政策。新增脉冲 / tip → 改 STANDARDS + registry + AUDIT 账本。  
- 新增 **click hint** → `HINTS_WIRING` + registry。  
- 机器块仍无；生成表在 AUDIT，不在本文。