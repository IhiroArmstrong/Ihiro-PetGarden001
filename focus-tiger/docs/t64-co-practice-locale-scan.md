# T64 · locale 内卷/超卖扫描（封闭名单外只记遗留）

> **日期**：2026-10-28 · **本刀只改** `HINT_APP_PURPOSE_BODY` · `HINT_APP_PURPOSE_WELLNESS_BODY`（切片 `co-practice-copy.json`）。

| 检索词 | 命中 | 处理 |
|---|---|---|
| `加油` | 0 | — |
| `你今天很棒` | 0 | — |
| `Keep going` | 0（大小写敏感） | — |
| `keep going` | `RESET_OFFER_PROMPT` · `RESET_GROUND_OUTRO`（en.json） | **遗留**（不在封闭名单） |
| `You've got this` | 0 | — |
| `great job` | 0 | — |
| `懂你` / `knows you` | `YIN_MEMORY_CONSENT_BLURB`（zh / en 记忆同意） | **遗留**（不在封闭名单） |

禁止子串自检（新句）：未命中 `懂你` / `knows you` / `only Yin` / `已证明` / `cure`（作疗效承诺） / `zen master who`。
