# Session lock force-clear log（人工清锁留痕）

> 目的：在 Prompt 3（心跳 / 陈旧锁自动判定 + 清除留痕）落地前，**人工强制清锁也必须留痕**。  
> 本文件可 commit；根目录 `.ft-session-lock.history.log` 若存在则为本地旁注（受 `*.log` ignore，不进 Git）。  
> **当前生效占用门禁仍以 `WORKFLOW.md`（`git-worktree-occupancy`）为准**；本文件只记清除事件，不另造规则。

## 2026-08-11T15:50:06+08:00 — force-clear `pr238-conflicts-2026-08-11`

| 字段 | 值 |
|---|---|
| worktree | `/Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001`（主仓 develop 检出） |
| lock `session_id` | `pr238-conflicts-2026-08-11` |
| lock `occupancy` was | `active` |
| lock `started_at` | `2026-08-11T14:20:00+08:00` |
| lock note | resolving PR #238 merge conflicts |
| cleared_by | cursor-agent（旁支会话 `docs/browser-energy-10min-cap`） |
| authorization | 用户当回合书面：**「我确认要强制清除锁」** |

**判断依据（Prompt 0 交叉验证，非复述锁正文）：**

1. GitHub：PR [#238](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/238) 已 `MERGED`（`2026-08-11T07:05:36Z` = 15:05+08）；[#239](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/239) 亦已合入。  
2. `origin/develop` tip `a35874c` 已记录 Phase 3 / #238 / #239。  
3. 锁仅有 `started_at`，无 `updated_at` / `last_heartbeat`；OS mtime 停在开工附近（14:21+08）。  

**结论**：合并成功后遗忘释放 → 僵锁；经授权强制清除。  

**与 Prompt 3**：本条为「无心跳 + 人工判僵 + 强制清 + 留痕」活案例，供后续自动化设计参考。
