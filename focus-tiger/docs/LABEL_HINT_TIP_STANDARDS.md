# LABEL_HINT_TIP_STANDARDS.md — 说明信号分层规则（草案）

创建日期：2026-09-12  
状态：**草案 · 待产品拍板**（本轮不改运行时）  
权威路径：`focus-tiger/docs/LABEL_HINT_TIP_STANDARDS.md`  
配套清单：[`LABEL_HINT_TIP_AUDIT.md`](./LABEL_HINT_TIP_AUDIT.md)  
相邻 SSOT（发现性脉冲 / 首次提示气泡）：[`ONBOARDING_HINTS.md`](./ONBOARDING_HINTS.md) · [`HINTS_WIRING.md`](./HINTS_WIRING.md)

> **地面真相（2026-09-12）**：任务书里写的「已去掉 `title`、改用 CSS `data-ft-tip`、约 120ms」**尚未合入** `origin/develop`。全仓无 `idleHomeCtaTip.js`、无 `data-ft-tip`。Home 三球仍写原生 `title`。仓内已有的快速悬停样板是倾听耳 / Transition 入口的 **自绘 `__tip` 节点**，不是统一属性。本草案把「悬停解释一律走自绘 tip、禁用原生 title」写成目标规则；实现须另开工。

---

## 一、三种信号，不要合成一种控件

| 信号 | 解决什么 | 何时出现 | 何时消失 |
|---|---|---|---|
| **悬停 / 查询 tooltip** | 用户已经看见入口，想确认「这是干什么的」 | 用户主动悬停（桌面）或点击出字（触屏） | 指针离开 / 再点一次收起 |
| **可见文字 Label** | 永久说明用途，用户不必做任何动作 | 控件存在的全程 | 控件本身收起才消失 |
| **发现性脉冲点**（薄荷绿 / 钢蓝点） | 让用户注意到「这里有还没看过的入口」 | 未读 / 未探索（`OnboardingHintsStore` 未 `done`） | 看过或完成相关操作后按 tier 静止或移除 |

同一控件可以：**脉冲 + tooltip**、**只有 Label**、**只有 tooltip**、**什么都不要**。  
禁止：把脉冲点改成 tooltip 的替代品；也禁止给已经写清楚的文字按钮再叠一条同义悬停。

**本层强制统一只有一条实现规则：**凡「悬停解释用途」，禁止浏览器原生 `title`（macOS Safari / Chrome 默认约 1 秒才出字）。目标实现为自绘 tip（建议属性名 `data-ft-tip`，与任务书对齐；现网样板是 `.confide-ear-chrome__tip` / `.transition-moment-trigger__tip`）。

发现性脉冲的文案、圆点 tier、互斥仍以 `ONBOARDING_HINTS.md` + `onboardingHintRegistry.js` 为 SSOT。本文件不重开一套 auto-tip 喷洒。

---

## 二、分层决策（配哪种信号）

按从上到下第一条命中执行：

1. **国际通用、无歧义的系统控件**（关闭 ×、返回箭头、对话框主按钮上已写「发送 / 关闭 / 知道了」）→ **只保留可见文字或通用图标**；不加 tooltip，不加脉冲。
2. **可见 Label 已经说清具体行为**（菜单行「Journey Log」、Support FAB 旁已有「Support Yin」、Compass 卡上五个时刻名）→ **维持 Label**；不要再加同义 tooltip。仅当 Label 过短、行为有隐藏代价（会扣时长、会发网络、会关会话）时，才加一条**补充细节**的 tooltip。
3. **图标按钮 / 抽象符号 / 只有图没有字**（Home 三球、地球仪、时钟、音符、⋯、PiP、倾听耳）→ **必须**有查询层：桌面自绘 tooltip；触屏见 §五。
4. **全新或很少被点到的入口，且用户可能根本没看见** → **脉冲点**（走既有 hint registry `triggerMode: click`）。可以叠加 §3 的 tooltip。不要为「解释用途」单独发明第二种脉冲颜色，除非产品书面批准（钢蓝 discovery dot 宿主表目前为空，勿复活死点）。
5. **首次使用、必须在用户动手前说一句**（额头摸头、Recover 幽灵句）→ **一次发现气泡 / 常驻幽灵 hint**，不是 hover tooltip，也不进 mint 喷洒池。

**我认为最合理的落地顺序（实现阶段，非本轮）：**先做 §3 图标入口的原生 `title` → 自绘 tip 迁移（Home 三球 + 窄屏倾诉钮与宽屏倾听耳对齐），再扫 §4 脉冲与 tooltip 叠床架屋的去重；不要先降延迟、也不要先给所有文字按钮补 tip。

---

## 三、悬停 tip 实现约定（目标态）

| 项 | 约定 |
|---|---|
| 载体 | `data-ft-tip`（或等价的子节点 `role="tooltip"`）。禁止 `element.title =` / `setAttribute('title')` 用于用途说明。 |
| 出现时机 | 悬停约 **120ms 后再淡入**（`transition-delay` 或等价）。**不建议默认 80ms**：120ms 已低于常见「卡顿」阈值；再短则划过一排图标时容易乱闪。若用户反馈仍慢，再单独立项，不要当默认。 |
| 淡入时长 | 约 140–180ms opacity。现网倾听耳 180ms、Transition 140ms——实现时应收成同一 token，避免第三套观感。 |
| 文案 | 走 `t()` / locale 键；禁止硬编码一句。长度建议 ≤ 40 字（中）/ ≤ 8 词（英）；不是第二段说明书。 |
| 与脉冲去重 | 脉冲 / host-hover 气泡已占用同一句时，**摘掉**自绘 tip（现网 `_syncPulseOwnedNativeTips` 已对 `title` 做这件事；迁到 `data-ft-tip` 后应对同一属性做备份/恢复）。 |
| `document.title` | **豁免**（浏览器标签名，不是控件 tip）。 |
| 标题节点 | `createElement('h2')` / `.title` 班级名 **豁免**（可见标题，不是 `title` 属性）。 |

视觉：优先沿用倾听耳的玻璃胶囊（浅底、随控件升起），不要再复制 Transition 入口那套深色小条——除非该入口明确要「更克制、更淡」。产品若拍板「全站一种皮肤」，以倾听耳为准。

---

## 四、脉冲点（发现性）约定

- **谁能画点**：只允许 `OnboardingHintsUI` + `syncSecondaryMenuHintDot` / `has-hint-mint` / registry `click` 宿主。`HINT_DISCOVERY_DOT_HOSTS` 目前是空表，**保持空**，除非另拍板。
- **Home 左球（Quick Start）**：现网政策是「不画 mint、只留 hover 残句」（2026-08-11）。迁 tip 时 **维持无脉冲**，只换掉慢的原生 `title`。
- **Focus HUD 金环 / 进度条 / 近日同坐**：现网政策是「不画浮动 mint，悬停宿主出 hint 文案」（2026-08-15）。迁 tip 后仍 **不要**加脉冲。
- **消失**：`simple` = 看过文案后静止弱化，相关操作完成后移除；`detailed` = 进详情才移除。不要让「悬停过一次」误标成永久 done，除非 registry 已如此定义。
- **禁止**为「看起来统一」给 Sit / 文字菜单行加 mint。

---

## 五、触屏 fallback

现网：

- 倾听耳：`(hover: none)` 只提高图标不透明度，**并不**点击出字。
- Home 三球：原生 `title` 在 iOS 上通常要长按，且不可靠。
- Onboarding mint：click 圆点本身可点（这是发现性，不是 query tooltip）。

目标规则：

1. 有清晰可见 Label → 触屏 **不必**再出 tip。
2. 图标按钮 → **点击切换**出/收自绘 tip（短文案），或第一次点击出 tip、第二次才执行动作——须按入口危险程度单独立项，**默认采用「点一下出 tip、再点执行」仅用于不可逆操作**；普通入口用「点一下同时出 tip 并执行」会挡操作，**不合理**。
3. **我认为最合理的默认**：图标入口在触屏上 **执行点击动作**，同时把 tip 做成 **短时 toast / 贴边一句**（约 1.2s）仅第一次；之后不再挡手。与现有 `idleYinTap` 一次发现句同类，但文案更短。
4. 与 `idleHomeCtaTip.js`「触屏完全不显示 hover tip」一致的部分：**禁止**在触屏上挂悬停才能看见的唯一说明。

---

## 六、原生 `title` 禁用 · lint 建议（本轮不实现）

可选静态检查（实现阶段再挂 `docs:check` / CI）：

```bash
# 控件用途 title（应为空或仅命中白名单）
rg -n --glob '*.js' -e '\.title\s*=' -e "setAttribute\(['\"]title['\"]" \
  focus-tiger/src focus-tiger/ui-kit focus-tiger/desktop
```

建议白名单：

- `document.title`
- 测试里读 `.title` 文本节点 / `id === 'title…'`
- `createElement` 后赋给 **可见标题元素变量**（须人审；机器可用「变量名 `titleEl` / 班级含 `__title`」粗滤）

更稳的做法：ESLint `no-restricted-syntax` 禁止 `AssignmentExpression` 到 `.title`，允许 `document.title`。本轮只记录，不写规则文件。

---

## 七、与已有审计线的边界

| 主题 | 本文件是否管 | 交叉引用 |
|---|---|---|
| Confide 口头芯片 / observation 桶 | 否（芯片已有可见文字） | `confide-observation-honesty-bucket-audit.md` |
| 冷启动第一幕入口仲裁 | 否 | `cold-start-first-scene-audit-inventory.md`（E11 额头句 = 一次发现气泡） |
| Hint 接线 / mint / purpose 卡 | 发现性仍归那边；本文件只规定 **残句 hover 与 title 禁用** | `HINTS_WIRING.md` |

改本草案的语义前，实现 PR 仍须对照 `FEATURE_CONFLICT_REVIEW.md`：新 tip 不得比 Recover / Confide 更重，不得把阿寅说成监工。
