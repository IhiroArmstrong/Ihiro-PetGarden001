# Audit · 窄宽 Ambient / 音符按钮已修项对照

**日期**：2026-07-30  
**状态**：审计清单（对照用 · 逐项在独立 WT 上修）  
**背景**：宽屏音符相关修已多轮落地；用户反馈窄屏未全部对齐。Task 3 单代码线后，共享编排应减少分叉，但仍须**逐项对照** DOM / 代理路径。

**基线分支建议**：`origin/develop` tip（或合入 PR #43 后）· 独立 worktree · **禁止**在主仓与 i18n/其它会话共用。

---

## 对照矩阵（宽屏已好 → 窄屏须同等）

| # | 契约 | 宽屏锚点 | 窄屏锚点 | 状态（填） |
|---|---|---|---|---|
| 1 | 未读薄荷绿脉冲 | `.ambient-soundscape__mute.has-hint-mint` | `#ft-narrow-mute-btn` + `.ft-secondary-menu-hint-dot` | 用户：窄 OK；宽清 hints 后 OK |
| 2 | 桌面悬停出 tip | `_bindHostMintHover` on mute | 同绑 `#ft-narrow-mute-btn`（已在 PR #43） | 宽已修；窄桌面少见，仍须不回归 |
| 3 | 仅选曲清 mint；Rise 不清 | `main.js` 无 Rise `markSeen(ambient)` | 同左（共享） | PR #43 |
| 4 | 点音符开 Soundscape 面板 | mute click | ActionBar ♪ → proxy | 宽 OK；窄须复测 Focusing |
| 5 | 有声再点 = 静音（非只关面板） | mute toggle | 同左 | 待对照 |
| 6 | 静音后再开 = 续播偏好曲 | unmute path | 同左 | 待对照 |
| 7 | 菜单/抽屉无 Sound 行 | `wide-more` 无 `sound` | drawer 无 Sound；♪ 在 ActionBar | 待对照 |
| 8 | 开机不自动播 | opt-in | 同左 | 待对照 |
| 9 | Rise / 达标结束停播 | session end | 同左 | 待对照 |
| 10 | Focusing 下换曲可闻 | panel + play unlock | 同左 | 宽曾有问题；窄待对照 |

---

## 已知无关本审计、另开修的既有红

- `375 micro ritual`：breath 期间仍见 `sit-button` tip  
- `375 home drawer`：抽屉 backdrop 挡住 `#ft-narrow-mute-btn` 点击  

（均已在干净 develop 复现，非 PR #43 引入。）

---

## 建议下一步

1. 独立 WT + `fix/narrow-ambient-parity`（或合入 #43 后的 develop）。  
2. 按上表人工走 375 + ≥480，填「状态」列。  
3. 缺口补代码时：**共享路径优先改编排/controller**，禁止只在宽屏壳打补丁。  
4. 每修一项补 e2e 或更新本表 + `TEST_TRACKER`。
