# Task Brief · 品牌精神句「Walking the Yin Way?」

> **状态**：Slice 1（C 轨珍藏 Header）**已合 #465**；Slice 2（首次完成 Reflect）**本支实现**；Slice 3（导出水印）**已拍板、未开工**  
> **分支**：`feature/brand-yin-way-first-reflect`  
> **权威交叉**：`PRODUCT_POSITIONING.md` · `FOCUS_COINS.md` §1（C 轨 = Yin's Collections，≠ Sanctuary）· `PRINCIPLES.md` 委婉身份印记 · `FLOWER_BLOW_WELCOME_DESIGN.md`（双语仅首次造访类）

---

## 0. 一句话

把「Walking the Yin Way? / 寅の道を歩む」定为**身份认同**品牌句——不是功能说明；先落在 **Yin's Collections** 珍藏抽屉 Header，后续再挂首次 Reflect 与导出 footer。

---

## 1. 已拍板（2026-08-27 · 用户书面）

| 项 | 决定 |
|---|---|
| **场景 1** | **采纳** · C 轨 `#yin-coin-panel` Header 副标；产品名仍 **Yin's Collections / 阿寅的珍藏**；**禁止**写 Sanctuary |
| **场景 2 落点** | **首次 `first_session_complete` 后 Reflect 底栏一次**（非 Landing / 非 Sit 按钮上方 Hero） |
| **双语策略** | **仅「首次造访类」** 同时显示 EN + `(寅の道を歩む)`；**其余跟 locale**（含场景 1 珍藏 Header） |
| **中文** | `zh.json` 备 **繁体**：`體驗寅之道嗎？`（draft，v1.0.0 对外仍 en/ja） |
| **陈述版水印** | 场景 3 用 `Walking the Yin Way.`（句号、无问号）· 另键 · Slice 3 |

---

## 2. 冲突扫描（`SCENARIO_TESTS`）

| 轴 | 相邻场景 | 结论 |
|---|---|---|
| **强度** | A 完成庆祝；D Honesty 桥接 | 珍藏为次级入口；副标不挡结缘 / 关闭 · **无冲突** |
| **语气** | 寅币「结缘」观察式；不制造焦虑 | 问句为邀请式认同，非督促进度 · **无冲突** |
| **职责** | B 轨 Sanctuary 付费卡；Support 三卡 | 命名与文案均避开 Sanctuary · **无冲突** |

---

## 3. 已好清单（Slice 1）

- 珍藏抽屉布局、玻璃族、z-index 18、220ms fade **不变**。
- 清供 8 行、底栏挥手 Play、not-for-sale 须知 **不变**。
- `isEntitled` / 寅币 ledger / Honesty 发点 **不碰**。
- 副标 **不**做成可点 CTA、**不**挡 `#yin-coin-close`。

**保护面**：场景 D 寅币结缘、Idle 菜单进珍藏、375 窄屏 sheet、locale 切换即时刷新。

---

## 4. 切片

| Slice | 分支 | 做 | 不做 |
|---|---|---|---|
| **1** | `feature/brand-yin-way-collections` | Brief + `BRAND_YIN_WAY_TAGLINE` + Header DOM/CSS + en/ja/zh 键 | Reflect / 导出 / Landing |
| **2** | `feature/brand-yin-way-first-reflect` | 首次完成 Reflect 底栏；`resolveBrandYinWayTagline({ bilingualFirstVisit: true })`；本地一次性门闩 | 重复弹、大版本 splash |
| **3** | `feature/brand-seal-export-surfaces` | `BRAND_YIN_WAY_SEAL` footer 组件 → Daily Quote / 芥子印卡 | MilestoneGlow 动画改海报 |

---

## 5. i18n 键（SSOT）

| 键 | en | ja | zh（繁体 · draft） |
|---|---|---|---|
| `BRAND_YIN_WAY_TAGLINE` | Walking the Yin Way? | 寅の道を歩む？ | 體驗寅之道嗎？ |
| `BRAND_YIN_WAY_TAGLINE_FIRST_VISIT_EN` | Walking the Yin Way? | （同 en · 双语主行） | （同 en · 双语主行） |
| `BRAND_YIN_WAY_TAGLINE_FIRST_VISIT_JA` | 寅の道を歩む | 寅の道を歩む | 寅の道を歩む |
| `BRAND_YIN_WAY_SEAL` | Walking the Yin Way. · Focus Tiger | （Slice 3 再定） | （Slice 3 再定） |

Slice 1 只接线 `BRAND_YIN_WAY_TAGLINE`；后三键先入字典供 Slice 2/3 使用。

---

## 6. Slice 1 验收

1. Idle → ⋯ → **Yin's Collections** → 标题下见品牌副标（en 或 ja 随 locale）。
2. 副标 **不**出现双语叠显（除非手动切到 Slice 2 路径）。
3. 375 窄屏：副标换行可读，不挤没关闭钮。
4. `npm run test:smoke` 绿；珍藏相关单测含 tagline 键与 `data-testid=yin-coin-brand-tagline`。

---

## 7. TEST_TRACKER

见 `docs/tracker-entries/feature-brand-yin-way-collections.md`。
