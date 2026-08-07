# Task Brief · 375 既有 e2e 红（micro-ritual Sit tip + 抽屉挡 ♪）

**日期**：2026-07-31  
**状态**：**已实现** · 分支 `fix/375-micro-ritual-sit-tip-and-drawer-mute`（待合 `develop`）  
**角色**：UI / Onboarding  
**来源**：`audit-narrow-wide-ambient-parity.md`「已知无关本审计、另开修的既有红」；干净 develop 曾复现线索。

---

## 一句话目标

清掉两条 375 Playwright 失败契约，去掉对 `force: true` / 静默遮挡的依赖。

---

## 项

| # | 失败契约 | 现象 | 建议方向 |
|---|---|---|---|
| A | `375 micro ritual: Sit hidden while breath…` | breath 期间仍见 `sit-button` tip | park/focusing 时不调度 sit auto tip；与 Sit chrome 隐藏对齐 |
| B | `375 home: … drawer Soundscape` | `.ft-narrow-sheet-backdrop` 挡 `#ft-narrow-mute-btn` | 抽屉开时 ♪ 仍可点，或点 ♪ 先关抽屉再开面板；**禁止**长期 `force: true` |

---

## 建议分支

`fix/375-micro-ritual-sit-tip-and-drawer-mute` · 独立 WT · 基线含 MilestoneGlow tip 后的 `origin/develop`。

---

## 验收

- `npm run test:e2e:changed --` 上述两 spec 绿（无 force 点击 ♪）  
- TEST_TRACKER / audit 表更新状态
