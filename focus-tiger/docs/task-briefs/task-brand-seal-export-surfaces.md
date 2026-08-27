# Task Brief · 品牌水印 · Slice 3（导出 footer）

> **状态**：**本支实现**  
> **分支**：`feature/brand-seal-export-surfaces`  
> **母 Brief**：`task-brand-yin-way-tagline.md`  
> **权威交叉**：`PRODUCT_POSITIONING.md` §品牌精神句 · `PRINCIPLES.md` 委婉身份印记

---

## 0. 一句话

把陈述版品牌句 `Walking the Yin Way.` 接到 **Quiet Line Save image** PNG footer；统一走 `resolveBrandYinWaySeal()`，替换旧 `DAILY_ZEN_QUOTE_IMAGE_FOOTER`。

---

## 1. 已拍板

| 项 | 决定 |
|---|---|
| **落点** | Daily Quote / Quiet Line 明信片导出（`saveDailyZenQuoteImage`） |
| **键** | `BRAND_YIN_WAY_SEAL`（句号、无问号） |
| **locale** | 跟用户 locale（**非**双语叠显） |
| **芥子印卡** | **本 Slice 不做**——尚无 save image 能力；有导出后再接同一 resolver |
| **不做** | MilestoneGlow 海报 · 新 Landing · mindfulness scroll export（Backlog） |

---

## 2. 冲突扫描

| 轴 | 结论 |
|---|---|
| **强度** | 明信片底栏静默一行 · 不挡 Save / Not now · **无冲突** |
| **语气** | 陈述身份印记 · 非 Buy now · **无冲突** |
| **职责** | 仅导出图 footer · 与 Reflection echo / Sanctuary 无关 · **无冲突** |

---

## 3. 实现

- `src/core/brandYinWaySeal.js` — `resolveBrandYinWaySeal({ t })`
- `dailyZenQuote.js` — `saveDailyZenQuoteImage` / canvas 默认 fallback
- 移除 `DAILY_ZEN_QUOTE_IMAGE_FOOTER`（三语字典）
- `zh.json` seal 定稿：`體驗寅之道。 · Focus Tiger`

---

## 4. 验收

1. Idle → Quiet Line → Save image → PNG 底栏见 **Walking the Yin Way. · Focus Tiger**（en）或 **寅の道を歩む。 · Focus Tiger**（ja）。
2. 切换 locale 后另存一张，footer 随 locale。
3. 明信片布局、日期落款、上图下字 **不变**。
4. `npm run test:smoke` 绿。

---

## 5. TEST_TRACKER

见 `docs/tracker-entries/feature-brand-seal-export-surfaces.md`。
