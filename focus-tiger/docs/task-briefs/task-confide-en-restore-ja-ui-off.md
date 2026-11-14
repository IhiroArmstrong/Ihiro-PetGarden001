# Task Brief · First-ship Confide: English on, Japanese UI off

> **Class:** B (user-visible Confide chrome and open routing).  
> **Status:** PO locked 2026-11-14 in-session (“立刻开工，Brief 无需再点头”).  
> **Does not include:** Japanese Confide conversation quality; flipping T36 send-path; Plan A checkout pause; Chinese as a separate ship language.

## 1. Why

First product release will not ship Japanese Confide. English users should see the menu row, listening ear, shortcut, and panel again. Develop still had `CONFIDE_USER_MOUNT_ENABLED = false` (Plan A), so English users could not reach Confide without a QA harness.

## 2. Done line

1. English Idle: Confide menu, ear, `Meta/Ctrl+E`, and panel open when safety copy is ok and stage is idle.  
2. Japanese UI (`locale === 'ja'`): those entries are hidden; the panel cannot open (including `?confide=1`). Switching language to Japanese while the panel is open closes it.  
3. T36 remains a send-path backstop for Japanese *input* on an English UI (kana → not-yet-open after safety). It is not the Japanese-UI product path.

## 3. Variant matrix (A10)

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| English, Idle, mount on | ⋯ / ear / shortcut | 0–1s: row and ear visible; open fades in `#confide-to-yin-card` | `confideUserVisibilityGate.test.js` · `idleChromeOrchestration.test.js` |
| Japanese UI, Idle | ⋯ / ear / shortcut | 无行、无耳、快捷键不打开；无死点击 | same |
| English → Japanese while panel open | Language picker | 面板关闭；耳与菜单行消失 | ConfideToYinUI locale close + ear `sync()` |
| Chinese draft locale | Idle | 与英文相同（仅日语界面关） | gate `locale !== 'ja'` |
| Wide / narrow | ⋯ vs ActionBar ear | 同一闸；窄屏耳走 ActionBar | orchestration lists |
| Focusing / Arrival | 任何入口 | 仍不可开（既有 idle 闸） | existing stage tests |
| Purchase / companionGeneration | mount 曾关 | 购买仍不能绕过 `mountEnabled: false` | Plan A unit kept |

Payment / Sit vs Breath: **skip** — this slice does not add products or practice kinds.

## 4. Click feedback (A14)

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化 |
|---|---|---|
| 英文 Idle 倾诉行 / 耳朵 | 钮按压 + `#confide-to-yin-card` 淡入 | 无 |
| 日语 Idle | 入口不出现（`hidden-when-blocked` / 快捷键 `gated-before-open`） | 无 |
| 日语下仍走到 `open()` 的危机旁路 | 既有 T92 toast（`visible-must-feedback`） | 无 |

## 5. Edges (A14)

| 边缘状态 | 预期 |
|---|---|
| 日语 + `?confide=1` | 仍不打开（产品界面关，不是实验室例外） |
| 安全语料未 ok | 仍不可见 |
| Focusing | 耳与行仍藏 |
| 切回英文 | 耳与行在 Idle 再现 |

## 6. Out of scope

Japanese reply quality. Restoring Pro/add-on checkout. Changing T36 kana detector. `src/main.js` line-count raise.
