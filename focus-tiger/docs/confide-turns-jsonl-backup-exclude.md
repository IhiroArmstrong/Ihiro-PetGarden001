# Confide turns.jsonl — backup exclusion & local retention

> **2026-09-19 · Prompt 9** · Independent of Stage 2 / semantic shadow prior-turn work.

## Plain-language summary

倾诉调试日志（`turns.jsonl`）里会记下你发给阿寅的原句和生成过程，但它**不是**「阿寅记得什么」——那是 `yin-personal-memory.json` 的职责。本机「导出数据 / 恢复陪伴体验」**不再**把 `turns.jsonl` 打进备份文件；旧备份里若仍带这份字段，导入时也会忽略、不写回本机。日志仍留在当前电脑供开发核对，但会按类型自动删旧行：影子分类审计约 7 天，生成/分类过程约 30 天，整文件还有约 5MB 上限。

## Product impact

| User-visible flow | Change |
|---|---|
| Preferences → Export data | Backup JSON **no longer** contains `companionFiles.confideTurnsJsonl` |
| Preferences → Import data | Legacy files with `confideTurnsJsonl` are accepted but **not restored** to disk |
| Yin personal memory backup | **Unchanged** — `yinPersonalMemory` still exports/imports |
| Confide chat during normal use | **Unchanged** — runtime still appends to local `turns.jsonl` |

## Retention defaults

| `kind` | Retention | Rationale |
|---|---|---|
| `semantic_shadow_classify` | 7 days | Short audit trail for routing disagreement review |
| `l3_generate`, `read_hybrid_classify` | 30 days | Generation latency / prompt debugging |
| Unknown kinds | Keep until byte cap | Forward-compatible |
| All kinds (hard cap) | 5 MB file size | Drop oldest lines when exceeded |

Prune runs on companion runtime startup and periodically after append (every 25 lines or 6 hours).

## Code map

- Export strip: `stripConfideTurnsFromCompanionBackup` in `practiceBackupSnapshot.js`
- Electron read/write: `desktop/companion/localBackupCompanionFiles.js`
- Retention logic: `src/core/confide/confideTurnsJsonlRetention.js`
- Prune I/O: `desktop/companion/confideTurnsJsonlPrune.js` · hooked from `l1Runtime._appendTurnLog`
