# LABEL_HINT_TIP_STANDARDS.md — 说明信号分层（方向锁）

创建日期：2026-09-12  
方向锁：2026-11-21（PO 书面：四层信号合理；乱在缺按控件总账 + 无机器拦截；同屏最多 1 个发现性脉冲；L4 序主路径先于外围；触屏第一次按控件记）  
状态：**方向锁**（实现切片见 [`task-briefs/task-entry-signal-ledger.md`](./task-briefs/task-entry-signal-ledger.md)；本文件是**唯一政策 SSOT**）  
权威路径：`focus-tiger/docs/LABEL_HINT_TIP_STANDARDS.md`  
账本（将改为机器生成）：[`LABEL_HINT_TIP_AUDIT.md`](./LABEL_HINT_TIP_AUDIT.md)  
接线（场景 × hintId，不是政策）：[`HINTS_WIRING.md`](./HINTS_WIRING.md) · [`ONBOARDING_HINTS.md`](./ONBOARDING_HINTS.md)  
圆点族谱附录（历史盘点，不另立主题）：[`SITE_DISCOVERY_DOT_CENSUS.md`](./SITE_DISCOVERY_DOT_CENSUS.md)

> **地面真相（批 1 后 · 仍待账本生成器）**：`ft-glass-hover-tip.js` 已收编倾听耳玻璃胶囊（~120ms 淡入）。**已迁**：Home 三球（宽/窄）、窄屏倾诉钮、音符/♪ 残句（mint done 后仍自绘）。**仍待**：地球仪/时钟残句、面板滑杆 `title`、用途类 `title` lint、死族删代码、同屏单脉冲。属性名现网多用子节点 `role="tooltip"`，目标仍对齐 `data-ft-tip`。

---

## 〇、2026-11-21 拍板（三件事 + 一条上限）

| # | 决定 | 含义 |
|---|---|---|
| **1** | **全站 tip 一种皮肤** | 查询层只用倾听耳玻璃胶囊（浅底、随控件升起）。禁止再复制 Transition 深色小条；现存深条并入同一 token。 |
| **2** | **死族删代码，不只空表** | **C 族** `.ft-hint-discovery-dot` / `HINT_DISCOVERY_DOT_HOSTS`：**删模块与绘制路径**，禁止留空表等人复活。**D 族** `.ft-home-sanctuary-nav-pulse`：导航功能关闭期**整体摘除**绘制；日后开闸必须进 hint **registry**（`triggerMode: click`），禁止再游离在 `HINTS_WIRING` 外（#1834 孤儿点教训）。 |
| **3** | **触屏默认** | 图标入口：**点击即执行**；**每个控件第一次**贴边短提示约 **1.2s**（按 `controlId` 写入既有 hints store，禁止全站只记一次）。不可逆操作才允许「先 tip 再执行」。禁止把悬停当作触屏上的唯一说明。 |
| **上限** | **同屏最多 1 个发现性脉冲** | 任意时刻可见的 mint 浮动点 + 行内 mint 合计 ≤ 1。赢家按 Brief §8.1（How → Rise → 音符 → 时钟 → 热力图 → 地球 → `?`）。须**完成或冷落让位**（§四），禁止第一名卡住整队。改变现网 onboarding 节奏 → **B 类**。朱红 `?` 警报 **不算**发现性脉冲。 |

四层信号本身**不砍**：可见 Label / 查询 tooltip / 发现性脉冲 / 一次性气泡。乱的根源是**没有按控件总账**、**没有机器拦截**。

---

## 一、四种信号，不要合成一种控件

| 信号 | 解决什么 | 何时出现 | 何时消失 |
|---|---|---|---|
| **可见文字 Label** | 永久说明用途，用户不必做任何动作 | 控件存在的全程 | 控件本身收起才消失 |
| **悬停 / 查询 tooltip** | 用户已经看见入口，想确认「这是干什么的」 | 桌面悬停；触屏见 §五 | 指针离开 / 第一次短提示结束 |
| **发现性脉冲点** | 让用户注意到「这里有还没看过的入口」 | 未读 / 未探索（`OnboardingHintsStore` 未 `done`、未 `resting`）且通过同屏 1 点仲裁 | 完成相关操作后按 tier 移除；或冷落 3 次 Idle 后静止让位 |
| **一次性气泡 / 幽灵句** | 动手前必须说一句（额头摸头、Recover 幽灵句） | 首次或会话内条件 | 点过 / 写入 seen 键 |

同一控件默认：**最多一种发现性信号**（脉冲 **或** 一次性气泡，不同时）。查询 tooltip 可与脉冲并存，但**同句必须去重**（脉冲占用该句时摘 tooltip）。  
叠加第二种发现性信号必须在账本里 **显式登记豁免**（`stackExempt`），否则 `docs:check` 红。

禁止：把脉冲点改成 tooltip 的替代品；给已经写清楚的文字按钮再叠同义悬停。

**查询层实现规则：**禁止浏览器原生 `title` 做用途说明（Safari / Chrome 约 1s 才出字）。目标：自绘 tip（倾听耳皮肤）。`document.title` 与可见标题节点豁免。

发现性脉冲的文案、圆点 tier、场景接线仍以 `ONBOARDING_HINTS.md` + `onboardingHintRegistry.js` + `HINTS_WIRING.md` 为准。本文件不重开一套 auto-tip 喷洒。

---

## 二、分层决策（配哪种信号）

按从上到下第一条命中执行：

1. **国际通用、无歧义的系统控件**（关闭 ×、返回、对话框主按钮已写「发送 / 关闭 / 知道了」）→ **只保留可见文字或通用图标**；不加 tooltip，不加脉冲。
2. **可见 Label 已经说清具体行为**（菜单行「Journey Log」、Support FAB 旁已有「Support Yin」）→ **维持 Label**；不要再加同义 tooltip。仅当 Label 过短、行为有隐藏代价（扣时长、发网络、关会话）时，才加一条**补充细节**的 tooltip。
3. **图标按钮 / 抽象符号 / 只有图没有字**（Home 三球、地球仪、时钟、音符、⋯、PiP、倾听耳）→ **必须**有查询层：桌面自绘 tooltip；触屏见 §五。
4. **全新或很少被点到的入口，且用户可能根本没看见** → **脉冲点**（只走 registry `triggerMode: click`）。可叠加 §3 的 tooltip。禁止第二种脉冲颜色。
5. **首次使用、必须在用户动手前说一句**（额头摸头、Recover 幽灵句）→ **一次发现气泡 / 常驻幽灵 hint**，不是 hover tooltip，也不进 mint 喷洒池。

**落地顺序（实现 Brief）：**先账本生成器 + lint → 删死族 → 同屏单脉冲 → 再迁地球仪/时钟/滑杆原生 `title` → 最后扫脉冲与 tooltip 叠床架屋。不要一次性重做成「统一组件」。

---

## 三、悬停 tip 实现约定（目标态）

| 项 | 约定 |
|---|---|
| 载体 | `data-ft-tip` 或子节点 `role="tooltip"`。禁止用途类 `element.title =` / `setAttribute('title')`。 |
| 皮肤 | **仅**倾听耳玻璃胶囊。实现应收成同一 token（现网耳 ~180ms 淡入、Transition 140ms 深条 → 并入耳的浅底）。 |
| 出现时机 | 悬停约 **120ms** 后再淡入。 |
| 淡入时长 | 约 140–180ms opacity。 |
| 文案 | `t()` / locale；≤ 40 字（中）/ ≤ 8 词（英）。 |
| 与脉冲去重 | 脉冲 / host-hover 气泡已占用同一句时，**摘掉**自绘 tip（现网 `_syncPulseOwnedNativeTips`；迁到 `data-ft-tip` 后对同一属性备份/恢复）。 |
| 豁免 | `document.title`；可见标题节点 / `titleEl` / 班级含 `__title`。 |

---

## 四、脉冲点（发现性）约定

- **谁能画点**：只允许 `OnboardingHintsUI` + `syncSecondaryMenuHintDot` / `has-hint-mint`，且 hintId 在 registry、`triggerMode: click`。禁止 registry 之外的彩色脉冲 class。
- **同屏上限**：可见发现性脉冲 **≤ 1**（浮动 badge 与行内 dot 合计）。菜单开着时仍遵守上限（禁止菜单内多行同时亮）。
- **仲裁序**（政策锁；`HINTS_WIRING` 簇字母不是本序）：`how-shall-we-sit` → `rise-button` / `idle-after-session` → `ambient-soundscape` → `in-app-reminder` → `weekly-heatmap` → `language-preference` → `help-affordance`。未 `done`、未 `resting`、在屏、允许 mint 者取最先一条。
- **让位**：点宿主完成 → `done` 出队；**或**同一赢家连续 **3 次**进入 Idle 为可见脉冲且宿主未点 → `resting` 出队（不是 `done`）。否则后面的 hint 永远不亮。
- **Home 左球（Quick Start）**：不画 mint，只留 hover 残句（2026-08-11）。
- **Focus HUD 金环 / 进度条 / 近日同坐**：不画浮动 mint，悬停宿主出 hint 文案（2026-08-15）。
- **消失**：`simple` = 看过文案后静止弱化，相关操作完成后移除；`detailed` = 进详情才移除。悬停一次不得误标永久 done，除非 registry 已如此定义。冷落静止见上条让位。
- **禁止**为「看起来统一」给 Sit / 文字菜单行加 mint。
- **死族**：C/D 见 §〇.2；附录普查只作考古。

---

## 五、触屏 fallback

**已锁默认（§〇.3）：**图标入口点击执行 + **每个控件**第一次 ~1.2s 贴边短提示。

1. 有清晰可见 Label → 触屏 **不必**再出 tip。
2. 不可逆操作才允许「先 tip、再点执行」——须单独立项。
3. **禁止**在触屏上把悬停当作唯一说明（与 `idleHomeCtaTip`「触屏不显示 hover tip」一致）。
4. **第一次标记粒度**：按 `controlId` 各一次，存既有 hints store。点过地球仪，时钟与 ♪ 仍可出各自的第一次。禁止全站一个布尔。

---

## 六、入口信号账本（按控件一行）

这是统一规划的抓手。真源：registry + 源码静态扫描，**写入** [`LABEL_HINT_TIP_AUDIT.md`](./LABEL_HINT_TIP_AUDIT.md) 机器块，由 **`docs:check` 静态闸**看守。**DOM 实扫（起浏览器）放 nightly**，禁止塞进每次 PR 的 `docs:check`。**不**新开第三份 SSOT。

| 列 | 含义 |
|---|---|
| `controlId` | 稳定 id（优先 DOM id / `data-testid` / 登记 selector） |
| `selector` | 主选择器 |
| `visibleLabel` | 可见 Label 文案键或「无」 |
| `tooltip` | `none` / `native-title`（违规） / `glass-ear` / `glass-legacy-dark` / `hint-host-hover` |
| `pulse` | `none` / `mint-float` / `mint-inline` + `hintId` |
| `oneShot` | `none` 或气泡 id（如 `IDLE_YIN_TAP_HINT`） |
| `touch` | `label-enough` / `execute-plus-first-toast` / `pulse-click` / `irreversible-tip-first` |
| `stackExempt` | 空 = 不得第二种发现性信号；非空须写原因 |

规则：每个入口最多一种发现性信号；叠加必须 `stackExempt`。账本未登记却出现彩色脉冲 class → 红灯。

生成器与 lint 的切片、验收见 Brief，**本文件不实现代码**。

---

## 七、原生 `title` 禁用 · lint（实现切片，本文件只锁政策）

实现阶段挂 `docs:check` / ESLint：

- 禁止用途类 `.title =` / `setAttribute('title')`（白名单：`document.title`、测试读文本节点、`titleEl` / `__title`）。
- 禁止 registry 之外出现新的彩色脉冲 class（`.onboarding-hint-badge` / `.ft-secondary-menu-hint-dot` / `has-hint-mint` 以外；C/D class 删除后亦禁回归）。
- **同时**扫 CSS / 样式模块里名称含 `pulse` 的 `@keyframes` 与 `animation`，走**白名单**。只改 class 名不得绕过。

建议命令（实现时落地，此处仅政策）：

```bash
rg -n --glob '*.js' -e '\.title\s*=' -e "setAttribute\(['\"]title['\"]" \
  focus-tiger/src focus-tiger/ui-kit focus-tiger/desktop
```

---

## 八、与其它文档的边界

| 主题 | 本文件 | 交叉引用 |
|---|---|---|
| 政策 / 分层 / 皮肤 / 触屏 / 账本列定义 / 同屏上限 | **管（唯一 SSOT）** | — |
| 场景接线 / 互斥 / 宽窄 park | 不管 | `HINTS_WIRING.md` |
| hint 文案与 tier 叙述 | 不管 | `ONBOARDING_HINTS.md` |
| 按控件信号总账（生成表） | 列定义在此；**行在 AUDIT** | `LABEL_HINT_TIP_AUDIT.md` |
| 圆点 class 考古 | 不管（附录） | `SITE_DISCOVERY_DOT_CENSUS.md` |
| 角落 vs 菜单 | 不管 | `MENU_CHROME_CENSUS.md` |
| Confide 口头芯片 | 否 | `confide-observation-honesty-bucket-audit.md` |
| 冷启动第一幕 | 否（E11 额头句 = 一次性气泡） | `cold-start-first-scene-audit-inventory.md` |

改本锁的语义前，实现 PR 仍须对照 `FEATURE_CONFLICT_REVIEW.md`：新 tip 不得比 Recover / Confide 更重，不得把阿寅说成监工。
