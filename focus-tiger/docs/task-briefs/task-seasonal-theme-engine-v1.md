# Task Brief · 通用节日主题引擎（Seasonal Theme Engine）v1

> **状态（2026-08-11）**：**Phase 1 已通过（分析师书面）**；四点非阻塞建议已吸收进下文。**Phase 2 已授权开工**（引擎骨架 + 圣诞节配置；总开关关 / `contentReady: false`）。  
> **触发**：根目录 Prompt `cursor-prompt-seasonal-theme-engine.md`；产品侧拍板——节日主题属 **B 轨付费解锁**（Sanctuary Lifetime ∪ Yin Membership）。  
> **权威**：本 Brief（引擎 schema / 门闩 / 分期）+ `FREE_PAID_MATRIX.md` + `MVP_PRODUCT_DEFINITION.md` §五 + `task-tech-direction-v1-shell-monetization.md`。

---

## 0. 一句话

在节日窗口内，为**已解锁 B 轨**的用户自动切换 App **内部**装饰（姿态/皮肤、背景、文案池等），**不**依赖用户重装 App；引擎通用，圣诞节只是首个配置实例。

---

## 1. 产品归属（硬 · 付费）

| 项 | 口径 |
|---|---|
| 商业轨 | **B · 进阶内容解锁**（**不是** A Tip；**禁止** tip 解锁节日主题） |
| 付费方式 | **Sanctuary Lifetime** ∪ **Yin Membership**；`lifetime ∪ subscription` **互相覆盖** |
| Catalog 建议 key | `theme.seasonal.access`（字面 `requiredTier: 'subscription'` / `type: 'ongoing'`） |
| 产品档位写表 | `lifetime∪subscription`（与矩阵其它 B 项一致） |
| 到期降级 | **ongoing**：订阅失效（含宽限结束）→ **立即停**节日主题应用，回默认主题；**不**把「当年已看过的节日皮肤」做成 persistent ownership（节日是时段氛围，不是纪念物） |
| 免费用户 | **不**应用节日主题叠层；核心 Sit / Arrival / Idle / Honesty / 每日庆祝 **仍完整可用**（免费底线） |
| 营销 CTA | **本期不做**节日窗口内的付费转化弹窗；未购用户保持默认体验，锁项处仍走既有 Support / Unlock 卡（若日后要节日 CTA，另 Brief） |

配置字段 `subscriberOnly`：**本期官方节日一律 `true`**。保留布尔是为引擎通用性；**禁止**在未另开产品评审前把官方节日改成免费。

---

## 2. 硬限制与明确不做

### 2.1 已知硬限制

- **PWA 主屏幕图标**由系统缓存，**无法**经本方案远程更换。本引擎覆盖范围 = **App 内部运行时渲染**（UI 装饰、姿态/皮肤、文案、背景等）。须在对外口径与验收中写清，避免误解为「主屏幕图标也会变」。

### 2.2 本期不做

- 主屏幕图标远程更新  
- 运行时 AI / LLM 生成节日文案或图像  
- 用户自定义节日  
- 节日窗口付费转化弹窗 / FOMO 倒计时 / 稀缺营销  
- 为单一节日写引擎 `if (id === 'christmas')` 专支  
- 用 tip / 连续练习 / 断签解锁节日主题  
- 把免费底线路径（Sit / Arrival / 基础 Idle 等）做成节日付费墙  

---

## 3. 架构总览

```
seasonalCalendar (配置表)
        │
        ▼
 DateRule 解析 → 今年锚点日 (timezone 本地日历日)
        │
        ▼
 窗口判定 (before/after) + region 过滤 + priority 择优
        │
        ▼
 双闸可见性 (内容就绪 ∧ 总开关 ∧ 单季开关)
        │
        ▼
 isEntitled('theme.seasonal.access')   ← B 轨 ongoing
        │
        ▼
 加载 assets（poses / background / copyPoolId）→ 消费侧应用
```

**引擎代码职责**：读配置 → 解析 `dateRule` → 判窗口 → 门闩 → entitlement → 暴露「当前生效主题」。  
**禁止**：按节日 id 写业务分支；新增节日 = 新配置行 + 素材 +（若需要）文案桶人审。

---

## 4. 数据结构（TS · Phase 1 定稿）

### 4.1 DateRule（discriminated union）

```ts
/** weekday: 0=Sun … 6=Sat（与 JS getDay 对齐） */
export type DateRule =
  | { type: 'fixed'; month: number; day: number }
  | { type: 'nth-weekday'; month: number; weekday: number; n: number }
  | { type: 'solar-term'; termId: SolarTermId }
  | { type: 'lookup-table'; datesByYear: Record<number, string> }; // ISO 'YYYY-MM-DD'

/** 本期强制支持的节气 id（其余 20 个后评） */
export type SolarTermId =
  | 'chunfen'  // 春分
  | 'xiazhi'   // 夏至
  | 'qiufen'   // 秋分
  | 'dongzhi'; // 冬至
```

`solar-term` 解析：查预置表 `solarTermDatesByYear[termId][year]`（ISO 日）；缺年则该节气当年不触发（不得 silent 猜日期）。

**查表年限（硬 · 与复活节同等）**：`solar-term` 预置表与 `lookup-table` **同样须预填未来 ≥10 年**（自发版当年起算）。表将用尽属同类风险——不得等到「某年突然不触发」才发现。

**开发期提醒（Phase 2+）**：实现时须有可测的「查表 horizon」检查（单测断言各表最远年份 ≥ 今天+10y；可选 CI / `npm run check:…`）。表剩余不足 3 年时测试或检查须失败或醒目警告，避免节日「消失」无人知。

### 4.2 SeasonConfig

```ts
export type SeasonAssets = {
  poses?: string[];       // EmotionController / manifest 序列 id
  background?: string;    // 背景资源键或路径（ASCII kebab）
  copyPoolId?: string;    // 人审语料桶 id，如 'christmas'
};

export type SeasonConfig = {
  id: string;             // 稳定 id，不绑年份：'christmas' | 'thanksgiving-us' …
  nameKey: string;        // i18n 键；禁止业务里硬编码展示名
  dateRule: DateRule;
  windowDaysBefore: number;
  windowDaysAfter: number;
  /** 缺省 = 全球；有值则仅当用户 region 命中才进入候选 */
  regions?: string[];     // BCP-47 region 或产品约定码：'US' | 'CA' | 'GB' …
  timezone: string;       // IANA，如 'America/New_York'；窗口按此时区日历日裁切
  priority: number;       // 越大越优先；重叠时取唯一赢家
  assets: SeasonAssets;
  /** 本期官方节日一律 true（B 轨） */
  subscriberOnly: boolean;
  /**
   * 内容闸：素材+文案人审未 ok 时 false。
   * 与总开关独立——内容好了也不自动对真实用户放出。
   */
  contentReady: boolean;
};
```

### 4.3 引擎输出

```ts
export type ActiveSeasonalTheme = {
  seasonId: string;
  anchorDateIso: string;  // 该年节日锚点日
  windowStartIso: string;
  windowEndIso: string;
  assets: SeasonAssets;
} | null;
```

建议配置落点（实现阶段）：`src/core/seasonal/seasonalCalendar.js`（或 `.ts`）+ `solarTermLookup.js`；**只读静态模块**，首版可不依赖远端 JSON（远端热更属后续；见 §8 缓存）。

---

## 5. 判定逻辑

### 5.1 锚点日

| `dateRule.type` | 算法 |
|---|---|
| `fixed` | 当年 `month/day`（若 2/29 且非闰年 → 该年跳过） |
| `nth-weekday` | 该月第 `n` 个 `weekday`；`n=-1` 可表示「最后一个」（若实现需要再扩展；首版母亲节/父亲节用正 `n` 即可） |
| `solar-term` | 查表 |
| `lookup-table` | `datesByYear[year]`；缺年 → 跳过 |

全部在配置的 `timezone` 下用**日历日**比较，避免「UTC 午夜导致提前一天」。

### 5.2 窗口

`windowStart = anchor − windowDaysBefore`（含）  
`windowEnd = anchor + windowDaysAfter`（含）  
**裁切规则（硬）**：每条配置自带的 `timezone` 决定该节日的日历日窗口；**不是**「用用户设备本地时区重算锚点日」。用户是否看到再叠加 `regions`（§5.3）。实现须单测锁住「配置 timezone 裁切」。

### 5.2.1 全球节日的默认 timezone（产品决定 · 硬）

无天然单一地区归属的**全球商业/文化节日**（例：圣诞节、元旦、跨年夜、情人节、万圣节、复活节 Western）统一默认：

| 项 | 口径 |
|---|---|
| **默认 IANA** | **`America/New_York`（美东）** |
| **为什么** | 产品以北美英文市场为全球窗口锚点，避免每人随手选 UTC / 伦敦 / 上海导致配置表不一致；美东相对 UTC 有明确冬夏令，比「裸 UTC 日期」更接近北美用户体感「节日当天」 |
| **谁必须用默认** | `regions` **缺省**（全球）的条目；新增全球节日**禁止**另起炉灶选别的默认时区，除非书面改本 Brief |
| **谁不用默认** | 带 `regions` 的地区节日：用该地区主流民用时区（例：`thanksgiving-us` → `America/New_York`；`thanksgiving-ca` → `America/Toronto`；节气 `chunfen` 等 → `Asia/Shanghai`） |

§11 示例里圣诞节的 `America/New_York` **就是在执行本条**，不是随手示例。

### 5.3 地区差异（显式建模）

**禁止**假设父亲节/母亲节/感恩节全球同日。

| 做法 | 例 |
|---|---|
| **拆成两条配置**（推荐） | `thanksgiving-us`（11 月第 4 周四，`regions: ['US']`）与 `thanksgiving-ca`（10 月第 2 周一，`regions: ['CA']`） |
| 同 id 多 region | **不采用**（难读 priority / 素材） |

用户 region 来源（实现阶段定一种并锁测）：

1. 显式偏好（若已有 locale/region 设置）  
2. 否则 `Intl` / `navigator.language` 的 region 子标签  
3. 再否则视为「无 region」→ **仅**匹配 `regions` 缺省（全球）的配置；带 `regions` 的条目不命中  

### 5.4 多节日重叠

1. 过滤：窗口内 ∧ region 命中 ∧ `contentReady` ∧（若 `subscriberOnly` 则 entitled）  
2. 在候选中取 **`priority` 最大** 的唯一一条  
3. `priority` 并列 → 取配置表**稳定排序**靠前的一条（实现用数组序），并在单测锁定；**禁止**未定义行为  

### 5.4.1 Priority 分档约定（Phase 4 批量接入前须遵守；Phase 2 起就按此填）

| 分档 | 数值带 | 用途 | 例 |
|---|---|---|---|
| 全球高曝光商业节日 | **100–109** | 全球窗、素材投入最高 | 圣诞节 `100` |
| 地区性国定 / 法定节日 | **90–99** | 带 `regions` 的感恩节等 | `thanksgiving-us` / `ca` → `90` |
| 亲情向固定窗（母/父等） | **80–89** | 母亲节、父亲节（按 region 拆行） | `mothers-day-us` → `80` |
| 其它全球节庆（占位） | **70–79** | 元旦、跨年、万圣、情人、复活等 | 预留；同档内用表序打平 |
| 节气 / 换季锚点 | **30–49** | `solar-term` 四至 | 春分等 → `40` 一带 |
| 实验 / 临时活动 | **1–29** | 须另 Brief；默认不用 | — |

**规则**：同档内允许相同 `priority`（靠数组稳定序）；**禁止**跨档乱跳（例如把节气写成 `95`）。Phase 4 批量加节日前若要改分档，先改本表再改配置。

### 5.5 复活节等 lookup-table · 库选型

| 方案 | 结论 |
|---|---|
| 自研天文（春分+满月） | **不做** |
| npm 日期库（如 `date-easter` / `date-holidays`） | **可选**；引入须过依赖审查，且须可离线 |
| **查表 `datesByYear`（推荐首版）** | 预填未来 ≥10 年 Western Easter ISO 日；零运行时天文依赖；与 v1.0 纯本地友好 |

**本期建议**：复活节配置行可进表，但 `contentReady: false` + 无素材；日期用 lookup-table。是否引入计算库留到「要自动续表」时再评。

`solar-term` 查表年限与 horizon 提醒见 §4.1——与本条 **同等要求**，不因「节气几乎固定」而省略预填。

---

## 6. 门闩（对照 Confide 双闸）

Confide：`isConfideSafetyCorpusOk` ∧ `CONFIDE_USER_MOUNT_ENABLED`（见 `confideUserVisibilityGate.js`）。

节日引擎建议同等拆分：

| 闸 | 含义 | 默认 |
|---|---|---|
| **内容就绪** | 该 `seasonId` 的 `contentReady === true`（素材+文案人审 ok） | 圣诞节首版 `false` 直至人审 |
| **产品总开关** | `SEASONAL_THEME_USER_ENABLED`（全局一键关） | Phase 2/3 前保持 `false` |
| **单季开关**（可选） | `isSeasonKillSwitched(seasonId)` | 默认放行；事故时关单季 |
| **B entitlement** | `isEntitled('theme.seasonal.access')` | 未购 → 不应用主题 |
| **日历窗口** | §5 | — |

```ts
// 语义草稿（实现阶段落文件）
function isSeasonalThemeVisible(seasonId: string, ctx): boolean {
  return (
    SEASONAL_THEME_USER_ENABLED === true &&
    !isSeasonKillSwitched(seasonId) &&
    getSeason(seasonId)?.contentReady === true &&
    isSeasonInWindow(seasonId, ctx) &&
    (!getSeason(seasonId).subscriberOnly || isEntitled('theme.seasonal.access'))
  );
}
```

**订阅状态时序（硬）**：

- 判定主题**每次**读 live entitlement（ongoing），禁止只在冷启动缓存「已订阅」却忽略退订  
- 退订 / 到期（宽限后）：下一帧或下一 tick **撤主题**，回默认；**禁止**「刚退订还能看完整个节日窗」的静默宽限（与仪式 history persistent 不同）  
- 新订：同一次会话内 entitlement 生效后，若仍在窗口且双闸开，**应能立刻**应用主题（勿要求杀进程）  
- 未 entitled 时控件若展示「节日预览锁」须走既有 Unlock UI；**禁止**可点却 `return` 无反馈  

QA harness（可选，仿 `?confide=1`）：`?seasonal=christmas` 仅开发/预览，**不**等于对真实用户可见。

---

## 7. 文案原则

沿用 Confide「检索不生成」：

- 人工撰写；过观察式四条（说教 / 留白 / 越界 / 节奏）  
- **禁止**运行时 LLM 生成节日句  
- 独立语料桶（如 `christmas`），人审 `ok` 后 `contentReady` 才可翻真  
- 对外句子走 `src/locales` + `t` / `tPool`  

---

## 8. 缓存与更新时效

| 层 | 策略（首版建议） |
|---|---|
| 配置 + 查表 | 打进 JS bundle；发版即更新 |
| 图片 / 序列帧 | 与现有 `public/` + Vite 指纹一致 |
| Service Worker | 对齐现有 PWA 策略（当前偏 network-first / 发版换 SW）；**不**为本功能单开长期 Cache Storage 锁死旧主题 |

**可测验收口径**：

1. 用户不重装、不「清站点数据」  
2. 部署含新节日配置的 build 后：关闭已打开的 PWA/页 → 再开（或硬刷新一次）  
3. **期望**：最长在「下次完整冷启动 / 受控刷新」后见到新配置；若 SW 仍侍旧壳，记入 TRACKER 与 PWA 更新行对齐修  

**开发验收**：用调试时钟 / `?mockDate=YYYY-MM-DD`（实现阶段提供）把「今天」拨进窗口，**无需**改系统时间也能测（Safari 改系统时间作补充，不作为唯一手段）。

主屏幕图标不变 = **通过**（硬限制），不得记缺陷。

---

## 9. 本期接入范围

### 9.1 Schema 必须能装下（配置可占位）

欧美通用：元旦、情人节、复活节、母亲节（美系）、父亲节（美系）、万圣节、感恩节（US/CA 拆行）、圣诞节、跨年夜。  
节气：春分 / 夏至 / 秋分 / 冬至（`solar-term` + 查表）。

### 9.1.1 情人节内容调性（产品开放项 · 非工程阻塞）

Schema **可以**装情人节；**不等于**已批准「浪漫恋爱」叙事。阿寅人设是禅意倾听者 / 茶友——更贴近「重逢 / 珍惜当下」等中性温情，而非恋爱氛围。

**处理**：Phase 2/3 **不做**情人节素材。Phase 4 若做情人节，须单独过一遍观察式四条（与 Confide 语料同流程）+ 「是否够阿寅」人设审，通过后再 `contentReady: true`。未审前配置可占位且 `contentReady: false`。

### 9.2 Phase 分界

| Phase | 交付 | 门闩 |
|---|---|---|
| **1** | 本 Brief + 矩阵/PROCESS/MVP 同步 | **已通过（2026-08-11）** |
| **2** | 引擎骨架 + catalog key + 圣诞节配置行；素材/文案占位 | 总开关 **关**；`contentReady: false`；**已授权开工** |
| **3** | 圣诞节素材+文案人审 ok；验收清单；翻开关小范围/全量 | 总开关按发布节奏 |
| **4** | 其它节日仅加配置+素材；补 priority 分档实操；情人节调性审 | 理论上零引擎改动 |

其余 20 节气：**不**纳入本期强制交付。

---

## 10. 与现有模块的接线面（Phase 2+）

| 面 | 注意 |
|---|---|
| `FEATURE_CATALOG` | 新增 `theme.seasonal.access` |
| `FREE_PAID_MATRIX` | A3 增行（本回合文档已预登记） |
| `EmotionController` / manifest | 节日 poses 走既有 `playEmotion`；遵守 CapCut 叠代与 Idle 呼吸契约 |
| Ambient / 背景 | 节日背景不得破坏免费用户默认场；未 entitled 不换 |
| Confide | 文案桶模式可类比；**门闩文件分立**，勿塞进 confide 模块 |
| tipJar | **零耦合**（Brief §2.6） |
| 核心路径 | 节日主题失败 / 未加载 → 静默默认主题，**禁止**挡 Sit |

**已好清单（实现开工时须抄进 Task 回复）**：

1. 未购用户：默认 Idle 呼吸→眨眼不闪、Sit/Arrival 完整  
2. 已购用户非节日窗：与今日无异  
3. tip 不能解锁主题  
4. 序列切换仍 CapCut，禁止闪切  

---

## 11. 建议配置表示例（节选 · 非最终素材）

```ts
[
  {
    id: 'christmas',
    nameKey: 'SEASON_CHRISTMAS',
    dateRule: { type: 'fixed', month: 12, day: 25 },
    windowDaysBefore: 7,
    windowDaysAfter: 1,
    timezone: 'America/New_York',
    priority: 100,
    assets: { poses: [], background: undefined, copyPoolId: 'christmas' },
    subscriberOnly: true,
    contentReady: false
  },
  {
    id: 'thanksgiving-us',
    nameKey: 'SEASON_THANKSGIVING_US',
    dateRule: { type: 'nth-weekday', month: 11, weekday: 4, n: 4 },
    windowDaysBefore: 2,
    windowDaysAfter: 0,
    regions: ['US'],
    timezone: 'America/New_York',
    priority: 90,
    assets: {},
    subscriberOnly: true,
    contentReady: false
  },
  {
    id: 'thanksgiving-ca',
    nameKey: 'SEASON_THANKSGIVING_CA',
    dateRule: { type: 'nth-weekday', month: 10, weekday: 1, n: 2 },
    windowDaysBefore: 2,
    windowDaysAfter: 0,
    regions: ['CA'],
    timezone: 'America/Toronto',
    priority: 90,
    assets: {},
    subscriberOnly: true,
    contentReady: false
  },
  {
    id: 'mothers-day-us',
    nameKey: 'SEASON_MOTHERS_DAY',
    dateRule: { type: 'nth-weekday', month: 5, weekday: 0, n: 2 },
    windowDaysBefore: 3,
    windowDaysAfter: 0,
    regions: ['US', 'CA'],
    timezone: 'America/New_York',
    priority: 80,
    assets: {},
    subscriberOnly: true,
    contentReady: false
  },
  {
    id: 'chunfen',
    nameKey: 'SEASON_CHUNFEN',
    dateRule: { type: 'solar-term', termId: 'chunfen' },
    windowDaysBefore: 0,
    windowDaysAfter: 0,
    timezone: 'Asia/Shanghai',
    priority: 40,
    assets: {},
    subscriberOnly: true,
    contentReady: false
  }
]
```

英国 Mothering Sunday 等：若接入，**另开** `mothers-day-gb`（复活节相关 lookup），勿塞进美系行。

---

## 12. 验收清单（供 Phase 2/3 · 摘要）

- [ ] 未购：节日窗内 UI **无**节日主题；Sit 等核心路径正常  
- [ ] 已购（lifetime 或 membership）：窗内见主题；窗外回默认  
- [ ] 退订后（宽限结束）：主题停用  
- [ ] 感恩节 US vs CA 不串日  
- [ ] 两节日窗口重叠时只生效高 priority  
- [ ] 总开关 false → 任何人不可见（含已购）  
- [ ] `contentReady: false` → 不可见  
- [ ] 主屏幕图标不变（硬限制）  
- [ ] mockDate 可测，无需重装  
- [ ] 无节日专属 `if` 分支（代码审）  

---

## 13. 开工事宜 / worktree

| 阶段 | 分支建议 | 何时开 |
|---|---|---|
| Phase 1 | `docs/seasonal-theme-engine-v1` | **已完成并通过** |
| Phase 2+ | `feature/seasonal-theme-engine` **新 worktree** | **已授权（2026-08-11）**；总开关关 / `contentReady: false` |

开工口令：「按 `task-seasonal-theme-engine-v1` 开 Phase 2」（本轮已授权）。

---

## 14. 相关索引

- Prompt 源：`cursor-prompt-seasonal-theme-engine.md`（仓库根）  
- `FREE_PAID_MATRIX.md` · `MVP_PRODUCT_DEFINITION.md` §五  
- `task-tech-direction-v1-shell-monetization.md`  
- Confide 双闸：`src/core/confide/confideUserVisibilityGate.js`  
- Entitlement：`src/core/entitlement/entitlementRegistry.js`  
- `PROCESS.md` Backlog「节日主题引擎」  
