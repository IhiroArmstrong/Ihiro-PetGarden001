# Audit · 窄宽 Ambient / 音符按钮已修项对照

**日期**：2026-07-30 立表 · **2026-07-31 对照填表**（`origin/develop` tip 当时含 PR #50 三球 / #51 用户曲上传）  
**状态**：对照已填（**代码 + 既有自动化断言**；本回合未跑 Playwright——本机缺 Chromium 二进制，见文末）  
**背景**：宽屏音符相关修已多轮落地；用户曾反馈窄屏未全部对齐。Task 3 单代码线后，共享编排应减少分叉，但仍须**逐项对照** DOM / 代理路径。

**基线**：`origin/develop` @ 填表时 tip（含 #43 mint/Rise、#50 宽屏三球）。  
**方法**：读共享 controller / UI / `listSecondaryChromeEntries` + 盘点已有 e2e/unit；**不**把「待人工听感」标成已关单。

---

## 对照矩阵（宽屏已好 → 窄屏须同等）

| # | 契约 | 宽屏锚点 | 窄屏锚点 | 状态（2026-07-31 填） |
|---|---|---|---|---|
| 1 | 未读薄荷绿脉冲 | `.ambient-soundscape__mute.has-hint-mint` | `#ft-narrow-mute-btn` + 宿主 mint（remap） | ✅ **对齐（代码）** · 宽：`onboarding-remedy-contract` mint 用例；窄：ActionBar ♪ 代理同一 hint id，`OnboardingHintsUI` 绑 `#ft-narrow-mute-btn`。**人工**：两视口清空 hints 后一眼 |
| 2 | 桌面悬停出 tip | `_bindHostMintHover` on mute | 同绑 `#ft-narrow-mute-btn` | ✅ **对齐（代码+宽 e2e）** · 宽 hover 已锁；窄桌面少见，绑定对称。**缺口**：无独立 375 hover e2e（可接受） |
| 3 | 仅选曲清 mint；Rise 不清 | `onTrackChosen` → `markSeen`；Rise/完成路径无 `markSeen(ambient)` | 同左（共享 `main.js`） | ✅ **对齐（共享+宽 e2e）** · `onboarding-remedy-contract`「Rise must not clear」 |
| 4 | 点音符开 Soundscape 面板 | mute click → `openSoundPanelFromNote` | ActionBar ♪ → 同路径 | ✅ **对齐（双视口 e2e）** · 宽：`wide-idle-more-menu`；窄：`weekly-practice-heatmap`「ActionBar note opens」 |
| 5 | 有声再点 = 静音（非只关面板） | mute → `toggleFromUi` | 同左 | ⚠️ **逻辑有 · DOM e2e 薄** · unit：`toggleFromUi` / note-mute；**缺**「可闻→再点→不可闻」双视口 DOM 断言 |
| 6 | 静音后再开 = 续播偏好曲 | `unmute` + resume-on-open | 同左 | ⚠️ **逻辑有 · DOM e2e 薄** · unit：`note-mute sets resume-on-open`；**缺**面板再开自动续播的 Playwright |
| 7 | 菜单/抽屉无 Sound 行 | `listSecondaryChromeEntries` 注释显式排除 sound；⋯ e2e 无 Sound | drawer 同列表；♪ 在 ActionBar | ✅ **对齐（编排+e2e）** · 宽：`⋯ has no Sound or Honesty row`；窄：heatmap 断言无 Sound 行 |
| 8 | 开机不自动播 | opt-in；`startPreferredTrack` 不 autoplay | 同左 | ✅ **对齐（unit+宽 e2e）** · unit 多条 + `wide Idle: no ambient autoplay`；窄共享 controller |
| 9 | Rise / 达标结束停播 | `ambientSoundscape.endSession()` | 同左 | ✅ **对齐（共享代码）** · unit 有 endSession；**人工**听感仍建议抽测 |
| 10 | Focusing 下换曲可闻 | panel + play unlock | 同左 | ⚠️ **曾有用户反馈 · 未关** · TEST_TRACKER Ambient 行仍记 Focusing 选曲无声疑云；**缺** Focusing 换曲可闻的 DOM/可观测断言 |

### 已知无关本审计、另开修的既有红

| 项 | 说明 | 建议 |
|---|---|---|
| `375 micro ritual: Sit hidden…` / sit-button tip | breath 期间曾残留 `sit-button` tip（`beginMicroRitualChrome` 在 `startBreath` 前 sync） | **已修** · `fix/375-micro-ritual-sit-tip-and-drawer-mute`：`onBreathStart` 再 sync |
| `375 home: … drawer Soundscape` | `.ft-narrow-sheet-backdrop` 曾挡 `#ft-narrow-mute-btn`；部分用例用 `force: true` | **已修** · ActionBar z-index 高于 backdrop；♪ 先关抽屉；e2e 无 force |

（均曾在干净 develop 复现线索；**非** #43 引入。本填表未重跑确认红绿。）

---

## 自动化覆盖结论（回答「为什么像没完成」）

「部分」= **关键契约已有锚，但矩阵未铺满**，不是「完全没写测试」。

| 层 | Ambient 曲目 + 菜单 UX | 薄荷绿脉冲 |
|---|---|---|
| **已有** | controller unit（opt-in / mute / resume / endSession）；宽/窄开面板 e2e；⋯/抽屉无 Sound；开机不 autoplay | Rise 不清 mint；宽 hover tip；registry/store unit；部分 ? 补救 |
| **缺口（值得补）** | ⑤⑥「可闻↔静音↔续播」DOM；⑩ Focusing 换曲可闻；用户上传轨已有 `user-ambient-upload.spec.js` | peeked/done 圆点态；菜单行 `.ft-secondary-menu-hint-dot`；窄屏 mint 存续 |
| **不应强求全自动** | 真实听感 / 音量手感 | 脉冲动画帧率观感 |

**是否应推进完成？**  
**是，但按缺口优先级补「失败契约」**，不要追求 100% UI 脚本齐全。建议下一刀工程：先 ⑤⑥（静音/续播 DOM）+ ⑩（Focusing 换曲），再动抽屉 backdrop / micro-ritual tip 红。

---

## 建议下一步

1. ~~独立 WT 填本表~~ → **本回合已填**。  
2. 开 `fix/ambient-mute-resume-e2e`：锁 ⑤⑥（宽+375）。  
3. 开 `fix/ambient-focusing-track-audible`：锁 ⑩ + 复测 TEST_TRACKER Ambient「有问题」听感。  
4. 开 `fix/narrow-drawer-mute-hit` + `fix/micro-ritual-sit-tip`：清既有 375 红（去掉 `force: true` 依赖）。  
5. 宽屏三球：**代码+e2e 已合 #50**；关单仍待人工（见 TEST_TRACKER）。

---

## 本回合限制

- 未执行 `npx playwright install` / 未重跑相关 spec（环境缺 Chromium）。  
- 填表依据 = 当前 `develop` 源码 + 仓库内已有测试文件盘点。  
- 关单级听感 / 脉冲观感仍只认你在 `origin/develop` tip 上的人工结论。
