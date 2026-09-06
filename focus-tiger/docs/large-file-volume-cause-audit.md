# 大文件体积成因分类（只读）

日期：2026-09-06  
基线：`origin/develop` tip（当时 `b841382d`）  
范围：`focus-tiger/src` 中 ≥1000 行的 9 个文件；深读两个 ≥3000 行文件。  
方法：行数 / 注释密度 / CSS-in-JS 模板跨度 / 顶层函数边界 / 片段读。**不是** knip 全仓死代码扫描。  
地位：技术债证据。不改运行时。不授权清理或拆文件。

四类口径：

| 类 | 含义 | 处理方式 |
|---|---|---|
| 活编排 | 仍在 boot / 交互 / 样式注入路径上 | 保持；若动，只能择机拆分 |
| 重复逻辑 | 双保险 sync、宽窄 remap 孪生 | 不算垃圾；合并须证明行为不变 |
| 残留 | 未接线、注释坟、永久开关的死分支 | 才是可删候选 |
| 故意兜底 | 低覆盖率的冻结 / 忙碌 suppress / DEV·e2e 探针 | **禁止当垃圾删** |

百分比是人工分段，允许 ±5 点误差。兜底往往嵌在活路径里，单列时从「活编排」里划出观感份额，不表示另有一整块可删文件。

---

## 仓库尖端（复述）

`src`：约 560 文件。≥400 行 64 个。≥1000 行 **9** 个。≥3000 行 **2** 个。

启发式：9 个文件里「看起来像被注释掉的代码」均为 **0 行**。体积不是注释坟场。

---

## `src/main.js`（4622 行）

顶层几乎只有 `init()`：约 473–4618 行（**约 4146 行 / 90%**）。其余是短工具函数 + import。

| 类 | 约占比 | 依据 |
|---|---|---|
| 活编排 | **~90%** | locale、2D sprite、HUD、Idle chrome、Honesty、Breath、overlay 仲裁、Arrival、locale 切换、e2e 桥、heatmap / 备份 flush 全焊在 `init()` |
| 重复逻辑 | **~4%** | 注释已标明的双保险（如 FocusCoins `onShown` 后再 sync） |
| 残留 | **&lt;1%** | 无成段注释代码。`EyeTracking 已废弃` 是说明，实现已不在本文件 |
| 故意兜底 | **~5%** | overlay busy / suppress、深夜 DORMANT、欢迎打断后信使补播、DEV `window.__*` 与 vite preview e2e 桥（`__honestyBridge` 等） |

**结论：** 复杂度债（职责堆叠在一个 `init()`）。**没有**值得开清理 PR 的垃圾块。拆 `init()` 等于重写 boot 契约，回归面极大，不得与功能线混做。

---

## `src/ui/OnboardingHintsUI.js`（3407 行）

| 类 | 约占比 | 依据 |
|---|---|---|
| 活编排 | **~70%** | 自动 hint、mint 点、气泡定位、Purpose / Privacy / Wellness 卡、`showRemedy()` 现为打开产品简介（旧名仍被调用） |
| 其中 CSS-in-JS | **~20%**（计入活编排） | `_injectHelpStyles` 约 2724–3404 行（~675 行）。仍注入 `onboarding-hint-styles-v2` |
| 重复逻辑 | **~8%** | 宽屏 / 窄屏 park 锚点 remap 孪生（`remapNarrowIdleHintAnchor` / `remapWideIdleHintAnchor`） |
| 残留 | **&lt;1%** | `_syncHelpBadge`（约 6 行）仍被 `clearSeen` 调用，但 `this.helpBadge` **从未赋值**，方法恒早退。朱砂 `?` 徽章已不用 |
| 故意兜底 | **~2%** | 窄屏 park 后把锚点改到 ActionBar / grabber——看起来像「legacy chrome」，实际是现网窄屏契约 |

**结论：** 主因是 hint 状态机 + 内联 CSS，不是垃圾。唯一可删级残留是徽章死引用（个位数行）。抽出 CSS 或拆 Purpose/Privacy 卡属于拆分，不是清理。

---

## 其余 ≥1000 行（浅表）

| 文件 | 行数 | CSS-in-JS | 主因 | 垃圾？ |
|---|---|---|---|---|
| `ui/NarrowIdleShell.js` | 1699 | ~40% | 窄屏壳 + 大段样式；「legacy chrome」注释指 **隐藏** 旧 Sit/dock，不是死代码 | 否 |
| `ui/AmbientSoundscapeUI.js` | 1640 | ~32% | 面板渲染 + 样式 | 否 |
| `core/EmotionController.js` | 1564 | 0 | 构造器接线 + `createDebugUI`（实验室试播，含「暂时停接线」的欢迎/挥手入口——**故意不挂产品路径**） | 否（调试面板不是产品垃圾） |
| `ui/ConfideToYinUI.js` | ~1369–1387 | ~18% | Confide 壳 + 样式 | 否 |
| `audio/AmbientSoundscapeController.js` | 1190 | 0 | 播放状态机；块注释偏多（~18%）是契约说明 | 否 |
| `ui/WideIdleMoreMenu.js` | 1160 | ~28% | 宽屏 ⋯ 菜单 + 样式 | 否 |
| `ui/SupportYinModalUI.js` | 1050 | ~29% | 付费卡 + 样式。`.yin-support-card__cta--cushion/--primary` 注释写 Unused fallback，约数十行 CSS | **唯一次要可删候选**（样式回退，须人工确认无 class 引用） |

跨文件模式：大量 UI 用 `_injectStyles()` 把 CSS 模板堆在 JS 末尾。这是**风格债 / 体积观感**，全仓抽 CSS 是另一次架构任务，禁止借「清理垃圾」顺手做。

---

## 总判

1. **「文件大 = 有垃圾」在本仓库不成立。** 两个超大文件 ≥85% 是活编排（含内联 CSS）。
2. **可删残留总量：可忽略**（Hints 徽章早退；Support 一小节未用 CTA 渐变——即便删也不改变「文件大」问题）。
3. **不要全仓 knip。** 忙碌 suppress、park 后 remap、DEV/e2e `window.__*`、Emotion 调试停接线，都会被标成未使用。
4. **下一步默认：不清理、不拆 `init()`。** 功能队列继续。若未来 `main.js` / Hints **频繁合并冲突**，再单独立项做拆分 Brief，且不得与 Quiet Line / YPE V2 / Confide 功能 PR 同线。

---

## 修订

- 2026-09-06：只读分类首版。无运行时改动。
