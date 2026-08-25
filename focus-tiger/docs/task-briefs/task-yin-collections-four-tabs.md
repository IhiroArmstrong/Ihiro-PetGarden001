# Task Brief · Yin's Collections 四页签壳（C 轨归档）

> **状态（2026-08-24）**：待排期 · L3 抽屉已合但**仅清供 8 商店单页**；本 Brief 补 **四页签导航壳**，内容分任务填入。  
> **权威**：`FOCUS_COINS.md` §7 · `task-focus-coins.md` L3。

---

## 四页签（顺序固定）

| 页签 | 对外名 | 首版内容任务 |
|---|---|---|
| 1 | 结缘点缀 | **已合** — 清供 8 商店（现 `#yin-coin-panel` 主体） |
| 2 | 陪伴称号 | **已部分合** — `title.*` equip；本壳统一 Tab |
| 3 | 记忆小册 | **`task-mindfulness-scroll-export.md`** |
| 4 | 勋章印记 | **`task-practice-imprint-badges.md`** |

---

## 一句话目标

在 `#yin-coin-panel` 内增加 **Tab 切换**（375 短底栏仍不挡三球），0–1s 按压 + 内容区切换；**不**改 Support 三卡、**不**增 B 轨 key。

---

## 范围

**做**：Tab UI + i18n + 路由 state（hash 或 data-tab）；结缘页迁移为 tab-1 默认。  
**不做**：一次塞满四页内容（各子 Brief 分 PR）。

**预估**：2–3 人日（纯壳 + 回归）。

**分支**：`feature/yin-collections-four-tabs`

---

## 排期

**先于** imprint / scroll 内容 PR，或与 imprint **同支**（推荐同支：壳 + 勋章印记首刀一起验收）。
